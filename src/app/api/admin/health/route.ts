// src/app/api/admin/health/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdminOrModerator } from '@/lib/auth/utils';
import { getRateLimiter } from '@/lib/rate-limit/rate-limit-factory';
import { RATE_LIMIT_CONFIGS } from '@/lib/rate-limit/rate-limit';
import { withRateLimit } from '@/lib/middleware';
import { handleError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import mongoose from 'mongoose';

interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    checks: {
        database: {
            status: 'connected' | 'disconnected' | 'error';
            latency?: number;
            stats?: {
                collections: number;
                dataSize: number;
                storageSize: number;
                indexes: number;
            };
            error?: string;
        };
        rateLimiter: {
            status: 'operational' | 'degraded' | 'error';
            type: 'kv' | 'memory';
            error?: string;
        };
        memory: {
            usage: {
                heapUsed: number;
                heapTotal: number;
                rss: number;
                external: number;
            };
            percentUsed: number;
        };
        environment: {
            nodeVersion: string;
            platform: string;
            environment: string;
        };
    };
}

async function checkDatabaseHealth() {
    try {
        // Ensure connection
        await connectDB();

        // Get connection state
        const state = mongoose.connection.readyState;

        if (state !== 1) {
            return {
                status: 'disconnected' as const,
                error: `Connection state: ${['disconnected', 'connecting', 'connected', 'disconnecting'][state]}`
            };
        }

        // Ping database
        const db = mongoose.connection.db;
        if (!db) {
            return {
                status: 'error' as const,
                error: 'Database connection not fully established'
            };
        }

        const startTime = Date.now();
        await db.admin().ping();
        const latency = Date.now() - startTime;

        let stats;
        try {
            const collections = await db.listCollections().toArray();

            stats = {
                collections: collections.length,
                dataSize: 0,
                storageSize: 0,
                indexes: 0,
            };

            try {
                const databaseStats = await db.stats();
                stats = {
                    collections: databaseStats.collections || collections.length,
                    dataSize: Math.round((databaseStats.dataSize || 0) / 1024 / 1024),
                    storageSize: Math.round((databaseStats.storageSize || 0) / 1024 / 1024),
                    indexes: databaseStats.indexes || 0,
                };
            } catch {
                logger.debug('db.stats() not available - using basic metrics');
            }
        } catch (error) {
            logger.warn(`Could not fetch database info:${error instanceof Error ? ` ${error.message}` : error}`, );
            stats = undefined;
        }
        return {
            status: 'connected' as const,
            latency,
            stats,
        };
    } catch (error) {
        logger.error('Database health check failed:', error);
        return {
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

async function checkRateLimiterHealth() {
    // Determine type based on environment
    const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
    const type = process.env.NODE_ENV === 'production' && hasKV ? 'kv' as const : 'memory' as const;
    try {
        const rateLimiter = getRateLimiter();

        // Probes the limiter itself, on its own policy so it cannot consume a real allowance.
        const result = await rateLimiter.check(
            'healthCheck',
            'health-check-test',
            RATE_LIMIT_CONFIGS.healthCheck,
        );

        return {
            status: result ? 'operational' as const : 'degraded' as const,
            type
        };
    } catch (error) {
        logger.error('Rate limiter health check failed:', error);
        return {
            status: 'error' as const,
            type,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

function getMemoryUsage() {
    const usage = process.memoryUsage();
    const percentUsed = (usage.heapUsed / usage.heapTotal) * 100;

    return {
        usage: {
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
            rss: Math.round(usage.rss / 1024 / 1024), // MB
            external: Math.round(usage.external / 1024 / 1024) // MB
        },
        percentUsed: Math.round(percentUsed)
    };
}

export async function GET(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
            try {
                await requireAdminOrModerator();

                // Run all health checks
                const [dbHealth, rateLimiterHealth] = await Promise.all([
                    checkDatabaseHealth(),
                    checkRateLimiterHealth()
                ]);

                const memoryHealth = getMemoryUsage();

                // Determine overall status
                let overallStatus: HealthCheckResult['status'] = 'healthy';

                if (dbHealth.status === 'error' || rateLimiterHealth.status === 'error') {
                    overallStatus = 'unhealthy';
                } else if (
                    dbHealth.status === 'disconnected' ||
                    rateLimiterHealth.status === 'degraded' ||
                    memoryHealth.percentUsed > 90
                ) {
                    overallStatus = 'degraded';
                }

                const result: HealthCheckResult = {
                    status: overallStatus,
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    checks: {
                        database: dbHealth,
                        rateLimiter: rateLimiterHealth,
                        memory: memoryHealth,
                        environment: {
                            nodeVersion: process.version,
                            platform: process.platform,
                            environment: process.env.NODE_ENV || 'development'
                        }
                    }
                };

                // Log if unhealthy
                if (overallStatus === 'unhealthy') {
                    logger.error('Health check failed', result);
                }

                return Response.json(result, {
                    status: overallStatus === 'unhealthy' ? 503 : 200,
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'X-Health-Status': overallStatus
                    }
                });

            } catch (error) {
                logger.error('Health check error:', error);
                return handleError(error);
            }
        },
        'admin'
    );
}

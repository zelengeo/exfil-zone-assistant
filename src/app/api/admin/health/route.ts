// src/app/api/admin/health/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdminOrModerator } from '@/lib/auth/utils';
import { getRateLimiter } from '@/lib/rate-limit/rate-limit-factory';
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
            connections?: {
                current: number;
                available: number;
                poolSize: number;
            };
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

const mongoMaxPoolSize = 10;

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

        // Get connection stats
        let connections;
        try {
            // Only use safe, non-admin operations
            const collections = await db.listCollections().toArray();

            connections = {
                current: mongoose.connections.length,
                available: mongoMaxPoolSize - mongoose.connections.length,
                poolSize: mongoMaxPoolSize,
                stats: {
                    collections: collections.length,
                    dataSize: 0,
                    storageSize: 0,
                    indexes: 0,
                }
            };

            // Try db.stats() - this usually works with readWrite role
            try {
                const stats = await db.stats();
                connections.stats = {
                    collections: stats.collections || collections.length,
                    dataSize: Math.round((stats.dataSize || 0) / 1024 / 1024),
                    storageSize: Math.round((stats.storageSize || 0) / 1024 / 1024),
                    indexes: stats.indexes || 0,
                };
            } catch {
                // db.stats() might also be restricted, that's OK
                logger.debug('db.stats() not available - using basic metrics');
            }
        } catch (error) {
            logger.warn(`Could not fetch database info:${error instanceof Error ? ` ${error.message}` : error}`, );
            connections = undefined; // Will be omitted from response
        }
        return {
            status: 'connected' as const,
            latency,
            connections
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

        // Test rate limiter by checking a test key
        const testKey = 'health-check-test';
        const result = await rateLimiter.check(testKey, {
            interval: 60,
            uniqueTokenPerInterval: 100
        });

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
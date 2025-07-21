// src/components/admin/HealthCheckDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Database, Shield, MemoryStick, Server } from 'lucide-react';
import { toast } from 'sonner';

interface HealthData {
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

export function HealthCheckDashboard() {
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHealthData = async () => {
        try {
            const response = await fetch('/api/admin/health');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setHealthData(data);
        } catch (error) {
            console.error('Failed to fetch health data:', error);
            toast.error('Failed to fetch health data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHealthData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchHealthData, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchHealthData();
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);

        return parts.join(' ') || '< 1m';
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            healthy: 'default',
            connected: 'default',
            operational: 'default',
            degraded: 'secondary',
            disconnected: 'secondary',
            unhealthy: 'destructive',
            error: 'destructive',
        };

        const colors: Record<string, string> = {
            healthy: 'bg-green-500',
            connected: 'bg-green-500',
            operational: 'bg-green-500',
            degraded: 'bg-yellow-500',
            disconnected: 'bg-yellow-500',
            unhealthy: 'bg-red-500',
            error: 'bg-red-500',
        };

        return (
            <Badge
                variant={variants[status] || 'default'}
                className={`${colors[status]} text-white`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Activity className="h-8 w-8 animate-pulse mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading health data...</p>
                </div>
            </div>
        );
    }

    if (!healthData) {
        return (
            <div className="text-center text-red-500">
                Failed to load health data
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overall Status */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            System Status
                        </CardTitle>
                        <CardDescription>
                            Last checked: {new Date(healthData.timestamp).toLocaleString()}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        {getStatusBadge(healthData.status)}
                        <Button
                            onClick={handleRefresh}
                            size="sm"
                            disabled={refreshing}
                            variant="outline"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Uptime</span>
                        <span className="font-mono">{formatUptime(healthData.uptime)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Database Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        {getStatusBadge(healthData.checks.database.status)}
                    </div>

                    {healthData.checks.database.latency && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Latency</span>
                            <span className="font-mono">{healthData.checks.database.latency}ms</span>
                        </div>
                    )}

                    {healthData.checks.database.connections && (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Active Connections</span>
                                <span className="font-mono">
                                    {healthData.checks.database.connections.current} / {healthData.checks.database.connections.poolSize}
                                </span>
                            </div>
                            <Progress
                                value={(healthData.checks.database.connections.current / healthData.checks.database.connections.poolSize) * 100}
                                className="h-2"
                            />
                        </>
                    )}

                    {healthData.checks.database.error && (
                        <div className="text-sm text-red-500">
                            Error: {healthData.checks.database.error}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Rate Limiter Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Rate Limiter
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        {getStatusBadge(healthData.checks.rateLimiter.status)}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <Badge variant="outline">
                            {healthData.checks.rateLimiter.type === 'kv' ? 'Vercel KV' : 'In-Memory'}
                        </Badge>
                    </div>

                    {healthData.checks.rateLimiter.error && (
                        <div className="text-sm text-red-500">
                            Error: {healthData.checks.rateLimiter.error}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MemoryStick className="h-5 w-5" />
                        Memory Usage
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Heap Usage</span>
                            <span className="text-sm font-mono">
                                {healthData.checks.memory.usage.heapUsed}MB / {healthData.checks.memory.usage.heapTotal}MB
                            </span>
                        </div>
                        <Progress
                            value={healthData.checks.memory.percentUsed}
                            className={`h-2 ${healthData.checks.memory.percentUsed > 90 ? 'bg-red-200' : ''}`}
                        />
                        <span className="text-xs text-muted-foreground mt-1">
                            {healthData.checks.memory.percentUsed}% used
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">RSS</span>
                            <p className="font-mono">{healthData.checks.memory.usage.rss}MB</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">External</span>
                            <p className="font-mono">{healthData.checks.memory.usage.external}MB</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Environment Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Environment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Node Version</span>
                        <span className="font-mono text-sm">{healthData.checks.environment.nodeVersion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Platform</span>
                        <span className="font-mono text-sm">{healthData.checks.environment.platform}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Environment</span>
                        <Badge variant="outline">{healthData.checks.environment.environment}</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
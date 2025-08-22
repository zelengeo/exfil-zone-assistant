import { headers } from 'next/headers';

// Types
export interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
    retryAfter?: number;
}

export interface RateLimitConfig {
    interval: number; // Time window in seconds
    uniqueTokenPerInterval: number; // Max requests per interval
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {

    // Authenticated feedback: 30 per hour
    feedbackPostAuthenticated: {
        interval: 60 * 60,
        uniqueTokenPerInterval: 30,
    },

    // Unauthenticated feedback: 15 per hour
    feedbackPostUnauthenticated: {
        interval: 60 * 60,
        uniqueTokenPerInterval: 10,
    },

    // Authenticated feedback load: 30 per hour
    feedbackGetAuthenticated: {
        interval: 60 * 60,
        uniqueTokenPerInterval: 60,
    },

    // User updates: 3 per day
    userUpdate: {
        interval: 60 * 60 * 24,
        uniqueTokenPerInterval: 3,
    },
    // Auth attempts: 5 per 15 minutes
    auth: {
        interval: 60 * 15,
        uniqueTokenPerInterval: 5,
    },
    // Admin actions: 50 per 5min
    admin: {
        interval: 300,
        uniqueTokenPerInterval: 50,
    },
    // General API: 30 per minute
    api: {
        interval: 60,
        uniqueTokenPerInterval: 30,
    },
} as const;

// Get identifier from request
export async function getIdentifier(request?: Request, userId?: string): Promise<string> {
    if (userId) return `user:${userId}`;

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');

    const ip = forwardedFor?.split(',')[0] || realIp || 'anonymous';
    return `ip:${ip}`;
}

// Rate limiter interface
export interface RateLimiter {
    check(key: string, config: RateLimitConfig): Promise<RateLimitResult>;
}
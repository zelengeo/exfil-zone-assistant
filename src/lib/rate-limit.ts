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
    // Anonymous feedback: 5 per hour
    feedbackAnonymous: {
        interval: 60 * 60, // 1 hour
        uniqueTokenPerInterval: 5,
    },
    // Authenticated feedback: 20 per hour
    feedbackAuthenticated: {
        interval: 60 * 60,
        uniqueTokenPerInterval: 20,
    },
    // User updates: 3 per day
    userUpdate: {
        interval: 60 * 60 * 24,
        uniqueTokenPerInterval: 3,
    },
    // Auth attempts: 5 per 15 minutes //FIXME REMOVE
    auth: {
        interval: 60 * 15,
        uniqueTokenPerInterval: 5,
    },
    // Admin actions: 100 per minute
    admin: {
        interval: 60,
        uniqueTokenPerInterval: 100,
    },
    // General API: 60 per minute
    api: {
        interval: 60,
        uniqueTokenPerInterval: 60,
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
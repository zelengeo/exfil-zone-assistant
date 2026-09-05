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
    // Username changes: 1 per week
    usernameUpdate: {
        interval: 60 * 60 * 24 * 7,
        uniqueTokenPerInterval: 1,
    },
    // Username availability probe: 20 per minute
    usernameCheck: {
        interval: 60,
        uniqueTokenPerInterval: 20,
    },
    // Rate-limiter liveness probe used by the admin health view: 100 per minute
    healthCheck: {
        interval: 60,
        uniqueTokenPerInterval: 100,
    },
} as const;

export type RateLimitPolicy = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Every policy owns its own counters. Two policies with the same interval — `feedbackGetAuthenticated`
 * at 60/hour and `feedbackPostAuthenticated` at 30/hour — used to land on one bucket for a caller,
 * so reads either inflated or exhausted the write allowance depending on the backend. The policy
 * name is part of the key precisely so that cannot happen; sharing an allowance now requires
 * deliberately passing the same policy name.
 */
export interface RateLimitWindow {
    /** Storage key: policy, then caller, then the fixed window this call falls in. */
    key: string;
    /** When the current window ends, in epoch milliseconds. */
    reset: number;
    /** Seconds until just after the window ends — never longer than the window itself. */
    ttlSeconds: number;
}

export function resolveWindow(
    policy: string,
    identifier: string,
    config: RateLimitConfig,
    now: number,
): RateLimitWindow {
    const windowIndex = Math.floor(now / 1000 / config.interval);
    const reset = (windowIndex + 1) * config.interval * 1000;

    return {
        key: `rl:${policy}:${identifier}:${windowIndex}`,
        reset,
        ttlSeconds: Math.ceil((reset - now) / 1000) + 1,
    };
}

// Get identifier from request
export async function getIdentifier(request?: Request, userId?: string): Promise<string> {
    if (userId) return `user:${userId}`;

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');

    const ip = forwardedFor?.split(',')[0] || realIp || 'anonymous';
    return `ip:${ip}`;
}

// Rate limiter interface. Both backends admit identically: count this call, then compare the
// running count against the policy's cap.
export interface RateLimiter {
    check(policy: string, identifier: string, config: RateLimitConfig): Promise<RateLimitResult>;
}
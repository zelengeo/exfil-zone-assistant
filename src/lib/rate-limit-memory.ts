import { kv } from '@vercel/kv';
import type { RateLimiter, RateLimitConfig, RateLimitResult } from './rate-limit';

export class KVRateLimiter implements RateLimiter {
    async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
        const now = Date.now();
        const window = Math.floor(now / 1000 / config.interval);
        const resetTime = (window + 1) * config.interval * 1000;
        const identifier = `rate_limit:${key}:${window}`;

        try {
            const current = await kv.incr(identifier);

            // Set expiry on first request in this window
            if (current === 1) {
                await kv.expire(identifier, config.interval + 1);
            }

            const remaining = Math.max(0, config.uniqueTokenPerInterval - current);
            const success = current <= config.uniqueTokenPerInterval;

            return {
                success,
                remaining,
                reset: resetTime,
                retryAfter: success ? undefined : Math.ceil((resetTime - now) / 1000),
            };
        } catch (error) {
            console.error('KV rate limit error:', error);
            // Fail open - allow request if KV is down
            return {
                success: true,
                remaining: config.uniqueTokenPerInterval,
                reset: resetTime,
            };
        }
    }
}

export const kvRateLimiter = new KVRateLimiter();
import { kv } from '@vercel/kv';
import {
    resolveWindow,
    type RateLimiter,
    type RateLimitConfig,
    type RateLimitResult,
} from './rate-limit';

export class KVRateLimiter implements RateLimiter {
    async check(
        policy: string,
        identifier: string,
        config: RateLimitConfig,
    ): Promise<RateLimitResult> {
        const now = Date.now();
        const window = resolveWindow(policy, identifier, config, now);

        try {
            // One round trip, so a process that dies mid-check cannot leave a counter without an
            // expiry the way a separate INCR then EXPIRE could. The TTL is set on every call
            // rather than only on the first: it is the time left in this window, so re-setting it
            // never extends the counter past the window, and it repairs any key that somehow lost
            // its expiry.
            const [current] = await kv.pipeline()
                .incr(window.key)
                .expire(window.key, window.ttlSeconds)
                .exec<[number, number]>();

            const success = current <= config.uniqueTokenPerInterval;

            return {
                success,
                remaining: Math.max(0, config.uniqueTokenPerInterval - current),
                reset: window.reset,
                retryAfter: success ? undefined : Math.ceil((window.reset - now) / 1000),
            };
        } catch (error) {
            console.error('KV rate limit error:', error);
            // Fail open — a limiter outage must not take the API down with it.
            return {
                success: true,
                remaining: config.uniqueTokenPerInterval,
                reset: window.reset,
            };
        }
    }
}

export const kvRateLimiter = new KVRateLimiter();

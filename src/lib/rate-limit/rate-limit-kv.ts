import { createClient } from '@vercel/kv';
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
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2_000);

        try {
            const kv = createClient({
                url: process.env.KV_REST_API_URL!,
                token: process.env.KV_REST_API_TOKEN!,
                // A timed-out INCR may already have executed. Let the caller retry explicitly.
                retry: { retries: 0 },
                // The installed client throws on abort with a signal factory; a static signal
                // takes its legacy synthetic-response path instead.
                signal: () => controller.signal,
            });
            // One request removes the client-side gap between INCR and EXPIRE. Each successful
            // check reapplies the remaining-window TTL (plus its rounding allowance); a pipeline
            // does not guarantee atomic execution if Redis itself fails between commands.
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
            // The decision is reported as unknown rather than as a pass. What that means for the
            // request is the caller's policy: `failClosed` mutations refuse with a 503, reads are
            // still served. Silently returning a plain success is what let an outage double as a
            // way around every limit.
            return {
                success: true,
                degraded: true,
                remaining: config.uniqueTokenPerInterval,
                reset: window.reset,
            };
        } finally {
            clearTimeout(timeout);
        }
    }
}

export const kvRateLimiter = new KVRateLimiter();

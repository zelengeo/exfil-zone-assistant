import type { RateLimiter, RateLimitConfig, RateLimitResult } from './rate-limit';

interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

export class InMemoryRateLimiter implements RateLimiter {
    private buckets = new Map<string, TokenBucket>();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Clean up old buckets every 5 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
        const now = Date.now();
        const windowStart = Math.floor(now / 1000 / config.interval) * config.interval * 1000;
        const identifier = `${key}:${windowStart}`;

        let bucket = this.buckets.get(identifier);

        if (!bucket) {
            bucket = {
                tokens: config.uniqueTokenPerInterval,
                lastRefill: now,
            };
            this.buckets.set(identifier, bucket);
        }

        // Refill tokens if in new window
        const timePassed = now - bucket.lastRefill;
        const intervalsPass = Math.floor(timePassed / (config.interval * 1000));

        if (intervalsPass > 0) {
            bucket.tokens = config.uniqueTokenPerInterval;
            bucket.lastRefill = now;
        }

        // Check if request can proceed
        const success = bucket.tokens > 0;
        if (success) {
            bucket.tokens--;
        }

        const resetTime = windowStart + config.interval * 1000;

        return {
            success,
            remaining: Math.max(0, bucket.tokens),
            reset: resetTime,
            retryAfter: success ? undefined : Math.ceil((resetTime - now) / 1000),
        };
    }

    private cleanup() {
        const now = Date.now();
        const cutoff = now - 60 * 60 * 1000; // Remove entries older than 1 hour

        for (const [key, bucket] of this.buckets.entries()) {
            if (bucket.lastRefill < cutoff) {
                this.buckets.delete(key);
            }
        }
    }

    destroy() {
        clearInterval(this.cleanupInterval);
    }
}

export const memoryRateLimiter = new InMemoryRateLimiter();
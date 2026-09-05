import {
    resolveWindow,
    type RateLimiter,
    type RateLimitConfig,
    type RateLimitResult,
} from './rate-limit';

interface WindowCounter {
    count: number;
    /** When this counter stops mattering. Cleanup reads this, never a fixed age. */
    expiresAt: number;
}

export class InMemoryRateLimiter implements RateLimiter {
    private counters = new Map<string, WindowCounter>();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    async check(
        policy: string,
        identifier: string,
        config: RateLimitConfig,
    ): Promise<RateLimitResult> {
        const now = Date.now();
        const window = resolveWindow(policy, identifier, config, now);

        // The key already names the window, so a counter never spans one. There is nothing to
        // refill: a new window is simply a key that does not exist yet.
        let counter = this.counters.get(window.key);

        if (!counter) {
            counter = { count: 0, expiresAt: window.reset };
            this.counters.set(window.key, counter);
        }

        counter.count += 1;

        // Compare against the config handed to this call rather than a cap captured when the
        // counter was created, so the answer cannot depend on which policy arrived first.
        const success = counter.count <= config.uniqueTokenPerInterval;

        return {
            success,
            remaining: Math.max(0, config.uniqueTokenPerInterval - counter.count),
            reset: window.reset,
            retryAfter: success ? undefined : Math.ceil((window.reset - now) / 1000),
        };
    }

    private cleanup() {
        const now = Date.now();

        // Dropping anything older than a fixed hour used to reset the daily and weekly policies,
        // because their counters legitimately sit untouched for longer than that.
        for (const [key, counter] of this.counters.entries()) {
            if (counter.expiresAt <= now) {
                this.counters.delete(key);
            }
        }
    }

    destroy() {
        clearInterval(this.cleanupInterval);
    }
}

export const memoryRateLimiter = new InMemoryRateLimiter();

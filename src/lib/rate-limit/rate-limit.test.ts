import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** A minimal Redis stand-in: only the pipeline shape the KV limiter actually uses. */
interface FakeEntry {
    value: number;
    ttlSeconds: number | null;
}

const store = new Map<string, FakeEntry>();
const pipelineCalls: { key: string; ttlSeconds: number }[] = [];
let failNextPipeline = false;

vi.mock('@vercel/kv', () => ({
    kv: {
        pipeline() {
            const operations: (() => number)[] = [];

            const chain = {
                incr(key: string) {
                    operations.push(() => {
                        const entry = store.get(key) ?? { value: 0, ttlSeconds: null };
                        entry.value += 1;
                        store.set(key, entry);
                        return entry.value;
                    });
                    return chain;
                },
                expire(key: string, ttlSeconds: number) {
                    operations.push(() => {
                        pipelineCalls.push({ key, ttlSeconds });
                        const entry = store.get(key);
                        if (entry) {
                            entry.ttlSeconds = ttlSeconds;
                        }
                        return 1;
                    });
                    return chain;
                },
                async exec() {
                    if (failNextPipeline) {
                        failNextPipeline = false;
                        throw new Error('kv unavailable');
                    }
                    return operations.map(run => run());
                },
            };

            return chain;
        },
    },
}));

import { InMemoryRateLimiter } from '@/lib/rate-limit/rate-limit-memory';
import { KVRateLimiter } from '@/lib/rate-limit/rate-limit-kv';
import { RATE_LIMIT_CONFIGS, resolveWindow, type RateLimitConfig, type RateLimiter } from '@/lib/rate-limit/rate-limit';

const READ_POLICY = 'feedbackGetAuthenticated';
const WRITE_POLICY = 'feedbackPostAuthenticated';
const CALLER = 'user:68bd5cf7c48ae02f50b1c200';

async function exhaust(limiter: RateLimiter, policy: string, config: RateLimitConfig, times: number) {
    for (let i = 0; i < times; i++) {
        await limiter.check(policy, CALLER, config);
    }
}

describe('resolveWindow', () => {
    it('namespaces by policy, caller and window, and never outlives its window', () => {
        const config = { interval: 60, uniqueTokenPerInterval: 5, failClosed: false };
        const now = 1_000_000_000_000;

        const first = resolveWindow('api', CALLER, config, now);
        const other = resolveWindow('admin', CALLER, config, now);

        expect(first.key).not.toBe(other.key);
        expect(first.key).toContain('api');
        expect(first.key).toContain(CALLER);
        expect(first.reset).toBeGreaterThan(now);
        expect(first.ttlSeconds).toBeLessThanOrEqual(config.interval + 1);
    });

    it('gives the same caller a new key in the next window', () => {
        const config = { interval: 60, uniqueTokenPerInterval: 5, failClosed: false };
        const now = 1_000_000_000_000;

        const current = resolveWindow('api', CALLER, config, now);
        const next = resolveWindow('api', CALLER, config, now + 60_000);

        expect(next.key).not.toBe(current.key);
    });
});

describe.each([
    ['memory', () => new InMemoryRateLimiter()],
    ['kv', () => new KVRateLimiter()],
] as const)('%s limiter', (_name, create) => {
    let limiter: RateLimiter & { destroy?: () => void };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-09-05T12:00:00.000Z'));
        store.clear();
        pipelineCalls.length = 0;
        failNextPipeline = false;
        limiter = create();
    });

    afterEach(() => {
        limiter.destroy?.();
        vi.useRealTimers();
    });

    it('keeps a read policy from spending a write policy allowance', async () => {
        const read = RATE_LIMIT_CONFIGS[READ_POLICY];
        const write = RATE_LIMIT_CONFIGS[WRITE_POLICY];

        // Both policies run on a one-hour interval, so before the fix these shared one counter.
        expect(read.interval).toBe(write.interval);

        await exhaust(limiter, READ_POLICY, read, read.uniqueTokenPerInterval);

        const readAfter = await limiter.check(READ_POLICY, CALLER, read);
        expect(readAfter.success).toBe(false);

        const writeAfter = await limiter.check(WRITE_POLICY, CALLER, write);
        expect(writeAfter.success).toBe(true);
        expect(writeAfter.remaining).toBe(write.uniqueTokenPerInterval - 1);
    });

    it('admits exactly the configured number of calls, then refuses', async () => {
        const config = { interval: 60, uniqueTokenPerInterval: 3, failClosed: false };

        const results = [];
        for (let i = 0; i < 4; i++) {
            results.push(await limiter.check('api', CALLER, config));
        }

        expect(results.map(r => r.success)).toEqual([true, true, true, false]);
        expect(results.map(r => r.remaining)).toEqual([2, 1, 0, 0]);
        expect(results[3].retryAfter).toBeGreaterThan(0);
        expect(results[0].retryAfter).toBeUndefined();
    });

    it('separates callers', async () => {
        const config = { interval: 60, uniqueTokenPerInterval: 1, failClosed: false };

        await limiter.check('api', 'user:a', config);
        const other = await limiter.check('api', 'user:b', config);

        expect(other.success).toBe(true);
    });

    it('starts a fresh allowance in the next window', async () => {
        const config = { interval: 60, uniqueTokenPerInterval: 1, failClosed: false };

        await limiter.check('api', CALLER, config);
        expect((await limiter.check('api', CALLER, config)).success).toBe(false);

        vi.advanceTimersByTime(60_000);

        expect((await limiter.check('api', CALLER, config)).success).toBe(true);
    });
});

describe('InMemoryRateLimiter cleanup', () => {
    let limiter: InMemoryRateLimiter;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-09-05T12:00:00.000Z'));
        limiter = new InMemoryRateLimiter();
    });

    afterEach(() => {
        limiter.destroy();
        vi.useRealTimers();
    });

    it('keeps a weekly counter alive across hourly cleanups', async () => {
        const weekly = RATE_LIMIT_CONFIGS.usernameUpdate;
        expect(weekly.uniqueTokenPerInterval).toBe(1);

        const first = await limiter.check('usernameUpdate', CALLER, weekly);
        expect(first.success).toBe(true);

        // Two hours of scheduled cleanups. The old fixed one-hour cutoff dropped this counter and
        // handed the caller a fresh weekly allowance.
        await vi.advanceTimersByTimeAsync(2 * 60 * 60 * 1000);

        const second = await limiter.check('usernameUpdate', CALLER, weekly);
        expect(second.success).toBe(false);
    });

    it('drops a counter once its own window has passed', async () => {
        const config = { interval: 60, uniqueTokenPerInterval: 1, failClosed: false };

        await limiter.check('api', CALLER, config);
        await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

        // A new window would allow this regardless; the point is the map does not grow forever.
        expect((await limiter.check('api', CALLER, config)).success).toBe(true);
    });
});

describe('KVRateLimiter storage behaviour', () => {
    let limiter: KVRateLimiter;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-09-05T12:00:00.000Z'));
        store.clear();
        pipelineCalls.length = 0;
        failNextPipeline = false;
        limiter = new KVRateLimiter();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('sets an expiry on every call, in the same round trip as the increment', async () => {
        const config = { interval: 60, uniqueTokenPerInterval: 5, failClosed: false };

        await limiter.check('api', CALLER, config);
        await limiter.check('api', CALLER, config);

        expect(pipelineCalls).toHaveLength(2);
        for (const call of pipelineCalls) {
            expect(call.ttlSeconds).toBeGreaterThan(0);
            // Re-setting the TTL must never push the counter past its own window.
            expect(call.ttlSeconds).toBeLessThanOrEqual(config.interval + 1);
        }

        const stored = [...store.values()][0];
        expect(stored.ttlSeconds).not.toBeNull();
    });

    it('fails open when the backend is unavailable', async () => {
        const config = { interval: 60, uniqueTokenPerInterval: 1, failClosed: false };
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        failNextPipeline = true;

        const result = await limiter.check('api', CALLER, config);

        expect(result.success).toBe(true);
        expect(result.remaining).toBe(config.uniqueTokenPerInterval);
    });
});

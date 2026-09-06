import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { KVRateLimiter } from './rate-limit-kv';
import { RATE_LIMIT_CONFIGS } from './rate-limit';

// Exercise the installed REST client, replacing only fetch. A mocked pipeline cannot prove that
// the transport aborts or that an aborted request is reported as degraded rather than a denial.
describe('KV transport failure and recovery', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubEnv('KV_REST_API_URL', 'https://kv.example.test');
        vi.stubEnv('KV_REST_API_TOKEN', 'synthetic-token');
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('aborts a stalled request after two seconds and recovers on the next check', async () => {
        const fetch = vi.fn<typeof globalThis.fetch>().mockImplementationOnce((_url, init) => (
            new Promise<Response>((_resolve, reject) => {
                init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
            })
        )).mockResolvedValueOnce(Response.json([{ result: 1 }, { result: 1 }]));
        vi.stubGlobal('fetch', fetch);
        const limiter = new KVRateLimiter();
        const result = limiter.check('accountDelete', 'user:synthetic', RATE_LIMIT_CONFIGS.accountDelete);
        await vi.advanceTimersByTimeAsync(2_000);
        expect(await result).toMatchObject({ degraded: true });
        expect(fetch).toHaveBeenCalledOnce();
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);

        expect(await limiter.check('accountDelete', 'user:synthetic', RATE_LIMIT_CONFIGS.accountDelete))
            .toMatchObject({ success: true, remaining: 4 });
        expect(fetch.mock.calls[1][1]?.signal?.aborted).toBe(false);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('does not replay an increment after a transport error', async () => {
        const fetch = vi.fn().mockRejectedValue(new TypeError('connection lost'));
        vi.stubGlobal('fetch', fetch);
        expect(await new KVRateLimiter().check('auth', 'ip:synthetic', RATE_LIMIT_CONFIGS.auth))
            .toMatchObject({ degraded: true });
        expect(fetch).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
    });
});

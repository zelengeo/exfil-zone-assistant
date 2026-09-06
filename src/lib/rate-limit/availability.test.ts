/**
 * What happens when the limiter backend is missing or unavailable — the difference between
 * "you are within your quota" and "nobody knows".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    check: vi.fn(),
    session: null as { user: { id: string } } | null,
}));

vi.mock('next-auth', () => ({
    getServerSession: async () => mocks.session,
}));

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
    authOptions: {},
}));

vi.mock('next/headers', () => ({
    headers: async () => ({ get: () => null }),
}));

vi.mock('@/lib/rate-limit/rate-limit-factory', () => ({
    getRateLimiter: () => ({ check: mocks.check }),
}));

import { enforceRateLimit, withRateLimit, RateLimitUnavailableError } from '@/lib/middleware';
import { RATE_LIMIT_CONFIGS } from '@/lib/rate-limit/rate-limit';

const ALLOWED = { success: true, remaining: 5, reset: Date.now() + 60_000 };
const DEGRADED = { success: true, degraded: true, remaining: 5, reset: Date.now() + 60_000 };

function request(): Request {
    return new Request('http://localhost/api/thing', { method: 'POST' });
}

describe('backend selection', () => {
    const env = { ...process.env };

    beforeEach(() => {
        vi.resetModules();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        process.env = { ...env };
        vi.restoreAllMocks();
    });

    async function select(overrides: Record<string, string | undefined>) {
        process.env = { ...env, ...overrides };
        const factory = await vi.importActual<typeof import('@/lib/rate-limit/rate-limit-factory')>(
            '@/lib/rate-limit/rate-limit-factory',
        );
        factory.resetRateLimiterSelection();
        return factory.getRateLimiterSelection();
    }

    it('uses KV only when production has both variables', async () => {
        const selection = await select({
            NODE_ENV: 'production',
            KV_REST_API_URL: 'https://kv.example',
            KV_REST_API_TOKEN: 'token',
        });

        expect(selection.backend).toBe('kv');
        expect(selection.misconfigured).toBe(false);
    });

    it.each([
        ['neither variable', { KV_REST_API_URL: undefined, KV_REST_API_TOKEN: undefined }],
        ['only the url', { KV_REST_API_URL: 'https://kv.example', KV_REST_API_TOKEN: undefined }],
        ['only the token', { KV_REST_API_URL: undefined, KV_REST_API_TOKEN: 'token' }],
    ])('reports production with %s as misconfigured, and still serves', async (_name, kv) => {
        const selection = await select({ NODE_ENV: 'production', ...kv });

        // It keeps working — refusing every request is worse than a weak limit — but it is not
        // reported as a healthy mode, which is what "silent fallback" used to mean.
        expect(selection.backend).toBe('memory');
        expect(selection.misconfigured).toBe(true);
        expect(console.error).toHaveBeenCalledOnce();
    });

    it('treats memory outside production as the intended backend', async () => {
        const selection = await select({
            NODE_ENV: 'development',
            KV_REST_API_URL: undefined,
            KV_REST_API_TOKEN: undefined,
        });

        expect(selection.backend).toBe('memory');
        expect(selection.misconfigured).toBe(false);
        expect(console.error).not.toHaveBeenCalled();
    });
});

describe('behaviour when the backend cannot answer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.session = null;
    });

    it('refuses a fail-closed mutation with 503, not 429', async () => {
        mocks.check.mockResolvedValue(DEGRADED);
        const handler = vi.fn();

        // accountDelete is a mutation, so an outage must not admit it unchecked.
        expect(RATE_LIMIT_CONFIGS.accountDelete.failClosed).toBe(true);

        const response = await withRateLimit(request(), handler, 'accountDelete');

        expect(response.status).toBe(503);
        // A backend failure is not the caller exceeding a quota; conflating them would tell the
        // user to slow down when the fault is ours.
        expect(response.status).not.toBe(429);
        expect(handler).not.toHaveBeenCalled();
        expect(response.headers.get('Retry-After')).toBe('30');
    });

    it('still serves a read policy', async () => {
        mocks.check.mockResolvedValue(DEGRADED);
        expect(RATE_LIMIT_CONFIGS.api.failClosed).toBe(false);

        const handler = vi.fn(async () => new Response('ok', { status: 200 }));
        const response = await withRateLimit(request(), handler, 'api');

        expect(response.status).toBe(200);
        expect(handler).toHaveBeenCalledOnce();
    });

    it('throws a 503-shaped error from a server action', async () => {
        mocks.check.mockResolvedValue(DEGRADED);

        await expect(enforceRateLimit('admin')).rejects.toBeInstanceOf(RateLimitUnavailableError);
        await expect(enforceRateLimit('admin')).rejects.toMatchObject({ statusCode: 503 });
    });

    it('recovers normal behaviour once the backend answers again', async () => {
        mocks.check.mockResolvedValueOnce(DEGRADED).mockResolvedValueOnce(ALLOWED);

        const first = await withRateLimit(request(), async () => new Response('ok'), 'accountDelete');
        expect(first.status).toBe(503);

        const second = await withRateLimit(request(), async () => new Response('ok'), 'accountDelete');
        expect(second.status).toBe(200);
    });

    it('still reports a genuine quota denial as 429', async () => {
        mocks.check.mockResolvedValue({
            success: false,
            remaining: 0,
            reset: Date.now() + 60_000,
            retryAfter: 42,
        });

        const handler = vi.fn();
        const response = await withRateLimit(request(), handler, 'accountDelete');

        // A policy denial is the limiter working, not failing — it must not be reported as 503.
        expect(response.status).toBe(429);
        expect(handler).not.toHaveBeenCalled();
    });
});

describe('policy fail-open/fail-closed assignments', () => {
    it('fails closed on everything that mutates or authenticates', () => {
        for (const policy of ['auth', 'admin', 'userUpdate', 'usernameUpdate', 'accountDelete',
            'feedbackPostAuthenticated', 'feedbackPostUnauthenticated'] as const) {
            expect(RATE_LIMIT_CONFIGS[policy].failClosed, policy).toBe(true);
        }
    });

    it('stays open on reads, so an outage degrades rather than downs the site', () => {
        for (const policy of ['api', 'usernameCheck', 'feedbackGetAuthenticated', 'healthCheck'] as const) {
            expect(RATE_LIMIT_CONFIGS[policy].failClosed, policy).toBe(false);
        }
    });
});

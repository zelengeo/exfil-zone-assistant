import { afterEach, describe, expect, it, vi } from 'vitest';
import { deploymentFetch } from './deploymentFetch';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe('deployment request affinity', () => {
    it('pins an old client to A when production has moved to B, without changing the asset URL', async () => {
        vi.stubGlobal('window', {});
        vi.stubEnv('NEXT_DEPLOYMENT_ID', 'dpl_A');
        const fetch = vi.fn(async (_path: string, init?: RequestInit) => {
            const deployment = new Headers(init?.headers).get('x-deployment-id') ?? 'dpl_B';
            return new Response(JSON.stringify({ deployment }));
        });
        vi.stubGlobal('fetch', fetch);

        const response = await deploymentFetch('/assets/data/tasks.hash-A.json');

        expect(await response.json()).toEqual({ deployment: 'dpl_A' });
        expect(fetch.mock.calls[0][0]).toBe('/assets/data/tasks.hash-A.json');
        expect(fetch.mock.calls[0][1]?.cache).toBeUndefined();
    });

    it('preserves mutation options and headers without modifying the caller or retrying failures', async () => {
        vi.stubGlobal('window', {});
        vi.stubEnv('NEXT_DEPLOYMENT_ID', 'dpl_A');
        const response = new Response('', { status: 503 });
        const fetch = vi.fn().mockResolvedValue(response);
        vi.stubGlobal('fetch', fetch);
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const init: RequestInit = {
            method: 'PATCH', headers, body: '{"displayName":"Test"}',
            signal: new AbortController().signal, credentials: 'same-origin', cache: 'no-store',
        };

        expect(await deploymentFetch('/api/user/update', init)).toBe(response);
        expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/user/update', {
            ...init, headers: new Headers({ 'Content-Type': 'application/json', 'x-deployment-id': 'dpl_A' }),
        });
        expect(headers.has('x-deployment-id')).toBe(false);
    });

    it('preserves query strings and AbortSignal on API reads', async () => {
        vi.stubGlobal('window', {});
        vi.stubEnv('NEXT_DEPLOYMENT_ID', 'dpl_A');
        const fetch = vi.fn().mockResolvedValue(new Response('{}'));
        vi.stubGlobal('fetch', fetch);
        const signal = new AbortController().signal;
        await deploymentFetch('/api/admin/users?page=2&search=test', { signal });
        expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/admin/users?page=2&search=test', {
            signal, headers: new Headers({ 'x-deployment-id': 'dpl_A' }),
        });
    });

    it('does not add a deployment pin in local development', async () => {
        vi.stubGlobal('window', {});
        vi.stubEnv('NEXT_DEPLOYMENT_ID', '');
        const fetch = vi.fn().mockResolvedValue(new Response('{}'));
        vi.stubGlobal('fetch', fetch);
        await deploymentFetch('/assets/data/tasks.hash.json');
        expect(fetch).toHaveBeenCalledExactlyOnceWith('/assets/data/tasks.hash.json', undefined);
    });

    it('does not add a browser deployment pin on the server', async () => {
        vi.stubEnv('NEXT_DEPLOYMENT_ID', 'dpl_A');
        const fetch = vi.fn().mockResolvedValue(new Response('{}'));
        vi.stubGlobal('fetch', fetch);
        await deploymentFetch('/api/user');
        expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/user', undefined);
    });

    it.each(['https://example.com/api/user', '//example.com/api/user', '/items'])('rejects unrelated URLs: %s', path => {
        const fetch = vi.fn();
        vi.stubGlobal('fetch', fetch);
        expect(() => deploymentFetch(path)).toThrow('local /assets/ or /api/ path');
        expect(fetch).not.toHaveBeenCalled();
    });
});

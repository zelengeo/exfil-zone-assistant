import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    headers: new Map<string, string>(),
}));

vi.mock('next/headers', () => ({
    headers: async () => ({
        get: (name: string) => mocks.headers.get(name.toLowerCase()) ?? null,
    }),
}));

import { getIdentifier, isSignInInitiation, normalizeClientIp } from '@/lib/rate-limit/rate-limit';

function setHeaders(entries: Record<string, string>) {
    mocks.headers.clear();
    for (const [name, value] of Object.entries(entries)) {
        mocks.headers.set(name.toLowerCase(), value);
    }
}

describe('normalizeClientIp', () => {
    it.each([
        ['203.0.113.1', '203.0.113.1'],
        // x-forwarded-for is appended hop by hop; the client is the first entry.
        ['203.0.113.1, 70.41.3.18, 150.172.238.178', '203.0.113.1'],
        ['  203.0.113.1  ,  70.41.3.18  ', '203.0.113.1'],
        // A varying source port must not hand one caller several buckets.
        ['203.0.113.1:51234', '203.0.113.1'],
        ['[2001:db8::1]:51234', '2001:db8::1'],
        ['[2001:db8::1]', '2001:db8::1'],
        ['2001:DB8::1', '2001:db8::1'],
    ])('reads %s as %s', (header, expected) => {
        expect(normalizeClientIp(header)).toBe(expected);
    });

    it.each([
        ['', null],
        ['   ', null],
        [',', null],
        [', 70.41.3.18', null],
        [null, null],
        [undefined, null],
    ])('treats %s as unusable', (header, expected) => {
        expect(normalizeClientIp(header)).toBe(expected);
    });
});

describe('getIdentifier', () => {
    beforeEach(() => {
        mocks.headers.clear();
        delete process.env.RATE_LIMIT_TRUSTED_IP_HEADER;
    });

    afterEach(() => {
        delete process.env.RATE_LIMIT_TRUSTED_IP_HEADER;
    });

    it('prefers the authenticated subject over any header', async () => {
        setHeaders({ 'x-forwarded-for': '203.0.113.1' });

        // A user id comes from the session, so it is the one identity a caller cannot forge.
        await expect(getIdentifier('68bd5cf7c48ae02f50b1c200'))
            .resolves.toBe('user:68bd5cf7c48ae02f50b1c200');
    });

    it('falls back to x-real-ip when x-forwarded-for is absent or unusable', async () => {
        setHeaders({ 'x-real-ip': '198.51.100.7' });
        await expect(getIdentifier()).resolves.toBe('ip:198.51.100.7');

        setHeaders({ 'x-forwarded-for': '   ', 'x-real-ip': '198.51.100.7' });
        await expect(getIdentifier()).resolves.toBe('ip:198.51.100.7');
    });

    it('uses only the configured header when one is named', async () => {
        process.env.RATE_LIMIT_TRUSTED_IP_HEADER = 'X-Vercel-Forwarded-For';
        setHeaders({
            'x-vercel-forwarded-for': '198.51.100.7',
            // A client-supplied value on another header must not win once a header is named.
            'x-forwarded-for': '203.0.113.1',
        });

        await expect(getIdentifier()).resolves.toBe('ip:198.51.100.7');
    });

    it('does not fall back to an untrusted header when the configured one is missing', async () => {
        process.env.RATE_LIMIT_TRUSTED_IP_HEADER = 'x-vercel-forwarded-for';
        setHeaders({ 'x-forwarded-for': '203.0.113.1' });

        await expect(getIdentifier()).resolves.toBe('ip:unknown');
    });

    it('groups callers it cannot identify rather than exempting them', async () => {
        setHeaders({});

        // Sharing one bucket is deliberate: the alternative is an unlimited unidentified caller.
        await expect(getIdentifier()).resolves.toBe('ip:unknown');
    });
});

describe('isSignInInitiation', () => {
    it.each([
        ['POST', '/api/auth/signin', true],
        ['POST', '/api/auth/signin/discord', true],
        ['POST', '/api/auth/signin/google', true],
    ])('limits %s %s', (method, path, expected) => {
        expect(isSignInInitiation(method, path)).toBe(expected);
    });

    it.each([
        // Polled by every signed-in page.
        ['GET', '/api/auth/session'],
        // Fetched before each form post.
        ['GET', '/api/auth/csrf'],
        ['POST', '/api/auth/csrf'],
        // Where the provider returns the user; throttling it breaks login, not abuse.
        ['GET', '/api/auth/callback/discord'],
        ['POST', '/api/auth/callback/discord'],
        ['GET', '/api/auth/providers'],
        ['POST', '/api/auth/signout'],
        // The sign-in page itself is a redirect, not an attempt.
        ['GET', '/api/auth/signin'],
        // Must not match a route that merely starts with the same characters.
        ['POST', '/api/auth/signinsomething'],
    ])('leaves %s %s alone', (method, path) => {
        expect(isSignInInitiation(method, path)).toBe(false);
    });
});

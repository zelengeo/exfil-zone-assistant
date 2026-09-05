import { createHash } from 'node:crypto';
import type { JWT } from 'next-auth/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InsufficientPermissionsError } from '@/lib/errors';
import type { IUserToken } from '@/lib/schemas/user';

const mocks = vi.hoisted(() => {
    process.env.NEXTAUTH_URL ??= 'http://localhost:3000';

    return {
        connectDB: vi.fn(),
        findById: vi.fn(),
        getServerSession: vi.fn(),
    };
});

vi.mock('next-auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('next-auth')>();

    return {
        ...actual,
        getServerSession: mocks.getServerSession,
    };
});

vi.mock('@/lib/mongodb', () => ({
    connectDB: mocks.connectDB,
}));

vi.mock('@/models/User', () => ({
    User: {
        findById: mocks.findById,
    },
}));

vi.mock('@/models/Account', () => ({
    Account: {},
}));

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { requireAdmin } from '@/lib/auth/utils';
import { AuthHandler } from '../../../node_modules/next-auth/core/index.js';

const MEMBER_ID = '68bd5cf7c48ae02f50b1c100';
const ADMIN_ID = '68bd5cf7c48ae02f50b1c200';
const SECRET = 'test-only-next-auth-secret';

const member: IUserToken = {
    displayName: 'CurrentMember',
    username: 'current-member',
    avatarUrl: 'https://example.com/current-member.png',
    rank: 'soldier',
    roles: ['user'],
    isBanned: false,
};

const originalToken: JWT = {
    id: MEMBER_ID,
    sub: MEMBER_ID,
    name: 'Old member name',
    email: 'member@example.com',
    displayName: 'OldMember',
    username: 'old-member',
    avatarUrl: 'https://example.com/old-member.png',
    rank: 'recruit',
    roles: ['user'],
    isBanned: false,
};

function queryReturning(value: IUserToken | null) {
    const query = {
        select: vi.fn(),
        lean: vi.fn().mockResolvedValue(value),
    };
    query.select.mockReturnValue(query);
    return query;
}

function csrfCookie(token: string): string {
    const hash = createHash('sha256').update(`${token}${SECRET}`).digest('hex');
    return `${token}|${hash}`;
}

async function updateSession(payload: unknown, token: JWT = originalToken) {
    const encodedTokens: JWT[] = [];
    const csrfToken = 'test-csrf-token';

    const response = await AuthHandler({
        req: {
            action: 'session',
            method: 'POST',
            body: { csrfToken, data: payload },
            cookies: {
                'next-auth.csrf-token': csrfCookie(csrfToken),
                'next-auth.session-token': 'encoded-original-token',
            },
            headers: { host: 'localhost:3000' },
        },
        options: {
            ...authOptions,
            debug: false,
            secret: SECRET,
            jwt: {
                decode: async () => ({ ...token }),
                encode: async ({ token: refreshedToken }) => {
                    if (refreshedToken) encodedTokens.push({ ...refreshedToken });
                    return 'encoded-refreshed-token';
                },
            },
        },
    });

    return { encodedTokens, response };
}

describe('JWT session updates', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.connectDB.mockResolvedValue(undefined);
        mocks.findById.mockImplementation((id: string) => queryReturning(id === MEMBER_ID ? member : null));
    });

    it('keeps the original subject and ignores injected identity and authorization claims', async () => {
        const { encodedTokens, response } = await updateSession({
            id: ADMIN_ID,
            sub: ADMIN_ID,
            displayName: 'InjectedAdmin',
            username: 'injected-admin',
            roles: ['admin'],
            rank: 'elite',
            isBanned: false,
        });

        expect(encodedTokens).toHaveLength(1);
        expect(encodedTokens[0]).toMatchObject({
            id: MEMBER_ID,
            sub: MEMBER_ID,
            displayName: member.displayName,
            username: member.username,
            roles: member.roles,
            rank: member.rank,
            isBanned: member.isBanned,
        });
        expect(response.body).toMatchObject({
            user: {
                id: MEMBER_ID,
                displayName: member.displayName,
                roles: member.roles,
            },
        });
        expect(mocks.findById).toHaveBeenCalledWith(MEMBER_ID);
        expect(mocks.findById).not.toHaveBeenCalledWith(ADMIN_ID);

        mocks.getServerSession.mockResolvedValue(response.body);
        await expect(requireAdmin()).rejects.toBeInstanceOf(InsufficientPermissionsError);
        expect(mocks.findById).not.toHaveBeenCalledWith(ADMIN_ID);
    });

    it('refreshes profile and ban claims from the database', async () => {
        const bannedMember: IUserToken = {
            ...member,
            displayName: 'RenamedMember',
            username: 'renamed-member',
            isBanned: true,
        };
        mocks.findById.mockReturnValue(queryReturning(bannedMember));

        const { encodedTokens, response } = await updateSession({
            displayName: 'Client supplied name',
            isBanned: false,
        });

        expect(encodedTokens[0]).toMatchObject({
            id: MEMBER_ID,
            displayName: bannedMember.displayName,
            username: bannedMember.username,
            isBanned: true,
        });
        expect(response.body).toMatchObject({
            user: {
                displayName: bannedMember.displayName,
                username: bannedMember.username,
                isBanned: true,
            },
        });
    });

    it('clears the session when the original user no longer exists', async () => {
        mocks.findById.mockReturnValue(queryReturning(null));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const { encodedTokens, response } = await updateSession({ id: ADMIN_ID });

        consoleError.mockRestore();
        expect(encodedTokens).toEqual([]);
        expect(response.body).toEqual({});
        expect(response.cookies).toContainEqual(expect.objectContaining({
            name: 'next-auth.session-token',
            value: '',
        }));
    });

    it('does not run the callback for an unauthenticated update', async () => {
        const csrfToken = 'test-csrf-token';
        const response = await AuthHandler({
            req: {
                action: 'session',
                method: 'POST',
                body: { csrfToken, data: { id: ADMIN_ID } },
                cookies: { 'next-auth.csrf-token': csrfCookie(csrfToken) },
                headers: { host: 'localhost:3000' },
            },
            options: { ...authOptions, debug: false, secret: SECRET },
        });

        expect(response.body).toEqual({});
        expect(mocks.findById).not.toHaveBeenCalled();
    });

    it('treats malformed update data as an inert refresh signal', async () => {
        const { encodedTokens, response } = await updateSession('not-an-object');

        expect(encodedTokens[0]).toMatchObject({
            id: MEMBER_ID,
            sub: MEMBER_ID,
            displayName: member.displayName,
            roles: member.roles,
        });
        expect(response.body).toMatchObject({ user: { id: MEMBER_ID } });
    });
});

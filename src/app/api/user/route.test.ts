import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationError, NotFoundError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({
    deleteUserAccount: vi.fn(),
    requireAuth: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
    connectDB: vi.fn(),
}));

vi.mock('@/lib/auth/utils', () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock('@/lib/auth/account-deletion', () => ({
    deleteUserAccount: mocks.deleteUserAccount,
}));

vi.mock('@/lib/middleware', () => ({
    withRateLimit: (_request: unknown, handler: () => Promise<Response>) => handler(),
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
    },
}));

vi.mock('@/models/User', () => ({
    User: {
        findById: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}));

import { DELETE } from '@/app/api/user/route';

const USER_ID = '68bd5cf7c48ae02f50b1c200';

function deleteOwnAccount() {
    const request = new Request('http://localhost/api/user', {
        method: 'DELETE',
    }) as NextRequest;

    return DELETE(request);
}

describe('DELETE /api/user', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.requireAuth.mockResolvedValue({ user: { id: USER_ID, username: 'target' } });
        mocks.deleteUserAccount.mockResolvedValue({ userId: USER_ID, username: 'target' });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('deletes the caller through the same operation the admin route uses', async () => {
        const response = await deleteOwnAccount();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ success: true });
        // No guard: a signed-in reader may always delete their own account, admin or not.
        expect(mocks.deleteUserAccount).toHaveBeenCalledWith(USER_ID);
    });

    it('deletes the authenticated subject, never an identifier from the request', async () => {
        await deleteOwnAccount();

        expect(mocks.deleteUserAccount.mock.calls[0][0]).toBe(USER_ID);
    });

    it('rejects an anonymous caller without attempting a deletion', async () => {
        mocks.requireAuth.mockRejectedValueOnce(new AuthenticationError());

        const response = await deleteOwnAccount();

        expect(response.status).toBe(401);
        expect(mocks.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('reports an already-deleted account as not found', async () => {
        mocks.deleteUserAccount.mockRejectedValueOnce(new NotFoundError('User'));

        const response = await deleteOwnAccount();

        expect(response.status).toBe(404);
    });

    it('translates an aborted deletion into an API error', async () => {
        mocks.deleteUserAccount.mockRejectedValueOnce(new Error('transaction aborted'));

        const response = await deleteOwnAccount();

        expect(response.status).toBe(500);
    });
});

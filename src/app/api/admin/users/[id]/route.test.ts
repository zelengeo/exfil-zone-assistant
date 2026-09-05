import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationError, InsufficientPermissionsError, NotFoundError } from '@/lib/errors';
import type { DeletableUser } from '@/lib/auth/account-deletion';

const mocks = vi.hoisted(() => ({
    deleteUserAccount: vi.fn(),
    requireAdmin: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
    connectDB: vi.fn(),
}));

vi.mock('@/lib/auth/utils', () => ({
    requireAdmin: mocks.requireAdmin,
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
        findOne: vi.fn(),
    },
}));

import { DELETE } from '@/app/api/admin/users/[id]/route';

const ADMIN_ID = '68bd5cf7c48ae02f50b1c100';
const TARGET_ID = '68bd5cf7c48ae02f50b1c200';

function deleteTarget(id: string = TARGET_ID) {
    const request = new Request(`http://localhost/api/admin/users/${id}`, {
        method: 'DELETE',
    }) as NextRequest;

    return DELETE(request, { params: Promise.resolve({ id }) });
}

/** Runs the guard the route hands to the deletion operation against a candidate user row. */
function runGuard(user: DeletableUser) {
    const guard = mocks.deleteUserAccount.mock.calls[0][1] as (candidate: DeletableUser) => void;
    guard(user);
}

describe('DELETE /api/admin/users/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.requireAdmin.mockResolvedValue({
            session: { user: { id: ADMIN_ID } },
        });
        mocks.deleteUserAccount.mockResolvedValue({ userId: TARGET_ID, username: 'target' });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('deletes the target account through the shared deletion operation', async () => {
        const response = await deleteTarget();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ success: true });
        expect(mocks.deleteUserAccount).toHaveBeenCalledOnce();
        expect(mocks.deleteUserAccount.mock.calls[0][0]).toBe(TARGET_ID);
    });

    it('rejects an unauthorized caller without attempting a deletion', async () => {
        mocks.requireAdmin.mockRejectedValueOnce(new AuthenticationError());

        const response = await deleteTarget();

        expect(response.status).toBe(401);
        expect(mocks.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('rejects a non-admin caller without attempting a deletion', async () => {
        mocks.requireAdmin.mockRejectedValueOnce(new InsufficientPermissionsError('admin'));

        const response = await deleteTarget();

        expect(response.status).toBe(403);
        expect(mocks.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('rejects a malformed identifier without attempting a deletion', async () => {
        const response = await deleteTarget('not-an-object-id');

        expect(response.status).toBe(400);
        expect(mocks.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('refuses self-deletion without attempting a deletion', async () => {
        const response = await deleteTarget(ADMIN_ID);

        expect(response.status).toBe(409);
        expect(mocks.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('guards admin targets inside the deletion transaction', async () => {
        await deleteTarget();

        expect(() => runGuard({ roles: ['user', 'admin'], username: 'boss' }))
            .toThrowError('Cannot delete admin accounts');
        expect(() => runGuard({ roles: ['user', 'moderator'], username: 'mod' }))
            .not.toThrow();
    });

    it('reports a missing target as not found', async () => {
        mocks.deleteUserAccount.mockRejectedValueOnce(new NotFoundError('User'));

        const response = await deleteTarget();

        expect(response.status).toBe(404);
    });

    it('translates an aborted deletion into an API error', async () => {
        mocks.deleteUserAccount.mockRejectedValueOnce(new Error('transaction aborted'));

        const response = await deleteTarget();

        expect(response.status).toBe(500);
    });
});

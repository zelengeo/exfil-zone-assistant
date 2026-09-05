import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationError, ValidationError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({
    abortTransaction: vi.fn(),
    anonymizeFeedback: vi.fn(),
    commitTransaction: vi.fn(),
    connectDB: vi.fn(),
    connected: false,
    deleteAccounts: vi.fn(),
    deleteUser: vi.fn(),
    endSession: vi.fn(),
    findUser: vi.fn(),
    inTransaction: vi.fn(),
    requireAdmin: vi.fn(),
    startSession: vi.fn(),
    startTransaction: vi.fn(),
}));

const mongooseSession = {
    abortTransaction: mocks.abortTransaction,
    commitTransaction: mocks.commitTransaction,
    endSession: mocks.endSession,
    inTransaction: mocks.inTransaction,
    startTransaction: mocks.startTransaction,
};

vi.mock('@/lib/mongodb', () => ({
    connectDB: mocks.connectDB,
}));

vi.mock('mongoose', async (importOriginal) => {
    const actual = await importOriginal<typeof import('mongoose')>();

    return {
        ...actual,
        default: {
            ...actual.default,
            startSession: mocks.startSession,
        },
    };
});

vi.mock('@/lib/auth/utils', () => ({
    requireAdmin: mocks.requireAdmin,
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
        findById: vi.fn(() => ({ session: mocks.findUser })),
        findByIdAndDelete: vi.fn(() => ({ session: mocks.deleteUser })),
    },
}));

vi.mock('@/models/Account', () => ({
    Account: {
        deleteMany: vi.fn(() => ({ session: mocks.deleteAccounts })),
    },
}));

vi.mock('@/models/Feedback', () => ({
    Feedback: {
        updateMany: vi.fn(() => ({ session: mocks.anonymizeFeedback })),
    },
}));

import { DELETE } from '@/app/api/admin/users/[id]/route';

const ADMIN_ID = '68bd5cf7c48ae02f50b1c100';
const TARGET_ID = '68bd5cf7c48ae02f50b1c200';

function deleteRequest(): NextRequest {
    return new Request(`http://localhost/api/admin/users/${TARGET_ID}`, {
        method: 'DELETE',
    }) as NextRequest;
}

function deleteTarget() {
    return DELETE(deleteRequest(), {
        params: Promise.resolve({ id: TARGET_ID }),
    });
}

describe('DELETE /api/admin/users/[id] transaction lifecycle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.connected = false;
        mocks.requireAdmin.mockResolvedValue({
            session: { user: { id: ADMIN_ID } },
        });
        mocks.connectDB.mockImplementation(async () => {
            mocks.connected = true;
        });
        mocks.startSession.mockImplementation(() => {
            if (!mocks.connected) {
                return new Promise(() => undefined);
            }

            return Promise.resolve(mongooseSession);
        });
        mocks.inTransaction.mockReturnValue(false);
        mocks.abortTransaction.mockResolvedValue(undefined);
        mocks.commitTransaction.mockResolvedValue(undefined);
        mocks.endSession.mockResolvedValue(undefined);
        mocks.findUser.mockResolvedValue({ roles: ['user'], username: 'target' });
        mocks.deleteUser.mockResolvedValue(undefined);
        mocks.deleteAccounts.mockResolvedValue(undefined);
        mocks.anonymizeFeedback.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('connects before creating a session on a cold process', async () => {
        const responseOutcome = Promise.race([
            deleteTarget().then(() => 'settled'),
            new Promise<'pending'>((resolve) => {
                setTimeout(() => resolve('pending'), 250);
            }),
        ]);

        await vi.advanceTimersByTimeAsync(250);

        await expect(responseOutcome).resolves.toBe('settled');
        expect(mocks.connectDB).toHaveBeenCalledOnce();
        expect(mocks.startSession).toHaveBeenCalledOnce();
        expect(mocks.connectDB.mock.invocationCallOrder[0])
            .toBeLessThan(mocks.startSession.mock.invocationCallOrder[0]);
        expect(mocks.endSession).toHaveBeenCalledOnce();
    });

    it('rejects unauthorized deletion before connecting or creating a session', async () => {
        mocks.connected = true;
        mocks.requireAdmin.mockRejectedValueOnce(new AuthenticationError());

        const response = await deleteTarget();

        expect(response.status).toBe(401);
        expect(mocks.connectDB).not.toHaveBeenCalled();
        expect(mocks.startSession).not.toHaveBeenCalled();
        expect(mocks.startTransaction).not.toHaveBeenCalled();
    });

    it('translates connection failures without creating a session', async () => {
        mocks.connected = true;
        mocks.connectDB.mockRejectedValueOnce(new Error('connection failed'));

        const response = await deleteTarget();

        expect(response.status).toBe(500);
        expect(mocks.startSession).not.toHaveBeenCalled();
        expect(mocks.endSession).not.toHaveBeenCalled();
    });

    it('translates session creation failures without attempting cleanup', async () => {
        mocks.startSession.mockRejectedValueOnce(new Error('session creation failed'));

        const response = await deleteTarget();

        expect(response.status).toBe(500);
        expect(mocks.connectDB).toHaveBeenCalledOnce();
        expect(mocks.endSession).not.toHaveBeenCalled();
    });

    it('aborts an active transaction after a commit failure and ends the session once', async () => {
        mocks.connected = true;
        mocks.inTransaction.mockReturnValue(true);
        mocks.commitTransaction.mockRejectedValueOnce(new Error('commit failed'));

        const response = await deleteTarget();

        expect(response.status).toBe(500);
        expect(mocks.abortTransaction).toHaveBeenCalledOnce();
        expect(mocks.endSession).toHaveBeenCalledOnce();
    });

    it('does not abort when the session has no active transaction', async () => {
        mocks.connected = true;
        mocks.findUser.mockRejectedValueOnce(new Error('write failed'));

        const response = await deleteTarget();

        expect(response.status).toBe(500);
        expect(mocks.abortTransaction).not.toHaveBeenCalled();
        expect(mocks.endSession).toHaveBeenCalledOnce();
    });

    it('preserves the original error when aborting the transaction fails', async () => {
        mocks.connected = true;
        mocks.inTransaction.mockReturnValue(true);
        mocks.findUser.mockRejectedValueOnce(new ValidationError('write failed'));
        mocks.abortTransaction.mockRejectedValueOnce(new Error('abort failed'));

        const response = await deleteTarget();

        expect(response.status).toBe(400);
        expect(mocks.abortTransaction).toHaveBeenCalledOnce();
        expect(mocks.endSession).toHaveBeenCalledOnce();
    });
});

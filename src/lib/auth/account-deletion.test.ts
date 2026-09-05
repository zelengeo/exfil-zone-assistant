import { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({
    anonymizeFeedback: vi.fn(),
    connectDB: vi.fn(),
    connected: false,
    deleteAccounts: vi.fn(),
    deleteUser: vi.fn(),
    endSession: vi.fn(),
    findUser: vi.fn(),
    leanUser: vi.fn(),
    startSession: vi.fn(),
    withTransaction: vi.fn(),
}));

const mongooseSession = {
    endSession: mocks.endSession,
    withTransaction: mocks.withTransaction,
};

vi.mock('@/lib/mongodb', () => ({
    connectDB: mocks.connectDB,
    mongoose: {
        startSession: mocks.startSession,
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
    },
}));

vi.mock('@/models/User', () => ({
    User: {
        findById: (...args: unknown[]) => {
            mocks.findUser(...args);
            return { lean: mocks.leanUser };
        },
        findByIdAndDelete: mocks.deleteUser,
    },
}));

vi.mock('@/models/Account', () => ({
    Account: {
        deleteMany: mocks.deleteAccounts,
    },
}));

vi.mock('@/models/Feedback', () => ({
    Feedback: {
        updateMany: mocks.anonymizeFeedback,
    },
}));

import { deleteUserAccount } from '@/lib/auth/account-deletion';

const USER_ID = '68bd5cf7c48ae02f50b1c200';

function writeCalls() {
    return [
        ...mocks.deleteAccounts.mock.calls,
        ...mocks.anonymizeFeedback.mock.calls,
        ...mocks.deleteUser.mock.calls,
    ];
}

describe('deleteUserAccount', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mocks.connected = false;
        mocks.connectDB.mockImplementation(async () => {
            mocks.connected = true;
        });
        mocks.startSession.mockImplementation(() => {
            // A session allocated before the connection resolves never settles. That ordering is
            // the whole point of the B05 fix, so the mock refuses to paper over it.
            if (!mocks.connected) {
                return new Promise(() => undefined);
            }

            return Promise.resolve(mongooseSession);
        });
        mocks.withTransaction.mockImplementation(
            async (operation: () => Promise<unknown>) => operation(),
        );
        mocks.endSession.mockResolvedValue(undefined);
        mocks.leanUser.mockResolvedValue({ roles: ['user'], username: 'target' });
        mocks.deleteAccounts.mockResolvedValue(undefined);
        mocks.anonymizeFeedback.mockResolvedValue(undefined);
        mocks.deleteUser.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('rejects a malformed identifier before connecting', async () => {
        await expect(deleteUserAccount('not-an-object-id')).rejects.toBeInstanceOf(ValidationError);

        expect(mocks.connectDB).not.toHaveBeenCalled();
        expect(mocks.startSession).not.toHaveBeenCalled();
    });

    it('connects before creating a session on a cold process', async () => {
        const outcome = Promise.race([
            deleteUserAccount(USER_ID).then(() => 'settled'),
            new Promise<'pending'>((resolve) => {
                setTimeout(() => resolve('pending'), 250);
            }),
        ]);

        await vi.advanceTimersByTimeAsync(250);

        await expect(outcome).resolves.toBe('settled');
        expect(mocks.connectDB.mock.invocationCallOrder[0])
            .toBeLessThan(mocks.startSession.mock.invocationCallOrder[0]);
        expect(mocks.endSession).toHaveBeenCalledOnce();
    });

    it('runs every participating read and write inside the transaction session', async () => {
        mocks.connected = true;

        await deleteUserAccount(USER_ID);

        expect(mocks.withTransaction).toHaveBeenCalledOnce();
        expect(mocks.findUser).toHaveBeenCalledWith(
            expect.anything(),
            'username roles',
            { session: mongooseSession },
        );

        const calls = writeCalls();
        expect(calls).toHaveLength(4);

        for (const call of calls) {
            expect(call.at(-1)).toMatchObject({ session: mongooseSession });
        }
    });

    it('deletes OAuth links and the user, and anonymizes feedback', async () => {
        mocks.connected = true;

        await deleteUserAccount(USER_ID);

        const identifier = new Types.ObjectId(USER_ID);

        expect(mocks.deleteAccounts).toHaveBeenCalledWith(
            { userId: identifier },
            { session: mongooseSession },
        );
        expect(mocks.deleteUser).toHaveBeenCalledWith(identifier, { session: mongooseSession });

        expect(mocks.anonymizeFeedback).toHaveBeenNthCalledWith(
            1,
            { userId: identifier },
            { $unset: { userId: 1 } },
            { session: mongooseSession },
        );
        expect(mocks.anonymizeFeedback).toHaveBeenNthCalledWith(
            2,
            { 'reviewerNotes.addedByUserId': identifier },
            { $unset: { 'reviewerNotes.$[note].addedByUserId': 1 } },
            {
                arrayFilters: [{ 'note.addedByUserId': identifier }],
                session: mongooseSession,
            },
        );
    });

    it('never writes an identifying note or a field the Feedback schema does not declare', async () => {
        mocks.connected = true;

        await deleteUserAccount(USER_ID);

        for (const call of mocks.anonymizeFeedback.mock.calls) {
            expect(Object.keys(call[1] as object)).toEqual(['$unset']);
        }

        const written = JSON.stringify(mocks.anonymizeFeedback.mock.calls);
        expect(written).not.toContain('target');
        expect(written).not.toContain('isAnonymous');
    });

    it('reports a missing user without writing anything', async () => {
        mocks.connected = true;
        mocks.leanUser.mockResolvedValueOnce(null);

        await expect(deleteUserAccount(USER_ID)).rejects.toBeInstanceOf(NotFoundError);

        expect(writeCalls()).toHaveLength(0);
        expect(mocks.endSession).toHaveBeenCalledOnce();
    });

    it('lets a caller guard refuse the deletion before any write', async () => {
        mocks.connected = true;
        mocks.leanUser.mockResolvedValueOnce({ roles: ['user', 'admin'], username: 'boss' });

        const refusal = deleteUserAccount(USER_ID, (user) => {
            if (user.roles?.includes('admin')) {
                throw new AuthorizationError('Cannot delete admin accounts');
            }
        });

        await expect(refusal).rejects.toBeInstanceOf(AuthorizationError);
        expect(writeCalls()).toHaveLength(0);
    });

    it('ends the session exactly once when the transaction fails', async () => {
        mocks.connected = true;
        mocks.withTransaction.mockRejectedValueOnce(new Error('transaction aborted'));

        await expect(deleteUserAccount(USER_ID)).rejects.toThrow('transaction aborted');

        expect(mocks.endSession).toHaveBeenCalledOnce();
    });

    it('preserves the original failure when ending the session fails', async () => {
        mocks.connected = true;
        mocks.withTransaction.mockRejectedValueOnce(new Error('transaction aborted'));
        mocks.endSession.mockRejectedValueOnce(new Error('end session failed'));

        await expect(deleteUserAccount(USER_ID)).rejects.toThrow('transaction aborted');
    });

    it('does not create a session when the connection fails', async () => {
        mocks.connectDB.mockRejectedValueOnce(new Error('connection failed'));

        await expect(deleteUserAccount(USER_ID)).rejects.toThrow('connection failed');

        expect(mocks.startSession).not.toHaveBeenCalled();
        expect(mocks.endSession).not.toHaveBeenCalled();
    });

    it('does not attempt cleanup when session creation fails', async () => {
        mocks.connected = true;
        mocks.startSession.mockRejectedValueOnce(new Error('session creation failed'));

        await expect(deleteUserAccount(USER_ID)).rejects.toThrow('session creation failed');

        expect(mocks.endSession).not.toHaveBeenCalled();
    });
});

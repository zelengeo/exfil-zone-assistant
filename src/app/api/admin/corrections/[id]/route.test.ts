import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({
    abortTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    connectDB: vi.fn(),
    connected: false,
    endSession: vi.fn(),
    findCorrection: vi.fn(),
    inTransaction: vi.fn(),
    requireAdminOrModerator: vi.fn(),
    saveCorrection: vi.fn(),
    startSession: vi.fn(),
    startTransaction: vi.fn(),
    updateUser: vi.fn(),
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
    requireAdminOrModerator: mocks.requireAdminOrModerator,
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

vi.mock('@/models/DataCorrection', () => ({
    DataCorrection: {
        findById: vi.fn(() => ({ session: mocks.findCorrection })),
    },
}));

vi.mock('@/models/User', () => ({
    User: {
        findByIdAndUpdate: mocks.updateUser,
    },
}));

import { PATCH } from '@/app/api/admin/corrections/[id]/route';

const CORRECTION_ID = '68bd5cf7c48ae02f50b1c300';

function reviewRequest(): NextRequest {
    return new Request(`http://localhost/api/admin/corrections/${CORRECTION_ID}`, {
        body: JSON.stringify({ status: 'approved' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
    }) as NextRequest;
}

function reviewCorrection() {
    return PATCH(reviewRequest(), {
        params: Promise.resolve({ id: CORRECTION_ID }),
    });
}

describe('PATCH /api/admin/corrections/[id] transaction lifecycle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.connected = false;
        mocks.requireAdminOrModerator.mockResolvedValue({
            session: { user: { id: '68bd5cf7c48ae02f50b1c100' } },
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
        mocks.saveCorrection.mockResolvedValue(undefined);
        mocks.findCorrection.mockResolvedValue({
            _id: { toString: () => CORRECTION_ID },
            reviewedAt: undefined,
            reviewedBy: undefined,
            reviewNotes: undefined,
            save: mocks.saveCorrection,
            status: 'pending',
            userId: null,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('connects before creating a session on a cold process', async () => {
        const responseOutcome = Promise.race([
            reviewCorrection().then(() => 'settled'),
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

    it('rejects unauthorized review before connecting or creating a session', async () => {
        mocks.connected = true;
        mocks.requireAdminOrModerator.mockRejectedValueOnce(new AuthenticationError());

        const response = await reviewCorrection();

        expect(response.status).toBe(401);
        expect(mocks.connectDB).not.toHaveBeenCalled();
        expect(mocks.startSession).not.toHaveBeenCalled();
        expect(mocks.startTransaction).not.toHaveBeenCalled();
    });

    it('translates connection failures without creating a session', async () => {
        mocks.connected = true;
        mocks.connectDB.mockRejectedValueOnce(new Error('connection failed'));

        const response = await reviewCorrection();

        expect(response.status).toBe(500);
        expect(mocks.startSession).not.toHaveBeenCalled();
        expect(mocks.endSession).not.toHaveBeenCalled();
    });

    it('translates session creation failures without attempting cleanup', async () => {
        mocks.startSession.mockRejectedValueOnce(new Error('session creation failed'));

        const response = await reviewCorrection();

        expect(response.status).toBe(500);
        expect(mocks.connectDB).toHaveBeenCalledOnce();
        expect(mocks.endSession).not.toHaveBeenCalled();
    });

    it('aborts an active transaction after a commit failure and ends the session once', async () => {
        mocks.connected = true;
        mocks.inTransaction.mockReturnValue(true);
        mocks.commitTransaction.mockRejectedValueOnce(new Error('commit failed'));

        const response = await reviewCorrection();

        expect(response.status).toBe(500);
        expect(mocks.abortTransaction).toHaveBeenCalledOnce();
        expect(mocks.endSession).toHaveBeenCalledOnce();
    });

    it('does not abort when the session has no active transaction', async () => {
        mocks.connected = true;
        mocks.findCorrection.mockRejectedValueOnce(new Error('write failed'));

        const response = await reviewCorrection();

        expect(response.status).toBe(500);
        expect(mocks.abortTransaction).not.toHaveBeenCalled();
        expect(mocks.endSession).toHaveBeenCalledOnce();
    });
});

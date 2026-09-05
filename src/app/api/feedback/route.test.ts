import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({
    connected: false,
    connectDB: vi.fn(),
    createFeedback: vi.fn(),
    getServerSession: vi.fn(),
    requireAuthWithUserCheck: vi.fn(),
    session: {
        abortTransaction: vi.fn(),
        commitTransaction: vi.fn(),
        endSession: vi.fn(),
        inTransaction: vi.fn(),
        startTransaction: vi.fn(),
    },
    startSession: vi.fn(),
}));

vi.mock('next-auth', () => ({
    getServerSession: mocks.getServerSession,
}));

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
    authOptions: {},
}));

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

vi.mock('@/models/Feedback', () => ({
    Feedback: {
        create: mocks.createFeedback,
    },
}));

vi.mock('@/models/User', () => ({
    User: {
        findByIdAndUpdate: vi.fn(),
    },
}));

vi.mock('@/lib/auth/utils', () => ({
    requireAuthWithUserCheck: mocks.requireAuthWithUserCheck,
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

import { POST } from '@/app/api/feedback/route';

function feedbackRequest(): NextRequest {
    return new Request('http://localhost/api/feedback', {
        body: JSON.stringify({
            description: 'A deterministic cold-start feedback report.',
            title: 'Cold start',
            type: 'bug',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
    }) as NextRequest;
}

function dataCorrectionRequest(): NextRequest {
    return new Request('http://localhost/api/feedback', {
        body: JSON.stringify({
            description: 'A data correction requires an authenticated account.',
            title: 'Incorrect item data',
            type: 'data_correction',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
    }) as NextRequest;
}

describe('POST /api/feedback transaction lifecycle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.connected = false;
        mocks.getServerSession.mockResolvedValue(null);
        mocks.connectDB.mockImplementation(async () => {
            mocks.connected = true;
        });
        mocks.startSession.mockImplementation(() => {
            if (!mocks.connected) {
                return new Promise(() => undefined);
            }

            return Promise.resolve(mocks.session);
        });
        mocks.session.commitTransaction.mockResolvedValue(undefined);
        mocks.session.abortTransaction.mockResolvedValue(undefined);
        mocks.session.endSession.mockResolvedValue(undefined);
        mocks.session.inTransaction.mockReturnValue(false);
        mocks.createFeedback.mockResolvedValue([{
            _id: { toString: () => 'feedback-id' },
            isAnonymous: true,
            type: 'bug',
        }]);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('connects before creating a session on a cold process', async () => {
        const responseOutcome = Promise.race([
            POST(feedbackRequest()).then(() => 'settled'),
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
        expect(mocks.session.endSession).toHaveBeenCalledOnce();
    });

    it('translates connection failures without creating a session', async () => {
        mocks.connected = true;
        mocks.connectDB.mockRejectedValueOnce(new Error('connection failed'));

        const response = await POST(feedbackRequest());

        expect(response.status).toBe(500);
        expect(mocks.startSession).not.toHaveBeenCalled();
        expect(mocks.session.endSession).not.toHaveBeenCalled();
    });

    it('translates session creation failures without attempting cleanup', async () => {
        mocks.startSession.mockRejectedValueOnce(new Error('session creation failed'));

        const response = await POST(feedbackRequest());

        expect(response.status).toBe(500);
        expect(mocks.connectDB).toHaveBeenCalledOnce();
        expect(mocks.session.endSession).not.toHaveBeenCalled();
    });

    it('preserves the original error when aborting the transaction fails', async () => {
        mocks.connected = true;
        mocks.session.inTransaction.mockReturnValue(true);
        mocks.createFeedback.mockRejectedValueOnce(new ValidationError('write failed'));
        mocks.session.abortTransaction.mockRejectedValueOnce(new Error('abort failed'));

        const response = await POST(feedbackRequest());

        expect(response.status).toBe(400);
        expect(mocks.session.abortTransaction).toHaveBeenCalledOnce();
        expect(mocks.session.endSession).toHaveBeenCalledOnce();
    });

    it('preserves a successful response when ending the session fails', async () => {
        mocks.connected = true;
        mocks.session.endSession.mockRejectedValueOnce(new Error('end failed'));

        const response = await POST(feedbackRequest());

        expect(response.status).toBe(200);
        expect(mocks.session.endSession).toHaveBeenCalledOnce();
    });

    it('rejects unauthorized feedback before connecting or creating a session', async () => {
        mocks.connected = true;

        const response = await POST(dataCorrectionRequest());

        expect(response.status).toBe(401);
        expect(mocks.connectDB).not.toHaveBeenCalled();
        expect(mocks.startSession).not.toHaveBeenCalled();
        expect(mocks.session.startTransaction).not.toHaveBeenCalled();
    });
});

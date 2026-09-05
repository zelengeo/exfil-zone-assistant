import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    close: vi.fn(),
    connect: vi.fn(),
    connection: {
        close: vi.fn(),
        db: undefined,
        on: vi.fn(),
        readyState: 0,
    },
    listeners: new Map<string, Set<(...args: unknown[]) => void>>(),
    set: vi.fn(),
}));

vi.mock('mongoose', () => ({
    default: {
        connect: mocks.connect,
        connection: mocks.connection,
        set: mocks.set,
    },
}));

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });

    return { promise, reject, resolve };
}

describe('MongoDB connection lifecycle', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/test');
        vi.stubEnv('NODE_ENV', 'production');
        mocks.connection.readyState = 0;
        mocks.listeners.clear();
        mocks.connection.on.mockImplementation((event: string, listener: (...args: unknown[]) => void) => {
            const listeners = mocks.listeners.get(event) ?? new Set();
            listeners.add(listener);
            mocks.listeners.set(event, listeners);
        });
        mocks.connection.close.mockImplementation(async () => {
            mocks.connection.readyState = 0;
            for (const listener of mocks.listeners.get('disconnected') ?? []) {
                listener();
            }
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.useRealTimers();
    });

    it('does not open a connection when the module is imported', async () => {
        await import('@/lib/mongodb');

        expect(mocks.connect).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('rejects every concurrent caller when their shared connection attempt fails', async () => {
        const attempt = deferred<never>();
        mocks.connect.mockReturnValue(attempt.promise);
        const { connectDB } = await import('@/lib/mongodb');

        const first = connectDB().then(
            () => 'resolved',
            () => 'rejected',
        );
        const second = connectDB().then(
            () => 'resolved',
            () => 'rejected',
        );

        attempt.reject(new Error('controlled connection failure'));

        const secondOutcome = Promise.race([
            second,
            new Promise<'pending'>((resolve) => {
                setTimeout(() => resolve('pending'), 250);
            }),
        ]);
        await vi.advanceTimersByTimeAsync(250);

        await expect(first).resolves.toBe('rejected');
        await expect(secondOutcome).resolves.toBe('rejected');
        expect(mocks.connect).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('shares a successful attempt across concurrent callers', async () => {
        const attempt = deferred<never>();
        mocks.connect.mockReturnValue(attempt.promise);
        const { connectDB } = await import('@/lib/mongodb');

        const first = connectDB().then(() => 'resolved');
        const second = connectDB().then(() => 'resolved');
        mocks.connection.readyState = 1;
        attempt.resolve(undefined as never);

        const secondOutcome = Promise.race([
            second,
            new Promise<'pending'>((resolve) => {
                setTimeout(() => resolve('pending'), 250);
            }),
        ]);
        await vi.advanceTimersByTimeAsync(250);

        await expect(first).resolves.toBe('resolved');
        await expect(secondOutcome).resolves.toBe('resolved');
        expect(mocks.connect).toHaveBeenCalledTimes(1);
    });

    it('allows a fresh attempt after the shared attempt rejects', async () => {
        mocks.connect
            .mockRejectedValueOnce(new Error('controlled connection failure'))
            .mockResolvedValueOnce(undefined);
        const { connectDB } = await import('@/lib/mongodb');

        await expect(connectDB()).rejects.toThrow('controlled connection failure');
        await expect(connectDB()).resolves.toBeUndefined();

        expect(mocks.connect).toHaveBeenCalledTimes(2);
    });

    it('keeps listeners and timers bounded across disconnect and retry cycles', async () => {
        mocks.connect.mockResolvedValue(undefined);
        const { connectDB, disconnectDB } = await import('@/lib/mongodb');

        for (let cycle = 0; cycle < 3; cycle += 1) {
            await connectDB();
            await disconnectDB();
        }

        expect(mocks.connection.on).toHaveBeenCalledTimes(3);
        expect([...(mocks.listeners.get('connected') ?? [])]).toHaveLength(1);
        expect([...(mocks.listeners.get('error') ?? [])]).toHaveLength(1);
        expect([...(mocks.listeners.get('disconnected') ?? [])]).toHaveLength(1);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('does not schedule a reconnect after deliberate shutdown', async () => {
        mocks.connect.mockResolvedValue(undefined);
        const { connectDB, disconnectDB } = await import('@/lib/mongodb');

        await connectDB();
        await disconnectDB();
        await vi.runAllTimersAsync();

        expect(mocks.connection.close).toHaveBeenCalledTimes(1);
        expect(mocks.connect).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });
});

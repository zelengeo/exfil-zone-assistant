import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    checkRateLimit: vi.fn(),
    connectDB: vi.fn(),
    database: {
        admin: () => ({ ping: vi.fn().mockResolvedValue(undefined) }),
        listCollections: () => ({
            toArray: vi.fn().mockResolvedValue([{ name: 'users' }, { name: 'accounts' }]),
        }),
        stats: vi.fn().mockResolvedValue({
            collections: 2,
            dataSize: 2 * 1024 * 1024,
            indexes: 4,
            storageSize: 3 * 1024 * 1024,
        }),
    },
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
    requireAdminOrModerator: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
    connectDB: mocks.connectDB,
}));

vi.mock('@/lib/auth/utils', () => ({
    requireAdminOrModerator: mocks.requireAdminOrModerator,
}));

vi.mock('@/lib/rate-limit/rate-limit-factory', () => ({
    getRateLimiter: () => ({ check: mocks.checkRateLimit }),
}));

vi.mock('@/lib/middleware', () => ({
    withRateLimit: (_request: unknown, handler: () => Promise<Response>) => handler(),
}));

vi.mock('@/lib/logger', () => ({
    logger: mocks.logger,
}));

vi.mock('mongoose', () => ({
    default: {
        connection: {
            db: mocks.database,
            readyState: 1,
        },
        connections: [{ name: 'default' }],
    },
}));

import { GET } from '@/app/api/admin/health/route';

describe('admin health database metrics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.connectDB.mockResolvedValue(undefined);
        mocks.requireAdminOrModerator.mockResolvedValue({ user: { id: 'admin' } });
        mocks.checkRateLimit.mockResolvedValue(true);
    });

    it('omits unavailable socket-pool metrics and reports database stats separately', async () => {
        const response = await GET({} as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.checks.database).not.toHaveProperty('connections');
        expect(body.checks.database.stats).toEqual({
            collections: 2,
            dataSize: 2,
            indexes: 4,
            storageSize: 3,
        });
    });

    it('omits database metrics when the server does not make them available', async () => {
        vi.spyOn(mocks.database, 'listCollections').mockReturnValueOnce({
            toArray: vi.fn().mockRejectedValue(new Error('metrics unavailable')),
        });

        const response = await GET({} as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.checks.database.status).toBe('connected');
        expect(body.checks.database).not.toHaveProperty('connections');
        expect(body.checks.database).not.toHaveProperty('stats');
    });
});

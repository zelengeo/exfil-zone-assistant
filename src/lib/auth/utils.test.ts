import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BannedUserError, InsufficientPermissionsError, NotFoundError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({ session: vi.fn(), findById: vi.fn() }));
vi.mock('next-auth', () => ({ getServerSession: mocks.session }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));
vi.mock('@/lib/mongodb', () => ({ connectDB: vi.fn() }));
vi.mock('@/models/User', () => ({ User: { findById: mocks.findById } }));

import { requireAdmin, requireAdminOrModerator, requireAuthWithUserCheck } from './utils';

function storedUser(isBanned: boolean, roles = ['user']) {
    mocks.findById.mockReturnValue({ select: () => ({
        lean: async () => ({ username: 'member', isBanned, roles }),
    }) });
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue({ user: { id: '68bd5cf7c48ae02f50b1c200', isBanned: false } });
});

describe.each([
    ['member', requireAuthWithUserCheck, ['user']],
    ['admin', requireAdmin, ['admin']],
    ['moderator', requireAdminOrModerator, ['moderator']],
] as const)('%s current-state gate', (_name, gate, roles) => {
    it('rejects a ban applied after the token was issued', async () => {
        storedUser(true, [...roles]);
        await expect(gate()).rejects.toBeInstanceOf(BannedUserError);
    });

    it('accepts an unbanned account even if its token still says banned', async () => {
        mocks.session.mockResolvedValue({ user: { id: '68bd5cf7c48ae02f50b1c200', isBanned: true } });
        storedUser(false, [...roles]);
        await expect(gate()).resolves.toHaveProperty('user.isBanned', false);
    });

    it('rejects a deleted account', async () => {
        mocks.findById.mockReturnValue({ select: () => ({ lean: async () => null }) });
        await expect(gate()).rejects.toBeInstanceOf(NotFoundError);
    });
});

it('does not trust an old admin claim after demotion', async () => {
    mocks.session.mockResolvedValue({ user: { id: '68bd5cf7c48ae02f50b1c200', roles: ['admin'] } });
    storedUser(false);
    await expect(requireAdmin()).rejects.toBeInstanceOf(InsufficientPermissionsError);
});

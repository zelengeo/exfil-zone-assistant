import { randomUUID } from 'node:crypto';

import type { NextRequest } from 'next/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { assertLocalMongoUri } from '../../../scripts/local-mongodb';

const mocks = vi.hoisted(() => ({ session: vi.fn() }));
vi.mock('next-auth', () => ({ getServerSession: mocks.session }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));
vi.mock('@/lib/middleware', () => ({
    withRateLimit: (_request: unknown, handler: () => Promise<Response>) => handler(),
    enforceRateLimit: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } }));

const configuredUri = process.env.MONGODB_URI;
function canRun(): boolean {
    if (!configuredUri) return false;
    try { assertLocalMongoUri(configuredUri); return true; } catch { return false; }
}

describe.skipIf(!canRun())('user policy entry points against a replica set', () => {
    let mongodb: typeof import('@/lib/mongodb');
    let User: typeof import('@/models/User').User;
    let Feedback: typeof import('@/models/Feedback').Feedback;
    let profile: typeof import('@/app/api/user/route');
    let legacy: typeof import('@/app/api/user/update/route');
    let username: typeof import('@/app/api/user/update-username/route');
    let feedback: typeof import('@/app/api/feedback/route');
    let admin: typeof import('@/app/api/admin/users/[id]/route');
    let roles: typeof import('@/app/api/admin/users/[id]/roles/route');
    let actions: typeof import('@/app/admin/users/[id]/edit/actions');
    let actorId: string;
    let targetId: string;
    let otherAdminId: string;

    beforeAll(async () => {
        const target = new URL(configuredUri!);
        target.pathname = `/user_policies_test_${randomUUID().replaceAll('-', '')}`;
        process.env.MONGODB_URI = target.toString();
        mongodb = await import('@/lib/mongodb');
        ({ User } = await import('@/models/User'));
        ({ Feedback } = await import('@/models/Feedback'));
        await mongodb.connectDB();
        await User.createIndexes();
        await Feedback.createIndexes();
        profile = await import('@/app/api/user/route');
        legacy = await import('@/app/api/user/update/route');
        username = await import('@/app/api/user/update-username/route');
        feedback = await import('@/app/api/feedback/route');
        admin = await import('@/app/api/admin/users/[id]/route');
        roles = await import('@/app/api/admin/users/[id]/roles/route');
        actions = await import('@/app/admin/users/[id]/edit/actions');
    }, 30_000);

    afterAll(async () => {
        if (mongodb?.mongoose.connection.db?.databaseName.startsWith('user_policies_test_')) {
            await mongodb.mongoose.connection.db.dropDatabase();
        }
        await mongodb?.disconnectDB();
        process.env.MONGODB_URI = configuredUri;
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Feedback.deleteMany({});
        const [actor, target, otherAdmin] = await User.create([
            { email: 'actor@example.test', username: 'actor', displayName: 'Actor', roles: ['user', 'admin'] },
            { email: 'target@example.test', username: 'target', displayName: 'Target', roles: ['user'], location: 'eu' },
            { email: 'admin@example.test', username: 'another-admin', displayName: 'Admin', roles: ['user', 'admin'] },
        ]);
        actorId = actor.id;
        targetId = target.id;
        otherAdminId = otherAdmin.id;
        signIn(actorId);
    });

    function signIn(id: string, isBanned = false) {
        mocks.session.mockResolvedValue({ user: { id, isBanned, roles: ['admin'] } });
    }

    function request(body: unknown, method = 'PATCH'): NextRequest {
        return new Request('http://localhost/api/user', {
            method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        }) as NextRequest;
    }

    const profilePaths = ['profile', 'legacy', 'username', 'feedback'] as const;
    function mutateOwn(path: typeof profilePaths[number]) {
        if (path === 'profile') return profile.PATCH(request({ bio: 'Updated biography' }));
        if (path === 'legacy') return legacy.PATCH(request({ bio: 'Updated biography' }));
        if (path === 'username') return username.PATCH(request({ username: 'new-target' }));
        return feedback.POST(request({ type: 'bug', title: 'Synthetic bug', description: 'Synthetic feedback for policy tests' }, 'POST'));
    }

    describe.each(profilePaths)('%s mutation', path => {
        it('rejects a ban applied after sign-in without writing', async () => {
            signIn(targetId);
            await User.updateOne({ _id: targetId }, { $set: { isBanned: true } });
            const response = await mutateOwn(path);
            expect(response.status).toBe(403);
            expect((await response.json()).error.code).toBe('USER_BANNED');
            expect(await Feedback.countDocuments()).toBe(0);
            expect(await User.findById(targetId).lean()).toMatchObject({ username: 'target', stats: { feedbackSubmitted: 0 } });
        });

        it('rejects an account deleted after sign-in', async () => {
            signIn(targetId);
            await User.deleteOne({ _id: targetId });
            expect((await mutateOwn(path)).status).toBe(404);
            expect(await Feedback.countDocuments()).toBe(0);
        });

        it('permits an unbanned user despite a stale banned token', async () => {
            signIn(targetId, true);
            expect((await mutateOwn(path)).status).toBe(200);
        });
    });

    it('preserves the legacy response and the canonical profile mutation behavior', async () => {
        signIn(targetId);
        const canonical = await (await profile.PATCH(request({ bio: 'A shared biography' }))).json();
        const old = await (await legacy.PATCH(request({ bio: 'A shared biography' }))).json();
        expect(old).toMatchObject({ success: true, user: { id: targetId, bio: canonical.user.bio, location: 'eu' } });
        expect(canonical.user._id).toBe(targetId);
        expect(old.user).not.toHaveProperty('_id');
    });

    it.each([false, true])('allows self-deletion when banned, with token ban=%s', async tokenBan => {
        signIn(targetId, tokenBan);
        await User.updateOne({ _id: targetId }, { $set: { isBanned: true } });
        expect((await profile.DELETE(request({}, 'DELETE'))).status).toBe(200);
        expect(await User.findById(targetId)).toBeNull();
    });

    const adminPaths = ['api', 'action', 'roles'] as const;
    async function mutateAdmin(path: typeof adminPaths[number], id: string, body: unknown) {
        if (path === 'action') {
            return actions.updateUser(id, body as Parameters<typeof actions.updateUser>[1]);
        }
        const response = await (path === 'api' ? admin.PATCH : roles.PATCH)(request(body), { params: Promise.resolve({ id }) });
        return { ...await response.json(), status: response.status };
    }
    function roleChange(path: typeof adminPaths[number]) {
        return path === 'roles' ? { action: 'add', role: 'moderator' } : { roles: ['user', 'moderator'] };
    }

    describe.each(adminPaths)('%s admin mutation', path => {
        it('rejects ordinary callers despite forged/stale token roles', async () => {
            signIn(targetId);
            expect((await mutateAdmin(path, otherAdminId, roleChange(path))).success).not.toBe(true);
            expect((await User.findById(otherAdminId).lean()).roles).toEqual(['user', 'admin']);
        });
        it('rejects a newly banned administrator', async () => {
            await User.updateOne({ _id: actorId }, { $set: { isBanned: true } });
            expect((await mutateAdmin(path, targetId, roleChange(path))).success).not.toBe(true);
            expect((await User.findById(targetId).lean()).roles).toEqual(['user']);
        });
        it('rejects self-role changes', async () => {
            expect((await mutateAdmin(path, actorId, roleChange(path))).success).not.toBe(true);
            expect((await User.findById(actorId).lean()).roles).toEqual(['user', 'admin']);
        });
        it('rejects changes to another administrator’s roles', async () => {
            expect((await mutateAdmin(path, otherAdminId, roleChange(path))).success).not.toBe(true);
            expect((await User.findById(otherAdminId).lean()).roles).toEqual(['user', 'admin']);
        });
        it('allows role changes on a normal target', async () => {
            expect((await mutateAdmin(path, targetId, roleChange(path))).success).toBe(true);
            expect((await User.findById(targetId).lean()).roles).toEqual(['user', 'moderator']);
        });
    });

    describe.each(['api', 'action'] as const)('%s generic edit', path => {
        it('preserves omitted role, rank and ban fields', async () => {
            await User.updateOne({ _id: targetId }, { $set: { roles: ['partner'], rank: 'elite', isBanned: true } });
            expect((await mutateAdmin(path, targetId, { bio: 'An ordinary profile edit' })).success).toBe(true);
            expect(await User.findById(targetId).lean()).toMatchObject({ roles: ['partner'], rank: 'elite', isBanned: true });
        });
        it.each(['self', 'other'] as const)('allows %s admin profile edits with unchanged submitted roles', async target => {
            const id = target === 'self' ? actorId : otherAdminId;
            expect((await mutateAdmin(path, id, { bio: 'Updated admin biography', roles: ['admin', 'user'] })).success).toBe(true);
            expect((await User.findById(id).lean()).bio).toBe('Updated admin biography');
        });
    });
});

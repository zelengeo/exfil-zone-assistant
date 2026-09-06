import { randomUUID } from 'node:crypto';

import { NextRequest } from 'next/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { assertLocalMongoUri } from '../../../scripts/local-mongodb';
import type { IFeedback } from '@/lib/schemas/feedback';

const mocks = vi.hoisted(() => ({ session: vi.fn() }));
vi.mock('next-auth', () => ({ getServerSession: mocks.session }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));
vi.mock('@/lib/middleware', () => ({
    withRateLimit: (_request: unknown, handler: () => Promise<Response>) => handler(),
}));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } }));

const configuredUri = process.env.MONGODB_URI;
function canRun(): boolean {
    if (!configuredUri) return false;
    try { assertLocalMongoUri(configuredUri); return true; } catch { return false; }
}

// B04/B05: real Mongoose lifecycle, transactions and route gates. Session identity and rate limits
// are supplied at the request boundary; all persistence uses this suite's disposable database.
describe.skipIf(!canRun())('backend cold-connection smoke checks', () => {
    const databaseName = `backend_smoke_test_${randomUUID().replaceAll('-', '')}`;
    let mongodb: typeof import('@/lib/mongodb');
    let User: typeof import('@/models/User').User;
    let Account: typeof import('@/models/Account').Account;
    let Feedback: typeof import('@/models/Feedback').Feedback;
    let feedback: typeof import('@/app/api/feedback/route');
    let admin: typeof import('@/app/api/admin/users/[id]/route');
    let adminId: string;
    let targetId: string;

    beforeAll(async () => {
        const target = new URL(configuredUri!);
        target.pathname = `/${databaseName}`;
        process.env.MONGODB_URI = target.toString();
        mongodb = await import('@/lib/mongodb');
        ({ User } = await import('@/models/User'));
        ({ Account } = await import('@/models/Account'));
        ({ Feedback } = await import('@/models/Feedback'));
        feedback = await import('@/app/api/feedback/route');
        admin = await import('@/app/api/admin/users/[id]/route');
        expect(mongodb.mongoose.connection.readyState).toBe(0);
        await mongodb.connectDB();
        await Promise.all([User.createIndexes(), Account.createIndexes(), Feedback.createIndexes()]);
        await mongodb.disconnectDB();
    }, 30_000);

    beforeEach(async () => {
        await mongodb.connectDB();
        await Promise.all([User.deleteMany({}), Account.deleteMany({}), Feedback.deleteMany({})]);
        const [actor, targetUser] = await User.create([
            { email: 'admin@example.test', username: 'admin', roles: ['admin'], isBanned: false },
            { email: 'target@example.test', username: 'target', roles: ['user'], isBanned: false },
        ]);
        adminId = actor.id;
        targetId = targetUser.id;
        await Account.create({ userId: targetId, type: 'oauth', provider: 'discord', providerAccountId: 'synthetic' });
        await mongodb.disconnectDB();
    });

    afterAll(async () => {
        if (mongodb) {
            await mongodb.connectDB();
            if (mongodb.mongoose.connection.db?.databaseName === databaseName) {
                await mongodb.mongoose.connection.db.dropDatabase();
            }
            await mongodb.disconnectDB();
        }
        process.env.MONGODB_URI = configuredUri;
    });

    it('shares real reconnects after shutdown without accumulating lifecycle listeners', async () => {
        const connection = mongodb.mongoose.connection;
        const events = ['connected', 'disconnected', 'error'];
        const counts = () => events.map(event => connection.listenerCount(event));
        const before = counts();
        for (let cycle = 0; cycle < 3; cycle++) {
            expect(connection.readyState).toBe(0);
            const first = mongodb.connectDB();
            const second = mongodb.connectDB();
            expect(first).toBe(second);
            await Promise.all([first, second]);
            expect(await mongodb.isDatabaseConnected()).toBe(true);
            await mongodb.disconnectDB();
            expect(connection.readyState).toBe(0);
            expect(counts()).toEqual(before);
        }
    }, 30_000);

    it.each([false, true])('commits feedback from a disconnected state, authenticated=%s', async authenticated => {
        await mongodb.disconnectDB();
        mocks.session.mockResolvedValue(authenticated ? { user: { id: targetId } } : null);
        expect(mongodb.mongoose.connection.readyState).toBe(0);
        const response = await feedback.POST(new NextRequest('http://localhost/api/feedback', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'bug', title: 'Local audit smoke test', description: 'Synthetic feedback for the cold connection test.' }),
        }));
        expect(response.status).toBe(200);
        const body = await response.json();
        const row = await Feedback.findById(body.feedbackId).lean<IFeedback>();
        expect(row).not.toBeNull();
        expect(row?.userId?.toString()).toBe(authenticated ? targetId : undefined);
        if (authenticated) {
            expect(await User.findById(targetId).lean()).toMatchObject({ stats: { feedbackSubmitted: 1, bugsReported: 1 } });
        }
    });

    it('commits admin deletion from a disconnected state and anonymizes retained feedback', async () => {
        await mongodb.connectDB();
        const retained = await Feedback.create({
            userId: targetId, type: 'bug', title: 'Retained smoke fixture',
            description: 'Synthetic feedback surviving account deletion.',
        });
        await mongodb.disconnectDB();
        mocks.session.mockResolvedValue({ user: { id: adminId } });
        expect(mongodb.mongoose.connection.readyState).toBe(0);
        const response = await admin.DELETE(new NextRequest(`http://localhost/api/admin/users/${targetId}`, {
            method: 'DELETE',
        }), { params: Promise.resolve({ id: targetId }) });
        expect(response.status).toBe(200);
        expect(await User.findById(targetId)).toBeNull();
        expect(await Account.countDocuments({ userId: targetId })).toBe(0);
        expect(await Feedback.findById(retained._id)).not.toBeNull();
        expect(await Feedback.countDocuments()).toBe(1);
        expect(await Feedback.countDocuments({ userId: { $exists: true } })).toBe(0);
    });
});

/**
 * Rollback and reference cleanup verified against a real replica set.
 *
 * Mocked persistence can show that a session was passed to every query; only a replica set shows
 * that passing it actually rolls the writes back. This suite is skipped unless MONGODB_URI points
 * at the loopback development replica set, so `npm test` stays offline and no non-local database
 * is ever written to. `npm run verify:local` supplies that URI — see the root AGENTS.md.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Types } from 'mongoose';

import { assertLocalMongoUri } from '../../../scripts/local-mongodb';

function usesLocalReplicaSet(): boolean {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        return false;
    }

    try {
        assertLocalMongoUri(uri);
        return true;
    } catch {
        return false;
    }
}

const describeAgainstReplicaSet = usesLocalReplicaSet() ? describe : describe.skip;

describeAgainstReplicaSet('deleteUserAccount against a replica set', () => {
    let deleteUserAccount: typeof import('@/lib/auth/account-deletion').deleteUserAccount;
    let User: typeof import('@/models/User').User;
    let Account: typeof import('@/models/Account').Account;
    let Feedback: typeof import('@/models/Feedback').Feedback;
    let disconnectDB: typeof import('@/lib/mongodb').disconnectDB;

    let userId: Types.ObjectId;
    let reviewerId: Types.ObjectId;
    let authoredFeedbackId: Types.ObjectId;
    let reviewedFeedbackId: Types.ObjectId;

    beforeAll(async () => {
        // Imported lazily: @/lib/mongodb throws at module load when MONGODB_URI is unset, which is
        // the normal state for the rest of the suite.
        ({ deleteUserAccount } = await import('@/lib/auth/account-deletion'));
        ({ User } = await import('@/models/User'));
        ({ Account } = await import('@/models/Account'));
        ({ Feedback } = await import('@/models/Feedback'));
        const mongodb = await import('@/lib/mongodb');
        disconnectDB = mongodb.disconnectDB;
        await mongodb.connectDB();
    }, 30_000);

    afterAll(async () => {
        await disconnectDB();
    });

    beforeEach(async () => {
        const marker = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

        const [user, reviewer] = await User.create([
            { email: `deleted-${marker}@example.test`, username: `deleted-${marker}` },
            { email: `reviewer-${marker}@example.test`, username: `reviewer-${marker}` },
        ]);

        userId = user._id;
        reviewerId = reviewer._id;

        await Account.create({
            userId,
            type: 'oauth',
            provider: 'discord',
            providerAccountId: `provider-${marker}`,
        });

        const authored = await Feedback.create({
            type: 'bug',
            title: 'Authored by the account under test',
            description: 'Survives the deletion without its author.',
            userId,
        });
        authoredFeedbackId = authored._id;

        const reviewed = await Feedback.create({
            type: 'bug',
            title: 'Reviewed by the account under test',
            description: 'Keeps its notes; loses the reviewer reference.',
            userId: reviewerId,
            reviewerNotes: [
                { note: 'Left by the account under test', addedByUserId: userId },
                { note: 'Left by somebody else', addedByUserId: reviewerId },
            ],
        });
        reviewedFeedbackId = reviewed._id;
    });

    afterEach(async () => {
        vi.restoreAllMocks();
        await Promise.all([
            User.deleteMany({ _id: { $in: [userId, reviewerId] } }),
            Account.deleteMany({ userId }),
            Feedback.deleteMany({ _id: { $in: [authoredFeedbackId, reviewedFeedbackId] } }),
        ]);
    });

    it('removes the user and its OAuth links, and unsets every reference to the deleted id', async () => {
        await deleteUserAccount(userId.toString());

        expect(await User.findById(userId).lean()).toBeNull();
        expect(await Account.countDocuments({ userId })).toBe(0);

        const authored = await Feedback.findById(authoredFeedbackId).lean<{
            userId?: unknown;
            reviewerNotes: { note: string }[];
        }>();
        expect(authored).not.toBeNull();
        expect(authored?.userId).toBeUndefined();

        const reviewed = await Feedback.findById(reviewedFeedbackId).lean<{
            reviewerNotes: { note: string; addedByUserId?: Types.ObjectId }[];
        }>();
        const notes = reviewed?.reviewerNotes ?? [];
        expect(notes).toHaveLength(2);
        expect(notes[0].addedByUserId).toBeUndefined();
        expect(notes[0].note).toBe('Left by the account under test');
        // Somebody else's attribution is not collateral damage.
        expect(notes[1].addedByUserId?.toString()).toBe(reviewerId.toString());
    });

    it('writes no identifying replacement for the account it erased', async () => {
        const username = (await User.findById(userId).lean<{ username: string }>())?.username;

        await deleteUserAccount(userId.toString());

        const rows = await Feedback.find({
            _id: { $in: [authoredFeedbackId, reviewedFeedbackId] },
        }).lean();

        const serialized = JSON.stringify(rows);
        expect(serialized).not.toContain(userId.toString());
        expect(serialized).not.toContain(username);
        // isAnonymous is not a field Feedback declares; the old admin path wrote it anyway.
        expect(serialized).not.toContain('isAnonymous');
    });

    it('rolls back the account and OAuth deletions when a later write fails', async () => {
        vi.spyOn(Feedback, 'updateMany').mockImplementationOnce(() => {
            throw new Error('injected failure after Account deletion');
        });

        await expect(deleteUserAccount(userId.toString()))
            .rejects.toThrow('injected failure after Account deletion');

        expect(await User.findById(userId).lean()).not.toBeNull();
        expect(await Account.countDocuments({ userId })).toBe(1);

        const authored = await Feedback.findById(authoredFeedbackId).lean<{ userId?: Types.ObjectId }>();
        expect(authored?.userId?.toString()).toBe(userId.toString());
    });

    it('rolls back everything when the final user deletion fails', async () => {
        vi.spyOn(User, 'findByIdAndDelete').mockImplementationOnce(() => {
            throw new Error('injected failure at the last write');
        });

        await expect(deleteUserAccount(userId.toString()))
            .rejects.toThrow('injected failure at the last write');

        expect(await User.findById(userId).lean()).not.toBeNull();
        expect(await Account.countDocuments({ userId })).toBe(1);

        const authored = await Feedback.findById(authoredFeedbackId).lean<{ userId?: Types.ObjectId }>();
        expect(authored?.userId?.toString()).toBe(userId.toString());

        const reviewed = await Feedback.findById(reviewedFeedbackId).lean<{
            reviewerNotes: { addedByUserId?: Types.ObjectId }[];
        }>();
        expect(reviewed?.reviewerNotes[0].addedByUserId?.toString()).toBe(userId.toString());
    });

    it('reports a repeated deletion as not found and leaves the collections alone', async () => {
        await deleteUserAccount(userId.toString());

        await expect(deleteUserAccount(userId.toString())).rejects.toThrow('User not found');

        expect(await Feedback.countDocuments({
            _id: { $in: [authoredFeedbackId, reviewedFeedbackId] },
        })).toBe(2);
    });
});

/**
 * A uniqueness conflict that no availability pre-check can prevent.
 *
 * `update-username` checks whether a name is taken before writing it. Two requests can both pass
 * that check and race to the write; the unique index is what actually decides, and the loser gets a
 * driver error. This suite proves that error is a real `MongoServerError` and that the translator
 * turns it into the 409 the client contract promises — the case a mocked error can assert the
 * shape of, but not that the shape is right.
 *
 * Skipped unless MONGODB_URI is the loopback replica set; `npm run verify:local` supplies it.
 */
import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';

import { assertLocalMongoUri } from '../../scripts/local-mongodb';

function usesLocalReplicaSet(): boolean {
    const uri = process.env.MONGODB_URI;
    if (!uri) return false;

    try {
        assertLocalMongoUri(uri);
        return true;
    } catch {
        return false;
    }
}

const describeAgainstReplicaSet = usesLocalReplicaSet() ? describe : describe.skip;

describeAgainstReplicaSet('uniqueness conflicts', () => {
    let handleError: typeof import('@/lib/errors').handleError;
    let isDuplicateKeyError: typeof import('@/lib/errors').isDuplicateKeyError;
    let User: typeof import('@/models/User').User;
    let disconnectDB: typeof import('@/lib/mongodb').disconnectDB;

    let marker: string;

    beforeAll(async () => {
        // @/lib/mongodb throws at module load without MONGODB_URI, which is the normal state here.
        ({ handleError, isDuplicateKeyError } = await import('@/lib/errors'));
        ({ User } = await import('@/models/User'));
        const mongodb = await import('@/lib/mongodb');
        disconnectDB = mongodb.disconnectDB;
        await mongodb.connectDB();
        // The unique indexes are what this suite is about, so make sure they exist.
        await User.createIndexes();
    }, 30_000);

    afterAll(async () => {
        await User.deleteMany({ email: /@conflict\.test$/ });
        await disconnectDB();
    });

    beforeEach(() => {
        marker = Math.random().toString(36).slice(2, 10);
    });

    it('rejects a second account claiming a taken username with a 409, not a 500', async () => {
        const username = `race-${marker}`;

        await User.create({ email: `first-${marker}@conflict.test`, username });

        let caught: unknown;
        try {
            await User.create({ email: `second-${marker}@conflict.test`, username });
        } catch (error) {
            caught = error;
        }

        expect(caught).toBeDefined();
        expect(isDuplicateKeyError(caught)).toBe(true);

        const response = handleError(caught);
        expect(response.status).toBe(409);

        const payload = await response.json() as { error: { message: string; code: string } };
        expect(payload.error.code).toBe('DUPLICATE_ERROR');
        expect(payload.error.message).toContain('username');
    });

    it('rejects a duplicate email the same way', async () => {
        const email = `shared-${marker}@conflict.test`;

        await User.create({ email, username: `first-${marker}` });

        const conflict = await User.create({ email, username: `second-${marker}` })
            .then(() => null)
            .catch((error: unknown) => error);

        expect(isDuplicateKeyError(conflict)).toBe(true);
        expect(handleError(conflict).status).toBe(409);
    });

    it('handles two writers racing past a passed availability check', async () => {
        const username = `contested-${marker}`;

        // Both callers see the name as free — exactly what update-username's pre-check does.
        expect(await User.findOne({ username }).lean()).toBeNull();

        const results = await Promise.allSettled([
            User.create({ email: `a-${marker}@conflict.test`, username }),
            User.create({ email: `b-${marker}@conflict.test`, username }),
        ]);

        const rejected = results.filter(r => r.status === 'rejected');
        // The index decides, not the check: exactly one writer wins.
        expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
        expect(rejected).toHaveLength(1);

        const reason = (rejected[0] as PromiseRejectedResult).reason as unknown;
        expect(isDuplicateKeyError(reason)).toBe(true);
        expect(handleError(reason).status).toBe(409);
    });
});

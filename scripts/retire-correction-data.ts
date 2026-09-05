/**
 * One-off migration for the correction retirement (audit B12) and the account-deletion
 * remediation it was asked to carry (audit B06).
 *
 * The code changes for both shipped without touching stored data: removing a model unregisters it,
 * it does not drop a collection. This script is the operator action that finishes the job.
 *
 *   npm run db:retire-corrections                      # dry run against MONGODB_URI, writes nothing
 *   npm run db:retire-corrections -- --apply --confirm=<database>
 *   npm run db:retire-corrections:local                # dry run against the loopback replica set
 *
 * A dry run is the default and the only mode that needs no arguments. `--apply` additionally
 * requires `--confirm=<database>` to name the database the URI actually resolves to, so pointing a
 * production URI at the wrong environment fails on the interlock rather than on the data.
 *
 * Step 3 only reports. Whether an orphaned reference should be unset, and whether a user left
 * unable to sign in should be deleted or repaired, are retention decisions rather than mechanical
 * ones — the script surfaces them and stops.
 */
import { MongoClient, type Db, type ObjectId } from 'mongodb';
import { config } from 'dotenv';

config({ path: '.env.local' });

const NAMESPACE_NOT_FOUND = 26;

/** Written by the pre-fix self-service deletion path, which named the account it had just erased. */
const IDENTIFYING_NOTE = /^User account deleted - /;

/** Only the fields this migration reads or rewrites. */
interface FeedbackRow {
    _id: ObjectId;
    title?: string;
    userId?: ObjectId;
    reviewerNotes?: { note: string; addedByUserId?: ObjectId }[];
}

interface Options {
    apply: boolean;
    confirm: string | null;
}

function parseOptions(argv: string[]): Options {
    const confirmArg = argv.find(arg => arg.startsWith('--confirm='));

    return {
        apply: argv.includes('--apply'),
        confirm: confirmArg ? confirmArg.slice('--confirm='.length) : null,
    };
}

function heading(step: string): void {
    console.log(`\n── ${step}`);
}

/** Step 1: the retired collection itself. */
async function eraseCorrections(db: Db, apply: boolean): Promise<void> {
    heading('1. datacorrections');

    const collections = await db.listCollections({ name: 'datacorrections' }).toArray();

    if (collections.length === 0) {
        console.log('   collection is absent — nothing to erase');
        return;
    }

    const total = await db.collection('datacorrections').countDocuments();
    console.log(`   ${total} document(s) in datacorrections`);

    if (!apply) {
        console.log('   would drop the collection');
        return;
    }

    try {
        await db.collection('datacorrections').drop();
        console.log('   dropped');
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error
            && error.code === NAMESPACE_NOT_FOUND) {
            console.log('   already gone');
            return;
        }
        throw error;
    }
}

/** Step 2: reviewer notes the pre-fix deletion path wrote, which re-identify a deleted account. */
async function scrubIdentifyingNotes(db: Db, apply: boolean): Promise<void> {
    heading('2. feedbacks.reviewerNotes written by the pre-fix deletion path');

    const feedbacks = db.collection<FeedbackRow>('feedbacks');
    const filter = { 'reviewerNotes.note': { $regex: IDENTIFYING_NOTE } };
    const affected = await feedbacks.countDocuments(filter);

    if (affected === 0) {
        console.log('   no feedback carries an identifying deletion note');
        return;
    }

    console.log(`   ${affected} feedback document(s) carry at least one such note`);

    const sample = await feedbacks.find(filter).limit(3).toArray();
    for (const row of sample) {
        console.log(`   · ${row._id.toString()} — ${row.title ?? '(untitled)'}`);
    }

    if (!apply) {
        console.log('   would pull every note matching /^User account deleted - /');
        return;
    }

    // The note's only content is the identity it leaks, so the entry goes rather than its fields.
    const result = await feedbacks.updateMany(filter, {
        $pull: { reviewerNotes: { note: { $regex: IDENTIFYING_NOTE } } },
    });

    console.log(`   pulled notes from ${result.modifiedCount} document(s)`);
}

/** Step 3: leftovers a pre-fix partial deletion could have produced. Reported, never changed. */
async function reportDeletionLeftovers(db: Db): Promise<void> {
    heading('3. leftovers from partially applied deletions (report only)');

    const userIds = new Set(
        (await db.collection('users').find({}, { projection: { _id: 1 } }).toArray())
            .map(row => String(row._id)),
    );

    const orphanedFeedback = (await db.collection<FeedbackRow>('feedbacks')
        .find({ userId: { $exists: true } }, { projection: { userId: 1 } })
        .toArray())
        .filter(row => row.userId && !userIds.has(row.userId.toString()));

    console.log(`   ${orphanedFeedback.length} feedback document(s) reference a user that no longer exists`);
    if (orphanedFeedback.length > 0) {
        console.log('   → decide whether to unset userId (the current policy) or leave the reference');
    }

    const linkedUserIds = new Set(
        (await db.collection('accounts').find({}, { projection: { userId: 1 } }).toArray())
            .map(row => String(row.userId)),
    );

    const signInLocked = [...userIds].filter(id => !linkedUserIds.has(id));

    console.log(`   ${signInLocked.length} user(s) have no OAuth link and cannot sign in`);
    if (signInLocked.length > 0) {
        console.log('   → a pre-fix deletion could abort after removing links; confirm before acting');
        for (const id of signInLocked.slice(0, 5)) {
            console.log(`   · ${id}`);
        }
    }
}

async function main(): Promise<void> {
    const { apply, confirm } = parseOptions(process.argv.slice(2));
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI is not set');
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();

        console.log(`Database: ${db.databaseName}`);
        console.log(`Mode:     ${apply ? 'APPLY — writes are permanent' : 'dry run — nothing is written'}`);

        if (apply && confirm !== db.databaseName) {
            throw new Error(
                `Refusing to apply: pass --confirm=${db.databaseName} to name the database being changed`,
            );
        }

        await eraseCorrections(db, apply);
        await scrubIdentifyingNotes(db, apply);
        await reportDeletionLeftovers(db);

        console.log(apply
            ? '\n✅ Migration applied'
            : '\n✅ Dry run complete — re-run with --apply --confirm=<database> to write');
    } finally {
        await client.close();
    }
}

main().catch((error: unknown) => {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});

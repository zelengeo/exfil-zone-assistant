/**
 * Index rollout for the registered Mongoose models.
 *
 *   npm run db:sync                    # preview: prints the target and the diff, writes nothing
 *   npm run db:sync -- --apply         # applies the diff, then verifies required constraints
 *
 * Preview is the default because `syncIndexes` **drops** indexes that are not in the schema. The
 * previous version ran a global `connection.syncIndexes()` before anything was shown, so an
 * operator's first feedback about a destructive change arrived after it had happened.
 *
 * Every failure exits nonzero. The previous version caught per-model errors, logged them, carried
 * on, and still printed a completion message, so automation could not tell a successful rollout
 * from a failed one; missing unique constraints likewise only printed a warning.
 *
 * The logic lives in `index-rollout.ts` so it can be tested without a database.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Importing a model registers its schema and its indexes.
import '../src/models/User';
import '../src/models/Account';
import '../src/models/Feedback';

import {
    applyIndexes,
    describeTarget,
    previewIndexes,
    verifyConstraints,
    type RollableModel,
} from './index-rollout';

function registeredModels(): RollableModel[] {
    return mongoose.modelNames().map(name => mongoose.model(name) as unknown as RollableModel);
}

const log = (line: string) => console.log(line);
const logError = (line: string) => console.error(line);

async function main(): Promise<void> {
    const shouldApply = process.argv.includes('--apply');
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI is not set');
    }

    log(`Target: ${describeTarget(uri)}`);
    log(`Mode:   ${shouldApply ? 'APPLY — indexes will be created and dropped' : 'preview — nothing is written'}`);

    // Model initialization otherwise creates collections/indexes in the background, even when
    // this command only previews. All index writes must go through the explicit --apply path.
    await mongoose.connect(uri, { autoIndex: false, autoCreate: false });

    try {
        log('\nPending index changes:');
        const changes = await previewIndexes(registeredModels(), log);

        if (!shouldApply) {
            log(changes
                ? '\n✅ Preview complete — re-run with --apply to make these changes'
                : '\n✅ Preview complete — no changes pending');
            return;
        }

        log('\nApplying:');
        await applyIndexes(registeredModels(), log, logError);

        log('\nVerifying required constraints:');
        await verifyConstraints(registeredModels(), log, logError);

        log('\n✨ Index rollout complete');
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((error: unknown) => {
    console.error('❌ Index rollout failed:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});

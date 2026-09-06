/**
 * Clears the OAuth provider credentials stored on `accounts` rows written before audit B16.
 *
 * Removing the fields from the Mongoose schema stops new writes; it does not touch a stored
 * document. This is the operator action that does.
 *
 *   npm run db:strip-oauth-tokens                        # dry run against MONGODB_URI
 *   npm run db:strip-oauth-tokens -- --apply --confirm=<database>
 *   npm run db:strip-oauth-tokens:local                  # dry run against the loopback replica set
 *
 * The preview reports field names and counts only. It never reads or prints a credential value —
 * the point of the exercise is that these values stop existing, so surfacing them in a terminal or
 * a CI log would defeat it.
 *
 * Provider linkage is preserved: `userId`, `type`, `provider` and `providerAccountId` are never
 * touched, so no account is unlinked and nobody is signed out.
 */
import { MongoClient, type Db } from 'mongodb';
import { config } from 'dotenv';

config({ path: '.env.local' });

/** Everything the schema used to declare. Unset by name; nothing else on the row is altered. */
const TOKEN_FIELDS = [
    'access_token',
    'refresh_token',
    'id_token',
    'expires_at',
    'token_type',
    'scope',
    'session_state',
    'oauth_token',
    'oauth_token_secret',
] as const;

/** Never unset: this is the provider link itself. */
const IDENTITY_FIELDS = ['userId', 'type', 'provider', 'providerAccountId'] as const;

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

async function report(db: Db): Promise<number> {
    const accounts = db.collection('accounts');
    const total = await accounts.countDocuments();
    console.log(`\n${total} account document(s)`);

    let affected = 0;

    for (const field of TOKEN_FIELDS) {
        // countDocuments, never a projection: a count cannot leak a credential.
        const count = await accounts.countDocuments({ [field]: { $exists: true } });
        if (count > 0) {
            affected += count;
            console.log(`  ${field}: present on ${count} document(s)`);
        }
    }

    if (affected === 0) {
        console.log('  no stored provider credentials found');
    }

    return affected;
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
        console.log(`Clearing: ${TOKEN_FIELDS.join(', ')}`);
        console.log(`Keeping:  ${IDENTITY_FIELDS.join(', ')}`);

        if (apply && confirm !== db.databaseName) {
            throw new Error(
                `Refusing to apply: pass --confirm=${db.databaseName} to name the database being changed`,
            );
        }

        const affected = await report(db);

        if (!apply) {
            console.log(affected > 0
                ? '\n✅ Dry run complete — re-run with --apply --confirm=<database> to clear these'
                : '\n✅ Dry run complete — nothing to clear');
            return;
        }

        const unset = Object.fromEntries(TOKEN_FIELDS.map(field => [field, '']));
        const result = await db.collection('accounts').updateMany(
            { $or: TOKEN_FIELDS.map(field => ({ [field]: { $exists: true } })) },
            { $unset: unset },
        );

        console.log(`\n✅ Cleared provider credentials from ${result.modifiedCount} document(s)`);
    } finally {
        await client.close();
    }
}

main().catch((error: unknown) => {
    console.error('❌ Failed:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});

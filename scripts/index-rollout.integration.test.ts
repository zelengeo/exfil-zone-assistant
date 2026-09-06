import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { MongoClient, type Db } from 'mongodb';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { assertLocalMongoUri } from './local-mongodb';

const execFileAsync = promisify(execFile);

function localUri(): string | undefined {
    const uri = process.env.MONGODB_URI;
    if (!uri) return;
    try {
        assertLocalMongoUri(uri);
        return uri;
    } catch {
        return;
    }
}

const uri = localUri();

// The real CLI imports models before connecting. Testing previewIndexes with fake models cannot
// catch writes caused by Mongoose initialization. Every case owns a disposable loopback database.
describe.skipIf(!uri)('index rollout CLI against a replica set', () => {
    let client: MongoClient;
    let db: Db;
    let targetUri: string;

    beforeAll(async () => {
        client = new MongoClient(uri!);
        await client.connect();
    });

    beforeEach(() => {
        const target = new URL(uri!);
        const databaseName = `index_rollout_test_${randomUUID().replaceAll('-', '')}`;
        target.pathname = `/${databaseName}`;
        targetUri = target.toString();
        db = client.db(databaseName);
    });

    afterEach(async () => {
        await db.dropDatabase();
    });

    afterAll(async () => {
        await client?.close();
    });

    async function runCli(...args: string[]): Promise<string> {
        const { stdout } = await execFileAsync(process.execPath, [
            resolve('node_modules/tsx/dist/cli.mjs'),
            resolve('scripts/sync-mongodb-indexes.ts'),
            ...args,
        ], {
            env: { ...process.env, MONGODB_URI: targetUri },
            timeout: 20_000,
        });
        return stdout;
    }

    async function snapshot() {
        const collections = await db.listCollections({}, { nameOnly: true }).toArray();
        return Promise.all(collections.sort((a, b) => a.name.localeCompare(b.name)).map(async ({ name }) => ({
            name,
            indexes: await db.collection(name).indexes(),
            documents: await db.collection(name).find().sort({ _id: 1 }).toArray(),
        })));
    }

    it('does not create collections while previewing a fresh database', async () => {
        const output = await runCli();
        expect(output).toContain('+ create');
        expect(await snapshot()).toEqual([]);
    }, 30_000);

    it('leaves documents and missing/stale indexes untouched across repeated previews', async () => {
        for (const name of ['users', 'accounts', 'feedbacks']) {
            await db.createCollection(name);
        }
        await db.collection('users').insertOne({ email: 'preview@example.test', username: 'preview' });
        await db.collection('users').createIndex({ legacy: 1 });
        const before = await snapshot();

        // Initialization used to race CLI shutdown: it could silently build indexes on a later
        // invocation even if the first preview happened to disconnect before creating them.
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const output = await runCli();
            expect(output).toContain('DROP   legacy_1');
            expect(await snapshot()).toEqual(before);
        }
    }, 60_000);

    it('still creates required indexes and drops stale ones only with --apply', async () => {
        await db.collection('users').insertOne({ email: 'apply@example.test', username: 'apply' });
        await db.collection('users').createIndex({ legacy: 1 });

        expect(await runCli('--apply')).toContain('Index rollout complete');
        const userIndexes = await db.collection('users').indexes();
        expect(userIndexes).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'email_1', unique: true }),
            expect.objectContaining({ name: 'username_1', unique: true }),
        ]));
        expect(userIndexes.some(index => index.name === 'legacy_1')).toBe(false);
        expect(await db.collection('accounts').indexes()).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'provider_1_providerAccountId_1', unique: true }),
        ]));
        const before = await snapshot();
        expect(await runCli()).toContain('no changes pending');
        expect(await snapshot()).toEqual(before);
    }, 40_000);
});

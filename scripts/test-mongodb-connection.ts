import { randomUUID } from 'node:crypto';

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function testConnection() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI is not set');
    }

    const client = new MongoClient(uri);
    const checkTransactions = process.argv.includes('--transaction');

    try {
        console.log('🔄 Connecting to the configured MongoDB database...');
        await client.connect();
        const db = client.db();
        await db.command({ ping: 1 });
        console.log(`✅ Connected to database "${db.databaseName}"`);

        if (checkTransactions) {
            const hello = await db.command({ hello: 1 });
            const setName = typeof hello.setName === 'string' ? hello.setName : undefined;
            const isWritablePrimary = hello.isWritablePrimary === true;

            if (setName !== 'rs0' || !isWritablePrimary) {
                throw new Error('Local MongoDB is not a writable member of replica set "rs0"');
            }

            const collectionName = `__local_validation_${randomUUID().replaceAll('-', '')}`;
            const collection = db.collection(collectionName);
            const session = client.startSession();

            try {
                await db.createCollection(collectionName);
                await session.withTransaction(async () => {
                    const marker = randomUUID();
                    await collection.insertOne({ marker }, { session });
                    const stored = await collection.findOne({ marker }, { session });
                    if (!stored) throw new Error('Transaction write was not readable');
                    await collection.deleteOne({ marker }, { session });
                });
            } finally {
                await session.endSession();
                await collection.drop().catch(() => undefined);
            }

            console.log('✅ Replica-set transaction committed successfully');
        }
    } finally {
        await client.close();
    }
}

testConnection().catch((error: unknown) => {
    console.error('❌ MongoDB check failed:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});

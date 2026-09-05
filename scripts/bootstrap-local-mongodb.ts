import { config } from 'dotenv';
import mongoose from 'mongoose';

import { Account } from '../src/models/Account';
import { DataCorrection } from '../src/models/DataCorrection';
import { Feedback } from '../src/models/Feedback';
import { User } from '../src/models/User';
import { assertLocalMongoUri } from './local-mongodb';

config({ path: '.env.local' });

async function bootstrapLocalMongoDB(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');

    assertLocalMongoUri(uri);

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });

        await User.createIndexes();
        await Account.createIndexes();
        await Feedback.createIndexes();
        await DataCorrection.createIndexes();

        const userIndexes = await User.collection.indexes();
        const accountIndexes = await Account.collection.indexes();
        const hasUniqueUserEmail = userIndexes.some(index => index.name === 'email_1' && index.unique);
        const hasUniqueUsername = userIndexes.some(index => index.name === 'username_1' && index.unique);
        const hasUniqueProviderIdentity = accountIndexes.some(index => (
            index.name === 'provider_1_providerAccountId_1' && index.unique
        ));

        if (!hasUniqueUserEmail || !hasUniqueUsername || !hasUniqueProviderIdentity) {
            throw new Error('Required identity indexes were not created');
        }

        console.log('✅ Local MongoDB collections and indexes are ready');
    } finally {
        await mongoose.disconnect();
    }
}

bootstrapLocalMongoDB().catch((error: unknown) => {
    console.error('❌ Local MongoDB bootstrap failed:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});

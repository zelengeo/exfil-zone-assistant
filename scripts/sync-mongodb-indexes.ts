// scripts/sync-mongodb-indexes.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import all your models to register their schemas and indexes
import '../src/models/User';
import '../src/models/Account';
import '../src/models/Session';
import '../src/models/Feedback';
import '../src/models/DataCorrection';
// Import other models as needed


async function syncIndexes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected to MongoDB Atlas');

        // Force Mongoose to build indexes (important for production)
        await mongoose.connection.syncIndexes();
        console.log('✅ Global index sync initiated');

        // Get all registered models
        const modelNames = mongoose.modelNames();
        console.log(`\n📋 Found ${modelNames.length} models to sync:`, modelNames);

        for (const modelName of modelNames) {
            const model = mongoose.model(modelName);
            console.log(`\n🔄 Syncing indexes for ${modelName}...`);

            try {
                // First, ensure the collection exists
                const db = mongoose.connection.db;
                if (!db) {
                    throw new Error('Database connection not available');
                }
                const collections = await db.listCollections({ name: model.collection.name }).toArray();
                if (collections.length === 0) {
                    await db.createCollection(model.collection.name);
                    console.log(`📁 Created collection: ${model.collection.name}`);
                }

                // Force index creation - this is more reliable than syncIndexes for unique constraints
                await model.createIndexes();
                console.log(`✅ Indexes created for ${modelName}`);

                // Now sync to ensure they match the schema
                await model.syncIndexes();

                // List current indexes
                const indexes = await model.collection.getIndexes();
                console.log(`✅ ${modelName} indexes synced. Current indexes:`);
                Object.entries(indexes).forEach(([name, spec]) => {
                    console.log(`   - ${name}:`, spec);
                });
            } catch (error) {
                console.error(`❌ Error syncing ${modelName} indexes:`, (error as Error).message);
            }
        }

        // Verify unique constraints from schema
        console.log('\n🔍 Verifying unique constraints...');
        const User = mongoose.model('User');
        // Use indexes() rather than getIndexes(): the latter returns the compact
        // form, which omits index options such as `unique`.
        const userIndexes = await User.collection.indexes();

        const emailIndex = userIndexes.find((index) => index.name === 'email_1');
        if (emailIndex?.unique) {
            console.log('✅ Email unique constraint is active');
        } else {
            console.log('⚠️  Email unique constraint missing!');
        }

        const usernameIndex = userIndexes.find((index) => index.name === 'username_1');
        if (usernameIndex?.unique) {
            console.log('✅ Username unique constraint is active');
        } else {
            console.log('⚠️  Username unique constraint missing!');
        }

        console.log('\n✨ Index synchronization complete!');

    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔒 Disconnected from MongoDB');
    }
}
// Run the sync
syncIndexes();


//
// async function createIndexes() {
//     try {
//         await mongoose.connect(process.env.MONGODB_URI!);
//         console.log('Connected to MongoDB');
//
//         // Drop existing indexes except _id and unique constraints
//         console.log('Analyzing existing indexes...');
//
//         // Create all indexes
//         console.log('Creating User indexes...');
//         await User.createIndexes();
//
//         console.log('Creating Feedback indexes...');
//         await Feedback.createIndexes();
//
//         console.log('Creating DataCorrection indexes...');
//         await DataCorrection.createIndexes();
//
//         console.log('Creating Account indexes...');
//         await Account.createIndexes();
//
//         // List all indexes for verification
//         const collections = ['users', 'feedbacks', 'datacorrections', 'accounts'];
//         for (const collection of collections) {
//             const indexes = await mongoose.connection.db
//                 .collection(collection)
//                 .listIndexes()
//                 .toArray();
//             console.log(`\nIndexes for ${collection}:`, indexes.map(idx => idx.name));
//         }
//
//         console.log('\n✅ All indexes created successfully!');
//
//     } catch (error) {
//         console.error('Error creating indexes:', error);
//     } finally {
//         await mongoose.disconnect();
//     }
// }
// createIndexes();
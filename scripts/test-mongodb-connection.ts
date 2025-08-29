// scripts/test-mongodb-connection.js
import {MongoClient} from 'mongodb';
import {config} from "dotenv";

config({ path: '.env.local' });

async function testConnection() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ MONGODB_URI not found in environment variables');
        return;
    }

    const client = new MongoClient(uri);

    try {
        console.log('🔄 Attempting to connect to MongoDB Atlas...');
        await client.connect();
        console.log('✅ Successfully connected to MongoDB Atlas!');

        // Test database access
        const db = client.db('exfil-zone-assistant');
        const collections = await db.listCollections().toArray();
        console.log('📁 Collections:', collections.map(c => c.name));

        // Ping the database
        await db.admin().ping();
        console.log('✅ Database ping successful!');

    } catch (error) {
        console.error('❌ Connection failed:', error instanceof Error ? error.message : String(error));
    } finally {
        await client.close();
        console.log('🔒 Connection closed');
    }
}

testConnection();
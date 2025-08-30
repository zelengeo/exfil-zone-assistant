// src/lib/mongodb.ts
import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const mongoClientOptions = {
    // Server API Version for production stability
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    
    // Connection Pool Settings
    maxPoolSize: 10,              // Maximum number of connections in the pool
    minPoolSize: 2,               // Minimum number of connections to maintain
    maxIdleTimeMS: 10000,         // Close idle connections after 10 seconds

    // Timeout Settings
    serverSelectionTimeoutMS: 5000,  // How long to try to connect before timing out
    connectTimeoutMS: 10000,         // TCP connection timeout
    socketTimeoutMS: 0,              // 0 = no timeout (let Next.js handle request timeouts)
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development, use global variable to preserve client across hot reloads
// In production, create a single instance
if (process.env.NODE_ENV === 'development') {
    // Preserve the client across module reloads in development
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, mongoClientOptions);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production, create a single client instance
    client = new MongoClient(uri, mongoClientOptions);
    clientPromise = client.connect();
}

// Mongoose uses its own connection pool, separate from MongoClient
const mongooseOptions = {
    // Connection Pool - CRITICAL FOR VERCEL
    maxPoolSize: 1,
    minPoolSize: 0,

    // Timeout Settings
    serverSelectionTimeoutMS: 10000,  // Increase from 5000 to 10000
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,           // Change from 0 to 45000

    // Mongoose-specific Options
    bufferCommands: false,
    autoIndex: false,
};

// Global variable to track if Mongoose is connecting/connected
let isConnecting = false;

export async function connectDB() {
    // If already connected, return immediately
    if (mongoose.connection.readyState === 1) {
        return;
    }

    // If already connecting, wait for it
    if (isConnecting) {
        // Wait for connection to complete
        await new Promise<void>((resolve) => {
            const checkConnection = setInterval(() => {
                if (mongoose.connection.readyState === 1) {
                    clearInterval(checkConnection);
                    resolve();
                }
            }, 100);
        });
        return;
    }

    try {
        isConnecting = true;

        // Configure Mongoose settings
        mongoose.set('strictQuery', true); 

        // Set up connection event handlers BEFORE connecting
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
            isConnecting = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected');
            isConnecting = false;
        });

        // Connect to MongoDB
        await mongoose.connect(uri, mongooseOptions);

    } catch (error) {
        console.error('MongoDB connection error:', error);
        isConnecting = false;
        throw error;
    } finally {
        isConnecting = false;
    }
}

/**
 * Check if database is connected and healthy
 */
export async function isDatabaseConnected(): Promise<boolean> {
    try {
        if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
            return false;
        }
        // Ping to ensure connection is actually working
        await mongoose.connection.db.admin().ping();
        return true;
    } catch {
        return false;
    }
}

/**
 * Gracefully close database connections
 */
export async function disconnectDB(): Promise<void> {
    try {
        await mongoose.connection.close();
        // Also close the MongoClient used by NextAuth
        const resolvedClient = await clientPromise;
        await resolvedClient.close();
        console.log('All MongoDB connections closed');
    } catch (error) {
        console.error('Error closing MongoDB connections:', error);
    }
}

// Default export for NextAuth
export default clientPromise;

// Named exports for your application
export { mongoose };
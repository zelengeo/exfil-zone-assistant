// src/lib/mongodb.ts
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const mongooseOptions = {
    maxPoolSize: 10,              // Should match expected concurrent operations
    minPoolSize: 2,               // Maintain minimum connections for fast queries

    // Timeout Settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 0,

    // Mongoose-specific Options
    bufferCommands: false,
    autoIndex: false,
};

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

let connectionPromise: Promise<void> | null = null;

export function connectDB(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve();
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(uri, mongooseOptions)
            .then(() => undefined)
            .finally(() => {
                connectionPromise = null;
            });
    }

    return connectionPromise;
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
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connections:', error);
    }
}

// Named exports for your application
export { mongoose };

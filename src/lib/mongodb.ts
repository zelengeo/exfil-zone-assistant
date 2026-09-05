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

        // In production, implement reconnection logic
        if (process.env.NODE_ENV === 'production') {
            mongoose.connection.on('disconnected', () => {
                console.log('Mongoose disconnected. Attempting to reconnect...');
                setTimeout(() => {
                    mongoose.connect(uri, mongooseOptions).catch(console.error);
                }, 5000);
            });
        }

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
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connections:', error);
    }
}

// Named exports for your application
export { mongoose };

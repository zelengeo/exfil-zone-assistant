// models/User.ts
import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    // Authentication
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, sparse: true },
    name: String,
    image: String, // Avatar URL from OAuth provider

    // OAuth connections
    accounts: [{
        provider: { type: String },
        providerAccountId: { type: String },
        type: { type: String },
        access_token: String,
        token_type: String,
        scope: String,
        id_token: String,
        session_state: String,
    }],

    // Profile
    bio: { type: String, maxLength: 500 },
    location: {
        type: String,
        enum: ['eu','na'],
        default: 'na'
    },

    vrHeadset: {
        type: String,
        enum: ['quest2', 'quest3', 'pico4', 'index', 'vive', 'bigscreen', 'other', null],
        default: null
    },

    // Contribution Stats
    stats: {
        feedbackSubmitted: { type: Number, default: 0 },
        bugsReported: { type: Number, default: 0 },
        featuresProposed: { type: Number, default: 0 },
        dataCorrections: { type: Number, default: 0 },
        correctionsAccepted: { type: Number, default: 0 },
        contributionPoints: { type: Number, default: 0 },
    },

    // Gamification
    level: { type: Number, default: 1 },
    rank: {
        type: String,
        enum: ['recruit', 'soldier', 'specialist', 'veteran', 'elite'],
        default: 'recruit'
    },
    badges: [{
        id: String,
        name: String,
        description: String,
        earnedAt: { type: Date, default: Date.now },
    }],

    // Permissions
    roles: [{
        type: String,
        enum: ['user', 'contributor', 'moderator', 'admin'],
    }],

    // Preferences
    preferences: {
        emailNotifications: { type: Boolean, default: true },
        publicProfile: { type: Boolean, default: true },
        showContributions: { type: Boolean, default: true },
    },

    // Metadata
    emailVerified: Date,
    createdAt: { type: Date, default: Date.now },
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: String,
});

// Ensure we don't re-compile the model
export const User = models.User || model('User', UserSchema);
// models/User.ts
import { Schema, model, models } from 'mongoose';
import {vrHeadsetEnum, locationEnum, rankEnum, rolesEnum} from "@/lib/schemas/user";

const UserSchema = new Schema({
    // Authentication
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, sparse: true },
    displayName: String,
    image: String,

    // Profile
    bio: { type: String, maxLength: 500 },
    location: {
        type: String,
        enum: locationEnum,
        default: 'na'
    },
    vrHeadset: {
        type: String,
        enum: vrHeadsetEnum,
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
        enum: rankEnum,
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
        enum: rolesEnum,
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


// UserSchema.virtual('displayName').get(function() {
//     return this.username || this.name || this.email.split('@')[0];
// });
//
// UserSchema.path('email').validate({
//     validator: function(email: string) {
//         return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//     },
//     message: 'Invalid email format'
// });

// Ensure we don't re-compile the model
export const User = models.User || model('User', UserSchema);
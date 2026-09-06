// models/User.ts
import { Schema, model, models } from 'mongoose';
import {vrHeadsetEnum, locationEnum, rankEnum, rolesEnum} from "@/lib/schemas/user";

const UserSchema = new Schema({
    // Authentication
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, sparse: true },
    displayName: String,
    avatarUrl: String,

    // Profile
    bio: { type: String, maxLength: 500 },
    location: {
        type: String,
        enum: locationEnum,
        default: 'us_west'
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


// There are deliberately no _id-prefixed compound indexes here. An equality match on _id resolves
// through IDHACK against the default _id_ index and returns at most one document, so a compound
// index starting with _id is never a candidate — explain on the auth query shape
// (`findById().select('isBanned roles username')`) reports IDHACK with 0 rejected plans and 1 key
// examined. The three that used to sit here cost writes and storage for nothing, and the one
// labelled "covering" could not cover: it omitted `username`, which every auth gate selects.
UserSchema.index({ 'stats.contributionPoints': -1 }); // For leaderboards
UserSchema.index({ createdAt: -1 }); // For sorting new users
UserSchema.index({ lastLoginAt: -1 }); // For tracking active users

// Add text index for search
// UserSchema.index({
//     username: 'text',
//     displayName: 'text',
// }, {
//     weights: {
//         username: 10,
//         displayName: 5,
//     }
// });


// Ensure we don't re-compile the model
export const User = models.User || model('User', UserSchema);
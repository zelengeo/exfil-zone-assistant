// models/Account.ts
import { Schema, model, models } from 'mongoose';

const AccountSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    providerAccountId: {
        type: String,
        required: true
    },
    refresh_token: String,
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
    session_state: String,
    // Discord specific
    oauth_token_secret: String,
    oauth_token: String,
});

// Compound index for provider + providerAccountId (required by NextAuth)
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
AccountSchema.index({ userId: 1 }); // For finding all accounts for a user

export const Account = models.Account || model('Account', AccountSchema);
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
    // No token fields. This record exists to answer "which user is this provider identity?", and
    // nothing else. Provider credentials were declared and written here until 2026-09-06 (audit
    // B16) with no reader anywhere in the app; `npm run db:strip-oauth-tokens` clears them from
    // rows written before that. Do not re-add one without a consumer to point at.
});

// Compound index for provider + providerAccountId (required by NextAuth)
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
AccountSchema.index({ userId: 1 }); // For finding all accounts for a user

export const Account = models.Account || model('Account', AccountSchema);
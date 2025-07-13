// src/models/Feedback.ts
import { Schema, model, models } from 'mongoose';

const FeedbackSchema = new Schema({
    type: {
        type: String,
        enum: ['bug', 'feature', 'data_correction', "general"],
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'in_review', 'accepted', 'rejected', 'implemented', 'duplicate'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    title: { type: String, required: true, maxLength: 200 },
    description: { type: String, required: true, maxLength: 5000 },
    category: {
        type: String,
        enum: ['items', 'tasks', 'hideout', 'combat-sim', 'guides', 'ui', 'other']
    },

    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    isAnonymous: { type: Boolean, default: false },
    sessionId: String,

    screenshots: [String],
    pageUrl: String,
    userAgent: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const Feedback = models.Feedback || model('Feedback', FeedbackSchema);
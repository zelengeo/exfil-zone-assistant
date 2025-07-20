// src/models/Feedback.ts
import {Schema, model, models} from 'mongoose';
import {categoryEnum, priorityEnum, statusEnum, typeEnum} from "@/lib/schemas/feedback";

const FeedbackSchema = new Schema({
    type: {
        type: String,
        enum: typeEnum,
        required: true
    },
    status: {
        type: String,
        enum: statusEnum,
        default: 'new'
    },
    priority: {
        type: String,
        enum: priorityEnum,
        default: 'medium'
    },

    title: {type: String, required: true, maxLength: 200},
    description: {type: String, required: true, maxLength: 5000},
    reviewerNotes: [{
        note: {type: String, required: true, maxLength: 5000},
        timestamp: { type: Date, default: Date.now },
        addedByUserId: {type: Schema.Types.ObjectId, ref: 'User'}
    }],

    category: {
        type: String,
        enum: categoryEnum
    },

    userId: {type: Schema.Types.ObjectId, ref: 'User'},

    screenshots: [String],
    pageUrl: String,
    userAgent: String,

    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

// For listing and filtering feedback
FeedbackSchema.index({ status: 1, priority: -1, createdAt: -1 }); // Admin queue
FeedbackSchema.index({ type: 1, status: 1, createdAt: -1 }); // Type filtering
FeedbackSchema.index({ userId: 1, createdAt: -1 }); // User's feedback history

// For admin dashboard stats
FeedbackSchema.index({ status: 1, type: 1 }); // Stats aggregation
FeedbackSchema.index({ createdAt: -1 }); // Recent feedback
FeedbackSchema.index({ reviewedBy: 1, reviewedAt: -1 }); // Admin activity

// Update timestamp on save
FeedbackSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const Feedback = models.Feedback || model('Feedback', FeedbackSchema);
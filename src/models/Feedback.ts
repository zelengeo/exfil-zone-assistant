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
FeedbackSchema.index({ status: 1, priority: -1, createdAt: -1 }); // Keep this
FeedbackSchema.index({ type: 1, status: 1 }); // Remove createdAt for better selectivity
FeedbackSchema.index({ userId: 1, type: 1, createdAt: -1 }); // Better for user history by type
FeedbackSchema.index({ createdAt: -1, status: 1 }); // For recent feedback by status
FeedbackSchema.index({ reviewedBy: 1, reviewedAt: -1 }, { sparse: true }); // Sparse for null values
FeedbackSchema.index({
    category: 1,
    type: 1,
    status: 1,
    priority: -1
}); // For category-based filtering

// Update timestamp on save
FeedbackSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const Feedback = models.Feedback || model('Feedback', FeedbackSchema);
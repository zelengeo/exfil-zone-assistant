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
    reviewerNotes: {type: String, required: true, maxLength: 5000},
    category: {
        type: String,
        enum: categoryEnum
    },

    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    isAnonymous: {type: Boolean, default: false},
    sessionId: String,

    screenshots: [String],
    pageUrl: String,
    userAgent: String,

    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

export const Feedback = models.Feedback || model('Feedback', FeedbackSchema);
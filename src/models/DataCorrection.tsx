// src/models/DataCorrection.ts
import { Schema, model, models } from 'mongoose';
import { entityTypeEnum, correctionStatusEnum } from "@/lib/schemas/dataCorrection";

const DataCorrectionSchema = new Schema({
    entityType: {
        type: String,
        enum: entityTypeEnum,
        required: true,
        index: true
    },
    entityId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    status: {
        type: String,
        enum: correctionStatusEnum,
        default: 'pending',
        index: true
    },

    // Store current data snapshot
    currentData: {
        type: Schema.Types.Mixed,
        required: true
    },

    // Store proposed changes
    proposedData: {
        type: Schema.Types.Mixed,
        required: true
    },

    reason: {
        type: String,
        required: true,
        maxLength: 1000
    },

    // Review metadata
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: {
        type: String,
        maxLength: 500
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient querying
DataCorrectionSchema.index({ entityType: 1, entityId: 1 });
DataCorrectionSchema.index({ status: 1, createdAt: -1 });
DataCorrectionSchema.index({ userId: 1, createdAt: -1 });

// Update timestamp on save
DataCorrectionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const DataCorrection = models.DataCorrection || model('DataCorrection', DataCorrectionSchema);
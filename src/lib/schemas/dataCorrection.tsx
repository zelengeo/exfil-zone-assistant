// src/lib/schemas/dataCorrection.ts
import { z } from 'zod';
import { Types } from "mongoose";

// Entity types that can have corrections
export const entityTypeEnum = ['item', 'task', 'npc', 'location', 'quest'] as const;
export const correctionStatusEnum = ['pending', 'approved', 'rejected', 'implemented'] as const;

// Base correction schema
export const dataCorrectionBaseSchema = z.object({
    entityType: z.enum(entityTypeEnum),
    entityId: z.string().min(1),
    userId: z.string().optional(), // Optional for anonymous submissions

    status: z.enum(correctionStatusEnum).default('pending'),

    // Proposed changes
    proposedData: z.record(z.any()),

    // Changes will be computed on-the-fly, not stored

    // User's explanation
    reason: z.string().min(10).max(1000),

    // Review metadata
    reviewedBy: z.string().optional(),
    reviewedAt: z.date().optional(),
    reviewNotes: z.string().max(500).optional(),

    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

// Document schema with _id
export const dataCorrectionDocumentSchema = dataCorrectionBaseSchema.extend({
    _id: z.union([
        z.string(),
        z.instanceof(Types.ObjectId),
    ]),
});

// Submission schemas for different entity types
export const itemCorrectionSchema = z.object({
    entityId: z.string(),
    proposedData: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        tips: z.string().optional(),
        stats: z.record(z.any()).optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for correction"
    }),
    reason: z.string().min(10).max(1000),
});

export const taskCorrectionSchema = z.object({
    entityId: z.string(),
    currentData: z.object({
        name: z.string(),
        description: z.string(),
        objectives: z.array(z.string()).optional(),
        reward: z.array(z.any()).optional(),
        requiredLevel: z.number().optional(),
    }),
    proposedData: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        objectives: z.array(z.string()).optional(),
        reward: z.array(z.any()).optional(),
        requiredLevel: z.number().optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for correction"
    }),
    reason: z.string().min(10).max(1000),
});

// API submission schema
export const dataCorrectionSubmitSchema = z.object({
    entityType: z.enum(entityTypeEnum),
    entityId: z.string(),
    currentData: z.record(z.any()),
    proposedData: z.record(z.any()),
    reason: z.string().min(10).max(1000),
});

// Admin review schema
export const dataCorrectionReviewSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    reviewNotes: z.string().max(500).optional(),
});

// Type exports
export type EntityType = (typeof entityTypeEnum)[number];
export type CorrectionStatus = (typeof correctionStatusEnum)[number];
export type DataCorrectionSubmit = z.infer<typeof dataCorrectionSubmitSchema>;
export type DataCorrectionReview = z.infer<typeof dataCorrectionReviewSchema>;
export type ItemCorrection = z.infer<typeof itemCorrectionSchema>;
export type TaskCorrection = z.infer<typeof taskCorrectionSchema>;
export type IDataCorrection = z.infer<typeof dataCorrectionDocumentSchema>;
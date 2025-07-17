// src/lib/schemas/dataCorrection.ts
import {z} from 'zod';
import {Types} from "mongoose";
import {taskSchema} from "@/lib/schemas/task";

// Entity types that can have corrections
export const entityTypeEnum = ['item', 'task', 'npc', 'location', 'quest'] as const;
export const correctionStatusEnum = ['pending', 'approved', 'rejected', 'implemented'] as const;
export const rarityEnum = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', "Ultimate"] as const;
export const taskTypesEnum = ['reach', 'extract', 'retrieve', 'eliminate', 'submit', 'mark', 'place', 'photo'] as const;
export const taskMapsEnum = ['suburb', 'resort', 'dam', 'metro', 'any'] as const;

// Base correction schema
export const dataCorrectionBaseSchema = z.object({
    entityType: z.enum(entityTypeEnum),
    entityId: z.string().min(1),
    userId: z.string().optional(), // Optional for anonymous submissions

    status: z.enum(correctionStatusEnum).default('pending'),

    // Proposed changes
    proposedData: z.object({}).catchall(z.any()),

    // User's explanation
    reason: z.string().min(10).max(1000).optional(),

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
    entityId: dataCorrectionBaseSchema.shape.entityId,
    proposedData: z.object({
        name: z.string().min(1).max(50).optional(),
        description: z.string().max(500).optional(),
        tips: z.string().max(500).optional(),
        stats: z.object({
            price: z.number().optional(),
            weight: z.number().optional(),
            rarity: z.enum(rarityEnum).optional(),
        }).catchall(z.any()).optional(), // Allow any structure for stats
    }).refine(data => Object.keys(data).some(key => data[key as keyof typeof data] !== undefined), {
        message: "At least one field must be provided for correction"
    }),
    reason: dataCorrectionBaseSchema.shape.reason,
});

export const taskCorrectionSchema = z.object({
    entityId: dataCorrectionBaseSchema.shape.entityId,
    proposedData: taskSchema.omit({
        id: true,
        gameId: true,
        order: true,
        corpId: true
    }).partial().refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for correction"
    }),
    reason: dataCorrectionBaseSchema.shape.reason,
});

// API submission schema
export const dataCorrectionSubmitSchema = z.object({
    entityType: dataCorrectionBaseSchema.shape.entityType,
    entityId: dataCorrectionBaseSchema.shape.entityId,
    proposedData: z.union([taskCorrectionSchema.shape.proposedData, itemCorrectionSchema.shape.proposedData]),
    reason: dataCorrectionBaseSchema.shape.reason,
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
export type ItemCorrectionProposedData = z.infer<typeof itemCorrectionSchema.shape.proposedData>;
export type TaskCorrection = z.infer<typeof taskCorrectionSchema>;
export type IDataCorrection = z.infer<typeof dataCorrectionDocumentSchema>;
// src/lib/schemas/dataCorrection.ts
import {z} from 'zod';
import {Types} from "mongoose";
import { taskSchema } from "@/lib/schemas/task";
import {paginationSchema, successSchema} from "@/lib/schemas/core";

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
const dataCorrectionSubmitSchema = z.object({
    entityType: dataCorrectionBaseSchema.shape.entityType,
    entityId: dataCorrectionBaseSchema.shape.entityId,
    proposedData: z.union([taskCorrectionSchema.shape.proposedData, itemCorrectionSchema.shape.proposedData]),
    reason: dataCorrectionBaseSchema.shape.reason,
});

// Admin review schema
const dataCorrectionReviewSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    reviewNotes: z.string().max(500).optional(),
});

// Schemas for populated fields from User model
export const populatedUserSchema = z.object({
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().optional(),
    email: z.email().optional(),
});

export const populatedReviewerSchema = z.object({
    username: z.string(),
    displayName: z.string(),
});

// Populated data correction schema
export const dataCorrectionAdminGetSchema = dataCorrectionDocumentSchema.extend({
    userId: populatedUserSchema.nullable().optional(),
    reviewedBy: populatedReviewerSchema.nullable().optional(),
})


export const dataCorrectionAdminGetRelatedSchema = dataCorrectionDocumentSchema.pick({
    status: true,
    createdAt: true,
}).extend({userId: populatedUserSchema.pick({username: true}) })



export const dataCorrectionGetSchema = dataCorrectionDocumentSchema.extend({
    reviewedBy: populatedReviewerSchema.nullable().optional(),
}).omit({reviewNotes: true})


// Schemas for /api/admin/corrections
const adminCorrectionsGetSchema = z.object({
    corrections: z.array(dataCorrectionAdminGetSchema),
    pagination: paginationSchema,
    stats: z.object({
        total: z.number(),
        byStatus: z.record(z.string(), z.number()),
    }),
});

// Schemas for /api/admin/corrections/[id]
const adminCorrectionIdGetSchema = z.object({
    correction: dataCorrectionAdminGetSchema,
    relatedCorrections: z.array(dataCorrectionAdminGetRelatedSchema),
});

const adminCorrectionIdPatchSchema = z.object({
    success: z.literal(true),
    correction: z.object({
        id: z.string(),
        status: z.string(),
        reviewedAt: z.date(),
    }),
});

// Schemas for /api/corrections
const correctionsGetSchema = z.object({
    corrections: z.array(dataCorrectionGetSchema),
    pagination: paginationSchema,
});

const correctionsPostSchema = z.object({
    success: z.literal(true),
    correction: z.object({
        id: z.string(),
        status: z.string(),
    }),
});

// Schemas for /api/corrections/[id]
const correctionIdGetSchema = z.object({
    correction: dataCorrectionGetSchema,
});

const adminCorrectionsGetRequestSchema = z.object({
    entityType: z.enum(entityTypeEnum).optional(),
    entityId: z.string().optional(),
    status: z.enum(correctionStatusEnum).optional(),
    userId: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

const correctionsGetRequestSchema = adminCorrectionsGetRequestSchema.pick({
    page: true,
    limit: true,
    status: true,
    entityType: true,
})



// --- Exported API Types ---
export const DataCorrectionApi = {
    Admin: {
        Get: {
            Request: adminCorrectionsGetRequestSchema,
            Response: adminCorrectionsGetSchema,
        },
        ById: {
            Get: { Response: adminCorrectionIdGetSchema },
            Patch: {
                Response: adminCorrectionIdPatchSchema,
                Request: dataCorrectionReviewSchema
            },
            Delete: { Response: successSchema },
        }
    },
    Get: {
        Request: correctionsGetRequestSchema,
        Response: correctionsGetSchema,
    },
    Post: {
        Request: dataCorrectionSubmitSchema,
        Response: correctionsPostSchema,
    },
    ById: {
        Get: { Response: correctionIdGetSchema },
        Delete: { Response: successSchema },
    }
};

export type IDataCorrectionApi = {
    Admin: {
        Get: {
            Response: z.infer<typeof DataCorrectionApi.Admin.Get.Response>,
        },
        ById: {
            Get: { Response: z.infer<typeof DataCorrectionApi.Admin.ById.Get.Response> };
            Patch: {
                Response: z.infer<typeof DataCorrectionApi.Admin.ById.Patch.Response>
                Request: z.infer<typeof DataCorrectionApi.Admin.ById.Patch.Request>
            };
            Delete: { Response: z.infer<typeof DataCorrectionApi.Admin.ById.Delete.Response> };
        }
    },
    Get: {
        Response: z.infer<typeof DataCorrectionApi.Get.Response>;
    },
    Post: {
        Response: z.infer<typeof DataCorrectionApi.Post.Response>;
    },
    ById: {
        Get: { Response: z.infer<typeof DataCorrectionApi.ById.Get.Response> };
        Delete: { Response: z.infer<typeof DataCorrectionApi.ById.Delete.Response> };
    }
};

// Type exports
export type EntityType = (typeof entityTypeEnum)[number];
export type CorrectionStatus = (typeof correctionStatusEnum)[number];
export type DataCorrectionSubmit = z.infer<typeof dataCorrectionSubmitSchema>;
export type DataCorrectionReview = z.infer<typeof dataCorrectionReviewSchema>;
export type ItemCorrection = z.infer<typeof itemCorrectionSchema>;
export type ItemCorrectionProposedData = z.infer<typeof itemCorrectionSchema.shape.proposedData>;
export type TaskCorrectionProposedData = z.infer<typeof taskCorrectionSchema.shape.proposedData>;
export type TaskCorrection = z.infer<typeof taskCorrectionSchema>;
export type IDataCorrection = z.infer<typeof dataCorrectionDocumentSchema>;
export type IDataCorrectionAdminGet = z.infer<typeof dataCorrectionAdminGetSchema>;
export type IDataCorrectionAdminGetRelated = z.infer<typeof dataCorrectionAdminGetRelatedSchema>;
export type IDataCorrectionGet = z.infer<typeof dataCorrectionGetSchema>;

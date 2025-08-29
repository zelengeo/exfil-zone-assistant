import {z} from 'zod';
import {Types} from "mongoose";
import {IUser} from "@/lib/schemas/user";
import {paginationSchema, successSchema} from "@/lib/schemas/core";

export const typeEnum = ['bug', 'feature', 'data_correction', "general"] as const;
export const statusEnum = ['new', 'in_review', 'accepted', 'rejected', 'implemented', 'duplicate'] as const;
export const priorityEnum = ['low', 'medium', 'high', 'critical'] as const;
export const categoryEnum = ['items', 'tasks', 'hideout', 'combat-sim', 'guides', 'ui', 'other'] as const;


export const reviewerNoteSchema = z.object({
    note: z.string().min(3).max(5000),
    timestamp: z.date().default(() => new Date()),
    addedByUserId: z.string(),
});

export const feedbackBaseSchema = z.object({
    type: z.enum(typeEnum),
    status: z.enum(statusEnum).default('new'),
    priority: z.enum(priorityEnum).default('medium'),

    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    reviewerNotes: z.array(reviewerNoteSchema).default([]), // Changed to array
    category: z.enum(categoryEnum).optional(),

    userId: z.string().optional(),

    screenshots: z.array(z.url()).max(5).default([]),
    pageUrl: z.url().optional(),
    userAgent: z.string().optional(),

    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

export const feedbackDocumentSchema = feedbackBaseSchema.extend({
    _id: z.union([
        z.string(), // When returned from API as string
        z.instanceof(Types.ObjectId), // When working with Mongoose directly
    ]),
});


// ===== VALIDATION SCHEMAS FOR API =====
export const feedbackSubmitSchema = feedbackBaseSchema.pick({
    type: true,
    title: true,
    description: true,
    category: true,
    screenshots: true,
    pageUrl: true,
    userAgent: true,
    priority: true,
});

// Feedback admin schemas
export const feedbackStatusUpdateSchema = feedbackBaseSchema.pick({
    status: true,
    reviewerNotes: true,
});


// Populated schemas
export const populatedUserSchema = z.object({
    username: z.string(),
});

export const populatedForAdminUserSchema = populatedUserSchema.extend({
    avatarUrl: z.string().optional(),
    email: z.email(),
});


export const feedbackWithUserSchema = feedbackDocumentSchema.extend({
    userId: populatedUserSchema.optional(),
});

export const feedbackWithUserForAdminSchema = feedbackDocumentSchema.extend({
    userId: populatedForAdminUserSchema.optional(),
});

// Admin update request
export const feedbackAdminUpdateSchema = z.object({
    status: z.enum(statusEnum).optional(),
    priority: z.enum(priorityEnum).optional(),
    reviewerNotes: z.object({
        note: reviewerNoteSchema.shape.note,
    }).optional(),
});

// API Response Schemas
const feedbackListResponseSchema = z.object({
    feedback: z.array(feedbackWithUserSchema),
    pagination: paginationSchema,
});

const feedbackListForAdminResponseSchema = z.object({
    feedback: z.array(feedbackWithUserForAdminSchema),
    pagination: paginationSchema,
});

const feedbackStatsSchema = z.object({
    total: z.number(),
    byStatus: z.record(z.string(), z.number()),
    byType: z.record(z.string(), z.number()),
    byPriority: z.record(z.string(), z.number()),
    recent: z.number(),
});

const feedbackSubmitResponseSchema = z.object({
    success: z.literal(true),
    feedbackId: z.string(),
    message: z.string(),
});

const feedbackDetailResponseSchema = z.object({
    feedback: feedbackWithUserSchema,
});

// Request Schemas
const feedbackListRequestSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum(statusEnum).optional(),
    type: z.enum(typeEnum).optional(),
    priority: z.enum(priorityEnum).optional(),
    userId: z.string().optional(),
});

// --- API Contract Definition ---
export const FeedbackApi = {
    // Regular endpoints
    List: {
        Request: feedbackListRequestSchema,
        Response: feedbackListResponseSchema,
    },
    Post: {
        Request: feedbackSubmitSchema,
        Response: feedbackSubmitResponseSchema,
    },

    // Admin endpoints
    Admin: {
        List: {
            Request: feedbackListRequestSchema,
            Response: feedbackListForAdminResponseSchema.extend({
                stats: feedbackStatsSchema.optional(),
            }),
        },
        ById: {
            Get: {
                Response: feedbackDetailResponseSchema,
            },
            Patch: {
                Request: feedbackAdminUpdateSchema,
                Response: feedbackDetailResponseSchema,
            },
            Delete: {
                Response: successSchema,
            },
        },
    },
};

// Type exports
export type IFeedbackApi = {
    List: {
        Request: z.infer<typeof FeedbackApi.List.Request>;
        Response: z.infer<typeof FeedbackApi.List.Response>;
    };
    Post: {
        Request: z.infer<typeof FeedbackApi.Post.Request>;
        Response: z.infer<typeof FeedbackApi.Post.Response>;
    };
    Admin: {
        List: {
            Request: z.infer<typeof FeedbackApi.Admin.List.Request>;
            Response: z.infer<typeof FeedbackApi.Admin.List.Response>;
        };
        ById: {
            Get: { Response: z.infer<typeof FeedbackApi.Admin.ById.Get.Response> };
            Patch: {
                Request: z.infer<typeof FeedbackApi.Admin.ById.Patch.Request>;
                Response: z.infer<typeof FeedbackApi.Admin.ById.Patch.Response>;
            };
            Delete: { Response: z.infer<typeof FeedbackApi.Admin.ById.Delete.Response> };
        };
    };
};

export type FeedbackSubmitInput = z.infer<typeof feedbackSubmitSchema>;
export type FeedbackStatusUpdateInput = z.infer<typeof feedbackStatusUpdateSchema>;

export type FeedbackType = (typeof typeEnum)[number];
export type FeedbackStatus = (typeof statusEnum)[number];
export type FeedbackPriority = (typeof priorityEnum)[number];
export type FeedbackCategory = (typeof categoryEnum)[number];

export type IFeedback = z.infer<typeof feedbackDocumentSchema>;
export type IFeedbackWithUsername = Omit<IFeedback, 'userId'> & {
    userId: {
        username: IUser['username'];
    };
};
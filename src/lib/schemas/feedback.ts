import {z} from 'zod';
import {Types} from "mongoose";

export const typeEnum = ['bug', 'feature', 'data_correction', "general"] as const;
export const statusEnum = ['new', 'in_review', 'accepted', 'rejected', 'implemented', 'duplicate'] as const;
export const priorityEnum = ['low', 'medium', 'high', 'critical'] as const;
export const categoryEnum = ['items', 'tasks', 'hideout', 'combat-sim', 'guides', 'ui', 'other'] as const;

// ===== FEEDBACK SCHEMA =====
export const feedbackBaseSchema = z.object({
    type: z.enum(typeEnum),
    status: z.enum(statusEnum).default('new'),
    priority: z.enum(priorityEnum).default('medium'),

    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    reviewerNotes: z.string().max(5000).optional(),
    category: z.enum(categoryEnum).optional(),

    userId: z.string().optional(), // Will be ObjectId in Mongoose

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



export type FeedbackSubmitInput = z.infer<typeof feedbackSubmitSchema>;
export type FeedbackStatusUpdateInput = z.infer<typeof feedbackStatusUpdateSchema>;

export type FeedbackType = (typeof typeEnum)[number];
export type FeedbackStatus = (typeof statusEnum)[number];
export type FeedbackPriority = (typeof priorityEnum)[number];
export type FeedbackCategory = (typeof categoryEnum)[number];

export type IFeedback = z.infer<typeof feedbackDocumentSchema>;
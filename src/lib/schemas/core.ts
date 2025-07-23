import {z} from "zod";

export const paginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
    hasNextPage: z.boolean().optional(),
    hasPrevPage: z.boolean().optional(),
});

export const successSchema = z.object({
    success: z.literal(true),
    message: z.string(),
});
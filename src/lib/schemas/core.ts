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

export const errorResponseSchema = z.object({
    error: z.object({
        message: z.string(),
        code: z.string().optional(),
        statusCode: z.number(),
        details: z.string().optional(),
    }),
    requestId: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Update API types to include error responses
export type ApiResponse<T> = T | ErrorResponse;


export function createSearchParams<T extends z.ZodType>(
    schema: T,
    params: z.input<T>
): URLSearchParams {
    // Validate input params. Type assertion needed because we know our schemas return objects
    const validated = schema.parse(params) as Record<string, unknown>;

    // Convert to URLSearchParams-compatible format
    const searchParams = new URLSearchParams();

    Object.entries(validated).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    return searchParams;
}
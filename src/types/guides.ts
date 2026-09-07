import { z } from 'zod';

export const guideMetadataSchema = z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    description: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1),
    relatedSlugs: z.array(z.string().min(1)).min(1).max(3),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    readTimeMinutes: z.number().int().positive(),
    author: z.string().min(1),
    publishedAt: z.iso.date(),
    updatedAt: z.iso.date(),
    featured: z.boolean(),
    ogImageUrl: z.string().startsWith('/').optional(),
});

export type GuideMetadata = z.infer<typeof guideMetadataSchema>;

export const guideTagSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    icon: z.string().min(1),
});

export type GuideTag = z.infer<typeof guideTagSchema>;

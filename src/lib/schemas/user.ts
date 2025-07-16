import {z} from 'zod';
import {Types} from "mongoose";

export const locationEnum = ['eu', 'na'] as const;
export const vrHeadsetEnum = ['quest2', 'quest3', 'pico4', 'index', 'vive', 'bigscreen', 'other'] as const;
export const rolesEnum = ['user', 'contributor', 'moderator', 'partner', 'admin'] as const;
export const rankEnum = ['recruit', 'soldier', 'specialist', 'veteran', 'elite'] as const;

// ===== USER SCHEMA =====
export const userBaseSchema = z.object({

    // Authentication
    email: z.email(),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens"),

    displayName: z.string()
        .min(3, "Display Name must be at least 3 characters")
        .max(20, "Display Name must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Display Name can only contain letters, numbers, underscores, and hyphens"),
    image: z.url().optional(), // Avatar URL from OAuth provider


    // Profile
    bio: z.string().max(500).optional(),
    location: z.enum(locationEnum).default("na"),
    vrHeadset: z.enum(vrHeadsetEnum).optional(),


    // Gamification
    level: z.number().default(1),
    rank: z.enum(rankEnum).default('recruit'),
    badges: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        earnedAt: z.date().default(() => new Date()),
    })).default([]),

    // Permissions
    roles: z.array(z.enum(rolesEnum)).default(['user']),

    // Contribution Stats
    stats: z.object({
        contributionPoints: z.number().default(0),
        feedbackSubmitted: z.number().default(0),
        bugsReported: z.number().default(0),
        featuresProposed: z.number().default(0),
        dataCorrections: z.number().default(0),
        correctionsAccepted: z.number().default(0),
    }),


    // Preferences
    preferences: z.object({
        emailNotifications: z.boolean().default(false),
        showContributions: z.boolean().default(true),
        publicProfile: z.boolean().default(true)
    }),


    // Metadata
    emailVerified: z.date(),
    createdAt: z.date().default(() => new Date()),
    lastLoginAt: z.date(),
    isActive: z.boolean().default(true),
    isBanned: z.boolean().default(false),
    banReason: z.string().optional(),
});

export const userDocumentSchema = userBaseSchema.extend({
    _id: z.union([
        z.string(), // When returned from API as string
        z.instanceof(Types.ObjectId), // When working with Mongoose directly
    ]),
});

export const userRoleUpdateSchema = z.object({
    action: z.enum(['add', 'remove']),
    role: z.enum(rolesEnum),
    reason: z.string().max(500).optional(),
});

export const userSettingsSchema = userBaseSchema.pick({
    username: true,
    displayName: true,
    bio: true,
    location: true,
    vrHeadset: true,
    preferences: true,
});

export const userUpdateSchema = userBaseSchema.pick({
    displayName: true,
    bio: true,
    location: true,
    vrHeadset: true,
    preferences: true,
});

export const adminUserUpdateSchema = userBaseSchema.pick({
    displayName: true,
    email: true,
    username: true,
    rank: true,
    roles: true,
    bio: true,
    isBanned: true,
    banReason: true,
});

export const userUsernameUpdateSchema = userBaseSchema.pick({
    username: true,
});


export const adminUsersQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).default(20),
    search: z.string().optional(),
    role: z.enum(rolesEnum).optional(),
    rank: z.enum(rankEnum).optional(),
    sortBy: z.enum(['createdAt', 'lastLoginAt', 'contributionPoints', 'username']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
});

export const adminStatsRequestSchema = z.object({
    type: z.enum(['stats', 'search']),
    query: z.string().min(2).optional(),
});


export type UserRoleUpdateInput = z.infer<typeof userRoleUpdateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type UserUsernameUpdateInput = z.infer<typeof userUsernameUpdateSchema>;
export type AdminUsersQueryInput = z.infer<typeof adminUsersQuerySchema>;
export type AdminStatsRequestInput = z.infer<typeof adminStatsRequestSchema>;

export type UserLocation = (typeof locationEnum)[number];
export type UserVrHeadset = (typeof vrHeadsetEnum)[number];
export type UserRank = (typeof rankEnum)[number];
export type UserRoles = (typeof rolesEnum)[number];

export type IUser = z.infer<typeof userDocumentSchema>;
import {z} from 'zod';
import {Types} from "mongoose";
import {paginationSchema, successSchema} from "@/lib/schemas/core";

export const locationEnum = ['eu', 'na'] as const;
export const vrHeadsetEnum = ['quest2', 'quest3', 'pico4', 'index', 'vive', 'bigscreen', 'other'] as const;
export const rolesEnum = ['user', 'contributor', 'moderator', 'partner', 'admin'] as const;
export const rankEnum = ['recruit', 'soldier', 'specialist', 'veteran', 'elite'] as const;

// ===== USER SCHEMA =====
const reservedUsernames = ['admin', 'api', 'app', 'auth', 'dashboard', 'settings', 'user', 'users'];
export const userBaseSchema = z.object({

    // Authentication
    email: z.email(),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens")
        .refine(
            (val) => !reservedUsernames.includes(val),
            "This username is reserved"
        ),

    displayName: z.string()
        .min(3, "Display Name must be at least 3 characters")
        .max(20, "Display Name must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Display Name can only contain letters, numbers, underscores, and hyphens"),
    avatarUrl: z.url().optional(), // Avatar URL from OAuth provider


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


export const userTokenSchema = userBaseSchema.pick({
    username: true,
    displayName: true,
    avatarUrl: true,
    rank: true,
    roles: true,
    isBanned: true,
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
}).partial().transform((data) => {
    // Clean up undefined values
    const cleaned = {...data};

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined) {
            delete cleaned[key as keyof typeof cleaned];
        }
    });

    return cleaned;
})

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

export const userAuthSchema = userBaseSchema.pick({
    username: true,
    roles: true,
    isBanned: true,
})


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


// User list item schema (for lists)
const userListItemSchema = userDocumentSchema.pick({
    _id: true,
    username: true,
    email: true,
    roles: true,
    rank: true,
    createdAt: true,
    lastLoginAt: true,
}).extend({
    stats: z.object({
        contributionPoints: z.number(),
    }),
});

// User profile schema (public view)
const userProfileSchema = userDocumentSchema.pick({
    _id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    location: true,
    vrHeadset: true,
    rank: true,
    roles: true,
    badges: true,
    stats: true,
    createdAt: true,
}).extend({
    preferences: z.object({
        publicProfile: z.boolean(),
        showContributions: z.boolean(),
    }),
});

// User settings schema (own profile)
const userSettingsResponseSchema = userDocumentSchema


// Stats schemas
const userStatsSchema = z.object({
    totalUsers: z.number(),
    activeUsers: z.object({
        "7d": z.number(),
        "30d": z.number(),
    }),
    newUsers30d: z.number(),
    roleDistribution: z.record(z.string(), z.number()),
    rankDistribution: z.record(z.string(), z.number()),
});

// Request schemas
const userListRequestSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
    role: z.enum(rolesEnum).optional(),
    rank: z.enum(rankEnum).optional(),
    sortBy: z.enum(['createdAt', 'lastLoginAt', 'contributionPoints', 'username']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

const userSearchRequestSchema = z.object({
    type: z.literal('search'),
    query: z.string().min(2),
});

const userStatsRequestSchema = z.object({
    type: z.literal('stats'),
});

// Response schemas
const userListResponseSchema = z.object({
    users: z.array(userListItemSchema),
    pagination: paginationSchema,
});

const userSearchResponseSchema = z.object({
    users: z.array(userListItemSchema.pick({
        _id: true,
        username: true,
        email: true,
        roles: true,
        rank: true,
    })),
});

const userRoleUpdateResponseSchema = successSchema.extend({
    user: z.object({
        id: z.string(),
        username: z.string(),
        roles: z.array(z.enum(rolesEnum)),
        rank: z.enum(rankEnum),
    }),
});

// --- API Contract Definition ---
export const UserApi = {
    // Public endpoints
    ByUsername: {
        Get: {
            Response: z.object({
                user: userProfileSchema,
            }),
        },
    },

    // Authenticated user endpoints
    Get: {
        Response: z.object({
            user: userSettingsResponseSchema,
        }),
    },
    Patch: {
        Request: userUpdateSchema,
        Response: z.object({
            user: userSettingsResponseSchema,
        }),
    },

    CheckUsername: {
        Get: {
            Request: userUsernameUpdateSchema,
            Response: successSchema.pick({message: true}).extend({
                available: z.boolean(),
            }),
        }
    },

    UpdateUsername: {
        Patch: {
            Request: userUsernameUpdateSchema,
            Response: successSchema.extend({
                username: z.string(),
            }),
        }
    },


    // Admin endpoints
    Admin: {
        List: {
            Request: userListRequestSchema,
            Response: userListResponseSchema,
        },
        Search: {
            Request: userSearchRequestSchema,
            Response: userSearchResponseSchema,
        },
        Stats: {
            Request: userStatsRequestSchema,
            Response: z.object({
                stats: userStatsSchema,
            }),
        },
        ById: {
            Get: {
                Response: z.object({
                    user: userDocumentSchema,
                }),
            },
            Patch: {
                Request: adminUserUpdateSchema,
                Response: successSchema.extend({
                    user: userDocumentSchema,
                }),
            },
            Delete: {
                Response: successSchema,
            },
            Roles: {
                List: {
                    Response: z.object({
                        user: userListItemSchema,
                    }),
                },
                Patch: {
                    Request: userRoleUpdateSchema,
                    Response: userRoleUpdateResponseSchema,
                },
            },
        },
    },
};

// Type exports
export type IUserApi = {
    ByUsername: {
        Get: { Response: z.infer<typeof UserApi.ByUsername.Get.Response> };
    };

    Get: { Response: z.infer<typeof UserApi.Get.Response> };
    Patch: {
        Request: z.infer<typeof UserApi.Patch.Request>;
        Response: z.infer<typeof UserApi.Patch.Response>;
    };

    CheckUsername: {
        Get: {
            Request: z.infer<typeof UserApi.CheckUsername.Get.Request>;
            Response: z.infer<typeof UserApi.CheckUsername.Get.Response>;
        }
    };

    UpdateUsername: {
        Patch: {
            Request: z.infer<typeof UserApi.UpdateUsername.Patch.Request>;
            Response: z.infer<typeof UserApi.UpdateUsername.Patch.Response>;
        }
    };

    Admin: {
        List: {
            Request: z.infer<typeof UserApi.Admin.List.Request>;
            Response: z.infer<typeof UserApi.Admin.List.Response>;
        };
        Search: {
            Request: z.infer<typeof UserApi.Admin.Search.Request>;
            Response: z.infer<typeof UserApi.Admin.Search.Response>;
        };
        Stats: {
            Request: z.infer<typeof UserApi.Admin.Stats.Request>;
            Response: z.infer<typeof UserApi.Admin.Stats.Response>;
        };
        ById: {
            Get: { Response: z.infer<typeof UserApi.Admin.ById.Get.Response> };
            Patch: {
                Request: z.infer<typeof UserApi.Admin.ById.Patch.Request>;
                Response: z.infer<typeof UserApi.Admin.ById.Patch.Response>;
            };
            Delete: { Response: z.infer<typeof UserApi.Admin.ById.Delete.Response> };
            Roles: {
                Get: { Response: z.infer<typeof UserApi.Admin.ById.Roles.List.Response> };
                Patch: {
                    Request: z.infer<typeof UserApi.Admin.ById.Roles.Patch.Request>;
                    Response: z.infer<typeof UserApi.Admin.ById.Roles.Patch.Response>;
                };
            };
        };
    };
};


export type UserRoleUpdateInput = z.infer<typeof userRoleUpdateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UserAuth = z.infer<typeof userAuthSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type UserUsernameUpdateInput = z.infer<typeof userUsernameUpdateSchema>;
export type AdminUsersQueryInput = z.infer<typeof adminUsersQuerySchema>;
export type AdminStatsRequestInput = z.infer<typeof adminStatsRequestSchema>;

export type UserLocation = (typeof locationEnum)[number];
export type UserVrHeadset = (typeof vrHeadsetEnum)[number];
export type UserRank = (typeof rankEnum)[number];
export type UserRoles = (typeof rolesEnum)[number];

export type IUser = z.infer<typeof userDocumentSchema>;
export type IUserToken = z.infer<typeof userTokenSchema>;
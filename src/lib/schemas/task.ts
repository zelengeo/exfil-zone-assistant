import { z } from 'zod';

// Task reward schema
export const taskRewardSchema = z.object({
    type: z.enum(['money', 'reputation', 'experience', 'item']),
    quantity: z.number().int().positive(),
    corpId: z.string().optional(), // For reputation rewards
    item_name: z.string().optional(), // Temp for item rewards
    item_id: z.string().optional(), // Item rewards
});

// Task type enum
export const taskTypeSchema = z.enum([
    'reach',
    'extract',
    'retrieve',
    'eliminate',
    'submit',
    'mark',
    'place',
    'photo',
    "signal"
]);

// Task video guide schema
export const taskVideoGuideSchema = z.object({
    author: z.string(),
    ytId: z.string(),
    startTs: z.number().int().nonnegative().optional(),
    endTs: z.number().int().nonnegative().optional(),
});

// Task map enum
export const taskMapSchema = z.enum([
    'suburb',
    'resort',
    'dam',
    'metro',
    'any'
]);

// Main task schema
export const taskSchema = z.object({
    id: z.string(),
    name: z.string(),
    gameId: z.string(),
    description: z.string(),
    objectives: z.array(z.string()),
    corpId: z.string(),
    type: z.array(taskTypeSchema),
    map: z.array(taskMapSchema),
    reward: z.array(taskRewardSchema),
    preReward: z.array(taskRewardSchema),
    requiredTasks: z.array(z.string()),
    requiredLevel: z.number().int().nonnegative(),
    tips: z.string(),
    videoGuides: z.array(taskVideoGuideSchema),
    order: z.number().int().positive(),
})

// Tasks database schema
export const tasksDatabaseSchema = z.record(z.string(), taskSchema);

// Task status enum
export const taskStatusSchema = z.enum(['completed', 'active', 'locked']);

// User progress schema
export const userProgressSchema = z.object({
    tasks: z.record(z.string(), taskStatusSchema),
});

// Type exports
export type ITask = z.infer<typeof taskSchema>;
export type TaskReward = z.infer<typeof taskRewardSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type TaskVideoGuide = z.infer<typeof taskVideoGuideSchema>;
export type TaskMap = z.infer<typeof taskMapSchema>;
export type TasksDatabase = z.infer<typeof tasksDatabaseSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
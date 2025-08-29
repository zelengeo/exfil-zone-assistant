import {z} from 'zod';
import {feedbackBaseSchema} from "@/lib/schemas/feedback";
import {userBaseSchema} from "@/lib/schemas/user";


export const isValidUser = (data: unknown): data is z.infer<typeof userBaseSchema> => {
    return userBaseSchema.safeParse(data).success;
};

export const isValidFeedback = (data: unknown): data is z.infer<typeof feedbackBaseSchema> => {
    return feedbackBaseSchema.safeParse(data).success;
};
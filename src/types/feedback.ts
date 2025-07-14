// src/types/feedback.ts
import { Types } from 'mongoose';

export type FeedbackStatus = 'new' | 'in_review' | 'accepted' | 'rejected' | 'implemented' | 'duplicate';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackType = 'bug' | 'feature' | 'general' | 'data_correction';
export type FeedbackCategory = 'items' | 'tasks' | 'hideout' | 'combat-sim' | 'guides' | 'ui' | 'other';

export interface FeedbackRequestBody {
    type: FeedbackType;
    priority: FeedbackPriority;
    title: string;
    description: string;
    userAgent: string;
    pageUrl: string;
    category?: FeedbackCategory;
}

export interface IFeedback {
    _id: Types.ObjectId;
    type: FeedbackType;
    status: FeedbackStatus;
    priority: FeedbackPriority;
    title: string;
    description: string;
    adminNotes?: string;
    category: FeedbackCategory;
    userId?: Types.ObjectId;
    isAnonymous: boolean;
    sessionId?: string;
    screenshots?: string[];
    pageUrl?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

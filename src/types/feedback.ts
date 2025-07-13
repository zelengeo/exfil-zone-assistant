// src/types/feedback.ts
import { Types } from 'mongoose';

export interface IFeedback {
    _id: Types.ObjectId;
    type: 'bug' | 'feature' | 'data_correction';
    status: 'new' | 'in_review' | 'accepted' | 'rejected' | 'implemented' | 'duplicate';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    category: 'items' | 'tasks' | 'hideout' | 'combat-sim' | 'guides' | 'ui' | 'other';
    userId?: Types.ObjectId;
    isAnonymous: boolean;
    sessionId?: string;
    screenshots?: string[];
    pageUrl?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

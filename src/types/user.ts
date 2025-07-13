// src/types/user.ts
import { Types } from 'mongoose';

export interface IUser {
    _id: Types.ObjectId;
    email: string;
    username: string;
    name?: string;
    image?: string;
    accounts: {
        provider: string;
        providerAccountId: string;
        type: string;
        access_token?: string;
        token_type?: string;
        scope?: string;
        id_token?: string;
        session_state?: string;
    }[];
    bio?: string;
    location: 'eu' | 'na';
    vrHeadset?: 'quest2' | 'quest3' | 'pico4' | 'index' | 'vive' | 'bigscreen' | 'other' | null;
    stats: {
        feedbackSubmitted: number;
        bugsReported: number;
        featuresProposed: number;
        dataCorrections: number;
        correctionsAccepted: number;
        contributionPoints: number;
    };
    level: number;
    rank: 'recruit' | 'soldier' | 'specialist' | 'veteran' | 'elite';
    badges: {
        id: string;
        name: string;
        description: string;
        earnedAt: Date;
    }[];
    roles: ('user' | 'contributor' | 'moderator' | 'partner' | 'admin')[];
    preferences: {
        emailNotifications: boolean;
        publicProfile: boolean;
        showContributions: boolean;
    };
    emailVerified?: Date;
    createdAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
    isBanned: boolean;
    banReason?: string;
}

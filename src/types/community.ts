import React from "react";

export interface BaseContributor {
    name: string;
    description?: string;
    logo?: string;
    link?: string;
    featured?: boolean;            // Show in featured section
    platform?: 'youtube' | 'twitch' | 'website' | 'github' | 'discord' | 'telegram';
}

export interface StandardContributor extends BaseContributor {
    role: 'creator' | 'contributor' | 'supporter';
}

export interface PartnerContributor extends BaseContributor {
    role: 'partner';
    // Partners get enhanced options
    highlighted?: boolean;          // Show with special styling
    customComponent?: React.ComponentType; // Override with custom card
    priority?: number;             // Sort order (lower = higher priority)
    tags?: readonly string[];              // Additional labels like "VR Content", "Tutorial Creator"
    stats?: {                     // Optional stats for partners
        subscribers?: string;
        videos?: string;
        followers?: string;
    };
}

export type Contributor = StandardContributor | PartnerContributor;

export interface CommunityConfig {
    partners: PartnerContributor[];
    creators: StandardContributor[];
    contributors: StandardContributor[];
    supporters: StandardContributor[];
}

export interface RoleConfig {
    label: string;
    color: string;
    borderColor: string;
    bgColor: string;
    priority: number;              // For ordering sections
}

// Enhanced role configurations
export const ROLE_CONFIGS: Record<string, RoleConfig> = {
    partner: {
        label: 'Partner',
        color: 'text-yellow-400',
        borderColor: 'border-yellow-600',
        bgColor: 'bg-yellow-900/20',
        priority: 1
    },
    creator: {
        label: 'Content Creator',
        color: 'text-green-400',
        borderColor: 'border-green-700',
        bgColor: 'bg-green-900/20',
        priority: 2
    },
    contributor: {
        label: 'Contributor',
        color: 'text-blue-400',
        borderColor: 'border-blue-700',
        bgColor: 'bg-blue-900/20',
        priority: 3
    },
    supporter: {
        label: 'Supporter',
        color: 'text-purple-400',
        borderColor: 'border-purple-700',
        bgColor: 'bg-purple-900/20',
        priority: 4
    }
};
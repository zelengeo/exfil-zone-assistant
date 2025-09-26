import {CommunityConfig, PartnerContributor, StandardContributor, ROLE_CONFIGS} from "@/types/community";
import HayaPlaysCard from "@/components/partners/HayaPlaysCard";

export const communityCreatorMap = {
    orbb: {
        name: 'Orbb',
        role: 'creator',
        description: 'Informational and informative content with a focus on VR games!',
        link: 'https://www.youtube.com/@Orbb_',
        logo: '/images/community/orbb_logo.webp',
        featured: false,
        platform: 'youtube'
    },
    radFoxVR: {
        name: 'RadFox VR',
        role: 'creator',
        description: 'Hi :3\nI\'m a girl from Russia who loves VR! \nHere on youtube I upload good games, funny moments, tutorials aaand some other stuff.',
        link: 'https://www.youtube.com/@RadFoxVRuniversity',
        logo: '/images/community/radFoxVR_logo.webp',
        featured: false,
        platform: 'youtube'
    },
    plumberKarl: {
        name: 'PlumberKarl',
        role: 'creator',
        description: 'I am a full time self-employed plumber/gasfitter. I play a lot of shooters, adventure and puzzle like games; any VR as well.',
        link: 'https://www.twitch.tv/plumberkarl',
        logo: '/images/logo-placeholder-image.webp',
        featured: false,
        platform: 'twitch'
    },
    'aboleth': {
        name: 'Aboleth',
        role: 'creator',
        featured: true,
        description: 'Deep Dives into VR games.',
        link: 'https://abolethvr.substack.com/',
        logo: '/images/community/aboleth_logo.webp',
        platform: 'website'
    }
} as const;

export const partnerMap = {
    'HayaPlays': {
        name: 'HayaPlays',
        role: 'partner',
        description: 'VR Gaming Content Creator & Community Partner',
        logo: '/images/community/haya-logo-70x70.webp',
        link: 'https://twitch.tv/hayaplays',
        platform: 'twitch',
        featured: true,
        highlighted: true,
        priority: 1,
        tags: ['VR Content', 'Gaming'],
        customComponent: HayaPlaysCard
    }
} as const;

// Partners - get priority positioning and enhanced features
const partners: PartnerContributor[] = Object.values(partnerMap) as PartnerContributor[];

// Content Creators
const creators: StandardContributor[] = Object.values(communityCreatorMap) as StandardContributor[];

// Contributors (developers, data contributors, etc.)
const contributors: StandardContributor[] = [
    // Add technical contributors here
];

// Supporters (community members, donors, etc.)
const supporters: StandardContributor[] = [
    {
        name: 'Ken Ross',
        role: 'supporter',
        featured: true,
    },
    {
        name: 'Genosse aus der UsbSSR',
        role: 'supporter',
        featured: true,
        description: '3D Artist',
        link: 'https://t.me/fox_valger_3dsmax',
        platform: 'telegram',
    },
    {
        name: 'zaymax',
        role: 'supporter',
        featured: true,
    }
];

// Main community configuration
export const communityConfig: CommunityConfig = {
    partners,
    creators,
    contributors,
    supporters
};

// Enhanced role config function
export const getRoleConfig = (role: string) => {
    return ROLE_CONFIGS[role] || {
        label: role,
        color: 'text-tan-400',
        borderColor: 'border-military-700',
        bgColor: 'bg-military-800',
        priority: 999
    };
};

// Helper functions for the new structure
export const getAllContributorsByRole = () => {
    return {
        partners: communityConfig.partners.sort((a, b) => (a.priority || 999) - (b.priority || 999)),
        creators: communityConfig.creators,
        contributors: communityConfig.contributors,
        supporters: communityConfig.supporters
    };
};

export const getFeaturedPartners = () => {
    return communityConfig.partners.filter(partner => partner.featured);
};

export const getHighlightedContributors = () => {
    return communityConfig.partners.filter(partner => partner.highlighted);
};
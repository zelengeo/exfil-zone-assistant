// Define all available tags
import {GuideMetadata, GuideTag} from "@/types/guides";

export const guideTags: GuideTag[] = [
    {
        id: 'getting-started',
        name: 'Getting Started',
        description: 'Essential guides for new players',
        color: 'green',
        icon: 'Compass'
    },
    {
        id: 'gameplay',
        name: 'Gameplay',
        description: 'Core game mechanics and systems',
        color: 'blue',
        icon: 'Gamepad2'
    },
    {
        id: 'combat',
        name: 'Combat',
        description: 'Fighting and weapon guides',
        color: 'red',
        icon: 'Crosshair'
    },
    {
        id: 'equipment',
        name: 'Equipment',
        description: 'Gear and loadout guides',
        color: 'orange',
        icon: 'Shield'
    },
    {
        id: 'vr-specific',
        name: 'VR Specific',
        description: 'VR optimization and comfort',
        color: 'purple',
        icon: 'Glasses'
    },
    {
        id: 'strategy',
        name: 'Strategy',
        description: 'Advanced tactics and tips',
        color: 'yellow',
        icon: 'Brain'
    },
    {
        id: 'economy',
        name: 'Economy',
        description: 'Trading and resource management',
        color: 'emerald',
        icon: 'TrendingUp'
    },
    {
        id: 'maps',
        name: 'Maps',
        description: 'Location and navigation guides',
        color: 'teal',
        icon: 'Map'
    }
];

// All guides configuration
export const guidesConfig: GuideMetadata[] = [
    //APP state and plans
    {
        slug: 'app-roadmap',
        title: 'Current Features & Dev Roadmap',
        description: 'Discover what\'s available now, what\'s coming soon, and help shape the future of Exfil Zone Assistant',
        tags: ['getting-started'],
        difficulty: 'beginner',
        readTime: '3 min',
        author: 'pogapwnz',
        publishedAt: '2025-06-10',
        featured: false,
        contentType: 'component'
    },

    // Gameplay Mechanics
    {
        slug: 'survival-damage-mechanics',
        title: 'Survival & Damage Mechanics',
        description: 'Essential guide to body zones, health management, bleeding, and staying alive in Exfil Zone',
        tags: ['getting-started', 'gameplay'],
        difficulty: 'beginner',
        readTime: '10 min',
        author: 'pogapwnz',
        publishedAt: '2025-06-15',
        featured: true,
        ogImageUrl: '/og/og-image-guide-survival.jpg',
        contentType: 'component'
    },
    {
        slug: 'armor-penetration-guide',
        title: 'Penetration Mechanics Explained',
        description: 'Master the complex mechanics of armor penetration, damage reduction, and when to aim for armor vs limbs',
        tags: ['combat', 'equipment', 'strategy'],
        difficulty: 'advanced',
        readTime: '8 min',
        author: 'pogapwnz',
        publishedAt: '2025-06-10',
        featured: true,
        contentType: 'component'
    },
    {
        slug: 'combat-sim-usage',
        title: 'How to Use Combat Sim',
        description: 'Learn how to use our Combat Simulator effectively and understand simulation accuracy',
        tags: ['getting-started', 'strategy'],
        difficulty: 'beginner',
        readTime: '5 min',
        author: 'pogapwnz',
        publishedAt: '2025-06-10',
        featured: true,
        contentType: 'component'
    },
    // {
    //     slug: 'movement-mechanics',
    //     title: 'Advanced Movement Mechanics',
    //     description: 'Master sliding, vaulting, and tactical positioning in VR',
    //     tags: ['gameplay', 'vr-specific'],
    //     difficulty: 'intermediate',
    //     readTime: '10 min',
    //     publishedAt: '2024-01-17',
    //     contentType: 'component'
    // },
    // {
    //     slug: 'inventory-management',
    //     title: 'Inventory & Safe Management',
    //     description: 'Optimize your loadout and storage with efficient inventory strategies',
    //     tags: ['gameplay', 'strategy'],
    //     difficulty: 'beginner',
    //     readTime: '8 min',
    //     publishedAt: '2024-01-18',
    //     contentType: 'markdown'
    // },

    // Combat Guides
    // {
    //     slug: 'combat-basics',
    //     title: 'Combat System Fundamentals',
    //     description: 'Understanding weapon handling, recoil patterns, and damage mechanics',
    //     tags: ['combat', 'gameplay'],
    //     difficulty: 'beginner',
    //     readTime: '12 min',
    //     publishedAt: '2024-01-19',
    //     featured: true,
    //     contentType: 'component'
    // },
    // {
    //     slug: 'armor-penetration-guide',
    //     title: 'Armor & Penetration Explained',
    //     description: 'Deep dive into armor classes, penetration values, and damage calculation',
    //     tags: ['combat', 'equipment'],
    //     difficulty: 'advanced',
    //     readTime: '10 min',
    //     publishedAt: '2024-01-20',
    //     contentType: 'component'
    // },

    // Equipment & Loadouts
    // {
    //     slug: 'budget-loadouts',
    //     title: 'Best Budget Loadouts',
    //     description: 'Cost-effective gear combinations for new and experienced players',
    //     tags: ['equipment', 'economy', 'getting-started'],
    //     difficulty: 'beginner',
    //     readTime: '10 min',
    //     publishedAt: '2024-01-21',
    //     featured: true,
    //     contentType: 'component'
    // },
    // {
    //     slug: 'weapon-modding-guide',
    //     title: 'Weapon Modification Guide',
    //     description: 'Optimize your weapons with the best attachments and modifications',
    //     tags: ['equipment', 'combat'],
    //     difficulty: 'intermediate',
    //     readTime: '14 min',
    //     publishedAt: '2024-01-22',
    //     contentType: 'component'
    // },

    // VR Specific
    // {
    //     slug: 'vr-comfort-settings',
    //     title: 'VR Comfort Settings Guide',
    //     description: 'Reduce motion sickness and optimize comfort for extended play sessions',
    //     tags: ['vr-specific', 'getting-started'],
    //     difficulty: 'beginner',
    //     readTime: '6 min',
    //     publishedAt: '2024-01-23',
    //     contentType: 'markdown'
    // },
    // {
    //     slug: 'physical-space-setup',
    //     title: 'Physical Space Setup for VR',
    //     description: 'Configure your play area for maximum safety and immersion',
    //     tags: ['vr-specific'],
    //     difficulty: 'beginner',
    //     readTime: '5 min',
    //     publishedAt: '2024-01-24',
    //     contentType: 'markdown'
    // },

    // Strategy & Advanced
    // {
    //     slug: 'extraction-strategies',
    //     title: 'Safe Extraction Strategies',
    //     description: 'Timing, routes, and tactics for successful extractions',
    //     tags: ['strategy', 'gameplay'],
    //     difficulty: 'intermediate',
    //     readTime: '11 min',
    //     publishedAt: '2024-01-25',
    //     contentType: 'component'
    // },
    // {
    //     slug: 'stealth-tactics',
    //     title: 'Stealth & Positioning Guide',
    //     description: 'Move unseen and gain tactical advantages over opponents',
    //     tags: ['strategy', 'combat'],
    //     difficulty: 'advanced',
    //     readTime: '13 min',
    //     publishedAt: '2024-01-26',
    //     contentType: 'markdown'
    // },

    // Economy
    // {
    //     slug: 'trading-basics',
    //     title: 'Trading & Economy Basics',
    //     description: 'Maximize profits and understand the in-game economy',
    //     tags: ['economy', 'getting-started'],
    //     difficulty: 'beginner',
    //     readTime: '9 min',
    //     publishedAt: '2024-01-27',
    //     contentType: 'markdown'
    // },
    // {
    //     slug: 'hideout-investment-guide',
    //     title: 'Hideout Investment Strategy',
    //     description: 'Which hideout upgrades provide the best return on investment',
    //     tags: ['economy', 'strategy'],
    //     difficulty: 'intermediate',
    //     readTime: '12 min',
    //     publishedAt: '2024-01-28',
    //     contentType: 'component'
    // }
];

// Helper functions
export function getGuideBySlug(slug: string): GuideMetadata | undefined {
    return guidesConfig.find(guide => guide.slug === slug);
}

export function getGuidesByTag(tagId: string): GuideMetadata[] {
    return guidesConfig.filter(guide => guide.tags.includes(tagId));
}

export function getFeaturedGuides(): GuideMetadata[] {
    return guidesConfig.filter(guide => guide.featured);
}

export function getRelatedGuides(currentSlug: string, limit: number = 3): GuideMetadata[] {
    const currentGuide = getGuideBySlug(currentSlug);
    if (!currentGuide) return [];

    // Find guides with overlapping tags
    return guidesConfig
        .filter(guide =>
            guide.slug !== currentSlug &&
            guide.tags.some(tag => currentGuide.tags.includes(tag))
        )
        .map(guide => ({
            guide,
            // Score based on number of matching tags
            score: guide.tags.filter(tag => currentGuide.tags.includes(tag)).length
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.guide);
}

export function getAllTags(): string[] {
    const tags = new Set<string>();
    guidesConfig.forEach(guide => {
        guide.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
}

// For static generation
export function getAllGuideSlugs(): string[] {
    return guidesConfig.map(guide => guide.slug);
}
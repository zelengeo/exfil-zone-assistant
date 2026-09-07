import { guideMetadataSchema, guideTagSchema, type GuideMetadata, type GuideTag } from '@/types/guides';

export const guideTags: GuideTag[] = guideTagSchema.array().parse([
    { id: 'getting-started', name: 'Getting Started', description: 'Essential guides for new players', icon: 'Compass' },
    { id: 'gameplay', name: 'Gameplay', description: 'Core game mechanics and systems', icon: 'Gamepad2' },
    { id: 'combat', name: 'Combat', description: 'Fighting and weapon guides', icon: 'Crosshair' },
    { id: 'equipment', name: 'Equipment', description: 'Gear and loadout guides', icon: 'Shield' },
    { id: 'strategy', name: 'Strategy', description: 'Advanced tactics and tips', icon: 'Brain' },
]);

export const guidesConfig: GuideMetadata[] = guideMetadataSchema.array().parse([
    {
        slug: 'when-is-the-wipe', title: 'When is the Next Wipe?',
        description: 'Official wipe history, PvP and PvE scope, and the latest confirmed status.',
        tags: ['getting-started', 'gameplay'],
        relatedSlugs: ['survival-damage-mechanics', 'combat-sim-usage', 'damage-model'],
        difficulty: 'beginner', readTimeMinutes: 5, author: 'pogapwnz',
        publishedAt: '2025-07-08', updatedAt: '2026-09-06', featured: true,
    },
    {
        slug: 'survival-damage-mechanics', title: 'Survival & Damage Mechanics',
        description: 'How 13 collision zones feed seven HP pools, which medical items treat each status, and where the simulator approximates.',
        tags: ['getting-started', 'gameplay'],
        relatedSlugs: ['damage-model', 'combat-sim-usage', 'when-is-the-wipe'],
        difficulty: 'beginner', readTimeMinutes: 4, author: 'pogapwnz',
        publishedAt: '2025-06-15', updatedAt: '2026-09-06', featured: true,
        ogImageUrl: '/og/og-image-guide-survival.jpg',
    },
    {
        slug: 'ammo-selection-beginners', title: 'Ammunition Selection for Beginners',
        description: 'Choose a compatible round, decide whether to challenge protection or aim around it, and compare the result before buying a stack.',
        tags: ['getting-started', 'combat', 'equipment'],
        relatedSlugs: ['damage-model', 'armor-penetration-guide', 'combat-sim-usage'],
        difficulty: 'beginner', readTimeMinutes: 2, author: 'pogapwnz',
        publishedAt: '2025-07-19', updatedAt: '2026-09-06', featured: true,
        ogImageUrl: '/og/og-image-guide-ammo.jpg',
    },
    {
        slug: 'armor-penetration-guide', title: 'Penetration Mechanics Explained',
        description: 'How coverage, facing and wear change an armor matchup, and how to turn the simulator reading into a tactical decision.',
        tags: ['combat', 'equipment', 'strategy'],
        relatedSlugs: ['damage-model', 'ammo-selection-beginners', 'combat-sim-usage'],
        difficulty: 'advanced', readTimeMinutes: 3, author: 'pogapwnz',
        publishedAt: '2025-06-10', updatedAt: '2026-09-06', featured: true,
        ogImageUrl: '/og/og-image-guide-armor.jpg',
    },
    {
        slug: 'damage-model', title: 'The Damage Model, Step by Step',
        description: 'Every step between pulling the trigger and losing health, with a calculator that resolves one shot against any round, plate and zone.',
        tags: ['combat', 'equipment'],
        relatedSlugs: ['armor-penetration-guide', 'ammo-selection-beginners', 'combat-sim-usage'],
        difficulty: 'advanced', readTimeMinutes: 12, author: 'pogapwnz',
        publishedAt: '2026-09-06', updatedAt: '2026-09-06', featured: false,
        ogImageUrl: '/og/og-image-guide-damage.jpg',
    },
    {
        slug: 'combat-sim-usage', title: 'How to Use Combat Sim',
        description: 'Set up a loadout and target, then read the Best case, Aimed and Spraying verdicts across Read, Compare and Numbers.',
        tags: ['getting-started', 'combat', 'equipment'],
        relatedSlugs: ['damage-model', 'armor-penetration-guide', 'ammo-selection-beginners'],
        difficulty: 'beginner', readTimeMinutes: 3, author: 'pogapwnz',
        publishedAt: '2025-06-10', updatedAt: '2026-09-06', featured: true,
    },
]);

export const formatReadTime = (minutes: number): string => minutes + ' min read';

export function getGuideBySlug(slug: string): GuideMetadata | undefined {
    return guidesConfig.find((guide) => guide.slug === slug);
}
export function getGuidesByTag(tagId: string): GuideMetadata[] {
    return guidesConfig.filter((guide) => guide.tags.includes(tagId));
}
export function getFeaturedGuides(): GuideMetadata[] {
    return guidesConfig.filter((guide) => guide.featured);
}
export function getRelatedGuides(currentSlug: string, limit = 3): GuideMetadata[] {
    const guide = getGuideBySlug(currentSlug);
    if (!guide) return [];
    return guide.relatedSlugs
        .map((slug) => getGuideBySlug(slug))
        .filter((related): related is GuideMetadata => related !== undefined)
        .slice(0, limit);
}
export function getAllTags(): string[] {
    return [...new Set(guidesConfig.flatMap((guide) => guide.tags))];
}
export function getAvailableGuideTags(): GuideTag[] {
    const used = new Set(getAllTags());
    return guideTags.filter((tag) => used.has(tag.id));
}
export function guideMatchesSearch(guide: GuideMetadata, query: string): boolean {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    const tagNames = guide.tags.map((id) => guideTags.find((tag) => tag.id === id)?.name ?? id);
    return [guide.title, guide.description, ...tagNames].join(' ').toLowerCase().includes(normalized);
}
export function getAllGuideSlugs(): string[] {
    return guidesConfig.map((guide) => guide.slug);
}

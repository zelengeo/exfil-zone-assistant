# Guides Feature Documentation

## Documentation Hierarchy

**Parent:** [App Router](../CLAUDE.md) - Next.js pages & routing
**Root:** [Root CLAUDE.md](../../../CLAUDE.md) - Project overview
**Index:** [CLAUDE-INDEX.md](../../../CLAUDE-INDEX.md) - Complete navigation

**Related Documentation:**
- [Content](../../content/CLAUDE.md) - Guide content creation
- [Types](../../types/CLAUDE.md) - Guide type definitions
- [Components](../../components/CLAUDE.md) - Component patterns

**See Also:**
- For guide writing patterns, see [Content CLAUDE.md](../../content/CLAUDE.md)
- For guide types, see [Types CLAUDE.md](../../types/CLAUDE.md) - Guide Types
- For component styling, see [Components CLAUDE.md](../../components/CLAUDE.md)

---

## Overview

The **Guides feature** provides a comprehensive tutorial and strategy library for Contractors Showdown: ExfilZone. Users can:

- Browse all guides with search and filtering
- Filter by tags (gameplay, combat, equipment, etc.)
- Filter by difficulty (beginner, intermediate, advanced)
- View featured guides prominently
- Read component-based or markdown guides
- Navigate between related guides
- See guide metadata (read time, author, publish date)

**Routes:**
- `/guides` - Guides list page with search/filter
- `/guides/[slug]` - Guide detail page with content

**Key Features:**
- **Tag system:** 8 categories (getting-started, gameplay, combat, equipment, vr-specific, strategy, economy, maps)
- **Difficulty levels:** Beginner, intermediate, advanced
- **Search functionality:** Filter by title/description
- **Featured section:** Highlight important guides
- **Related guides:** Show similar content
- **Component-based content:** Rich React components with interactive elements
- **Markdown support:** Simple text-based guides (future)

---

## Directory Structure

```
app/guides/
├── [slug]/                         # Dynamic route for guide details
│   └── page.tsx                   # Guide detail page (static params)
├── components/                     # Guide list components
│   └── GuidesPageContent.tsx      # Main list page content
└── page.tsx                        # Guides list page (server component)

config/
└── guides.ts                       # Guides configuration & metadata

content/guides/                     # Guide content files
├── armor-penetration-guide.tsx    # Component-based guide
├── ammo-selection-beginners.tsx   # Component-based guide
├── combat-sim-usage.tsx           # Component-based guide
├── survival-damage-mechanics.tsx  # Component-based guide
├── when-is-the-wipe.tsx          # Component-based guide
└── app-roadmap.tsx               # Component-based guide

types/
└── guides.ts                       # Guide type definitions
```

---

## Guides List Page

### Route: `/guides`

**File:** `app/guides/page.tsx`

**Pattern:** Server Component with Suspense

```typescript
import { Suspense } from 'react';
import { Metadata } from 'next';
import GuidesPageContent from './components/GuidesPageContent';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
    title: 'Guides & Tutorials',
    description: 'Comprehensive guides and tutorials for Contractors Showdown ExfilZone...',
    keywords: ['game guides', 'tutorials', 'strategies', 'tips', 'VR guides'],
    openGraph: {
        title: 'Guides & Tutorials',
        description: 'Master Contractors Showdown with our comprehensive guides...',
        type: 'website',
        images: [{
            url: '/og/og-image-guides.jpg',
            width: 1200,
            height: 630,
            alt: 'ExfilZone Guides and Tutorials',
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Guides & Tutorials - ExfilZone Assistant',
        description: 'Master ExfilZone with comprehensive guides and strategies.',
    },
    alternates: {
        canonical: '/guides',
    },
};

// Loading component for Suspense fallback
function ItemsLoading() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="military-box p-8 rounded-sm text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Guides</h2>
                        <p className="text-tan-300">Retrieving tactical knowledge data...</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Main page component - server component
export default function GuidesPage() {
    return (
        <Suspense fallback={<ItemsLoading />}>
            <GuidesPageContent />
        </Suspense>
    );
}
```

**Key Features:**
- Server component wrapper
- Suspense boundary for loading state
- SEO metadata with Open Graph and Twitter cards
- Canonical URL for SEO
- Custom loading spinner with military theme

---

## Guides List Content Component

### Component: `GuidesPageContent`

**File:** `app/guides/components/GuidesPageContent.tsx`

**Pattern:** Client Component with filtering

```typescript
'use client';

import React, { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { Search, Filter, Clock, Tag, Star, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { guidesConfig, guideTags, getFeaturedGuides } from '@/config/guides';

export default function GuidesPageContent() {
    const searchParams = useSearchParams();
    const selectedTag = searchParams.get('tag');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter guides based on search and filters
    const filteredGuides = useMemo(() => {
        return guidesConfig.filter(guide => {
            // Search filter
            const matchesSearch = !searchQuery ||
                guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                guide.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Tag filter
            const matchesTag = !selectedTag || guide.tags.includes(selectedTag);

            // Difficulty filter
            const matchesDifficulty = !selectedDifficulty || guide.difficulty === selectedDifficulty;

            return matchesSearch && matchesTag && matchesDifficulty;
        });
    }, [searchQuery, selectedTag, selectedDifficulty]);

    const featuredGuides = getFeaturedGuides();

    // Component JSX...
}
```

**Key Features:**
- **Client-side filtering:** Search and tag/difficulty filtering
- **URL state sync:** Tag filter via URL params
- **Memoized filtering:** Efficient search results
- **Toggle filters:** Show/hide advanced filters
- **Featured section:** Highlighted guides when no filters active
- **Active filters display:** Shows current filters with clear buttons

**State Management:**
- `searchQuery` - Search input value
- `selectedTag` - URL param for tag filtering
- `selectedDifficulty` - Local state for difficulty filter
- `showFilters` - Toggle filter panel visibility
- `filteredGuides` - Computed filtered guides (memoized)

**Page Sections:**

1. **Page Header**
   - Title: "GAME GUIDES"
   - Description

2. **Search Bar & Filter Toggle**
   - Text search input
   - Filter button toggle

3. **Filter Panel** (collapsible)
   - Difficulty buttons (beginner, intermediate, advanced)
   - Tag links with icons
   - Clear filters button

4. **Active Filters Display**
   - Shows current search, tag, difficulty
   - Individual clear buttons

5. **Featured Guides Section** (when no filters)
   - Star icon + "Featured Guides" heading
   - Grid of featured guide cards
   - Yellow border for featured items

6. **All Guides Section**
   - Dynamic heading: "X Guides Found" or "All Guides"
   - Grid of guide cards
   - Empty state if no results

7. **Coming Soon Notice**
   - Info box about future content

---

## Guide Detail Page

### Route: `/guides/[slug]`

**File:** `app/guides/[slug]/page.tsx`

**Pattern:** Server Component with dynamic import

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getGuideBySlug, getAllGuideSlugs, getRelatedGuides, guideTags } from '@/config/guides';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { ChevronLeft, Clock, User, Calendar, Tag } from 'lucide-react';

// Generate static params for all guides
export async function generateStaticParams() {
    const slugs = getAllGuideSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const {slug} = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) {
        return {
            title: 'Guide Not Found',
        };
    }

    return {
        title: `${guide.title}`,
        description: guide.description,
        openGraph: {
            title: guide.title,
            description: guide.description,
            type: 'article',
            publishedTime: guide.publishedAt,
            modifiedTime: guide.updatedAt,
            authors: guide.author ? [guide.author] : undefined,
            tags: guide.tags,
            images: [{
                url: guide.ogImageUrl || '/og-image.jpg',
                width: 1200,
                height: 630,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: guide.title,
            description: guide.description,
        },
    };
}

export default async function GuidePage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const {slug} = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) {
        notFound();
    }

    // Dynamically import component
    let content: React.ReactNode;

    try {
        const GuideComponent = dynamic(
            () => import(`@/content/guides/${guide.slug}`).then(mod => mod.default),
            {
                loading: () => (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="text-tan-400">Loading guide content...</div>
                    </div>
                ),
                ssr: true
            }
        );
        content = <GuideComponent />;
    } catch (error) {
        console.error(`Error loading component for ${guide.slug}:`, error);
        notFound();
    }

    // Get related guides
    const relatedGuides = getRelatedGuides(guide.slug, 3);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-tan-300">
                    <Link href="/guides" className="flex items-center gap-1 hover:text-olive-400">
                        <ChevronLeft size={16}/>
                        <span>Guides</span>
                    </Link>
                    <span>/</span>
                    <span className="text-tan-100">{guide.title}</span>
                </div>

                {/* Guide Header */}
                <header className="mb-8 pb-8 border-b border-military-700">
                    {/* Difficulty Badge */}
                    {guide.difficulty && (
                        <div className={`inline-block px-3 py-1 rounded-sm mb-4 border ${getDifficultyStyle(guide.difficulty)}`}>
                            <span className="text-sm font-medium capitalize">{guide.difficulty}</span>
                        </div>
                    )}

                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-3">
                        {guide.title}
                    </h1>

                    <p className="text-lg text-tan-300 mb-4">
                        {guide.description}
                    </p>

                    {/* Meta information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-tan-400">
                        {guide.readTime && (
                            <div className="flex items-center gap-1">
                                <Clock size={16} />
                                <span>{guide.readTime}</span>
                            </div>
                        )}
                        {guide.author && (
                            <div className="flex items-center gap-1">
                                <User size={16} />
                                <span>{guide.author}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{new Date(guide.publishedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {guide.tags.map((tagId) => {
                            const tagInfo = guideTags.find(t => t.id === tagId);
                            return (
                                <Link
                                    key={tagId}
                                    href={`/guides?tag=${tagId}`}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-military-800
                                     border border-military-600 rounded-sm text-sm text-tan-300
                                     hover:border-olive-700 hover:text-olive-400 transition-all"
                                >
                                    <Tag size={12} />
                                    {tagInfo?.name || tagId}
                                </Link>
                            );
                        })}
                    </div>
                </header>

                {/* Guide Content */}
                <article className="guide-content">
                    {content}
                </article>

                {/* Related Guides */}
                {relatedGuides.length > 0 && (
                    <section className="mt-12 pt-8 border-t border-military-700">
                        <h2 className="text-2xl font-bold text-tan-100 mb-6">Related Guides</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {relatedGuides.map((relatedGuide) => (
                                <Link
                                    key={relatedGuide.slug}
                                    href={`/guides/${relatedGuide.slug}`}
                                    className="block p-4 bg-military-800 border border-military-600 rounded-sm
                                     hover:border-olive-700 transition-all group"
                                >
                                    <h3 className="font-semibold text-tan-100 mb-2 group-hover:text-olive-400">
                                        {relatedGuide.title}
                                    </h3>
                                    <p className="text-sm text-tan-300 mb-3 line-clamp-2">
                                        {relatedGuide.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className={`px-2 py-1 rounded-sm border ${getDifficultyStyle(relatedGuide.difficulty)}`}>
                                            {relatedGuide.difficulty || 'All Levels'}
                                        </span>
                                        {relatedGuide.readTime && (
                                            <span className="text-tan-400">{relatedGuide.readTime}</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Back to Guides */}
                <div className="mt-8 pt-8 border-t border-military-700">
                    <Link
                        href="/guides"
                        className="inline-flex items-center gap-2 text-olive-400 hover:text-olive-300"
                    >
                        <ChevronLeft size={18} />
                        Back to All Guides
                    </Link>
                </div>
            </div>
        </Layout>
    );
}
```

**Key Features:**
- **Static generation:** `generateStaticParams()` for all guides
- **Dynamic metadata:** SEO-optimized for each guide
- **Dynamic import:** Component loaded on-demand
- **Breadcrumb navigation:** Back to guides list
- **Difficulty badge:** Visual difficulty indicator
- **Meta information:** Read time, author, publish date
- **Clickable tags:** Link to filtered guide list
- **Related guides:** Show similar content
- **Back link:** Return to guides list

**Guide Detail Sections:**
1. **Breadcrumb:** Guides → Guide title
2. **Header:**
   - Difficulty badge
   - Title
   - Description
   - Meta info (read time, author, date)
   - Tags
3. **Content:** Dynamically imported component
4. **Related Guides:** Up to 3 similar guides
5. **Back Link:** Return to list

---

## Guides Configuration

### File: `config/guides.ts`

**Guide Tags:**
```typescript
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
```

**Guides Configuration:**
```typescript
export const guidesConfig: GuideMetadata[] = [
    {
        slug: 'survival-damage-mechanics',
        title: 'Survival & Damage Mechanics',
        description: 'Essential guide to body zones, health management, bleeding, and staying alive',
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
        slug: 'ammo-selection-beginners',
        title: 'Ammunition Selection for Beginners',
        description: 'Learn which ammo to use, when to target armor vs limbs',
        tags: ['getting-started', 'combat', 'equipment'],
        difficulty: 'beginner',
        readTime: '12 min',
        author: 'pogapwnz',
        publishedAt: '2025-07-19',
        featured: true,
        ogImageUrl: '/og/og-image-guide-ammo.jpg',
        contentType: 'component'
    },
    {
        slug: 'armor-penetration-guide',
        title: 'Penetration Mechanics Explained',
        description: 'Master complex mechanics of armor penetration and damage reduction',
        tags: ['combat', 'equipment', 'strategy'],
        difficulty: 'advanced',
        readTime: '8 min',
        author: 'pogapwnz',
        publishedAt: '2025-06-10',
        featured: true,
        contentType: 'component'
    },
    // ... more guides
];
```

**Helper Functions:**
```typescript
// Get guide by slug
export function getGuideBySlug(slug: string): GuideMetadata | undefined {
    return guidesConfig.find(guide => guide.slug === slug);
}

// Get guides by tag
export function getGuidesByTag(tagId: string): GuideMetadata[] {
    return guidesConfig.filter(guide => guide.tags.includes(tagId));
}

// Get featured guides
export function getFeaturedGuides(): GuideMetadata[] {
    return guidesConfig.filter(guide => guide.featured);
}

// Get related guides (by overlapping tags)
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

// Get all tags
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
```

---

## Guide Types

### File: `types/guides.ts`

```typescript
export interface GuideMetadata {
    slug: string;
    title: string;
    description: string;
    tags: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    readTime?: string;
    author?: string;
    publishedAt: string;
    updatedAt?: string;
    featured?: boolean;
    ogImageUrl?: string;
    contentType: 'component' | 'markdown';
}

export interface GuideTag {
    id: string;
    name: string;
    description: string;
    color: string;      // For UI styling
    icon: string;       // Icon name from lucide-react
}
```

**See:** [Types CLAUDE.md](../../types/CLAUDE.md) - Guide Types for complete type definitions

---

## Component-Based Guides

### Pattern: React Component as Guide Content

**File:** `content/guides/[slug].tsx`

```typescript
export default function SurvivalDamageMechanicsGuide() {
    return (
        <div className="space-y-8">
            {/* Introduction */}
            <section>
                <h2 className="text-2xl font-bold text-tan-100 mb-4">Introduction</h2>
                <p className="text-tan-200 leading-relaxed mb-4">
                    Understanding how damage works in ExfilZone is crucial for survival...
                </p>
            </section>

            {/* Body Zones */}
            <section>
                <h2 className="text-2xl font-bold text-tan-100 mb-4">Body Zones</h2>
                <div className="military-box p-6 rounded-sm mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-olive-400 mb-2">Head</h3>
                            <p className="text-tan-300">HP: 35</p>
                            <p className="text-tan-400 text-sm">
                                Most vulnerable area. Instant death if HP reaches zero.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-olive-400 mb-2">Thorax</h3>
                            <p className="text-tan-300">HP: 85</p>
                            <p className="text-tan-400 text-sm">
                                Critical area. Death if HP reaches zero.
                            </p>
                        </div>
                        {/* ... more zones */}
                    </div>
                </div>
            </section>

            {/* Interactive Elements */}
            <section>
                <h2 className="text-2xl font-bold text-tan-100 mb-4">Try It Out</h2>
                <div className="military-box p-6 rounded-sm">
                    <Link href="/combat-sim" className="military-button">
                        Open Combat Simulator
                    </Link>
                </div>
            </section>

            {/* Callout Boxes */}
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-6">
                <h3 className="text-yellow-200 font-semibold mb-2">Pro Tip</h3>
                <p className="text-yellow-300/80">
                    Always carry at least one hemostatic for heavy bleeding situations.
                </p>
            </div>
        </div>
    );
}
```

**Component Guide Features:**
- **Rich formatting:** Full React components with styling
- **Interactive elements:** Buttons, links, interactive demos
- **Callout boxes:** Tips, warnings, notes
- **Code examples:** Syntax highlighting (if needed)
- **Tables and grids:** Complex data presentation
- **Links to app features:** Direct links to simulator, items, etc.

---

## Styling Helpers

### Helper Functions

**File:** `app/guides/[slug]/page.tsx`

```typescript
// Get difficulty badge styling
const getDifficultyStyle = (difficulty?: string) => {
    switch (difficulty) {
        case 'beginner':
            return 'bg-green-900/30 border-green-800 text-green-400';
        case 'intermediate':
            return 'bg-yellow-900/30 border-yellow-800 text-yellow-400';
        case 'advanced':
            return 'bg-red-900/30 border-red-800 text-red-400';
        default:
            return 'bg-military-700 border-military-600 text-tan-300';
    }
};

// Get tag color styling
const getTagColor = (color?: string) => {
    switch (color) {
        case 'green':
            return 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50';
        case 'blue':
            return 'bg-blue-900/30 border-blue-800 text-blue-400 hover:bg-blue-900/50';
        case 'red':
            return 'bg-red-900/30 border-red-800 text-red-400 hover:bg-red-900/50';
        // ... more colors
        default:
            return 'bg-military-700 border-military-600 text-tan-300 hover:bg-military-600';
    }
};

// Get icon component from lucide-react
const getIconComponent = (icon: string) => {
    const found = Icons[icon as keyof typeof Icons];
    return (found && typeof found === 'function' ? found : Tag) as LucideIcon;
};
```

---

## Search & Filtering

### Client-Side Filtering Pattern

```typescript
const filteredGuides = useMemo(() => {
    return guidesConfig.filter(guide => {
        // Search filter (title + description)
        const matchesSearch = !searchQuery ||
            guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Tag filter (from URL)
        const matchesTag = !selectedTag || guide.tags.includes(selectedTag);

        // Difficulty filter (local state)
        const matchesDifficulty = !selectedDifficulty ||
            guide.difficulty === selectedDifficulty;

        return matchesSearch && matchesTag && matchesDifficulty;
    });
}, [searchQuery, selectedTag, selectedDifficulty]);
```

**Filter Features:**
- **Search:** Text search on title/description
- **Tags:** Single tag filter via URL param
- **Difficulty:** Single difficulty filter via local state
- **Memoization:** Efficient recomputation only when filters change

---

## Related Guides Algorithm

### Pattern: Tag-based similarity

```typescript
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
```

**Algorithm:**
1. Filter out current guide
2. Filter to guides with at least 1 overlapping tag
3. Calculate score (number of matching tags)
4. Sort by score (descending)
5. Take top N results
6. Return guide metadata

---

## Guide Card Component Pattern

### Reusable Card

```typescript
<Link
    href={`/guides/${guide.slug}`}
    className="block p-4 bg-military-800 border border-military-600 rounded-sm
               hover:border-olive-700 transition-all group"
>
    <h3 className="font-semibold text-tan-100 mb-2 group-hover:text-olive-400">
        {guide.title}
    </h3>
    <p className="text-sm text-tan-300 mb-4 line-clamp-2">
        {guide.description}
    </p>
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            {guide.difficulty && (
                <span className={`text-xs px-2 py-1 rounded-sm border ${getDifficultyStyle(guide.difficulty)}`}>
                    {guide.difficulty}
                </span>
            )}
            {guide.readTime && (
                <span className="text-xs text-tan-400 flex items-center gap-1">
                    <Clock size={12} />
                    {guide.readTime}
                </span>
            )}
        </div>
    </div>
    <div className="flex flex-wrap gap-1 mt-3">
        {guide.tags.slice(0, 3).map((tagId) => {
            const tagInfo = guideTags.find(t => t.id === tagId);
            return (
                <span key={tagId} className="text-xs px-2 py-0.5 bg-military-900 text-tan-400 rounded-sm">
                    {tagInfo?.name || tagId}
                </span>
            );
        })}
        {guide.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 text-tan-500">
                +{guide.tags.length - 3}
            </span>
        )}
    </div>
</Link>
```

**Card Features:**
- Link wrapper (entire card clickable)
- Title with hover effect
- Description (2-line clamp)
- Difficulty badge
- Read time with icon
- Tags (max 3 visible)
- Tag overflow indicator

---

## Featured Guides Section

### Pattern: Highlighted Cards

```typescript
{!hasActiveFilters && featuredGuides.length > 0 && (
    <section className="mb-12">
        <h2 className="text-2xl font-bold text-tan-100 mb-6 flex items-center gap-2">
            <Star className="text-yellow-400" size={24} />
            Featured Guides
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredGuides.map((guide) => (
                <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="block p-6 bg-military-800 border-2 border-yellow-800/50 rounded-sm
                               hover:border-yellow-700 transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-2 right-2">
                        <Star className="text-yellow-400" size={16} fill="currentColor" />
                    </div>
                    {/* Card content */}
                </Link>
            ))}
        </div>
    </section>
)}
```

**Featured Features:**
- Only shown when no filters active
- Star icon in heading
- Yellow border (thicker than normal)
- Star badge in top-right corner
- Larger padding than normal cards

---

## Common Patterns

### DO's ✅

```typescript
// ✅ Use memoized filtering
const filteredGuides = useMemo(() => {
    return guides.filter(/* ... */);
}, [searchQuery, selectedTag]);

// ✅ Use helper functions for config
const guide = getGuideBySlug(slug);

// ✅ Generate static params for SEO
export async function generateStaticParams() {
    return getAllGuideSlugs().map(slug => ({ slug }));
}

// ✅ Dynamic import for components
const GuideComponent = dynamic(
    () => import(`@/content/guides/${slug}`),
    { loading: () => <Loading />, ssr: true }
);

// ✅ Show related guides based on tags
const related = getRelatedGuides(currentSlug, 3);

// ✅ Use URL params for shareable filters
const selectedTag = searchParams.get('tag');

// ✅ Provide clear filters UI
{hasActiveFilters && <ActiveFiltersDisplay />}
```

### DON'Ts ❌

```typescript
// ❌ Don't filter without memoization
const filteredGuides = guides.filter(/* ... */); // On every render

// ❌ Don't hardcode guide data in components
const guides = [{ title: 'Guide 1' }, ...]; // Use config file

// ❌ Don't forget static generation
// Missing generateStaticParams() = poor SEO

// ❌ Don't use static imports for all guides
import Guide1 from './guide1';
import Guide2 from './guide2';
// Use dynamic imports instead

// ❌ Don't show related guides without scoring
const related = guides.slice(0, 3); // Random guides

// ❌ Don't use local state for shareable filters
const [selectedTag, setSelectedTag] = useState(''); // Use URL params
```

---

## Content Creation Workflow

### Adding a New Guide

1. **Create guide file:**
   ```
   content/guides/my-new-guide.tsx
   ```

2. **Write component:**
   ```typescript
   export default function MyNewGuide() {
       return (
           <div className="space-y-8">
               <section>
                   <h2>Section Title</h2>
                   <p>Content...</p>
               </section>
           </div>
       );
   }
   ```

3. **Add metadata to config:**
   ```typescript
   // config/guides.ts
   {
       slug: 'my-new-guide',
       title: 'My New Guide',
       description: 'Learn about...',
       tags: ['gameplay', 'strategy'],
       difficulty: 'intermediate',
       readTime: '8 min',
       author: 'username',
       publishedAt: '2025-07-01',
       featured: false,
       contentType: 'component'
   }
   ```

4. **Build & verify:**
   - Run `npm run build`
   - Check guide appears in list
   - Test filtering and search
   - Verify related guides work

---

## Performance Optimizations

### Implemented Optimizations

1. **Memoized filtering:** `useMemo` prevents excessive recomputation
2. **Dynamic imports:** Guides loaded on-demand
3. **Static generation:** `generateStaticParams` for SEO
4. **Client-side filtering:** Instant filter results
5. **Conditional rendering:** Featured section only when no filters

---

## Testing Considerations

### Unit Tests

**getRelatedGuides:**
```typescript
describe('getRelatedGuides', () => {
    it('returns guides with overlapping tags', () => {
        const related = getRelatedGuides('survival-damage-mechanics', 3);
        expect(related.length).toBeLessThanOrEqual(3);
        expect(related[0].tags).toContain('gameplay'); // Shared tag
    });

    it('sorts by number of matching tags', () => {
        const related = getRelatedGuides('combat-basics', 3);
        const scores = related.map(g =>
            g.tags.filter(t => guide.tags.includes(t)).length
        );
        expect(scores).toEqual([...scores].sort((a, b) => b - a));
    });
});
```

**Filter Logic:**
```typescript
describe('Guide Filtering', () => {
    it('filters by search query', () => {
        const filtered = guidesConfig.filter(g =>
            g.title.toLowerCase().includes('combat')
        );
        expect(filtered.every(g => g.title.toLowerCase().includes('combat'))).toBe(true);
    });

    it('filters by tag', () => {
        const filtered = guidesConfig.filter(g => g.tags.includes('getting-started'));
        expect(filtered.every(g => g.tags.includes('getting-started'))).toBe(true);
    });

    it('filters by difficulty', () => {
        const filtered = guidesConfig.filter(g => g.difficulty === 'beginner');
        expect(filtered.every(g => g.difficulty === 'beginner')).toBe(true);
    });
});
```

---

## External Resources

### Next.js & React
- **Dynamic Imports**: [nextjs.org/docs/app/building-your-application/optimizing/lazy-loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- **Static Params**: [nextjs.org/docs/app/api-reference/functions/generate-static-params](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- **Metadata**: [nextjs.org/docs/app/building-your-application/optimizing/metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- **useMemo**: [react.dev/reference/react/useMemo](https://react.dev/reference/react/useMemo)

### Content Creation
- **Markdown (future)**: [github.com/remarkjs/remark](https://github.com/remarkjs/remark)
- **MDX (future)**: [mdxjs.com](https://mdxjs.com)

---

## Summary

The Guides feature is a comprehensive tutorial library with:
- **Search & filtering** by tags, difficulty, text
- **Featured section** for important guides
- **Component-based content** with rich formatting
- **Related guides** algorithm based on tags
- **Static generation** for SEO
- **Dynamic imports** for performance
- **Military theme** throughout

All patterns follow project standards: No `any` types, Tailwind 4+ syntax, type-safe implementations, and client-side filtering for instant results.

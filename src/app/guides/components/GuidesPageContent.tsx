'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock, Filter, Search, Star, Tag, X } from 'lucide-react';

import type { GuideMetadata } from '@/types/guides';
import { cn } from '@/lib/utils';
import {
    formatReadTime,
    getAvailableGuideTags,
    getFeaturedGuides,
    guideMatchesSearch,
    guidesConfig,
} from '@/config/guides';
import { useUrlSearchParams, UrlSearchParamsObserver } from '@/hooks/useUrlSearchParams';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
type Difficulty = typeof DIFFICULTIES[number];

function GuideCard({ guide, featured = false }: { guide: GuideMetadata; featured?: boolean }) {
    return (
        <Link
            href={'/guides/' + guide.slug}
            className={cn(
                'group block min-h-44 border bg-steel-850 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember',
                featured ? 'border-line-500' : 'border-line-800',
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl leading-tight text-ink-100 group-hover:text-ember">{guide.title}</h3>
                {featured && <Star className="mt-0.5 size-4 shrink-0 text-warn" fill="currentColor" aria-hidden="true" />}
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-400">{guide.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-ink-600">
                <span className="capitalize">{guide.difficulty}</span>
                <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {formatReadTime(guide.readTimeMinutes)}
                </span>
            </div>
        </Link>
    );
}

export default function GuidesPageContent() {
    const searchParams = useUrlSearchParams();
    const selectedTag = searchParams.get('tag');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const availableTags = getAvailableGuideTags();

    const filteredGuides = useMemo(
        () => guidesConfig.filter((guide) =>
            guideMatchesSearch(guide, searchQuery) &&
            (!selectedTag || guide.tags.includes(selectedTag)) &&
            (!selectedDifficulty || guide.difficulty === selectedDifficulty)),
        [searchQuery, selectedTag, selectedDifficulty],
    );

    const featuredGuides = getFeaturedGuides();
    const remainingGuides = guidesConfig.filter((guide) => !guide.featured);
    const hasActiveFilters = Boolean(searchQuery.trim() || selectedTag || selectedDifficulty);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedDifficulty(null);
        window.history.pushState({}, '', '/guides');
    };

    return (
        <Layout>
            <UrlSearchParamsObserver />
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <header className="border-l-2 border-ember pl-5">
                    <h1 className="font-display text-4xl text-ink-100 sm:text-5xl">Game guides</h1>
                    <p className="mt-2 max-w-2xl text-ink-400">
                        Field references for combat, survival, equipment and confirmed wipe history.
                    </p>
                </header>

                <section aria-label="Guide search and filters" className="mt-8 border border-line-700 bg-steel-900 p-3">
                    <div className="flex gap-2">
                        <div className="relative min-w-0 flex-1">
                            <label htmlFor="guide-search" className="sr-only">Search guide titles, descriptions and tags</label>
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-600" aria-hidden="true" />
                            <Input
                                id="guide-search"
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search titles, descriptions and tags"
                                className="h-11 rounded-none border-line-700 bg-steel-850 pl-10 text-ink-100"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="quiet"
                            className="size-11 px-0"
                            aria-label={showFilters ? 'Hide guide filters' : 'Show guide filters'}
                            aria-expanded={showFilters}
                            onClick={() => setShowFilters((visible) => !visible)}
                        >
                            <Filter aria-hidden="true" />
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="mt-3 space-y-4 border-t border-line-800 pt-3">
                            <fieldset>
                                <legend className="micro-label text-ink-600">Difficulty</legend>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {DIFFICULTIES.map((difficulty) => (
                                        <Button
                                            key={difficulty}
                                            type="button"
                                            variant="quiet"
                                            className={cn('min-h-11 capitalize', selectedDifficulty === difficulty && 'border-ember text-ink-100')}
                                            aria-pressed={selectedDifficulty === difficulty}
                                            onClick={() => setSelectedDifficulty((current) => current === difficulty ? null : difficulty)}
                                        >
                                            {difficulty}
                                        </Button>
                                    ))}
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend className="micro-label text-ink-600">Subject</legend>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {availableTags.map((tag) => (
                                        <Button key={tag.id} asChild variant="quiet" className={cn('min-h-11', selectedTag === tag.id && 'border-ember text-ink-100')}>
                                            <Link href={selectedTag === tag.id ? '/guides' : '/guides?tag=' + tag.id}>
                                                <Tag aria-hidden="true" />
                                                {tag.name}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                    )}
                </section>

                {hasActiveFilters ? (
                    <section className="mt-10">
                        <div className="flex min-h-11 items-center justify-between gap-4">
                            <h2 className="text-2xl text-ink-100">{filteredGuides.length} guides found</h2>
                            <Button type="button" variant="quiet" className="min-h-11" onClick={clearFilters}>
                                <X aria-hidden="true" /> Clear filters
                            </Button>
                        </div>
                        {filteredGuides.length > 0 ? (
                            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {filteredGuides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
                            </div>
                        ) : (
                            <p className="mt-5 border border-line-800 bg-steel-850 p-6 text-ink-400">
                                No guide matches these filters. Clear them to return to the full field manual.
                            </p>
                        )}
                    </section>
                ) : (
                    <>
                        <section className="mt-10">
                            <h2 className="flex items-center gap-2 text-2xl text-ink-100">
                                <Star className="size-5 text-warn" aria-hidden="true" /> Featured
                            </h2>
                            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {featuredGuides.map((guide) => <GuideCard key={guide.slug} guide={guide} featured />)}
                            </div>
                        </section>
                        {remainingGuides.length > 0 && (
                            <section className="mt-10">
                                <h2 className="text-2xl text-ink-100">More guides</h2>
                                <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {remainingGuides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}

'use client';

import React, { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import {LucideIcon, Search, Filter, Clock, Tag, Star, X, AlertCircle} from 'lucide-react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { guidesConfig, guideTags, getFeaturedGuides } from '@/content/guides/guides-config';
import {GuideMetadata} from "@/types/guides";

const getIconComponent = (icon: string) => {
    const found = Icons[icon as keyof typeof Icons];
    return (found && typeof found === 'function' ? found : Tag) as LucideIcon;
}

const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
        case 'beginner':
            return 'text-green-400 bg-green-900/30 border-green-800';
        case 'intermediate':
            return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
        case 'advanced':
            return 'text-red-400 bg-red-900/30 border-red-800';
        default:
            return 'text-tan-300 bg-military-700 border-military-600';
    }
};

const getTagColor = (color?: string) => {
    switch (color) {
        case 'green':
            return 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50';
        case 'blue':
            return 'bg-blue-900/30 border-blue-800 text-blue-400 hover:bg-blue-900/50';
        case 'red':
            return 'bg-red-900/30 border-red-800 text-red-400 hover:bg-red-900/50';
        case 'orange':
            return 'bg-orange-900/30 border-orange-800 text-orange-400 hover:bg-orange-900/50';
        case 'purple':
            return 'bg-purple-900/30 border-purple-800 text-purple-400 hover:bg-purple-900/50';
        case 'yellow':
            return 'bg-yellow-900/30 border-yellow-800 text-yellow-400 hover:bg-yellow-900/50';
        case 'emerald':
            return 'bg-emerald-900/30 border-emerald-800 text-emerald-400 hover:bg-emerald-900/50';
        case 'teal':
            return 'bg-teal-900/30 border-teal-800 text-teal-400 hover:bg-teal-900/50';
        default:
            return 'bg-military-700 border-military-600 text-tan-300 hover:bg-military-600';
    }
};

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

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedDifficulty(null);
        window.history.pushState({}, '', '/guides');
    };

    const hasActiveFilters = searchQuery || selectedTag || selectedDifficulty;
    return (
        <Layout title="Guides">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2 military-stencil">
                        GAME GUIDES
                    </h1>
                    <p className="text-tan-300 max-w-3xl">
                        Master the game with our comprehensive guides covering everything from basic mechanics to advanced strategies.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tan-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search guides..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-military-800 border border-military-600
                         rounded-sm text-tan-100 placeholder-tan-500
                         focus:border-olive-600 focus:outline-none transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 bg-military-800 border rounded-sm transition-all
                         ${showFilters ? 'border-olive-600 text-olive-400' : 'border-military-600 text-tan-300'}
                         hover:border-olive-600 hover:text-olive-400`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="p-4 bg-military-800 border border-military-600 rounded-sm space-y-4">
                            {/* Difficulty Filter */}
                            <div>
                                <h3 className="text-sm font-semibold text-tan-300 mb-2">Difficulty</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                                        <button
                                            key={difficulty}
                                            onClick={() => setSelectedDifficulty(
                                                selectedDifficulty === difficulty ? null : difficulty
                                            )}
                                            className={`px-3 py-1 rounded-sm border capitalize text-sm transition-all
                                 ${selectedDifficulty === difficulty
                                                ? getDifficultyColor(difficulty)
                                                : 'bg-military-700 border-military-600 text-tan-400 hover:border-military-500'}`}
                                        >
                                            {difficulty}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tags Filter */}
                            <div>
                                <h3 className="text-sm font-semibold text-tan-300 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {guideTags.map((tag) => {
                                        const IconComponent = getIconComponent(tag.icon);
                                        return (
                                            <Link
                                                key={tag.id}
                                                href={selectedTag === tag.id ? '/guides' : `/guides?tag=${tag.id}`}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-sm border text-sm transition-all
                                   ${selectedTag === tag.id
                                                    ? getTagColor(tag.color)
                                                    : 'bg-military-700 border-military-600 text-tan-400 hover:border-military-500'}`}
                                            >
                                                <IconComponent size={14} />
                                                {tag.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-tan-400">Active filters:</span>
                        {searchQuery && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-military-800
                             border border-military-600 rounded-sm text-sm text-tan-300">
                Search: &#34;{searchQuery}&#34;
                                <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-400">
                  <X size={14} />
                </button>
              </span>
                        )}
                        {selectedTag && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-military-800
                             border border-military-600 rounded-sm text-sm text-tan-300">
                Tag: {guideTags.find(t => t.id === selectedTag)?.name}
                                <Link href="/guides" className="ml-1 hover:text-red-400">
                  <X size={14} />
                </Link>
              </span>
                        )}
                        {selectedDifficulty && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-military-800
                             border border-military-600 rounded-sm text-sm text-tan-300">
                Difficulty: {selectedDifficulty}
                                <button onClick={() => setSelectedDifficulty(null)} className="ml-1 hover:text-red-400">
                  <X size={14} />
                </button>
              </span>
                        )}
                    </div>
                )}

                {/* Featured Guides */}
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
                                    <h3 className="font-semibold text-lg text-tan-100 mb-2 group-hover:text-olive-400 transition-colors">
                                        {guide.title}
                                    </h3>
                                    <p className="text-sm text-tan-300 mb-4 line-clamp-2">
                                        {guide.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {guide.difficulty && (
                                                <span className={`text-xs px-2 py-1 rounded-sm border ${getDifficultyColor(guide.difficulty)}`}>
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
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* All Guides */}
                <section>
                    <h2 className="text-2xl font-bold text-tan-100 mb-6">
                        {hasActiveFilters ? `${filteredGuides.length} Guides Found` : 'All Guides'}
                    </h2>

                    {filteredGuides.length === 0 ? (
                        <div className="text-center py-12 military-box rounded-sm">
                            <p className="text-tan-300 mb-4">No guides found matching your criteria.</p>
                            <button
                                onClick={clearFilters}
                                className="text-olive-400 hover:text-olive-300 transition-colors"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredGuides.map((guide: GuideMetadata) => (
                                <Link
                                    key={guide.slug}
                                    href={`/guides/${guide.slug}`}
                                    className="block p-4 bg-military-800 border border-military-600 rounded-sm
                           hover:border-olive-700 transition-all group"
                                >
                                    <h3 className="font-semibold text-tan-100 mb-2 group-hover:text-olive-400 transition-colors">
                                        {guide.title}
                                    </h3>
                                    <p className="text-sm text-tan-300 mb-4 line-clamp-2">
                                        {guide.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {guide.difficulty && (
                                                <span className={`text-xs px-2 py-1 rounded-sm border ${getDifficultyColor(guide.difficulty)}`}>
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
                                                <span
                                                    key={tagId}
                                                    className="text-xs px-2 py-0.5 bg-military-900 text-tan-400 rounded-sm"
                                                >
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
                            ))}
                        </div>
                    )}
                </section>

                {/* Coming Soon Notice */}
                <div className="mt-12 p-6 bg-yellow-900/20 border border-yellow-700/50 rounded-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-yellow-400 mt-1 flex-shrink-0" size={20} />
                        <div>
                            <p className="text-yellow-200 font-medium">More Guides Coming Soon</p>
                            <p className="text-yellow-300/80 text-sm mt-1">
                                We&#39;re actively working on expanding our guide collection. Check back regularly for new content!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
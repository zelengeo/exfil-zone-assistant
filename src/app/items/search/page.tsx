{/* Search results */}
<div className="w-full lg:w-3/4">
    {loading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="military-card rounded-sm overflow-hidden border border-military-700 animate-pulse">
                    <div className="h-40 bg-military-800"></div>
                    <div className="p-4">
                        <div className="h-6 bg-military-800 rounded mb-2"></div>
                        <div className="h-4 bg-military-800 rounded mb-2"></div>
                        <div className="h-4 bg-military-800 rounded mb-2"></div>
                        <div className="mt-4 flex justify-between">
                            <div className="h-5 bg-military-800 rounded w-1/3"></div>
                            <div className="h-5 bg-military-800 rounded w-1/4"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    ) : error ? (
        // Error state
        <div className="military-box p-8 rounded-sm bg-military-800 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="military-button py-3 px-6 rounded-sm"
            >
                Retry
            </button>
        </div>
    ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((item) => (
                <ItemCard key={item.id} item={item} />
            ))}
        </div>
    ) : (-2 lg:grid-cols'use client'

        import React, { useEffect, useState } from 'react';
        import Layout from '@/components/layout/Layout';
        import ItemsFilterPanel from '@/components/items/ItemsFilterPanel';
        import ItemCard from '@/components/items/ItemCard';
        import ItemSearch from '@/components/items/ItemSearch';
        import Link from 'next/link';
        import { ArrowLeft, Filter, X } from 'lucide-react';
        import { useSearchParams } from 'next/navigation';
        import ItemService, { Item } from '@/services/itemService';
        ];

        export default function SearchResultsPage() {
        const searchParams = useSearchParams();
        const query = searchParams.get('q') || '';
        const [searchResults, setSearchResults] = useState<Item[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [filtersVisible, setFiltersVisible] = useState(false);

        // Perform search when query changes
        useEffect(() => {
        const performSearch = async () => {
        if (!query) {
        setSearchResults([]);
        setLoading(false);
        return;
    }

        try {
        setLoading(true);
        const results = await ItemService.searchItems(query);
        setSearchResults(results);
        setError(null);
    } catch (err) {
        console.error('Error searching items:', err);
        setError('Failed to search. Please try again later.');
    } finally {
        setLoading(false);
    }
    };

        performSearch();
    }, [query]);

        return (
        <Layout
        title={`Search Results: ${query} | Items | Exfil Zone Assistant`}
     description={`Search results for "${query}" in the items database`}
>
    {/* Navigation breadcrumb */}
    <div className="bg-military-800 border-b border-olive-900 py-3">
        <div className="container mx-auto px-6">
            <nav className="flex items-center text-sm">
                <Link href="/" className="text-tan-300 hover:text-olive-400">Home</Link>
                <span className="mx-2 text-military-500">/</span>
                <Link href="/items" className="text-tan-300 hover:text-olive-400">Items</Link>
                <span className="mx-2 text-military-500">/</span>
                <span className="text-olive-400">Search Results</span>
            </nav>
        </div>
    </div>

    {/* Search header */}
    <section className="bg-military-800 border-b border-olive-900 py-8">
        <div className="container mx-auto px-6">
            <div className="flex items-center mb-6">
                <Link
                    href="/items"
                    className="flex items-center gap-2 text-olive-500 hover:text-olive-400 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to All Items</span>
                </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-6 military-stencil text-olive-400">
                SEARCH RESULTS
            </h1>

            {/* Search form */}
            <div className="max-w-2xl mb-4">
                <ItemSearch initialQuery={query} />
            </div>

            <p className="text-tan-200">
                {loading ? (
                    'Searching...'
                ) : error ? (
                    <span className="text-red-500">{error}</span>
                ) : searchResults.length === 0 ? (
                    'No items found matching your search.'
                ) : (
                    `Found ${searchResults.length} item${searchResults.length === 1 ? '' : 's'} matching "${query}"`
                )}
            </p>
        </div>
    </section>

    {/* Main content */}
    <section className="py-8 bg-military-900">
        <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Mobile filter toggle */}
                <div className="lg:hidden w-full mb-4">
                    <button
                        onClick={() => setFiltersVisible(!filtersVisible)}
                        className="military-button p-4 rounded-sm flex items-center justify-center gap-2 w-full"
                        aria-expanded={filtersVisible}
                    >
                        {filtersVisible ? <X size={20} /> : <Filter size={20} />}
                        <span>{filtersVisible ? 'Hide Filters' : 'Show Filters'}</span>
                    </button>
                </div>

                {/* Filters panel - hidden on mobile unless toggled */}
                <div className={`w-full lg:w-1/4 ${filtersVisible ? 'block' : 'hidden lg:block'}`}>
                    <ItemsFilterPanel />
                </div>

                {/* Search results */}
                <div className="w-full lg:w-3/4">
                    {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((item) => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((item) => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="military-box p-8 rounded-sm bg-military-800 text-center">
                            <p className="text-tan-300 mb-4">No items found matching your search criteria.</p>
                            <p className="text-tan-300">Try adjusting your search terms or filters to find what you're looking for.</p>

                            <div className="mt-8 flex justify-center">
                                <Link
                                    href="/items"
                                    className="military-button py-3 px-6 rounded-sm text-center inline-block"
                                >
                                    Browse All Items
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </section>
</Layout>
);
}
'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ItemCard from '@/components/items/ItemCard';
import FilterSidebar from '@/components/items/FilterSidebar';
import {ItemCategory, itemCategories, Item} from '@/types/items';
import {fetchItemsData} from "@/services/ItemService";

export default function ItemsPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch data on component mount
    // Fetch data on component mount
    useEffect(() => {
        const loadItems = async () => {
            try {
                setLoading(true);
                const itemsData = await fetchItemsData();
                setItems(itemsData);
                setFilteredItems(itemsData);
                setError(null);
            } catch (error) {
                console.error('Failed to load items:', error);
                setError('Failed to load items. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, []);

    // Apply filters whenever search or category selection changes
    useEffect(() => {
        let result = [...items];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (selectedCategory) {
            result = result.filter(item => item.category === selectedCategory.id);

            // Apply subcategory filter if applicable
            if (selectedSubcategory) {
                result = result.filter(item => item.subcategory === selectedSubcategory);
            }
        }

        setFilteredItems(result);
    }, [items, searchQuery, selectedCategory, selectedSubcategory]);


    // Show loading state
    if (loading) {
        return (
            <Layout title="Items Database | Exfil Zone">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="military-box p-8 rounded-sm text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Items Database</h2>
                            <p className="text-tan-300">Retrieving tactical equipment data...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Show error state
    if (error) {
        return (
            <Layout title="Items Database | Exfil Zone">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="military-box p-8 rounded-sm text-center border-l-4 border-red-600">
                            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Data</h2>
                            <p className="text-tan-300 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-olive-600 hover:bg-olive-500 text-tan-100 px-4 py-2 rounded-sm"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const handleCategoryChange = (category: ItemCategory | null) => {
        setSelectedCategory(category);
        setSelectedSubcategory(null); // Reset subcategory when category changes
    };

    const handleSubcategoryChange = (subcategory: string | null) => {
        setSelectedSubcategory(subcategory);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <Layout title="Items Database | Exfil Zone">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="inline-block px-3 py-1 border border-olive-500 bg-military-800/80 mb-3">
                        <h2 className="text-olive-400 military-stencil">DATABASE</h2>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2 military-stencil">ITEMS</h1>
                    <p className="text-tan-300 max-w-3xl">
                        Browse all in-game items, their stats, and locations. Use the filters to find exactly what you need for your next raid.
                    </p>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-olive-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 pl-10 pr-4 bg-military-800 border border-olive-700 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 rounded-sm text-tan-100 placeholder-military-400"
                        />
                    </div>

                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden bg-olive-600 hover:bg-olive-500 text-tan-100 px-4 py-3 rounded-sm border border-olive-700 transition-colors"
                    >
                        Filters {isSidebarOpen ? '✕' : '▼'}
                    </button>

                    {/* Filter summary - desktop only */}
                    <div className="hidden md:flex items-center text-tan-300">
                        {selectedCategory ? (
                            <span>
                Category: <span className="text-olive-400">{selectedCategory.name}</span>
                                {selectedSubcategory && (
                                    <> | Subcategory: <span className="text-olive-400">{selectedSubcategory}</span></>
                                )}
              </span>
                        ) : (
                            <span>All Items</span>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="text-tan-300 ml-auto">
                        <span className="font-mono">{filteredItems.length}</span> items found
                    </div>
                </div>

                {/* Main Content Area with Sidebar and Items Grid */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Filter Sidebar - Mobile (Conditional) & Desktop */}
                    <FilterSidebar
                        categories={itemCategories}
                        selectedCategory={selectedCategory}
                        selectedSubcategory={selectedSubcategory}
                        onCategoryChange={handleCategoryChange}
                        onSubcategoryChange={handleSubcategoryChange}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />

                    {/* Items Grid */}
                    <div className="flex-grow">
                        {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredItems.map((item) => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="military-box p-8 text-center rounded-sm">
                                <h3 className="text-xl text-olive-400 mb-2">No items found</h3>
                                <p className="text-tan-300">
                                    Try adjusting your search or clearing filters to see more items.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
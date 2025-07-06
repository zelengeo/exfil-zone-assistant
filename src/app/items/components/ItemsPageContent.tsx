'use client';

import React, {useState, useEffect} from 'react';
import {Search} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ItemCard from '@/app/items/components/ItemCard';
import FilterSidebar from '@/app/items/components/FilterSidebar';
import {itemCategories, Item, getCategoryById} from '@/types/items';
import {useSearchParams} from "next/navigation";
import {useFetchItems} from "@/hooks/useFetchItems";

export default function ItemsPageContent() {

    const {items} = useFetchItems();
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category') || '';
    const subcategoryId = searchParams.get('subcategory') || '';
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        if (categoryId) {
            result = result.filter(item => item.category === categoryId);

            // Apply subcategory filter if applicable
            if (subcategoryId) {
                result = result.filter(item => item.subcategory === subcategoryId);
            }
        }

        setFilteredItems(result);
    }, [items, searchQuery, categoryId, subcategoryId]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2 military-stencil">ITEMS</h1>
                    <p className="text-tan-300 max-w-3xl">
                        Browse all in-game items, their stats, including the hidden ones. Use the filters to find exactly what you
                        need for your next raid.
                    </p>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-olive-400"/>
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
                        {categoryId && getCategoryById(categoryId) ? (
                            <span>
                Category: <span className="text-olive-400">{getCategoryById(categoryId)?.name}</span>
                                {subcategoryId && getCategoryById(categoryId)?.subcategories.includes(subcategoryId) && (
                                    <> | Subcategory: <span className="text-olive-400">{subcategoryId}</span></>
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
                        selectedCategory={categoryId}
                        selectedSubcategory={subcategoryId}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />

                    {/* Items Grid */}
                    <div className="flex-grow">
                        {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredItems.map((item) => (
                                    <ItemCard key={item.id} item={item}/>
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
'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {ChevronLeft, Crosshair, Shield, Timer, Info} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ItemLocations from '@/components/items/ItemLocations';
import RelatedItems from '@/components/items/RelatedItems';
import {
    formatPrice,
    formatWeight,
    getRarityColorClass,
    getRarityBorderClass,
    getCategoryById, Item
} from '@/types/items';
import {getItemById} from "@/services/ItemService";


// Helper to render stats based on item category
const renderCategorySpecificStats = (item: Item) => {
    switch (item.category) {
        case 'weapons':
            return (
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Crosshair size={18} className="text-olive-400"/>
                        <span className="text-tan-300">Damage:</span>
                        <span className="text-tan-100 font-mono">{item.stats.damage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-olive-400"/>
                        <span className="text-tan-300">Penetration:</span>
                        <span className="text-tan-100 font-mono">{item.stats.penetration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Timer size={18} className="text-olive-400"/>
                        <span className="text-tan-300">Fire Rate:</span>
                        <span className="text-tan-100 font-mono">{item.stats.fireRate} rpm</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Info size={18} className="text-olive-400"/>
                        <span className="text-tan-300">Recoil:</span>
                        <span className="text-tan-100 font-mono">{item.stats.recoil}</span>
                    </div>
                </div>
            );
        case 'ammo':
            return (
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Crosshair size={18} className="text-olive-400"/>
                        <span className="text-tan-300">Damage:</span>
                        <span className="text-tan-100 font-mono">{item.stats.damage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-olive-400"/>
                        <span className="text-tan-300">Penetration:</span>
                        <span className="text-tan-100 font-mono">{item.stats.penetration}</span>
                    </div>
                </div>
            );
        case 'medicine':
            return (
                <div className="grid grid-cols-2 gap-4">
                    {item.stats.healAmount && (
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Heal Amount:</span>
                            <span className="text-tan-100 font-mono">{item.stats.healAmount}</span>
                        </div>
                    )}
                    {item.stats.useTime && (
                        <div className="flex items-center gap-2">
                            <Timer size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Use Time:</span>
                            <span className="text-tan-100 font-mono">{item.stats.useTime}s</span>
                        </div>
                    )}
                    {item.stats.duration && (
                        <div className="flex items-center gap-2">
                            <Timer size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Duration:</span>
                            <span className="text-tan-100 font-mono">{item.stats.duration}s</span>
                        </div>
                    )}
                </div>
            );
        case 'food':
            return (
                <div className="grid grid-cols-2 gap-4">
                    {item.stats.energyValue && (
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Energy:</span>
                            <span className="text-tan-100 font-mono">+{item.stats.energyValue}</span>
                        </div>
                    )}
                    {item.stats.hydrationValue && (
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Hydration:</span>
                            <span className="text-tan-100 font-mono">+{item.stats.hydrationValue}</span>
                        </div>
                    )}
                    {item.stats.useTime && (
                        <div className="flex items-center gap-2">
                            <Timer size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Use Time:</span>
                            <span className="text-tan-100 font-mono">{item.stats.useTime}s</span>
                        </div>
                    )}
                </div>
            );
        case 'gear':
            return (
                <div className="grid grid-cols-2 gap-4">
                    {item.stats.armorClass && (
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Armor Class:</span>
                            <span className="text-tan-100 font-mono">{item.stats.armorClass}</span>
                        </div>
                    )}
                    {item.stats.durability && (
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Durability:</span>
                            <span className="text-tan-100 font-mono">{item.stats.durability}</span>
                        </div>
                    )}
                    {item.stats.ergoPenalty && (
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Ergo Penalty:</span>
                            <span className="text-tan-100 font-mono">{item.stats.ergoPenalty}</span>
                        </div>
                    )}
                </div>
            );
        default:
            return null;
    }
};

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ItemDetail({params}: PageProps) {
    const {id} = React.use(params);
    const [activeTab, setActiveTab] = useState('stats');
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadItem = async () => {
            try {
                const itemData = await getItemById(id);
                setItem(itemData || null);
            } catch (error) {
                console.error('Failed to load item:', error);
            } finally {
                setLoading(false);
            }
        };

        loadItem();
    }, [id]);


    // Show loading state
    if (loading) {
        return (
            <Layout title="Items Database | Exfil Zone">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="military-box p-8 rounded-sm text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Item</h2>
                            <p className="text-tan-300">Retrieving tactical equipment data...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Show error state
    if (!item) {
        return (
            <Layout title="Items Database | Exfil Zone">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="military-box p-8 rounded-sm text-center border-l-4 border-red-600">
                            <h2 className="text-xl font-bold text-red-400 mb-2">Item Not Found</h2>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const category = getCategoryById(item.category);

    return (
        <Layout title={`${item.name} | Exfil Zone`}>
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb navigation */}
                <div className="flex items-center gap-2 mb-6 text-tan-300">
                    <Link href="/items" className="flex items-center gap-1 hover:text-olive-400 transition-colors">
                        <ChevronLeft size={16}/>
                        <span>Items</span>
                    </Link>
                    <span>/</span>
                    <Link
                        href={`/items?category=${item.category}`}
                        className="hover:text-olive-400 transition-colors"
                    >
                        {category?.name}
                    </Link>
                    {item.subcategory && (
                        <>
                            <span>/</span>
                            <Link
                                href={`/items?category=${item.category}&subcategory=${item.subcategory}`}
                                className="hover:text-olive-400 transition-colors"
                            >
                                {item.subcategory}
                            </Link>
                        </>
                    )}
                </div>

                {/* Item header */}
                <div className={`mb-8 border-l-4 pl-4 ${getRarityBorderClass(item.stats.rarity)}`}>
                    <div className="inline-block px-2 py-0.5 bg-military-800/80 mb-1">
            <span className={`text-sm ${getRarityColorClass(item.stats.rarity)}`}>
              {item.stats.rarity}
            </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2">{item.name}</h1>
                    <div className="flex items-center gap-2 text-tan-300">
                        <span>{category?.name}</span>
                        {item.subcategory && (
                            <>
                                <span>•</span>
                                <span>{item.subcategory}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left column - Item image */}
                    <div className="md:col-span-1">
                        {/* Simple item image display */}
                        <div className="military-card rounded-sm p-4 overflow-hidden">
                            <div
                                className="aspect-square relative bg-military-950 rounded-sm overflow-hidden border border-military-700">
                                {/* Placeholder for image */}
                                <div className="w-full h-full flex items-center justify-center bg-military-900">
                                    <div className="text-center p-4">
                                        <div
                                            className="text-olive-500 mb-2 font-medium military-stencil">{item.name}</div>
                                        <div className="text-tan-400 text-sm">Item Image</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Item price and basic stats */}
                        <div className="military-card rounded-sm mt-6 p-5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-tan-300">Market Value:</span>
                                <span
                                    className="text-olive-400 font-mono text-xl">{formatPrice(item.stats.price)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-tan-300">Weight:</span>
                                <span className="text-tan-100 font-mono">{formatWeight(item.stats.weight)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-tan-300">Size:</span>
                                <span className="text-tan-100 font-mono">{item.stats.size}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-tan-300">Safe Slots:</span>
                                <span className="text-tan-100 font-mono">{item.stats.safeSlots}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Item details */}
                    <div className="md:col-span-2">
                        {/* Tab navigation */}
                        <div className="flex border-b border-military-700 mb-6">
                            <button
                                className={`px-4 py-3 font-medium text-lg ${
                                    activeTab === 'stats'
                                        ? 'text-olive-400 border-b-2 border-olive-500'
                                        : 'text-tan-300 hover:text-tan-100 transition-colors'
                                }`}
                                onClick={() => setActiveTab('stats')}
                            >
                                Stats & Info
                            </button>
                            <button
                                className={`px-4 py-3 font-medium text-lg ${
                                    activeTab === 'locations'
                                        ? 'text-olive-400 border-b-2 border-olive-500'
                                        : 'text-tan-300 hover:text-tan-100 transition-colors'
                                }`}
                                onClick={() => setActiveTab('locations')}
                            >
                                Locations
                            </button>
                            <button
                                className={`px-4 py-3 font-medium text-lg ${
                                    activeTab === 'related'
                                        ? 'text-olive-400 border-b-2 border-olive-500'
                                        : 'text-tan-300 hover:text-tan-100 transition-colors'
                                }`}
                                onClick={() => setActiveTab('related')}
                            >
                                Related
                            </button>
                        </div>

                        {/* Tab content */}
                        {activeTab === 'stats' && (
                            <div className="military-box p-6 rounded-sm">
                                <h2 className="text-2xl font-bold text-olive-400 mb-4">Description</h2>
                                <p className="text-tan-200 mb-6 leading-relaxed">{item.description}</p>

                                {item.notes && (
                                    <>
                                        <h2 className="text-2xl font-bold text-olive-400 mb-4">Notes</h2>
                                        <p className="text-tan-200 mb-6 leading-relaxed">{item.notes}</p>
                                    </>
                                )}

                                <h2 className="text-2xl font-bold text-olive-400 mb-4">Specifications</h2>
                                <div className="mb-6">
                                    {renderCategorySpecificStats(item)}
                                </div>

                                {item.tips && (
                                    <>
                                        <h2 className="text-2xl font-bold text-olive-400 mb-4">Tactical Tips</h2>
                                        <div className="military-card p-4 rounded-sm border-l-4 border-olive-600">
                                            <p className="text-tan-200 leading-relaxed">{item.tips}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Use ItemLocations component for Locations tab */}
                        {activeTab === 'locations' && (
                            <ItemLocations item={item}/>
                        )}

                        {/* Use RelatedItems component for Related tab */}
                        {activeTab === 'related' && (
                            <RelatedItems item={item}/>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
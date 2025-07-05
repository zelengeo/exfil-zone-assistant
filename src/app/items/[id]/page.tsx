'use client';

import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronLeft,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import WeaponSpecificStats from "@/app/items/[id]/components/WeaponSpecificStats";
import AmmunitionSpecificStats from "@/app/items/[id]/components/AmmunitionSpecificStats";
import {
    formatPrice,
    formatWeight,
    getRarityColorClass,
    getRarityBorderClass,
    getCategoryById, AnyItem, Item,
} from '@/types/items';
import {getItemById} from "@/services/ItemService";
import {
    isAmmunition,
    isAnyItem,
    isArmor, isAttachment, isGrenade, isMedicine, isMisc, isProvisions, isTaskItem, isWeapon
} from "@/app/combat-sim/utils/types";
import GrenadeSpecificStats from "@/app/items/[id]/components/GrenadeSpecificStats";
import MedicineSpecificStats from "@/app/items/[id]/components/MedicineSpecificStats";
import ArmorSpecificStats from "@/app/items/[id]/components/ArmorSpecificStats";
import AttachmentSpecificStats from "@/app/items/[id]/components/AttachmentSpecificStats";
import ProvisionsSpecificStats from "@/app/items/[id]/components/ProvisionsSpecificStats";
import TaskItemsSpecificStats from "@/app/items/[id]/components/TaskItemsSpecificStats";

// Component for displaying item images with zoom functionality
const ItemImageDisplay: React.FC<{
    src: string;
    alt: string;
    className?: string;
}> = ({src, alt, className = ''}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    if (imageError) {
        // Fallback when image fails to load
        return (
            <div className={`flex items-center justify-center bg-military-800 ${className}`}>
                <div className="text-center p-4">
                    <div className="text-olive-500 mb-2 font-medium military-stencil">{alt}</div>
                    <div className="text-tan-400 text-sm">Image not available</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className} group`}>
            {/* Loading spinner */}
            {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-military-800 z-10">
                    <div
                        className="animate-spin w-8 h-8 border-2 border-olive-600 border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* Image */}
            <div
                className={`relative w-full h-full cursor-pointer transition-transform duration-200 hover:scale-105`}
            >
                <Image
                    src={src}
                    alt={alt}
                    unoptimized={true}
                    fill
                    className="object-contain p-4"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    sizes="(max-width: 768px) 400px, 600px"
                    priority
                />
            </div>
        </div>
    );
};

// Helper to render stats based on item category
const renderCategorySpecificStats = (item: AnyItem) => {
    switch (item.category) {
        case 'weapons':
            if (isWeapon(item)) return <WeaponSpecificStats item={item}/>;
            break;
        case 'ammo':
            if (isAmmunition(item)) return <AmmunitionSpecificStats item={item}/>;
            break;
        case "attachments":
            if (isAttachment(item)) return <AttachmentSpecificStats item={item}/>;
            break;
        case "grenades":
            if (isGrenade(item)) return <GrenadeSpecificStats item={item}/>;
            break
        case 'gear':
            if (isArmor(item)) return <ArmorSpecificStats item={item}/>
            break;
        case 'medicine':
            if (isMedicine(item)) return <MedicineSpecificStats item={item}/>
            break;
        case 'provisions':
            if (isProvisions(item)) return <ProvisionsSpecificStats item={item}/>
            break;
        case 'task-items':
            if (isTaskItem(item)) return <TaskItemsSpecificStats item={item}/>
            break;
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
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="military-box p-8 rounded-sm text-center">
                            <div
                                className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
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
            <Layout>
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
        <Layout>
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
                        {/* Item image display */}
                        <div className="military-card rounded-sm p-4 overflow-hidden">
                            <div
                                className="aspect-square relative bg-military-950 rounded-sm overflow-hidden border border-military-700">
                                <ItemImageDisplay
                                    src={item.images.fullsize}
                                    alt={item.name}
                                    className="w-full h-full"
                                />
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
                        </div>
                    </div>

                    {/* Right column - Item details */}
                    <div className="md:col-span-2">
                        <div className="military-box p-6 rounded-sm">
                            <h2 className="text-2xl font-bold text-olive-400 mb-4">Description</h2>
                            <p className="text-tan-200 mb-6 leading-relaxed">{item.description || item.name}</p>


                            {isMisc(item) || (<><h2
                                className="text-2xl font-bold text-olive-400 mb-4">Specifications</h2>
                                <div className="mb-6">
                                    {isAnyItem(item) && renderCategorySpecificStats(item)}
                                </div>
                            </>)}

                            {item.tips && (
                                <>
                                    <h2 className="text-2xl font-bold text-olive-400 mb-4">Tactical Tips</h2>
                                    <div className="military-card p-4 rounded-sm border-l-4 border-olive-600">
                                        <p className="text-tan-200 leading-relaxed">{item.tips}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
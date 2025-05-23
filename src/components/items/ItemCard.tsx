import React from 'react';
import Link from 'next/link';
import { ShieldIcon, DollarSign, Info } from 'lucide-react';
import { Item, getRarityColorClass, getRarityBorderClass, getCategoryById, formatPrice } from '@/types/items';
import { ItemImage } from './ItemImage';

// Helper function to render icon based on category
const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
        case 'weapons':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M2 12h19l3 3M7 12l-1 8"></path>
                    <path d="M22 2h-5l-1 2.5L11 8h-3"></path>
                </svg>
            );
        case 'ammo':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="9" y="2" width="6" height="20" rx="2"></rect>
                    <rect x="4" y="8" width="16" height="8" rx="2"></rect>
                </svg>
            );
        case 'medicine':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M8 21h8a2 2 0 0 0 2-2v-2H6v2a2 2 0 0 0 2 2Z"></path>
                    <path d="M12 11V3"></path>
                    <path d="M9 6h6"></path>
                    <path d="M8 14h8"></path>
                </svg>
            );
        case 'food':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M7 12a5 5 0 0 1 5-5c.91 0 1.76.25 2.5.67A5 5 0 0 1 17 12v7H7v-7Z"></path>
                    <path d="M16 6.05a3 3 0 0 0-5.17-2.13"></path>
                    <path d="M12 2a2 2 0 0 0-2 2"></path>
                </svg>
            );
        case 'gear':
            return <ShieldIcon className="w-5 h-5" />;
        case 'keys':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
            );
        default:
            return <Info className="w-5 h-5" />;
    }
};

// Function to render specific stats based on category
const renderCategoryStats = (item: Item) => {
    switch (item.category) {
        case 'weapons':
            return (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-olive-400 font-medium">DMG:</span>
                    <span className="text-tan-100 font-mono">{item.stats.damage}</span>
                    <span className="text-olive-400 font-medium ml-2">PEN:</span>
                    <span className="text-tan-100 font-mono">{item.stats.penetration}</span>
                </div>
            );
        case 'ammo':
            return (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-olive-400 font-medium">DMG:</span>
                    <span className="text-tan-100 font-mono">{item.stats.damage}</span>
                    <span className="text-olive-400 font-medium ml-2">PEN:</span>
                    <span className="text-tan-100 font-mono">{item.stats.penetration}</span>
                </div>
            );
        case 'medicine':
            return (
                <div className="flex items-center gap-2 text-sm">
                    {item.stats.healAmount && (
                        <>
                            <span className="text-olive-400 font-medium">HEAL:</span>
                            <span className="text-tan-100 font-mono">{item.stats.healAmount}</span>
                        </>
                    )}
                    {item.stats.useTime && (
                        <>
                            <span className="text-olive-400 font-medium ml-2">TIME:</span>
                            <span className="text-tan-100 font-mono">{item.stats.useTime}s</span>
                        </>
                    )}
                </div>
            );
        case 'food':
            return (
                <div className="flex items-center gap-2 text-sm">
                    {item.stats.energyValue && (
                        <>
                            <span className="text-olive-400 font-medium">ENERGY:</span>
                            <span className="text-tan-100 font-mono">+{item.stats.energyValue}</span>
                        </>
                    )}
                    {item.stats.hydrationValue && (
                        <>
                            <span className="text-olive-400 font-medium ml-2">WATER:</span>
                            <span className="text-tan-100 font-mono">+{item.stats.hydrationValue}</span>
                        </>
                    )}
                </div>
            );
        case 'gear':
            return (
                <div className="flex items-center gap-2 text-sm">
                    {item.stats.armorClass && (
                        <>
                            <span className="text-olive-400 font-medium">CLASS:</span>
                            <span className="text-tan-100 font-mono">{item.stats.armorClass}</span>
                        </>
                    )}
                    {item.stats.durability && (
                        <>
                            <span className="text-olive-400 font-medium ml-2">DUR:</span>
                            <span className="text-tan-100 font-mono">{item.stats.durability}</span>
                        </>
                    )}
                </div>
            );
        default:
            return (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-olive-400 font-medium">SIZE:</span>
                    <span className="text-tan-100 font-mono">{item.stats.size}</span>
                    <span className="text-olive-400 font-medium ml-2">SLOTS:</span>
                    <span className="text-tan-100 font-mono">{item.stats.safeSlots}</span>
                </div>
            );
    }
};

interface ItemCardProps {
    item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
    const category = getCategoryById(item.category);
    const rarityColorClass = getRarityColorClass(item.stats.rarity);
    const rarityBorderClass = getRarityBorderClass(item.stats.rarity);

    return (
        <Link
            href={`/items/${item.id}`}
            className={`
        military-card rounded-sm overflow-hidden block transition-transform hover:translate-y-[-2px] 
        border border-military-700 hover:border-olive-600 hover:shadow-lg
      `}
        >
            {/* Item image and rarity badge */}
            <div className="relative aspect-square bg-military-900 border-b border-military-700 overflow-hidden">
                {/* Item image */}
                <ItemImage
                    item={item}
                    size="thumbnail"
                    className="w-full h-full"
                    showZoom={false}
                />

                {/* Rarity tag */}
                <div className={`absolute top-0 right-0 px-2 py-0.5 text-xs ${rarityColorClass} border-l border-b ${rarityBorderClass}`}>
                    {item.stats.rarity}
                </div>

                {/* Category icon */}
                <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full flex items-center justify-center bg-military-800 border border-military-700">
                    <div className="text-olive-400">
                        {getCategoryIcon(item.category)}
                    </div>
                </div>
            </div>

            {/* Item details */}
            <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-tan-100 leading-tight">
                        {item.name}
                    </h3>
                </div>

                <div className="text-xs text-tan-300 mb-2">
                    {category?.name} {item.subcategory && `• ${item.subcategory}`}
                </div>

                {/* Category-specific stats */}
                {renderCategoryStats(item)}

                {/* Price */}
                <div className="mt-2 flex items-center justify-between border-t border-military-700 pt-2">
                    <div className="flex items-center gap-1 text-sm">
                        <DollarSign size={14} className="text-olive-500" />
                        <span className="text-tan-100 font-mono">{formatPrice(item.stats.price)}</span>
                    </div>

                    {/* Crafting indicator */}
                    {item.craftingRecipes && item.craftingRecipes.length > 0 && (
                        <div className="w-5 h-5 flex items-center justify-center bg-olive-700 rounded-full" title="Can be crafted">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-tan-100">
                                <path d="M17 15l-5-5-5 5"></path>
                                <path d="M12 10V2"></path>
                                <path d="M22 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v7Z"></path>
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ItemCard;
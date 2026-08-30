'use client';

import React, {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {Item, formatPrice} from '@/types/items';
import {WeaponFamily, representativeVariant} from '@/app/items/utils/weaponFamilies';
import ItemCard from './ItemCard';
import {ItemImage} from './ItemImage';

function priceRange(items: Item[]): string {
    const prices = items.map(item => item.stats.price).filter(price => price > 0);
    if (prices.length === 0) return formatPrice(0);
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    return low === high ? formatPrice(low) : `${formatPrice(low)} – ${formatPrice(high)}`;
}

interface WeaponFamilyGroupProps {
    group: WeaponFamily;
    /** Caliber is redundant when the caliber is already the active filter. */
    showCaliber: boolean;
    defaultExpanded: boolean;
}

const WeaponFamilyGroup: React.FC<WeaponFamilyGroupProps> = ({group, showCaliber, defaultExpanded}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const cover = representativeVariant(group.items);

    return (
        <div className="military-box rounded-sm border border-military-700 overflow-hidden">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                className="w-full flex items-center gap-4 p-3 text-left hover:bg-military-800/60 transition-colors"
            >
                <div className="w-14 h-14 shrink-0 bg-military-900 border border-military-700 rounded-sm overflow-hidden">
                    <ItemImage item={cover} size="thumbnail" className="w-full h-full" showZoom={false}/>
                </div>

                <div className="min-w-0 flex-grow">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-bold text-tan-100 text-lg leading-tight">{group.label}</h3>
                        {showCaliber && (
                            <span className="text-xs text-olive-500 font-medium">{group.caliber}</span>
                        )}
                    </div>
                    <div className="text-xs text-tan-400 flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="font-mono">{group.items.length}</span>
                        <span>variants</span>
                        {group.receiverCount > 1 && (
                            <>
                                <span>•</span>
                                <span><span className="font-mono">{group.receiverCount}</span> receivers</span>
                            </>
                        )}
                        <span>•</span>
                        <span className="font-mono">{priceRange(group.items)}</span>
                    </div>
                </div>

                <ChevronDown
                    size={20}
                    className={`shrink-0 text-olive-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {isExpanded && (
                <div className="border-t border-military-700 p-3 bg-military-900/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {group.items.map(item => (
                            <ItemCard key={item.id} item={item}/>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeaponFamilyGroup;

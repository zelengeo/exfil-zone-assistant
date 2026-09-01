'use client';

import React, {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Item} from '@/types/items';
import {baseValue, formatEZD} from '@/lib/trade';
import {WeaponFamily, representativeVariant} from '@/app/items/utils/weaponFamilies';
import ItemCard from './ItemCard';
import {ItemImage} from './ItemImage';

function priceRange(items: Item[]): string {
    const values = items.map(item => baseValue(item.stats)).filter(value => value > 0);
    if (values.length === 0) return 'Not traded';
    const low = Math.min(...values);
    const high = Math.max(...values);
    return low === high ? formatEZD(low) : `${formatEZD(low)} – ${formatEZD(high)}`;
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
        <div className="bg-steel-900 border border-line-900">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-steel-800 transition-colors"
            >
                <div className="w-12 h-12 shrink-0 bg-steel-850 border border-line-800 overflow-hidden">
                    <ItemImage item={cover} size="thumbnail" className="w-full h-full" showZoom={false}/>
                </div>

                <div className="min-w-0 flex-grow">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-display text-lg leading-tight text-ink-100">{group.label}</h3>
                        {showCaliber && (
                            <span className="micro-label text-info">{group.caliber}</span>
                        )}
                    </div>
                    <div className="micro-label text-ink-700 flex items-center gap-2 flex-wrap mt-1">
                        <span className="tabular">{group.items.length}</span>
                        <span>variants</span>
                        {group.receiverCount > 1 && (
                            <>
                                <span className="text-ink-800">·</span>
                                <span><span className="tabular">{group.receiverCount}</span> receivers</span>
                            </>
                        )}
                        <span className="text-ink-800">·</span>
                        <span className="tabular text-ink-500">{priceRange(group.items)}</span>
                    </div>
                </div>

                <ChevronDown
                    size={16}
                    className={cn('shrink-0 text-ink-700 transition-transform', isExpanded && 'rotate-180')}
                    aria-hidden="true"
                />
            </button>

            {isExpanded && (
                <div className="border-t border-line-900 p-3 bg-steel-950">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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

import React from 'react';
import Link from 'next/link';
import { Item, getRarityColorClass } from '@/types/items';
import { cn } from '@/lib/utils';
import ValueLine from '@/components/trade/ValueLine';
import AvailabilityChip from '@/components/trade/AvailabilityChip';
import { categoryStats } from '@/app/items/utils/cardStats';
import { ItemImage } from './ItemImage';

/**
 * One item as a table row — the dense density.
 *
 * This is what makes "cheapest 5.45 AP that penetrates class 5" answerable: forty cards let you
 * recognise an item, forty rows let you compare them. Same three stats as the card, borrowing the
 * gunsmith `PartPicker`'s row grammar so the two routes teach each other.
 */

export interface ItemRowProps {
    item: Item;
    className?: string;
}

export default function ItemRow({ item, className }: ItemRowProps) {
    const stats = categoryStats(item);

    return (
        <Link
            href={`/items/${item.id}`}
            className={cn(
                'group grid grid-cols-[2.25rem_minmax(0,2fr)_minmax(0,3fr)_minmax(0,7rem)_minmax(0,6rem)] items-center gap-3',
                'px-3 py-2 bg-steel-800 hover:bg-steel-700 transition-colors',
                className,
            )}
        >
            <div className="w-9 h-9 bg-steel-850 border border-line-800 shrink-0">
                <ItemImage item={item} size="icon" className="w-full h-full" showZoom={false} />
            </div>

            <div className="min-w-0">
                <div className="text-sm text-ink-200 group-hover:text-ink-hi transition-colors truncate">
                    {item.name}
                </div>
                <div className="flex items-baseline gap-2">
                    <span className={cn('micro-label', getRarityColorClass(item.stats.rarity))}>
                        {item.stats.rarity}
                    </span>
                    <span className="micro-label text-ink-700 truncate">{item.subcategory}</span>
                </div>
            </div>

            {/* The same three stats the card shows, laid out to line up down the column. */}
            <div className="hidden md:flex items-baseline gap-4 min-w-0">
                {stats.map((stat) => (
                    <span key={stat.label} className="min-w-0 truncate">
                        <span className="micro-label text-ink-700">{stat.label} </span>
                        <span className="font-mono tabular text-xs text-ink-300">{stat.value}</span>
                    </span>
                ))}
            </div>

            <div className="text-right">
                <ValueLine stats={item.stats} size="sm" />
                <div className="font-mono text-[10px] text-ink-700">
                    {(item.stats.weight ?? 0).toFixed(2)} kg
                </div>
            </div>

            <div className="hidden lg:flex justify-end">
                <AvailabilityChip stats={item.stats} />
            </div>
        </Link>
    );
}

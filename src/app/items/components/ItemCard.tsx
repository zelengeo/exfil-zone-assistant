import React from 'react';
import Link from 'next/link';
import { Item, getCategoryById, getRarityColorClass } from '@/types/items';
import { cn } from '@/lib/utils';
import ValueLine from '@/components/trade/ValueLine';
import { categoryStats, getPerformanceIndicator } from '@/app/items/utils/cardStats';
import CoverageStrip from '@/components/protection/CoverageStrip';
import { isArmor } from '@/app/combat-sim/utils/types';
import { ItemImage } from './ItemImage';

/**
 * One item, at a glance, forty at a time.
 *
 * The card's job is to help someone choose which item to look at — not to answer questions about
 * the one they chose. So it carries three stats, one value line and at most one glyph, and nothing
 * else: no vendor table, no coverage canvas, no barter badge. Those are the detail page's.
 */

interface ItemCardProps {
    item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
    const category = getCategoryById(item.category);
    const stats = categoryStats(item);
    const indicator = getPerformanceIndicator(item);

    return (
        <Link
            href={`/items/${item.id}`}
            className="group block bg-steel-800 border border-line-800 hover:border-line-500 hover:bg-steel-700 transition-colors"
        >
            <div className="relative aspect-square bg-steel-850 border-b border-line-800 overflow-hidden">
                <ItemImage item={item} size="thumbnail" className="w-full h-full" showZoom={false} />

                <div
                    className={cn(
                        'absolute top-0 right-0 px-2 py-0.5 micro-label bg-steel-950/85 border-l border-b border-line-800',
                        getRarityColorClass(item.stats.rarity),
                    )}
                >
                    {item.stats.rarity}
                </div>

                {indicator && (
                    <div
                        className={cn(
                            'absolute bottom-2 right-2 px-1.5 py-0.5 bg-steel-950/85 border border-line-700 flex items-center gap-1 micro-label',
                            indicator.color,
                        )}
                    >
                        {indicator.icon}
                        <span>{indicator.label}</span>
                    </div>
                )}
            </div>

            <div className="p-3">
                <h3 className="font-display text-base leading-tight text-ink-100 group-hover:text-ink-hi transition-colors">
                    {item.name}
                </h3>
                <div className="micro-label text-ink-700 mt-1 truncate">
                    {item.subcategory || category?.name}
                </div>

                <dl className="mt-3 space-y-1">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-baseline justify-between gap-2 text-xs">
                            <dt className="text-ink-600 truncate">{stat.label}</dt>
                            <dd className="font-mono tabular text-ink-200 shrink-0">{stat.value}</dd>
                        </div>
                    ))}
                </dl>

                {/* Gear gets the seven pips - the gist of what it covers. The real geometry is a
                    canvas, and forty of those is a non-starter, so it waits for the detail page. */}
                {isArmor(item) && (
                    <div className="mt-3">
                        <CoverageStrip protectiveData={item.stats.protectiveData} />
                    </div>
                )}

                <div className="flex items-baseline justify-between gap-2 border-t border-line-800 mt-3 pt-2.5">
                    <ValueLine stats={item.stats} size="sm" />
                    <span className="font-mono text-[11px] text-ink-700 shrink-0">
                        {(item.stats.weight ?? 0).toFixed(2)} kg
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ItemCard;

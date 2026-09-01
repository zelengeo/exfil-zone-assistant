import React from 'react';
import { cn } from '@/lib/utils';
import { baseValue, formatAmount, isPriced } from '@/lib/trade';
import type { TradeStats } from '@/types/trade';

/**
 * The one money figure a card carries: what the item is worth.
 *
 * That is `basePrice`, which is the best of the six sell columns — so this is the best offer with
 * the vendor's name stripped off. The name is deliberately absent: 86% of priced items are matched
 * at the top by two or more vendors, so a name here would be arbitrary on six cards in seven.
 * Who pays it is the vendor ledger's business, on the detail page.
 */

export interface ValueLineProps {
    stats: TradeStats;
    size?: 'sm' | 'md';
    className?: string;
}

export default function ValueLine({ stats, size = 'md', className }: ValueLineProps) {
    const value = baseValue(stats);

    if (!isPriced(stats) || value <= 0) {
        return (
            <span className={cn('font-mono text-ink-700', size === 'sm' ? 'text-xs' : 'text-sm', className)}>
                Not traded
            </span>
        );
    }

    return (
        <span className={cn('inline-flex items-baseline gap-1.5', className)}>
            <span
                className={cn(
                    'font-mono tabular leading-none text-ink-hi',
                    size === 'sm' ? 'text-sm' : 'text-base',
                )}
            >
                {formatAmount(value)}
            </span>
            <span className="font-mono text-[10px] uppercase text-ink-700">EZD</span>
        </span>
    );
}

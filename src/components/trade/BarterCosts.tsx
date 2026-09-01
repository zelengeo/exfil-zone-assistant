import React from 'react';
import { cn } from '@/lib/utils';
import ItemChip, { type ItemRef } from '@/components/items/ItemChip';
import type { ExchangeCost } from '@/types/trade';

/**
 * The barter half of an offer's price: the items a vendor demands on top of the money.
 *
 * The one renderer for that list. `BarterMark` shows the same rows inside a popover where a row is
 * too tight to spell them out; the ledger shows them inline, because the detail page is where the
 * evidence belongs. Two placements, one implementation — the point of the exercise.
 *
 * Deliberately quiet either way. Barter is genuinely interesting and genuinely niche — 106 of the
 * route's 678 offers carry one — so it reads as a note attached to the price it modifies, never as
 * a badge, a column, or a section of its own.
 */

/** Resolves a cost's `itemId` to something a chip can draw. */
export type ResolveItem = (itemId: string) => ItemRef | undefined;

export interface BarterCostsProps {
    costs: ExchangeCost[];
    resolve: ResolveItem;
    className?: string;
}

export default function BarterCosts({ costs, resolve, className }: BarterCostsProps) {
    if (!costs.length) return null;

    return (
        <ul className={cn('space-y-1', className)}>
            {costs.map((cost, i) => (
                <li key={`${cost.itemId}-${i}`} className="flex">
                    <ItemChip
                        item={resolve(cost.itemId)}
                        id={cost.itemId}
                        count={cost.count}
                        size="sm"
                    />
                </li>
            ))}
        </ul>
    );
}

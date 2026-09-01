import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ExchangeCost } from '@/types/trade';

/**
 * The barter half of an offer's price, as a footnote on that offer.
 *
 * Deliberately quiet. Barter is genuinely interesting and genuinely niche — 106 of the route's 678
 * offers carry one — so it reads as a note attached to the price it modifies, never as a badge, a
 * column, or a section of its own.
 */

export interface BarterCostsProps {
    costs: ExchangeCost[];
    /** Resolves a cost's `itemId` to a display name. Unresolved costs fall back to the raw id. */
    nameOf: (itemId: string) => string | undefined;
    className?: string;
}

export default function BarterCosts({ costs, nameOf, className }: BarterCostsProps) {
    if (!costs.length) return null;

    return (
        <p className={cn('font-mono text-[11px] text-ink-600', className)}>
            <span className="text-ink-700">+ </span>
            {costs.map((cost, i) => {
                const name = nameOf(cost.itemId);
                return (
                    <React.Fragment key={`${cost.itemId}-${i}`}>
                        {i > 0 && <span className="text-ink-700"> · </span>}
                        <span className="tabular">{cost.count}×</span>{' '}
                        {name ? (
                            <Link
                                href={`/items/${cost.itemId}`}
                                className="hover:text-ink-hi underline decoration-line-600 underline-offset-2 transition-colors"
                            >
                                {name}
                            </Link>
                        ) : (
                            <span className="text-ink-700">{cost.itemId}</span>
                        )}
                    </React.Fragment>
                );
            })}
        </p>
    );
}

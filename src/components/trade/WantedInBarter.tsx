'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAmount, vendorLabel } from '@/lib/trade';
import type { BarterUse } from '@/types/trade';

/**
 * What this item helps you buy — the barter data read backwards.
 *
 * Only 70 items in the catalogue are ever demanded as a barter cost, so this renders nothing at all
 * for the other 782. Where it does appear it sits *below* the ledger, collapsed: it is the most
 * interesting thing the exchange data can say and still not the reason anyone opened the page.
 */

export interface WantedInBarterProps {
    uses: BarterUse[];
    nameOf: (itemId: string) => string | undefined;
    className?: string;
}

export default function WantedInBarter({ uses, nameOf, className }: WantedInBarterProps) {
    const [open, setOpen] = useState(false);

    if (!uses.length) return null;

    return (
        <div className={cn('bg-steel-900 border border-line-900', className)}>
            <button
                type="button"
                onClick={() => setOpen((was) => !was)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-steel-800 transition-colors"
            >
                <span className="eyebrow">
                    Wanted in barter by {uses.length} {uses.length === 1 ? 'offer' : 'offers'}
                </span>
                <ChevronDown
                    size={14}
                    className={cn('text-ink-700 transition-transform shrink-0', open && 'rotate-180')}
                    aria-hidden="true"
                />
            </button>

            {open && (
                <ul className="divide-y divide-line-900 border-t border-line-900">
                    {uses.map((use, i) => {
                        const name = nameOf(use.itemId);
                        return (
                            <li
                                key={`${use.itemId}-${use.offer.vendor}-${use.offer.level}-${i}`}
                                className="flex items-baseline gap-2.5 px-4 py-2.5"
                            >
                                <span className="font-mono tabular text-xs text-ink-600 shrink-0">
                                    {use.count}×
                                </span>
                                <span className="min-w-0">
                                    <Link
                                        href={`/items/${use.itemId}`}
                                        className="block text-sm text-ink-300 hover:text-ink-hi transition-colors"
                                    >
                                        {name ?? use.itemId}
                                    </Link>
                                    <span className="micro-label text-ink-700">
                                        {vendorLabel(use.offer.vendor)} L{use.offer.level}
                                        {use.offer.price > 0 && ` · ${formatAmount(use.offer.price)}`}
                                    </span>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/trade';
import ItemChip from '@/components/items/ItemChip';
import type { BarterUse } from '@/types/trade';
import type { ResolveItem } from './BarterCosts';
import VendorTag from './VendorTag';

/**
 * What this item helps you buy — the barter data read backwards.
 *
 * Only 70 items in the catalogue are ever demanded as a barter cost, so this renders nothing at all
 * for the other 782. Where it does appear it sits *below* the ledger, collapsed: it is the most
 * interesting thing the exchange data can say and still not the reason anyone opened the page.
 *
 * Each row is an `ItemChip` over a `VendorTag` — the same two objects the ledger and the
 * availability chip are built from, so a row here reads the same as a row anywhere else.
 */

export interface WantedInBarterProps {
    uses: BarterUse[];
    resolve: ResolveItem;
    className?: string;
}

export default function WantedInBarter({ uses, resolve, className }: WantedInBarterProps) {
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
                    {`Wanted in barter by ${uses.length} ${uses.length === 1 ? 'offer' : 'offers'}`}
                </span>
                <ChevronDown
                    size={14}
                    className={cn('text-ink-700 transition-transform shrink-0', open && 'rotate-180')}
                    aria-hidden="true"
                />
            </button>

            {open && (
                <ul className="divide-y divide-line-900 border-t border-line-900">
                    {uses.map((use, i) => (
                        <li
                            key={`${use.itemId}-${use.offer.vendor}-${use.offer.level}-${i}`}
                            className="px-4 py-2.5"
                        >
                            <ItemChip
                                item={resolve(use.itemId)}
                                id={use.itemId}
                                count={use.count}
                                className="w-full"
                                sub={
                                    <span className="inline-flex items-center gap-2">
                                        <VendorTag
                                            vendor={use.offer.vendor}
                                            level={use.offer.level}
                                            interactive={false}
                                            showIcon={false}
                                        />
                                        {use.offer.price > 0 && (
                                            <span className="font-mono tabular text-ink-700">
                                                {formatAmount(use.offer.price)}
                                            </span>
                                        )}
                                    </span>
                                }
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

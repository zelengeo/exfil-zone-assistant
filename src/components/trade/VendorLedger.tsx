import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { baseValue, formatAmount, isPriced, offersByLevel, payersByAmount } from '@/lib/trade';
import { getVendor } from '@/lib/vendors';
import type { BuyOffer, TradeStats } from '@/types/trade';
import BarterCosts, { type ResolveItem } from './BarterCosts';
import BarterMark from './BarterMark';
import VendorTag from './VendorTag';
import { Price } from './Price';

/**
 * Every vendor's relationship with one item, on the detail page.
 *
 * Ordered by what they pay rather than by the array's fixed order, and with the buy side on the
 * same row as the sell side: buying and selling the same item from the same trader is one
 * relationship, not two tables. The bar's full width is `basePrice`, which is why it is never shown
 * as a price of its own — it is the denominator that makes the column readable.
 *
 * Vendors paying nothing are dropped. A row reading zero says only that `sellPrices` is six wide,
 * which is a fact about the format rather than about the item.
 *
 * This is the one place barter costs are printed in full rather than folded behind a mark: the
 * detail page is where the evidence goes.
 */

export interface VendorLedgerProps {
    stats: TradeStats;
    /** Resolves a barter cost's `itemId` to the item, so each cost draws as a chip. */
    resolve: ResolveItem;
    className?: string;
}

/** Buy offers grouped by vendor, so each vendor's row carries its own listings. */
function offersByVendor(stats: TradeStats): Map<string, BuyOffer[]> {
    const grouped = new Map<string, BuyOffer[]>();
    for (const offer of offersByLevel(stats)) {
        const existing = grouped.get(offer.vendor);
        if (existing) existing.push(offer);
        else grouped.set(offer.vendor, [offer]);
    }
    return grouped;
}

function OfferDetail({ offer, resolve }: { offer: BuyOffer; resolve: ResolveItem }) {
    const bundled = (offer.bundle ?? 1) > 1;
    const isBarter = (offer.exchange?.length ?? 0) > 0;

    return (
        <div className="space-y-1">
            <div className="flex items-baseline gap-2.5">
                {/* A barter listing is paid in goods, so it gets the mark where a price would go. */}
                {isBarter ? (
                    <BarterMark variant="label" />
                ) : (
                    <Price amount={offer.price} size="sm" tone="body" unit={false} />
                )}
                {/* The mark above already carries the arrows, so the tag does not repeat them. */}
                <VendorTag
                    vendor={offer.vendor}
                    offer={offer}
                    barter={false}
                    showIcon={false}
                />
                {bundled && (
                    <span className="micro-label text-ink-700">{`×${offer.bundle} per restock`}</span>
                )}
            </div>
            <BarterCosts costs={offer.exchange ?? []} resolve={resolve} />
        </div>
    );
}

export default function VendorLedger({ stats, resolve, className }: VendorLedgerProps) {
    const payouts = payersByAmount(stats);
    const buying = offersByVendor(stats);
    const base = baseValue(stats);

    if (!isPriced(stats)) {
        return (
            <div className={cn('bg-steel-900 border border-line-900 p-4', className)}>
                <div className="eyebrow mb-2">Trade</div>
                <p className="text-sm text-ink-600">
                    No vendor in the extracted data trades this item, in either direction.
                </p>
            </div>
        );
    }

    // A vendor that only sells still deserves a row: "they will sell it but not buy it" is an answer.
    const sellOnly = [...buying.keys()].filter(
        (vendor) => !payouts.some((payout) => payout.vendor === vendor),
    );
    const rows: { vendor: string; amount: number }[] = [
        ...payouts.map((payout) => ({ vendor: payout.vendor as string, amount: payout.amount })),
        ...sellOnly.map((vendor) => ({ vendor, amount: 0 })),
    ];

    return (
        <div className={cn('bg-steel-900 border border-line-900', className)}>
            <div className="flex items-baseline justify-between px-4 pt-4 pb-3">
                <span className="eyebrow">Vendor ledger</span>
                <span className="font-mono text-[10px] uppercase text-ink-700">
                    {`Best ${formatAmount(base)} EZD`}
                </span>
            </div>

            <div className="flex items-baseline justify-between gap-4 px-4 pb-1 border-b border-line-900">
                <span className="eyebrow">Vendor</span>
                <span className="eyebrow">Pays you</span>
            </div>

            <div className="divide-y divide-line-900">
                {rows.map(({ vendor, amount }) => {
                    const offers = buying.get(vendor) ?? [];
                    const info = getVendor(vendor);
                    const share = base > 0 ? Math.max(0, Math.min(1, amount / base)) : 0;
                    const isTop = amount > 0 && amount === base;

                    return (
                        <div key={vendor} className="px-4 py-3">
                            <div className="flex items-start gap-2.5">
                                {info?.icon && (
                                    <Image
                                        src={info.icon}
                                        alt=""
                                        width={22}
                                        height={22}
                                        unoptimized
                                        className={cn('shrink-0 mt-px', !isTop && 'opacity-70')}
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div
                                        className={cn(
                                            'text-sm truncate',
                                            isTop ? 'text-ink-hi' : 'text-ink-400',
                                        )}
                                    >
                                        {info?.org ?? vendor.toUpperCase()}
                                    </div>
                                    <div className="micro-label text-ink-700 mt-0.5 truncate">
                                        {info?.merchant ?? 'Hideout workbench'}
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div
                                        className={cn(
                                            'font-mono tabular text-sm',
                                            isTop ? 'text-ink-hi' : 'text-ink-500',
                                        )}
                                    >
                                        {amount > 0 ? formatAmount(amount) : '—'}
                                    </div>
                                    <div className="h-1 w-20 bg-track mt-1.5 ml-auto" aria-hidden="true">
                                        <div
                                            className={cn('h-full', isTop ? 'bg-ink-400' : 'bg-line-500')}
                                            style={{ width: `${share * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* The buy side, under the vendor it belongs to rather than beside it:
                                the ledger lives in a 340px pane and a third column cannot fit one. */}
                            {offers.length > 0 && (
                                <div className="mt-2.5 ml-1 pl-3 border-l border-line-800 space-y-2">
                                    <div className="eyebrow">Sells it to you</div>
                                    {offers.map((offer, i) => (
                                        <OfferDetail
                                            key={`${offer.vendor}-${offer.level}-${i}`}
                                            offer={offer}
                                            resolve={resolve}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

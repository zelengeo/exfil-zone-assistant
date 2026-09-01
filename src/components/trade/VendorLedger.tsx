import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    baseValue,
    formatAmount,
    isPriced,
    offersByLevel,
    payersByAmount,
    vendorLabel,
    vendorMerchant,
} from '@/lib/trade';
import type { BuyOffer, TradeStats } from '@/types/trade';
import BarterCosts from './BarterCosts';

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
 */

export interface VendorLedgerProps {
    stats: TradeStats;
    /** Resolves a barter cost's `itemId` to a display name. */
    nameOf: (itemId: string) => string | undefined;
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

function OfferDetail({ offer, nameOf }: { offer: BuyOffer; nameOf: (id: string) => string | undefined }) {
    const gated = (offer.requiresTasks?.length ?? 0) > 0;
    const bundled = (offer.bundle ?? 1) > 1;

    return (
        <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
                <span className="font-mono tabular text-sm text-ink-200">{formatAmount(offer.price)}</span>
                <span className="micro-label text-ink-700">L{offer.level}</span>
                {bundled && (
                    <span className="micro-label text-ink-700">×{offer.bundle} per restock</span>
                )}
                {gated && (
                    <span className="micro-label text-warn inline-flex items-center gap-1">
                        <Lock size={9} aria-hidden="true" />
                        task
                    </span>
                )}
            </div>
            <BarterCosts costs={offer.exchange ?? []} nameOf={nameOf} />
        </div>
    );
}

export default function VendorLedger({ stats, nameOf, className }: VendorLedgerProps) {
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
                    Best {formatAmount(base)} EZD
                </span>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)] gap-x-4 px-4 pb-1 border-b border-line-900">
                <span className="eyebrow">Vendor</span>
                <span className="eyebrow text-right">Pays you</span>
                <span className="eyebrow">Sells it to you</span>
            </div>

            <div className="divide-y divide-line-900">
                {rows.map(({ vendor, amount }) => {
                    const offers = buying.get(vendor) ?? [];
                    const merchant = vendorMerchant(vendor);
                    const share = base > 0 ? Math.max(0, Math.min(1, amount / base)) : 0;
                    const isTop = amount > 0 && amount === base;

                    return (
                        <div
                            key={vendor}
                            className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)] gap-x-4 items-start px-4 py-3"
                        >
                            <div className="min-w-0">
                                <div
                                    className={cn(
                                        'text-sm truncate',
                                        isTop ? 'text-ink-hi' : 'text-ink-400',
                                    )}
                                >
                                    {vendorLabel(vendor)}
                                </div>
                                {merchant && (
                                    <div className="micro-label text-ink-700 mt-0.5">{merchant}</div>
                                )}
                            </div>

                            <div className="text-right">
                                <div
                                    className={cn(
                                        'font-mono tabular text-sm',
                                        isTop ? 'text-ink-hi' : 'text-ink-500',
                                    )}
                                >
                                    {amount > 0 ? formatAmount(amount) : '—'}
                                </div>
                                <div className="h-1 w-24 bg-track mt-1.5" aria-hidden="true">
                                    <div
                                        className={cn('h-full', isTop ? 'bg-ink-400' : 'bg-line-500')}
                                        style={{ width: `${share * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="min-w-0">
                                {offers.length ? (
                                    <div className="space-y-2">
                                        {offers.map((offer, i) => (
                                            <OfferDetail
                                                key={`${offer.vendor}-${offer.level}-${i}`}
                                                offer={offer}
                                                nameOf={nameOf}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <span className="font-mono text-xs text-ink-700">—</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import InfoPopover from '@/components/ui/info-popover';
import { PopoverHeading, PopoverNote } from '@/components/ui/popover';
import { cheapestOffer, formatAmount, hasBarter, offersByLevel } from '@/lib/trade';
import { collectGates } from '@/lib/gates';
import { vendorOrg } from '@/lib/vendors';
import type { BuyOffer, TradeStats } from '@/types/trade';
import VendorTag, { type VendorTagSize } from './VendorTag';
import BarterMark from './BarterMark';
import BarterCosts, { type ResolveItem } from './BarterCosts';
import GateList from './GateList';

/**
 * Where a thing comes from — four glyphs and a number, and the whole shop one hover away.
 *
 * The face is deliberately wordless and a fixed width: organisation mark, lock, barter arrows,
 * loyalty level. It carried the vendor's name too, which made it the longest thing on a list row
 * and said the least per pixel — the mark identifies ARK faster than the letters A-R-K do, and the
 * name is in the popover along with everything else the reader might have wanted it for. Both
 * glyph slots are always drawn, greyed out where they do not apply, so a column of chips lines up
 * rather than jittering by two glyphs from row to row.
 *
 * Inside, the offers split by what they actually cost. A money listing goes under **Sold by** with
 * its price; a barter listing goes under **Barter** with the items it demands and no price at all,
 * because a barter is paid in goods. Gates — the tasks an offer waits on and the DLC it needs —
 * are collected into one **Locked by** section rather than repeated per row.
 *
 * The wiki tracks neither a player's loyalty levels nor their purchases, so nothing here locks
 * anything: a requirement is information. What it answers is "can I actually buy this yet".
 */

export interface AvailabilityChipProps {
    stats: TradeStats;
    /** Matched to the line it sits on. A list row wants `lg`; a dense popover row wants `sm`. */
    size?: VendorTagSize;
    /** Resolves a barter cost to an item, so the popover can draw chips instead of ids. */
    resolve?: ResolveItem;
    /** Off inside a card or a row: both are already links, which may not contain a button. */
    interactive?: boolean;
    className?: string;
}

const isBarterOffer = (offer: BuyOffer) => (offer.exchange?.length ?? 0) > 0;

const FACE_TEXT: Record<VendorTagSize, string> = {
    sm: 'micro-label',
    md: 'eyebrow',
    lg: 'eyebrow',
};

export default function AvailabilityChip({
    stats,
    size = 'sm',
    resolve,
    interactive = true,
    className,
}: AvailabilityChipProps) {
    const offers = offersByLevel(stats);
    const best = cheapestOffer(stats);

    if (!best) {
        const face = <span className={cn(FACE_TEXT[size], 'text-ink-700')}>No offer</span>;
        if (!interactive) return <span className={className}>{face}</span>;
        return (
            <InfoPopover trigger={face} className={className} side="top" align="start">
                <PopoverHeading>Not sold</PopoverHeading>
                <p className="text-xs text-ink-400">
                    No vendor in the extracted data sells this. It is found in raid, or it comes on a
                    preset.
                </p>
            </InfoPopover>
        );
    }

    // No "+2" for the offers behind this one: the count is not a fact anyone acts on, and it was
    // the one thing making the chip's width vary again after the glyph slots were fixed.
    const face = (
        <VendorTag
            vendor={best.vendor}
            offer={best}
            barter={hasBarter(stats)}
            size={size}
            compact
            interactive={false}
        />
    );

    if (!interactive) return <span className={cn('inline-flex', className)}>{face}</span>;

    const sold = offers.filter((offer) => !isBarterOffer(offer));
    const bartered = offers.filter(isBarterOffer);
    const gates = collectGates(offers);

    return (
        <InfoPopover
            trigger={face}
            label="Every vendor that sells this"
            className={className}
            side="top"
            align="start"
        >
            {sold.length > 0 && (
                <>
                    <PopoverHeading>Sold by</PopoverHeading>
                    <ul className="space-y-1.5">
                        {sold.map((offer, i) => (
                            <li
                                key={`${offer.vendor}-${offer.level}-${i}`}
                                className="flex items-baseline justify-between gap-4"
                            >
                                <VendorTag vendor={offer.vendor} offer={offer} interactive={false} />
                                <span className="font-mono tabular text-xs text-ink-200 shrink-0">
                                    {formatAmount(offer.price)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {bartered.length > 0 && (
                <div className={cn(sold.length > 0 && 'mt-3 pt-2.5 border-t border-line-700')}>
                    <BarterMark variant="label" className="mb-2" />
                    <ul className="space-y-2">
                        {bartered.map((offer, i) => (
                            <li key={`${offer.vendor}-${offer.level}-${i}`}>
                                {/* The section heading already carries the arrows. */}
                                <VendorTag
                                    vendor={offer.vendor}
                                    offer={offer}
                                    barter={false}
                                    interactive={false}
                                />
                                {resolve ? (
                                    <BarterCosts
                                        costs={offer.exchange ?? []}
                                        resolve={resolve}
                                        className="mt-1 pl-1"
                                    />
                                ) : (
                                    <span className="micro-label text-ink-700 block mt-1 pl-1">
                                        {`${offer.exchange?.length ?? 0} items`}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <GateList gates={gates} className="mt-3 pt-2.5 border-t border-line-700" />

            <PopoverNote>
                {`First reachable at ${vendorOrg(best.vendor)} L${best.level}. The wiki tracks neither your loyalty levels nor your purchases, so nothing here is locked.`}
            </PopoverNote>
        </InfoPopover>
    );
}

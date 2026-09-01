'use client';

import React from 'react';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import InfoPopover from '@/components/ui/info-popover';
import { PopoverNote, PopoverRow } from '@/components/ui/popover';
import { formatAmount } from '@/lib/trade';
import { offerGates } from '@/lib/gates';
import { getVendor, reputationForLevel } from '@/lib/vendors';
import type { BuyOffer } from '@/types/trade';
import BarterMark from './BarterMark';
import GateList from './GateList';

/**
 * A vendor, and how far into their good books you have to be — the app's unit of "where from".
 *
 * `BENCH L3` was being spelled four different ways: a dashed chip in `AvailabilityChip`, a bare
 * `L{level}` micro-label in `VendorLedger`, a joined string in `BuildSummary`, and a mono line in
 * `WantedInBarter`. Same fact, four typographies, and none of them said who the trader was or what
 * reputation the level costs.
 *
 * In `compact` mode the face is a fixed shape — mark, lock, barter, level — with both glyph slots
 * always drawn and greyed out where they do not apply. Down a list column that fixed width is the
 * point: chips that grow and shrink turn the column's ragged edge into the loudest signal on it,
 * and a reader ends up reading the raggedness instead of the glyphs. The organisation's own mark
 * identifies it faster than its name does, so the name is one hover away with everything else.
 *
 * Nothing here ever disables anything. The wiki tracks neither a player's loyalty levels nor their
 * purchases, so a requirement is information, not a gate — the rule the gunsmith set, kept.
 */

/** `stock: -1` is the extraction's way of writing "restocks without limit", not a count. */
function stockLabel(offer: BuyOffer): string {
    const count = (offer.stock ?? 0) < 0 ? 'Unlimited' : formatAmount(offer.stock ?? 0);
    return offer.resetType ? `${count} · ${offer.resetType}` : count;
}

export type VendorTagSize = 'sm' | 'md' | 'lg';

export interface VendorTagProps {
    vendor: string;
    /** The loyalty level this tag stands for. Omitted where the tag names the vendor alone. */
    level?: number;
    /** The listing behind the tag, when there is one — its price and terms fill the popover. */
    offer?: BuyOffer;
    /**
     * Whether to DRAW the barter glyph lit. Defaults to whether this offer is itself a barter. Pass
     * it explicitly where the tag stands for a whole item rather than one listing, or `false` where
     * a section heading above the tag already carries the arrows. It does not change whether the
     * listing is treated as a barter — that is always the offer's own `exchange`.
     */
    barter?: boolean;
    size?: VendorTagSize;
    /** The organisation's mark. Dropped in dense rows where the name is enough. */
    showIcon?: boolean;
    /** Drop the name and keep the marks, in a fixed-width face: mark · lock · barter · level. */
    compact?: boolean;
    /**
     * Whether the tag reveals its detail. Off inside a card or a row, which are already links —
     * a popover trigger is a button and may not live inside one.
     */
    interactive?: boolean;
    className?: string;
}

const METRICS: Record<VendorTagSize, { icon: number; glyph: number; text: string; level: string }> = {
    sm: { icon: 12, glyph: 9, text: 'micro-label', level: 'text-[9px]' },
    md: { icon: 16, glyph: 11, text: 'eyebrow', level: 'text-[11px]' },
    lg: { icon: 20, glyph: 13, text: 'eyebrow', level: 'text-[13px]' },
};

export default function VendorTag({
    vendor,
    level,
    offer,
    barter,
    size = 'sm',
    showIcon = true,
    compact = false,
    interactive = true,
    className,
}: VendorTagProps) {
    const info = getVendor(vendor);
    const shownLevel = level ?? offer?.level;
    const gates = offerGates(offer);
    const gated = gates.length > 0;

    // Two different questions. Whether the listing IS a barter decides whether it has a money row;
    // whether to DRAW the arrows lit is a call for the caller, who may already have said so in a
    // section heading right above this tag.
    const offerIsBarter = (offer?.exchange?.length ?? 0) > 0;
    const showBarterMark = barter ?? offerIsBarter;

    const metrics = METRICS[size];

    const face = (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 leading-none text-ink-500',
                metrics.text,
            )}
        >
            {showIcon && info?.icon && (
                <Image
                    src={info.icon}
                    alt={compact ? info.org : ''}
                    title={compact ? info.org : undefined}
                    width={metrics.icon}
                    height={metrics.icon}
                    unoptimized
                    className="shrink-0 opacity-80"
                />
            )}
            {/* Compact holds both slots open so a column of these lines up. */}
            {(gated || compact) && (
                <Lock
                    size={metrics.glyph}
                    aria-hidden="true"
                    className={cn('shrink-0', gated ? 'text-warn' : 'text-line-600')}
                />
            )}
            {(showBarterMark || compact) && (
                <BarterMark size={metrics.glyph} inactive={!showBarterMark} />
            )}
            {!compact && <span className="text-ink-400">{info?.short ?? vendor.toUpperCase()}</span>}
            {typeof shownLevel === 'number' && (
                <span className={cn('font-mono tabular text-ink-500', metrics.level)}>
                    L{shownLevel}
                </span>
            )}
        </span>
    );

    if (!interactive) {
        return <span className={cn('inline-flex', className)}>{face}</span>;
    }

    const reputation =
        typeof shownLevel === 'number' ? reputationForLevel(vendor, shownLevel) : null;
    const bundled = (offer?.bundle ?? 1) > 1;

    return (
        <InfoPopover
            trigger={face}
            label={`${info?.org ?? vendor}${shownLevel ? ` loyalty level ${shownLevel}` : ''}`}
            className={className}
            side="top"
            align="start"
        >
            <div className="flex items-center gap-2.5 pb-2 mb-2 border-b border-line-700">
                {info?.icon && (
                    <Image
                        src={info.icon}
                        alt=""
                        width={28}
                        height={28}
                        unoptimized
                        className="shrink-0"
                    />
                )}
                <span className="min-w-0">
                    <span className="block font-display uppercase text-sm text-ink-100 leading-tight">
                        {info?.org ?? vendor.toUpperCase()}
                    </span>
                    {info?.merchant && (
                        <span className="micro-label text-ink-700">{info.merchant}</span>
                    )}
                </span>
            </div>

            {typeof shownLevel === 'number' && (
                <PopoverRow label="Loyalty level" value={`L${shownLevel}`} />
            )}
            {reputation !== null && reputation > 0 && (
                <PopoverRow label="Reputation needed" value={formatAmount(reputation)} />
            )}
            {/* A barter listing is paid in items, so it has no money row. See `AvailabilityChip`. */}
            {offer && !offerIsBarter && (
                <PopoverRow label="Price" value={`${formatAmount(offer.price)} EZD`} />
            )}
            {bundled && <PopoverRow label="Bundle" value={`×${offer?.bundle}`} />}
            {typeof offer?.stock === 'number' && (
                <PopoverRow label="Stock" value={stockLabel(offer)} />
            )}

            <GateList gates={gates} className="mt-2.5 pt-2.5 border-t border-line-700" />

            <PopoverNote>
                {typeof shownLevel === 'number' && reputation === null
                    ? 'This vendor publishes no loyalty tiers.'
                    : 'The wiki tracks neither your loyalty levels nor your purchases, so nothing here is locked.'}
            </PopoverNote>
        </InfoPopover>
    );
}

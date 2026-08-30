'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { corps } from '@/data/tasks';
import { cn } from '@/lib/utils';
import type { BuyOffer, GunsmithPart } from '@/types/gunsmith';

/**
 * Where a part comes from.
 *
 * The wiki does not track a player's trader levels, so nothing here locks anything — an unlock
 * requirement is information, not a gate. What it answers is "can I actually buy this yet", which
 * is the question a build plan lives or dies by.
 */

/** `gunsmith` is the hideout workbench rather than a trader, so it is not in `corps`. */
const VENDOR_LABELS: Record<string, string> = { gunsmith: 'GUNSMITH BENCH' };

export function vendorLabel(vendor: string): string {
    return VENDOR_LABELS[vendor] ?? corps[vendor]?.name ?? vendor.toUpperCase();
}

/** The offer a player reaches first: lowest loyalty level, then cheapest. */
export function cheapestOffer(part: GunsmithPart): BuyOffer | null {
    const offers = part.stats.buyOffers ?? [];
    if (!offers.length) return null;
    return [...offers].sort((a, b) => a.level - b.level || a.price - b.price)[0];
}

const currency = (value: number): string => value.toLocaleString('en-US');

interface PartAvailabilityProps {
    part: GunsmithPart;
    className?: string;
}

export default function PartAvailability({ part, className }: PartAvailabilityProps) {
    const offers = part.stats.buyOffers ?? [];
    const best = cheapestOffer(part);

    if (!best) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        className={cn(
                            'micro-label border border-dashed border-line-600 text-ink-700 px-1.5 py-0.5 cursor-help',
                            className,
                        )}
                    >
                        No offer
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-64">
                    No trader in the extracted data sells this part. It is found in raid, or it comes
                    on a preset.
                </TooltipContent>
            </Tooltip>
        );
    }

    const gated = offers.some((offer) => (offer.requiresTasks?.length ?? 0) > 0);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    className={cn(
                        'micro-label border border-dashed border-line-600 text-ink-600 px-1.5 py-0.5 cursor-help inline-flex items-center gap-1',
                        className,
                    )}
                >
                    {gated && <Lock size={9} aria-hidden="true" />}
                    {`${vendorLabel(best.vendor)} L${best.level}`}
                </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-72">
                <div className="space-y-1">
                    {offers
                        .slice()
                        .sort((a, b) => a.level - b.level)
                        .map((offer, i) => (
                            <div key={`${offer.vendor}-${offer.level}-${i}`} className="font-mono text-[11px]">
                                {`${vendorLabel(offer.vendor)} · loyalty ${offer.level} · ${currency(offer.price)}`}
                                {(offer.requiresTasks?.length ?? 0) > 0 && ' · task-locked'}
                            </div>
                        ))}
                    <p className="text-[11px] text-ink-500 pt-1">
                        The wiki does not track your trader levels, so nothing is locked here.
                    </p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

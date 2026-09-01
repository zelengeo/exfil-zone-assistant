'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { cheapestOffer, formatAmount, isTaskGated, offersByLevel, vendorLabel } from '@/lib/trade';
import type { TradeStats } from '@/types/trade';

/**
 * Where a thing comes from — one chip, naming the offer a player reaches first.
 *
 * The wiki does not track a player's trader levels, so nothing here locks anything: an unlock
 * requirement is information, not a gate. What it answers is "can I actually buy this yet".
 *
 * Moved out of `components/gunsmith/PartAvailability.tsx` and retyped against `TradeStats`, since
 * gunsmith parts and catalogue items carry the same price block.
 */

export interface AvailabilityChipProps {
    stats: TradeStats;
    className?: string;
}

export default function AvailabilityChip({ stats, className }: AvailabilityChipProps) {
    const offers = offersByLevel(stats);
    const best = cheapestOffer(stats);

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
                    No vendor in the extracted data sells this. It is found in raid, or it comes on a
                    preset.
                </TooltipContent>
            </Tooltip>
        );
    }

    const gated = isTaskGated(stats);

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
                    {offers.map((offer, i) => (
                        <div key={`${offer.vendor}-${offer.level}-${i}`} className="font-mono text-[11px]">
                            {`${vendorLabel(offer.vendor)} · loyalty ${offer.level} · ${formatAmount(offer.price)}`}
                            {(offer.requiresTasks?.length ?? 0) > 0 && ' · task-locked'}
                            {(offer.exchange?.length ?? 0) > 0 && ' · barter'}
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

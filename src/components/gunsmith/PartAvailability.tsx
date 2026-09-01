'use client';

import React from 'react';
import AvailabilityChip from '@/components/trade/AvailabilityChip';
import { cheapestOffer as cheapestOfferForStats, vendorLabel as sharedVendorLabel } from '@/lib/trade';
import type { BuyOffer, GunsmithPart } from '@/types/gunsmith';

/**
 * Where a part comes from.
 *
 * The logic moved to `lib/trade.ts` and `components/trade/AvailabilityChip.tsx` when the items
 * route needed the same answers — parts and catalogue items carry the same price block. What is
 * left here is the part-shaped signature the bench already calls, so the gunsmith route did not
 * have to change in the same commit.
 */

export const vendorLabel = sharedVendorLabel;

/** The offer a player reaches first: lowest loyalty level, then cheapest. */
export function cheapestOffer(part: GunsmithPart): BuyOffer | null {
    return cheapestOfferForStats(part.stats);
}

interface PartAvailabilityProps {
    part: GunsmithPart;
    className?: string;
}

export default function PartAvailability({ part, className }: PartAvailabilityProps) {
    return <AvailabilityChip stats={part.stats} className={className} />;
}

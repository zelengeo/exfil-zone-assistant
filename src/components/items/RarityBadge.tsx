import React from 'react';
import {ItemRarity, RARITY_CONFIG} from '@/types/items';
import {cn} from '@/lib/utils';

/**
 * The one way an item's rarity is shown.
 *
 * Rarity was rendered three different ways across the items views — a bare span here, a bordered
 * block there — and all of them came out grey. The cause was composition, not the palette:
 * `.micro-label` sets `text-ink-600`, and because it is declared in globals.css after Tailwind's
 * utilities, it beat the rarity colour passed beside it every time. So this component brings its
 * own type styles rather than borrowing that utility.
 *
 * The tier name is always printed. That is deliberate: six hues on a dark ground cannot all clear
 * colourblind separation (blue and purple are the same colour to a deuteranope), so the word is
 * the identity channel and the colour is the fast one.
 */

export type RarityBadgeVariant = 'label' | 'chip';

export interface RarityBadgeProps {
    rarity: ItemRarity;
    /** `label` is bare tinted text; `chip` adds the tier's border and tinted surface. */
    variant?: RarityBadgeVariant;
    className?: string;
}

/** Matches `.micro-label` in everything but the colour, which is the tier's to set. */
const TYPE = 'font-mono text-[9px] tracking-micro uppercase leading-none';

export default function RarityBadge({rarity, variant = 'label', className}: RarityBadgeProps) {
    const config = RARITY_CONFIG[rarity];

    return (
        <span
            className={cn(
                TYPE,
                config.textColor,
                variant === 'chip' && cn('inline-flex items-center px-1.5 py-1 border', config.borderClass, config.bgClass),
                className,
            )}
        >
            {config.name}
        </span>
    );
}

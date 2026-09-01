import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * That an offer is a barter — one glyph, two densities, no other meaning.
 *
 * `mark` is the bare arrows, for a face that has no room for a word: on an availability line it
 * sits between the task lock and the loyalty level, and the reader learns the same thing the lock
 * teaches them — that this purchase asks for something they may not be carrying.
 *
 * `inactive` draws it as a ghost instead of dropping it. A column of chips where some carry two
 * glyphs and some carry none is a ragged column, and the eye reads the ragged edge as meaning
 * before it reads the glyphs; holding the slot open makes the lit ones legible as a set. It is
 * `aria-hidden` in that state — a ghost is a layout device, not a fact.
 *
 * `label` adds the word, for the popover section the costs are listed under.
 *
 * Deliberately says nothing about *what* it costs. That is `BarterCosts`, which renders the list
 * once and is printed inline by the ledger and inside a popover everywhere else.
 */

export interface BarterMarkProps {
    variant?: 'mark' | 'label';
    /** Hold the slot open without claiming the offer is a barter. `mark` only. */
    inactive?: boolean;
    /** Glyph size in px, matched to the face it sits on. `mark` only. */
    size?: number;
    className?: string;
}

export default function BarterMark({
    variant = 'mark',
    inactive = false,
    size = 9,
    className,
}: BarterMarkProps) {
    if (variant === 'mark') {
        return (
            <ArrowLeftRight
                size={size}
                className={cn('shrink-0', inactive ? 'text-line-600' : 'text-info', className)}
                aria-label={inactive ? undefined : 'barter'}
                aria-hidden={inactive || undefined}
            />
        );
    }

    return (
        <span className={cn('eyebrow inline-flex items-center gap-1.5 text-info', className)}>
            <ArrowLeftRight size={10} aria-hidden="true" className="shrink-0" />
            Barter
        </span>
    );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
    ARMOR_CLASS_STEPS,
    UNCOVERED_COLOR,
    armorClassColor,
    armorClassLabel,
    armorClassStep,
} from '@/lib/protection/armorClassScale';

/**
 * A figure on the 1–6 ladder, drawn.
 *
 * Penetration and armour class are the same axis: `GetIsPenetrated` reads its curve on
 * `armourClass − penetration`, so a class 4 vest and a pen 4 round are directly comparable
 * quantities and the reader's whole question is which of the two is larger. Drawing both on one
 * six-rung ladder in the shared class colours makes that a glance instead of an arithmetic problem
 * — and it is the reason ammunition finally reads as the equal of armour on this page, rather than
 * as a name in the margin.
 *
 * `armorClassScale` records that this palette is categorical and does not clear colourblind
 * separation between non-adjacent rungs, so nothing here is colour alone: the rungs are a filled
 * count, and the figure prints beside them.
 */

export interface ClassLadderProps {
    value: number;
    /** A second, lower reading drawn hollow behind the first — a worn vest's remaining class. */
    weakened?: number;
    /** Prints the number beside the rungs. */
    showValue?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

const RUNG: Record<NonNullable<ClassLadderProps['size']>, string> = {
    sm: 'w-1 h-3',
    md: 'w-1.5 h-4',
};

export default function ClassLadder({
    value, weakened, showValue = true, size = 'md', className,
}: ClassLadderProps) {
    const filled = armorClassStep(value);
    // The worn reading never draws above the sticker one; a rounding wobble that showed a degraded
    // vest gaining a rung would be worse than showing it flat.
    const remaining = weakened === undefined ? filled : Math.min(filled, armorClassStep(weakened));
    const colour = armorClassColor(value);

    return (
        <span className={cn('inline-flex items-center gap-1.5', className)}>
            <span className="inline-flex items-end gap-0.5" aria-hidden="true">
                {ARMOR_CLASS_STEPS.map((step) => (
                    <span
                        key={step}
                        className={cn(RUNG[size], 'shrink-0')}
                        style={{
                            backgroundColor: step <= remaining ? colour : UNCOVERED_COLOR,
                            // Between the two readings: the rung the piece has lost to wear.
                            opacity: step > remaining && step <= filled ? 0.85 : 1,
                            outline: step > remaining && step <= filled ? `1px solid ${colour}` : undefined,
                            outlineOffset: '-1px',
                        }}
                    />
                ))}
            </span>
            {showValue && (
                <span className="font-mono tabular text-xs text-ink-300 shrink-0">
                    {weakened === undefined || armorClassStep(weakened) === filled
                        ? armorClassLabel(value)
                        : `${armorClassLabel(Number(weakened.toFixed(1)))}\u2009/\u2009${armorClassLabel(value)}`}
                </span>
            )}
        </span>
    );
}

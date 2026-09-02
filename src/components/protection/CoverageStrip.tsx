import React from 'react';
import { cn } from '@/lib/utils';
import { coveragePips, hasAnyCoverage, type Pip } from '@/lib/protection/summary';
import { armorClassColor, UNCOVERED_COLOR } from '@/lib/protection/armorClassScale';
import type { ProtectiveZone } from '@/types/items';

/**
 * Seven pips: what this gear covers, at a glance.
 *
 * A static SVG, never a canvas. Forty cards would be forty projection loops for a picture five
 * millimetres tall, and the card's job is to help someone choose which item to open — the honest
 * geometry waits for them on the detail page.
 */

/**
 * Armour class to fill, on the shared ladder.
 *
 * This was its own monochrome ramp, on the reasoning that class is an amount rather than a
 * category. It is an amount — but the detail page now draws the same amount in the rarity ladder's
 * hues, and one quantity drawn two ways across two views of the same item is worse than either
 * choice on its own. The strip is five millimetres tall and carries no figure, so it is the one
 * surface where the colour does stand alone: it is a "which of these should I open" cue, and the
 * page it opens states the class in writing.
 */
function fillFor(pip: Pip): string {
    // A pip's 0 is `coveragePips` saying no zone reached this part — an absence, not a rating.
    return pip.armorClass > 0 ? armorClassColor(pip.armorClass) : UNCOVERED_COLOR;
}

export interface CoverageStripProps {
    protectiveData: ProtectiveZone[] | undefined;
    className?: string;
}

const PIP_W = 7;
const GAP = 2;
const H = 10;

export default function CoverageStrip({ protectiveData, className }: CoverageStripProps) {
    const pips = coveragePips(protectiveData);
    if (!hasAnyCoverage(pips)) return null;

    const width = pips.length * PIP_W + (pips.length - 1) * GAP;
    const covered = pips.filter((pip) => pip.armorClass > 0);
    const label = `Covers ${covered.map((pip) => pip.label.toLowerCase()).join(', ')}`;

    return (
        <svg
            viewBox={`0 0 ${width} ${H}`}
            width={width}
            height={H}
            className={cn('shrink-0', className)}
            role="img"
            aria-label={label}
        >
            {pips.map((pip, i) => {
                // A partial wedge draws short: it covers an arc, not the whole bone.
                const h = pip.armorClass === 0 ? H : pip.partial ? H * 0.5 : H;
                return (
                    <rect
                        key={pip.part}
                        x={i * (PIP_W + GAP)}
                        y={H - h}
                        width={PIP_W}
                        height={h}
                        fill={fillFor(pip)}
                    />
                );
            })}
        </svg>
    );
}

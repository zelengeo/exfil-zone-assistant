import React from 'react';
import { cn } from '@/lib/utils';
import { coveragePips, hasAnyCoverage, type Pip } from '@/lib/protection/summary';
import type { ProtectiveZone } from '@/types/items';

/**
 * Seven pips: what this gear covers, at a glance.
 *
 * A static SVG, never a canvas. Forty cards would be forty projection loops for a picture five
 * millimetres tall, and the card's job is to help someone choose which item to open — the honest
 * geometry waits for them on the detail page.
 */

/** Armour class to fill. The ramp is monochrome on purpose: class is an amount, not a category. */
const CLASS_FILL: Record<number, string> = {
    0: '#28323B', // track — covered by nothing
    2: '#4C5A66',
    3: '#5C6E7C',
    4: '#7E909F',
    5: '#A9BAC6',
    6: '#ECF2F7',
};

function fillFor(pip: Pip): string {
    return CLASS_FILL[pip.armorClass] ?? (pip.armorClass > 6 ? CLASS_FILL[6] : CLASS_FILL[0]);
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

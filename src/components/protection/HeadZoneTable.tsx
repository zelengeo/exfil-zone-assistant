import React from 'react';
import { cn } from '@/lib/utils';
import type { HeadCoverage } from '@/lib/protection/headCoverage';
import type { HeadZoneName } from '@/lib/protection/headModel';

/**
 * The numbers behind the picture: what share of each part of the head is actually protected.
 *
 * One armour class covers the whole head — the geometry decides *whether* it applies to a hit,
 * never *how much* (docs/HEAD_PROTECTION.md §4) — so unlike the vest table there is no per-zone
 * class column. There is nothing to put in it.
 */

const ZONE_LABELS: Record<HeadZoneName, string> = {
    face: 'Face',
    jaw: 'Jaw',
    brow: 'Brow',
    crown: 'Crown',
    sides: 'Sides & ears',
    nape: 'Nape',
    other: 'Elsewhere',
};

export interface HeadZoneTableProps {
    coverage: HeadCoverage;
    className?: string;
}

export default function HeadZoneTable({ coverage, className }: HeadZoneTableProps) {
    return (
        <div className={cn('min-w-0', className)}>
            <div className="grid grid-cols-[minmax(0,1fr)_4rem] gap-x-3 px-2 pb-1.5 border-b border-line-900">
                <span className="eyebrow">Zone</span>
                <span className="eyebrow text-right">Protected</span>
            </div>

            <div className="divide-y divide-line-900">
                {coverage.zones.map((zone) => {
                    const percent = Math.round(zone.fraction * 100);
                    const any = zone.fraction > 0.005;
                    return (
                        <div
                            key={zone.zone}
                            className="grid grid-cols-[minmax(0,1fr)_4rem] gap-x-3 items-center px-2 py-1.5"
                        >
                            <span className="min-w-0 flex items-center gap-2">
                                <span className={cn('text-xs', any ? 'text-ink-200' : 'text-ink-600')}>
                                    {ZONE_LABELS[zone.zone]}
                                </span>
                                {/* A bar rather than a second number: the eye reads the shape of a
                                    helmet's weak spots faster down a column than it reads six
                                    percentages. */}
                                <span className="flex-1 h-1 bg-track min-w-8" aria-hidden="true">
                                    <span
                                        className="block h-full bg-ink-400"
                                        style={{ width: `${percent}%` }}
                                    />
                                </span>
                            </span>
                            <span
                                className={cn(
                                    'font-mono tabular text-xs text-right',
                                    any ? 'text-ink-100' : 'text-ink-700',
                                )}
                            >
                                {percent}%
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_4rem] gap-x-3 items-baseline px-2 pt-2 mt-1 border-t border-line-800">
                <span className="eyebrow">Whole head</span>
                <span className="font-mono tabular text-sm text-right text-ink-hi">
                    {Math.round(coverage.total * 100)}%
                </span>
            </div>
        </div>
    );
}

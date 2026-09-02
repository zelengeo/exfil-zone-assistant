import React from 'react';
import { cn } from '@/lib/utils';
import type { HeadCoverage, HeadZoneCoverage } from '@/lib/protection/headCoverage';
import type { HeadZoneName } from '@/lib/protection/headModel';

/**
 * The numbers behind the picture: what share of each part of the head is actually protected, and
 * at what class.
 *
 * A single piece carries one armour class for the whole head — the geometry decides *whether* it
 * applies to a hit, never *how much* (docs/HEAD_PROTECTION.md §4) — so the class column is not the
 * vest table's "this plate is thinner than that one". It says *which piece* stops a hit here: a
 * shield fills the helmet's holes with its own class, which is routinely two steps off the
 * helmet's, and the two never stack. Where a zone straddles the boundary both classes are named.
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

/** `0.3` on the TSh-4M is real data; `4.0` on everything else is noise. */
function formatClass(value: number): string {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

const COLUMNS = 'grid grid-cols-[minmax(0,1fr)_3.5rem_4rem] gap-x-3';

export interface HeadZoneTableProps {
    coverage: HeadCoverage;
    className?: string;
}

export default function HeadZoneTable({ coverage, className }: HeadZoneTableProps) {
    const helmetClass = coverage.gear.helmet?.armorClass ?? null;
    const maskClass = coverage.gear.mask?.armorClass ?? null;

    /**
     * The classes actually in force over a zone, in the order a reader meets them: whatever stops
     * the most of the zone first. Deduplicated, because a helmet and its shield sharing a class is
     * one answer, not two.
     */
    function classesFor(zone: HeadZoneCoverage): number[] {
        const owners: Array<[number, number | null]> = [
            [zone.byHelmet, helmetClass],
            [zone.byMask, maskClass],
        ];
        const named = owners
            .filter(([samples, armorClass]) => samples > 0 && armorClass !== null)
            .sort((a, b) => b[0] - a[0])
            .map(([, armorClass]) => armorClass as number);
        return [...new Set(named)];
    }

    // The whole-head row names every class present anywhere, so the footer never claims a single
    // figure a paired set does not have. Ascending, because unlike a row it has no dominant piece
    // to lead with.
    const overall = [...new Set(coverage.zones.flatMap(classesFor))].sort((a, b) => a - b);

    return (
        <div className={cn('min-w-0', className)}>
            <div className={cn(COLUMNS, 'px-2 pb-1.5 border-b border-line-900')}>
                <span className="eyebrow">Zone</span>
                <span className="eyebrow text-right">Class</span>
                <span className="eyebrow text-right">Protected</span>
            </div>

            <div className="divide-y divide-line-900">
                {coverage.zones.map((zone) => {
                    const percent = Math.round(zone.fraction * 100);
                    const any = zone.fraction > 0.005;
                    const classes = classesFor(zone);
                    return (
                        <div
                            key={zone.zone}
                            className={cn(COLUMNS, 'items-center px-2 py-1.5')}
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
                                {classes.length ? classes.map(formatClass).join(' / ') : '—'}
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

            <div className={cn(COLUMNS, 'items-baseline px-2 pt-2 mt-1 border-t border-line-800')}>
                <span className="eyebrow">Whole head</span>
                <span className="font-mono tabular text-sm text-right text-ink-hi">
                    {overall.length ? overall.map(formatClass).join(' / ') : '—'}
                </span>
                <span className="font-mono tabular text-sm text-right text-ink-hi">
                    {Math.round(coverage.total * 100)}%
                </span>
            </div>

            <p className="micro-label text-ink-700 mt-3 leading-relaxed">
                Class is the rating of the piece that stops a hit in that zone, not a per-zone
                thickness — a helmet rates the whole head at one class. Two figures mean the helmet
                covers part of the zone and its shield the rest; they never add up.
            </p>
        </div>
    );
}

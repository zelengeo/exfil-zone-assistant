'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import BodyViewer, { type ZoneOverlay } from '@/components/protection/BodyViewer';
import {
    HEAD_CAPSULE,
    ZONE_GROUPS,
    ZONE_GROUP_LABELS,
    type TargetModel,
    type ZoneGroup,
} from '../utils/target-model';
import {
    formatShots,
    shotsColor,
    SHOTS_RAMP,
    type LoadoutOutcome,
    type ZoneOutcome,
} from '../utils/scenario';

/**
 * The wall of bodies, and the grid beneath it: every ready loadout against the same target, read
 * with the same shots-to-kill ramp.
 *
 * Colour never carries loadout identity here — only `shotsColor(shotsToKill)` — which is the whole
 * point of drawing the body once per loadout instead of overlaying four on one figure. Purely
 * presentational: every number arrives already computed on `LoadoutOutcome`.
 */

export interface CompareViewProps {
    outcomes: LoadoutOutcome[];
    target: TargetModel;
    selectedLoadoutId: string;
    onSelectLoadout: (id: string) => void;
    className?: string;
}

/** The seven pip-strip groups, minus the head — the head splits into Face and Shell instead. */
const BODY_GROUPS = ZONE_GROUPS.filter((group): group is Exclude<ZoneGroup, 'head'> => group !== 'head');

const GRID_TEMPLATE = 'grid-cols-[minmax(168px,1.6fr)_repeat(8,minmax(52px,1fr))_minmax(104px,auto)]';

/** The worst reading in a group — the honest figure for "if I hit them there". */
function worstInGroup(body: ZoneOutcome[], group: ZoneGroup): ZoneOutcome | null {
    return body.reduce<ZoneOutcome | null>(
        (worst, outcome) => (outcome.zone.group === group && (!worst || outcome.shotsToKill > worst.shotsToKill)
            ? outcome
            : worst),
        null,
    );
}

/** The head reading a given piece of gear owns, falling back to the open-head reading. */
function headReading(head: ZoneOutcome[], source: 'mask' | 'helmet'): ZoneOutcome | null {
    return head.find((outcome) => outcome.zone.armour?.source === source)
        ?? head.find((outcome) => outcome.zone.armour === null)
        ?? null;
}

/** Bands for the head capsule: one per reading, sized by its share of the head, colour by its ramp step. */
function headBands(head: ZoneOutcome[]): Array<{ share: number; color: string }> {
    const fallbackShare = head.length > 0 ? 1 / head.length : 1;
    const rawShares = head.map((outcome) => outcome.zone.headShare ?? fallbackShare);
    const total = rawShares.reduce((sum, share) => sum + share, 0) || 1;
    return head.map((outcome, i) => ({ share: rawShares[i] / total, color: shotsColor(outcome.shotsToKill) }));
}

/** Measured arithmetic, never an opinion: how many rounds the plate stopped before it gave up. */
function plateCost(chest: ZoneOutcome | null): string {
    if (!chest || chest.shots.length === 0) return '—';
    const total = chest.shots.length;
    let stopped = 0;
    while (stopped < total && !chest.shots[stopped].isPenetrating) stopped += 1;
    return `${total} · ${stopped} stopped, then ${total - stopped} through`;
}

/** "1–2", "8+" — the band a ramp step covers, read off the step before it. */
function rampRange(index: number): string {
    const step = SHOTS_RAMP[index];
    const prevMax = index === 0 ? 0 : SHOTS_RAMP[index - 1].max;
    if (step.max === Infinity) return `${prevMax + 1}+`;
    if (prevMax + 1 === step.max) return `${step.max}`;
    return `${prevMax + 1}–${step.max}`;
}

function formatRounds(rounds: number | null): string {
    return rounds === null ? '∞' : String(Math.round(rounds));
}

function loadoutRound(outcome: LoadoutOutcome): string {
    const ammo = outcome.loadout.ammo;
    return ammo ? `${ammo.stats.caliber} · ${ammo.name}` : '—';
}

export default function CompareView({ outcomes, target, selectedLoadoutId, onSelectLoadout, className }: CompareViewProps) {
    if (outcomes.length === 0) {
        return (
            <p className={cn('text-sm text-ink-600', className)}>
                No loadout is ready to compare yet — fit a receiver and a round that fits it.
            </p>
        );
    }

    // One column per grid entry, each holding one cell per outcome so a "best in column" reading
    // needs no re-walk of every outcome per cell.
    const gridColumns: Array<{ label: string; values: Array<ZoneOutcome | null> }> = [
        { label: 'Face', values: outcomes.map((o) => headReading(o.head, 'mask')) },
        { label: 'Shell', values: outcomes.map((o) => headReading(o.head, 'helmet')) },
        ...BODY_GROUPS.map((group) => ({
            label: ZONE_GROUP_LABELS[group],
            values: outcomes.map((o) => worstInGroup(o.body, group)),
        })),
    ];
    const columnBest = gridColumns.map((column) => column.values.reduce<number>(
        (min, cell) => (cell && cell.shotsToKill < min ? cell.shotsToKill : min),
        Infinity,
    ));
    const chestColumn = gridColumns.find((column) => column.label === ZONE_GROUP_LABELS.chest)?.values
        ?? outcomes.map(() => null);

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {/* The wall — same body, same ramp, once per loadout. */}
            <div className="military-box">
                <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 border-b border-line-800">
                    <h2 className="font-display font-extrabold uppercase text-base text-ink-100">
                        {outcomes.length === 1 ? 'One shape' : `${outcomes.length} shapes`}
                    </h2>
                    <span className="micro-label text-ink-700">
                        one ramp, one target — directly comparable, and each card ends with what aiming buys over spraying
                    </span>
                    <div className="flex-1" />
                    <ul className="flex flex-wrap items-center gap-3" aria-label="Shots-to-kill key">
                        <li className="micro-label text-ink-500">Shots to kill</li>
                        {SHOTS_RAMP.map((step, i) => (
                            <li key={step.label} className="flex items-center gap-1.5">
                                <span className="w-3 h-3 shrink-0" style={{ backgroundColor: step.color }} aria-hidden="true" />
                                <span className="font-mono text-[10px] text-ink-300">
                                    {rampRange(i)} · {step.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="grid gap-px bg-line-900 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {outcomes.map((outcome) => {
                        const isSelected = outcome.loadoutId === selectedLoadoutId;
                        const overlay: Record<number, ZoneOverlay> = {};
                        for (const [capsule, zoneOutcome] of outcome.byCapsule) {
                            overlay[capsule] = capsule === HEAD_CAPSULE
                                ? { bands: headBands(outcome.head), badge: '' }
                                : { color: shotsColor(zoneOutcome.shotsToKill), badge: '' };
                        }
                        const aimed = outcome.verdict.aimed;
                        const sprayRounds = outcome.verdict.spray?.rounds ?? null;

                        return (
                            <div
                                key={outcome.loadoutId}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                onClick={() => onSelectLoadout(outcome.loadoutId)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onSelectLoadout(outcome.loadoutId);
                                    }
                                }}
                                className={cn(
                                    'flex flex-col text-center bg-steel-850 px-2.5 py-3 cursor-pointer min-h-12',
                                    'border-2',
                                    isSelected ? 'border-ember' : 'border-transparent hover:border-line-600',
                                )}
                            >
                                <span className={cn('text-sm', isSelected ? 'text-ink-100' : 'text-ink-200')}>
                                    {outcome.loadout.name}
                                </span>
                                <span className="micro-label text-ink-600 mt-1">
                                    {loadoutRound(outcome)}
                                    {outcome.loadout.source.kind === 'build' ? ' · saved' : ''}
                                </span>

                                <BodyViewer coverage={target.coverage} overlay={overlay} height={248} className="mt-2" />

                                <div className="flex gap-px mt-2.5 bg-line-900 border-t border-line-900">
                                    <span className="flex-1 bg-steel-850 py-2 px-1">
                                        <span className="micro-label text-ink-600 block">Aimed</span>
                                        <span className="font-mono text-base text-ink-hi block mt-1 tabular">
                                            {aimed ? formatShots(aimed.shotsToKill) : '—'}
                                        </span>
                                        <span className="micro-label text-ink-700 block mt-1 truncate">
                                            {aimed ? aimed.zone.label : '—'}
                                        </span>
                                    </span>
                                    <span className="flex-1 bg-steel-850 py-2 px-1">
                                        <span className="micro-label text-ink-600 block">Spraying</span>
                                        <span className="font-mono text-base text-ink-hi block mt-1 tabular">
                                            {formatRounds(sprayRounds)}
                                        </span>
                                        <span className="micro-label text-ink-700 block mt-1">full auto</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* The grid — the same loadouts, exactly, one row each. */}
            <div className="military-box">
                <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 border-b border-line-800">
                    <h2 className="font-display font-extrabold uppercase text-base text-ink-100">
                        {outcomes.length === 1 ? 'The same one, exactly' : `The same ${outcomes.length}, exactly`}
                    </h2>
                    <span className="micro-label text-ink-700">
                        shots to kill · brightest cell in a column is the best loadout for that spot
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-max">
                        <div className={cn('grid gap-px px-3 py-2 border-b border-line-800', GRID_TEMPLATE)}>
                            <span className="eyebrow">Loadout</span>
                            {gridColumns.map((column) => (
                                <span key={column.label} className="eyebrow text-center">{column.label}</span>
                            ))}
                            <span className="eyebrow text-center">Plate costs</span>
                        </div>

                        {outcomes.map((outcome, rowIndex) => {
                            const isSelected = outcome.loadoutId === selectedLoadoutId;

                            return (
                                <div
                                    key={outcome.loadoutId}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isSelected}
                                    onClick={() => onSelectLoadout(outcome.loadoutId)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            onSelectLoadout(outcome.loadoutId);
                                        }
                                    }}
                                    className={cn(
                                        'grid gap-px px-3 py-1.5 items-stretch cursor-pointer min-h-12 border-l-2',
                                        GRID_TEMPLATE,
                                        isSelected ? 'border-l-ember bg-steel-750' : 'border-l-transparent hover:bg-steel-800',
                                    )}
                                >
                                    <span className="flex items-center gap-2 min-w-0 py-1">
                                        <span className="w-6 h-6 shrink-0 bg-steel-550 border border-line-800" aria-hidden="true" />
                                        <span className="min-w-0">
                                            <span className={cn('block text-sm truncate', isSelected ? 'text-ink-100' : 'text-ink-200')}>
                                                {outcome.loadout.name}
                                            </span>
                                            <span className="micro-label text-ink-700 truncate block">
                                                {loadoutRound(outcome)}
                                            </span>
                                        </span>
                                    </span>

                                    {gridColumns.map((column, colIndex) => {
                                        const cell = column.values[rowIndex];
                                        const isBest = cell !== null && cell.shotsToKill === columnBest[colIndex];
                                        const color = cell ? shotsColor(cell.shotsToKill) : null;

                                        return (
                                            <span
                                                key={column.label}
                                                className="flex flex-col items-center justify-center py-1.5 border-t-2"
                                                style={{
                                                    borderTopColor: color ?? 'transparent',
                                                    backgroundColor: color ? `${color}${isBest ? '38' : '1c'}` : 'transparent',
                                                }}
                                            >
                                                <span className={cn(
                                                    'font-mono text-base tabular',
                                                    isBest ? 'text-ink-hi' : 'text-ink-300',
                                                )}
                                                >
                                                    {cell ? formatShots(cell.shotsToKill) : '—'}
                                                </span>
                                            </span>
                                        );
                                    })}

                                    <span className="flex flex-col items-center justify-center py-1.5 px-1">
                                        <span className="font-mono text-xs text-ink-400 tabular text-center">
                                            {plateCost(chestColumn[rowIndex])}
                                        </span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className="micro-label text-ink-700 px-3 py-2.5 border-t border-line-900 leading-relaxed">
                    <span className="text-ink-500">Face</span> and <span className="text-ink-500">shell</span> are
                    separate columns because they are separate pieces of gear that never stack — where one is missing,
                    the cell falls back to the open-head reading. Left and right limbs share a column while the gear
                    is symmetric. <span className="text-ink-500">Plate costs</span> counts the chest reading&apos;s own
                    shot ladder: how many rounds the vest stopped before the rest went through.
                </p>
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { formatShots, shotsColor, type LoadoutOutcome, type ZoneOutcome } from '../utils/scenario';
import { ZONE_GROUPS, ZONE_GROUP_LABELS, type ZoneGroup } from '../utils/target-model';

/**
 * Every loadout, and its whole body reading in one strip.
 *
 * This is the ambient level of the comparison: a reader who never clicks anything can still see
 * that the VSS strip is greener than the Saiga's. It is what the old page had no answer for — to
 * compare four guns you had to select each in turn and remember the numbers, which is where the
 * design hit its ceiling.
 *
 * The strip is seven marks, one per display group, in body order from head to calf. Height carries
 * the reading and colour repeats it, so it survives both a dim headset panel and colour-blindness.
 * The first mark is split because the head is: a helmet's shell and the shield filling its holes
 * are two different armour classes on one bone.
 */

export interface LoadoutRailProps {
    outcomes: LoadoutOutcome[];
    selectedId: string;
    onSelect: (id: string) => void;
    /** Highlights the mark for this group, so a tapped zone is findable in every row at once. */
    highlightGroup?: ZoneGroup | null;
    onCompare?: () => void;
    onEdit?: (loadoutId: string) => void;
    className?: string;
}

/** Taller is fewer shots. Four steps, matching the ramp's four, so the two channels agree. */
function pipHeight(shots: number): number {
    if (shots <= 2) return 14;
    if (shots <= 4) return 11;
    if (shots <= 7) return 7;
    return 4;
}

/** The worst reading in a group: if you hit them *there*, this is what it costs. */
function worstOf(outcomes: ZoneOutcome[]): ZoneOutcome | null {
    return outcomes.reduce<ZoneOutcome | null>(
        (worst, entry) => (!worst || entry.shotsToKill > worst.shotsToKill ? entry : worst),
        null,
    );
}

function Pips({ outcome, highlightGroup }: { outcome: LoadoutOutcome; highlightGroup?: ZoneGroup | null }) {
    // The head's two halves come off its readings; a shield-less head simply repeats itself.
    const shield = outcome.head.find((entry) => entry.zone.armour?.source === 'mask');
    const shell = outcome.head.find((entry) => entry.zone.armour?.source === 'helmet');
    const open = outcome.head.find((entry) => entry.zone.armour === null);
    const front = shield ?? open ?? shell ?? null;
    const back = shell ?? open ?? shield ?? null;

    const groups = ZONE_GROUPS.filter((group) => group !== 'head').map((group) => ({
        group,
        outcome: worstOf(outcome.body.filter((entry) => entry.zone.group === group)),
    }));

    return (
        <svg viewBox="0 0 68 18" width={68} height={18} aria-hidden="true" className="shrink-0">
            {[front, back].map((entry, index) => (
                entry ? (
                    <rect
                        key={index}
                        x={index * 4.5}
                        y={14 - pipHeight(entry.shotsToKill)}
                        width={3.5}
                        height={pipHeight(entry.shotsToKill)}
                        fill={shotsColor(entry.shotsToKill)}
                    />
                ) : null
            ))}
            {groups.map(({ group, outcome: entry }, index) => (
                entry ? (
                    <rect
                        key={group}
                        x={10 + index * 10}
                        y={14 - pipHeight(entry.shotsToKill)}
                        width={8}
                        height={pipHeight(entry.shotsToKill)}
                        fill={shotsColor(entry.shotsToKill)}
                    />
                ) : null
            ))}
            {/* The tapped group, ticked in every row at once — this is the column read. */}
            {highlightGroup === 'head' && <rect x={0} y={16} width={8} height={2} fill="#FF4A24" />}
            {groups.map(({ group }, index) => (
                highlightGroup === group
                    ? <rect key={`tick-${group}`} x={10 + index * 10} y={16} width={8} height={2} fill="#FF4A24" />
                    : null
            ))}
        </svg>
    );
}

export default function LoadoutRail({
    outcomes, selectedId, onSelect, highlightGroup, onCompare, onEdit, className,
}: LoadoutRailProps) {
    const columnLabel = highlightGroup ? ZONE_GROUP_LABELS[highlightGroup].toLowerCase() : 'centre mass';

    return (
        <div className={cn('min-w-0', className)}>
            <div className="flex items-baseline justify-between px-2 pb-1.5 border-b border-line-900">
                <span className="eyebrow">Loadout</span>
                <span className="eyebrow">shots &middot; {columnLabel}</span>
            </div>

            <ul className="divide-y divide-line-900">
                {outcomes.map((outcome) => {
                    const isSelected = outcome.loadoutId === selectedId;
                    // The figure in the row follows the tapped column, so the rail re-reads itself
                    // rather than making the reader hold four numbers in their head.
                    const figure = highlightGroup
                        ? worstOf([...outcome.head, ...outcome.body].filter((e) => e.zone.group === highlightGroup))
                        : outcome.body.find((entry) => entry.zone.group === 'chest') ?? outcome.verdict.aimed;

                    return (
                        <li key={outcome.loadoutId}>
                            <button
                                type="button"
                                onClick={() => onSelect(outcome.loadoutId)}
                                aria-pressed={isSelected}
                                className={cn(
                                    'w-full min-h-11 px-2 py-2 text-left flex items-center gap-3 transition-colors',
                                    isSelected
                                        ? 'bg-steel-700 border-l-2 border-ember'
                                        : 'border-l-2 border-transparent hover:bg-steel-750',
                                )}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm text-ink-100 truncate">
                                        {outcome.loadout.name}
                                    </span>
                                    <span className="block micro-label text-ink-600 truncate">
                                        {outcome.loadout.ammo?.name ?? 'no round'}
                                    </span>
                                </span>
                                <span
                                    className="font-mono tabular text-base w-6 text-right"
                                    style={{ color: figure ? shotsColor(figure.shotsToKill) : undefined }}
                                >
                                    {figure ? formatShots(figure.shotsToKill) : '—'}
                                </span>
                                <Pips outcome={outcome} highlightGroup={highlightGroup} />
                            </button>
                            {isSelected && onEdit && (
                                <div className="px-2 pb-2 flex items-center justify-between">
                                    <span className="micro-label text-ink-700">
                                        {outcome.loadout.build.parts.length} parts &middot;{' '}
                                        {Math.round(outcome.loadout.build.display.RPM)} RPM &middot; FP{' '}
                                        {Math.round(outcome.loadout.build.display.firingPower)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onEdit(outcome.loadoutId)}
                                        className="micro-label text-ember hover:underline"
                                    >
                                        change &rarr;
                                    </button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            <p className="micro-label text-ink-700 mt-2 leading-relaxed px-2">
                Each strip is one gun&rsquo;s whole body reading, head to calves, on the ramp above. Taller and
                greener is fewer shots. The first pip is split because the head is: front half is the visor and
                what it leaves open, back half is the helmet shell.
            </p>

            {onCompare && outcomes.length > 1 && (
                <button
                    type="button"
                    onClick={onCompare}
                    className="mt-2 w-full min-h-11 micro-label text-ember border border-line-800 hover:border-ember/60 transition-colors"
                >
                    Compare all {outcomes.length} side by side &rarr;
                </button>
            )}
        </div>
    );
}

'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatShots, shotsColor, shotsGrade, type LoadoutOutcome, type ZoneOutcome } from '../utils/scenario';
import { ZONE_GROUPS, ZONE_GROUP_LABELS, type ZoneGroup } from '../utils/target-model';
import { AmmoTag } from './AmmoDisplay';
import PanelNote from './PanelNote';

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

/**
 * Taller is fewer shots, in four steps read straight off the grade.
 *
 * Derived rather than re-thresholded: these used to carry their own `<= 2 / <= 4 / <= 7` copy of the
 * ramp, which is exactly the sort of duplicate that survives a re-banding and quietly disagrees with
 * the colour beside it.
 */
const PIP_HEIGHTS = [4, 7, 11, 14] as const;

function pipHeight(shots: number): number {
    return PIP_HEIGHTS[shotsGrade(shots).index];
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
            <div className="flex items-center justify-between gap-2 px-2 pb-1.5 border-b border-line-900">
                <span className="eyebrow">Loadout</span>
                <div className="flex items-center gap-1">
                    <span className="eyebrow">shots &middot; {columnLabel}</span>
                    <PanelNote label="the loadout strips">
                        <p>
                            Each strip is one gun&rsquo;s whole body reading, head to calves. Taller and
                            greener is fewer shots.
                        </p>
                        <p>
                            The first pip is split because the head is: the front half is the visor and what
                            it leaves open, the back half is the helmet shell.
                        </p>
                    </PanelNote>
                </div>
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
                                    'w-full min-h-11 px-2 py-2 text-left flex flex-col items-stretch gap-1',
                                    'transition-colors',
                                    isSelected
                                        ? 'bg-steel-700 border-l-2 border-ember'
                                        : 'border-l-2 border-transparent hover:bg-steel-750',
                                )}
                            >
                                <span className="flex items-center gap-3 w-full">
                                    <span className="min-w-0 flex-1 block text-sm text-ink-100 truncate">
                                        {outcome.loadout.name}
                                    </span>
                                    <span
                                        className="font-mono tabular text-base w-8 text-right shrink-0"
                                        style={{ color: figure ? shotsColor(figure.shotsToKill) : undefined }}
                                    >
                                        {figure ? formatShots(figure.shotsToKill) : '—'}
                                    </span>
                                    <Pips outcome={outcome} highlightGroup={highlightGroup} />
                                </span>
                                {/* The round gets the row's full width rather than the sliver left over
                                    beside the strip: at 17rem it was truncating to two characters. */}
                                <AmmoTag ammo={outcome.loadout.ammo} variant="compact" className="w-full" />
                            </button>
                            {isSelected && onEdit && (
                                <div className="px-2 pb-2 flex items-center gap-2">
                                    <span className="micro-label text-ink-700 min-w-0 flex-1 truncate">
                                        {outcome.loadout.build.parts.length} parts &middot;{' '}
                                        {Math.round(outcome.loadout.build.display.RPM)} RPM &middot; FP{' '}
                                        {Math.round(outcome.loadout.build.display.firingPower)}
                                    </span>
                                    {/* The way in. A word in the corner was the only route to the picker,
                                        and readers did not find it. */}
                                    <button
                                        type="button"
                                        onClick={() => onEdit(outcome.loadoutId)}
                                        className="shrink-0 inline-flex items-center gap-1.5 micro-label
                                            text-ink-200 min-h-11 px-3 border border-line-600
                                            hover:border-ember hover:text-ink-hi transition-colors"
                                    >
                                        <SlidersHorizontal size={13} aria-hidden="true" />
                                        Gun &amp; round
                                    </button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

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

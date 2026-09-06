'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { armorClassLabel } from '@/lib/protection/armorClassScale';
import { Price } from '@/components/trade/Price';
import GradeMeter from '@/components/quality/GradeMeter';
import { formatSeconds, formatShots, shotsColor, shotsGrade, type ZoneOutcome } from '../utils/scenario';
import type { Loadout } from '../utils/loadout';

/**
 * One zone, in a panel that is always there.
 *
 * The old page stamped a numeral on each zone of the body and put everything else in a hover
 * popover, which is why comparison needed a memory and why nothing could be read on a phone. The
 * numerals are gone from the figure — colour carries the reading — and this panel is their home.
 *
 * The shot ladder is the part that is new rather than moved. `simulateCombat` has always returned
 * every shot with the health and durability left after it, and nothing has ever drawn it: a reader
 * could see that a plate takes five rounds but not that three of them were stopped and the last two
 * went through. That is the whole answer to "is this vest worth it", and it was already computed.
 */

export interface ZoneReadoutProps {
    outcome: ZoneOutcome | null;
    loadout: Loadout | null;
    range: number;
    onShowAll?: () => void;
    className?: string;
}

/**
 * A labelled figure. The value sits in a `div` rather than a `p` because some of these carry a
 * `GradeMeter` under the number, and a block element inside a paragraph is invalid HTML that React
 * reports as a hydration error rather than silently absorbing.
 */
function Figure({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="eyebrow">{label}</p>
            <div className="mt-0.5">{children}</div>
        </div>
    );
}

export default function ZoneReadout({ outcome, loadout, range, onShowAll, className }: ZoneReadoutProps) {
    if (!outcome || !loadout) {
        return (
            <div className={cn('border border-line-800 bg-steel-800 p-4', className)}>
                <p className="eyebrow">Reading</p>
                <p className="mt-2 text-sm text-ink-500">
                    Tap a part of the body, or a head reading, and its numbers land here.
                </p>
            </div>
        );
    }

    const { zone, shots } = outcome;
    const perHit = shots.length ? shots[0].damageToBodyPart : 0;
    const stopped = shots.findIndex((shot) => shot.isPenetrating);
    const stoppedCount = stopped === -1 ? shots.length : stopped;
    const firePower = 0.9 + 0.2 * loadout.build.sim.firingPower;

    return (
        <div className={cn('border border-line-800 bg-steel-800', className)}>
            <div className="p-4 border-b border-line-900">
                <p className="eyebrow">Reading</p>
                <h3 className="mt-0.5 text-xl text-ink-100 military-stencil">{zone.label}</h3>
                <p className="micro-label text-ink-600 mt-1">
                    {zone.part} pool &middot; {zone.maxHealth} HP &middot; &times;{zone.scalar.toFixed(2)} damage
                    {zone.vital && <> &middot; <span className="text-warn">vital</span></>}
                </p>

                <p className="mt-2 text-sm text-ink-300">
                    {zone.armour ? (
                        <>
                            {zone.armour.name} &mdash; class {armorClassLabel(zone.armour.armorClass)} at{' '}
                            {Math.round(zone.armour.condition * 100)}% durability
                            {zone.headShare === undefined && (
                                zone.covered > 0.995
                                    ? <>, reaching all of this bone from here</>
                                    : <>, reaching {Math.round(zone.covered * 100)}% of what you can see of this bone</>
                            )}
                            {zone.headZones?.length ? <> &middot; {zone.headZones.join(' · ')}</> : null}
                        </>
                    ) : (
                        <>
                            Nothing covers it
                            {zone.headZones?.length ? <> &mdash; {zone.headZones.join(' · ')}</> : null}
                            . Every hit here lands on bare flesh.
                        </>
                    )}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 border-b border-line-900">
                <Figure label="Shots">
                    <span
                        className="font-mono tabular text-2xl leading-none"
                        style={{ color: shotsColor(outcome.shotsToKill) }}
                    >
                        {formatShots(outcome.shotsToKill)}
                    </span>
                    {/* The app's own grade meter, the one the gunsmith draws on every weapon stat:
                        the figure says how many, the meter says whether that is any good. Time and
                        cost carry none, because neither is ranked against anything. */}
                    <GradeMeter grade={shotsGrade(outcome.shotsToKill)} className="mt-2" />
                </Figure>
                <Figure label="Time">
                    <span className="font-mono tabular text-2xl text-ink-100 leading-none">
                        {formatSeconds(outcome.ttk)}
                    </span>
                </Figure>
                <Figure label="Cost">
                    {Number.isFinite(outcome.costToKill)
                        ? <Price amount={Math.round(outcome.costToKill)} size="lg" />
                        : <span className="font-mono text-2xl text-ink-500">&infin;</span>}
                </Figure>
            </div>

            {/* The ladder. Capped, because ninety-nine rows is not a reading. */}
            <div className="p-4 border-b border-line-900">
                <p className="eyebrow mb-2">Shot by shot</p>
                <ol className="space-y-1">
                    {shots.slice(0, 12).map((shot, index) => (
                        <li key={index} className="grid grid-cols-[1.5rem_3.5rem_minmax(0,1fr)] items-center gap-2">
                            <span className="micro-label text-ink-700 text-right">{index + 1}</span>
                            <span className="font-mono tabular text-sm text-ink-100 text-right">
                                {shot.damageToBodyPart.toFixed(0)}
                            </span>
                            <span
                                className={cn(
                                    'micro-label',
                                    shot.isPenetrating ? 'text-ink-400' : 'text-info',
                                )}
                            >
                                {shot.isPenetrating ? 'through' : 'stopped by the plate'}
                            </span>
                        </li>
                    ))}
                    {shots.length > 12 && (
                        <li className="micro-label text-ink-700 pl-8">&hellip; and {shots.length - 12} more</li>
                    )}
                </ol>

                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-line-900">
                    <Figure label="Health">
                        <span className="font-mono tabular text-sm text-ink-200">
                            {zone.maxHealth} &rarr; 0
                        </span>
                    </Figure>
                    <Figure label="Plate">
                        <span className="font-mono tabular text-sm text-ink-200">
                            {zone.armour
                                ? `${stoppedCount} stopped, then ${Math.max(0, shots.length - stoppedCount)} through`
                                : 'not in the way'}
                        </span>
                    </Figure>
                </div>
            </div>

            {/* The arithmetic, but only where it is exact. On an armoured hit firing power applies
                twice and a penetration or blunt scalar sits in the middle, so a three-line chain
                would be a simplification presented as a derivation. */}
            <div className="p-4">
                <p className="eyebrow mb-2">Where {perHit.toFixed(0)} comes from</p>
                {zone.armour ? (
                    <p className="text-sm text-ink-500 leading-relaxed">
                        The round arrives at {range} m, meets class {armorClassLabel(zone.armour.armorClass)} at{' '}
                        {Math.round(zone.armour.condition * 100)}% durability, and each hit spends some of that
                        durability whether it goes through or not &mdash; which is why the figures above change
                        down the ladder. The full chain is in Numbers.
                    </p>
                ) : (
                    <dl className="space-y-1">
                        <div className="flex justify-between gap-3">
                            <dt className="text-sm text-ink-400">{loadout.ammo?.name} at {range} m</dt>
                            <dd className="font-mono tabular text-sm text-ink-200">
                                {(perHit / (zone.scalar * firePower)).toFixed(1)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-sm text-ink-400">{zone.label} multiplier</dt>
                            <dd className="font-mono tabular text-sm text-ink-200">&times;{zone.scalar.toFixed(2)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-sm text-ink-400">
                                Firing power {Math.round(loadout.build.display.firingPower)}
                            </dt>
                            <dd className="font-mono tabular text-sm text-ink-200">&times;{firePower.toFixed(2)}</dd>
                        </div>
                        <div className="flex justify-between gap-3 pt-1 border-t border-line-900">
                            <dt className="text-sm text-ink-100">Per hit</dt>
                            <dd className="font-mono tabular text-sm text-ink-hi">{perHit.toFixed(1)}</dd>
                        </div>
                    </dl>
                )}

                {onShowAll && (
                    <button
                        type="button"
                        onClick={onShowAll}
                        className="mt-3 micro-label text-ember hover:underline min-h-11"
                    >
                        All zones in Numbers &rarr;
                    </button>
                )}
            </div>
        </div>
    );
}

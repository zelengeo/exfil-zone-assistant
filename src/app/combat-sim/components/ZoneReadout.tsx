'use client';

import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import InfoPopover from '@/components/ui/info-popover';
import { TOTAL_HP } from '@/lib/protection/bodyModel';
import PanelNote from './PanelNote';
import type { TargetZone } from '../utils/target-model';
import type { ShotResultWithLeftovers } from '../utils/types';
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

/**
 * Where the damage model will be written out in full.
 *
 * The ladder shows *what* each round did and refuses to show *why*: the chain behind one armoured
 * hit - the round's curves read at range, the class-minus-penetration lookup, the durability the
 * plate has left, firing power, the blunt scalar - is far more than a popover can hold without
 * becoming the simplification-presented-as-a-derivation this panel declines to print.
 *
 * So the guide holds it, and `damageGuideHref` hands it this exact shot rather than a generic
 * explainer the reader has to re-enter their setup into. Shipped as issue #9.
 */
const DAMAGE_GUIDE_HREF = '/guides/damage-model';

/**
 * That guide, seeded with this exact shot.
 *
 * The point of the link is that it lands on the arithmetic for the row the reader tapped, not on a
 * generic explainer they then have to re-enter their setup into. Every parameter is optional on the
 * far side, so a zone the inspector cannot reproduce still opens the guide rather than an error.
 *
 * `durability` is the plate's reading BEFORE this bullet, which is what the shot path reads and
 * what the ladder does not print - the row shows what was left afterwards. For the first shot that
 * is the plate's starting condition; after that it is the previous row's remainder.
 */
function damageGuideHref(
    zone: TargetZone,
    loadout: Loadout,
    range: number,
    durabilityBefore: number | null,
): string {
    const params = new URLSearchParams();
    if (loadout.ammo) params.set('ammo', loadout.ammo.id);
    if (zone.armour) params.set('armor', zone.armour.item.id);
    params.set('bone', zone.bone);
    params.set('fp', String(loadout.build.sim.firingPower));
    params.set('range', String(range));
    if (durabilityBefore !== null) params.set('dur', durabilityBefore.toFixed(2));
    return `${DAMAGE_GUIDE_HREF}?${params.toString()}`;
}

/** Rows before the list folds. Nine is a reading; ninety-nine is a scroll. */
const LADDER_PREVIEW = 9;

function LadderRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-3">
            <dt className="text-ink-500">{label}</dt>
            <dd className="font-mono tabular text-ink-200">{children}</dd>
        </div>
    );
}

/**
 * Every shot, and what it did to each pool.
 *
 * Two damage columns rather than one, because they answer different questions: HP is progress
 * toward the kill, the plate column is progress toward the plate no longer helping. A round being
 * stopped is still winning if the second column is large.
 *
 * The rest - what was left standing after the shot, and how close the penetration roll was - is one
 * tap away per row rather than four more columns. `remainingHp` is the **whole body's** pool, not
 * this bone's: a limb kill drains all 440, which is what makes a forearm cost nineteen rounds and
 * is invisible unless the panel says so.
 */
function ShotLadder({ shots, zone, loadout, range }: {
    shots: ShotResultWithLeftovers[];
    zone: TargetZone;
    loadout: Loadout;
    range: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? shots : shots.slice(0, LADDER_PREVIEW);
    const maxDurability = zone.armour?.item.stats.maxDurability ?? null;

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-2">
                <p className="eyebrow">Shot by shot</p>
                <PanelNote label="the shot ladder">
                    <p>
                        Each row is one round: what it took off this bone&rsquo;s health, and what it took
                        off the plate. Tap a row for what was left standing afterwards.
                    </p>
                    <p>
                        Penetration is <em>rolled</em> per shot in game. This ladder takes the likelier
                        half of every roll, so a plate at 50% is drawn as stopping the round.
                    </p>
                </PanelNote>
            </div>

            <div className="grid grid-cols-[1.5rem_3rem_3rem_minmax(0,1fr)] items-center gap-2 pb-1 border-b border-line-900">
                <span className="micro-label text-ink-700 text-right">#</span>
                <span className="micro-label text-ink-700 text-right">HP</span>
                <span className="micro-label text-ink-700 text-right">Plate</span>
                <span className="micro-label text-ink-700">Result</span>
            </div>

            <ol className="divide-y divide-line-900">
                {visible.map((shot, index) => (
                    <li key={index}>
                        <InfoPopover
                            triggerStyle="bare"
                            side="left"
                            align="center"
                            label={`Shot ${index + 1} in detail`}
                            className="w-full text-left"
                            trigger={
                                <span className="w-full grid grid-cols-[1.5rem_3rem_3rem_minmax(0,1fr)] items-center gap-2 py-1.5 hover:bg-steel-750 transition-colors">
                                    <span className="micro-label text-ink-700 text-right">{index + 1}</span>
                                    <span className="font-mono tabular text-sm text-ink-100 text-right">
                                        {shot.damageToBodyPart.toFixed(0)}
                                    </span>
                                    <span className="font-mono tabular text-sm text-ink-400 text-right">
                                        {zone.armour ? shot.damageToArmor.toFixed(0) : '—'}
                                    </span>
                                    <span
                                        className={cn(
                                            'micro-label truncate',
                                            shot.isPenetrating ? 'text-ink-400' : 'text-info',
                                        )}
                                    >
                                        {shot.isPenetrating ? 'through' : 'stopped'}
                                    </span>
                                </span>
                            }
                        >
                            <div className="text-sm text-ink-400 leading-relaxed space-y-2">
                                <p className="text-ink-200">
                                    Shot {index + 1} &mdash;{' '}
                                    {shot.isPenetrating ? 'went through' : 'stopped by the plate'}
                                </p>
                                <dl className="space-y-1">
                                    <LadderRow label="Body HP left">
                                        {Math.max(0, Math.round(shot.remainingHp))} of {TOTAL_HP}
                                    </LadderRow>
                                    {zone.armour && (
                                        <>
                                            <LadderRow label="Plate left">
                                                {Math.round(shot.remainingArmorDurability)}
                                                {maxDurability ? ` of ${maxDurability}` : ''}
                                            </LadderRow>
                                            {/* The class this shot met, not the one on the label.
                                                Durability scales the class itself, so a worn plate
                                                rates lower every round — which is the whole reason
                                                the penetration figure below moves down the ladder. */}
                                            <LadderRow label="Class it met">
                                                {armorClassLabel(Number(shot.effectiveArmorClass.toFixed(2)))}
                                                {' of '}
                                                {armorClassLabel(zone.armour.armorClass)}
                                            </LadderRow>
                                        </>
                                    )}
                                    <LadderRow label="Penetration roll">
                                        {Math.round(shot.penetrationChance * 100)}%
                                    </LadderRow>
                                </dl>
                                <a
                                    href={damageGuideHref(
                                        zone,
                                        loadout,
                                        range,
                                        zone.armour
                                            ? (index === 0
                                                ? zone.armour.item.stats.maxDurability * zone.armour.condition
                                                : visible[index - 1].remainingArmorDurability)
                                            : null,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 micro-label text-ember hover:underline"
                                >
                                    Where this number comes from
                                    <ExternalLink size={11} aria-hidden="true" />
                                </a>
                            </div>
                        </InfoPopover>
                    </li>
                ))}
            </ol>

            {shots.length > LADDER_PREVIEW && (
                <button
                    type="button"
                    onClick={() => setExpanded((open) => !open)}
                    aria-expanded={expanded}
                    className="mt-1 w-full min-h-11 micro-label text-ink-500 border border-line-800 hover:border-line-600 hover:text-ink-100 transition-colors"
                >
                    {expanded ? 'Show fewer' : `Show all ${shots.length} shots`}
                </button>
            )}
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

            <div className="p-4 border-b border-line-900">
                <ShotLadder shots={shots} zone={zone} loadout={loadout} range={range} />

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

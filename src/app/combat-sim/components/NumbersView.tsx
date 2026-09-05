'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import ItemIcon from '@/components/items/ItemIcon';
import PanelNote from './PanelNote';
import { armorClassColor, armorClassLabel, UNCOVERED_COLOR } from '@/lib/protection/armorClassScale';
import { Price } from '@/components/trade/Price';

import { formatSeconds, formatShots, shotsColor, type LoadoutOutcome, type ZoneOutcome } from '../utils/scenario';
import { ZONE_GROUP_LABELS } from '../utils/target-model';
import type { SprayEstimate } from '../utils/spray';

/**
 * Every figure behind the picture, printed rather than drawn.
 *
 * Three cards: the selected loadout's own per-zone table, the same "aimed" figure for every loadout
 * at every range Compare does not show, and the spray estimate written out in full — the one number
 * on the page that models the player rather than the game, so it gets a card that says so.
 *
 * Pure and presentational: every figure comes off `outcomes` and `byRange`, nothing is computed from
 * game data here, and there is no effect. `onSelectLoadout` is the only way this view changes what
 * it shows — driven from the loadout×range table, since a reader landing on this tab has no other
 * control surface for it.
 */

export interface NumbersViewProps {
    outcomes: LoadoutOutcome[];
    /** The same loadouts re-run at each of these ranges, index-aligned with RANGE_VALUES. */
    byRange: { range: number; outcomes: LoadoutOutcome[] }[];
    selectedLoadoutId: string;
    onSelectLoadout: (id: string) => void;
    className?: string;
}

const ZONE_GRID = 'grid-cols-[minmax(9rem,1fr)_minmax(5rem,8rem)_3.5rem_4rem_3.5rem_4.5rem_6rem]';

/** EZD, or the round that never finishes the job — the same guard `VerdictBar` and `LoadoutRail` use. */
function CostCell({ cost }: { cost: number }) {
    if (!Number.isFinite(cost)) {
        return <span className="font-mono tabular text-xs text-ink-700 text-right block">&infin;</span>;
    }
    return (
        <span className="block text-right">
            <Price amount={Math.round(cost)} size="sm" tone="dim" />
        </span>
    );
}

function ZoneRow({ outcome, isAimed }: { outcome: ZoneOutcome; isAimed: boolean }) {
    const { zone } = outcome;
    // `headShare` is set for every head reading, including the no-gear fallback where `headZones`
    // itself is left undefined — so it is the reliable "this is a head row" flag, not the array.
    const isHeadRow = zone.headShare !== undefined;
    const coveredFraction = isHeadRow ? zone.headShare ?? 0 : zone.covered;
    const cone = zone.headZones && zone.headZones.length > 0 ? zone.headZones.join(' · ') : null;

    return (
        <div
            className={cn(
                'grid gap-x-3 items-center px-3 py-2 min-h-11 border-l-2',
                ZONE_GRID,
                isAimed ? 'border-ember bg-steel-700' : 'border-transparent',
                !isAimed && isHeadRow && 'bg-steel-750',
            )}
        >
            <span className="min-w-0">
                <span className="text-sm text-ink-100 block truncate">{zone.label}</span>
                {cone && (
                    <span className="micro-label text-ink-700 block mt-0.5 truncate">cone &middot; {cone}</span>
                )}
            </span>

            <span className="text-xs text-ink-300 truncate">{zone.armour?.name ?? '—'}</span>

            <span className="flex items-center justify-end gap-1">
                <span
                    className="w-2 h-2 shrink-0"
                    style={{ backgroundColor: outcome.isProtected ? armorClassColor(outcome.armorClass) : UNCOVERED_COLOR }}
                    aria-hidden="true"
                />
                <span className="font-mono tabular text-xs text-ink-100">
                    {outcome.armorClass > 0 ? armorClassLabel(outcome.armorClass) : '—'}
                </span>
            </span>

            <span className="font-mono tabular text-xs text-right text-ink-200">
                {Math.round(coveredFraction * 100)}%
            </span>

            <span
                className="font-mono tabular text-sm text-right"
                style={{ color: shotsColor(outcome.shotsToKill) }}
            >
                {formatShots(outcome.shotsToKill)}
            </span>

            <span className="font-mono tabular text-xs text-right text-ink-400">
                {formatSeconds(outcome.ttk)}
            </span>

            <CostCell cost={outcome.costToKill} />
        </div>
    );
}

function PerZoneCard({ outcome }: { outcome: LoadoutOutcome | null }) {
    const aimedId = outcome?.verdict.aimed?.zone.id ?? null;

    return (
        <section className="border border-line-800 bg-steel-800">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5 border-b border-line-800">
                <h2 className="military-stencil text-base text-ink-100">Per zone</h2>
                {outcome && <span className="text-xs text-ink-500">{outcome.loadout.name}</span>}
                <span className="micro-label text-ink-700">head readings first, then every capsule below the neck</span>
                <span className="flex-1" />
                <PanelNote label="the per-zone table">
                    <p>
                        Cover is measured, not asserted &mdash; the game&rsquo;s own{' '}
                        <span className="text-ink-200">Is Protected</span> test run over each capsule&rsquo;s
                        surface. Class is the plate&rsquo;s rating at that spot, which need not match the
                        vest&rsquo;s headline.
                    </p>
                    <p>
                        A head reading&rsquo;s cone names the zones it covers, because head gear protects
                        through cone regions rather than a wedge angle. Hands and feet author no zone, so no
                        round ever reports one.
                    </p>
                </PanelNote>
            </div>

            {outcome ? (
                <div className="overflow-x-auto">
                    <div className="min-w-[42rem]">
                        <div className={cn('grid gap-x-3 px-3 pb-1.5 border-b border-line-900', ZONE_GRID)}>
                            <span className="eyebrow">Zone</span>
                            <span className="eyebrow">Covers</span>
                            <span className="eyebrow text-right">Class</span>
                            <span className="eyebrow text-right">Cover</span>
                            <span className="eyebrow text-right">Shots</span>
                            <span className="eyebrow text-right">Time</span>
                            <span className="eyebrow text-right">Cost</span>
                        </div>
                        <div className="divide-y divide-line-900">
                            {outcome.zones.map((zoneOutcome) => (
                                <ZoneRow
                                    key={zoneOutcome.zone.id}
                                    outcome={zoneOutcome}
                                    isAimed={zoneOutcome.zone.id === aimedId}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-ink-500 p-4">
                    Pick a loadout in the table below to see its per-zone breakdown.
                </p>
            )}

        </section>
    );
}

function RangeTable({
    outcomes, byRange, selectedLoadoutId, onSelectLoadout,
}: {
    outcomes: LoadoutOutcome[];
    byRange: { range: number; outcomes: LoadoutOutcome[] }[];
    selectedLoadoutId: string;
    onSelectLoadout: (id: string) => void;
}) {
    const template = `minmax(9rem,13rem) repeat(${byRange.length}, minmax(3rem,4.5rem))`;

    return (
        <section className="border border-line-800 bg-steel-800">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5 border-b border-line-800">
                <h2 className="military-stencil text-base text-ink-100">Every loadout, every range</h2>
                <span className="micro-label text-ink-700">shots to centre mass, aimed</span>
                <span className="flex-1" />
                <PanelNote label="the range table">
                    <p>
                        The axis Compare holds at one range, this one holds at every range.
                    </p>
                    <p>
                        &infin; is the model finding no kill inside the safety limit at that range &mdash; not a
                        missing figure, a round that cannot do it. Aimed is the fewest rounds off the head: the
                        shot a player can take repeatably.
                    </p>
                </PanelNote>
            </div>

            {outcomes.length > 0 ? (
                <div className="overflow-x-auto">
                    <div style={{ minWidth: `${9 + byRange.length * 3}rem` }}>
                        <div
                            className="grid gap-x-2 px-3 pb-1.5 border-b border-line-900"
                            style={{ gridTemplateColumns: template }}
                        >
                            <span className="eyebrow">Loadout</span>
                            {byRange.map((entry) => (
                                <span key={entry.range} className="eyebrow text-right">{entry.range} m</span>
                            ))}
                        </div>
                        <div className="divide-y divide-line-900">
                            {outcomes.map((outcome) => {
                                const isSelected = outcome.loadoutId === selectedLoadoutId;
                                return (
                                    <button
                                        key={outcome.loadoutId}
                                        type="button"
                                        onClick={() => onSelectLoadout(outcome.loadoutId)}
                                        aria-pressed={isSelected}
                                        className={cn(
                                            'w-full grid gap-x-2 items-center px-3 py-2 min-h-11 text-left transition-colors border-l-2',
                                            isSelected
                                                ? 'border-ember bg-steel-700'
                                                : 'border-transparent hover:bg-steel-750',
                                        )}
                                        style={{ gridTemplateColumns: template }}
                                    >
                                        <span className="min-w-0 flex items-center gap-2">
                                            <ItemIcon item={outcome.loadout.ammo} size={20} />
                                            <span className="min-w-0 truncate">
                                                <span className={cn('text-sm', isSelected ? 'text-ink-100' : 'text-ink-200')}>
                                                    {outcome.loadout.name}
                                                </span>
                                                <span className="micro-label text-ink-600 ml-1.5">
                                                    {outcome.loadout.ammo?.name ?? 'no round'}
                                                </span>
                                            </span>
                                        </span>
                                        {byRange.map((entry) => {
                                            const cell = entry.outcomes.find((o) => o.loadoutId === outcome.loadoutId);
                                            const shots = cell?.verdict.aimed?.shotsToKill ?? Infinity;
                                            return (
                                                <span
                                                    key={entry.range}
                                                    className="font-mono tabular text-sm text-right"
                                                    style={{ color: shotsColor(shots) }}
                                                >
                                                    {formatShots(shots)}
                                                </span>
                                            );
                                        })}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-ink-500 p-4">No loadout is ready to compare.</p>
            )}

        </section>
    );
}

function Stat({ label, value, hi }: { label: string; value: string; hi?: boolean }) {
    return (
        <span>
            <span className="eyebrow block mb-1">{label}</span>
            <span className={cn('font-mono tabular text-lg', hi ? 'text-ink-hi' : 'text-ink-100')}>{value}</span>
        </span>
    );
}

function SprayFigures({ spray }: { spray: SprayEstimate }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <Stat hi label="Rounds" value={spray.rounds !== null ? String(Math.round(spray.rounds)) : '∞'} />
                <Stat label="Time" value={formatSeconds(spray.seconds ?? Infinity)} />
                <Stat label="Hit rate" value={`${Math.round(spray.hitRate * 100)}%`} />
                <Stat label="Spread radius" value={`${spray.spreadRadiusCm.toFixed(1)} cm`} />
                <Stat label="Climb" value={`${spray.climbCm.toFixed(1)} cm`} />
            </div>
            <div>
                <span className="eyebrow block mb-1.5">Where the rounds landed</span>
                <div className="flex flex-col gap-1">
                    {spray.distribution.map((hit) => {
                        const label = hit.group === 'miss' ? 'Missed' : ZONE_GROUP_LABELS[hit.group];
                        const percent = Math.round(hit.p * 100);
                        return (
                            <div key={hit.group} className="flex items-center gap-2">
                                <span className="w-28 shrink-0 text-xs text-ink-300">{label}</span>
                                <span className="flex-1 h-1 bg-track min-w-8" aria-hidden="true">
                                    <span className="block h-full bg-ink-400" style={{ width: `${percent}%` }} />
                                </span>
                                <span className="font-mono tabular text-xs text-ink-200 w-10 text-right">{percent}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function SprayCard({ outcome }: { outcome: LoadoutOutcome | null }) {
    const spray = outcome?.verdict.spray ?? null;

    return (
        <section className="border border-line-800 bg-steel-800">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5 border-b border-line-800">
                <h2 className="military-stencil text-base text-ink-100">The spray estimate</h2>
                <span className="micro-label text-ember-soft">estimate &middot; models the player, not the game</span>
                <span className="flex-1" />
                <PanelNote label="the spray estimate">
                    <p>
                        This is the one figure on the page that models the player rather than the game, so it
                        stays labelled an estimate everywhere it appears.
                    </p>
                    <p>
                        It assumes the shooter holds on the centre of the upper chest without pulling down
                        against climb, against a frontal, standing target in the body model&rsquo;s reference
                        pose &mdash; the pessimistic end of what a real player does. Movement, leaning, and the
                        bursts after a reset are not modelled.
                    </p>
                </PanelNote>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line-900">
                <div className="bg-steel-800 p-3.5 border-l-2 border-line-500">
                    <span className="micro-label text-ink-600 block mb-1.5">1 &mdash; where rounds go</span>
                    <span className="font-mono text-sm text-ink-200">cone &rarr; p(zone), plus p(miss)</span>
                </div>
                <div className="bg-steel-800 p-3.5 border-l-2 border-line-500">
                    <span className="micro-label text-ink-600 block mb-1.5">2 &mdash; what a round is worth</span>
                    <span className="font-mono text-sm text-ink-200">E[dmg] = &Sigma; p(zone) &times; dmg(zone)</span>
                </div>
                <div className="bg-steel-800 p-3.5 border-l-2 border-ember">
                    <span className="micro-label text-ink-600 block mb-1.5">3 &mdash; the figure</span>
                    <span className="font-mono text-sm text-ink-hi">rounds &asymp; pool &divide; E[dmg]</span>
                </div>
            </div>

            <div className="border-t border-line-800 p-3.5">
                {outcome && spray ? (
                    <SprayFigures spray={spray} />
                ) : outcome ? (
                    <p className="text-sm text-ink-500">
                        This loadout has no round chambered, so there is nothing to spray.
                    </p>
                ) : (
                    <p className="text-sm text-ink-500">
                        Pick a ready loadout in the table above to see its spray estimate.
                    </p>
                )}
            </div>

        </section>
    );
}

export default function NumbersView({
    outcomes, byRange, selectedLoadoutId, onSelectLoadout, className,
}: NumbersViewProps) {
    if (outcomes.length === 0) {
        return (
            <div className={cn('border border-line-800 bg-steel-800 p-4', className)}>
                <p className="text-sm text-ink-500">
                    No loadout is ready to run &mdash; arm a slot with a build and a round it chambers, and the
                    figures land here.
                </p>
            </div>
        );
    }

    const selected = outcomes.find((outcome) => outcome.loadoutId === selectedLoadoutId) ?? null;

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <PerZoneCard outcome={selected} />
            <RangeTable
                outcomes={outcomes}
                byRange={byRange}
                selectedLoadoutId={selectedLoadoutId}
                onSelectLoadout={onSelectLoadout}
            />
            <SprayCard outcome={selected} />
        </div>
    );
}

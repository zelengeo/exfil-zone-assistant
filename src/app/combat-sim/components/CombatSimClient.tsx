'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/layout/Layout';
import ShareButton from '@/components/ShareButton';
import { useCombatSim, type SimView } from '../hooks/useCombatSim';
import { RANGE_VALUES } from '../utils/types';
import { formatShots, shotsColor } from '../utils/scenario';
import VerdictBar from './VerdictBar';
import LoadoutRail from './LoadoutRail';
import TargetView, { type TargetTab } from './TargetView';
import ZoneReadout from './ZoneReadout';
import DefenderPanel from './DefenderPanel';
import LoadoutPicker from './LoadoutPicker';
import CompareView from './CompareView';
import NumbersView from './NumbersView';

// Live console tooling for the debug page; imported for its side effects, as it always has been.
import '../utils/combat-test-helper';

/**
 * The simulator's shell: three views, one setup.
 *
 * `Read` is one loadout against the target, `Compare` is all of them side by side, and `Numbers` is
 * the tables. That replaces a `ttk | stk | ctk` display toggle, which only existed because the
 * figure was stamped on the body — with the figures in a panel, all three fit at once and there is
 * nothing to switch between.
 */

const VIEW_LABELS: Record<SimView, string> = {
    read: 'Read',
    compare: 'Compare',
    numbers: 'Numbers',
};

export default function CombatSimClient() {
    const sim = useCombatSim();
    const [tab, setTab] = useState<TargetTab>('body');
    const [picking, setPicking] = useState<string | null>(null);

    const selectedZone = sim.selectedZoneId
        ? sim.selected?.byZoneId.get(sim.selectedZoneId) ?? null
        : sim.selected?.verdict.aimed ?? null;

    const highlightGroup = selectedZone?.zone.group ?? null;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-6">
                <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl text-ink-100 military-stencil">Combat Simulator</h1>
                        <p className="text-ink-500 mt-1">What your gun does to what they are wearing.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex" role="group" aria-label="View">
                            {(Object.keys(VIEW_LABELS) as SimView[]).map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => sim.setView(name)}
                                    aria-pressed={sim.view === name}
                                    className={cn(
                                        'micro-label px-4 min-h-11 border transition-colors',
                                        sim.view === name
                                            ? 'border-line-400 bg-steel-650 text-ink-100'
                                            : 'border-line-800 text-ink-600 hover:text-ink-300',
                                    )}
                                >
                                    {VIEW_LABELS[name]}
                                </button>
                            ))}
                        </div>
                        <ShareButton getShareLink={sim.shareLink} title="Share setup" />
                    </div>
                </header>

                {sim.error && (
                    <p className="border border-bad/40 bg-steel-800 p-3 text-sm text-bad mb-4">{sim.error}</p>
                )}

                {!sim.ready || !sim.target ? (
                    <div className="flex items-center justify-center gap-2 py-24 text-ink-500">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">Loading the body model and the part index…</span>
                    </div>
                ) : picking !== null && sim.data ? (
                    <LoadoutPicker
                        loadoutId={picking}
                        current={sim.loadouts.find((entry) => entry.id === picking) ?? null}
                        presets={sim.catalogue.presets}
                        ammo={sim.catalogue.ammo}
                        index={sim.data.index}
                        onPick={(loadout) => {
                            sim.setLoadout(picking, loadout);
                            setPicking(null);
                        }}
                        onClose={() => setPicking(null)}
                    />
                ) : (
                    <>
                        <VerdictBar
                            outcome={sim.selected}
                            onShowHead={() => { sim.setView('read'); setTab('head'); }}
                            onExplainSpray={() => sim.setView('numbers')}
                            className="mb-5"
                        />

                        {sim.view === 'read' && (
                            <div className="grid grid-cols-1 shell:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,24rem)] gap-5">
                                <div className="min-w-0 space-y-4">
                                    <LoadoutRail
                                        outcomes={sim.outcomes}
                                        selectedId={sim.selectedId}
                                        onSelect={sim.selectLoadout}
                                        highlightGroup={highlightGroup}
                                        onCompare={() => sim.setView('compare')}
                                        onEdit={setPicking}
                                    />
                                    {sim.loadouts.length < 4 && (
                                        <button
                                            type="button"
                                            onClick={sim.addLoadout}
                                            className="w-full min-h-11 micro-label text-ink-400 border border-line-800 hover:border-line-600 hover:text-ink-100 transition-colors"
                                        >
                                            + Add a loadout
                                        </button>
                                    )}
                                    <DefenderPanel
                                        defender={sim.defender}
                                        onChange={sim.setDefender}
                                        vests={sim.catalogue.vests}
                                        helmets={sim.catalogue.helmets}
                                        shields={sim.catalogue.shields}
                                    />
                                </div>

                                <TargetView
                                    target={sim.target}
                                    outcome={sim.selected}
                                    tab={tab}
                                    onTab={setTab}
                                    facing={sim.facing}
                                    onFacing={sim.setFacing}
                                    selectedZoneId={sim.selectedZoneId}
                                    onSelectZone={sim.selectZone}
                                />

                                <div className="min-w-0 space-y-4">
                                    <RangeControl
                                        range={sim.range}
                                        onRange={sim.setRange}
                                        byRange={sim.byRange}
                                        selectedId={sim.selectedId}
                                    />
                                    <ZoneReadout
                                        outcome={selectedZone}
                                        loadout={sim.selected?.loadout ?? null}
                                        range={sim.range}
                                        onShowAll={() => sim.setView('numbers')}
                                    />
                                </div>
                            </div>
                        )}

                        {sim.view === 'compare' && (
                            <CompareView
                                outcomes={sim.outcomes}
                                target={sim.target}
                                selectedLoadoutId={sim.selectedId}
                                onSelectLoadout={(id) => { sim.selectLoadout(id); sim.setView('read'); }}
                            />
                        )}

                        {sim.view === 'numbers' && (
                            <NumbersView
                                outcomes={sim.outcomes}
                                byRange={sim.byRange}
                                selectedLoadoutId={sim.selectedId}
                                onSelectLoadout={sim.selectLoadout}
                            />
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}

/**
 * Range, and what it costs.
 *
 * The slider's own track is the falloff reading: the five preset ranges with the shots each takes,
 * so moving the handle is not a leap of faith. Every published round carries ballistic curves, and
 * past point blank those curves supply the damage outright — which is why a build can simply stop
 * being able to kill somewhere down this row.
 */
function RangeControl({
    range, onRange, byRange, selectedId,
}: {
    range: number;
    onRange: (range: number) => void;
    byRange: { range: number; outcomes: import('../utils/scenario').LoadoutOutcome[] }[];
    selectedId: string;
}) {
    return (
        <section className="border border-line-800 bg-steel-800 p-4">
            <div className="flex items-baseline justify-between">
                <h2 className="eyebrow">Range &mdash; shots to centre mass</h2>
                <span className="font-mono tabular text-lg text-ink-hi">{range} m</span>
            </div>

            <input
                type="range"
                min={0}
                max={600}
                step={10}
                value={range}
                onChange={(event) => onRange(Number(event.target.value))}
                aria-label="Range in metres"
                className="w-full mt-3 h-2 bg-steel-700 appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-ember
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:bg-ember
                    [&::-moz-range-thumb]:border-0"
            />

            <ul className="grid grid-cols-5 gap-1 mt-3">
                {RANGE_VALUES.map((value) => {
                    const entry = byRange.find((row) => row.range === value);
                    const outcome = entry?.outcomes.find((row) => row.loadoutId === selectedId)
                        ?? entry?.outcomes[0];
                    const shots = outcome?.verdict.aimed?.shotsToKill;
                    return (
                        <li key={value}>
                            <button
                                type="button"
                                onClick={() => onRange(value)}
                                aria-pressed={range === value}
                                className={cn(
                                    'w-full min-h-11 border transition-colors flex flex-col items-center justify-center',
                                    range === value
                                        ? 'border-line-400 bg-steel-650'
                                        : 'border-line-800 hover:border-line-600',
                                )}
                            >
                                <span className="micro-label text-ink-600">{value} m</span>
                                <span
                                    className="font-mono tabular text-sm"
                                    style={{ color: shots === undefined ? undefined : shotsColor(shots) }}
                                >
                                    {shots === undefined ? '—' : formatShots(shots)}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

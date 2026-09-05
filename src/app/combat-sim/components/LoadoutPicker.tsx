'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import ItemIcon from '@/components/items/ItemIcon';
import { useSavedBuilds } from '@/app/gunsmith/hooks/useSavedBuilds';
import { assembleBuild, presetToFitted } from '@/lib/gunsmith/build';
import { findPart, type PartIndex } from '@/lib/gunsmith/compatibility';
import type { Ammunition, Weapon } from '@/types/items';
import type { AssembledBuild } from '@/lib/gunsmith/build';
import {
    gunsmithLink,
    loadoutFromPreset,
    loadoutFromSaved,
    type Loadout,
} from '../utils/loadout';
import { AmmoRow } from './AmmoDisplay';
import PanelNote from './PanelNote';

/**
 * Choosing what to shoot with.
 *
 * A dialog now, rather than a view the page swapped itself for. The swap was the whole reason the
 * picker was hard to leave: it arrived with no scrim and no frame, so it read as a route the reader
 * had navigated to, and the only way back was a `Close` word in the corner. A modal announces both
 * facts a reader needs at once - this is on top of the page you were reading, and Escape, the scrim
 * or the button will put you back on it.
 *
 * The gun and the round get one column each, because the round is at least the gun's equal here and
 * used to be a chip strip in a footer. See `AmmoDisplay` for why.
 *
 * Parts stay read-only. The bench is one link away and it is a whole route; a second, worse copy of
 * it inside a modal would be the sort of thing nobody maintains.
 */

export interface LoadoutPickerProps {
    /** The slot being filled. */
    loadoutId: string;
    current: Loadout | null;
    presets: Weapon[];
    ammo: Ammunition[];
    index: PartIndex;
    onPick: (loadout: Loadout) => void;
    onClose: () => void;
}

/**
 * The bench's six figures. `reaches` is whether the simulator's arithmetic reads it at all - two
 * do, and a reader who has just spent an hour on recoil will otherwise assume all six move the
 * answer. Marked rather than explained: the note carries the sentence.
 */
const FIGURES = [
    { key: 'firingPower', label: 'Firing power', reaches: true, precision: 0 },
    { key: 'RPM', label: 'Fire rate', reaches: true, precision: 0 },
    { key: 'spreadMOA', label: 'Spread', reaches: false, precision: 1 },
    { key: 'verticalRecoil', label: 'Vert. recoil', reaches: false, precision: 0 },
    { key: 'horizontalRecoil', label: 'Horiz. recoil', reaches: false, precision: 0 },
    { key: 'ergonomics', label: 'Ergonomics', reaches: false, precision: 0 },
] as const;

function figureOf(build: AssembledBuild, key: typeof FIGURES[number]['key']): number | null {
    const value = build.display[key];
    return typeof value === 'number' ? value : null;
}

export default function LoadoutPicker({
    loadoutId, current, presets, ammo, index, onPick, onClose,
}: LoadoutPickerProps) {
    const { builds, ready } = useSavedBuilds();
    const [query, setQuery] = useState('');
    const [draft, setDraft] = useState<Loadout | null>(current);

    const filter = query.trim().toLowerCase();
    const matchingPresets = useMemo(
        () => (filter ? presets.filter((preset) => preset.name.toLowerCase().includes(filter)) : presets),
        [presets, filter],
    );
    const matchingBuilds = useMemo(
        () => (filter ? builds.filter((build) => build.name.toLowerCase().includes(filter)) : builds),
        [builds, filter],
    );

    // What the deltas are measured against: the preset this build started from, assembled.
    const baseline = useMemo((): AssembledBuild | null => {
        if (!draft || draft.source.kind !== 'build') return null;
        const savedId = draft.source.savedId;
        const saved = builds.find((build) => build.id === savedId);
        const preset = saved?.basePresetId
            ? presets.find((entry) => entry.id === saved.basePresetId)
            : undefined;
        if (!preset) return null;
        const receiver = findPart(index, preset.receiverId);
        if (!receiver) return null;
        return assembleBuild(receiver, presetToFitted(preset, index), index);
    }, [draft, builds, presets, index]);

    // The magazine fixes the calibre, so this list is the reader's whole choice of round.
    const rounds = useMemo(() => {
        const caliber = draft?.build.sim.caliber;
        if (!caliber) return [];
        return ammo
            .filter((round) => round.stats.caliber === caliber)
            .sort((a, b) => b.stats.penetration - a.stats.penetration);
    }, [ammo, draft]);

    const bestPenetration = rounds.length ? Math.max(...rounds.map((r) => r.stats.penetration)) : null;
    const bestDamage = rounds.length ? Math.max(...rounds.map((r) => r.stats.damage)) : null;

    return (
        <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent
                showCloseButton={false}
                className={cn(
                    'bg-steel-800 border-line-700 rounded-none p-0 gap-0 block',
                    'w-[calc(100%-1rem)] max-w-5xl sm:max-w-5xl',
                    'max-h-[92vh] overflow-y-auto',
                )}
            >
                <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-steel-800 border-b border-line-700">
                    <DialogTitle className="text-xl text-ink-100 military-stencil flex-1 min-w-0 truncate">
                        {current ? 'Change loadout' : 'Choose a loadout'}
                    </DialogTitle>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 w-11 h-11 flex items-center justify-center border border-line-700
                            text-ink-400 hover:text-ink-hi hover:border-line-400 transition-colors"
                        aria-label="Close without changing the loadout"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
                    {/* the gun */}
                    <div className="border-b lg:border-b-0 lg:border-r border-line-800 min-w-0">
                        <div className="p-3 border-b border-line-900">
                            <div className="relative">
                                <Search
                                    size={15}
                                    aria-hidden="true"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700 pointer-events-none"
                                />
                                <Input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder={`Search ${presets.length} presets, ${builds.length} builds`}
                                    aria-label="Search guns"
                                    className="min-h-11 pl-9"
                                />
                            </div>
                        </div>

                        <div className="max-h-[40vh] overflow-y-auto lg:max-h-[60vh]">
                            {ready && matchingBuilds.length > 0 && (
                                <>
                                    <p className="eyebrow px-3 pt-3 pb-1.5">
                                        My builds &mdash; {matchingBuilds.length}
                                    </p>
                                    <ul className="divide-y divide-line-900">
                                        {matchingBuilds.map((build) => (
                                            <li key={build.id}>
                                                <GunRow
                                                    name={build.name}
                                                    sub={`${build.parts.length} parts`}
                                                    selected={draft?.source.kind === 'build'
                                                        && draft.source.savedId === build.id}
                                                    onSelect={() => {
                                                        const loadout = loadoutFromSaved(
                                                            loadoutId, build, index, draft?.ammo ?? null,
                                                        );
                                                        if (loadout) setDraft(withDefaultRound(loadout, ammo));
                                                    }}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            <p className="eyebrow px-3 pt-3 pb-1.5">Presets &mdash; {matchingPresets.length}</p>
                            <ul className="divide-y divide-line-900">
                                {matchingPresets.map((preset) => (
                                    <li key={preset.id}>
                                        <GunRow
                                            item={preset}
                                            name={preset.name}
                                            sub={`${preset.stats.caliber} · ${preset.stats.fireRate} RPM`}
                                            selected={draft?.source.kind === 'preset'
                                                && draft.source.presetId === preset.id}
                                            onSelect={() => {
                                                const loadout = loadoutFromPreset(loadoutId, preset, index, null);
                                                if (loadout) setDraft(withDefaultRound(loadout, ammo));
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                            {matchingPresets.length === 0 && matchingBuilds.length === 0 && (
                                <p className="px-3 py-6 text-sm text-ink-600">Nothing matches that search.</p>
                            )}
                        </div>
                    </div>

                    {/* the round, and what the gun brings to it */}
                    <div className="min-w-0">
                        {!draft ? (
                            <p className="p-6 text-sm text-ink-500">Pick a gun to choose its round.</p>
                        ) : (
                            <>
                                <div className="p-4 border-b border-line-900">
                                    <div className="flex items-start gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg text-ink-100 truncate">{draft.name}</h3>
                                            <p className="micro-label text-ink-600 mt-0.5">
                                                {draft.source.kind === 'preset' ? 'Factory preset' : 'Your build'}
                                                {' · '}
                                                {draft.build.parts.length} parts
                                                {' · '}
                                                {draft.build.sim.caliber ?? 'no calibre'}
                                            </p>
                                        </div>
                                        <Link
                                            href={gunsmithLink(draft)}
                                            className="shrink-0 micro-label text-ink-400 hover:text-ink-hi min-h-11 px-3
                                                border border-line-700 hover:border-line-400 inline-flex items-center
                                                transition-colors"
                                        >
                                            Gunsmith &#8599;
                                        </Link>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <p className="eyebrow">Bench figures</p>
                                        <PanelNote label="the bench figures">
                                            <p>
                                                Only two reach the damage model, and they are the two marked:{' '}
                                                <span className="text-ink-200">firing power</span>, which scales
                                                every shot by <span className="font-mono">0.9 + 0.2 &times; fp</span>,
                                                and <span className="text-ink-200">fire rate</span>, which sets the
                                                time between them.
                                            </p>
                                            <p>
                                                Recoil and spread decide whether you land the shots, which is what
                                                the spray estimate is for. Ergonomics reaches nothing here.
                                            </p>
                                        </PanelNote>
                                    </div>

                                    <ul className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-line-900 mt-1 border border-line-900">
                                        {FIGURES.map((figure) => {
                                            const value = figureOf(draft.build, figure.key);
                                            const base = baseline ? figureOf(baseline, figure.key) : null;
                                            const delta = value !== null && base !== null ? value - base : null;
                                            return (
                                                <li
                                                    key={figure.key}
                                                    className={cn(
                                                        'bg-steel-850 p-2 border-t-2',
                                                        figure.reaches
                                                            ? 'border-ember'
                                                            : 'border-transparent opacity-60',
                                                    )}
                                                >
                                                    <p className="micro-label text-ink-700 truncate">{figure.label}</p>
                                                    <p className="font-mono tabular text-base text-ink-100 leading-tight mt-1">
                                                        {value === null ? '—' : value.toFixed(figure.precision)}
                                                    </p>
                                                    {delta !== null && Math.abs(delta) >= 0.05 && (
                                                        <p className="micro-label text-ink-600 mt-0.5">
                                                            {delta > 0 ? '+' : '−'}{Math.abs(delta).toFixed(1)}
                                                        </p>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="eyebrow">
                                            Round &mdash; {rounds.length} in {draft.build.sim.caliber ?? 'this calibre'}
                                        </p>
                                        <PanelNote label="the round list">
                                            <p>The magazine fixes the calibre, so this list is the whole choice.</p>
                                            <p>
                                                Penetration is drawn on the same ladder as armour class, because the
                                                game compares them directly: a round penetrates on the difference
                                                between the two, so a pen 4 round against a class 4 plate is the even
                                                fight the rungs show.
                                            </p>
                                        </PanelNote>
                                    </div>

                                    {rounds.length === 0 ? (
                                        <p className="text-sm text-ink-500">
                                            Nothing in the catalogue chambers this calibre.
                                        </p>
                                    ) : (
                                        <ul className="divide-y divide-line-900 border border-line-800 lg:max-h-[38vh] lg:overflow-y-auto">
                                            {rounds.map((round) => (
                                                <li key={round.id}>
                                                    <AmmoRow
                                                        ammo={round}
                                                        selected={draft.ammo?.id === round.id}
                                                        onSelect={() => setDraft({ ...draft, ammo: round })}
                                                        isBestPenetration={round.stats.penetration === bestPenetration}
                                                        isBestDamage={round.stats.damage === bestDamage}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <footer className="sticky bottom-0 flex items-center justify-end gap-2 px-4 py-3
                    bg-steel-800 border-t border-line-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="micro-label text-ink-400 hover:text-ink-hi min-h-11 px-4 border border-line-700
                            hover:border-line-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => draft && onPick(draft)}
                        disabled={!draft?.ammo}
                        className="micro-label text-ink-hi bg-ember hover:bg-ember-hover min-h-11 px-5
                            disabled:opacity-40 disabled:hover:bg-ember transition-colors"
                    >
                        {draft?.ammo ? 'Use this loadout' : 'Pick a round'}
                    </button>
                </footer>
            </DialogContent>
        </Dialog>
    );
}

/**
 * A gun keeps its round when one still chambers; otherwise it takes the hardest-hitting one that
 * does. Landing on a gun with no round selected is a dead end the reader has to notice and fix.
 */
function withDefaultRound(loadout: Loadout, ammo: Ammunition[]): Loadout {
    const caliber = loadout.build.sim.caliber;
    if (!caliber) return { ...loadout, ammo: null };
    if (loadout.ammo?.stats.caliber === caliber) return loadout;
    const candidates = ammo.filter((round) => round.stats.caliber === caliber);
    const best = candidates.reduce<Ammunition | null>(
        (top, round) => (!top || round.stats.penetration > top.stats.penetration ? round : top),
        null,
    );
    return { ...loadout, ammo: best };
}

function GunRow({
    item, name, sub, selected, onSelect,
}: {
    item?: Weapon;
    name: string;
    sub: string;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={cn(
                'w-full min-h-14 px-3 py-2 text-left flex items-center gap-3 transition-colors border-l-2',
                selected ? 'bg-steel-700 border-ember' : 'border-transparent hover:bg-steel-750',
            )}
        >
            <ItemIcon item={item ?? { name }} size={32} />
            <span className="min-w-0 flex-1">
                <span className={cn('block text-sm truncate', selected ? 'text-ink-hi' : 'text-ink-200')}>
                    {name}
                </span>
                <span className="block micro-label text-ink-700 truncate mt-0.5">{sub}</span>
            </span>
        </button>
    );
}

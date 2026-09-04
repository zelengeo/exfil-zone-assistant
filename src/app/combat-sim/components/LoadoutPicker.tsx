'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
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

/**
 * Choosing what to shoot with, as its own view.
 *
 * A gun is a build now, so the picker has to offer both shipped presets and the reader's own saved
 * builds — and it has to be honest about which of the six assembled figures the simulator actually
 * reads, because a reader who has just spent an hour on recoil in the gunsmith will otherwise
 * assume all six move the answer. Two do.
 *
 * Parts are read-only here on purpose. The bench is one link away and it is a whole route; a second
 *, worse copy of it inside a modal would be the sort of thing nobody maintains.
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

/** The six figures the bench shows, and what each is worth here. */
const FIGURES = [
    { key: 'RPM', label: 'Fire rate', reaches: true },
    { key: 'firingPower', label: 'Firing power', reaches: true },
    { key: 'spreadMOA', label: 'Spread', reaches: false },
    { key: 'verticalRecoil', label: 'Vert. recoil', reaches: false },
    { key: 'horizontalRecoil', label: 'Horiz. recoil', reaches: false },
    { key: 'ergonomics', label: 'Ergonomics', reaches: false },
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

    const rounds = useMemo(() => {
        const caliber = draft?.build.sim.caliber;
        return caliber ? ammo.filter((round) => round.stats.caliber === caliber) : [];
    }, [ammo, draft]);

    return (
        <div className="border border-line-800 bg-steel-800">
            <header className="flex items-start justify-between gap-4 p-4 border-b border-line-900">
                <div>
                    <h2 className="text-xl text-ink-100 military-stencil">Choose a loadout</h2>
                    <p className="text-sm text-ink-500 mt-1 max-w-prose">
                        A factory preset, or one of your own builds. Ammunition is picked beside it &mdash;
                        a build carries a magazine, never a round.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="micro-label text-ink-500 hover:text-ink-100 min-h-11 px-3 border border-line-800"
                >
                    Close
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                <div className="border-b lg:border-b-0 lg:border-r border-line-900 p-3 min-w-0">
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={`Search ${presets.length} presets and ${builds.length} builds`}
                        className="min-h-11"
                    />

                    {ready && matchingBuilds.length > 0 && (
                        <>
                            <p className="eyebrow mt-3 mb-1">My builds &mdash; {matchingBuilds.length}</p>
                            <ul className="divide-y divide-line-900">
                                {matchingBuilds.map((build) => (
                                    <li key={build.id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const loadout = loadoutFromSaved(loadoutId, build, index, draft?.ammo ?? null);
                                                if (loadout) setDraft(loadout);
                                            }}
                                            className={cn(
                                                'w-full min-h-11 px-2 py-2 text-left transition-colors',
                                                draft?.source.kind === 'build' && draft.source.savedId === build.id
                                                    ? 'bg-steel-700 border-l-2 border-ember'
                                                    : 'border-l-2 border-transparent hover:bg-steel-750',
                                            )}
                                        >
                                            <span className="block text-sm text-ink-100 truncate">{build.name}</span>
                                            <span className="block micro-label text-ink-600 truncate">
                                                {build.parts.length} parts
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <p className="eyebrow mt-3 mb-1">Presets &mdash; {matchingPresets.length}</p>
                    <ul className="divide-y divide-line-900 max-h-96 overflow-y-auto">
                        {matchingPresets.map((preset) => (
                            <li key={preset.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const loadout = loadoutFromPreset(loadoutId, preset, index, null);
                                        if (loadout) {
                                            const caliber = loadout.build.sim.caliber;
                                            setDraft({
                                                ...loadout,
                                                ammo: ammo.find((round) => round.stats.caliber === caliber) ?? null,
                                            });
                                        }
                                    }}
                                    className={cn(
                                        'w-full min-h-11 px-2 py-2 text-left transition-colors',
                                        draft?.source.kind === 'preset' && draft.source.presetId === preset.id
                                            ? 'bg-steel-700 border-l-2 border-ember'
                                            : 'border-l-2 border-transparent hover:bg-steel-750',
                                    )}
                                >
                                    <span className="block text-sm text-ink-100 truncate">{preset.name}</span>
                                    <span className="block micro-label text-ink-600 truncate">
                                        {preset.stats.caliber} &middot; {preset.stats.fireRate} RPM
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-4 min-w-0">
                    {!draft ? (
                        <p className="text-sm text-ink-500">Pick a preset or a build to see what it does.</p>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-baseline justify-between gap-3">
                                <div>
                                    <h3 className="text-lg text-ink-100">{draft.name}</h3>
                                    <p className="micro-label text-ink-600">
                                        {draft.source.kind === 'preset' ? 'Factory preset' : 'Your build'} &middot;{' '}
                                        {draft.build.parts.length} parts
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={gunsmithLink(draft)}
                                        className="micro-label text-ink-400 hover:text-ink-100 min-h-11 px-3 border border-line-800 inline-flex items-center"
                                    >
                                        Open in gunsmith &#8599;
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => onPick(draft)}
                                        disabled={!draft.ammo}
                                        className="micro-label text-ink-hi bg-ember min-h-11 px-4 disabled:opacity-40"
                                    >
                                        Use in the sim
                                    </button>
                                </div>
                            </div>

                            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                                {FIGURES.map((figure) => {
                                    const value = figureOf(draft.build, figure.key);
                                    const base = baseline ? figureOf(baseline, figure.key) : null;
                                    const delta = value !== null && base !== null ? value - base : null;
                                    return (
                                        <li key={figure.key} className={cn(!figure.reaches && 'opacity-60')}>
                                            <p className="eyebrow">{figure.label}</p>
                                            <p className="font-mono tabular text-lg text-ink-100 leading-tight">
                                                {value === null ? '—' : value.toFixed(figure.key === 'spreadMOA' ? 1 : 0)}
                                            </p>
                                            <p className="micro-label text-ink-700">
                                                {delta === null || Math.abs(delta) < 0.05
                                                    ? 'unchanged'
                                                    : `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(1)}`}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>

                            <p className="text-sm text-ink-500 mt-3 leading-relaxed max-w-prose">
                                Only two of these reach the damage model: <span className="text-ink-200">firing
                                power</span>, which scales every shot by{' '}
                                <span className="font-mono">0.9 + 0.2 × fp</span>, and{' '}
                                <span className="text-ink-200">fire rate</span>, which sets the time between them.
                                Recoil and spread decide whether you land the shots &mdash; which is what the spray
                                estimate is for; ergonomics reaches nothing at all.
                            </p>

                            <div className="mt-4 pt-4 border-t border-line-900">
                                <p className="eyebrow mb-2">Round &mdash; {draft.build.sim.caliber ?? 'any'}</p>
                                {rounds.length === 0 ? (
                                    <p className="text-sm text-ink-500">
                                        Nothing in the catalogue chambers this calibre.
                                    </p>
                                ) : (
                                    <ul className="flex flex-wrap gap-2">
                                        {rounds.map((round) => (
                                            <li key={round.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => setDraft({ ...draft, ammo: round })}
                                                    aria-pressed={draft.ammo?.id === round.id}
                                                    className={cn(
                                                        'micro-label px-3 min-h-11 border transition-colors',
                                                        draft.ammo?.id === round.id
                                                            ? 'border-ember text-ink-100 bg-steel-700'
                                                            : 'border-line-800 text-ink-500 hover:text-ink-200',
                                                    )}
                                                >
                                                    {round.name} &middot; pen {round.stats.penetration}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <p className="micro-label text-ink-700 mt-2">
                                    The magazine decides the calibre, so this list is the whole choice.
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-line-900">
                                <p className="eyebrow mb-2">
                                    Fitted parts &mdash; {draft.build.parts.length}{' '}
                                    <span className="text-ink-700">read-only</span>
                                </p>
                                <ul className="divide-y divide-line-900">
                                    {draft.build.parts.map((part) => (
                                        <li key={part.gameId} className="py-1.5 flex items-baseline justify-between gap-3">
                                            <span className="text-sm text-ink-300 truncate">{part.name}</span>
                                            <span className="micro-label text-ink-700 shrink-0">{part.slot}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

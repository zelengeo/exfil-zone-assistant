'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import BodyViewer, { type ZoneOverlay } from '@/components/protection/BodyViewer';
import HeadViewer, { type HeadViewMode } from '@/components/protection/HeadViewer';
import HeadCoverageMap from '@/components/protection/HeadCoverageMap';
import { armorClassLabel } from '@/lib/protection/armorClassScale';
import type { ViewName } from '@/lib/protection/project';
import { SHOTS_RAMP, formatShots, shotsColor, type LoadoutOutcome } from '../utils/scenario';
import { FACINGS, HEAD_CAPSULE, type Facing, type TargetModel } from '../utils/target-model';

/**
 * The picture: the body, or the head, with the reading painted onto it.
 *
 * Both viewers come from `src/components/protection/` and are mounted exactly as the items route
 * mounts them — the same geometry, the same hit test, one extra overlay. **The head is not redrawn
 * here.** Its protection visualisation already exists, already handles the cone regions, and is
 * already correct; re-deriving that geometry for this route would be a second implementation of
 * the one rule that is hardest to get right.
 *
 * Numerals are deliberately off the figure. Colour is the whole reading, decoded once by the key
 * below, and every exact number lives in the readout panel beside it. That is what makes the
 * picture legible on a phone and in a headset, and it is what frees colour from having to mean
 * "which gun" the way the old four-overlaid design needed it to.
 */

export type TargetTab = 'body' | 'head';

export interface TargetViewProps {
    target: TargetModel;
    outcome: LoadoutOutcome | null;
    tab: TargetTab;
    onTab: (tab: TargetTab) => void;
    facing: Facing;
    onFacing: (facing: Facing) => void;
    selectedZoneId: string | null;
    onSelectZone: (zoneId: string | null) => void;
    className?: string;
}

const BODY_VIEWS: ViewName[] = ['front', 'back', 'left', 'right'];

const HEAD_VIEWS = [
    { name: 'Front', azimuth: 0, elevation: 0 },
    { name: 'Right', azimuth: 90, elevation: 0 },
    { name: 'Back', azimuth: 180, elevation: 0 },
    { name: 'Left', azimuth: -90, elevation: 0 },
    { name: 'Top', azimuth: 0, elevation: 72 },
] as const;

export default function TargetView({
    target, outcome, tab, onTab, facing, onFacing, selectedZoneId, onSelectZone, className,
}: TargetViewProps) {
    const [view, setView] = useState<ViewName>('front');
    const [headCamera, setHeadCamera] = useState({ azimuth: 0, elevation: 0 });
    const [headMode, setHeadMode] = useState<HeadViewMode>('coverage');

    /**
     * The overlay. Every capsule takes its colour from the ramp; the head takes bands instead,
     * because its readings are two or three different armour classes on one bone and a flat tint
     * would have to pick one of them and lie about the rest.
     */
    const overlay = useMemo((): Record<number, ZoneOverlay> => {
        if (!outcome) return {};
        const map: Record<number, ZoneOverlay> = {};
        for (const entry of outcome.body) {
            map[entry.zone.capsule] = { color: shotsColor(entry.shotsToKill), badge: '' };
        }
        const total = outcome.head.reduce((sum, entry) => sum + (entry.zone.headShare ?? 0), 0) || 1;
        map[HEAD_CAPSULE] = {
            badge: '',
            bands: outcome.head.map((entry) => ({
                share: (entry.zone.headShare ?? 0) / total,
                color: shotsColor(entry.shotsToKill),
            })),
        };
        return map;
    }, [outcome]);

    const selectedCapsule = useMemo(() => {
        if (!selectedZoneId) return null;
        if (selectedZoneId.startsWith('head:')) return HEAD_CAPSULE;
        const outcomeZone = outcome?.byZoneId.get(selectedZoneId);
        return outcomeZone?.zone.capsule ?? null;
    }, [selectedZoneId, outcome]);

    return (
        <div className={cn('min-w-0', className)}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex" role="group" aria-label="Target">
                    {(['body', 'head'] as TargetTab[]).map((name) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => onTab(name)}
                            aria-pressed={tab === name}
                            className={cn(
                                'micro-label px-3 min-h-11 border transition-colors',
                                tab === name
                                    ? 'border-line-400 bg-steel-650 text-ink-100'
                                    : 'border-line-800 text-ink-600 hover:text-ink-300',
                            )}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                <span className="eyebrow text-ink-700 ml-auto">Shot from</span>
                <div className="flex" role="group" aria-label="Shot direction">
                    {FACINGS.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            onClick={() => onFacing(entry.id)}
                            aria-pressed={facing === entry.id}
                            className={cn(
                                'micro-label px-3 min-h-11 border transition-colors',
                                facing === entry.id
                                    ? 'border-line-400 bg-steel-650 text-ink-100'
                                    : 'border-line-800 text-ink-600 hover:text-ink-300',
                            )}
                        >
                            {entry.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'body' ? (
                <>
                    <BodyViewer
                        coverage={target.coverage}
                        overlay={overlay}
                        view={view}
                        selected={selectedCapsule}
                        onSelect={(capsule) => {
                            if (capsule === HEAD_CAPSULE) {
                                onTab('head');
                                onSelectZone(target.head[0]?.id ?? null);
                                return;
                            }
                            const zone = target.body.find((entry) => entry.capsule === capsule);
                            onSelectZone(zone?.id ?? null);
                        }}
                        height={470}
                    />
                    <div className="flex gap-1 mt-2" role="group" aria-label="Camera angle">
                        {BODY_VIEWS.map((name) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => setView(name)}
                                aria-pressed={view === name}
                                className={cn(
                                    'micro-label px-2 min-h-11 border flex-1 transition-colors',
                                    view === name
                                        ? 'border-line-400 bg-steel-650 text-ink-100'
                                        : 'border-line-800 text-ink-600 hover:text-ink-300',
                                )}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <HeadPanel
                    target={target}
                    outcome={outcome}
                    camera={headCamera}
                    onOrbit={(delta) => setHeadCamera((current) => ({
                        azimuth: current.azimuth + delta.azimuth,
                        elevation: Math.max(-85, Math.min(85, current.elevation + delta.elevation)),
                    }))}
                    onPreset={setHeadCamera}
                    mode={headMode}
                    onMode={setHeadMode}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={onSelectZone}
                />
            )}

            {/* The ramp, decoded once. This is why the figure carries no numerals. */}
            <div className="mt-3">
                <p className="eyebrow mb-1">Shots to kill</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {SHOTS_RAMP.map((step, index) => (
                        <li key={step.label} className="flex items-center gap-1.5">
                            <span
                                className="w-2.5 h-2.5 shrink-0"
                                style={{ backgroundColor: step.color }}
                                aria-hidden="true"
                            />
                            <span className="micro-label text-ink-500">
                                {index === 0 ? '1–2' : index === 1 ? '3–4' : index === 2 ? '5–7' : '8+'} {step.label}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/**
 * The head, reusing the shipped viewers.
 *
 * `HeadViewer` raytraces the game's own hit test per pixel and `HeadCoverageMap` unrolls it; both
 * take a `HeadCoverage` and neither knows this route exists. What is added here is the reading
 * below them — the two or three distinct answers a head actually has, and where each applies.
 */
function HeadPanel({
    target, outcome, camera, onOrbit, onPreset, mode, onMode, selectedZoneId, onSelectZone,
}: {
    target: TargetModel;
    outcome: LoadoutOutcome | null;
    camera: { azimuth: number; elevation: number };
    onOrbit: (delta: { azimuth: number; elevation: number }) => void;
    onPreset: (camera: { azimuth: number; elevation: number }) => void;
    mode: HeadViewMode;
    onMode: (mode: HeadViewMode) => void;
    selectedZoneId: string | null;
    onSelectZone: (zoneId: string) => void;
}) {
    const coverage = target.headCoverage;

    if (!coverage) {
        return <p className="text-sm text-ink-500">The head model could not be read.</p>;
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,240px)] gap-3">
                <HeadViewer
                    coverage={coverage}
                    mode={mode}
                    azimuth={camera.azimuth}
                    elevation={camera.elevation}
                    onOrbit={onOrbit}
                    height={330}
                />
                <HeadCoverageMap coverage={coverage} mode={mode} />
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
                {HEAD_VIEWS.map((preset) => (
                    <button
                        key={preset.name}
                        type="button"
                        onClick={() => onPreset({ azimuth: preset.azimuth, elevation: preset.elevation })}
                        className="micro-label px-2 min-h-11 border border-line-800 text-ink-600 hover:text-ink-300 hover:border-line-600 transition-colors"
                    >
                        {preset.name}
                    </button>
                ))}
                <div className="flex ml-auto" role="group" aria-label="Head view mode">
                    {(['coverage', 'regions'] as HeadViewMode[]).map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onMode(value)}
                            aria-pressed={mode === value}
                            className={cn(
                                'micro-label px-3 min-h-11 border transition-colors',
                                mode === value
                                    ? 'border-line-400 bg-steel-650 text-ink-100'
                                    : 'border-line-800 text-ink-600 hover:text-ink-300',
                            )}
                        >
                            {value}
                        </button>
                    ))}
                </div>
            </div>

            {/* Three answers, not six numbers. */}
            <div className="mt-3 border-t border-line-900 pt-3">
                <p className="eyebrow mb-2">
                    {target.head.length === 1 ? 'One answer' : `${target.head.length} answers, not six numbers`}
                </p>
                <ul className="divide-y divide-line-900">
                    {target.head.map((zone) => {
                        const entry = outcome?.byZoneId.get(zone.id) ?? null;
                        return (
                            <li key={zone.id}>
                                <button
                                    type="button"
                                    onClick={() => onSelectZone(zone.id)}
                                    aria-pressed={selectedZoneId === zone.id}
                                    className={cn(
                                        'w-full min-h-11 px-2 py-2 text-left grid grid-cols-[2rem_minmax(0,1fr)_4rem_3rem] items-center gap-2 transition-colors',
                                        selectedZoneId === zone.id
                                            ? 'bg-steel-700 border-l-2 border-ember'
                                            : 'border-l-2 border-transparent hover:bg-steel-750',
                                    )}
                                >
                                    <span
                                        className="font-mono tabular text-base"
                                        style={{ color: entry ? shotsColor(entry.shotsToKill) : undefined }}
                                    >
                                        {entry ? formatShots(entry.shotsToKill) : '—'}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm text-ink-100 truncate">{zone.label}</span>
                                        <span className="block micro-label text-ink-600 truncate">
                                            {zone.headZones?.length
                                                ? zone.headZones.join(' · ')
                                                : (zone.headShare ?? 0) > 0.001
                                                    ? 'no zone of its own — spread thin across all of them'
                                                    : 'nowhere on this head'}
                                        </span>
                                    </span>
                                    <span className="micro-label text-ink-500 text-right">
                                        {zone.armour ? `class ${armorClassLabel(zone.armour.armorClass)}` : '—'}
                                    </span>
                                    <span className="font-mono tabular text-xs text-ink-500 text-right">
                                        {Math.round((zone.headShare ?? 0) * 100)}%
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <p className="micro-label text-ink-700 mt-2 leading-relaxed">
                    A helmet has one class for its whole shell and its cone regions are the holes in it; a face
                    shield is the inverse, its regions <em>are</em> its shell. The two never stack, so a head has
                    as many readings as there are pieces reaching it &mdash; never six, and rarely one.
                </p>
            </div>
        </div>
    );
}

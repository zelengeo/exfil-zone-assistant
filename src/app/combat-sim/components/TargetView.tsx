'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import PanelNote from './PanelNote';
import BodyViewer, { type ZoneOverlay } from '@/components/protection/BodyViewer';
import HeadViewer, { type HeadViewMode } from '@/components/protection/HeadViewer';
import HeadCoverageMap from '@/components/protection/HeadCoverageMap';
import { armorClassLabel } from '@/lib/protection/armorClassScale';
import type { ViewName } from '@/lib/protection/project';
import { SHOTS_RAMP, formatShots, shotsColor, shotsRangeLabel, type LoadoutOutcome } from '../utils/scenario';
import { FACINGS, HEAD_CAPSULE, ZONE_GROUPS, type Facing, type TargetModel } from '../utils/target-model';

/**
 * The picture: the body, or the head, with the reading painted onto it.
 *
 * Both viewers come from `src/components/protection/` and are mounted exactly as the items route
 * mounts them — the same geometry, the same hit test, one extra overlay. **The head is not redrawn
 * here.** Its protection visualisation already exists, already handles the cone regions, and is
 * already correct; re-deriving that geometry for this route would be a second implementation of
 * the one rule that is hardest to get right.
 *
 * **Every capsule carries its own figure.** This reverses the rebuild's original call — "numerals
 * are deliberately off the figure, colour is the whole reading" — which was right for a four-way
 * overlay and wrong the moment the picture showed one loadout. The ramp's top band runs from eight
 * rounds to ninety-eight, so colour alone could not tell a fight from a decision to disengage, and
 * it broke the rule `armorClassScale` already binds every other surface to: the figure is the
 * identity channel and colour only the fast one. `BodyViewer` had the badge channel all along.
 *
 * Thirteen figures, one per capsule, and never a merged one: a calf and a thigh carry different HP
 * pools and different damage scalars, so a single "leg" number would be invented rather than
 * measured. Clutter is handled where clutter belongs — a size floor and a de-collision pass in the
 * viewer.
 *
 * Colour is still never spent on loadout identity, which is what the old four-overlaid design got
 * wrong and what `Compare` exists to answer instead.
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

/**
 * The camera follows the shot direction, and there is no second control for it.
 *
 * There used to be a `front | back | left | right` row sitting directly under a visually identical
 * `Front | Flank | Rear` row. Only the second moves a number, and having the cosmetic twin louder
 * and lower made the model's one real geometric input look like a view toggle. Dragging the figure
 * still orbits it for anyone who wants a different angle; picking a facing returns it to the preset.
 */
const VIEW_OF_FACING: Record<Facing, ViewName> = {
    front: 'front',
    flank: 'right',
    rear: 'back',
};

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
    const [headCamera, setHeadCamera] = useState({ azimuth: 0, elevation: 0 });
    const [headMode, setHeadMode] = useState<HeadViewMode>('coverage');

    /**
     * The overlay. Every capsule takes its colour from the ramp and its own figure as a badge; the
     * head takes horizontal slabs instead, because its readings are two or three different armour
     * classes on one bone and a flat tint would have to pick one of them and lie about the rest.
     */
    const overlay = useMemo((): Record<number, ZoneOverlay> => {
        if (!outcome) return {};
        const map: Record<number, ZoneOverlay> = {};
        for (const entry of outcome.body) {
            map[entry.zone.capsule] = {
                color: shotsColor(entry.shotsToKill),
                badge: formatShots(entry.shotsToKill),
                hollow: !Number.isFinite(entry.shotsToKill),
            };
        }
        const total = outcome.head.reduce((sum, entry) => sum + (entry.zone.headShare ?? 0), 0) || 1;
        // The head's numeral is its *worst* reading. It is the one capsule carrying two or three
        // different answers, and the honest single figure for "if I shoot them in the head" is the
        // one that costs the most — the split itself is in the readings list below the picture.
        const worstHead = outcome.head.reduce<number>(
            (worst, entry) => Math.max(worst, entry.shotsToKill),
            0,
        );
        map[HEAD_CAPSULE] = {
            badge: formatShots(worstHead),
            slabs: outcome.head.map((entry) => ({
                share: (entry.zone.headShare ?? 0) / total,
                color: shotsColor(entry.shotsToKill),
            })),
        };
        return map;
    }, [outcome]);

    /** Clicking the head capsule is a request for the head's readings, which are their own tab. */
    const selectCapsule = (capsule: number) => {
        if (capsule === HEAD_CAPSULE) {
            onTab('head');
            onSelectZone(target.head[0]?.id ?? null);
            return;
        }
        const zone = target.body.find((entry) => entry.capsule === capsule);
        onSelectZone(zone?.id ?? null);
    };

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

                <span className="eyebrow text-ink-700 ml-auto flex items-center gap-1">
                    Shot from
                    <PanelNote label="the shot direction">
                        <p>
                            This is the one control here that moves a number: the coverage test runs over
                            the half of each bone you can actually see from this direction.
                        </p>
                        <p>
                            <strong>Front and Rear give the same figures.</strong> The wedge test takes the
                            absolute dot product, so a plate covering the chest covers the back through the
                            same angle. The flank is the whole question.
                        </p>
                    </PanelNote>
                </span>
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
                        view={VIEW_OF_FACING[facing]}
                        selected={selectedCapsule}
                        onSelect={selectCapsule}
                        height={470}
                    />
                    <ZoneStrip
                        target={target}
                        outcome={outcome}
                        selectedZoneId={selectedZoneId}
                        onSelectZone={onSelectZone}
                        onSelectHead={() => selectCapsule(HEAD_CAPSULE)}
                    />
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

            {/* The ramp, decoded once. Never hidden: a key that decodes a colour ramp is tier 1
                by definition. The last mark is the hollow one — a round that cannot finish the job
                is a different fact from a slow one, not a darker shade of it. */}
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
                                {shotsRangeLabel(index)} {step.label}
                            </span>
                        </li>
                    ))}
                    <li className="flex items-center gap-1.5">
                        <span
                            className="w-2.5 h-2.5 shrink-0 border"
                            style={{ borderColor: SHOTS_RAMP[SHOTS_RAMP.length - 1].color }}
                            aria-hidden="true"
                        />
                        <span className="micro-label text-ink-500">&infin; never</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

/**
 * Every zone as a button, under the figure.
 *
 * The canvas answers a mouse. This answers a thumb, a controller and a keyboard — none of which can
 * aim at a forearm capsule six pixels wide — and it is what makes "pick a body part" a feature
 * rather than a trick you have to discover. It doubles as the whole reading in one block: thirteen
 * zones with their exact figures, which is the thing the colour ramp on its own could never say.
 *
 * One button per capsule, never per pair. Coverage is measured per bone from the direction the shot
 * comes from, so a vest that reaches one shoulder and not the other produces two different answers
 * and a merged "upper arm" figure would have to discard one of them.
 */
function ZoneStrip({
    target, outcome, selectedZoneId, onSelectZone, onSelectHead,
}: {
    target: TargetModel;
    outcome: LoadoutOutcome | null;
    selectedZoneId: string | null;
    onSelectZone: (zoneId: string) => void;
    onSelectHead: () => void;
}) {
    // Head first, then down the body, so the strip reads in the same order as the rail's pips.
    const zones = useMemo(
        () => [...target.body].sort(
            (a, b) => ZONE_GROUPS.indexOf(a.group) - ZONE_GROUPS.indexOf(b.group)
                || a.label.localeCompare(b.label),
        ),
        [target.body],
    );

    const worstHead = outcome?.head.reduce<number>((worst, entry) => Math.max(worst, entry.shotsToKill), 0) ?? null;

    return (
        <div className="mt-2">
            <p className="eyebrow mb-1">Pick a zone</p>
            <ul className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                <li>
                    <ZoneButton
                        name="Head"
                        side={null}
                        shots={worstHead}
                        pressed={Boolean(selectedZoneId?.startsWith('head:'))}
                        onClick={onSelectHead}
                    />
                </li>
                {zones.map((zone) => {
                    const entry = outcome?.byZoneId.get(zone.id) ?? null;
                    const [, side, name] = /^(Left|Right)\s+(.*)$/.exec(zone.label) ?? [null, null, zone.label];
                    return (
                        <li key={zone.id}>
                            <ZoneButton
                                name={name}
                                side={side === 'Left' ? 'L' : side === 'Right' ? 'R' : null}
                                shots={entry?.shotsToKill ?? null}
                                pressed={selectedZoneId === zone.id}
                                onClick={() => onSelectZone(zone.id)}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function ZoneButton({
    name, side, shots, pressed, onClick,
}: {
    name: string;
    side: 'L' | 'R' | null;
    shots: number | null;
    pressed: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={pressed}
            className={cn(
                'w-full min-h-11 px-2 py-1.5 border text-left flex items-center gap-2 transition-colors',
                pressed
                    ? 'border-ember bg-steel-700'
                    : 'border-line-800 hover:border-line-600 hover:bg-steel-750',
            )}
        >
            <span className="min-w-0 flex-1">
                <span className="block text-xs text-ink-200 truncate leading-tight">
                    {side && <span className="text-ink-600">{side} </span>}
                    {name}
                </span>
            </span>
            <span
                className="font-mono tabular text-base leading-none shrink-0"
                style={{ color: shots === null ? undefined : shotsColor(shots) }}
            >
                {shots === null ? '—' : formatShots(shots)}
            </span>
        </button>
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
                <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="eyebrow">
                        {target.head.length === 1 ? 'One answer' : `${target.head.length} answers, not six numbers`}
                    </p>
                    <PanelNote label="the head readings">
                        <p>
                            A helmet has one class for its whole shell and its cone regions are the holes in
                            it; a face shield is the inverse, its regions <em>are</em> its shell.
                        </p>
                        <p>
                            The two never stack, so a head has as many readings as there are pieces reaching
                            it &mdash; never six, and rarely one.
                        </p>
                    </PanelNote>
                </div>
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
            </div>
        </div>
    );
}

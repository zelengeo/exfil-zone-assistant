'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { FaceShield, Helmet, Item } from '@/types/items';
import { isFaceShield, isHelmet } from '@/app/combat-sim/utils/types';
import { getItemsByCategory } from '@/services/ItemService';
import { headCoverage } from '@/lib/protection/headCoverage';
import { useBodyModel } from '@/hooks/useBodyModel';
import HeadViewer, { HEAD_COLORS, regionColor, type HeadViewMode } from './HeadViewer';
import HeadCoverageMap from './HeadCoverageMap';
import HeadZoneTable from './HeadZoneTable';

/**
 * The head viewers and their numbers, sharing one worn set.
 *
 * This is the items route's assembly of the route-neutral pieces, the head counterpart of
 * `BodyCoveragePanel`. It carries the pairing picker because pairing is the whole subtlety of head
 * gear: a face shield only ever fills a helmet's holes, and worn without one it protects nothing at
 * all (docs/HEAD_PROTECTION.md §14.3). Neither viewer knows this panel exists.
 */

const VIEWS = [
    { name: 'front', azimuth: 0, elevation: 0 },
    { name: 'right', azimuth: 90, elevation: 0 },
    { name: 'back', azimuth: 180, elevation: 0 },
    { name: 'left', azimuth: -90, elevation: 0 },
    { name: 'top', azimuth: 0, elevation: 72 },
] as const;

const MODES: ReadonlyArray<{ value: HeadViewMode; label: string }> = [
    { value: 'coverage', label: 'Coverage' },
    { value: 'regions', label: 'Regions' },
];

/** One swatch and what it means. The picture is two colours; nothing should have to be guessed. */
interface LegendEntry {
    key: string;
    colour: string;
    label: string;
    /** Trailing figure, where the swatch stands for a measurable share. */
    value?: string;
    /** Region index, so hovering the entry emphasises that frustum on the head. */
    region?: number;
    dashed?: boolean;
}

export interface HeadCoveragePanelProps {
    item: Helmet | FaceShield;
    className?: string;
}

export default function HeadCoveragePanel({ item, className }: HeadCoveragePanelProps) {
    const { model, error } = useBodyModel();
    const [gear, setGear] = useState<{ helmets: Helmet[]; shields: FaceShield[] } | null>(null);
    // `undefined` means "the reader has not chosen", which is not the same as "none" — the default
    // depends on the compatible list, which arrives asynchronously.
    const [chosenId, setChosenId] = useState<string | null | undefined>(undefined);
    // One camera, owned here: a preset sets it outright and a drag nudges it, so clicking `back`
    // after orbiting actually goes to the back.
    const [camera, setCamera] = useState({ azimuth: 0, elevation: 0 });
    const [chosenMode, setChosenMode] = useState<HeadViewMode | undefined>(undefined);
    const [highlight, setHighlight] = useState<number | null>(null);

    const subject: 'helmet' | 'shield' = isHelmet(item) ? 'helmet' : 'shield';

    // The other half of the pair, for the picker. Cached by `ItemService`, so this is one fetch per
    // session however many head-gear pages get opened.
    useEffect(() => {
        let cancelled = false;
        getItemsByCategory('gear')
            .then((items: Item[]) => {
                if (cancelled) return;
                setGear({
                    helmets: items.filter(isHelmet),
                    shields: items.filter(isFaceShield),
                });
            })
            .catch(() => {
                if (!cancelled) setGear({ helmets: [], shields: [] });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    /**
     * Shields the helmet declares, or helmets that declare this shield. `canAttach` is curated, so
     * a shield nothing names is not a shield nothing fits — it is a shield the wiki has not recorded
     * a host for, which is why the picker still offers everything below.
     */
    const compatible = useMemo(() => {
        if (!gear) return [];
        return subject === 'helmet'
            ? gear.shields.filter((shield) =>
                (item as Helmet).stats.canAttach?.includes(shield.id))
            : gear.helmets.filter((helmet) => helmet.stats.canAttach?.includes(item.id));
    }, [gear, item, subject]);

    // A shield alone protects nothing, so its page opens on its declared host where there is one.
    // A helmet's page opens on the helmet alone: the shield is the addition, not the subject.
    const pairedId = chosenId === undefined
        ? (subject === 'shield' ? compatible[0]?.id ?? null : null)
        : chosenId;

    const options = useMemo(() => {
        if (!gear) return [];
        const all = subject === 'helmet' ? gear.shields : gear.helmets;
        const ids = new Set(compatible.map((entry) => entry.id));
        // Declared partners first, then the rest — the picker doubles as a "what if" for the
        // pairings `canAttach` has not recorded.
        return [...compatible, ...all.filter((entry) => !ids.has(entry.id))];
    }, [compatible, gear, subject]);

    const paired = options.find((entry) => entry.id === pairedId) ?? null;
    const helmet = subject === 'helmet' ? (item as Helmet) : (paired as Helmet | null);
    const shield = subject === 'shield' ? (item as FaceShield) : (paired as FaceShield | null);

    const coverage = useMemo(
        () => (model ? headCoverage(model, helmet, shield) : null),
        [model, helmet, shield],
    );

    // A shield with no helmet under it protects nothing at all, so the coverage view would be a
    // flat "exposed everywhere" — true, and useless. Open on the regions instead: the plate and the
    // slit cut in it are the thing worth seeing, and the note below says why the numbers are zero.
    const mode: HeadViewMode = chosenMode ?? (!helmet && shield ? 'regions' : 'coverage');

    /**
     * The item's own aperture — a helmet's face opening, a shield's mask angles. Probably the coarse
     * "is this hit in face-shield territory" test rather than protection in its own right (§8), so
     * it is drawn as a reference frame and never counted.
     */
    const aperture = useMemo(() => {
        const width = isHelmet(item) ? item.stats.faceWidthAngle : item.stats.maskWidthAngle;
        const height = isHelmet(item) ? item.stats.faceHeightAngle : item.stats.maskHeightAngle;
        return typeof width === 'number' && typeof height === 'number' ? { width, height } : null;
    }, [item]);

    const [showAperture, setShowAperture] = useState(false);
    const [showWireframe, setShowWireframe] = useState(false);

    if (error) {
        return (
            <p className={cn('text-xs text-ink-600', className)}>
                The body model could not be loaded, so head coverage cannot be drawn.
            </p>
        );
    }

    if (!coverage) {
        return <p className={cn('eyebrow text-ink-700', className)}>Loading head model…</p>;
    }

    if (coverage.empty) {
        return (
            <p className={cn('text-xs text-ink-500', className)}>
                This piece authors no protection geometry at all.
            </p>
        );
    }

    const percent = Math.round(coverage.total * 100);
    const legend: LegendEntry[] = mode === 'coverage'
        ? [
            { key: 'protected', colour: HEAD_COLORS.protected, label: 'Protected', value: `${percent}%` },
            { key: 'exposed', colour: HEAD_COLORS.exposed, label: 'Exposed', value: `${100 - percent}%` },
        ]
        : [
            ...coverage.regions.map((worn): LegendEntry => {
                // An overridden helmet never consults its regions, so calling one an "opening"
                // would be a lie the picture then appears to confirm.
                const kind = worn.owner === 'helmet'
                    ? (coverage.overridden ? 'Inherited, unused' : 'Opening')
                    : worn.region.reverse ? 'Cutout' : 'Plate';
                return {
                    key: String(worn.region.index),
                    colour: regionColor(worn.region.index, worn.region.reverse),
                    label: `${kind} ±${worn.region.width}×${worn.region.height}°`,
                    region: worn.region.index,
                    dashed: worn.region.reverse,
                };
            }),
            {
                key: 'bare',
                colour: HEAD_COLORS.bare,
                label: helmet
                    ? (coverage.overridden ? 'Shell — covers everything' : 'Shell — no opening here')
                    : 'Outside every region',
            },
        ];

    return (
        <div className={cn('space-y-4', className)}>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-5">
                <div>
                    <HeadViewer
                        coverage={coverage}
                        mode={mode}
                        azimuth={camera.azimuth}
                        elevation={camera.elevation}
                        onOrbit={(delta) =>
                            setCamera((prev) => ({
                                azimuth: prev.azimuth + delta.azimuth,
                                elevation: Math.max(-85, Math.min(85, prev.elevation + delta.elevation)),
                            }))
                        }
                        highlight={mode === 'regions' ? highlight : null}
                        aperture={showAperture ? aperture : null}
                        showWireframe={showWireframe}
                        height={340}
                    />

                    <div className="flex gap-1 mt-2" role="group" aria-label="Camera angle">
                        {VIEWS.map((entry) => {
                            const active =
                                Math.round(((camera.azimuth % 360) + 360) % 360) === ((entry.azimuth % 360) + 360) % 360
                                && Math.round(camera.elevation) === entry.elevation;
                            return (
                                <button
                                    key={entry.name}
                                    type="button"
                                    onClick={() =>
                                        setCamera({ azimuth: entry.azimuth, elevation: entry.elevation })
                                    }
                                    aria-pressed={active}
                                    className={cn(
                                        'micro-label px-2 py-1 border flex-1 transition-colors',
                                        active
                                            ? 'border-line-400 bg-steel-650 text-ink-100'
                                            : 'border-line-800 text-ink-600 hover:text-ink-300 hover:border-line-600',
                                    )}
                                >
                                    {entry.name}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-1 mt-1" role="group" aria-label="Shading">
                        {MODES.map((entry) => (
                            <button
                                key={entry.value}
                                type="button"
                                onClick={() => setChosenMode(entry.value)}
                                aria-pressed={mode === entry.value}
                                className={cn(
                                    'micro-label px-2 py-1 border flex-1 transition-colors',
                                    mode === entry.value
                                        ? 'border-line-400 bg-steel-650 text-ink-100'
                                        : 'border-line-800 text-ink-600 hover:text-ink-300 hover:border-line-600',
                                )}
                            >
                                {entry.label}
                            </button>
                        ))}
                    </div>

                    {/* The key to both pictures beside it. Two colours in coverage mode, one per
                        frustum in region mode — either way nothing on the head is unnamed. */}
                    <ul className="mt-3 space-y-1" aria-label="Legend">
                        {legend.map((entry) => (
                            <li
                                key={entry.key}
                                onMouseEnter={() => setHighlight(entry.region ?? null)}
                                onMouseLeave={() => setHighlight(null)}
                                className={cn(
                                    'flex items-center gap-2 px-1 py-0.5 -mx-1 transition-colors',
                                    entry.region !== undefined && 'hover:bg-steel-800',
                                )}
                            >
                                <span
                                    className={cn('w-3 h-3 shrink-0', entry.dashed && 'border border-dashed')}
                                    style={
                                        entry.dashed
                                            ? { borderColor: entry.colour, backgroundColor: 'transparent' }
                                            : { backgroundColor: entry.colour }
                                    }
                                    aria-hidden="true"
                                />
                                <span className="text-[11px] text-ink-400 min-w-0 truncate">{entry.label}</span>
                                {entry.value && (
                                    <span className="ml-auto font-mono tabular text-[11px] text-ink-200">
                                        {entry.value}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                        <label className="flex items-center gap-1.5 micro-label text-ink-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showWireframe}
                                onChange={(e) => setShowWireframe(e.target.checked)}
                                className="accent-ember"
                            />
                            Frustum edges
                        </label>
                        {aperture && (
                            <label className="flex items-center gap-1.5 micro-label text-ink-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showAperture}
                                    onChange={(e) => setShowAperture(e.target.checked)}
                                    className="accent-ember"
                                />
                                {subject === 'helmet' ? 'Face aperture' : 'Mask aperture'}
                                <span className="text-ink-800">
                                    ±{aperture.width}×{aperture.height}°
                                </span>
                            </label>
                        )}
                    </div>
                </div>

                <div className="space-y-4 min-w-0">
                    {options.length > 0 && (
                        <label className="block">
                            <span className="eyebrow block mb-1">
                                {subject === 'helmet' ? 'Worn with face shield' : 'Worn under helmet'}
                            </span>
                            <select
                                value={pairedId ?? ''}
                                onChange={(e) => setChosenId(e.target.value || null)}
                                className="w-full bg-steel-750 border border-line-600 text-xs text-ink-200 px-2 py-1.5"
                            >
                                <option value="">
                                    {subject === 'helmet' ? '— none —' : '— no helmet —'}
                                </option>
                                {options.map((entry) => (
                                    <option key={entry.id} value={entry.id}>
                                        {entry.name}
                                        {compatible.some((c) => c.id === entry.id) ? '' : '  (not a declared pair)'}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <HeadZoneTable coverage={coverage} />
                    <HeadCoverageMap coverage={coverage} mode={mode} />
                </div>
            </div>

            <div className="space-y-2 text-[11px] leading-relaxed text-ink-600">
                <p>
                    A helmet has exactly <span className="text-ink-400">one</span> armour class for the
                    whole head; the geometry decides only <span className="text-ink-400">whether</span> it
                    applies to a hit. A helmet&apos;s regions are openings in its shell. A face
                    shield&apos;s are the shell, and its dashed regions are holes cut in that — the M1sch
                    visor&apos;s vision slit is one. Figures are shares of the head hitbox&apos;s surface,
                    measured by running the game&apos;s own test over it.
                </p>

                {coverage.overridden && (
                    <p className="text-ink-500">
                        This helmet overrides the geometry test entirely and protects the whole head
                        uniformly, so the region it inherits is dead data and is drawn for reference only.
                    </p>
                )}

                {coverage.shieldWithoutHelmet && (
                    <p className="text-warn">
                        Worn on its own a face shield protects nothing — it checks that its wearer has a
                        helmet before it stops anything. Pick a helmet above to see what it adds.
                    </p>
                )}

                {shield && helmet && (
                    <p>
                        The shield only fills holes the helmet leaves; where the helmet already covers,
                        it contributes nothing and the two never stack. It also stops protecting the
                        moment it is flipped up.
                    </p>
                )}
            </div>
        </div>
    );
}

'use client';

/*
 * NOT MOUNTED ANYWHERE — kept deliberately.
 *
 * The gunsmith used to render this plot under the bench. It came out because the
 * pattern it draws turned out not to match what the gun actually does in game:
 * re-deriving the game's integrator from the shipped recoil parameters produces a
 * plausible-looking trace, but comparing it against real bursts showed the shape
 * and the spread are both wrong, and a confidently wrong pattern is worse than no
 * pattern at all. The maths below (see `@/lib/gunsmith/recoil`) is therefore not
 * to be trusted for anything user-facing until the model is validated against
 * recorded fire.
 *
 * Kept in the tree because the drawing side — the centimetre-space plot, the
 * silhouette, the baseline trace — is fine and is worth reusing once the
 * simulation underneath it is right.
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { RecoilParameters } from '@/types/items';
import { offsetAt, simulateRecoil, spreadRadiusPerMetre } from '@/lib/gunsmith/recoil';

interface RecoilPatternProps {
    /** The **assembled** recoil parameters — the parts' modifiers folded in. */
    recoilParameters: Partial<RecoilParameters>;
    fireRate: number;
    /** Spread in minutes of arc, for the cone drawn behind the pattern. */
    moa?: number | null;
    rounds?: number;
    /** Metres to the target. Changes nothing about the *shape* — see the note below. */
    distance?: number;
    /** The build this one started from, drawn as a dashed trace behind. */
    baseline?: Partial<RecoilParameters> | null;
    /** Same seed, same pattern — a change in the plot is a change in the gun, not in the dice. */
    seed?: number;
    className?: string;
}

/**
 * A person, in centimetres, measured from a chest-height aim point.
 *
 * This is the only thing on the plot that does not scale with distance, and that is the point:
 * recoil is *angular*, so its spread in centimetres grows in proportion to the range while the man
 * you are shooting at stays the same size. A burst that stays on the chest at 25 m goes over the
 * head at 100 m, and no amount of staring at a bare pattern shows that.
 *
 * Figures are a 1.8 m adult: 46 cm across the shoulders, chest centre about 1.35 m up, head 16 cm
 * wide. Precise enough for "does this burst stay on a man"; it is a reference, not a hitbox.
 */
const HUMAN = {
    shoulderHalfWidth: 23,
    waistHalfWidth: 17,
    torsoTop: 22,
    torsoBottom: -38,
    headRadiusX: 8,
    headRadiusY: 10.5,
    headCentre: 33,
};

/** Shoulders down to the waist, as an SVG path in the plot's own centimetre space. */
const TORSO_PATH = [
    `M ${-HUMAN.shoulderHalfWidth} ${-HUMAN.torsoTop}`,
    `L ${HUMAN.shoulderHalfWidth} ${-HUMAN.torsoTop}`,
    `L ${HUMAN.waistHalfWidth} ${-HUMAN.torsoBottom}`,
    `L ${-HUMAN.waistHalfWidth} ${-HUMAN.torsoBottom}`,
    'Z',
].join(' ');

/**
 * Where the shots land, run through the game's own recoil integrator.
 *
 * Each dot is one round, sampled where the crosshair sat **before** that round's kick — which is
 * what a shot pattern is. The blue circle is the spread cone the barrel adds on top of every one of
 * them; the game samples it on a ring at seven tenths of the radius rather than uniformly, so a
 * real group sits wider than the circle suggests.
 *
 * The plot is drawn in centimetres at the target, with **one scale on both axes** — so the cone is
 * a circle, and vertical and horizontal spread can be compared by eye.
 */
export default function RecoilPattern({
    recoilParameters,
    fireRate,
    moa = null,
    rounds = 20,
    distance = 50,
    baseline = null,
    seed = 1,
    className,
}: RecoilPatternProps) {
    const plot = useMemo(() => {
        const run = simulateRecoil(recoilParameters, { rounds, fireRate, seed });
        const base = baseline ? simulateRecoil(baseline, { rounds, fireRate, seed }) : null;

        // The simulation works in angles; centimetres at the target is angle × range.
        const toPoint = (shot: { pitch: number; yaw: number }) => ({
            x: offsetAt(shot.yaw, distance) * 100,
            y: offsetAt(shot.pitch, distance) * 100,
        });
        const points = run.shots.map(toPoint);
        const basePoints = base ? base.shots.map(toPoint) : null;
        const cone = spreadRadiusPerMetre(moa) * distance;

        const all = [...points, ...(basePoints ?? [])];
        const xs = all.map((p) => p.x);
        const ys = all.map((p) => p.y);

        // Fit the pattern, the cone and the whole figure, then pad.
        const left = Math.min(-cone, -HUMAN.shoulderHalfWidth, ...xs);
        const right = Math.max(cone, HUMAN.shoulderHalfWidth, ...xs);
        const bottom = Math.min(-cone, HUMAN.torsoBottom, ...ys);
        const top = Math.max(cone, HUMAN.headCentre + HUMAN.headRadiusY, ...ys);
        const padX = Math.max((right - left) * 0.08, 4);
        const padY = Math.max((top - bottom) * 0.06, 4);

        const view = {
            minX: left - padX,
            minY: -(top + padY),
            width: right - left + padX * 2,
            height: top - bottom + padY * 2,
        };

        return {
            points,
            basePoints,
            cone,
            view,
            climb: points.length ? Math.max(...ys) : 0,
            width: points.length ? Math.max(...xs) - Math.min(...xs) : 0,
        };
    }, [recoilParameters, baseline, rounds, fireRate, distance, moa, seed]);

    // SVG y runs downwards; the model's y runs up, so every point is negated on the way in.
    const { view } = plot;
    const dot = Math.max(view.width, view.height) / 90;

    return (
        <div className={cn('flex flex-col', className)}>
            <div className="plot-grid border border-line-800 flex-1 min-h-0">
                <svg
                    viewBox={`${view.minX} ${view.minY} ${view.width} ${view.height}`}
                    className="w-full h-full block"
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label={`Recoil pattern for ${rounds} rounds at ${distance} metres`}
                >
                    {/* The man. Behind everything, and the only fixed-size thing here. */}
                    <g fill="#161E26" stroke="#212A32" strokeWidth={dot / 3}>
                        <path d={TORSO_PATH} />
                        <ellipse
                            cx={0}
                            cy={-HUMAN.headCentre}
                            rx={HUMAN.headRadiusX}
                            ry={HUMAN.headRadiusY}
                        />
                    </g>

                    {/* Aim point. */}
                    <line x1={0} y1={view.minY} x2={0} y2={view.minY + view.height} stroke="#1B242C" strokeWidth={dot / 4} />
                    <line x1={view.minX} y1={0} x2={view.minX + view.width} y2={0} stroke="#1B242C" strokeWidth={dot / 4} />

                    {plot.cone > 0 && (
                        <circle
                            cx={0}
                            cy={0}
                            r={plot.cone}
                            fill="#5B8CA8"
                            fillOpacity="0.10"
                            stroke="#5B8CA8"
                            strokeOpacity="0.4"
                            strokeWidth={dot / 3}
                        />
                    )}

                    {plot.basePoints && plot.basePoints.length > 1 && (
                        <polyline
                            points={plot.basePoints.map((p) => `${p.x},${-p.y}`).join(' ')}
                            fill="none"
                            stroke="#5B8CA8"
                            strokeOpacity="0.55"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    <polyline
                        points={plot.points.map((p) => `${p.x},${-p.y}`).join(' ')}
                        fill="none"
                        stroke="#FF4A24"
                        strokeOpacity="0.5"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                    />
                    {plot.points.map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={-p.y}
                            r={i === 0 ? dot * 1.4 : dot}
                            fill={i === 0 ? '#FF4A24' : '#ECF2F7'}
                            fillOpacity={i === 0 ? 1 : 0.3 + (0.7 * (plot.points.length - i)) / plot.points.length}
                        />
                    ))}
                </svg>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 mt-2">
                <span className="micro-label text-ink-600">
                    {`${rounds} rounds · ${distance} m · silhouette 1.8 m`}
                </span>
                <span className="font-mono tabular text-[10px] text-ink-500">
                    {`Climb ${Math.round(plot.climb)} cm · width ${Math.round(plot.width)} cm`}
                </span>
            </div>
        </div>
    );
}

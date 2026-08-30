'use client';

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
    distance?: number;
    /** The build this one started from, drawn as a dashed trace behind. */
    baseline?: Partial<RecoilParameters> | null;
    /** Same seed, same pattern — a change in the plot is a change in the gun, not in the dice. */
    seed?: number;
    className?: string;
}

/**
 * Where the shots land, run through the game's own recoil integrator.
 *
 * Each dot is one round, sampled where the crosshair sat **before** that round's kick — which is
 * what a shot pattern is. The faint disc is the spread cone the barrel adds on top; the game
 * samples it on a ring at seven tenths of the radius rather than uniformly, so a real group looks
 * wider than the cone suggests.
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
    console.log('RecoilPattern', recoilParameters, moa);
    const plot = useMemo(() => {
        const run = simulateRecoil(recoilParameters, { rounds, fireRate, seed });
        const base = baseline ? simulateRecoil(baseline, { rounds, fireRate, seed }) : null;

        const toPoint = (shot: { pitch: number; yaw: number }) => ({
            x: offsetAt(shot.yaw, distance) * 100,   // metres -> centimetres
            y: offsetAt(shot.pitch, distance) * 100,
        });
        const points = run.shots.map(toPoint);
        const basePoints = base ? base.shots.map(toPoint) : null;

        // The cone radius at this distance, in centimetres.
        const cone = spreadRadiusPerMetre(moa) * distance;

        const xs = [...points, ...(basePoints ?? [])].map((p) => p.x);
        const ys = [...points, ...(basePoints ?? [])].map((p) => p.y);
        const spanX = Math.max(Math.max(...xs.map(Math.abs), cone) * 1.25, 10);
        const spanY = Math.max(Math.max(...ys, cone) * 1.15, 10);

        return {
            points,
            basePoints,
            cone,
            spanX,
            spanY,
            climb: points.length ? Math.max(...points.map((p) => p.y)) : 0,
            width: points.length ? Math.max(...xs) - Math.min(...xs) : 0,
        };
    }, [recoilParameters, baseline, rounds, fireRate, distance, moa, seed]);

    // A 0-1 viewBox keeps the plot resolution-independent; the aim point sits at the bottom centre.
    const width = 100;
    const height = 100;
    const toX = (cm: number) => width / 2 + (cm / plot.spanX) * (width / 2);
    const toY = (cm: number) => height - 8 - (cm / plot.spanY) * (height - 12);

    return (
        <div className={cn('flex flex-col', className)}>
            <div className="plot-grid border border-line-800 relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full block" preserveAspectRatio="none">
                    {/* Aim point */}
                    <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="#1B242C" strokeWidth="0.4" />
                    <line x1={0} y1={toY(0)} x2={width} y2={toY(0)} stroke="#1B242C" strokeWidth="0.4" />

                    {plot.cone > 0 && (
                        <ellipse
                            cx={toX(0)}
                            cy={toY(0)}
                            rx={(plot.cone / plot.spanX) * (width / 2)}
                            ry={(plot.cone / plot.spanY) * (height - 12)}
                            fill="#5B8CA8"
                            fillOpacity="0.10"
                            stroke="#5B8CA8"
                            strokeOpacity="0.35"
                            strokeWidth="0.3"
                        />
                    )}

                    {plot.basePoints && plot.basePoints.length > 1 && (
                        <polyline
                            points={plot.basePoints.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ')}
                            fill="none"
                            stroke="#5B8CA8"
                            strokeOpacity="0.55"
                            strokeWidth="0.5"
                            strokeDasharray="1.5 1.5"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    <polyline
                        points={plot.points.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ')}
                        fill="none"
                        stroke="#FF4A24"
                        strokeOpacity="0.5"
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                    />
                    {plot.points.map((p, i) => (
                        <circle
                            key={i}
                            cx={toX(p.x)}
                            cy={toY(p.y)}
                            r={i === 0 ? 1.4 : 1}
                            fill={i === 0 ? '#FF4A24' : '#ECF2F7'}
                            fillOpacity={i === 0 ? 1 : 0.25 + (0.75 * (plot.points.length - i)) / plot.points.length}
                        />
                    ))}
                </svg>
            </div>

            <div className="flex items-center justify-between mt-2">
                <span className="micro-label text-ink-600">
                    {`${rounds} rounds · ${distance} m`}
                </span>
                <span className="font-mono tabular text-[10px] text-ink-500">
                    {`Climb ${Math.round(plot.climb)} cm · width ${Math.round(plot.width)} cm`}
                </span>
            </div>
        </div>
    );
}

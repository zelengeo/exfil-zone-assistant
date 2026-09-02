'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { dot, segment, sub, type Capsule, type Vec3 } from '@/lib/protection/bodyModel';
import { makeProjector, VIEW_PRESETS, type Camera, type ViewName } from '@/lib/protection/project';
import { armorClassColor, armorClassLabel } from '@/lib/protection/armorClassScale';
import type { Coverage, ZoneCoverage } from '@/lib/protection/coverage';

/**
 * The body, and what a piece of gear covers of it.
 *
 * Route-neutral by construction: it takes a `Coverage` and a highlight, and knows nothing about
 * items, prices or damage. The items route passes coverage and nothing else; the combat simulator
 * can pass the same coverage plus `onSelect` and an `overlay` of per-zone damage without this
 * component learning a second case.
 *
 * Drawn as flat capsule silhouettes rather than shaded solids: the question is "does the plate
 * reach round to here", and an unlit outline answers it more legibly than a lit surface.
 */

export interface ZoneOverlay {
    /** Replaces the coverage tint for this capsule — the simulator uses it for damage. */
    color?: string;
    /** Short text drawn beside the capsule. */
    badge?: string;
}

export interface BodyViewerProps {
    coverage: Coverage;
    /** Capsule index, or null. */
    selected?: number | null;
    /** Omitted ⇒ read-only, the way `BuildSlotList` reads an omitted `onSelectSlot`. */
    onSelect?: (capsuleIndex: number) => void;
    onHover?: (capsuleIndex: number | null) => void;
    overlay?: Record<number, ZoneOverlay>;
    view?: ViewName;
    className?: string;
    height?: number;
}

/**
  * Bones worth drawing.
  *
  * The rig carries 69, but fingers, twist correctives and the IK targets are all invisible to a
  * bullet and only add spider legs to the picture. What is left is the chain a reader recognises
  * as a body.
  */
const RIG_ONLY = /^(ik_|index_|middle_|pinky_|ring_|thumb_|ball_)|_twist_/i;

const COLORS = {
    bone: '#26313C',
    bare: '#33414D',
    bareFill: 'rgba(26,34,42,0.55)',
    selected: '#FF4A24',
} as const;

function hexToRgb(hex: string): [number, number, number] {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/**
 * The fill: hue says how good the plate is, opacity says how much of the bone it reaches.
 *
 * Two channels for two different questions, which is what the picture is actually asked. The ramp
 * used to be monochrome for both, so a class 6 chest plate covering 55% and a class 3 shoulder
 * covering 100% came out looking like the shoulder was the better armour.
 */
function coverFill(zone: ZoneCoverage): string {
    if (zone.fraction <= 0.001) return COLORS.bareFill;
    const [r, g, b] = hexToRgb(armorClassColor(zone.zone?.armorClass));
    const alpha = 0.3 + zone.fraction * 0.5;
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

function coverStroke(zone: ZoneCoverage): string {
    return zone.fraction <= 0.001 ? COLORS.bare : armorClassColor(zone.zone?.armorClass);
}

/**
 * A capsule as a 2D outline: the two end circles plus the tangent lines between them.
 *
 * Exact for a capsule under perspective at this scale, and far cheaper than meshing one.
 */
function capsuleOutline(
    cap: Capsule,
    project: (p: Vec3) => { x: number; y: number; depth: number },
    scale: number,
) {
    const [A, B] = segment(cap);
    const a = project(A);
    const b = project(B);
    const r = cap.radius * scale;
    return { a, b, r };
}

export default function BodyViewer({
    coverage,
    selected = null,
    onSelect,
    onHover,
    overlay,
    view = 'front',
    className,
    height = 460,
}: BodyViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 360, height });
    // Orbit the reader has dragged to, if any. Null means "follow the caller's preset", so a
    // preset change is picked up without an effect writing it into state.
    const [orbit, setOrbit] = useState<{ azimuth: number; elevation: number } | null>(null);
    const camera: Camera = useMemo(
        () => ({
            ...(orbit ?? VIEW_PRESETS[view]),
            distance: 320,
            target: [0, 0, 105],
            fov: 40,
        }),
        [orbit, view],
    );
    const drag = useRef<{ x: number; y: number } | null>(null);
    const interactive = Boolean(onSelect);

    useEffect(() => {
        const element = wrapRef.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            setSize({ width: Math.max(200, entry.contentRect.width), height });
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [height]);

    /** Capsule under a canvas point, nearest first. */
    const pick = useCallback(
        (px: number, py: number): number | null => {
            const projector = makeProjector(camera, size);
            const ray = projector.ray(px, py);
            let best: { index: number; t: number } | null = null;

            for (const zone of coverage.zones) {
                const cap = zone.capsule;
                const [A, B] = segment(cap);
                // Distance from the ray to the capsule's segment, tested against its radius.
                const ab = sub(B, A);
                const ao = sub(A, projector.eye);
                const abab = dot(ab, ab);
                const abd = dot(ab, ray);
                const abao = dot(ab, ao);
                const denom = 1 - (abd * abd) / (abab || 1);
                if (Math.abs(denom) < 1e-9) continue;
                const t = (-dot(ao, ray) + (abd * abao) / (abab || 1)) / denom;
                if (t <= 0) continue;
                let along = (abao + t * abd) / (abab || 1);
                along = Math.max(0, Math.min(1, along));
                const onSeg: Vec3 = [
                    A[0] + ab[0] * along,
                    A[1] + ab[1] * along,
                    A[2] + ab[2] * along,
                ];
                const onRay: Vec3 = [
                    projector.eye[0] + ray[0] * t,
                    projector.eye[1] + ray[1] * t,
                    projector.eye[2] + ray[2] * t,
                ];
                const gap = Math.hypot(
                    onSeg[0] - onRay[0],
                    onSeg[1] - onRay[1],
                    onSeg[2] - onRay[2],
                );
                if (gap > cap.radius) continue;
                if (!best || t < best.t) best = { index: cap.index, t };
            }

            return best ? best.index : null;
        },
        [camera, coverage.zones, size],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
        canvas.width = size.width * dpr;
        canvas.height = size.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size.width, size.height);

        const projector = makeProjector(camera, size);

        // Skeleton first, behind everything: it is orientation, not subject.
        const byIndex = new Map(coverage.model.bones.map((bone) => [bone.index, bone]));
        ctx.strokeStyle = COLORS.bone;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const bone of coverage.model.bones) {
            if (RIG_ONLY.test(bone.name)) continue;
            const parent = byIndex.get(bone.parentIndex);
            if (!parent || RIG_ONLY.test(parent.name)) continue;
            const from = projector.project(parent.origin);
            const to = projector.project(bone.origin);
            if (from.depth <= 0 || to.depth <= 0) continue;
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
        }
        ctx.stroke();

        // Capsules, far to near, so a near one overdraws what it hides.
        const ordered = [...coverage.zones].sort((a, b) => {
            const da = projector.project(a.capsule.centre).depth;
            const db = projector.project(b.capsule.centre).depth;
            return db - da;
        });

        // Text is collected here and drawn once every capsule is down, so a nearer limb cannot
        // overdraw the figure on the chest behind it.
        const labels: Array<{ x: number; y: number; text: string; colour: string }> = [];

        for (const zone of ordered) {
            const { a, b, r } = capsuleOutline(zone.capsule, projector.project, projector.scale);
            if (a.depth <= 0 && b.depth <= 0) continue;

            const custom = overlay?.[zone.capsule.index];
            const isSelected = selected === zone.capsule.index;

            ctx.beginPath();
            // A stadium: both caps plus the connecting body. Round joins give the tangent lines.
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineWidth = r * 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = custom?.color ?? coverFill(zone);
            ctx.stroke();

            // Outline on top, so the shape reads even where two capsules meet.
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = isSelected ? COLORS.selected : coverStroke(zone);
            ctx.stroke();

            if (isSelected) {
                ctx.beginPath();
                ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
                ctx.moveTo(b.x + r, b.y);
                ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = COLORS.selected;
                ctx.stroke();
            }

            // The class, on the plate itself. The hues are the rarity ladder, which is categorical
            // — non-adjacent tiers do not separate under CVD — so the figure is the identity
            // channel and the colour only the fast one. A caller's badge outranks it.
            const badge = custom?.badge
                ?? (zone.zone && zone.fraction > 0.001 ? armorClassLabel(zone.zone.armorClass) : null);
            if (badge) {
                labels.push({
                    x: (a.x + b.x) / 2,
                    y: (a.y + b.y) / 2,
                    text: badge,
                    colour: custom?.badge ? '#ECF2F7' : armorClassColor(zone.zone?.armorClass),
                });
            }
        }

        ctx.font = "600 11px 'IBM Plex Mono', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0E141A';
        ctx.lineJoin = 'round';
        for (const label of labels) {
            ctx.strokeText(label.text, label.x, label.y);
            ctx.fillStyle = label.colour;
            ctx.fillText(label.text, label.x, label.y);
        }
    }, [camera, coverage, overlay, selected, size]);

    return (
        <div ref={wrapRef} className={cn('relative select-none', className)}>
            <canvas
                ref={canvasRef}
                style={{ width: size.width, height: size.height }}
                className={cn(
                    'bg-steel-850 border border-line-800 plot-grid touch-none',
                    interactive ? 'cursor-pointer' : 'cursor-grab',
                )}
                onPointerDown={(e) => {
                    drag.current = { x: e.clientX, y: e.clientY };
                    e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerUp={(e) => {
                    const start = drag.current;
                    drag.current = null;
                    // A press that did not move is a click, not the end of an orbit.
                    if (!onSelect || !start) return;
                    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 4) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const hit = pick(e.clientX - rect.left, e.clientY - rect.top);
                    if (hit !== null) onSelect(hit);
                }}
                onPointerMove={(e) => {
                    if (drag.current) {
                        const dx = e.clientX - drag.current.x;
                        const dy = e.clientY - drag.current.y;
                        drag.current = { x: e.clientX, y: e.clientY };
                        setOrbit((prev) => {
                            const from = prev ?? VIEW_PRESETS[view];
                            return {
                                azimuth: from.azimuth - dx * 0.5,
                                elevation: Math.max(-80, Math.min(80, from.elevation + dy * 0.4)),
                            };
                        });
                        return;
                    }
                    if (!onHover) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    onHover(pick(e.clientX - rect.left, e.clientY - rect.top));
                }}
                onPointerLeave={() => {
                    drag.current = null;
                    onHover?.(null);
                }}
            />
        </div>
    );
}

export type { ZoneCoverage };

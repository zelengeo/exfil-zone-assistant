'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { dot, norm, sub, type Vec3 } from '@/lib/protection/bodyModel';
import {
    RAD,
    headExtent,
    headRay,
    headSurface,
    protectionAt,
    type HeadCapsule,
    type PreparedRegion,
    type WornSet,
} from '@/lib/protection/headModel';
import { armorClassColor, armorClassLabel } from '@/lib/protection/armorClassScale';
import type { HeadCoverage } from '@/lib/protection/headCoverage';

/**
 * The head, and what a helmet and its shield leave open.
 *
 * Raytraced per pixel rather than drawn as outlines, which is the one place this departs from
 * `BodyViewer`. It has to be: the question there is "does the plate reach round to here", and an
 * unlit outline answers it; the question here is "where exactly is the hole", and a hole is a shape
 * on a curved surface. Every pixel inside the silhouette runs the game's own hit test against every
 * region, so what you see is the test rather than an approximation of it.
 *
 * Route-neutral by construction: it takes a `HeadCoverage` and a camera, and knows nothing about
 * items, prices or pairings. The camera is the caller's — presets and drag both land in one place
 * that way, instead of a preset click quietly losing to whatever the reader last orbited to.
 */

export type HeadViewMode = 'coverage' | 'regions';

export interface HeadViewerProps {
    coverage: HeadCoverage;
    mode?: HeadViewMode;
    /** Degrees around the head. 0 looks at the face; 180 at the nape. */
    azimuth: number;
    /** Degrees above the horizon. */
    elevation: number;
    /** Reports a drag, in degrees. Omit for a viewer that cannot be orbited. */
    onOrbit?: (delta: { azimuth: number; elevation: number }) => void;
    /** Region index to emphasise; the rest fade. Null draws them all at full weight. */
    highlight?: number | null;
    /** The item's own face aperture, drawn as a dashed reference frame when given. */
    aperture?: { width: number; height: number } | null;
    showWireframe?: boolean;
    className?: string;
    height?: number;
}

/**
 * The palette, exported because three things have to agree on it — the raytraced head, the unrolled
 * map beside it and the legend that names them. A colour defined twice is a colour that drifts.
 *
 * Protection itself is no longer in here: a covered pixel takes its colour from `armorClassScale`,
 * the same ladder the body viewer and the cards use, so that a class is one colour wherever it is
 * drawn.
 *
 * `exposed` used to be `warn` — a hole is a warning, not a shade. It cannot be any more: the class
 * ladder now spans grey, green, blue, violet, amber and red, and `warn` is within a hair of class
 * 5's amber, so a Maska rendered as one flat mass with two identical swatches in its key. Since
 * every strong hue collides with some rung, exposure is encoded by *not* being a ladder colour —
 * bare, dark and desaturated against six saturated ones. The picture reads "lit means armoured",
 * which is the question anyway.
 */
export const HEAD_COLORS = {
    exposed: '#39454F', // bare skin — deliberately not `warn`; see above
    bare: '#26313C', // steel-500 — outside every region, in region mode
    reverse: '#ECF2F7', // ink-100
} as const;

const EXPOSED = HEAD_COLORS.exposed;
const BARE = HEAD_COLORS.bare;
const REVERSE = HEAD_COLORS.reverse;
const BACKGROUND = '#0E141A'; // steel-850, matching .plot-grid

/** Categorical, and deliberately free of `warn`: that colour already means "exposed" here. */
export const REGION_COLORS = ['#5B8CA8', '#CFA2FF', '#4ADE80', '#3E8FC7', '#F5B23A', '#FF5F5F', '#9BBDD0'];

/** The colour a region is drawn in, wherever it is drawn. */
export function regionColor(index: number, reverse: boolean): string {
    return reverse ? REVERSE : REGION_COLORS[index % REGION_COLORS.length];
}

const CARDINALS: ReadonlyArray<readonly [Vec3, string]> = [
    [[1, 0, 0], 'NOSE'],
    [[-1, 0, 0], 'NAPE'],
    [[0, 1, 0], 'R EAR'],
    [[0, -1, 0], 'L EAR'],
    [[0, 0, 1], 'CROWN'],
    [[0, 0, -1], 'JAW'],
];

/** Raytracing every pixel costs real time on a seven-region helmet, so orbiting drops resolution. */
const RENDER_SIZE = { still: 420, dragging: 190 };

function hexToRgb(hex: string): [number, number, number] {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

interface CameraFrame {
    /** Unit vector from the head toward the camera. */
    ca: Vec3;
    right: Vec3;
    up: Vec3;
    scale: number;
    size: number;
    centre: Vec3;
}

function cameraFrame(azimuth: number, elevation: number, head: HeadCapsule, size: number): CameraFrame {
    const az = azimuth * RAD;
    const el = elevation * RAD;
    const ca: Vec3 = [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)];
    // Screen +x runs to the reader's right, so the wearer's own right sits on our left — the same
    // way round as meeting someone.
    const right = norm([ca[1], -ca[0], 0]);
    const up: Vec3 = [
        right[1] * ca[2] - right[2] * ca[1],
        right[2] * ca[0] - right[0] * ca[2],
        right[0] * ca[1] - right[1] * ca[0],
    ];
    return { ca, right, up, scale: size / 2 / (headExtent(head) * 1.18), size, centre: head.centre };
}

interface Projected {
    x: number;
    y: number;
    depth: number;
}

function project(frame: CameraFrame, p: Vec3): Projected {
    const o = sub(p, frame.centre);
    return {
        x: frame.size / 2 + dot(o, frame.right) * frame.scale,
        y: frame.size / 2 - dot(o, frame.up) * frame.scale,
        depth: dot(o, frame.ca),
    };
}

/** The z-buffer the raytrace leaves behind, so a wireframe cannot draw through the skull. */
interface DepthBuffer {
    data: Float32Array;
    size: number;
}

function frontmost(buffer: DepthBuffer, x: number, y: number, depth: number): boolean {
    const xi = x | 0;
    const yi = y | 0;
    if (xi < 0 || yi < 0 || xi >= buffer.size || yi >= buffer.size) return true;
    return depth >= buffer.data[yi * buffer.size + xi] - 0.02;
}

/** A polyline drawn twice: solid where it is in front of the head, ghosted where behind. */
function depthPolyline(
    ctx: CanvasRenderingContext2D,
    buffer: DepthBuffer,
    points: Projected[],
    colour: string,
    width: number,
    dash: number[] | null,
): void {
    for (const pass of [0, 1]) {
        ctx.save();
        ctx.strokeStyle = colour;
        ctx.lineWidth = width;
        ctx.globalAlpha *= pass === 0 ? 0.22 : 1;
        if (dash) ctx.setLineDash(dash);
        ctx.beginPath();
        let drawing = false;
        for (const q of points) {
            const front = frontmost(buffer, q.x, q.y, q.depth);
            if (pass === 1 ? front : !front) {
                if (drawing) ctx.lineTo(q.x, q.y);
                else {
                    ctx.moveTo(q.x, q.y);
                    drawing = true;
                }
            } else {
                drawing = false;
            }
        }
        ctx.stroke();
        ctx.restore();
    }
}

/** Where a ray from the apex meets the head, or a stub past it if it misses entirely. */
function rayToHead(head: HeadCapsule, origin: Vec3, direction: Vec3): Vec3 {
    const cast = headRay(head, origin, direction);
    const t = cast ? cast.t : headExtent(head) * 1.35;
    return [origin[0] + direction[0] * t, origin[1] + direction[1] * t, origin[2] + direction[2] * t];
}

/** A frustum, reduced to what the wireframe needs. The aperture borrows the same shape. */
type Frustum = Pick<PreparedRegion, 'F' | 'R' | 'U' | 'origin' | 'width' | 'height'>;

/** A direction `a`/`b` degrees off the frustum's axis, in its own frame. */
function frustumDir(frustum: Frustum, a: number, b: number): Vec3 {
    const ta = Math.tan(Math.max(-89.4, Math.min(89.4, a)) * RAD);
    const tb = Math.tan(Math.max(-89.4, Math.min(89.4, b)) * RAD);
    return norm([
        frustum.F[0] + ta * frustum.R[0] + tb * frustum.U[0],
        frustum.F[1] + ta * frustum.R[1] + tb * frustum.U[1],
        frustum.F[2] + ta * frustum.R[2] + tb * frustum.U[2],
    ]);
}

/** The rectangle's perimeter, walked in angle space and dropped onto the head. */
function rimPoints(head: HeadCapsule, frame: CameraFrame, frustum: Frustum, steps: number): Projected[] {
    const out: Projected[] = [];
    const w = frustum.width;
    const h = frustum.height;
    const push = (a: number, b: number) =>
        out.push(project(frame, rayToHead(head, frustum.origin, frustumDir(frustum, a, b))));
    for (let i = 0; i <= steps; i++) push(-w + (2 * w * i) / steps, h);
    for (let i = 0; i <= steps; i++) push(w, h - (2 * h * i) / steps);
    for (let i = 0; i <= steps; i++) push(w - (2 * w * i) / steps, -h);
    for (let i = 0; i <= steps; i++) push(-w, -h + (2 * h * i) / steps);
    out.push(out[0]);
    return out;
}

function drawRegionWire(
    ctx: CanvasRenderingContext2D,
    buffer: DepthBuffer,
    head: HeadCapsule,
    frame: CameraFrame,
    region: PreparedRegion,
    emphasised: boolean,
): void {
    const colour = regionColor(region.index, region.reverse);
    ctx.save();
    ctx.globalAlpha = emphasised ? 1 : 0.28;

    depthPolyline(
        ctx,
        buffer,
        rimPoints(head, frame, region, 22),
        colour,
        emphasised ? 2 : 1,
        region.reverse ? [5, 4] : null,
    );

    // The four edges from the apex, which is what makes it read as a pyramid rather than a patch.
    const apex = project(frame, region.origin);
    for (const [a, b] of [
        [-region.width, -region.height],
        [region.width, -region.height],
        [region.width, region.height],
        [-region.width, region.height],
    ]) {
        const tip = project(frame, rayToHead(head, region.origin, frustumDir(region, a, b)));
        const line: Projected[] = [];
        for (let i = 0; i <= 14; i++) {
            const t = i / 14;
            line.push({
                x: apex.x + (tip.x - apex.x) * t,
                y: apex.y + (tip.y - apex.y) * t,
                depth: apex.depth + (tip.depth - apex.depth) * t,
            });
        }
        depthPolyline(ctx, buffer, line, colour, 1, [4, 3]);
    }

    ctx.globalAlpha *= frontmost(buffer, apex.x, apex.y, apex.depth) ? 1 : 0.3;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(apex.x, apex.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawCardinals(
    ctx: CanvasRenderingContext2D,
    head: HeadCapsule,
    frame: CameraFrame,
): void {
    ctx.save();
    ctx.font = "500 10px 'IBM Plex Mono', monospace";
    ctx.fillStyle = '#C6D3DC';
    ctx.strokeStyle = BACKGROUND;
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.85;
    for (const [direction, label] of CARDINALS) {
        if (dot(direction, frame.ca) < 0.12) continue;
        const on = headSurface(head, direction);
        const at = project(frame, [
            on[0] + direction[0] * 2.4,
            on[1] + direction[1] * 2.4,
            on[2] + direction[2] * 2.4,
        ]);
        ctx.strokeText(label, at.x, at.y);
        ctx.fillText(label, at.x, at.y);
    }
    ctx.restore();
}

/** Everything worn, in one list, so a region keeps its colour whichever piece authored it. */
function wornRegions(gear: WornSet): PreparedRegion[] {
    return [...(gear.helmet?.regions ?? []), ...(gear.mask?.regions ?? [])];
}

/** The raytrace itself: one exact ray/capsule intersection per pixel, shaded by the hit test. */
function paintHead(
    ctx: CanvasRenderingContext2D,
    head: HeadCapsule,
    frame: CameraFrame,
    gear: WornSet,
    mode: HeadViewMode,
    marks: ClassMark[],
): DepthBuffer {
    const size = frame.size;
    const image = ctx.createImageData(size, size);
    const px = image.data;
    const buffer: DepthBuffer = { data: new Float32Array(size * size).fill(-Infinity), size };

    const exposedRgb = hexToRgb(EXPOSED);
    const bareRgb = hexToRgb(BARE);
    const reverseRgb = hexToRgb(REVERSE);
    const palette = REGION_COLORS.map(hexToRgb);

    // One tone per worn piece, by its class. A helmet and the shield filling its holes routinely
    // rate two steps apart, and that difference is the whole reason to look at a pairing.
    const tone = {
        helmet: hexToRgb(armorClassColor(gear.helmet?.armorClass)),
        mask: hexToRgb(armorClassColor(gear.mask?.armorClass)),
    };
    // Running centroid of each piece's visible area, so its class can be written where it applies
    // rather than only in the key.
    const centroid = {
        helmet: { x: 0, y: 0, n: 0 },
        mask: { x: 0, y: 0, n: 0 },
    };

    const light = norm([
        frame.ca[0] + 0.42 * frame.up[0] - 0.34 * frame.right[0],
        frame.ca[1] + 0.42 * frame.up[1] - 0.34 * frame.right[1],
        frame.ca[2] + 0.42 * frame.up[2] - 0.34 * frame.right[2],
    ]);

    // Orthographic rays cast from a plane well clear of the capsule. A real intersection per pixel:
    // the sphere shortcut (silhouette = a circle, depth = sqrt(R² − d²)) a capsule does not permit,
    // and the shading reads its normal straight off the hit.
    const back = headExtent(head) * 2.5;
    const dir: Vec3 = [-frame.ca[0], -frame.ca[1], -frame.ca[2]];

    for (let y = 0; y < size; y++) {
        const v = (size / 2 - y - 0.5) / frame.scale;
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            const u = (x + 0.5 - size / 2) / frame.scale;
            const from: Vec3 = [
                head.centre[0] + u * frame.right[0] + v * frame.up[0] + back * frame.ca[0],
                head.centre[1] + u * frame.right[1] + v * frame.up[1] + back * frame.ca[1],
                head.centre[2] + u * frame.right[2] + v * frame.up[2] + back * frame.ca[2],
            ];
            const hit = headRay(head, from, dir);
            if (!hit) {
                // Left transparent so the canvas's own `.plot-grid` shows through, the same
                // backdrop the body viewer sits on. `createImageData` starts every pixel at
                // zeroed RGBA, so a skipped pixel is already the transparent we want.
                continue;
            }

            buffer.data[y * size + x] = back - hit.t;
            const sample = protectionAt(hit.point, gear);

            let col: [number, number, number];
            if (mode === 'coverage') {
                if (sample.protected && sample.by) {
                    col = tone[sample.by];
                    const at = centroid[sample.by];
                    at.x += x;
                    at.y += y;
                    at.n += 1;
                } else {
                    col = exposedRgb;
                }
            }
            else if (sample.reverse) col = reverseRgb;
            else if (sample.hit >= 0) col = palette[sample.hit % palette.length];
            else col = bareRgb;

            const lambert = Math.max(0, dot(hit.normal, light));
            const rim = Math.pow(1 - Math.max(0, dot(hit.normal, frame.ca)), 3) * 0.28;
            const shade = 0.34 + 0.62 * lambert + rim;
            px[i] = Math.min(255, col[0] * shade);
            px[i + 1] = Math.min(255, col[1] * shade);
            px[i + 2] = Math.min(255, col[2] * shade);
            px[i + 3] = 255;
        }
    }
    ctx.putImageData(image, 0, 0);

    // A label only where the piece owns enough of the silhouette to carry one, and only where its
    // own centre of area is actually on it — a helmet seen from the front is a horseshoe around the
    // visor, and its centroid lands in the middle of the visor.
    for (const owner of ['helmet', 'mask'] as const) {
        const piece = gear[owner];
        const at = centroid[owner];
        if (!piece || piece.armorClass === null || at.n < size * size * 0.012) continue;
        const cx = Math.round(at.x / at.n);
        const cy = Math.round(at.y / at.n);
        const hit = headRay(head, [
            head.centre[0] + ((cx + 0.5 - size / 2) / frame.scale) * frame.right[0]
                + ((size / 2 - cy - 0.5) / frame.scale) * frame.up[0] + back * frame.ca[0],
            head.centre[1] + ((cx + 0.5 - size / 2) / frame.scale) * frame.right[1]
                + ((size / 2 - cy - 0.5) / frame.scale) * frame.up[1] + back * frame.ca[1],
            head.centre[2] + ((cx + 0.5 - size / 2) / frame.scale) * frame.right[2]
                + ((size / 2 - cy - 0.5) / frame.scale) * frame.up[2] + back * frame.ca[2],
        ], dir);
        if (!hit) continue;
        const sample = protectionAt(hit.point, gear);
        if (!sample.protected || sample.by !== owner) continue;
        marks.push({
            x: cx,
            y: cy,
            text: `CLASS ${armorClassLabel(piece.armorClass)}`,
            colour: armorClassColor(piece.armorClass),
        });
    }

    return buffer;
}

/** A class figure to write on the head, once the raytrace knows where that class ended up. */
interface ClassMark {
    x: number;
    y: number;
    text: string;
    colour: string;
}

function drawClassMarks(ctx: CanvasRenderingContext2D, marks: ClassMark[]): void {
    if (!marks.length) return;
    ctx.save();
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = BACKGROUND;
    for (const mark of marks) {
        ctx.strokeText(mark.text, mark.x, mark.y);
        ctx.fillStyle = mark.colour;
        ctx.fillText(mark.text, mark.x, mark.y);
    }
    ctx.restore();
}

export default function HeadViewer({
    coverage,
    mode = 'coverage',
    azimuth,
    elevation,
    onOrbit,
    highlight = null,
    aperture = null,
    showWireframe = true,
    className,
    height = 340,
}: HeadViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [box, setBox] = useState(() => Math.min(340, height));
    const [dragging, setDragging] = useState(false);
    const drag = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const element = wrapRef.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            setBox(Math.max(180, Math.min(entry.contentRect.width, height)));
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = dragging ? RENDER_SIZE.dragging : RENDER_SIZE.still;
        if (canvas.width !== size) {
            canvas.width = size;
            canvas.height = size;
        }

        const head = coverage.head;
        const frame = cameraFrame(azimuth, elevation, head, size);
        const marks: ClassMark[] = [];
        const buffer = paintHead(ctx, head, frame, coverage.gear, mode, marks);

        if (showWireframe) {
            for (const region of wornRegions(coverage.gear)) {
                drawRegionWire(ctx, buffer, head, frame, region, highlight === null || highlight === region.index);
            }
        }

        if (aperture) {
            depthPolyline(
                ctx,
                buffer,
                rimPoints(head, frame, {
                    origin: [0, 0, 0],
                    F: [1, 0, 0],
                    R: [0, 1, 0],
                    U: [0, 0, 1],
                    width: aperture.width,
                    height: aperture.height,
                }, 26),
                '#7E909F',
                1.4,
                [9, 5],
            );
        }

        drawCardinals(ctx, head, frame);
        // Last, over the wireframe: the figure has to survive whatever is drawn on the head.
        if (mode === 'coverage') drawClassMarks(ctx, marks);
    }, [aperture, azimuth, coverage, dragging, elevation, highlight, mode, showWireframe]);

    return (
        <div ref={wrapRef} className={cn('relative select-none', className)}>
            <canvas
                ref={canvasRef}
                style={{ width: box, height: box }}
                role="img"
                aria-label={
                    mode === 'coverage'
                        ? `Head with protected and exposed areas, ${Math.round(coverage.total * 100)}% protected`
                        : 'Head with one colour per authored cone region'
                }
                className={cn(
                    'bg-steel-850 border border-line-800 plot-grid touch-none',
                    onOrbit && 'cursor-grab active:cursor-grabbing',
                )}
                onPointerDown={(e) => {
                    if (!onOrbit) return;
                    drag.current = { x: e.clientX, y: e.clientY };
                    setDragging(true);
                    e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerUp={() => {
                    drag.current = null;
                    setDragging(false);
                }}
                onPointerMove={(e) => {
                    if (!onOrbit || !drag.current) return;
                    const dx = e.clientX - drag.current.x;
                    const dy = e.clientY - drag.current.y;
                    drag.current = { x: e.clientX, y: e.clientY };
                    onOrbit({ azimuth: -dx * 0.55, elevation: dy * 0.45 });
                }}
                onPointerLeave={() => {
                    drag.current = null;
                    setDragging(false);
                }}
            />
            <p className="micro-label text-ink-700 mt-1.5">
                {onOrbit ? 'Drag to orbit · ' : ''}
                yaw {Math.round(((azimuth % 360) + 360) % 360)}° pitch {Math.round(elevation)}°
            </p>
        </div>
    );
}

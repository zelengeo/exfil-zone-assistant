'use client';

import React, {useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, useId} from 'react';
import {ChevronRight} from "lucide-react";
import {CurvePoint} from "@/types/items";
import {cn} from "@/lib/utils";
import InfoPopover, {InfoDot} from "@/components/ui/info-popover";
import {PopoverHeading, PopoverProse} from "@/components/ui/popover";

/**
 * A Cold Steel plot for the game's authored curve assets.
 *
 * The curves in the data are Unreal float curves — a handful of keyframes with arrive/leave
 * tangents — so the shape between keyframes is real information, not an interpolation the chart
 * invented. That drives two decisions here:
 *
 *   1. The keyframes are drawn as markers (the authored control points), but the readout
 *      evaluates the curve at the pointer's x rather than snapping to the nearest keyframe.
 *      The old chart only answered within 25px of a keyframe, which left most of the plot dead.
 *   2. The values are also listed in a table below the plot, so nothing is gated behind hover.
 */

/**
 * Series colours, by the role the curve plays. Cold Steel's chart slots: ember for damage
 * (the aggressive quantity), warn for penetration, info for a probability, good for a
 * favourable scalar. Call sites name a role rather than pasting a hex.
 */
const CURVE_COLOR = {
    damage: '#FF4A24',        // ember
    penetration: '#FFB020',   // warn
    chance: '#6E9DB8',        // info-light — the plain info step reads near-grey on the plot ground
    effectiveness: '#4ADE80', // good
} as const;

type CurveRole = keyof typeof CURVE_COLOR;
type CurveColor = (typeof CURVE_COLOR)[CurveRole];

/* Plot chrome. Hairline, solid, one step off the surface — the data is the only loud thing. */
const SURFACE = '#0C1116';   // steel-900 — plot ground, and the ring/gap colour
const GRID = '#1B242C';      // line-900
const AXIS = '#262F38';      // line-700
const CROSSHAIR = '#33414D'; // line-500
const TICK_INK = '#7E909F';  // ink-600

export interface BallisticCurve {
    name: string;
    data: CurvePoint[];
    role: CurveRole;
}

interface BallisticCurveChartProps {
    title: string;
    curves: BallisticCurve[];
    /**
     * What the curve means — how to read it, and what it does not cover.
     *
     * Disclosed from a dot on the title rather than parked in a paragraph under the plot, which is
     * where every call site used to put it. Three sentences at most; past that it is a guide
     * section. See the disclosure ladder in `components/ui/AGENTS.md`.
     */
    info?: React.ReactNode;
    xLabel?: string;
    xLabelModifier?: number;
    yLabel?: string;
    yLabelModifier?: number;
    height?: number;
    maxWidth?: number;
    className?: string;
}

interface Readout {
    /** Pixel position of the crosshair inside the plot area. */
    px: number;
    /** X in display units. */
    x: number;
    points: { name: string; color: CurveColor; value: number; py: number }[];
}

/* ---------------------------------------------------------------- curve maths */

/** A keyframe with its fields checked — no undefined tangents reaching the path builder. */
interface CurveKey {
    time: number;
    value: number;
    /** True when the segment leaving this key is a straight line. */
    linear: boolean;
    arrive: number;
    leave: number;
}

/**
 * Resolve a raw curve into keys that are safe to draw.
 *
 * The tangents and interp mode are the game's own — nothing here invents a shape. The guard is
 * only that: a key missing a tangent would put `undefined` into the `d` attribute, and SVG drops
 * an invalid path without a word rather than erroring, so a single bad key would silently blank
 * the whole curve. Such a key is drawn as a straight segment instead of taking the plot with it.
 */
function toKeys(points: CurvePoint[]): CurveKey[] {
    return points
        .filter(point => Number.isFinite(point.time) && Number.isFinite(point.value))
        .slice()
        .sort((a, b) => a.time - b.time)
        .map(point => {
            const hasTangents =
                Number.isFinite(point.arriveTangent) && Number.isFinite(point.leaveTangent);
            return {
                time: point.time,
                value: point.value,
                linear: point.interpMode === 'linear' || !hasTangents,
                arrive: hasTangents ? point.arriveTangent : 0,
                leave: hasTangents ? point.leaveTangent : 0,
            };
        });
}

/**
 * Value of the curve at `t`, in raw data units.
 *
 * Cubic segments are Hermite: the same basis the SVG bezier below is built from, so the
 * crosshair reads exactly the line that is drawn. Outside the keyframe range the curve is
 * clamped, which is what the game does too.
 */
function evalCurve(keys: CurveKey[], t: number): number | null {
    if (keys.length === 0) return null;
    if (keys.length === 1) return keys[0].value;
    if (t <= keys[0].time) return keys[0].value;
    if (t >= keys[keys.length - 1].time) return keys[keys.length - 1].value;

    for (let i = 0; i < keys.length - 1; i++) {
        const p0 = keys[i];
        const p1 = keys[i + 1];
        if (t > p1.time) continue;

        const dx = p1.time - p0.time;
        if (dx === 0) return p1.value;

        const u = (t - p0.time) / dx;
        if (p0.linear) return p0.value + (p1.value - p0.value) * u;

        const u2 = u * u;
        const u3 = u2 * u;
        return (
            (2 * u3 - 3 * u2 + 1) * p0.value +
            (u3 - 2 * u2 + u) * p0.leave * dx +
            (-2 * u3 + 3 * u2) * p1.value +
            (u3 - u2) * p1.arrive * dx
        );
    }
    return keys[keys.length - 1].value;
}

/* ------------------------------------------------------------------ axis ticks */

interface Axis {
    min: number;
    max: number;
    step: number;
    ticks: number[];
    decimals: number;
}

/**
 * Digits needed to print `step` exactly.
 *
 * Deriving this from log10 alone rounds a 0.25 step's ticks to "0.3" and "0.8", which reads as a
 * broken axis; the 2.5 rung of the nice-number ladder needs one digit more than its magnitude.
 */
function decimalsFor(step: number): number {
    for (let d = 0; d <= 6; d++) {
        const scaled = step * 10 ** d;
        if (Math.abs(scaled - Math.round(scaled)) < 1e-9) return d;
    }
    return 6;
}

/** Round `step` up to the nearest 1 / 2 / 2.5 / 5 × a power of ten. */
function niceStep(rough: number): number {
    if (!(rough > 0) || !Number.isFinite(rough)) return 1;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const norm = rough / magnitude;
    const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
    return nice * magnitude;
}

/**
 * Tick marks on round numbers, in display units.
 *
 * The old chart padded the domain by 10% and printed the result to two decimals, so a damage
 * curve that decays to zero showed a floor of "-4.20" and an axis of numbers nobody can read
 * across. Here the domain snaps outward to whole steps instead.
 */
function buildAxis(lo: number, hi: number, count: number, includeZero: boolean): Axis {
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
        return {min: 0, max: 1, step: 1, ticks: [0, 1], decimals: 0};
    }

    let min = lo;
    let max = hi;

    // Extend to zero only when it is cheap — a scalar that lives between 0.8 and 1.0 should not
    // be flattened into the top fifth of the plot just to show a baseline.
    if (includeZero && min > 0 && min <= max - min) min = 0;

    if (max === min) {
        const pad = Math.abs(max) * 0.1 || 0.5;
        min -= pad;
        max += pad;
    }

    const step = niceStep((max - min) / Math.max(1, count));
    // Snap with a tolerance. Several curves start at time -0.000079 — an export artifact — and a
    // bare floor() reads that as "negative" and opens a whole extra step of empty axis below zero.
    const epsilon = (max - min) * 1e-6;
    min = Math.floor((min + epsilon) / step) * step;
    max = Math.ceil((max - epsilon) / step) * step;

    const decimals = decimalsFor(step);
    const ticks: number[] = [];
    // Accumulate off the index rather than by repeated addition — 0.1 steps drift otherwise.
    const n = Math.round((max - min) / step);
    for (let i = 0; i <= n; i++) ticks.push(min + i * step);

    return {min, max, step, ticks, decimals};
}

const formatFixed = (value: number, decimals: number): string =>
    value.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

/** Readout precision: enough digits to be useful, never a wall of zeros. */
function formatValue(value: number): string {
    const abs = Math.abs(value);
    const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
    const text = formatFixed(value, decimals);
    // Trim only a fractional tail — "1,000" must survive intact.
    return text.includes('.') ? text.replace(/\.?0+$/, '') : text;
}

/* -------------------------------------------------------------------- component */

export default function BallisticCurveChart({
                                                title,
                                                curves,
                                                info,
                                                xLabel = 'Distance',
                                                xLabelModifier = 1,
                                                yLabel = 'Value',
                                                yLabelModifier = 1,
                                                height = 260,
                                                maxWidth = 1200,
                                                className,
                                            }: BallisticCurveChartProps) {
    const [readout, setReadout] = useState<Readout | null>(null);
    const [width, setWidth] = useState(560);
    const containerRef = useRef<HTMLDivElement>(null);
    const plotRef = useRef<SVGRectElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    const [tipSize, setTipSize] = useState({w: 150, h: 56});

    const handleResize = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setWidth(Math.max(280, Math.min(maxWidth, Math.round(rect.width))));
    }, [maxWidth]);

    useEffect(() => {
        handleResize();
        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [handleResize]);

    useLayoutEffect(() => {
        const box = tipRef.current?.getBoundingClientRect();
        if (!box) return;
        // Guard the compare — a set on every move would loop against the layout it just caused.
        if (Math.abs(box.width - tipSize.w) > 1 || Math.abs(box.height - tipSize.h) > 1) {
            setTipSize({w: box.width, h: box.height});
        }
    }, [readout, tipSize.w, tipSize.h]);

    /** Curves with their keyframes resolved once — drawing, the readout and the table share these. */
    const series = useMemo(
        () => curves.map(curve => ({
            name: curve.name,
            color: CURVE_COLOR[curve.role],
            keys: toKeys(curve.data),
        })),
        [curves],
    );

    const narrow = width < 420;
    const pad = useMemo(
        () => ({top: 12, right: narrow ? 12 : 16, bottom: 40, left: narrow ? 40 : 52}),
        [narrow],
    );
    const plotW = Math.max(1, width - pad.left - pad.right);
    const plotH = Math.max(1, height - pad.top - pad.bottom);

    /* Domain and scales, both in display units — the *LabelModifier props exist because the game
       stores distance in centimetres, and ticks have to be round in the unit the reader sees. */
    const {xAxis, yAxis} = useMemo(() => {
        let lox = Infinity, hix = -Infinity, loy = Infinity, hiy = -Infinity;
        for (const curve of series) {
            for (const point of curve.keys) {
                const x = point.time * xLabelModifier;
                const y = point.value * yLabelModifier;
                if (x < lox) lox = x;
                if (x > hix) hix = x;
                if (y < loy) loy = y;
                if (y > hiy) hiy = y;
            }
        }
        return {
            xAxis: buildAxis(lox, hix, narrow ? 3 : 6, false),
            yAxis: buildAxis(loy, hiy, 4, true),
        };
    }, [series, xLabelModifier, yLabelModifier, narrow]);

    const scaleX = useCallback(
        (time: number) => ((time * xLabelModifier - xAxis.min) / (xAxis.max - xAxis.min)) * plotW,
        [xAxis, xLabelModifier, plotW],
    );
    const scaleY = useCallback(
        (value: number) => plotH - ((value * yLabelModifier - yAxis.min) / (yAxis.max - yAxis.min)) * plotH,
        [yAxis, yLabelModifier, plotH],
    );

    /** Raw-unit x for a pixel offset inside the plot — the inverse of scaleX. */
    const invertX = useCallback(
        (px: number) => (xAxis.min + (px / plotW) * (xAxis.max - xAxis.min)) / xLabelModifier,
        [xAxis, plotW, xLabelModifier],
    );

    const hasData = series.some(curve => curve.keys.length > 0);
    const singleSeries = series.length === 1;
    /* Keyframes are meaningful, but past a couple of dozen the markers become the chart. */
    const showKeyframes = hasData && Math.max(...series.map(curve => curve.keys.length)) <= 24;

    const readAt = useCallback((px: number): Readout | null => {
        const clamped = Math.max(0, Math.min(plotW, px));
        const time = invertX(clamped);
        const points = series
            .map(curve => {
                const raw = evalCurve(curve.keys, time);
                if (raw === null) return null;
                return {
                    name: curve.name,
                    color: curve.color,
                    value: raw * yLabelModifier,
                    py: scaleY(raw),
                };
            })
            .filter((point): point is Readout['points'][number] => point !== null);

        if (points.length === 0) return null;
        return {px: clamped, x: time * xLabelModifier, points};
    }, [series, invertX, plotW, scaleY, xLabelModifier, yLabelModifier]);

    const handlePointer = (event: React.PointerEvent<SVGSVGElement>) => {
        if (!plotRef.current) return;
        const rect = plotRef.current.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;
        // A little slack above and below so the pointer does not have to stay inside the frame.
        if (px < -8 || px > plotW + 8 || py < -16 || py > plotH + 16) {
            setReadout(null);
            return;
        }
        setReadout(readAt(px));
    };

    /* Keyboard parity with hover: the crosshair walks the domain in twentieths. */
    const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
        const stride = plotW / 20;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            const from = readout?.px ?? (event.key === 'ArrowRight' ? -stride : plotW + stride);
            setReadout(readAt(from + (event.key === 'ArrowRight' ? stride : -stride)));
        } else if (event.key === 'Home') {
            event.preventDefault();
            setReadout(readAt(0));
        } else if (event.key === 'End') {
            event.preventDefault();
            setReadout(readAt(plotW));
        } else if (event.key === 'Escape') {
            setReadout(null);
        }
    };

    const buildPath = (keys: CurveKey[], close: boolean): string => {
        if (keys.length === 0) return '';
        let path = `M ${scaleX(keys[0].time)} ${scaleY(keys[0].value)}`;

        for (let i = 0; i < keys.length - 1; i++) {
            const p0 = keys[i];
            const p1 = keys[i + 1];
            // Hermite tangents as bezier control points: one third of the span each side.
            const dx = (p1.time - p0.time) / 3;
            const c1y = scaleY(p0.value + p0.leave * dx);
            const c2y = scaleY(p1.value - p1.arrive * dx);

            if (p0.linear || !Number.isFinite(c1y) || !Number.isFinite(c2y)) {
                path += ` L ${scaleX(p1.time)} ${scaleY(p1.value)}`;
            } else {
                path += ` C ${scaleX(p0.time + dx)} ${c1y}, ${scaleX(p1.time - dx)} ${c2y},` +
                    ` ${scaleX(p1.time)} ${scaleY(p1.value)}`;
            }
        }

        if (close) {
            const last = keys[keys.length - 1];
            path += ` L ${scaleX(last.time)} ${plotH} L ${scaleX(keys[0].time)} ${plotH} Z`;
        }
        return path;
    };

    /* Keyframe times across every series, for the table below the plot. */
    const tableRows = useMemo(() => {
        const times = new Set<number>();
        for (const curve of series) for (const point of curve.keys) times.add(point.time);
        return [...times].sort((a, b) => a - b).map(time => ({
            time: time * xLabelModifier,
            values: series.map(curve => {
                const raw = evalCurve(curve.keys, time);
                return raw === null ? null : raw * yLabelModifier;
            }),
        }));
    }, [series, xLabelModifier, yLabelModifier]);

    // useId, not a random string: this renders on the server too, and the ids have to match.
    // Colons out: useId's output is fine in an SVG fragment reference but not in a CSS selector.
    const gradientId = `curve-wash-${useId().replace(/:/g, '')}`;


    if (!hasData) {
        return (
            <section className={cn('bg-steel-850 border border-line-800 p-4', className)}>
                <h4 className="eyebrow mb-3">{title}</h4>
                <p className="text-xs text-ink-600">No curve data for this item.</p>
            </section>
        );
    }

    /* Tooltip placement, from the tooltip's measured box. Guessing at the size is what made the
       long axis labels wrap into three lines against the right edge: the flip threshold was a
       constant that had nothing to do with how wide the readout actually is. */
    const tipRight = readout !== null && readout.px + 12 + tipSize.w > plotW;
    const tipLeft = readout === null ? 0 : Math.max(
        0,
        Math.min(width - tipSize.w, pad.left + readout.px + (tipRight ? -12 - tipSize.w : 12)),
    );
    const tipTop = readout === null ? 0 : Math.max(
        pad.top,
        Math.min(pad.top + plotH - tipSize.h, pad.top + readout.points[0].py - tipSize.h / 2),
    );

    return (
        <section className={cn('bg-steel-850 border border-line-800 p-4', className)}>
            <div className="flex items-baseline justify-between gap-4 mb-3">
                {/* A chart title has room for a dot, unlike the numeric column headers in
                    `ZoneTable` — so this takes the icon trigger and its full 44px target. */}
                {/* The dot trails the title inline rather than sitting in a flex row beside it:
                    "Penetration Chance Curve" wraps to two lines at phone width, and a flex row
                    would have to truncate it to keep the dot on the first. */}
                <h4 className="eyebrow">
                    {title}
                    {info && (
                        <InfoPopover
                            triggerStyle="icon"
                            trigger={<InfoDot/>}
                            label={`How to read ${title}`}
                            side="bottom"
                            align="start"
                            className="ml-1.5"
                        >
                            <PopoverHeading>{title}</PopoverHeading>
                            <PopoverProse>{info}</PopoverProse>
                        </InfoPopover>
                    )}
                </h4>
                <span className="micro-label text-right shrink-0">{yLabel}</span>
            </div>

            <div ref={containerRef} className="w-full overflow-x-auto">
                <div className="relative" style={{width, height}}>
                    <svg
                        width={width}
                        height={height}
                        role="img"
                        tabIndex={0}
                        aria-label={`${title}. ${yLabel} against ${xLabel}. Use the arrow keys to read values along the curve.`}
                        className="block bg-steel-900 cursor-crosshair"
                        onPointerMove={handlePointer}
                        onPointerDown={handlePointer}
                        onPointerLeave={() => setReadout(null)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => setReadout(null)}
                    >
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={series[0].color} stopOpacity="0.13"/>
                                <stop offset="100%" stopColor={series[0].color} stopOpacity="0"/>
                            </linearGradient>
                        </defs>

                        <g transform={`translate(${pad.left}, ${pad.top})`}>
                            {/* Grid — solid hairlines, one step off the surface. */}
                            {yAxis.ticks.map(tick => {
                                const y = ((yAxis.max - tick) / (yAxis.max - yAxis.min)) * plotH;
                                return (
                                    <g key={`y${tick}`}>
                                        <line x1={0} y1={y} x2={plotW} y2={y} stroke={GRID} strokeWidth={1}/>
                                        <text
                                            x={-8} y={y + 3} textAnchor="end"
                                            className="font-mono tabular" fontSize={10} fill={TICK_INK}
                                        >
                                            {formatFixed(tick, yAxis.decimals)}
                                        </text>
                                    </g>
                                );
                            })}
                            {xAxis.ticks.map(tick => {
                                const x = ((tick - xAxis.min) / (xAxis.max - xAxis.min)) * plotW;
                                return (
                                    <g key={`x${tick}`}>
                                        <line x1={x} y1={0} x2={x} y2={plotH} stroke={GRID} strokeWidth={1}/>
                                        <text
                                            x={x} y={plotH + 15} textAnchor="middle"
                                            className="font-mono tabular" fontSize={10} fill={TICK_INK}
                                        >
                                            {formatFixed(tick, xAxis.decimals)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Baseline and left rule, a shade above the grid. */}
                            <line x1={0} y1={plotH} x2={plotW} y2={plotH} stroke={AXIS} strokeWidth={1}/>
                            <line x1={0} y1={0} x2={0} y2={plotH} stroke={AXIS} strokeWidth={1}/>

                            {/* A wash under a lone curve; two washes would only muddy each other. */}
                            {singleSeries && (
                                <path d={buildPath(series[0].keys, true)} fill={`url(#${gradientId})`} stroke="none"/>
                            )}

                            {series.map(curve => (
                                <path
                                    key={curve.name}
                                    d={buildPath(curve.keys, false)}
                                    fill="none"
                                    stroke={curve.color}
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ))}

                            {/* Authored keyframes. The ring is the surface colour, not a border. */}
                            {showKeyframes && series.map(curve => (
                                <g key={`k-${curve.name}`}>
                                    {curve.keys.map((point, i) => (
                                        <circle
                                            key={i}
                                            cx={scaleX(point.time)} cy={scaleY(point.value)} r={2.5}
                                            fill={curve.color} stroke={SURFACE} strokeWidth={2}
                                        />
                                    ))}
                                </g>
                            ))}

                            {readout && (
                                <g pointerEvents="none">
                                    <line
                                        x1={readout.px} y1={0} x2={readout.px} y2={plotH}
                                        stroke={CROSSHAIR} strokeWidth={1}
                                    />
                                    {readout.points.map(point => (
                                        <circle
                                            key={point.name}
                                            cx={readout.px} cy={point.py} r={4}
                                            fill={point.color} stroke={SURFACE} strokeWidth={2}
                                        />
                                    ))}
                                </g>
                            )}

                            <text
                                x={plotW / 2} y={plotH + 32} textAnchor="middle"
                                fontSize={9} letterSpacing="0.18em" fill={TICK_INK}
                                className="font-mono uppercase"
                            >
                                {xLabel}
                            </text>
                        </g>

                        {/* Legend, only where identity is actually in question. */}
                        {!singleSeries && (
                            <g transform={`translate(${pad.left + 8}, ${pad.top + 10})`}>
                                {series.map((curve, i) => (
                                    <g key={curve.name} transform={`translate(0, ${i * 14})`}>
                                        <line
                                            x1={0} y1={0} x2={14} y2={0}
                                            stroke={curve.color} strokeWidth={2} strokeLinecap="round"
                                        />
                                        <text x={20} y={3} fontSize={10} fill="#A9BAC6" className="font-sans">
                                            {curve.name}
                                        </text>
                                    </g>
                                ))}
                            </g>
                        )}

                        {/* Hit surface — the whole plot answers, not just the keyframes. */}
                        <rect
                            ref={plotRef}
                            x={pad.left} y={pad.top} width={plotW} height={plotH}
                            fill="transparent"
                        />
                    </svg>

                    {readout && (
                        <div
                            ref={tipRef}
                            className="absolute pointer-events-none z-20 bg-steel-750 border border-line-600 px-3 py-2 whitespace-nowrap"
                            style={{left: tipLeft, top: tipTop}}
                        >
                            <div className="flex items-baseline gap-6 mb-1.5">
                                <span className="micro-label">{xLabel}</span>
                                <span className="ml-auto font-mono tabular text-xs text-ink-400">
                                    {formatValue(readout.x)}
                                </span>
                            </div>
                            {readout.points.map(point => (
                                <div key={point.name} className="flex items-baseline gap-6 leading-tight">
                                    <span
                                        className="w-3 h-0.5 shrink-0 self-center"
                                        style={{backgroundColor: point.color}}
                                        aria-hidden="true"
                                    />
                                    <span className="micro-label">
                                        {singleSeries ? yLabel : point.name}
                                    </span>
                                    <span className="ml-auto font-mono tabular text-sm text-ink-100">
                                        {formatValue(point.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Every value the crosshair shows is also here, so hovering is never the only way in. */}
            <details className="mt-3 group">
                <summary className="micro-label flex items-center gap-1.5 cursor-pointer select-none text-ink-700 hover:text-ink-500 list-none [&::-webkit-details-marker]:hidden">
                    <ChevronRight
                        size={11}
                        className="transition-transform group-open:rotate-90 motion-reduce:transition-none"
                        aria-hidden="true"
                    />
                    {tableRows.length} keyframes
                </summary>
                <div className="mt-2 max-h-48 overflow-y-auto border border-line-800">
                    <table className="w-full text-xs">
                        <thead className="bg-steel-800 sticky top-0">
                        <tr>
                            <th className="text-left font-normal text-ink-600 px-2 py-1">{xLabel}</th>
                            {series.map(curve => (
                                <th key={curve.name} className="text-right font-normal text-ink-600 px-2 py-1">
                                    {singleSeries ? yLabel : curve.name}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {tableRows.map(row => (
                            <tr key={row.time} className="border-t border-line-900">
                                <td className="px-2 py-1 font-mono tabular text-ink-500">{formatValue(row.time)}</td>
                                {row.values.map((value, i) => (
                                    <td key={i} className="px-2 py-1 font-mono tabular text-right text-ink-200">
                                        {value === null ? '—' : formatValue(value)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </section>
    );
}

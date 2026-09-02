'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { RAD, headSurface, protectionAt } from '@/lib/protection/headModel';
import { armorClassColor } from '@/lib/protection/armorClassScale';
import type { HeadCoverage } from '@/lib/protection/headCoverage';
import { HEAD_COLORS, REGION_COLORS, type HeadViewMode } from './HeadViewer';

/**
 * The whole head unrolled — every direction at once, so nothing hides round the back.
 *
 * The orbiting view answers "what does this look like"; this answers "is there anything I have not
 * turned it far enough to see". Equirectangular in the same (yaw, pitch) the zone boundaries are
 * defined in, which is why the zone grid can be drawn straight onto it.
 */

const EXPOSED = HEAD_COLORS.exposed;
const REVERSE = HEAD_COLORS.reverse;
const BARE = HEAD_COLORS.bare;
const BACKGROUND = '#0E141A';

const PAD = { l: 26, r: 4, t: 4, b: 16 };
const PLOT = { w: 360, h: 150 };

function hexToRgb(hex: string): [number, number, number] {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export interface HeadCoverageMapProps {
    coverage: HeadCoverage;
    mode?: HeadViewMode;
    showZones?: boolean;
    className?: string;
}

export default function HeadCoverageMap({
    coverage,
    mode = 'coverage',
    showZones = true,
    className,
}: HeadCoverageMapProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const W = PLOT.w + PAD.l + PAD.r;
        const H = PLOT.h + PAD.t + PAD.b;
        canvas.width = W;
        canvas.height = H;
        ctx.fillStyle = BACKGROUND;
        ctx.fillRect(0, 0, W, H);

        const image = ctx.createImageData(PLOT.w, PLOT.h);
        const px = image.data;
        const exposedRgb = hexToRgb(EXPOSED);
        const bareRgb = hexToRgb(BARE);
        const reverseRgb = hexToRgb(REVERSE);
        const palette = REGION_COLORS.map(hexToRgb);

        // The same class tones the orbiting view uses. Two pictures of one thing must not disagree
        // about what colour it is.
        const tone = {
            helmet: hexToRgb(armorClassColor(coverage.gear.helmet?.armorClass)),
            mask: hexToRgb(armorClassColor(coverage.gear.mask?.armorClass)),
        };

        for (let j = 0; j < PLOT.h; j++) {
            const pitch = 90 - (180 * (j + 0.5)) / PLOT.h;
            const cp = Math.cos(pitch * RAD);
            const sp = Math.sin(pitch * RAD);
            for (let i = 0; i < PLOT.w; i++) {
                const yaw = -180 + (360 * (i + 0.5)) / PLOT.w;
                const point = headSurface(coverage.head, [
                    cp * Math.cos(yaw * RAD),
                    cp * Math.sin(yaw * RAD),
                    sp,
                ]);
                const sample = protectionAt(point, coverage.gear);

                let col: [number, number, number];
                if (mode === 'coverage') col = sample.protected && sample.by ? tone[sample.by] : exposedRgb;
                else if (sample.reverse) col = reverseRgb;
                else if (sample.hit >= 0) col = palette[sample.hit % palette.length];
                else col = bareRgb;

                // Fade toward the poles, where an equirectangular cell covers almost no head.
                const k = 0.72 + 0.28 * cp;
                const o = (j * PLOT.w + i) * 4;
                px[o] = col[0] * k;
                px[o + 1] = col[1] * k;
                px[o + 2] = col[2] * k;
                px[o + 3] = 255;
            }
        }
        ctx.putImageData(image, PAD.l, PAD.t);

        const X = (yaw: number) => PAD.l + ((yaw + 180) / 360) * PLOT.w;
        const Y = (pitch: number) => PAD.t + ((90 - pitch) / 180) * PLOT.h;

        if (showZones) {
            ctx.save();
            ctx.strokeStyle = BACKGROUND;
            ctx.globalAlpha = 0.55;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            for (const yaw of [-130, -55, -40, 40, 55, 130]) {
                ctx.beginPath();
                ctx.moveTo(X(yaw), PAD.t);
                ctx.lineTo(X(yaw), PAD.t + PLOT.h);
                ctx.stroke();
            }
            for (const pitch of [-25, 25, 45]) {
                ctx.beginPath();
                ctx.moveTo(PAD.l, Y(pitch));
                ctx.lineTo(PAD.l + PLOT.w, Y(pitch));
                ctx.stroke();
            }
            ctx.setLineDash([]);
            ctx.font = "500 8px 'IBM Plex Mono', monospace";
            ctx.fillStyle = BACKGROUND;
            ctx.globalAlpha = 0.85;
            ctx.textAlign = 'center';
            const labels: Array<[string, number, number]> = [
                ['CROWN', 0, 68], ['BROW', 0, 35], ['FACE', 0, 0], ['JAW', 0, -50],
                ['SIDE', 90, 0], ['SIDE', -90, 0], ['NAPE', 160, -10], ['NAPE', -160, -10],
            ];
            for (const [text, yaw, pitch] of labels) ctx.fillText(text, X(yaw), Y(pitch));
            ctx.restore();
        }

        ctx.save();
        ctx.strokeStyle = '#212A32'; // line-800
        ctx.strokeRect(PAD.l + 0.5, PAD.t + 0.5, PLOT.w - 1, PLOT.h - 1);
        ctx.font = "500 8px 'IBM Plex Mono', monospace";
        ctx.fillStyle = '#5C6E7C'; // ink-700
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (const [yaw, text] of [[-180, 'BACK'], [-90, 'L'], [0, 'FRONT'], [90, 'R'], [180, 'BACK']] as const) {
            ctx.fillText(text, X(yaw), PAD.t + PLOT.h + 4);
        }
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (const pitch of [90, 45, 0, -45, -90]) ctx.fillText(`${pitch}°`, PAD.l - 4, Y(pitch));
        ctx.restore();
    }, [coverage, mode, showZones]);

    return (
        <canvas
            ref={canvasRef}
            role="img"
            aria-label="The whole head unrolled: yaw left to right, pitch top to bottom"
            className={cn('w-full h-auto border border-line-800 bg-steel-850', className)}
        />
    );
}

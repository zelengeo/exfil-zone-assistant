'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BAND_TIERS, type Band } from '@/lib/gunsmith/bands';

export interface StatReadoutProps {
    label: string;
    value: number | null;
    /** Digits after the point. Recoil and ergonomics are whole numbers; MOA is not. */
    precision?: number;
    unit?: string;
    /**
     * Change against the build this one started from. Sign is a *quantity* delta, so the component
     * is told separately whether up is good.
     */
    delta?: number | null;
    higherIsBetter?: boolean;
    band?: Band | null;
    /** Shown in place of a band, for a stat that describes rather than grades. */
    note?: string;
    className?: string;
}

const formatDelta = (delta: number, precision: number): string =>
    `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(precision)}`;

/**
 * One number from the gunsmith screen, with its quality band.
 *
 * The band and the delta answer different questions on purpose: the delta is "what did the part I
 * just fitted do", the band is "is this gun any good". A stat with no band (RPM) says so rather
 * than showing an empty bar.
 */
export default function StatReadout({
    label,
    value,
    precision = 0,
    unit,
    delta = null,
    higherIsBetter = true,
    band = null,
    note,
    className,
}: StatReadoutProps) {
    const hasDelta = typeof delta === 'number' && Math.abs(delta) >= 10 ** -precision / 2;
    const deltaIsGood = hasDelta && (higherIsBetter ? delta > 0 : delta < 0);

    return (
        <div className={cn('bg-steel-800 border border-line-800 p-3', className)}>
            <div className="eyebrow mb-2">{label}</div>

            <div className="flex items-baseline gap-2">
                <span className="font-mono tabular text-2xl leading-none text-ink-hi">
                    {value === null ? '—' : value.toFixed(precision)}
                </span>
                {unit && <span className="font-mono text-[10px] text-ink-600 uppercase">{unit}</span>}
                {hasDelta && (
                    <span
                        className={cn(
                            'font-mono tabular text-xs ml-auto',
                            deltaIsGood ? 'text-good' : 'text-ember',
                        )}
                    >
                        {formatDelta(delta as number, precision)}
                    </span>
                )}
            </div>

            {band ? (
                <div className="mt-2.5">
                    <div className="flex gap-0.5" aria-hidden="true">
                        {BAND_TIERS.map((tier, i) => (
                            <div
                                key={tier}
                                className="h-1 flex-1"
                                style={{ backgroundColor: i <= band.index ? band.color : '#28323B' }}
                            />
                        ))}
                    </div>
                    <div className="micro-label mt-1.5" style={{ color: band.color }}>
                        {band.label}
                    </div>
                </div>
            ) : (
                <div className="mt-2.5">
                    <div className="h-1 bg-track" aria-hidden="true" />
                    <div className="micro-label mt-1.5 text-ink-700">{note ?? 'Not ranked'}</div>
                </div>
            )}
        </div>
    );
}

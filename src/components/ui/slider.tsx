'use client';

import React, { useCallback, useId, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * A slider whose fill reaches both ends.
 *
 * `input[type=range]` cannot: the UA insets the track by half a thumb on each side so the thumb
 * never overhangs, which leaves dead space at 0 and at max and makes the fill disagree with the
 * value. On a 16px thumb in a 260px panel that is 6% of the travel a reader can see but not reach —
 * the "weird free space on the sides" the combat sim's range and durability controls both had.
 *
 * So this owns its own geometry: the track spans the full width, `value` maps linearly onto it, and
 * the thumb is translated rather than laid out, so it may hang over either end. Pointer capture
 * means a drag that leaves the element keeps tracking, which a native range does too and every
 * hand-rolled div slider forgets.
 *
 * Sized for a headset: the hit area is 44px tall regardless of how thin the painted track is.
 */

export interface SliderProps {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    /** Accessible name. Required — a bare slider announces nothing. */
    label: string;
    /** Spoken value, when the number alone is not the reading (e.g. "60 percent"). */
    valueText?: (value: number) => string;
    /** Marks painted on the track, in value space. Purely a legend; they are not snap points. */
    ticks?: number[];
    disabled?: boolean;
    className?: string;
}

/** Keeps a dragged value on the step grid and inside the range. */
function quantise(raw: number, min: number, max: number, step: number): number {
    const clamped = Math.min(max, Math.max(min, raw));
    const snapped = min + Math.round((clamped - min) / step) * step;
    // Steps rarely divide the range evenly; the last one must not overshoot.
    const bounded = Math.min(max, Math.max(min, snapped));
    // Float noise from the division shows up as 59.99999 in a label, so settle it on the step grid.
    const decimals = (String(step).split('.')[1] ?? '').length;
    return Number(bounded.toFixed(decimals));
}

export default function Slider({
    value, min = 0, max = 100, step = 1, onChange, label, valueText, ticks, disabled, className,
}: SliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const id = useId();

    const fraction = max === min ? 0 : (value - min) / (max - min);
    const percent = Math.min(100, Math.max(0, fraction * 100));

    const valueAt = useCallback((clientX: number): number => {
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0) return value;
        return quantise(min + ((clientX - rect.left) / rect.width) * (max - min), min, max, step);
    }, [max, min, step, value]);

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        // Capture on the track, not the thumb: a press anywhere on the row jumps the handle there
        // and then keeps dragging, which is the behaviour a finger on a 44px strip expects.
        event.currentTarget.setPointerCapture(event.pointerId);
        onChange(valueAt(event.clientX));
    };

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
        onChange(valueAt(event.clientX));
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const big = Math.max(step, (max - min) / 10);
        const next = {
            ArrowLeft: value - step,
            ArrowDown: value - step,
            ArrowRight: value + step,
            ArrowUp: value + step,
            PageDown: value - big,
            PageUp: value + big,
            Home: min,
            End: max,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        onChange(quantise(next, min, max, step));
    };

    return (
        <div
            id={id}
            ref={trackRef}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={valueText?.(value)}
            aria-disabled={disabled || undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onKeyDown={onKeyDown}
            className={cn(
                'relative h-11 w-full select-none touch-none flex items-center',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember',
                disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                className,
            )}
        >
            <div className="relative w-full h-2 bg-steel-700">
                <div
                    className="absolute inset-y-0 left-0 bg-ember/70"
                    style={{ width: `${percent}%` }}
                />
                {ticks?.map((tick) => (
                    <span
                        key={tick}
                        aria-hidden="true"
                        className="absolute top-full mt-0.5 w-px h-1.5 bg-line-600"
                        style={{ left: `${((tick - min) / (max - min)) * 100}%` }}
                    />
                ))}
                {/* Translated by its own half-width, so 0 and max put it flush with the ends. */}
                <span
                    aria-hidden="true"
                    className="absolute top-1/2 w-4 h-8 bg-ember border border-steel-900 pointer-events-none"
                    style={{ left: `${percent}%`, transform: 'translate(-50%, -50%)' }}
                />
            </div>
        </div>
    );
}

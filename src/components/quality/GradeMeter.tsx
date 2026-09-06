'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { GRADE_TIERS, GRADE_TRACK_COLOR, type Grade } from '@/lib/quality/grade';

/**
 * How good a figure is, drawn the same way everywhere.
 *
 * Lifted out of the gunsmith's `StatReadout`, which is where this shape was proved: four segments,
 * lit up to the grade, with the rung's name beneath in the rung's colour. It has to look identical
 * on a weapon stat, an ammunition page and a shots-to-kill legend, or the reader is learning three
 * things instead of one.
 *
 * **A meter never appears without its figure.** The palette is categorical — non-adjacent rungs do
 * not clear colourblind separation, the same limitation `armorClassScale` records — so the count of
 * lit segments is the identity channel and the hue only the fast one. Callers print the number; a
 * grade drawn on its own would be a colour pretending to be a reading.
 *
 * `grade` of `null` draws the empty track and a reason. A stat that describes rather than grades
 * (RPM: 600 is not worse than 900) says so, rather than showing a bar with nothing lit and letting
 * that read as "worst".
 */
export interface GradeMeterProps {
    grade: Grade | null;
    /** Shown in place of the rung name when there is no grade. */
    note?: string;
    className?: string;
}

export default function GradeMeter({ grade, note, className }: GradeMeterProps) {
    return (
        <div className={className}>
            {/* Unsegmented when there is no grade. Four unlit segments would read as "zero of
                four", which is the worst rung — the opposite of "this figure is not ranked". */}
            {grade ? (
                <div className="flex gap-0.5" aria-hidden="true">
                    {GRADE_TIERS.map((tier, i) => (
                        <div
                            key={tier}
                            className="h-1 flex-1"
                            style={{ backgroundColor: i <= grade.index ? grade.color : GRADE_TRACK_COLOR }}
                        />
                    ))}
                </div>
            ) : (
                <div className="h-1" style={{ backgroundColor: GRADE_TRACK_COLOR }} aria-hidden="true" />
            )}
            <div
                className={cn('micro-label mt-1.5', !grade && 'text-ink-700')}
                style={grade ? { color: grade.color } : undefined}
            >
                {grade ? grade.label : note ?? 'Not ranked'}
            </div>
        </div>
    );
}

/**
 * The same four segments at label size, for a row that has no room for a stacked meter.
 *
 * Used where a grade rides alongside a figure in a list rather than under it. Same count, same
 * hues, same rule: the caller prints the number.
 */
export function GradeMeterInline({ grade, className }: { grade: Grade | null; className?: string }) {
    return (
        <span className={cn('inline-flex gap-0.5 align-middle', className)} aria-hidden="true">
            {GRADE_TIERS.map((tier, i) => (
                <span
                    key={tier}
                    className="w-1.5 h-3"
                    style={{
                        backgroundColor: grade && i <= grade.index ? grade.color : GRADE_TRACK_COLOR,
                    }}
                />
            ))}
        </span>
    );
}

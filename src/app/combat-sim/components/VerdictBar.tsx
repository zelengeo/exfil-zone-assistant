'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Price } from '@/components/trade/Price';
import { formatSeconds, formatShots, shotsColor, type LoadoutOutcome } from '../utils/scenario';

/**
 * The one answer, above everything else on the page.
 *
 * It used to be a census of body parts, which listed the things that barely move between setups
 * and left a reader to work out which of them mattered. It is a ladder now, from what is possible
 * to what actually happens:
 *
 *   Best case  — the fewest rounds anywhere, which is a head reading on essentially every setup
 *   Aimed      — the fewest rounds off the head, and the figure in the big numeral
 *   Spraying   — the estimate: trigger held, centre mass, recoil partly pulled back out
 *
 * All three move with the setup, which is what the old row failed at. Best case moves with the
 * helmet and its shield, aimed moves with the vest, and spraying moves with recoil, spread and
 * fire rate — the three assembled figures that until now reached nothing in the simulator.
 */

export interface VerdictBarProps {
    outcome: LoadoutOutcome | null;
    /** Opens the head view, which is where the best case usually lives. */
    onShowHead?: () => void;
    /** Opens the Numbers view, where the spray estimate is written out. */
    onExplainSpray?: () => void;
    className?: string;
}

function Tier({
    label, shots, colour, children,
}: {
    label: string;
    shots: string;
    colour: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-[5.5rem_2rem_minmax(0,1fr)] items-center gap-3">
            <span className="micro-label text-ink-600">{label}</span>
            <span className="font-mono tabular text-lg text-ink-hi text-right leading-none">{shots}</span>
            <span className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: colour }} aria-hidden="true" />
                <span className="text-sm text-ink-300 truncate">{children}</span>
            </span>
        </div>
    );
}

export default function VerdictBar({ outcome, onShowHead, onExplainSpray, className }: VerdictBarProps) {
    if (!outcome) {
        return (
            <div className={cn('border border-line-800 bg-steel-800 p-4', className)}>
                <p className="text-sm text-ink-500">
                    Pick a build and a round it chambers, and the answer goes here.
                </p>
            </div>
        );
    }

    const { bestCase, aimed, spray } = outcome.verdict;
    const headSpread = outcome.head
        .map((entry) => `${entry.zone.short ?? 'head'} ${formatShots(entry.shotsToKill)}`)
        .join(', ');

    return (
        <div className={cn('border border-line-800 bg-steel-800', className)}>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-5 p-4">
                {/* The recommendation, at the size a reader can take in from across a room. */}
                <div className="flex items-baseline gap-3 lg:flex-col lg:gap-1 lg:items-start">
                    <span
                        className="font-mono tabular text-6xl leading-none"
                        style={{ color: aimed ? shotsColor(aimed.shotsToKill) : undefined }}
                    >
                        {aimed ? formatShots(aimed.shotsToKill) : '—'}
                    </span>
                    <div className="min-w-0">
                        <p className="text-base text-ink-100">
                            Aimed &mdash; {aimed ? aimed.zone.label.toLowerCase() : 'nothing lands'}
                        </p>
                        <p className="micro-label text-ink-600 flex items-center gap-2">
                            {aimed ? formatSeconds(aimed.ttk) : '—'}
                            <span aria-hidden="true">&middot;</span>
                            {aimed && Number.isFinite(aimed.costToKill)
                                ? <Price amount={Math.round(aimed.costToKill)} size="sm" tone="dim" />
                                : <span>&infin;</span>}
                        </p>
                    </div>
                </div>

                <div className="space-y-2 border-t lg:border-t-0 lg:border-l border-line-900 pt-3 lg:pt-0 lg:pl-5">
                    {bestCase && (
                        <Tier
                            label="Best case"
                            shots={formatShots(bestCase.shotsToKill)}
                            colour={shotsColor(bestCase.shotsToKill)}
                        >
                            {headSpread || bestCase.zone.label.toLowerCase()}
                            {onShowHead && (
                                <button
                                    type="button"
                                    onClick={onShowHead}
                                    className="ml-2 micro-label text-ember hover:underline min-h-11 lg:min-h-0"
                                >
                                    head &rarr;
                                </button>
                            )}
                        </Tier>
                    )}
                    {aimed && (
                        <Tier
                            label="Aimed"
                            shots={formatShots(aimed.shotsToKill)}
                            colour={shotsColor(aimed.shotsToKill)}
                        >
                            {aimed.zone.label.toLowerCase()}{' '}&mdash; the recommendation above
                        </Tier>
                    )}
                    {spray && (
                        <Tier
                            label="Spraying"
                            shots={spray.rounds === null ? '∞' : String(Math.round(spray.rounds))}
                            colour={shotsColor(spray.rounds ?? Infinity)}
                        >
                            centre mass, full auto
                        </Tier>
                    )}
                </div>
            </div>

            {/* Why the third tier exists at all: a casual reader does not aim per zone. */}
            {spray && (
                <div className="border-t border-line-900 px-4 py-3">
                    <p className="eyebrow mb-1">If you just hold the trigger</p>
                    <p className="text-sm text-ink-400 leading-relaxed">
                        {spray.rounds === null ? (
                            <>Holding the trigger on centre mass does not put this target down at all &mdash;{' '}
                                {Math.round(spray.hitRate * 100)}% of rounds land, and the plate takes what
                                arrives.</>
                        ) : (
                            <>Hosing centre mass on full auto averages{' '}
                                <span className="font-mono tabular text-ink-100">{Math.round(spray.rounds)}</span>{' '}
                                rounds &mdash; against{' '}
                                <span className="font-mono tabular text-ink-100">
                                    {aimed ? formatShots(aimed.shotsToKill) : '—'}
                                </span>{' '}
                                aimed. {Math.round(spray.hitRate * 100)}% of them land at all, and the crosshair has
                                climbed {Math.round(spray.climbCm)} cm by the end of the burst.</>
                        )}{' '}
                        <span className="text-ink-600">This one is an estimate: it models the player, not the game.</span>
                        {onExplainSpray && (
                            <button
                                type="button"
                                onClick={onExplainSpray}
                                className="ml-2 micro-label text-ember hover:underline"
                            >
                                how it is estimated &rarr;
                            </button>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}

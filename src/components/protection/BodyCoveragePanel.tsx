'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Armor } from '@/types/items';
import { bodyCoverage } from '@/lib/protection/coverage';
import { VIEW_PRESETS, type ViewName } from '@/lib/protection/project';
import { armorClassColor, armorClassLabel } from '@/lib/protection/armorClassScale';
import { useBodyModel } from '@/hooks/useBodyModel';
import BodyViewer from './BodyViewer';
import ZoneTable from './ZoneTable';

/**
 * The viewer and its numbers, sharing one selection.
 *
 * This is the items route's assembly of the two route-neutral pieces. The combat simulator will
 * build its own — same `BodyViewer`, same `ZoneTable`, different surroundings and a damage overlay
 * — which is why neither of those components knows this panel exists.
 */

const VIEWS: ViewName[] = ['front', 'back', 'left', 'right'];

export interface BodyCoveragePanelProps {
    armor: Armor;
    className?: string;
}

export default function BodyCoveragePanel({ armor, className }: BodyCoveragePanelProps) {
    const { model, error } = useBodyModel();
    const [view, setView] = useState<ViewName>('front');
    const [selected, setSelected] = useState<number | null>(null);

    // The coverage test samples 400 points per capsule, so it is computed once per vest, never on
    // a hover or a camera move.
    const coverage = useMemo(() => (model ? bodyCoverage(model, armor) : null), [model, armor]);

    // Ascending, so the key reads as the ladder it is.
    const classes = useMemo(
        () => [...new Set((armor.stats.protectiveData ?? []).map((zone) => zone.armorClass))]
            .sort((a, b) => a - b),
        [armor],
    );

    if (error) {
        return (
            <p className={cn('text-xs text-ink-600', className)}>
                The body model could not be loaded, so coverage cannot be drawn.
            </p>
        );
    }

    if (!coverage) {
        return <p className={cn('eyebrow text-ink-700', className)}>Loading body model…</p>;
    }

    if (coverage.empty) {
        return (
            <p className={cn('text-xs text-ink-500', className)}>
                This piece authors no protection zones — it covers nothing, and takes no hits on
                anyone&apos;s behalf.
            </p>
        );
    }

    return (
        <div className={cn('grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-5', className)}>
            <div>
                <BodyViewer
                    coverage={coverage}
                    view={view}
                    selected={selected}
                    onSelect={setSelected}
                    height={420}
                />
                <div className="flex gap-1 mt-2" role="group" aria-label="Camera angle">
                    {VIEWS.map((name) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => setView(name)}
                            aria-pressed={view === name}
                            className={cn(
                                'micro-label px-2 py-1 border flex-1 transition-colors',
                                view === name
                                    ? 'border-line-400 bg-steel-650 text-ink-100'
                                    : 'border-line-800 text-ink-600 hover:text-ink-300 hover:border-line-600',
                            )}
                        >
                            {name}
                        </button>
                    ))}
                </div>
                {/* The key. Only the classes this vest actually authors — a full 1-to-6 ramp would
                    be five swatches of theory for one of fact. */}
                {classes.length > 0 && (
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 mt-2" aria-label="Armor class key">
                        {classes.map((value) => (
                            <li key={value} className="flex items-center gap-1.5">
                                <span
                                    className="w-2.5 h-2.5 shrink-0"
                                    style={{ backgroundColor: armorClassColor(value) }}
                                    aria-hidden="true"
                                />
                                <span className="micro-label text-ink-500">
                                    Class {armorClassLabel(value)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                <p className="micro-label text-ink-700 mt-2">
                    Drag to orbit · {VIEW_PRESETS[view].azimuth}° · solid fill is more of the bone covered
                </p>
            </div>

            <ZoneTable coverage={coverage} selected={selected} onSelect={setSelected} />
        </div>
    );
}

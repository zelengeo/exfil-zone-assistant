'use client';

import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GunsmithPart } from '@/types/gunsmith';
import PartIcon from './PartIcon';
import PartAvailability, { cheapestOffer } from './PartAvailability';

/** What fitting this part would do to the build, as display-scale deltas. */
export interface PartPreview {
    ergonomics: number;
    verticalRecoil: number;
    horizontalRecoil: number;
    spreadMOA: number;
    weight: number;
}

interface PartPickerProps {
    title: string;
    subtitle?: string;
    candidates: GunsmithPart[];
    fittedGameId?: string | null;
    preview: (part: GunsmithPart) => PartPreview;
    onFit: (part: GunsmithPart) => void;
    onClear?: () => void;
    className?: string;
}

type SortKey = 'recoil' | 'ergonomics' | 'weight' | 'price' | 'name';

const SORTS: { key: SortKey; label: string }[] = [
    { key: 'recoil', label: 'Recoil' },
    { key: 'ergonomics', label: 'Ergo' },
    { key: 'weight', label: 'Weight' },
    { key: 'price', label: 'Price' },
    { key: 'name', label: 'Name' },
];

function DeltaChip({ label, value, precision = 0, higherIsBetter }: {
    label: string;
    value: number;
    precision?: number;
    higherIsBetter: boolean;
}) {
    const negligible = Math.abs(value) < 10 ** -precision / 2;
    const good = higherIsBetter ? value > 0 : value < 0;
    return (
        <span
            className={cn(
                'font-mono tabular text-[10px]',
                negligible ? 'text-ink-800' : good ? 'text-good' : 'text-ember',
            )}
        >
            {`${label} ${negligible ? '—' : `${value > 0 ? '+' : '−'}${Math.abs(value).toFixed(precision)}`}`}
        </span>
    );
}

/**
 * The parts that fit the selected slot, and what each would do to the gun.
 *
 * Every row is priced against the *current* build rather than against the bare receiver, so the
 * numbers answer the question actually being asked: what changes if I fit this one now.
 */
export default function PartPicker({
    title,
    subtitle,
    candidates,
    fittedGameId,
    preview,
    onFit,
    onClear,
    className,
}: PartPickerProps) {
    const [sort, setSort] = useState<SortKey>('recoil');

    const rows = useMemo(() => {
        const scored = candidates.map((part) => ({ part, preview: preview(part) }));
        const price = (part: GunsmithPart) => cheapestOffer(part)?.price ?? Number.MAX_SAFE_INTEGER;
        return scored.sort((a, b) => {
            switch (sort) {
                case 'recoil':
                    return (a.preview.verticalRecoil + a.preview.horizontalRecoil)
                        - (b.preview.verticalRecoil + b.preview.horizontalRecoil);
                case 'ergonomics':
                    return b.preview.ergonomics - a.preview.ergonomics;
                case 'weight':
                    return a.preview.weight - b.preview.weight;
                case 'price':
                    return price(a.part) - price(b.part);
                default:
                    return a.part.name.localeCompare(b.part.name);
            }
        });
    }, [candidates, preview, sort]);

    return (
        <div className={cn('flex flex-col min-h-0', className)}>
            <div className="px-3 py-2.5 border-b border-line-900">
                <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-display font-bold uppercase tracking-tight text-ink-100 text-lg leading-none">
                        {title}
                    </h2>
                    <span className="font-mono tabular text-[10px] text-ink-600">
                        {`${candidates.length} part${candidates.length === 1 ? '' : 's'}`}
                    </span>
                </div>
                {subtitle && <p className="text-[11px] text-ink-600 mt-1">{subtitle}</p>}

                <div className="flex items-center gap-1 mt-2.5">
                    <span className="micro-label text-ink-700 mr-1">Sort</span>
                    {SORTS.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => setSort(option.key)}
                            className={cn(
                                'micro-label px-1.5 py-1 border transition-colors',
                                sort === option.key
                                    ? 'border-line-400 text-ink-200 bg-steel-700'
                                    : 'border-line-800 text-ink-600 hover:text-ink-300',
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-line-900">
                {onClear && fittedGameId && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="w-full text-left px-3 py-2 text-sm text-ink-600 hover:text-ember hover:bg-steel-700 transition-colors"
                    >
                        Leave this slot empty
                    </button>
                )}

                {rows.length === 0 && (
                    <p className="px-3 py-6 text-sm text-ink-700">
                        Nothing in the extracted data fits here.
                    </p>
                )}

                {rows.map(({ part, preview: delta }) => {
                    const isFitted = fittedGameId === part.gameId.toLowerCase();
                    return (
                        <button
                            key={part.gameId}
                            type="button"
                            onClick={() => onFit(part)}
                            className={cn(
                                'w-full flex items-start gap-2.5 px-3 py-2 text-left transition-colors',
                                isFitted ? 'bg-steel-700' : 'hover:bg-steel-700',
                            )}
                        >
                            <PartIcon part={part} size={36} />
                            <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5">
                                    {isFitted && <Check size={12} className="text-good shrink-0" />}
                                    <span className="text-sm text-ink-200 truncate">{part.name}</span>
                                </span>
                                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1">
                                    <DeltaChip label="ERG" value={delta.ergonomics} higherIsBetter />
                                    <DeltaChip label="VRC" value={delta.verticalRecoil} higherIsBetter={false} />
                                    <DeltaChip label="HRC" value={delta.horizontalRecoil} higherIsBetter={false} />
                                    <DeltaChip label="MOA" value={delta.spreadMOA} precision={2} higherIsBetter={false} />
                                    <span className="font-mono tabular text-[10px] text-ink-700">
                                        {`${part.stats.weight.toFixed(2)} kg`}
                                    </span>
                                </span>
                            </span>
                            <PartAvailability part={part} className="mt-0.5" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

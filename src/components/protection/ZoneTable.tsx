import React from 'react';
import { cn } from '@/lib/utils';
import type { Coverage } from '@/lib/protection/coverage';

/**
 * The numbers behind the picture, one row per collision body.
 *
 * Shares its selection with the viewer beside it — hovering a row lights its capsule and the other
 * way round — the same way `BuildSlotList` is the gunsmith's one selection model rather than each
 * panel keeping its own idea of what is chosen.
 */

export interface ZoneTableProps {
    coverage: Coverage;
    selected?: number | null;
    onSelect?: (capsuleIndex: number) => void;
    onHover?: (capsuleIndex: number | null) => void;
    className?: string;
}

const PART_LABELS: Record<string, string> = {
    Head: 'Head',
    UpperChest: 'Upper chest',
    LowerChest: 'Lower chest',
    LeftArm: 'Left arm',
    RightArm: 'Right arm',
    LeftLeg: 'Left leg',
    RightLeg: 'Right leg',
    None: '—',
};

/** `spine_03` reads as a bone, not as a place. Give the row both. */
function boneLabel(bone: string): string {
    return bone.replace(/_/g, ' ');
}

export default function ZoneTable({ coverage, selected, onSelect, onHover, className }: ZoneTableProps) {
    // Covered bodies first: the interesting rows should not be scrolled to.
    const rows = [...coverage.zones].sort(
        (a, b) => b.fraction - a.fraction || a.capsule.bone.localeCompare(b.capsule.bone),
    );

    return (
        <div className={cn('min-w-0', className)}>
            <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_3rem_3.5rem] gap-x-3 px-2 pb-1.5 border-b border-line-900">
                <span className="eyebrow">Zone</span>
                <span className="eyebrow text-right">Class</span>
                <span className="eyebrow text-right">Wedge</span>
                <span className="eyebrow text-right">Cover</span>
            </div>

            <div className="divide-y divide-line-900">
                {rows.map((zone) => {
                    const isSelected = selected === zone.capsule.index;
                    const covered = zone.fraction > 0.001;

                    return (
                        <div
                            key={zone.capsule.index}
                            role={onSelect ? 'button' : undefined}
                            tabIndex={onSelect ? 0 : undefined}
                            onClick={() => onSelect?.(zone.capsule.index)}
                            onKeyDown={(e) => {
                                if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    onSelect(zone.capsule.index);
                                }
                            }}
                            onMouseEnter={() => onHover?.(zone.capsule.index)}
                            onMouseLeave={() => onHover?.(null)}
                            className={cn(
                                'grid grid-cols-[minmax(0,1fr)_2.5rem_3rem_3.5rem] gap-x-3 items-baseline px-2 py-1.5 border-l-2 transition-colors',
                                isSelected ? 'border-l-ember bg-steel-800' : 'border-l-transparent',
                                onSelect && 'cursor-pointer hover:bg-steel-800',
                            )}
                        >
                            <span className="min-w-0">
                                <span className={cn('text-xs', covered ? 'text-ink-200' : 'text-ink-600')}>
                                    {PART_LABELS[zone.part] ?? zone.part}
                                </span>
                                <span className="micro-label text-ink-700 ml-1.5">
                                    {boneLabel(zone.capsule.bone)}
                                </span>
                            </span>

                            <span className={cn('font-mono tabular text-xs text-right', covered ? 'text-ink-100' : 'text-ink-700')}>
                                {zone.zone ? zone.zone.armorClass : '—'}
                            </span>

                            <span className="font-mono tabular text-xs text-right text-ink-500">
                                {zone.zone ? `${zone.zone.angle}°` : '—'}
                            </span>

                            <span className={cn('font-mono tabular text-xs text-right', covered ? 'text-ink-100' : 'text-ink-700')}>
                                {covered ? `${Math.round(zone.fraction * 100)}%` : '—'}
                            </span>
                        </div>
                    );
                })}
            </div>

            <p className="micro-label text-ink-700 mt-3 leading-relaxed">
                Cover is the share of that collision body the plate actually protects, measured by
                running the game&apos;s own <span className="text-ink-500">Is Protected</span> test over
                its surface. The wedge is two-sided: a 90° plate covers front and back, never the flank.
            </p>
        </div>
    );
}

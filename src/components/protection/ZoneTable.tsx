import React from 'react';
import { cn } from '@/lib/utils';
import type { Coverage } from '@/lib/protection/coverage';

/**
 * The numbers behind the picture, one row per collision body the piece actually covers.
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

/** The same bone where the part beside it has already said which side: `lowerarm_l` -> `lowerarm`. */
function shortBone(bone: string): string {
    return bone.replace(/_[lr]$/i, '').replace(/_/g, ' ');
}

export default function ZoneTable({ coverage, selected, onSelect, onHover, className }: ZoneTableProps) {
    // Only what the plate actually reaches. A vest covers four bones out of nineteen, so listing
    // the rest was fifteen rows of dashes for every one row of data — and the useful reading, "what
    // is left open", is a list of body parts rather than a list of collision bodies. The footer
    // names them; the picture beside this already draws them unfilled.
    const rows = [...coverage.zones]
        .filter((zone) => zone.fraction > 0.001)
        .sort((a, b) => b.fraction - a.fraction || a.capsule.bone.localeCompare(b.capsule.bone));

    // What is left open, by body part. A part that also appears above — the IOTV plates a shoulder
    // but not the forearm under it — is named with the bones that are actually bare, so the footer
    // never contradicts a 100% row two lines up.
    const coveredParts = new Set(rows.map((zone) => zone.part));
    const bare = new Map<string, string[]>();
    for (const zone of coverage.zones) {
        if (zone.fraction > 0.001 || zone.part === 'None') continue;
        const bones = bare.get(zone.part) ?? [];
        bones.push(shortBone(zone.capsule.bone));
        bare.set(zone.part, bones);
    }

    const uncovered = [...bare].map(([part, bones]) => {
        const label = PART_LABELS[part] ?? part;
        return coveredParts.has(part) ? `${label} (${[...new Set(bones)].join(', ')})` : label;
    });

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
                                <span className="text-xs text-ink-200">
                                    {PART_LABELS[zone.part] ?? zone.part}
                                </span>
                                <span className="micro-label text-ink-700 ml-1.5">
                                    {boneLabel(zone.capsule.bone)}
                                </span>
                            </span>

                            <span className="font-mono tabular text-xs text-right text-ink-100">
                                {zone.zone ? zone.zone.armorClass : '—'}
                            </span>

                            <span className="font-mono tabular text-xs text-right text-ink-500">
                                {zone.zone ? `${zone.zone.angle}°` : '—'}
                            </span>

                            <span className="font-mono tabular text-xs text-right text-ink-100">
                                {Math.round(zone.fraction * 100)}%
                            </span>
                        </div>
                    );
                })}
            </div>

            {rows.length === 0 && (
                <p className="text-xs text-ink-600 px-2 py-3">
                    The zones this piece authors reach none of the body&apos;s collision shapes — no hit
                    anywhere is stopped by it.
                </p>
            )}

            <p className="micro-label text-ink-700 mt-3 leading-relaxed">
                Only the bodies this piece reaches are listed. Class is the plate&apos;s own rating for
                that spot, which need not match the vest&apos;s headline. Cover is the share of that
                collision body the plate actually protects, measured by running the game&apos;s own{' '}
                <span className="text-ink-500">Is Protected</span> test over its surface. The wedge is
                two-sided: a 90° plate covers front and back, never the flank.
            </p>

            {uncovered.length > 0 && (
                <p className="micro-label text-ink-700 mt-1.5 leading-relaxed">
                    <span className="text-ink-500">Unprotected:</span> {uncovered.join(', ')}.
                </p>
            )}
        </div>
    );
}

'use client';

import React from 'react';
import { ChevronRight, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GunsmithPart } from '@/types/gunsmith';
import type { BuildSlot } from '@/lib/gunsmith/compatibility';
import { UNIVERSAL_SLOT_KINDS, UNIVERSAL_SLOT_LABELS, type UniversalSlotKind } from '@/lib/gunsmith/compatibility';
import type { UniversalEntry } from '@/lib/gunsmith/build';
import PartIcon from './PartIcon';

interface BuildSlotListProps {
    /**
     * The lower receiver. It is the gun — it carries the whole simulation base every other part is
     * a delta against — so it heads the bench rather than being implied by the title.
     */
    receiver: GunsmithPart;
    /** Opens the weapon picker. Swapping the receiver empties the build, so it asks first. */
    onChangeReceiver?: () => void;
    slots: BuildSlot[];
    universal: UniversalEntry[];
    selectedSlotId?: string | null;
    /** Omitted on the weapon page, where a build is a fact rather than a thing you edit. */
    onSelectSlot?: (slotId: string) => void;
    onClearSlot?: (slotId: string) => void;
    /** Which rail-attachment kinds to offer an "add" row for. */
    universalKinds?: readonly UniversalSlotKind[];
    className?: string;
}

interface RowProps {
    label: string;
    part: GunsmithPart | null;
    depth: number;
    required?: boolean;
    selected?: boolean;
    onSelect?: () => void;
    onClear?: () => void;
    emptyHint?: string;
    className?: string;
}

function SlotRow({ label, part, depth, required, selected, onSelect, onClear, emptyHint, className }: RowProps) {
    const interactive = Boolean(onSelect);
    const Wrapper = interactive ? 'button' : 'div';

    return (
        <div
            className={cn(
                'flex items-stretch border-l-2',
                selected ? 'border-l-ember bg-steel-700' : 'border-l-transparent',
                className,
            )}
            style={{ paddingLeft: depth * 14 }}
        >
            <Wrapper
                type={interactive ? 'button' : undefined}
                onClick={onSelect}
                className={cn(
                    'flex items-center gap-2.5 flex-1 min-w-0 px-2.5 py-1.5 text-left',
                    interactive && 'hover:bg-steel-700 transition-colors',
                )}
            >
                {part ? (
                    <PartIcon part={part} size={28} />
                ) : (
                    <span
                        className="w-7 h-7 shrink-0 border border-dashed border-line-200 flex items-center justify-center"
                        aria-hidden="true"
                    >
                        <Plus size={12} className="text-ink-800" />
                    </span>
                )}

                <span className="min-w-0 flex-1">
                    <span className="micro-label text-ink-600 flex items-center gap-1.5">
                        {label}
                        {required && !part && <span className="text-warn">required</span>}
                    </span>
                    <span
                        className={cn(
                            'block truncate text-sm mt-0.5',
                            part ? 'text-ink-200' : 'text-ink-700 italic',
                        )}
                    >
                        {part ? part.name : emptyHint ?? 'Empty'}
                    </span>
                </span>

                {interactive && <ChevronRight size={14} className="text-ink-800 shrink-0" />}
            </Wrapper>

            {part && onClear && (
                <button
                    type="button"
                    onClick={onClear}
                    aria-label={`Remove ${part.name}`}
                    className="px-2 text-ink-700 hover:text-ember transition-colors"
                >
                    <X size={13} />
                </button>
            )}
        </div>
    );
}

/**
 * Every slot on the build, and everything hanging off a rail.
 *
 * The list is the selection model — there is no second set of chips to keep in step with it. Slot
 * rows are indented by depth, because a suppressor sits on a muzzle device rather than on the gun,
 * and a build that says otherwise is lying about what has to be bought first.
 */
export default function BuildSlotList({
    receiver,
    onChangeReceiver,
    slots,
    universal,
    selectedSlotId,
    onSelectSlot,
    onClearSlot,
    universalKinds = UNIVERSAL_SLOT_KINDS,
    className,
}: BuildSlotListProps) {
    return (
        <div className={cn('divide-y divide-line-900', className)}>
            <SlotRow
                label="Receiver"
                part={receiver}
                depth={0}
                required
                onSelect={onChangeReceiver}
                className="bg-steel-850"
            />

            {slots.map((slot) => (
                <SlotRow
                    key={slot.id}
                    label={slot.label}
                    part={slot.fitted}
                    depth={slot.depth}
                    required={slot.required}
                    selected={selectedSlotId === slot.id}
                    onSelect={onSelectSlot ? () => onSelectSlot(slot.id) : undefined}
                    onClear={slot.fitted && onClearSlot ? () => onClearSlot(slot.id) : undefined}
                />
            ))}

            <div className="pt-2 pb-1 px-2.5">
                <div className="eyebrow">Rail attachments</div>
                <p className="text-[11px] text-ink-700 mt-1 leading-snug">
                    The game publishes no mounting data for optics, grips and lights, so these are not
                    tied to a rail here. A build can carry several — a magnifier behind a red dot is a
                    real setup.
                </p>
            </div>

            {universal.map((entry) => (
                <SlotRow
                    key={entry.slotId}
                    label={UNIVERSAL_SLOT_LABELS[entry.kind]}
                    part={entry.part}
                    depth={0}
                    selected={selectedSlotId === entry.slotId}
                    onSelect={onSelectSlot ? () => onSelectSlot(entry.slotId) : undefined}
                    onClear={onClearSlot ? () => onClearSlot(entry.slotId) : undefined}
                />
            ))}

            {onSelectSlot && universalKinds.map((kind) => (
                <SlotRow
                    key={`add-${kind}`}
                    label={UNIVERSAL_SLOT_LABELS[kind]}
                    part={null}
                    depth={0}
                    selected={selectedSlotId === `add/${kind}`}
                    onSelect={() => onSelectSlot(`add/${kind}`)}
                    emptyHint="Add"
                />
            ))}
        </div>
    );
}

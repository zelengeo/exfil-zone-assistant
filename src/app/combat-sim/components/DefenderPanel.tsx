'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Slider from '@/components/ui/slider';
import ItemIcon from '@/components/items/ItemIcon';
import type { Armor, BodyArmor, FaceShield, Helmet } from '@/types/items';
import type { Defender } from '../utils/target-model';
import { effectiveArmorClass } from '../utils/damage-calculations';
import ArmorPicker from './ArmorPicker';
import ClassLadder from './ClassLadder';
import PanelNote from './PanelNote';

/**
 * What the target is wearing.
 *
 * Three slots, two durability tracks, and one rule the panel enforces rather than explains: a face
 * shield is only offered for a helmet that can carry it, and dropping the helmet drops the shield
 * with it. Worn without a helmet under it the shield's owner cast fails and it protects nothing at
 * all - so offering it would be offering a setting that does nothing.
 *
 * The slot shows the class the piece is rating *now*, not the one on its label. Durability does not
 * merely wear a plate down, it scales its class - `getArmorEffectivenessFromDurability` multiplies
 * straight into the penetration test - so a class 5 vest at 40% is not a class 5 vest, and a panel
 * that prints only the sticker figure is inviting the reader to plan around protection the target
 * does not have. The ladder draws both: filled rungs are what is left, outlined rungs are what wear
 * has taken.
 */

export interface DefenderPanelProps {
    defender: Defender;
    onChange: (patch: Partial<Defender>) => void;
    vests: BodyArmor[];
    helmets: Helmet[];
    shields: FaceShield[];
    className?: string;
}

type SlotName = 'vest' | 'helmet' | 'shield';

/** The class a worn piece is rating at its current durability. */
function wornClass(item: Armor, condition: number): number {
    return effectiveArmorClass(
        item.stats.armorClass,
        condition,
        item.stats.antiPenetrationDurabilityScalarCurve,
    );
}

/**
 * One slot: the picture, the name, and the class it is rating right now.
 *
 * A button rather than a `Select`, because what has to be shown per row - icon, two-reading ladder,
 * durability - is more than a native option can hold, and because the list it opens is ordered by
 * class rather than alphabetically.
 */
function Slot({
    label, item, condition, onOpen, disabled, hint,
}: {
    label: string;
    item: Armor | null;
    condition?: number;
    onOpen: () => void;
    disabled?: boolean;
    hint?: string;
}) {
    const worn = item && condition !== undefined ? wornClass(item, condition) : undefined;

    return (
        <button
            type="button"
            onClick={onOpen}
            disabled={disabled}
            className={cn(
                'w-full min-h-14 px-2 py-2 flex items-center gap-3 text-left border border-line-800',
                'transition-colors',
                disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-line-500 hover:bg-steel-750',
            )}
        >
            {item ? (
                <ItemIcon item={item} size={40} />
            ) : (
                <span className="w-10 h-10 shrink-0 border border-dashed border-line-700" aria-hidden="true" />
            )}

            <span className="min-w-0 flex-1">
                <span className="block micro-label text-ink-700">{label}</span>
                <span className={cn('block text-sm truncate mt-0.5', item ? 'text-ink-100' : 'text-ink-600')}>
                    {item?.name ?? hint ?? 'Nothing'}
                </span>
            </span>

            {item && (
                <ClassLadder
                    value={item.stats.armorClass}
                    weakened={worn}
                    size="sm"
                    className="shrink-0"
                />
            )}
            <ChevronRight size={16} className="shrink-0 text-ink-700" aria-hidden="true" />
        </button>
    );
}

/** The durability track for a worn piece, and the pool it is drawn from. */
function Condition({
    label, value, onChange, maxDurability,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    maxDurability: number;
}) {
    const percent = Math.round(value * 100);
    return (
        <div className="px-2 pt-1">
            <div className="flex items-baseline justify-between">
                <span className="micro-label text-ink-700">{label}</span>
                <span className="font-mono tabular text-xs text-ink-300">
                    {percent}% &middot; {Math.round(maxDurability * value)}/{maxDurability}
                </span>
            </div>
            <Slider
                value={percent}
                min={0}
                max={100}
                step={5}
                onChange={(next) => onChange(next / 100)}
                label={label}
                valueText={(next) => `${next} percent`}
            />
        </div>
    );
}

export default function DefenderPanel({
    defender, onChange, vests, helmets, shields, className,
}: DefenderPanelProps) {
    const [picking, setPicking] = useState<SlotName | null>(null);

    // A shield clips to a specific helmet: the helmet's own `canAttach` list is the compatibility.
    const compatible = defender.helmet
        ? shields.filter((shield) => defender.helmet?.stats.canAttach?.includes(shield.id))
        : [];

    return (
        <section className={cn('border border-line-800 bg-steel-800 p-3', className)}>
            <div className="flex items-center justify-between mb-2">
                <h2 className="eyebrow">Target</h2>
                <PanelNote label="the target's armour">
                    <p>
                        The ladder is the piece&rsquo;s armour class. Filled rungs are the class it is rating
                        at its current durability; outlined rungs are what wear has already taken.
                    </p>
                    <p>
                        Durability scales the class itself rather than just running out, so a worn class 5
                        vest stops the rounds a lower class stops &mdash; which is why the round&rsquo;s
                        penetration is drawn on this same ladder.
                    </p>
                </PanelNote>
            </div>

            <div className="space-y-3">
                <div>
                    <Slot
                        label="Body armour"
                        item={defender.vest}
                        condition={defender.vestCondition}
                        onOpen={() => setPicking('vest')}
                        hint="No vest"
                    />
                    {defender.vest && (
                        <Condition
                            label="Durability"
                            value={defender.vestCondition}
                            onChange={(value) => onChange({ vestCondition: value })}
                            maxDurability={defender.vest.stats.maxDurability}
                        />
                    )}
                </div>

                <div>
                    <Slot
                        label="Helmet"
                        item={defender.helmet}
                        condition={defender.helmetCondition}
                        onOpen={() => setPicking('helmet')}
                        hint="No helmet"
                    />
                    {defender.helmet && (
                        <Condition
                            label="Durability"
                            value={defender.helmetCondition}
                            onChange={(value) => onChange({ helmetCondition: value })}
                            maxDurability={defender.helmet.stats.maxDurability}
                        />
                    )}
                </div>

                {defender.helmet && (
                    <Slot
                        label="Face shield"
                        item={defender.faceShield}
                        // A visor carries no track of its own; it rates its full class or nothing.
                        condition={defender.faceShield ? 1 : undefined}
                        onOpen={() => setPicking('shield')}
                        disabled={compatible.length === 0}
                        hint={compatible.length === 0 ? 'Nothing clips to this helmet' : 'No visor'}
                    />
                )}
            </div>

            {picking === 'vest' && (
                <ArmorPicker
                    title="Body armour"
                    items={vests}
                    emptyLabel="No vest"
                    selectedId={defender.vest?.id ?? null}
                    onSelect={(item) => { onChange({ vest: item }); setPicking(null); }}
                    onClose={() => setPicking(null)}
                />
            )}

            {picking === 'helmet' && (
                <ArmorPicker
                    title="Helmet"
                    items={helmets}
                    emptyLabel="No helmet"
                    selectedId={defender.helmet?.id ?? null}
                    // Dropping the helmet drops the shield with it: see the header comment.
                    onSelect={(item) => { onChange({ helmet: item, faceShield: null }); setPicking(null); }}
                    onClose={() => setPicking(null)}
                />
            )}

            {picking === 'shield' && (
                <ArmorPicker
                    title="Face shield"
                    items={compatible}
                    emptyLabel="No visor"
                    selectedId={defender.faceShield?.id ?? null}
                    onSelect={(item) => { onChange({ faceShield: item }); setPicking(null); }}
                    onClose={() => setPicking(null)}
                />
            )}
        </section>
    );
}

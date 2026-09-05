'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import ItemIcon from '@/components/items/ItemIcon';
import type { Ammunition } from '@/types/items';
import ClassLadder from './ClassLadder';

/**
 * The round, given the weight it actually carries.
 *
 * Ammunition moves this page's answer more than anything else the reader picks. Swapping the round
 * changes both terms of the penetration test and the damage the shot arrives with; swapping the gun
 * changes two of six bench figures. The old page had that backwards — the gun got a panel and the
 * round got a grey line of small caps under it — so a reader tuning a build was tuning the input
 * that matters least.
 *
 * So the round is drawn the way armour is: an icon, its penetration on the shared class ladder, and
 * its damage. `AmmoTag` is the ambient form for a rail row; `AmmoRow` is the choosing form.
 */

/** Reading a round's figures out of the shape the catalogue publishes. */
export function ammoFigures(ammo: Ammunition) {
    return {
        penetration: ammo.stats.penetration,
        damage: ammo.stats.damage,
        /** What the round still delivers when the plate stops it, as a percentage of its damage. */
        blunt: Math.round(ammo.stats.bluntDamageScale * 100),
    };
}

/**
 * The ladder always carries the penetration figure, so the tag never depends on the prose tail to
 * say the one number that matters. `compact` is the rail's form, which drops the damage tail
 * outright; the full form hides it below `md`, where there is no width for it either.
 */
export function AmmoTag({
    ammo, variant = 'full', className,
}: {
    ammo: Ammunition | null;
    variant?: 'full' | 'compact';
    className?: string;
}) {
    if (!ammo) {
        return (
            <span className={cn('inline-flex items-center gap-2 micro-label text-ember', className)}>
                No round chosen
            </span>
        );
    }
    const { penetration, damage } = ammoFigures(ammo);

    return (
        <span className={cn('flex items-center gap-2 min-w-0', className)}>
            <ItemIcon item={ammo} size={24} />
            <span className="text-sm text-ink-400 truncate min-w-0 flex-1">{ammo.name}</span>
            <ClassLadder value={penetration} size="sm" className="shrink-0" />
            {variant === 'full' && (
                <span className="hidden md:inline font-mono tabular text-xs text-ink-500 shrink-0">
                    &middot; {damage} dmg
                </span>
            )}
        </span>
    );
}

export interface AmmoRowProps {
    ammo: Ammunition;
    selected: boolean;
    onSelect: () => void;
    /** Marks the best figure in the list, so the ladder has a top without the reader sorting it. */
    isBestPenetration?: boolean;
    isBestDamage?: boolean;
}

export function AmmoRow({ ammo, selected, onSelect, isBestPenetration, isBestDamage }: AmmoRowProps) {
    const { penetration, damage, blunt } = ammoFigures(ammo);

    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={cn(
                'w-full min-h-14 px-3 py-2 text-left flex items-center gap-3 transition-colors',
                'border-l-2',
                selected
                    ? 'bg-steel-700 border-ember'
                    : 'border-transparent hover:bg-steel-750',
            )}
        >
            <ItemIcon item={ammo} size={36} />

            <span className="min-w-0 flex-1">
                <span className={cn('block text-sm truncate', selected ? 'text-ink-hi' : 'text-ink-200')}>
                    {ammo.name}
                </span>
                <span className="block micro-label text-ink-700 mt-0.5">
                    {blunt}% if stopped
                </span>
            </span>

            <span className="shrink-0 text-right">
                <ClassLadder value={penetration} className="justify-end" />
                <span className="block micro-label text-ink-700 mt-0.5">
                    penetration{isBestPenetration && <span className="text-good"> &middot; best</span>}
                </span>
            </span>

            <span className="shrink-0 w-14 text-right">
                <span className="font-mono tabular text-base text-ink-100 block leading-none">{damage}</span>
                <span className="block micro-label text-ink-700 mt-1">
                    damage{isBestDamage && <span className="text-good"> &middot; best</span>}
                </span>
            </span>
        </button>
    );
}

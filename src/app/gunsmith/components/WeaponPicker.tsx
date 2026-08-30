'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Weapon } from '@/types/items';
import type { PartIndex } from '@/lib/gunsmith/compatibility';
import { findPart } from '@/lib/gunsmith/compatibility';
import { weaponClassOf } from '@/lib/gunsmith/bands';

interface WeaponPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    presets: Weapon[];
    index: PartIndex;
    currentId?: string;
    onPick: (weapon: Weapon) => void;
}

/**
 * Choosing what to build on.
 *
 * There are 134 shipped presets, which is far too many to keep on the screen beside a build — so
 * they live behind this rather than in a rail. A preset is a starting point, not a catalogue entry:
 * picking one loads its parts, and everything after that is the player's.
 */
export default function WeaponPicker({ open, onOpenChange, presets, index, currentId, onPick }: WeaponPickerProps) {
    const [query, setQuery] = useState('');

    const groups = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const byClass = new Map<string, Weapon[]>();
        for (const weapon of presets) {
            if (needle && !weapon.name.toLowerCase().includes(needle)) continue;
            const weaponClass = weaponClassOf(findPart(index, weapon.receiverId)) ?? 'Other';
            const bucket = byClass.get(weaponClass);
            if (bucket) bucket.push(weapon);
            else byClass.set(weaponClass, [weapon]);
        }
        return [...byClass.entries()]
            .map(([weaponClass, list]) => [weaponClass, list.sort((a, b) => a.name.localeCompare(b.name))] as const)
            .sort((a, b) => b[1].length - a[1].length);
    }, [presets, index, query]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-steel-900 border-line-700 p-0 gap-0">
                <DialogHeader className="px-5 pt-5 pb-3">
                    <DialogTitle className="font-display uppercase tracking-tight text-ink-100">
                        Change base weapon
                    </DialogTitle>
                    <DialogDescription className="text-ink-600 text-sm">
                        Loading a preset replaces the whole build with the parts the game ships on it.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-5 pb-3">
                    <div className="flex items-center gap-2 bg-steel-750 border border-line-600 px-3">
                        <Search size={14} className="text-ink-700 shrink-0" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search presets"
                            aria-label="Search presets"
                            className="bg-transparent border-0 text-sm text-ink-200 placeholder:text-ink-700 focus:outline-none flex-1 min-h-11 px-0"
                        />
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-5 pb-5">
                    {groups.length === 0 && (
                        <p className="text-sm text-ink-600 py-8 text-center">No preset matches that.</p>
                    )}
                    {groups.map(([weaponClass, list]) => (
                        <section key={weaponClass} className="mb-5">
                            <h3 className="eyebrow mb-2">{`${weaponClass} · ${list.length}`}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {list.map((weapon) => (
                                    <button
                                        key={weapon.id}
                                        type="button"
                                        onClick={() => {
                                            onPick(weapon);
                                            onOpenChange(false);
                                        }}
                                        className={cn(
                                            'flex items-center gap-2.5 p-2 text-left border transition-colors',
                                            weapon.id === currentId
                                                ? 'border-line-400 bg-steel-700'
                                                : 'border-transparent hover:bg-steel-800',
                                        )}
                                    >
                                        <span className="w-12 h-8 bg-steel-800 border border-line-800 shrink-0 relative">
                                            {weapon.images?.icon && (
                                                <Image
                                                    src={weapon.images.icon}
                                                    alt=""
                                                    fill
                                                    sizes="48px"
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            )}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm text-ink-200 truncate">{weapon.name}</span>
                                            <span className="font-mono text-[10px] text-ink-600">
                                                {[weapon.stats?.caliber, weapon.gunsmithDisplay?.RPM && `${weapon.gunsmithDisplay.RPM} rpm`]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

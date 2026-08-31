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
import type { GunsmithPart } from '@/types/gunsmith';
import type { PartIndex } from '@/lib/gunsmith/compatibility';
import { findPart } from '@/lib/gunsmith/compatibility';
import { weaponClassOf } from '@/lib/gunsmith/bands';

interface WeaponPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    presets: Weapon[];
    index: PartIndex;
    currentId?: string;
    /** The receiver currently on the bench, so both tabs can show what is selected. */
    currentReceiverId?: string;
    onPick: (weapon: Weapon) => void;
    /** Start from a bare receiver instead of a preset. Everything comes off the gun. */
    onPickReceiver: (receiver: GunsmithPart) => void;
}

type Tab = 'presets' | 'receivers';

/**
 * Choosing what to build on.
 *
 * There are 134 shipped presets, which is far too many to keep on the screen beside a build — so
 * they live behind this rather than in a rail. A preset is a starting point, not a catalogue entry:
 * picking one loads its parts, and everything after that is the player's. The second tab drops the
 * preset entirely and starts from a bare receiver.
 */
export default function WeaponPicker({
    open,
    onOpenChange,
    presets,
    index,
    currentId,
    currentReceiverId,
    onPick,
    onPickReceiver,
}: WeaponPickerProps) {
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<Tab>('presets');

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

    const receiverGroups = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const byClass = new Map<string, GunsmithPart[]>();
        for (const receiver of index.receivers) {
            if (needle && !receiver.name.toLowerCase().includes(needle)) continue;
            const weaponClass = weaponClassOf(receiver) ?? 'Other';
            const bucket = byClass.get(weaponClass);
            if (bucket) bucket.push(receiver);
            else byClass.set(weaponClass, [receiver]);
        }
        return [...byClass.entries()]
            .map(([weaponClass, list]) => [weaponClass, list.sort((a, b) => a.name.localeCompare(b.name))] as const)
            .sort((a, b) => b[1].length - a[1].length);
    }, [index, query]);

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

                <div className="px-5 pb-3 flex gap-1">
                    {([['presets', `Presets · ${presets.length}`], ['receivers', `Bare receivers · ${index.receivers.length}`]] as const).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={cn(
                                'micro-label px-2.5 py-1.5 border transition-colors',
                                tab === key
                                    ? 'border-line-400 text-ink-100 bg-steel-700'
                                    : 'border-line-800 text-ink-600 hover:text-ink-300',
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>

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
                    {tab === 'receivers' && (
                        <>
                            <p className="text-[11px] text-ink-600 mb-3">
                                A receiver on its own: the simulation base with nothing bolted to it. Every
                                slot starts empty, and the required ones are marked on the bench.
                            </p>
                            {receiverGroups.map(([weaponClass, list]) => (
                                <section key={weaponClass} className="mb-5">
                                    <h3 className="eyebrow mb-2">{`${weaponClass} · ${list.length}`}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                        {list.map((receiver) => (
                                            <button
                                                key={receiver.gameId}
                                                type="button"
                                                onClick={() => {
                                                    onPickReceiver(receiver);
                                                    onOpenChange(false);
                                                }}
                                                className={cn(
                                                    'flex flex-col items-start p-2 text-left border transition-colors',
                                                    receiver.gameId.toLowerCase() === currentReceiverId
                                                        ? 'border-line-400 bg-steel-700'
                                                        : 'border-transparent hover:bg-steel-800',
                                                )}
                                            >
                                                <span className="text-sm text-ink-200 truncate max-w-full">{receiver.name}</span>
                                                <span className="font-mono text-[10px] text-ink-600">
                                                    {[receiver.stats.gunData?.caliber, receiver.stats.gunData?.fireRate && `${receiver.stats.gunData.fireRate} rpm`]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </>
                    )}

                    {tab === 'presets' && groups.length === 0 && (
                        <p className="text-sm text-ink-600 py-8 text-center">No preset matches that.</p>
                    )}
                    {tab === 'presets' && groups.map(([weaponClass, list]) => (
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

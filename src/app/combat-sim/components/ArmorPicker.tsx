'use client';

import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import ItemIcon from '@/components/items/ItemIcon';
import { armorClassStep } from '@/lib/protection/armorClassScale';
import type { Armor } from '@/types/items';
import ClassLadder from './ClassLadder';

/**
 * Which piece of armour they are wearing.
 *
 * The three slots used to be `Select` dropdowns of bare names, which asked the reader to know what
 * a Korund-VM is. Nobody knows thirty-seven vests by name, and the one fact that decides every
 * number on this page - the class - was not in the list at all.
 *
 * So the list is ordered by class, heaviest protection first, and every row carries the picture,
 * the ladder and the durability pool. Ordering by class rather than by name is the whole point: a
 * reader who wants "something around class 4" can find it without knowing a single product name,
 * which is the actual question a defender panel is asked.
 */

export interface ArmorPickerProps<T extends Armor> {
    title: string;
    items: T[];
    /** What the empty choice is called - "No vest", "No helmet". */
    emptyLabel: string;
    selectedId: string | null;
    onSelect: (item: T | null) => void;
    onClose: () => void;
}

export default function ArmorPicker<T extends Armor>({
    title, items, emptyLabel, selectedId, onSelect, onClose,
}: ArmorPickerProps<T>) {
    const [query, setQuery] = useState('');

    const filter = query.trim().toLowerCase();
    const matching = useMemo(
        () => (filter ? items.filter((item) => item.name.toLowerCase().includes(filter)) : items),
        [items, filter],
    );

    // Class descending, then the tougher of two equals first: the order a reader shops in.
    const byClass = useMemo(() => {
        const groups = new Map<number, T[]>();
        for (const item of matching) {
            const step = armorClassStep(item.stats.armorClass);
            const bucket = groups.get(step);
            if (bucket) bucket.push(item);
            else groups.set(step, [item]);
        }
        return [...groups.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([step, group]) => ({
                step,
                items: group.sort((a, b) => b.stats.maxDurability - a.stats.maxDurability),
            }));
    }, [matching]);

    return (
        <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent
                showCloseButton={false}
                className={cn(
                    'bg-steel-800 border-line-700 rounded-none p-0 gap-0 block',
                    'w-[calc(100%-1rem)] max-w-2xl sm:max-w-2xl max-h-[92vh] overflow-y-auto',
                )}
            >
                <header className="sticky top-0 z-10 px-4 py-3 bg-steel-800 border-b border-line-700">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl text-ink-100 military-stencil flex-1 min-w-0 truncate">
                            {title}
                        </DialogTitle>
                        <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 w-11 h-11 flex items-center justify-center border border-line-700
                                text-ink-400 hover:text-ink-hi hover:border-line-400 transition-colors"
                            aria-label="Close without changing"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>
                    <div className="relative mt-3">
                        <Search
                            size={15}
                            aria-hidden="true"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700 pointer-events-none"
                        />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={`Search ${items.length}`}
                            aria-label={`Search ${title}`}
                            className="min-h-11 pl-9"
                        />
                    </div>
                </header>

                <ul className="divide-y divide-line-900">
                    <li>
                        <button
                            type="button"
                            onClick={() => onSelect(null)}
                            aria-pressed={selectedId === null}
                            className={cn(
                                'w-full min-h-14 px-4 py-3 text-left flex items-center gap-3 border-l-2 transition-colors',
                                selectedId === null
                                    ? 'bg-steel-700 border-ember text-ink-hi'
                                    : 'border-transparent hover:bg-steel-750 text-ink-300',
                            )}
                        >
                            <span className="w-10 h-10 shrink-0 border border-dashed border-line-700" aria-hidden="true" />
                            <span className="text-sm">{emptyLabel}</span>
                        </button>
                    </li>
                </ul>

                {byClass.map(({ step, items: group }) => (
                    <section key={step}>
                        <p className="eyebrow px-4 pt-3 pb-1.5 sticky top-[7.5rem] bg-steel-800 z-[5]">
                            {step === 0 ? 'Rates no class' : `Class ${step}`} &mdash; {group.length}
                        </p>
                        <ul className="divide-y divide-line-900">
                            {group.map((item) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(item)}
                                        aria-pressed={item.id === selectedId}
                                        className={cn(
                                            'w-full min-h-14 px-4 py-2 text-left flex items-center gap-3',
                                            'border-l-2 transition-colors',
                                            item.id === selectedId
                                                ? 'bg-steel-700 border-ember'
                                                : 'border-transparent hover:bg-steel-750',
                                        )}
                                    >
                                        <ItemIcon item={item} size={40} />
                                        <span className="min-w-0 flex-1">
                                            <span className={cn(
                                                'block text-sm truncate',
                                                item.id === selectedId ? 'text-ink-hi' : 'text-ink-200',
                                            )}>
                                                {item.name}
                                            </span>
                                            <span className="block micro-label text-ink-700 mt-0.5">
                                                {item.stats.maxDurability} durability &middot;{' '}
                                                {item.stats.weight} kg
                                            </span>
                                        </span>
                                        <ClassLadder value={item.stats.armorClass} className="shrink-0" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}

                {byClass.length === 0 && (
                    <p className="px-4 py-6 text-sm text-ink-600">Nothing matches that search.</p>
                )}
            </DialogContent>
        </Dialog>
    );
}

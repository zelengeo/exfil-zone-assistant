'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Filter, Info, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatEZD } from '@/lib/trade';
import type { Item } from '@/types/items';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ItemChip from '@/components/items/ItemChip';
import {
    type AreaLevels,
    type Band,
    BAND_LABELS,
    type Built,
    TOTAL_UPGRADES,
    areaName,
    bandOf,
    remaining,
    wantedBy,
} from '../utils/hideout';
import { Rule } from './ZonePane';

/**
 * Everything still to find, aggregated across every unbuilt level.
 *
 * The list this replaces printed three flat grids of identical tiles, one per quantity band, and
 * answered "what do I need" without ever answering "how much is all of this". The bands survive —
 * they are the boundaries players talk in — but the density now follows the band: full tiles for
 * the two dozen things worth a dedicated run, chips for the tail.
 */

const BULK_SHOWN = 20;

const BAND_ORDER: Band[] = ['bulk', 'some', 'few'];

const BAND_DOT: Record<Band, string> = { bulk: 'bg-ember', some: 'bg-warn', few: 'bg-ink-600' };
const BAND_INK: Record<Band, string> = { bulk: 'text-ember', some: 'text-warn', few: 'text-ink-600' };
const BAND_COUNT_INK: Record<Band, string> = { bulk: 'text-ink-100', some: 'text-warn', few: 'text-ink-500' };

export interface MaterialsPanelProps {
    built: Built;
    levels: AreaLevels;
    getItemById: (id: string) => Item | undefined;
    hydrated: boolean;
}

export default function MaterialsPanel({ built, levels, getItemById, hydrated }: MaterialsPanelProps) {
    const [readyOnly, setReadyOnly] = useState(false);
    const [band, setBand] = useState<Band | 'all'>('all');
    const [showAllBulk, setShowAllBulk] = useState(false);
    const [openItem, setOpenItem] = useState<string | null>(null);

    const totals = useMemo(() => remaining(built, levels, readyOnly), [built, levels, readyOnly]);

    const bands = useMemo(() => {
        const grouped: Record<Band, Array<{ itemId: string; quantity: number }>> =
            { bulk: [], some: [], few: [] };
        for (const entry of totals.items) grouped[bandOf(entry.quantity)].push(entry);
        return grouped;
    }, [totals]);

    const peak = totals.items[0]?.quantity ?? 1;
    const shown = BAND_ORDER.filter((key) => band === 'all' || band === key);

    return (
        <section className="mt-8">
            <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
                <div className="min-w-0 flex-1">
                    <span className="eyebrow">
                        Remaining · {totals.upgrades} upgrades · {readyOnly ? 'ready to build now' : 'every zone at max level'}
                    </span>
                    <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-none tracking-[0.015em] text-ink-hi sm:text-4xl">
                        Materials
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={() => setReadyOnly((on) => !on)}
                    aria-pressed={readyOnly}
                    className={cn(
                        'micro-label inline-flex min-h-11 flex-none items-center gap-1.5 border px-2.5',
                        readyOnly ? 'border-warn bg-warn/[0.07] text-warn' : 'border-line-700 text-ink-600 hover:text-ink-400',
                    )}
                >
                    <Filter size={11} aria-hidden="true" />
                    Only what is ready
                </button>
            </div>

            <dl className="mt-4 grid grid-cols-2 border border-line-700 border-l-[3px] border-l-warn bg-steel-750 shell:grid-cols-4">
                <Stat label="Money still needed" value={hydrated ? formatEZD(totals.price) : '—'} note="Across every unbuilt level" accent />
                <Stat label="Item types" value={hydrated ? String(totals.items.length) : '—'} note="Distinct things to find" />
                <Stat label="Units total" value={hydrated ? String(totals.units) : '—'} note="Individual pickups" />
                <Stat
                    label="Upgrades left"
                    value={hydrated ? String(totals.upgrades) : '—'}
                    note={hydrated ? `${built.size} of ${TOTAL_UPGRADES} built` : `of ${TOTAL_UPGRADES}`}
                />
            </dl>

            {totals.items.length === 0 ? (
                <div className="mt-4 border border-line-800 bg-steel-800 p-10 text-center">
                    <p className="font-display text-xl font-bold uppercase text-ink-100">
                        {readyOnly ? 'Nothing ready to build' : 'Hideout complete'}
                    </p>
                    <p className="mt-2 text-sm text-ink-600">
                        {readyOnly
                            ? 'Every zone you can reach is finished. Clear a task gate, or turn the filter off.'
                            : 'Every zone is at its top level. Nothing left to find.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 border-y border-line-900 py-2.5">
                        <BandChip active={band === 'all'} onClick={() => setBand('all')}>
                            All · {totals.items.length}
                        </BandChip>
                        {BAND_ORDER.map((key) => (
                            <BandChip key={key} active={band === key} onClick={() => setBand(key)}>
                                {BAND_LABELS[key]} · {bands[key].length}
                            </BandChip>
                        ))}
                        <div className="flex-1" />
                        <span className="hidden items-center gap-2 shell:flex">
                            <Info size={12} className="text-ink-700" aria-hidden="true" />
                            <span className="text-[11.5px] text-ink-700">Pick an item to see which upgrades want it</span>
                        </span>
                    </div>

                    <div className="mt-3.5 flex flex-col gap-3">
                        {shown.map((key) => {
                            const entries = bands[key];
                            if (entries.length === 0) return null;
                            const units = entries.reduce((sum, entry) => sum + entry.quantity, 0);
                            const capped = key === 'bulk' && !showAllBulk && band === 'all';
                            const visible = capped ? entries.slice(0, BULK_SHOWN) : entries;

                            return (
                                <div key={key} className="flex flex-col gap-2.5">
                                    <Rule
                                        dot={BAND_DOT[key]}
                                        ink={BAND_INK[key]}
                                        label={BAND_LABELS[key]}
                                        note={`${entries.length} types · ${units} units${key === 'bulk' ? ' · farm these first' : ''}`}
                                    />

                                    {key === 'bulk' ? (
                                        <>
                                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                                {visible.map(({ itemId, quantity }) => (
                                                    <MaterialTile
                                                        key={itemId}
                                                        item={getItemById(itemId)}
                                                        itemId={itemId}
                                                        quantity={quantity}
                                                        share={quantity / peak}
                                                        onOpen={() => setOpenItem(itemId)}
                                                    />
                                                ))}
                                            </div>
                                            {capped && entries.length > BULK_SHOWN && (
                                                <div className="flex items-center gap-2.5">
                                                    <span className="micro-label text-ink-700">
                                                        {entries.length - BULK_SHOWN} more at 10 or above
                                                    </span>
                                                    <span className="block h-px flex-1 bg-line-900" aria-hidden="true" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAllBulk(true)}
                                                        className="micro-label min-h-11 text-info hover:text-info-light"
                                                    >
                                                        Show all
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {entries.map(({ itemId, quantity }) => (
                                                <button
                                                    key={itemId}
                                                    type="button"
                                                    onClick={() => setOpenItem(itemId)}
                                                    className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-line-800
                                                               bg-steel-800 px-2.5 transition-colors hover:border-line-500"
                                                >
                                                    <span className="truncate text-[11.5px] text-ink-400">
                                                        {getItemById(itemId)?.name ?? itemId}
                                                    </span>
                                                    <span className={cn('tabular font-mono text-[11px] font-bold', BAND_COUNT_INK[key])}>
                                                        {quantity}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <WantedByDialog
                itemId={openItem}
                built={built}
                levels={levels}
                getItemById={getItemById}
                onClose={() => setOpenItem(null)}
            />
        </section>
    );
}

function Stat({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
    return (
        <div className="flex flex-col justify-center gap-2 border-line-900 px-5 py-4 [&+&]:border-l">
            <dt className="micro-label">{label}</dt>
            <dd className={cn('tabular font-mono text-xl font-bold leading-none tracking-[0.02em]', accent ? 'text-warn' : 'text-ink-100')}>
                {value}
            </dd>
            <p className="text-[11px] text-ink-700">{note}</p>
        </div>
    );
}

function BandChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'micro-label inline-flex min-h-11 items-center border px-2',
                active ? 'border-line-400 bg-steel-700 text-ink-200' : 'border-line-700 text-ink-600 hover:text-ink-400',
            )}
        >
            {children}
        </button>
    );
}

function MaterialTile({ item, itemId, quantity, share, onOpen }: {
    item: Item | undefined; itemId: string; quantity: number; share: number; onOpen: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="flex min-w-0 items-center justify-start gap-2.5 border border-line-800 bg-steel-800
                       p-2.5 pr-3 text-left transition-colors hover:border-line-500"
        >
            <span className="relative block h-[42px] w-[42px] flex-none border border-line-700 bg-steel-550">
                <Image
                    src={item?.images.icon || '/images/missing-item.png'}
                    alt=""
                    fill
                    unoptimized
                    sizes="42px"
                    className="object-contain p-1"
                />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] text-ink-300">{item?.name ?? itemId}</span>
                {item?.subcategory && <span className="micro-label mb-1.5 mt-1 block text-ink-700">{item.subcategory}</span>}
                {/* Bar against the busiest item, so the tail of the band reads as a tail. */}
                <span className="block h-0.5 w-full bg-track">
                    <span className="block h-0.5 bg-ember" style={{ width: `${Math.max(4, share * 100)}%` }} />
                </span>
            </span>
            <span className="tabular flex-none font-mono text-base font-bold tracking-[0.02em] text-ink-100">{quantity}</span>
        </button>
    );
}

/**
 * Which upgrades want one item — and, for each, what is still in its way.
 *
 * The old popover listed the upgrades and stopped there, painting every row the same green
 * regardless of whether it was buildable. A player looking at 25 copper wire wants to know how much
 * of that demand is real tonight, so each row now carries the zones it is still waiting on.
 */
function WantedByDialog({ itemId, built, levels, getItemById, onClose }: {
    itemId: string | null;
    built: Built;
    levels: AreaLevels;
    getItemById: (id: string) => Item | undefined;
    onClose: () => void;
}) {
    const item = itemId ? getItemById(itemId) : undefined;
    const rows = useMemo(
        () => (itemId ? wantedBy(itemId, built, levels) : []),
        [itemId, built, levels],
    );

    const units = rows.reduce((sum, row) => sum + row.quantity, 0);
    const rooms = new Set(rows.map((row) => row.room)).size;

    return (
        <Dialog open={itemId !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-[660px] border-line-400 bg-steel-900 p-0">
                <DialogHeader className="flex-row items-start gap-3.5 space-y-0 border-b border-line-900 p-5">
                    {item ? <ItemChip item={item} layout="tile" size="lg" newTab /> : null}
                    <div className="min-w-0 flex-1 text-left">
                        <span className="micro-label">
                            {item?.subcategory ?? 'Material'}
                        </span>
                        <DialogTitle className="mt-2 truncate font-display text-2xl font-extrabold uppercase leading-none text-ink-hi">
                            {item?.name ?? itemId}
                        </DialogTitle>
                        <DialogDescription className="tabular mt-2 font-mono text-[11px] tracking-[0.06em] text-ink-500">
                            {units} units · {rows.length} upgrade{rows.length === 1 ? '' : 's'} · {rooms} room{rooms === 1 ? '' : 's'}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="flex max-h-[60vh] flex-col gap-2.5 overflow-y-auto p-5 pt-0">
                    <Rule label="Wanted by" note="Unbuilt levels only" />
                    {rows.map((row) => (
                        <div key={row.id} className="flex items-center gap-3 border border-line-800 bg-steel-800 px-3.5 py-3">
                            <span
                                className={cn(
                                    'flex h-6 w-6 flex-none items-center justify-center border',
                                    row.missing.length ? 'border-dashed border-line-200' : 'border-line-700',
                                )}
                            >
                                {row.missing.length
                                    ? <Lock size={12} className="text-ink-700" aria-hidden="true" />
                                    : <span className="block h-1.5 w-1.5 bg-warn" aria-hidden="true" />}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-display text-[17px] font-semibold uppercase leading-none text-ink-200">
                                    {row.upgrade.upgradeName} <span className="text-ink-700">Lv {row.upgrade.level}</span>
                                </span>
                                <span className="micro-label mt-1.5 block truncate text-ink-700">
                                    {row.room}
                                    {row.missing.length > 0 && ` · needs ${row.missing
                                        .map((gate) => `${areaName(gate.areaId)} ${gate.level}`)
                                        .join(' · ')}`}
                                </span>
                            </span>
                            <span className="tabular flex-none font-mono text-base font-bold text-ink-100">×{row.quantity}</span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

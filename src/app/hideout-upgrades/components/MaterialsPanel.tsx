'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { Filter, Info, LayoutGrid, List, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { baseValue, formatEZD, isPriced } from '@/lib/trade';
import type { Item } from '@/types/items';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ItemChip from '@/components/items/ItemChip';
import {
    type AreaLevels,
    BAND_ORDER,
    type Band,
    type Built,
    MATERIAL_SORTS,
    type MaterialSort,
    type RankedMaterial,
    TOTAL_UPGRADES,
    areaName,
    bandOf,
    bandScaleOf,
    rankMaterials,
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

/** How many tiles a band shows before it offers to show the rest. */
const TILES_SHOWN = 20;

const BAND_DOT: Record<Band, string> = { high: 'bg-ember', mid: 'bg-warn', low: 'bg-ink-600' };
const BAND_INK: Record<Band, string> = { high: 'text-ember', mid: 'text-warn', low: 'text-ink-600' };
const BAND_COUNT_INK: Record<Band, string> = { high: 'text-ink-100', mid: 'text-warn', low: 'text-ink-500' };

/**
 * Which bands start as full tiles.
 *
 * The leading band earns the space — it is the one you act on — and the tail is a list of names you
 * scan rather than study. Every band can be switched either way from its own header.
 */
const INITIAL_DENSITY: Record<Band, boolean> = { high: true, mid: false, low: false };

const SORT_ORDER: MaterialSort[] = ['quantity', 'unitValue', 'totalValue'];

/**
 * Money at a glance. `formatEZD` is the right thing in a stat block and too long in a chip — a
 * material line can run to seven figures, and "5,150,070 EZD" does not fit beside a name.
 */
function compactEZD(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
    return String(value);
}

/** The number a row is being ordered on, and how it reads. */
function sortedValue(material: RankedMaterial, sort: MaterialSort): number | null {
    return sort === 'quantity' ? material.quantity
        : sort === 'unitValue' ? material.unitValue
            : material.totalValue;
}

export interface MaterialsPanelProps {
    built: Built;
    levels: AreaLevels;
    getItemById: (id: string) => Item | undefined;
    hydrated: boolean;
}

export default function MaterialsPanel({ built, levels, getItemById, hydrated }: MaterialsPanelProps) {
    const [readyOnly, setReadyOnly] = useState(false);
    const [band, setBand] = useState<Band | 'all'>('all');
    const [sort, setSort] = useState<MaterialSort>('quantity');
    const [full, setFull] = useState<Record<Band, boolean>>(INITIAL_DENSITY);
    const [expanded, setExpanded] = useState<Record<Band, boolean>>({ high: false, mid: false, low: false });
    const [openItem, setOpenItem] = useState<string | null>(null);

    const totals = useMemo(() => remaining(built, levels, readyOnly), [built, levels, readyOnly]);

    /**
     * What one of a material sells for. The catalogue prices all but one of the 89 the hideout
     * wants; that one sorts last under a value order rather than as free.
     */
    const unitValueOf = useCallback((itemId: string): number | null => {
        const stats = getItemById(itemId)?.stats;
        return stats && isPriced(stats) ? baseValue(stats) : null;
    }, [getItemById]);

    const ranked = useMemo(
        () => rankMaterials(totals.items, sort, unitValueOf),
        [totals, sort, unitValueOf],
    );

    // Bands measure whatever the list is ordered by, so the grouping and the order never disagree.
    const scale = bandScaleOf(sort);
    const bands = useMemo(() => {
        const grouped: Record<Band, RankedMaterial[]> = { high: [], mid: [], low: [] };
        for (const entry of ranked) grouped[bandOf(entry, sort)].push(entry);
        return grouped;
    }, [ranked, sort]);

    const peak = useMemo(
        () => Math.max(1, ...ranked.map((material) => sortedValue(material, sort) ?? 0)),
        [ranked, sort],
    );
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

                <div className="flex flex-none flex-wrap items-center gap-x-3 gap-y-2">
                    <button
                        type="button"
                        onClick={() => setReadyOnly((on) => !on)}
                        aria-pressed={readyOnly}
                        className={cn(
                            'micro-label inline-flex min-h-11 items-center gap-1.5 border px-2.5',
                            readyOnly ? 'border-warn bg-warn/[0.07] text-warn' : 'border-line-700 text-ink-600 hover:text-ink-400',
                        )}
                    >
                        <Filter size={11} aria-hidden="true" />
                        Only what is ready
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="micro-label" id="materials-sort">Sort</span>
                        <div className="flex" role="group" aria-labelledby="materials-sort">
                            {SORT_ORDER.map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSort(key)}
                                    aria-pressed={sort === key}
                                    className={cn(
                                        'micro-label inline-flex min-h-11 items-center border px-2.5 [&+&]:border-l-0',
                                        sort === key
                                            ? 'border-line-400 bg-steel-700 text-ink-200'
                                            : 'border-line-700 text-ink-600 hover:text-ink-400',
                                    )}
                                >
                                    {MATERIAL_SORTS[key]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
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
                        <span className="micro-label mr-1">{scale.measure}</span>
                        <BandChip active={band === 'all'} onClick={() => setBand('all')}>
                            All · {totals.items.length}
                        </BandChip>
                        {BAND_ORDER.map((key) => (
                            <BandChip key={key} active={band === key} onClick={() => setBand(key)}>
                                {scale.labels[key]} · {bands[key].length}
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
                            const worth = entries.reduce((sum, entry) => sum + (entry.totalValue ?? 0), 0);
                            const isFull = full[key];
                            const capped = isFull && !expanded[key];
                            const visible = capped ? entries.slice(0, TILES_SHOWN) : entries;

                            return (
                                <div key={key} className="flex flex-col gap-2.5">
                                    <Rule
                                        dot={BAND_DOT[key]}
                                        ink={BAND_INK[key]}
                                        label={scale.labels[key]}
                                        note={[
                                            `${entries.length} types`,
                                            `${units} units`,
                                            sort === 'quantity'
                                                ? (key === 'high' ? 'farm these first' : null)
                                                : `worth ${compactEZD(worth)} EZD`,
                                        ].filter(Boolean).join(' · ')}
                                        action={
                                            <DensityToggle
                                                full={isFull}
                                                band={scale.labels[key]}
                                                onToggle={() => setFull((state) => ({ ...state, [key]: !state[key] }))}
                                            />
                                        }
                                    />

                                    {isFull ? (
                                        <>
                                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                                {visible.map((material) => (
                                                    <MaterialTile
                                                        key={material.itemId}
                                                        item={getItemById(material.itemId)}
                                                        material={material}
                                                        sort={sort}
                                                        share={(sortedValue(material, sort) ?? 0) / peak}
                                                        onOpen={() => setOpenItem(material.itemId)}
                                                    />
                                                ))}
                                            </div>
                                            {capped && entries.length > TILES_SHOWN && (
                                                <div className="flex items-center gap-2.5">
                                                    <span className="micro-label text-ink-700">
                                                        {entries.length - TILES_SHOWN} more in {scale.labels[key].toLowerCase()}
                                                    </span>
                                                    <span className="block h-px flex-1 bg-line-900" aria-hidden="true" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpanded((state) => ({ ...state, [key]: true }))}
                                                        className="micro-label min-h-11 text-info hover:text-info-light"
                                                    >
                                                        Show all
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {entries.map((material) => {
                                                const metric = sortedValue(material, sort);
                                                return (
                                                    <button
                                                        key={material.itemId}
                                                        type="button"
                                                        onClick={() => setOpenItem(material.itemId)}
                                                        title={sort === 'quantity' ? undefined : `×${material.quantity}`}
                                                        className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-line-800
                                                                   bg-steel-800 px-2.5 transition-colors hover:border-line-500"
                                                    >
                                                        <span className="truncate text-[11.5px] text-ink-400">
                                                            {getItemById(material.itemId)?.name ?? material.itemId}
                                                        </span>
                                                        <span className={cn('tabular font-mono text-[11px] font-bold', BAND_COUNT_INK[key])}>
                                                            {sort === 'quantity'
                                                                ? material.quantity
                                                                : metric === null ? '—' : compactEZD(metric)}
                                                        </span>
                                                    </button>
                                                );
                                            })}
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

/**
 * Full tiles or compact chips, per band.
 *
 * A command button rather than a pressed toggle: it is labelled with what it will do, not with the
 * state it is in, which is the only way a single control reads unambiguously at this size.
 */
function DensityToggle({ full, band, onToggle }: { full: boolean; band: string; onToggle: () => void }) {
    const Icon = full ? List : LayoutGrid;
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={`Show ${band} as ${full ? 'compact chips' : 'full tiles'}`}
            title={full ? 'Compact' : 'Full'}
            className="micro-label inline-flex min-h-11 flex-none items-center gap-1.5 border border-line-700
                       px-2 text-ink-700 transition-colors hover:border-line-500 hover:text-ink-400"
        >
            <Icon size={11} aria-hidden="true" />
            <span className="hidden sm:inline">{full ? 'Compact' : 'Full'}</span>
        </button>
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

/**
 * The count stays the headline whatever the order is — it is what you have to collect — and the
 * sub-line carries whichever value the list is ranked on, so the ordering is never a mystery.
 */
function MaterialTile({ item, material, sort, share, onOpen }: {
    item: Item | undefined; material: RankedMaterial; sort: MaterialSort; share: number; onOpen: () => void;
}) {
    const { itemId, quantity, unitValue, totalValue } = material;

    const subLine = sort === 'quantity'
        ? item?.subcategory
        : sort === 'unitValue'
            ? (unitValue === null ? 'No price' : `${formatEZD(unitValue)} each`)
            : (totalValue === null ? 'No price' : `${formatEZD(totalValue)} total`);

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
                {subLine && (
                    <span
                        className={cn(
                            'micro-label mb-1.5 mt-1 block truncate',
                            sort !== 'quantity' && unitValue === null ? 'text-ink-800' : 'text-ink-700',
                        )}
                    >
                        {subLine}
                    </span>
                )}
                {/* Bar against the leading item, so the tail of the band reads as a tail. */}
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

'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskProgress } from '@/types/tasks';
import { standingFor } from '../utils/progress';
import { type ChainOwner, ownerFace } from '../utils/vendors';
import { ALL_OWNERS, type OwnerSelection } from '../utils/filters';

/**
 * Who you are working for, and how far in you are with each of them.
 *
 * The bar is task completion, not reputation. Those diverge — a vendor can pay most of their
 * reputation across a handful of late tasks — and "how much of this vendor is left" is the question
 * the rail is scanned for. Reputation is the number beside it, where it can be read rather than
 * estimated from a bar's length.
 *
 * Trupik's pays no reputation and publishes no loyalty tiers, so its row prints neither. That is a
 * fact about the vendor, and showing it as `0/0` would read as missing data.
 */

export interface VendorRailProps {
    owners: ChainOwner[];
    selected: OwnerSelection;
    progress: TaskProgress;
    onSelect: (owner: OwnerSelection) => void;
    /**
     * Matches per owner while a search is running. Null outside search, when the rail shows
     * standing instead — the two answer different questions and never share a row.
     */
    matches?: Map<ChainOwner, number> | null;
}

function VendorMark({ owner, active }: { owner: ChainOwner; active: boolean }) {
    const face = ownerFace(owner);

    return (
        <span
            className={cn(
                'w-8 h-8 flex-none flex items-center justify-center border',
                active ? 'bg-steel-600 border-line-500' : 'bg-steel-700 border-line-700',
            )}
        >
            {face.icon ? (
                <Image
                    src={face.icon}
                    alt=""
                    width={26}
                    height={26}
                    unoptimized
                    className={cn('w-[26px] h-[26px] object-contain', !active && 'opacity-70')}
                />
            ) : (
                <span className={cn('font-mono text-[9px] font-bold tracking-wider', active ? 'text-ink-200' : 'text-ink-600')}>
                    {face.short.slice(0, 3)}
                </span>
            )}
        </span>
    );
}

/**
 * The rail, folded into a strip for the phone.
 *
 * The same seven entries and the same order, with everything that cannot survive a 78px tile
 * dropped: the merchant's name, the loyalty level and the reputation figure. What is left is the
 * mark, the completion bar and the count — which is the question a strip is scanned for. Standing
 * belongs to the chain header underneath, where there is room to print it.
 */
function VendorTile({
    owner,
    active,
    progress,
    matchCount,
    onSelect,
}: {
    owner: ChainOwner;
    active: boolean;
    progress: TaskProgress;
    matchCount: number | null;
    onSelect: (owner: OwnerSelection) => void;
}) {
    const face = ownerFace(owner);
    const standing = standingFor(owner, progress);
    const percent = standing.total > 0 ? (standing.done / standing.total) * 100 : 0;
    const empty = matchCount === 0;

    return (
        <button
            type="button"
            onClick={() => onSelect(owner)}
            aria-current={active ? 'true' : undefined}
            aria-label={face.org}
            className={cn(
                // The active mark is a pseudo-element, so a selected tile is not 2px shorter.
                'relative flex-none w-[78px] h-[78px] flex flex-col items-center justify-center gap-[7px]',
                'px-1.5 border-r border-line-900 transition-colors',
                active
                    ? 'bg-steel-700 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-ember'
                    : 'hover:bg-steel-800',
                empty && 'opacity-40',
            )}
        >
            <VendorMark owner={owner} active={active} />

            {matchCount !== null ? (
                <span className={cn('font-mono text-[9px] tabular leading-none', empty ? 'text-ink-700' : 'text-ink-400')}>
                    {matchCount === 0 ? 'none' : `${matchCount} hit${matchCount === 1 ? '' : 's'}`}
                </span>
            ) : (
                <>
                    <span className="block w-11 h-[3px] bg-track" aria-hidden="true">
                        <span
                            className={cn('block h-[3px]', active ? 'bg-good' : 'bg-line-200')}
                            style={{ width: `${percent}%` }}
                        />
                    </span>
                    <span className={cn('font-mono text-[9px] tabular leading-none', active ? 'text-ink-400' : 'text-ink-700')}>
                        {standing.done}/{standing.total}
                    </span>
                </>
            )}
        </button>
    );
}

export function VendorStrip({ owners, selected, progress, onSelect, matches = null }: VendorRailProps) {
    const strip = useRef<HTMLElement>(null);

    /**
     * Eight tiles do not fit a phone, so the one in force is scrolled to. Without this, opening a
     * shared link to the gunsmith — or the gathered list, which is the last tile — shows a strip
     * with nothing selected in it.
     */
    useEffect(() => {
        strip.current
            ?.querySelector('[aria-current="true"]')
            ?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }, [selected]);

    return (
        <nav
            ref={strip}
            aria-label="Vendors"
            className="bg-steel-900 border border-line-900 flex overflow-x-auto"
        >
            {owners.map((owner) => (
                <VendorTile
                    key={owner}
                    owner={owner}
                    active={selected === owner}
                    progress={progress}
                    matchCount={matches ? matches.get(owner) ?? 0 : null}
                    onSelect={onSelect}
                />
            ))}

            <button
                type="button"
                onClick={() => onSelect(ALL_OWNERS)}
                aria-current={selected === ALL_OWNERS ? 'true' : undefined}
                className={cn(
                    'relative flex-none w-[78px] h-[78px] flex flex-col items-center justify-center gap-2 px-1.5 transition-colors',
                    selected === ALL_OWNERS
                        ? 'bg-steel-700 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-ember'
                        : 'hover:bg-steel-800',
                )}
            >
                <Layers size={17} className={selected === ALL_OWNERS ? 'text-ember' : 'text-ink-700'} />
                <span className={cn('micro-label', selected === ALL_OWNERS && 'text-ink-300')}>Open now</span>
            </button>
        </nav>
    );
}

function VendorRow({
    owner,
    active,
    progress,
    matchCount,
    onSelect,
}: {
    owner: ChainOwner;
    active: boolean;
    progress: TaskProgress;
    matchCount: number | null;
    onSelect: (owner: OwnerSelection) => void;
}) {
    const face = ownerFace(owner);
    const standing = standingFor(owner, progress);
    const percent = standing.total > 0 ? (standing.done / standing.total) * 100 : 0;

    // Search dims vendors it found nothing in, rather than hiding them: a rail that changes length
    // as you type is harder to aim at than one that changes weight.
    const searching = matchCount !== null;
    const empty = searching && matchCount === 0;

    return (
        <button
            type="button"
            onClick={() => onSelect(owner)}
            aria-current={active ? 'true' : undefined}
            className={cn(
                'w-full text-left flex items-start gap-2.5 px-3 py-3 border-b border-line-900 border-l-2 transition-colors',
                active ? 'border-l-ember bg-steel-700' : 'border-l-transparent hover:bg-steel-800',
                empty && 'opacity-40',
            )}
        >
            <VendorMark owner={owner} active={active} />

            <span className="flex-1 min-w-0">
                <span
                    className={cn(
                        'block font-display text-sm font-bold uppercase tracking-wide leading-none truncate',
                        active ? 'text-ink-100' : 'text-ink-300',
                    )}
                >
                    {face.org}
                </span>

                <span className="block font-mono text-[9.5px] tracking-[0.1em] uppercase text-ink-700 mt-1.5 mb-2 truncate">
                    {face.merchant ?? 'Resets daily'}
                    {face.hasReputation && ` · LV ${standing.level}`}
                </span>

                {searching ? (
                    <span className={cn('block font-mono text-[10px] tabular', empty ? 'text-ink-700' : 'text-ink-400')}>
                        {matchCount === 0 ? 'no matches' : `${matchCount} match${matchCount === 1 ? '' : 'es'}`}
                    </span>
                ) : (
                    <>
                        <span className="block h-[3px] bg-track" aria-hidden="true">
                            <span
                                className={cn('block h-[3px]', active ? 'bg-good' : 'bg-line-200')}
                                style={{ width: `${percent}%` }}
                            />
                        </span>
                        <span className="flex justify-between font-mono text-[9.5px] tabular text-ink-700 mt-1.5">
                            <span>{standing.done}/{standing.total} tasks</span>
                            <span>
                                {standing.hasReputation
                                    ? `${standing.reputation}/${standing.reputationMax} rep`
                                    : 'no rep'}
                            </span>
                        </span>
                    </>
                )}
            </span>
        </button>
    );
}

export default function VendorRail({ owners, selected, progress, onSelect, matches = null }: VendorRailProps) {
    return (
        <nav aria-label="Vendors" className="bg-steel-900 border border-line-900 flex flex-col min-h-0">
            <div className="px-3 pt-3 pb-2.5 border-b border-line-900 flex-none">
                <span className="eyebrow">{matches ? 'Vendors · matches' : 'Vendors'}</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {owners.map((owner) => (
                    <VendorRow
                        key={owner}
                        owner={owner}
                        active={selected === owner}
                        progress={progress}
                        matchCount={matches ? matches.get(owner) ?? 0 : null}
                        onSelect={onSelect}
                    />
                ))}
            </div>

            <button
                type="button"
                onClick={() => onSelect(ALL_OWNERS)}
                aria-current={selected === ALL_OWNERS ? 'true' : undefined}
                className={cn(
                    'flex-none flex items-center justify-start gap-2 px-3 py-3 border-t border-line-900 border-l-2 transition-colors',
                    selected === ALL_OWNERS ? 'border-l-ember bg-steel-700' : 'border-l-transparent hover:bg-steel-800',
                )}
            >
                <Layers size={13} className={selected === ALL_OWNERS ? 'text-ember' : 'text-ink-700'} />
                <span className={cn('micro-label', selected === ALL_OWNERS && 'text-ink-300')}>All vendors at once</span>
            </button>
        </nav>
    );
}

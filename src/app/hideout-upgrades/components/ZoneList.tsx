'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatEZD } from '@/lib/trade';
import { UPGRADES, type Zone, type ZoneState, upgradeId } from '../utils/hideout';

/**
 * The phone's way into a zone.
 *
 * At phone width the plate is 195px tall and its pins are 26px — a picture of the hideout rather
 * than a control surface. This list is the tap target: the same zones, the same four states, 56px
 * rows, ready ones first, each carrying the price of its next level so the next thing to do is
 * legible without opening anything.
 */

const ORDER: Record<ZoneState, number> = { ready: 0, room: 1, locked: 2, built: 3 };

const EDGE: Record<ZoneState, string> = {
    ready: 'border-warn',
    built: 'border-line-700',
    locked: 'border-dashed border-line-200',
    room: 'border-info',
};

const STATE_WORDS: Record<ZoneState, string> = {
    ready: 'ready',
    built: 'complete',
    locked: 'locked',
    room: 'room',
};

export interface ZoneListProps {
    zones: Zone[];
    selectedArea: string | null;
    onSelect: (zone: Zone) => void;
    readyFirst: boolean;
    onReadyFirstChange: (readyFirst: boolean) => void;
    roomLabel: string;
}

export default function ZoneList({
    zones, selectedArea, onSelect, readyFirst, onReadyFirstChange, roomLabel,
}: ZoneListProps) {
    const rows = readyFirst
        ? [...zones].sort((a, b) => ORDER[a.state] - ORDER[b.state] || a.name.localeCompare(b.name))
        : zones;

    return (
        <div className="shell:hidden">
            <div className="flex items-center gap-2 px-3.5 py-3">
                <Chip active={readyFirst} onClick={() => onReadyFirstChange(true)}>Ready first</Chip>
                <Chip active={!readyFirst} onClick={() => onReadyFirstChange(false)}>All {zones.length}</Chip>
                <div className="flex-1" />
                <span className="micro-label text-ink-700">{roomLabel}</span>
            </div>

            <ul>
                {rows.map((zone) => {
                    const next = zone.state === 'room' ? null : upgradeId(zone.areaId, zone.level + 1);
                    const price = next ? UPGRADES[next].price : null;

                    return (
                        <li key={zone.areaId}>
                            <button
                                type="button"
                                onClick={() => onSelect(zone)}
                                className={cn(
                                    'flex min-h-14 w-full items-center justify-start gap-3 border-b border-line-900',
                                    'border-l-2 px-3.5 py-2.5 text-left transition-colors',
                                    zone.areaId === selectedArea
                                        ? 'border-l-ember bg-steel-700'
                                        : 'border-l-transparent hover:bg-steel-800',
                                )}
                            >
                                <span className={cn('relative block h-[34px] w-[34px] flex-none border bg-steel-550', EDGE[zone.state])}>
                                    <Image
                                        src={`/images/hideout/${zone.icon}`}
                                        alt=""
                                        fill
                                        sizes="34px"
                                        className={cn(
                                            'object-contain p-1',
                                            zone.state === 'built' && 'opacity-50',
                                            zone.state === 'locked' && 'opacity-30',
                                        )}
                                    />
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-display text-base font-semibold uppercase leading-none text-ink-200">
                                        {zone.name}
                                    </span>
                                    <span className="micro-label mt-1.5 block text-ink-700">
                                        {zone.state === 'room'
                                            ? `${zone.builtCount} of ${zone.max} built`
                                            : zone.state === 'built'
                                                ? `Level ${zone.level} · complete`
                                                : `${zone.level === 0 ? 'Not built' : `Level ${zone.level} of ${zone.max}`} · ${STATE_WORDS[zone.state]}`}
                                    </span>
                                </span>

                                <span className="flex flex-none items-center gap-2">
                                    {price !== null && zone.state === 'ready' && (
                                        <span className="tabular font-mono text-[11px] font-semibold tracking-[0.04em] text-warn">
                                            {formatEZD(price)}
                                        </span>
                                    )}
                                    <ChevronRight size={15} className="text-ink-600" aria-hidden="true" />
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'micro-label inline-flex min-h-11 items-center border px-2',
                active ? 'border-warn bg-warn/[0.07] text-warn' : 'border-line-700 text-ink-600',
            )}
        >
            {children}
        </button>
    );
}

'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight, Lock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAIN_FLOOR, type Zone, type ZoneState, roomName } from '../utils/hideout';

/**
 * Where each pin sits, as a percentage of the plate.
 *
 * Hand-placed against the background image — the game files hold no coordinates for any of this —
 * which is why they live beside the plate they were measured on rather than in `utils/`. They are
 * measurements, not rules.
 */
const AREA_POSITIONS: Record<string, { top: string; left: string }> = {
    // Storage Zone screen
    'None': { top: '7.5%', left: '96.5%' },
    'AreaUpgradeArea': { top: '27.5%', left: '46.5%' },
    'BlackmarketMoreitem': { top: '44.75%', left: '48%' },
    'BlackmarketQuality': { top: '36.75%', left: '58%' },

    // Hideout screen
    'MedicalArea': { top: '51.25%', left: '70%' },
    'KitchenArea': { top: '31.25%', left: '78%' },
    'Lounge': { top: '57.5%', left: '43.25%' },
    'StorageZoneLock1': { top: '9.25%', left: '41.5%' },
    'StorageZoneLock2': { top: '41%', left: '28.5%' },
    'StorageZoneLock3': { top: '81%', left: '29.25%' },
    'StorageZoneLock4': { top: '69.75%', left: '17%' },
    'WorkshopZone': { top: '35%', left: '37.75%' },
    'Gunsmith': { top: '22.75%', left: '33.75%' },
    'RestRoom': { top: '73.5%', left: '65.75%' },
    'WaterCollector': { top: '37.75%', left: '70.75%' },
    'Generator': { top: '17%', left: '56.5%' },
    'ShootingRange': { top: '26.5%', left: '87.75%' },
    'CryptoMining': { top: '8.75%', left: '64%' },
    'GeneratorZone': { top: '27%', left: '63%' },
    // HQ Pad had no entry and landed on the fallback row along the bottom edge. Placed.
    'HQPAD': { top: '52.5%', left: '19.5%' },
    'StorageExpansionStart': { top: '27.5%', left: '45%' },
    'Intelligent': { top: '40%', left: '58%' },
    'RestroomZone': { top: '45.75%', left: '45.5%' },

    // Kitchen Area screen
    'CoffeeMaker': { top: '37%', left: '65.25%' },
    'Refrigerator': { top: '46.25%', left: '72.25%' },
    'MicrowaveOven': { top: '23%', left: '71%' },

    // Medical Area screen
    'OperationBed': { top: '66.25%', left: '67.75%' },
    'Planting': { top: '46.25%', left: '64%' },
    'MedDesk': { top: '39.5%', left: '73.25%' },

    // Lounge screen
    'Sofa': { top: '53%', left: '49%' },
    'Bookcase': { top: '68.5%', left: '45.75%' },
    'TVSet': { top: '45.5%', left: '41.25%' },
};

/**
 * Where a pin sits when nothing has placed it yet.
 *
 * A season that adds areas will always add them before someone has measured them. Defaulting to the
 * centre stacks every such pin on one spot, where only the last one drawn can be clicked; laying
 * them along the bottom edge instead keeps each reachable and makes it obvious which still need
 * placing.
 */
const unplacedPosition = (areaId: string, all: readonly string[]) => {
    const index = Math.max(0, all.indexOf(areaId));
    return { top: '92%', left: `${5 + (index % 16) * 6}%` };
};

/** The four states a pin can be in, before selection is taken into account. */
const PIN_EDGE: Record<ZoneState, string> = {
    ready: 'border-2 border-warn',
    built: 'border border-line-700',
    locked: 'border border-dashed border-line-200',
    room: 'border-2 border-info',
};

const COUNT_INK: Record<ZoneState, string> = {
    ready: 'text-warn',
    built: 'text-good',
    locked: 'text-ink-700',
    room: 'text-info',
};

export interface FloorPlateProps {
    room: string;
    zones: Zone[];
    selectedArea: string | null;
    onSelect: (zone: Zone) => void;
    onReset: () => void;
    /** Hidden until storage has been read, so the plate never flashes a wrong count. */
    hydrated: boolean;
    anyBuilt: boolean;
}

export default function FloorPlate({
    room, zones, selectedArea, onSelect, onReset, hydrated, anyBuilt,
}: FloorPlateProps) {
    const counts = zones.reduce<Record<ZoneState, number>>(
        (acc, zone) => ({ ...acc, [zone.state]: acc[zone.state] + 1 }),
        { ready: 0, built: 0, locked: 0, room: 0 },
    );
    const zoneIds = zones.map((zone) => zone.areaId);

    return (
        <div className="flex flex-col border border-line-800 bg-steel-850 min-h-0">
            <div className="flex h-9 flex-none items-center gap-3 border-b border-line-900 px-3">
                <span className="eyebrow truncate">
                    {room === MAIN_FLOOR ? 'Main floor' : roomName(room)} · {zones.length} zones
                </span>
                <div className="flex-1" />

                <span className="hidden items-center gap-4 shell:flex" aria-hidden="true">
                    <Legend swatch="border-2 border-warn" ink="text-warn" label={`${counts.ready} ready`} />
                    <Legend swatch="bg-good" label={`${counts.built} built`} />
                    <Legend swatch="border border-dashed border-line-200" label={`${counts.locked} locked`} />
                    <Legend swatch="border-2 border-info" label={`${counts.room} rooms`} />
                </span>

                {anyBuilt && (
                    <>
                        <span className="hidden h-4 w-px bg-line-900 shell:block" />
                        <button
                            type="button"
                            onClick={onReset}
                            className="micro-label inline-flex min-h-11 items-center gap-1.5 border border-line-700
                                       px-2 text-ink-700 transition-colors hover:border-line-500 hover:text-ink-400
                                       shell:min-h-0 shell:py-1"
                        >
                            <RotateCcw size={11} aria-hidden="true" />
                            Reset all
                        </button>
                    </>
                )}
            </div>

            {/* The plate is 1024x512, so the stage is 2:1 — a square box with `object-cover` would
                crop half the floor plan away. Pin coordinates are percentages of this box, so they
                are tied to this aspect ratio as much as to the image. */}
            <div className="relative aspect-[2/1] w-full flex-1 overflow-hidden bg-steel-850">
                <div
                    className={cn(
                        'absolute inset-0 transition-transform duration-500',
                        room !== MAIN_FLOOR ? 'scale-110' : 'scale-100',
                    )}
                >
                    <Image
                        src="/images/hideout/Image_bg_SquareBackgroundbg6_4.webp"
                        alt=""
                        fill
                        sizes="(min-width: 900px) 62vw, 100vw"
                        className="object-cover"
                        priority
                    />
                </div>
                <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b
                               from-steel-950/45 via-steel-950/30 to-steel-950/65"
                    aria-hidden="true"
                />
                <span className="pointer-events-none absolute inset-0 opacity-40 plot-grid bg-transparent" aria-hidden="true" />

                {hydrated && zones.map((zone) => {
                    const placed = AREA_POSITIONS[zone.areaId];
                    const position = placed ?? unplacedPosition(zone.areaId, zoneIds);
                    const selected = zone.areaId === selectedArea;

                    return (
                        <button
                            key={zone.areaId}
                            type="button"
                            onClick={() => onSelect(zone)}
                            title={zone.name}
                            style={{ ...position, transform: 'translate(-50%, -50%)' }}
                            className={cn(
                                'absolute block h-[26px] w-[26px] bg-steel-950/85 transition-transform',
                                'hover:scale-110 focus-visible:scale-110 shell:h-11 shell:w-11',
                                placed ? PIN_EDGE[zone.state] : 'border border-dashed border-line-200',
                                selected && 'border-2 border-ember ring-[3px] ring-steel-950 z-10',
                            )}
                        >
                            <Image
                                src={`/images/hideout/${zone.icon}`}
                                alt=""
                                fill
                                sizes="44px"
                                className={cn(
                                    'object-contain p-1 shell:p-[7px]',
                                    zone.state === 'built' && 'opacity-50',
                                    zone.state === 'locked' && 'opacity-30',
                                )}
                            />

                            {/* The corner marks: a task stands in the way, or the zone is finished. */}
                            {zone.taskGated && (
                                <span className="absolute left-px top-px block h-1.5 w-1.5 bg-info" aria-hidden="true" />
                            )}
                            {zone.state === 'built' && (
                                <span
                                    className="absolute -right-px -top-px block h-0 w-0
                                               border-l-[11px] border-t-[11px] border-l-transparent border-t-good"
                                    aria-hidden="true"
                                />
                            )}
                            {zone.state === 'locked' && (
                                <Lock size={9} className="absolute right-0.5 top-0.5 text-ink-700" aria-hidden="true" />
                            )}
                            {zone.state === 'room' && (
                                <ChevronRight size={10} className="absolute right-px top-px text-info" aria-hidden="true" />
                            )}

                            <span
                                className={cn(
                                    'tabular absolute bottom-px right-0.5 hidden font-mono text-[9px] leading-none shell:block',
                                    COUNT_INK[zone.state],
                                )}
                            >
                                {zone.state === 'room'
                                    ? `${zone.builtCount}/${zone.max}`
                                    : zone.state === 'built' ? zone.level : `${zone.level}/${zone.max}`}
                            </span>
                        </button>
                    );
                })}

                <span
                    className="micro-label absolute bottom-2.5 left-3 hidden border border-line-900
                               bg-steel-950/75 px-1.5 py-1 text-ink-700 shell:block"
                >
                    {selectedArea ? 'Pick another zone' : 'Select a zone'}
                </span>

                <span
                    className="absolute bottom-2 right-2.5 flex items-center gap-2 border border-line-900
                               bg-steel-950/75 px-1.5 py-1 shell:hidden"
                    aria-hidden="true"
                >
                    <Legend swatch="border-2 border-warn" ink="text-warn" label={String(counts.ready)} />
                    <Legend swatch="bg-good" label={String(counts.built)} />
                    <Legend swatch="border border-dashed border-line-200" label={String(counts.locked)} />
                </span>
            </div>
        </div>
    );
}

function Legend({ swatch, label, ink }: { swatch: string; label: string; ink?: string }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className={cn('block h-2.5 w-2.5 flex-none', swatch)} />
            <span className={cn('micro-label', ink ?? 'text-ink-600')}>{label}</span>
        </span>
    );
}

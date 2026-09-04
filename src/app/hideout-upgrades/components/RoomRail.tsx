'use client';

import React from 'react';
import { Briefcase, Cross, Home, Sofa, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAIN_FLOOR, type RoomSummary } from '../utils/hideout';

/**
 * The five screens of the hideout, as a rail.
 *
 * Rooms used to exist only as a blue border on a pin: you could enter one, but nothing told you it
 * was there or how much of it was left. The rail names them and carries their progress.
 *
 * One set of elements serves both layouts — 78px tiles scrolled horizontally under the phone's top
 * chrome, wide cards under the plate on desktop — because two DOM trees for one control is how the
 * two drift apart.
 */

const ROOM_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    None: Home,
    Lounge: Sofa,
    MedicalArea: Cross,
    KitchenArea: UtensilsCrossed,
    HQPAD: Briefcase,
};

export interface RoomRailProps {
    rooms: RoomSummary[];
    openRoom: string;
    onOpen: (roomId: string) => void;
    hydrated: boolean;
}

export default function RoomRail({ rooms, openRoom, onOpen, hydrated }: RoomRailProps) {
    return (
        <div
            className="flex overflow-x-auto border-y border-line-900 bg-steel-900
                       shell:grid shell:grid-cols-5 shell:gap-2.5 shell:overflow-visible
                       shell:border-0 shell:bg-transparent"
        >
            {rooms.map((room) => {
                const Icon = ROOM_ICONS[room.id] ?? Home;
                const open = room.id === openRoom;
                const done = hydrated && room.total > 0 && room.built === room.total;

                return (
                    <button
                        key={room.id}
                        type="button"
                        onClick={() => onOpen(room.id)}
                        aria-current={open ? 'true' : undefined}
                        className={cn(
                            'relative w-[78px] flex-none flex-col items-center justify-center gap-2 px-1.5 py-3',
                            'shell:h-[92px] shell:w-auto shell:items-stretch shell:justify-between shell:p-3',
                            'border-line-800 transition-colors shell:border',
                            open
                                ? 'bg-steel-700 shell:border-line-400'
                                : 'bg-transparent hover:bg-steel-800 shell:bg-steel-800',
                            // The one-action rule: the open room is the only ember on the plate half
                            // of the screen. Drawn as a real edge, because colours from
                            // tailwind.config.js are not emitted as --color-* variables, so an
                            // inset box-shadow referencing one renders nothing.
                            open && 'border-b-2 border-b-ember shell:border-b-0 shell:border-l-2 shell:border-l-ember',
                        )}
                    >
                        <span className="flex flex-col items-center gap-2 shell:flex-row shell:gap-2">
                            <Icon size={18} className={open ? 'text-ember' : 'text-ink-600'} />
                            <span
                                className={cn(
                                    'whitespace-nowrap font-display text-[11px] font-semibold uppercase tracking-nav leading-none',
                                    'shell:text-base shell:font-bold',
                                    open ? 'text-ink-100' : 'text-ink-600 shell:text-ink-300',
                                )}
                            >
                                {room.id === MAIN_FLOOR ? 'Main floor' : room.name}
                            </span>
                        </span>

                        <span className="w-full shell:mt-auto">
                            <span
                                className={cn(
                                    'tabular block text-center font-mono text-[9px] leading-none tracking-[0.08em]',
                                    'shell:text-left shell:text-[9.5px]',
                                    done ? 'text-good' : open ? 'text-ink-400' : 'text-ink-700',
                                )}
                            >
                                {hydrated ? `${room.built}/${room.total}` : `—/${room.total}`}
                                <span className="hidden shell:inline"> built</span>
                            </span>
                            <span className="mt-1.5 hidden h-[3px] w-full bg-track shell:block">
                                <span
                                    className={cn('block h-[3px]', done ? 'bg-good' : 'bg-good/80')}
                                    style={{ width: hydrated ? `${(room.built / room.total) * 100}%` : '0%' }}
                                />
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskState } from '@/types/tasks';
import { laneX, rowTextX } from '../utils/chain';
import { getTaskTypeIcon } from '../utils/taskText';

/**
 * One task in a chain.
 *
 * The marker carries the state and the row carries the name, which is why the name is not colour-
 * coded beyond its weight: at 13px, "done" reads faster as a struck-through line than as a hue.
 *
 * The marker sits at its lane's centre, on the same coordinates the spine draws — a branch row is
 * indented because its marker moved, not because the text was padded by hand.
 */

export interface ChainRowProps {
    task: Task;
    state: TaskState;
    lane: number;
    /** Position in the chain, 1-based. Null where the group is a list rather than a sequence. */
    position: number | null;
    isNext: boolean;
    isSelected: boolean;
    /** Row height: 38 on the desktop, 44 on a phone, where the row is a thumb target. */
    rowH: number;
    onSelect: (taskId: string) => void;
}

/**
 * The four shapes the filter bar's key names. Exported because the search results draw the same
 * ones — a task must not change shape depending on which list it turns up in.
 */
export function TaskMarker({ state, isNext }: { state: TaskState; isNext: boolean }) {
    if (state === 'completed') return <span className="block w-[9px] h-[9px] bg-good" />;
    if (isNext) return <span className="block w-3 h-3 border-2 border-ember" />;
    if (state === 'open') return <span className="block w-[9px] h-[9px] border border-line-200" />;
    return <span className="block w-2 h-2 border border-line-400" />;
}

export default function ChainRow({
    task, state, lane, position, isNext, isSelected, rowH, onSelect,
}: ChainRowProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(task.id)}
            aria-current={isSelected ? 'true' : undefined}
            style={{ height: rowH, paddingLeft: rowTextX(lane) }}
            className={cn(
                'relative w-full text-left flex items-center gap-2.5 pr-3 transition-colors',
                // The selected edge is a pseudo-element rather than a border, which would shift the
                // row, or an inset shadow, which cannot reach a Tailwind colour from a JS config.
                isSelected
                    ? 'bg-steel-700 before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-ember'
                    : 'hover:bg-steel-800',
            )}
        >
            <span
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
                style={{ left: laneX(lane) }}
                aria-hidden="true"
            >
                <TaskMarker state={state} isNext={isNext} />
            </span>

            {position !== null && (
                <span
                    className={cn(
                        'font-mono text-[10px] tabular flex-none w-[19px]',
                        isNext ? 'text-ember-soft' : 'text-ink-700',
                    )}
                >
                    {String(position).padStart(2, '0')}
                </span>
            )}

            <span
                className={cn(
                    'flex-1 min-w-0 truncate text-[13px]',
                    state === 'completed' && 'text-ink-600 line-through decoration-line-500',
                    state === 'open' && (isNext ? 'font-semibold text-ink-hi' : 'text-ink-300'),
                    state === 'locked' && 'text-ink-700',
                )}
            >
                {task.name}
            </span>

            <span className="flex items-center gap-1.5 flex-none">
                <span className={cn('flex items-center gap-1', state === 'locked' ? 'text-ink-800' : 'text-ink-600')}>
                    {task.type.slice(0, 2).map((type) => (
                        <React.Fragment key={type}>{getTaskTypeIcon(type, 11)}</React.Fragment>
                    ))}
                </span>
                <span
                    className={cn(
                        'inline-flex items-center gap-1 font-mono text-[9px] leading-none px-1.5 py-1 border',
                        state === 'locked' ? 'border-line-800 text-ink-800' : 'border-line-700 text-ink-600',
                    )}
                >
                    <MapPin size={9} />
                    {task.map[0]}
                </span>
            </span>
        </button>
    );
}

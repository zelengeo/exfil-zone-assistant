'use client';

import React from 'react';
import { MapPin, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Task, TaskProgress } from '@/types/tasks';
import { locate } from '../utils/chain';
import { stateOf } from '../utils/progress';
import { type ChainOwner, ownerFace } from '../utils/vendors';
import { highlightMatch } from '../utils/taskText';
import { TaskMarker } from './ChainRow';

/**
 * The chain column's other face: tasks gathered from every vendor instead of one vendor's sequence.
 *
 * Two questions land here. Search — "where does this word appear" — and the rail's last entry,
 * "what can I do right now", which the single-chain view cannot answer with seven vendors on the
 * books. Both produce the same shape: a flat list, grouped by vendor, with each task's position in
 * its own chain still printed, because losing that is the one thing that would make a result
 * useless — you would find the task and not know where it sits.
 *
 * A result row is two lines, not one. The second carries the line that matched, with the term
 * picked out; most matches are in an objective, and a list of names alone cannot say why.
 */

export interface SearchGroup {
    owner: ChainOwner;
    tasks: Task[];
}

export interface SearchResultsProps {
    title: string;
    /** The line under the title: how many tasks, across how many vendors. */
    summary: string;
    groups: SearchGroup[];
    progress: TaskProgress;
    /** Task ids that are next up in their chain, so a result keeps the marker it has in the column. */
    nextUp: Set<string>;
    /** The search term. Empty in the open-now view, where nothing is being matched. */
    query: string;
    selectedTaskId?: string;
    onSelect: (taskId: string) => void;
    onBack: () => void;
    backLabel: string;
    empty: string;
}

/** The line a result is shown for: the objective the term was found in, or the first one. */
function matchedLine(task: Task, query: string): string | null {
    const term = query.trim().toLowerCase();
    if (term) {
        const hit = task.objectives.find((objective) => objective.toLowerCase().includes(term));
        if (hit) return hit;
    }
    return task.objectives[0] ?? null;
}

function ResultRow({
    task, progress, nextUp, query, isSelected, onSelect,
}: {
    task: Task;
    progress: TaskProgress;
    nextUp: Set<string>;
    query: string;
    isSelected: boolean;
    onSelect: (taskId: string) => void;
}) {
    const state = stateOf(task, progress);
    const found = locate(task.id);
    const line = matchedLine(task, query);

    return (
        <button
            type="button"
            onClick={() => onSelect(task.id)}
            aria-current={isSelected ? 'true' : undefined}
            className={cn(
                'relative w-full h-[52px] flex items-center justify-start gap-2.5 pl-3 pr-3 text-left transition-colors',
                isSelected
                    ? 'bg-steel-700 before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-ember'
                    : 'hover:bg-steel-800',
            )}
        >
            <span className="flex-none flex items-center justify-center w-3">
                <TaskMarker state={state} isNext={nextUp.has(task.id)} />
            </span>

            <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                    {found && (
                        <span className="font-mono text-[10px] tabular text-ink-700 flex-none">
                            {String(found.node.index + 1).padStart(2, '0')}
                        </span>
                    )}
                    <span className={cn(
                        'flex-1 min-w-0 truncate text-[12.5px]',
                        state === 'completed' ? 'text-ink-600 line-through decoration-line-500' : 'text-ink-300',
                    )}>
                        {query ? highlightMatch(task.name, query) : task.name}
                    </span>
                    <span className="hidden shell:inline-flex items-center gap-1 flex-none font-mono text-[9px] leading-none px-1.5 py-1 border border-line-700 text-ink-600">
                        <MapPin size={9} />
                        {task.map[0]}
                    </span>
                </span>
                {line && (
                    <span className="block truncate text-[11px] text-ink-700 mt-1.5">
                        {query ? highlightMatch(line, query) : line}
                    </span>
                )}
            </span>
        </button>
    );
}

export default function SearchResults({
    title, summary, groups, progress, nextUp, query, selectedTaskId, onSelect, onBack, backLabel, empty,
}: SearchResultsProps) {
    return (
        <div className="flex flex-col min-h-0">
            <div className="flex-none flex items-center justify-between gap-3 px-3 py-2.5 border-b border-line-900">
                <div className="min-w-0">
                    <div className="font-display text-[15px] font-bold uppercase tracking-wide text-ink-100 leading-none">
                        {title}
                    </div>
                    <div className="micro-label mt-1.5 truncate">{summary}</div>
                </div>
                <Button variant="quiet" size="micro" onClick={onBack} className="flex-none">
                    <Undo2 />
                    {backLabel}
                </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {groups.length === 0 && (
                    <p className="px-3 py-6 text-center text-sm text-ink-700">{empty}</p>
                )}

                {groups.map(({ owner, tasks }) => {
                    const face = ownerFace(owner);
                    return (
                        <section key={owner}>
                            <div className="sticky top-0 z-10 h-7 flex items-center gap-2 px-3 bg-steel-850 border-y border-line-900">
                                <span className="w-4 h-4 flex-none flex items-center justify-center bg-steel-700 border border-line-700 font-display text-[6px] font-bold tracking-wide text-ink-600">
                                    {face.short.slice(0, 3)}
                                </span>
                                <span className="micro-label flex-1 truncate">{face.org}</span>
                                <span className="font-mono text-[9px] tabular text-ink-700">{tasks.length}</span>
                            </div>
                            <ul>
                                {tasks.map((task) => (
                                    <li key={task.id}>
                                        <ResultRow
                                            task={task}
                                            progress={progress}
                                            nextUp={nextUp}
                                            query={query}
                                            isSelected={task.id === selectedTaskId}
                                            onSelect={onSelect}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}

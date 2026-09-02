'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, Filter, MapPin, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { tasksData } from '@/data/tasks';
import type { Task, TaskMap } from '@/types/tasks';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { buildChains } from '../utils/chain';
import { canComplete, countsFor, isDone, nextUpIn, stateOf } from '../utils/progress';
import { populatedOwners, tasksForOwner, type ChainOwner } from '../utils/vendors';
import {
    ALL_OWNERS,
    TASK_MAPS,
    TASK_TYPES,
    type OwnerSelection,
    type TaskFilters,
    matchesFilters,
    parseFilters,
    serializeFilters,
} from '../utils/filters';
import VendorRail from './VendorRail';

/**
 * The tasks route: 227 contracts across seven vendors, read as chains rather than as a list.
 *
 * Three columns, and each answers a different question. The rail is "who am I working for"; the
 * chain is "what is this vendor's sequence and where am I in it"; the pane is "what does this one
 * ask of me". Status is the spine's shape rather than a set of tabs — there is no filtering by
 * "available" because the position in the chain already says it.
 *
 * Everything except the player's own progress lives in the URL, so a chain someone is looking at is
 * a link they can send.
 */

const MAP_LABELS: Record<TaskMap, string> = {
    suburb: 'Suburb',
    resort: 'Resort',
    dam: 'Dam',
    metro: 'Metro',
    smuggling: 'Smuggling',
    any: 'Any map',
};

export default function TasksPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { progress, hydrated, setDone } = useTaskProgress();

    const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

    // The search box is local and debounced into the URL: typing should not push a history entry
    // per keystroke.
    const [searchDraft, setSearchDraft] = useState(filters.search);
    const debouncedSearch = useDebounce(searchDraft, 200);

    const write = useCallback(
        (next: TaskFilters) => {
            const query = serializeFilters(next);
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        },
        [pathname, router],
    );

    const update = useCallback(
        (patch: Partial<TaskFilters>) => write({ ...filters, ...patch }),
        [filters, write],
    );

    useEffect(() => {
        if (debouncedSearch !== filters.search) update({ search: debouncedSearch });
        // Only the debounced value should drive this, not every filter change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const owners = useMemo(() => populatedOwners(), []);

    /**
     * With no vendor named, open on one with work outstanding rather than always on the first.
     * Regiment's chain is gated behind ARK, so on a fresh save it has nothing open at all — landing
     * there would show a wall of locked rows and no way to tell that from a bug.
     */
    const autoOwner = useMemo(
        () => owners.find((owner) => countsFor(tasksForOwner(owner), progress).open > 0) ?? owners[0],
        [owners, progress],
    );

    const selection: OwnerSelection = filters.owner === '' ? autoOwner : filters.owner;
    const viewingAll = selection === ALL_OWNERS || filters.search !== '';

    /** Chain order, flattened. The spine that draws it arrives with the chain column. */
    const ordered = useMemo((): Task[] => {
        const source = viewingAll ? owners : [selection as ChainOwner];
        return source.flatMap((owner) =>
            buildChains(owner).chains.flatMap((chain) => chain.nodes.map((node) => tasksData[node.taskId])),
        );
    }, [viewingAll, owners, selection]);

    const listed = useMemo(
        () => ordered.filter((task) => (
            matchesFilters(task, filters) && !(filters.hideDone && isDone(progress, task.id))
        )),
        [ordered, filters, progress],
    );

    /** Matches per vendor, for the rail's search face. */
    const matches = useMemo(() => {
        if (!filters.search) return null;
        const counts = new Map<ChainOwner, number>();
        for (const owner of owners) {
            counts.set(owner, tasksForOwner(owner).filter((task) => matchesFilters(task, filters)).length);
        }
        return counts;
    }, [filters, owners]);

    /** The chain's next open task, which is what the pane opens on when nothing is named. */
    const nextUp = useMemo(() => {
        if (viewingAll) return null;
        const [chain] = buildChains(selection as ChainOwner).chains;
        return chain ? nextUpIn(chain, progress) : null;
    }, [viewingAll, selection, progress]);

    const selectedTask =
        (filters.task && tasksData[filters.task])
        || (nextUp ? tasksData[nextUp] : undefined)
        || listed[0];

    const campaign = useMemo(() => {
        const all = Object.values(tasksData);
        return { done: all.filter((task) => isDone(progress, task.id)).length, total: all.length };
    }, [progress]);

    const vendorCount = owners.filter((owner) => owner !== 'daily').length;

    // Picking a vendor drops the selected task with it — it belonged to the chain you just left.
    const selectOwner = useCallback(
        (owner: OwnerSelection) => update({ owner, task: '' }),
        [update],
    );

    const clearSearch = useCallback(() => {
        setSearchDraft('');
        update({ search: '' });
    }, [update]);

    return (
        <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex flex-col shell:flex-row shell:items-end gap-4 shell:gap-5">
                <div className="flex-1 min-w-0">
                    <span className="eyebrow">
                        Operations · {campaign.total} contracts · {vendorCount} vendors
                    </span>
                    <h1 className="mt-2 font-display text-3xl shell:text-4xl font-extrabold uppercase tracking-tight text-ink-hi leading-none">
                        Task chains
                    </h1>
                </div>

                <div className="flex items-center gap-2 h-9 px-3 bg-steel-750 border border-line-600 focus-within:border-ember shell:w-72 flex-none">
                    <Search size={15} className="text-ink-700 flex-none" />
                    <input
                        type="search"
                        value={searchDraft}
                        onChange={(event) => setSearchDraft(event.target.value)}
                        placeholder="Search tasks & objectives"
                        aria-label="Search tasks and objectives"
                        className="flex-1 min-w-0 bg-transparent border-0 p-0 min-h-0 font-mono text-[11px] text-ink-100 placeholder:text-ink-700 focus:outline-none"
                    />
                    {searchDraft && (
                        <button type="button" onClick={clearSearch} aria-label="Clear search" className="text-ink-600 hover:text-ink-200">
                            <X size={13} />
                        </button>
                    )}
                </div>

                <div className="flex-none shell:text-right">
                    <span className="micro-label">Campaign</span>
                    <div className="font-display tabular text-2xl font-bold text-ink-100 leading-none mt-1.5 mb-1.5">
                        {campaign.done}<span className="text-ink-700">/{campaign.total}</span>
                    </div>
                    <div className="h-[3px] w-full shell:w-[186px] bg-track" aria-hidden="true">
                        <div
                            className="h-[3px] bg-good"
                            style={{ width: `${campaign.total ? (campaign.done / campaign.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2 py-2 border-y border-line-900">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="quiet" size="micro" aria-label="Filter by map">
                            <MapPin />
                            Map: {filters.map === 'all' ? 'all' : MAP_LABELS[filters.map]}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuRadioGroup
                            value={filters.map}
                            onValueChange={(value) => update({ map: value as TaskFilters['map'] })}
                        >
                            <DropdownMenuRadioItem value="all">All maps</DropdownMenuRadioItem>
                            {TASK_MAPS.map((map) => (
                                <DropdownMenuRadioItem key={map} value={map}>{MAP_LABELS[map]}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="quiet" size="micro" aria-label="Filter by task type">
                            <Filter />
                            Type: {filters.type}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuRadioGroup
                            value={filters.type}
                            onValueChange={(value) => update({ type: value as TaskFilters['type'] })}
                        >
                            <DropdownMenuRadioItem value="all">All types</DropdownMenuRadioItem>
                            {TASK_TYPES.map((type) => (
                                <DropdownMenuRadioItem key={type} value={type} className="capitalize">{type}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="quiet"
                    size="micro"
                    aria-pressed={filters.hideDone}
                    onClick={() => update({ hideDone: !filters.hideDone })}
                    className={cn(filters.hideDone && 'border-line-400 text-ink-200 bg-steel-700')}
                >
                    <Check />
                    Hide completed
                </Button>

                {filters.search && (
                    <span className="micro-label text-ink-500 ml-1">
                        {listed.length} match{listed.length === 1 ? '' : 'es'} in names and objectives
                    </span>
                )}

                <div className="flex-1" />

                <span className="hidden shell:flex items-center gap-4" aria-hidden="true">
                    <span className="flex items-center gap-1.5">
                        <span className="w-[9px] h-[9px] bg-good block flex-none" />
                        <span className="micro-label">Done</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-ember block flex-none" />
                        <span className="micro-label text-ember-soft">Next up</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 border border-line-400 block flex-none" />
                        <span className="micro-label">Locked</span>
                    </span>
                </span>
            </div>

            {/* Three panes */}
            <div className="grid grid-cols-1 shell:grid-cols-[244px_372px_1fr] gap-3 items-start">
                <div className="shell:sticky shell:top-4 shell:max-h-[calc(100vh-2rem)] flex flex-col min-h-0">
                    <VendorRail
                        owners={owners}
                        selected={selection}
                        progress={progress}
                        onSelect={selectOwner}
                        matches={matches}
                    />
                </div>

                {/* Chain column — the spine and its branches replace this list next. */}
                <div className="bg-steel-900 border border-line-900 flex flex-col min-h-0 shell:sticky shell:top-4 shell:max-h-[calc(100vh-2rem)]">
                    <div className="px-3 py-2.5 border-b border-line-900 flex-none">
                        <span className="eyebrow">{viewingAll ? 'All vendors' : 'Chain'}</span>
                        <div className="micro-label mt-1.5">{listed.length} shown</div>
                    </div>
                    <ul className="flex-1 min-h-0 overflow-y-auto">
                        {listed.map((task) => {
                            const state = stateOf(task, progress);
                            const isNext = task.id === nextUp;
                            return (
                                <li key={task.id}>
                                    <button
                                        type="button"
                                        onClick={() => update({ task: task.id })}
                                        className={cn(
                                            'w-full text-left flex items-center gap-2 px-3 h-[38px] transition-colors hover:bg-steel-800',
                                            selectedTask?.id === task.id && 'bg-steel-700 shadow-[inset_2px_0_0_var(--color-ember)]',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'w-[9px] h-[9px] flex-none block',
                                                state === 'completed' && 'bg-good',
                                                state === 'open' && (isNext ? 'border-2 border-ember' : 'border border-line-400'),
                                                state === 'locked' && 'border border-line-400',
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                'flex-1 min-w-0 truncate text-[13px]',
                                                state === 'completed' && 'text-ink-600 line-through decoration-line-500',
                                                state === 'open' && 'text-ink-hi font-semibold',
                                                state === 'locked' && 'text-ink-700',
                                            )}
                                        >
                                            {task.name}
                                        </span>
                                        <span className="micro-label flex-none">{task.map[0]}</span>
                                    </button>
                                </li>
                            );
                        })}
                        {listed.length === 0 && (
                            <li className="px-3 py-6 text-center text-sm text-ink-700">Nothing matches those filters.</li>
                        )}
                    </ul>
                </div>

                {/* Detail pane — objectives, rewards, guides and gates land here next. */}
                <div className="bg-steel-800 border border-line-800 min-h-0">
                    {selectedTask ? (
                        <div className="p-4 shell:p-5">
                            <span className="micro-label">
                                {selectedTask.objectives.length} objective{selectedTask.objectives.length === 1 ? '' : 's'}
                                {selectedTask.type.length > 0 && ` · ${selectedTask.type.join(', ')}`}
                            </span>
                            <h2 className="mt-3 font-display text-2xl shell:text-3xl font-extrabold uppercase tracking-tight text-ink-hi leading-none">
                                {selectedTask.name}
                            </h2>
                            <p className="mt-3 text-[13px] leading-relaxed text-ink-400 max-w-[70ch]">
                                {selectedTask.description}
                            </p>

                            <ul className="mt-5 flex flex-col gap-2">
                                {selectedTask.objectives.map((objective, index) => (
                                    <li key={index} className="flex items-start gap-2.5 text-[13px] text-ink-300">
                                        <span className="w-4 h-4 mt-0.5 flex-none border border-line-800 block" />
                                        <span>{objective}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 pt-4 border-t border-line-900 flex items-center gap-3">
                                <Button
                                    variant="ember"
                                    size="micro"
                                    className="h-11 px-5"
                                    disabled={!hydrated || !canComplete(selectedTask, progress)}
                                    onClick={() => setDone(selectedTask, !isDone(progress, selectedTask.id))}
                                >
                                    <Check />
                                    {isDone(progress, selectedTask.id) ? 'Mark incomplete' : 'Mark complete'}
                                </Button>
                                <span className="micro-label">
                                    {stateOf(selectedTask, progress) === 'locked'
                                        ? 'Locked · finish its prerequisites first'
                                        : stateOf(selectedTask, progress)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-ink-700">Pick a task from the chain.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

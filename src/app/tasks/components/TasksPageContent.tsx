'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';
import {ArrowLeft, Check, Filter, MapPin, Search, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useDebounce} from '@/hooks/useDebounce';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {loadedTasks} from '@/services/TaskService';
import {useFetchTasks} from '@/hooks/useFetchTasks';
import type {Task, TaskMap} from '@/types/tasks';
import {useTaskProgress} from '../hooks/useTaskProgress';
import {buildChains} from '../utils/chain';
import {countsFor, isDone, nextUpIn, stateOf} from '../utils/progress';
import {ownerFace, ownerOf, populatedOwners, tasksForOwner, type ChainOwner} from '../utils/vendors';
import {
    ALL_OWNERS,
    TASK_MAPS,
    TASK_TYPES,
    type OwnerSelection,
    type TaskFilters,
    isNarrowed,
    matchesFilters,
    parseFilters,
    serializeFilters,
} from '../utils/filters';
import ChainColumn from './ChainColumn';
import NextUpCard from './NextUpCard';
import SearchResults, {type SearchGroup} from './SearchResults';
import TaskDetailPane from './TaskDetailPane';
import VendorRail, {VendorStrip} from './VendorRail';

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
    // Suspends until the task database lands. Every chain, filter and count below reads it
    // synchronously, so this is the one place the route waits.
    useFetchTasks();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const {progress, hydrated, setDone, toggleObjective} = useTaskProgress();

    const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

    // The search box is local and debounced into the URL: typing should not push a history entry
    // per keystroke.
    const [searchDraft, setSearchDraft] = useState(filters.search);
    const debouncedSearch = useDebounce(searchDraft, 200);

    /**
     * Filters are written straight to the history entry rather than through `router.replace`.
     *
     * The App Router treats a replace to the bare pathname as a no-op, so clearing the last filter
     * left both the URL and the view where they were — "back to chain" did nothing at all from
     * `?vendor=all`. `history.replaceState` is integrated with the router in Next 15+ and drives
     * `useSearchParams`, and on a static page it also avoids an RSC round trip per keystroke.
     */
    const write = useCallback(
        (next: TaskFilters) => {
            const query = serializeFilters(next);
            window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname);
        },
        [pathname],
    );

    const update = useCallback(
        (patch: Partial<TaskFilters>) => write({...filters, ...patch}),
        [filters, write],
    );

    useEffect(() => {
        if (debouncedSearch !== filters.search) update({search: debouncedSearch});
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

    /** The owners on screen, and their tasks in chain order. */
    const shownOwners = useMemo(
        (): ChainOwner[] => (viewingAll ? owners : [selection as ChainOwner]),
        [viewingAll, owners, selection],
    );

    const ordered = useMemo((): Task[] => shownOwners.flatMap((owner) =>
        buildChains(owner).chains.flatMap((chain) => chain.nodes.map((node) => loadedTasks()[node.taskId])),
    ), [shownOwners]);

    const listed = useMemo(
        () => ordered.filter((task) => (
            matchesFilters(task, filters) && !(filters.hideDone && isDone(progress, task.id))
        )),
        [ordered, filters, progress],
    );

    /**
     * What the chain column may draw. Null while nothing is narrowing the view, which is what lets
     * a chain collapse its locked tail — under a filter every surviving row has to stay put.
     */
    const visible = useMemo(
        () => (isNarrowed(filters) ? new Set(listed.map((task) => task.id)) : null),
        [filters, listed],
    );

    /** Vendors with nothing left after the filter drop out of the column, not out of the rail. */
    const columnOwners = useMemo(
        () => (visible ? shownOwners.filter((owner) => tasksForOwner(owner).some((task) => visible.has(task.id))) : shownOwners),
        [shownOwners, visible],
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

    /**
     * Whether the middle column is showing a chain or a gathered list.
     *
     * Two different questions arrive at the same shape: a search, and the rail's last entry. The
     * open-now view narrows to what is reachable, because "every task from every vendor" is 227
     * rows and answers nothing the chain column does not answer better.
     */
    const gathered = filters.search !== '' ? 'search' : (selection === ALL_OWNERS ? 'open' : null);

    const groups = useMemo((): SearchGroup[] => {
        if (!gathered) return [];
        const source = gathered === 'open'
            ? listed.filter((task) => stateOf(task, progress) === 'open')
            : listed;

        // `listed` already runs in rail order, so the groups come out in the rail's order too.
        const byOwner = new Map<ChainOwner, Task[]>();
        for (const task of source) {
            const owner = ownerOf(task);
            const bucket = byOwner.get(owner);
            if (bucket) bucket.push(task);
            else byOwner.set(owner, [task]);
        }
        return [...byOwner.entries()].map(([owner, tasks]) => ({owner, tasks}));
    }, [gathered, listed, progress]);

    /** Every chain's next-up task, so a gathered row keeps the marker it has in its own column. */
    const nextUpIds = useMemo(() => {
        const ids = new Set<string>();
        for (const owner of owners) {
            if (!ownerFace(owner).hasChain) continue;
            for (const chain of buildChains(owner).chains) {
                const id = nextUpIn(chain, progress);
                if (id) ids.add(id);
            }
        }
        return ids;
    }, [owners, progress]);

    /**
     * The vendor's next open task, which is what the pane opens on when nothing is named and what
     * the phone's card carries. Chains are searched in order: four vendors run more than one, and a
     * finished first chain must not leave the vendor looking as though it had no work left.
     */
    const nextUp = useMemo(() => {
        if (viewingAll) return null;
        for (const chain of buildChains(selection as ChainOwner).chains) {
            const id = nextUpIn(chain, progress);
            if (id) return id;
        }
        return null;
    }, [viewingAll, selection, progress]);

    const selectedTask =
        (filters.task && loadedTasks()[filters.task])
        || (nextUp ? loadedTasks()[nextUp] : undefined)
        || listed[0];

    const campaign = useMemo(() => {
        const all = Object.values(loadedTasks());
        return {done: all.filter((task) => isDone(progress, task.id)).length, total: all.length};
    }, [progress]);

    const vendorCount = owners.filter((owner) => owner !== 'daily').length;

    // Picking a vendor drops the selected task with it — it belonged to the chain you just left.
    const selectOwner = useCallback(
        (owner: OwnerSelection) => update({owner, task: ''}),
        [update],
    );

    const selectTask = useCallback((task: string) => update({task}), [update]);

    /**
     * Recording work pins the pane to that task.
     *
     * With nothing named in the URL the pane follows the chain's next-up task — so finishing it
     * would move next-up on and swap the pane out from under the tick that was just made, with no
     * chance to see it land or undo it. Acting on a task selects it.
     */
    const pin = useCallback((task: Task) => {
        if (!filters.task) update({task: task.id});
    }, [filters.task, update]);

    const markDone = useCallback((task: Task, done: boolean) => {
        setDone(task, done);
        pin(task);
    }, [setDone, pin]);

    const tickObjective = useCallback((task: Task, index: number) => {
        toggleObjective(task, index);
        pin(task);
    }, [toggleObjective, pin]);

    const clearSearch = useCallback(() => {
        setSearchDraft('');
        update({search: ''});
    }, [update]);

    /** Out of the gathered list and back to a single vendor's sequence. */
    const backToChain = useCallback(() => {
        setSearchDraft('');
        update({search: '', owner: filters.owner === ALL_OWNERS ? '' : filters.owner});
    }, [filters.owner, update]);

    /**
     * The phone shows one thing at a time, and a named task is what turns the chain into a briefing.
     *
     * `?task=` therefore doubles as the phone's "which screen am I on": the same URL that seats the
     * pane beside the chain on a desktop opens the briefing on a phone, so a link someone sends
     * lands on the same task either way, and Back is a state change rather than a second history
     * entry to get wrong.
     */
    const mobileDetail = filters.task !== '';

    const closeTask = useCallback(() => update({task: ''}), [update]);

    /**
     * The task the phone opens on. Only a sequence has a next contract — the dailies are all
     * available at once, so they get the list and no card.
     */
    const cardTask = !viewingAll && nextUp && ownerFace(selection as ChainOwner).hasChain
        ? loadedTasks()[nextUp]
        : undefined;

    return (
        <div className="flex flex-col gap-3">
            {/* Header. On a phone the campaign figure moves up beside the title and the search box
                takes the whole of the next line, rather than three stacked blocks of chrome. */}
            <div className={cn(
                'flex-wrap items-end gap-3 shell:gap-5 shell:flex',
                mobileDetail ? 'hidden' : 'flex',
            )}>
                <div className="flex-1 min-w-0 order-1">
                    <span className="eyebrow">
                        Operations · {campaign.total} contracts · {vendorCount} vendors
                    </span>
                    <h1 className="mt-2 font-display text-2xl shell:text-4xl font-extrabold uppercase tracking-tight text-ink-hi leading-none">
                        Task chains
                    </h1>
                </div>

                <div
                    className="order-3 shell:order-2 w-full shell:w-72 flex items-center gap-2 h-9 px-3 bg-steel-750 border border-line-600 focus-within:border-ember flex-none">
                    <Search size={15} className="text-ink-700 flex-none"/>
                    <input
                        type="search"
                        value={searchDraft}
                        onChange={(event) => setSearchDraft(event.target.value)}
                        placeholder="Search tasks & objectives"
                        aria-label="Search tasks and objectives"
                        className="flex-1 min-w-0 bg-transparent border-0 p-0 min-h-0 font-mono text-[11px] text-ink-100 placeholder:text-ink-700 focus:outline-none"
                    />
                    {searchDraft && (
                        <button type="button" onClick={clearSearch} aria-label="Clear search"
                                className="text-ink-600 hover:text-ink-200">
                            <X size={13}/>
                        </button>
                    )}
                </div>

                <div className="order-2 shell:order-3 flex-none text-right">
                    <span className="micro-label">Campaign</span>
                    <div className="font-display tabular text-2xl font-bold text-ink-100 leading-none mt-1.5 mb-1.5">
                        {campaign.done}<span className="text-ink-700">/{campaign.total}</span>
                    </div>
                    <div className="h-[3px] w-[120px] shell:w-[186px] bg-track" aria-hidden="true">
                        <div
                            className="h-[3px] bg-good"
                            style={{width: `${campaign.total ? (campaign.done / campaign.total) * 100 : 0}%`}}
                        />
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            <div className={cn(
                'flex-wrap items-center gap-2 py-2 border-y border-line-900 shell:flex',
                mobileDetail ? 'hidden' : 'flex',
            )}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="quiet" size="micro" aria-label="Filter by map">
                            <MapPin/>
                            Map: {filters.map === 'all' ? 'all' : MAP_LABELS[filters.map]}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuRadioGroup
                            value={filters.map}
                            onValueChange={(value) => update({map: value as TaskFilters['map']})}
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
                            <Filter/>
                            Type: {filters.type}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuRadioGroup
                            value={filters.type}
                            onValueChange={(value) => update({type: value as TaskFilters['type']})}
                        >
                            <DropdownMenuRadioItem value="all">All types</DropdownMenuRadioItem>
                            {TASK_TYPES.map((type) => (
                                <DropdownMenuRadioItem key={type} value={type}
                                                       className="capitalize">{type}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="quiet"
                    size="micro"
                    aria-pressed={filters.hideDone}
                    onClick={() => update({hideDone: !filters.hideDone})}
                    className={cn(filters.hideDone && 'border-line-400 text-ink-200 bg-steel-700')}
                >
                    <Check/>
                    Hide completed
                </Button>

                {filters.search && (
                    <span className="micro-label text-ink-500 ml-1">
                        {listed.length} match{listed.length === 1 ? '' : 'es'} in names and objectives
                    </span>
                )}

                <div className="flex-1"/>

                <span className="hidden shell:flex items-center gap-4" aria-hidden="true">
                    <span className="flex items-center gap-1.5">
                        <span className="w-[9px] h-[9px] bg-good block flex-none"/>
                        <span className="micro-label">Done</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-ember block flex-none"/>
                        <span className="micro-label text-ember-soft">Next up</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 border border-line-400 block flex-none"/>
                        <span className="micro-label">Locked</span>
                    </span>
                </span>
            </div>

            {/*
              * Three panes side by side, one pane at a time on a phone.
              *
              * The split is the same information in both places, not a cut-down version of it: the
              * rail folds into a strip, the chain keeps every row, and the pane becomes a screen of
              * its own that `?task=` switches to. A hidden grid child takes no track, so the desktop
              * layout is unaffected by what the phone adds.
              */}
            <div className="grid grid-cols-1 shell:grid-cols-[244px_372px_1fr] gap-3 items-start">
                <div
                    className="hidden shell:flex shell:sticky shell:top-4 shell:max-h-[calc(100vh-2rem)] flex-col min-h-0">
                    <VendorRail
                        owners={owners}
                        selected={selection}
                        progress={progress}
                        onSelect={selectOwner}
                        matches={matches}
                    />
                </div>

                <div className={cn('shell:hidden', mobileDetail && 'hidden')}>
                    <VendorStrip
                        owners={owners}
                        selected={selection}
                        progress={progress}
                        onSelect={selectOwner}
                        matches={matches}
                    />
                </div>

                {cardTask && (
                    <div className={cn('shell:hidden', mobileDetail && 'hidden')}>
                        <NextUpCard
                            task={cardTask}
                            progress={progress}
                            hydrated={hydrated}
                            onOpen={selectTask}
                            onSetDone={setDone}
                        />
                    </div>
                )}

                {/* Chain column, or the gathered list that replaces it */}
                <div className={cn(
                    'bg-steel-900 border border-line-900 flex-col min-h-0 shell:flex',
                    'shell:sticky shell:top-4 shell:max-h-[calc(100vh-2rem)]',
                    mobileDetail ? 'hidden' : 'flex',
                )}>
                    {gathered ? (
                        <SearchResults
                            title={gathered === 'search' ? 'Results' : 'Open now'}
                            summary={
                                `${groups.reduce((total, group) => total + group.tasks.length, 0)} tasks`
                                + ` · ${groups.length} vendor${groups.length === 1 ? '' : 's'}`
                            }
                            groups={groups}
                            progress={progress}
                            nextUp={nextUpIds}
                            query={filters.search}
                            selectedTaskId={selectedTask?.id}
                            onSelect={selectTask}
                            onBack={backToChain}
                            backLabel="Back to chain"
                            empty={gathered === 'search'
                                ? 'Nothing matches that search.'
                                : 'Nothing is open. Every vendor is waiting on a prerequisite.'}
                        />
                    ) : (
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            {columnOwners.map((owner) => (
                                <ChainColumn
                                    key={owner}
                                    owner={owner}
                                    progress={progress}
                                    visible={visible}
                                    selectedTaskId={selectedTask?.id}
                                    onSelect={selectTask}
                                />
                            ))}
                            {listed.length === 0 && (
                                <p className="px-3 py-6 text-center text-sm text-ink-700">Nothing matches those
                                    filters.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Detail pane, and on a phone the screen a task opens into */}
                <div className={cn(
                    'min-h-0 shell:sticky shell:top-4 shell:max-h-[calc(100vh-2rem)] flex-col gap-2 shell:flex',
                    mobileDetail ? 'flex' : 'hidden',
                )}>
                    {mobileDetail && (
                        <button
                            type="button"
                            onClick={closeTask}
                            // `justify-start` is not redundant: the base stylesheet centres buttons.
                            className="shell:hidden h-11 flex items-center justify-start gap-2 px-3 bg-steel-900 border border-line-900 text-left"
                        >
                            <ArrowLeft size={14} className="text-ink-600 flex-none"/>
                            <span className="micro-label">
                                {gathered ? 'Back to the list' : 'Back to the chain'}
                            </span>
                        </button>
                    )}

                    {selectedTask ? (
                        <TaskDetailPane
                            task={selectedTask}
                            progress={progress}
                            hydrated={hydrated}
                            onToggleObjective={tickObjective}
                            onSetDone={markDone}
                            onSelectTask={selectTask}
                        />
                    ) : (
                        <div className="bg-steel-800 border border-line-800 p-8 text-center text-sm text-ink-700">
                            Pick a task from the chain.
                        </div>
                    )}
                </div>
            </div>

            {/*
              * The old route offered a correction form on every task card, which sent a report into
              * a queue nobody was reading. The honest version is one line: the prerequisite graph is
              * the part still being verified, and Discord is where a wrong edge gets fixed.
              */}
            <p className="micro-label text-ink-800 pt-1">
                <Link
                    href="https://discord.gg/2FCDZK6C25"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info hover:text-info-pale underline"
                >
                    report anything wrong on Discord
                </Link>
                ㅤor viaㅤ
                <Link href="/feedback" target="_blank"
                      rel="noopener noreferrer"
                      className="text-info hover:text-info-pale underline">
                    Feedback
                </Link>
            </p>
        </div>
    );
}

import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { Task, TaskMap, TaskType } from '@/types/tasks';
import { OWNER_ORDER, type ChainOwner } from './vendors';

/**
 * The route's state, and its URL spelling.
 *
 * Which vendor, which task, and how the list is narrowed all live in the query string — the same
 * arrangement the items route uses. A chain someone is looking at is then a link they can send,
 * back and forward work, and there is no second copy of the selection to keep in sync. Only the
 * player's own progress lives outside it, in storage, because it is not part of the view.
 */

/** Every map a task can name, `any` included — it is a real value in the data, not a placeholder. */
export const TASK_MAPS: readonly TaskMap[] = ['suburb', 'resort', 'dam', 'metro', 'smuggling', 'any'];

export const TASK_TYPES: readonly TaskType[] = [
    'reach', 'extract', 'retrieve', 'eliminate', 'submit',
    'mark', 'place', 'photo', 'signal', 'gunsmith',
];

export interface TaskFilters {
    /** Selected rail entry. Empty means "the route picks" — the vendor with work outstanding. */
    owner: ChainOwner | '';
    /** Task shown in the detail pane. Empty means the selected chain's next-up task. */
    task: string;
    /** Searches names and objectives. A non-empty query swaps the chain column for results. */
    search: string;
    map: TaskMap | 'all';
    type: TaskType | 'all';
    hideDone: boolean;
}

export const DEFAULT_FILTERS: TaskFilters = {
    owner: '',
    task: '',
    search: '',
    map: 'all',
    type: 'all',
    hideDone: false,
};

export function parseFilters(params: ReadonlyURLSearchParams | URLSearchParams): TaskFilters {
    const owner = params.get('vendor');
    const map = params.get('map');
    const type = params.get('type');

    return {
        owner: OWNER_ORDER.find((key) => key === owner) ?? '',
        task: params.get('task') ?? '',
        search: params.get('q') ?? '',
        map: TASK_MAPS.find((value) => value === map) ?? 'all',
        type: TASK_TYPES.find((value) => value === type) ?? 'all',
        hideDone: params.get('hide') === 'done',
    };
}

/** Only non-default values are written, so a plain `/tasks` stays a plain URL. */
export function serializeFilters(filters: TaskFilters): string {
    const params = new URLSearchParams();
    if (filters.owner) params.set('vendor', filters.owner);
    if (filters.task) params.set('task', filters.task);
    if (filters.search) params.set('q', filters.search);
    if (filters.map !== 'all') params.set('map', filters.map);
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.hideDone) params.set('hide', 'done');
    return params.toString();
}

/** Whether anything beyond the vendor selection is narrowing what is shown. */
export function isNarrowed(filters: TaskFilters): boolean {
    return filters.search !== '' || filters.map !== 'all' || filters.type !== 'all' || filters.hideDone;
}

/**
 * Whether a task survives the filter bar. Progress-free — `hideDone` needs a player's record, so
 * the caller applies that one alongside this.
 *
 * A map filter keeps tasks tagged `any` as well as tasks tagged with that map: "what can I do on
 * Resort" is answered by both, and dropping the map-agnostic ones would hide 30 of them.
 */
export function matchesFilters(task: Task, filters: TaskFilters): boolean {
    if (filters.map !== 'all' && !task.map.includes(filters.map) && !task.map.includes('any')) {
        return false;
    }

    if (filters.type !== 'all' && !task.type.includes(filters.type)) {
        return false;
    }

    const query = filters.search.trim().toLowerCase();
    if (query) {
        const inName = task.name.toLowerCase().includes(query);
        const inObjectives = task.objectives.some((objective) => objective.toLowerCase().includes(query));
        if (!inName && !inObjectives) return false;
    }

    return true;
}

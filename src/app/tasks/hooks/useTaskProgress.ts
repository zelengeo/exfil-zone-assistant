'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { StorageService } from '@/services/StorageService';
import type { Task, TaskProgress } from '@/types/tasks';
import { EMPTY_PROGRESS, setDone as applyDone, toggleObjective as applyObjective } from '../utils/progress';

/**
 * The player's progress — one store, read from `localStorage` once and written back as it changes.
 *
 * A module-level store rather than component state because the route reads progress in three places
 * at once: the vendor rail counts it, the chain column paints every row from it, and the detail pane
 * acts on it. Sharing one external store keeps them in step without threading a value and a setter
 * through the tree, and without a context whose every write re-renders the whole page.
 *
 * `useSyncExternalStore` is also what makes the hydration honest. The server has no storage, so it
 * renders `hydrated: false` and an empty record; the client's first snapshot reads storage and
 * re-renders. Callers use `hydrated` to tell "nothing done yet" from "not read yet" — the difference
 * between a legitimately empty chain and a flash of one.
 */

interface ProgressSnapshot {
    progress: TaskProgress;
    hydrated: boolean;
}

/** Referentially stable, so `useSyncExternalStore` does not see a new value on every render. */
const SERVER_SNAPSHOT: ProgressSnapshot = { progress: EMPTY_PROGRESS, hydrated: false };

let snapshot: ProgressSnapshot | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): ProgressSnapshot {
    if (snapshot === null) {
        snapshot = { progress: StorageService.getTaskProgress(), hydrated: true };
    }
    return snapshot;
}

function getServerSnapshot(): ProgressSnapshot {
    return SERVER_SNAPSHOT;
}

function subscribe(onChange: () => void): () => void {
    listeners.add(onChange);
    return () => { listeners.delete(onChange); };
}

function write(next: TaskProgress): void {
    snapshot = { progress: next, hydrated: true };
    try {
        StorageService.setTaskProgress(next);
    } catch {
        // A full or disabled store must not take the route down with it: the session keeps working
        // from memory and the next write gets another go.
    }
    listeners.forEach((listener) => listener());
}

export interface UseTaskProgress {
    progress: TaskProgress;
    /** False until storage has been read on the client. */
    hydrated: boolean;
    setDone: (task: Task, done: boolean) => void;
    toggleObjective: (task: Task, index: number) => void;
    reset: () => void;
}

export function useTaskProgress(): UseTaskProgress {
    const { progress, hydrated } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setDone = useCallback((task: Task, done: boolean) => {
        write(applyDone(getSnapshot().progress, task, done));
    }, []);

    const toggleObjective = useCallback((task: Task, index: number) => {
        write(applyObjective(getSnapshot().progress, task, index));
    }, []);

    const reset = useCallback(() => write(EMPTY_PROGRESS), []);

    return { progress, hydrated, setDone, toggleObjective, reset };
}

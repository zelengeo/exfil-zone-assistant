'use client';

/**
 * The player's own builds, kept in localStorage.
 *
 * A build is a plan, not progress: it survives a wipe (see `StorageService.PRESERVE_ON_WIPE`) and
 * it never leaves the browser.
 *
 * localStorage is an external store, so it is read through `useSyncExternalStore` rather than
 * copied into state by an effect. That keeps the server render and the first client render
 * agreeing on an empty list — `localStorage` does not exist on the server — and it means a build
 * saved in one tab shows up in the others, since the browser's own `storage` event is one of the
 * subscriptions.
 */

import { useCallback, useSyncExternalStore } from 'react';
import type { SavedBuild } from '@/types/gunsmith';
import { StorageService } from '@/services/StorageService';

export interface SavedBuildsState {
    builds: SavedBuild[];
    /** False during the server render and the hydrating one, so the rail does not flash "empty". */
    ready: boolean;
    save: (build: Omit<SavedBuild, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => SavedBuild;
    remove: (id: string) => void;
}

const EMPTY: SavedBuild[] = [];

/** The snapshot has to be reference-stable between reads or `useSyncExternalStore` will loop. */
let snapshot: SavedBuild[] | null = null;
const listeners = new Set<() => void>();

function emit(): void {
    for (const listener of listeners) listener();
}

function onStorageEvent(): void {
    snapshot = null;
    emit();
}

function subscribe(listener: () => void): () => void {
    if (listeners.size === 0) window.addEventListener('storage', onStorageEvent);
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('storage', onStorageEvent);
    };
}

function getSnapshot(): SavedBuild[] {
    if (!snapshot) snapshot = StorageService.getBuilds();
    return snapshot;
}

function getServerSnapshot(): SavedBuild[] {
    return EMPTY;
}

function write(next: SavedBuild[]): void {
    snapshot = next;
    StorageService.setBuilds(next);
    emit();
}

const newId = (): string =>
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `build-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);

export function useSavedBuilds(): SavedBuildsState {
    const builds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const ready = useSyncExternalStore(subscribe, () => true, () => false);

    const save = useCallback<SavedBuildsState['save']>((draft) => {
        const current = getSnapshot();
        const now = new Date().toISOString();
        const existing = draft.id ? current.find((build) => build.id === draft.id) : undefined;
        const saved: SavedBuild = {
            ...draft,
            id: existing?.id ?? draft.id ?? newId(),
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        };
        write(existing
            ? current.map((build) => (build.id === saved.id ? saved : build))
            : [saved, ...current]);
        return saved;
    }, []);

    const remove = useCallback((id: string) => {
        write(getSnapshot().filter((build) => build.id !== id));
    }, []);

    return { builds, ready, save, remove };
}

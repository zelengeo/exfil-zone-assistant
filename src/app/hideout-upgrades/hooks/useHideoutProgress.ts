'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { StorageService } from '@/services/StorageService';
import { type Built, type UpgradeId, isUpgradeId } from '../utils/hideout';

/**
 * What the player has built — one store, read from `localStorage` once and written back as it
 * changes.
 *
 * A module-level store rather than component state because the route reads progress in four places
 * at once: the plate paints every pin from it, the room rail counts it, the zone pane acts on it,
 * and the materials list is entirely derived from it. One external store keeps them in step without
 * threading a value and a setter through the tree.
 *
 * It is also what makes hydration honest. The route is statically generated and the server has no
 * storage, so the first render returns an empty set with `hydrated: false`; the client's first
 * snapshot reads storage and re-renders. Callers use `hydrated` to tell "nothing built yet" from
 * "not read yet" — the difference between an empty hideout and a flash of one. The route this
 * replaced read storage in a `useEffect` and called `setState` from it, which is both the wrong
 * shape for SSR and the only lint error the route had.
 *
 * This is the same arrangement as `useTaskProgress`, `useSavedBuilds` and `useDensity`.
 */

interface Snapshot {
    built: Built;
    hydrated: boolean;
}

const EMPTY: Built = new Set<UpgradeId>();

/** Referentially stable, so `useSyncExternalStore` does not see a new value on every render. */
const SERVER_SNAPSHOT: Snapshot = { built: EMPTY, hydrated: false };

let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

/**
 * Storage is a text file the player can edit, and an id that has left the database survives a game
 * version. Anything that is not a live upgrade id is dropped rather than carried into the rules.
 */
function read(): Built {
    try {
        return new Set((StorageService.getHideout() ?? []).filter(isUpgradeId));
    } catch {
        return EMPTY;
    }
}

function getSnapshot(): Snapshot {
    if (snapshot === null) snapshot = { built: read(), hydrated: true };
    return snapshot;
}

function getServerSnapshot(): Snapshot {
    return SERVER_SNAPSHOT;
}

function subscribe(onChange: () => void): () => void {
    listeners.add(onChange);
    return () => { listeners.delete(onChange); };
}

function write(next: Built): void {
    snapshot = { built: next, hydrated: true };
    try {
        StorageService.setHideout([...next]);
    } catch {
        // A full or disabled store must not take the route down with it: the session keeps working
        // from memory and the next write gets another go.
    }
    listeners.forEach((listener) => listener());
}

export interface UseHideoutProgress {
    built: Built;
    /** False until storage has been read on the client. */
    hydrated: boolean;
    setBuilt: (id: UpgradeId, built: boolean) => void;
    reset: () => void;
}

export function useHideoutProgress(): UseHideoutProgress {
    const { built, hydrated } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setBuilt = useCallback((id: UpgradeId, isBuilt: boolean) => {
        const next = new Set(getSnapshot().built);
        if (isBuilt) next.add(id); else next.delete(id);
        write(next);
    }, []);

    const reset = useCallback(() => write(EMPTY), []);

    return { built, hydrated, setBuilt, reset };
}

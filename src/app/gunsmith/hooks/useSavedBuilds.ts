'use client';

/**
 * The player's own builds, kept in localStorage.
 *
 * A build is a plan, not progress: it survives a wipe (see `StorageService.PRESERVE_ON_WIPE`) and
 * it never leaves the browser. Reads are deferred to an effect rather than done during render,
 * because this route is server-rendered first and `localStorage` does not exist there.
 */

import { useCallback, useEffect, useState } from 'react';
import type { SavedBuild } from '@/types/gunsmith';
import { StorageService } from '@/services/StorageService';

export interface SavedBuildsState {
    builds: SavedBuild[];
    /** False until the first read from storage lands, so the rail does not flash "no builds". */
    ready: boolean;
    save: (build: Omit<SavedBuild, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => SavedBuild;
    remove: (id: string) => void;
}

const newId = (): string =>
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `build-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);

export function useSavedBuilds(): SavedBuildsState {
    const [builds, setBuilds] = useState<SavedBuild[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setBuilds(StorageService.getBuilds());
        setReady(true);
    }, []);

    const persist = useCallback((next: SavedBuild[]) => {
        setBuilds(next);
        StorageService.setBuilds(next);
    }, []);

    const save = useCallback<SavedBuildsState['save']>((draft) => {
        const now = new Date().toISOString();
        const existing = draft.id ? builds.find((build) => build.id === draft.id) : undefined;
        const saved: SavedBuild = {
            ...draft,
            id: existing?.id ?? draft.id ?? newId(),
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        };
        persist(existing
            ? builds.map((build) => (build.id === saved.id ? saved : build))
            : [saved, ...builds]);
        return saved;
    }, [builds, persist]);

    const remove = useCallback((id: string) => {
        persist(builds.filter((build) => build.id !== id));
    }, [builds, persist]);

    return { builds, ready, save, remove };
}

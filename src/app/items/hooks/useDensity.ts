'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Density } from '@/app/items/utils/filters';

/**
 * Grid or table, remembered per browser.
 *
 * Density is a viewing preference rather than a description of the list, so unlike the filters it
 * stays out of the URL — a link someone shares should not impose their layout taste on the reader.
 *
 * Read through `useSyncExternalStore` rather than an effect: the server has no `localStorage`, so
 * the server snapshot is the default and the client's stored value is picked up on hydration
 * without a second render pass or a flash of the wrong layout.
 */

const KEY = 'items:density';
const DEFAULT: Density = 'grid';

let cached: Density | null = null;
const listeners = new Set<() => void>();

function read(): Density {
    if (cached !== null) return cached;
    try {
        const stored = window.localStorage.getItem(KEY);
        cached = stored === 'grid' || stored === 'table' ? stored : DEFAULT;
    } catch {
        // Private mode, or storage disabled. The default is fine.
        cached = DEFAULT;
    }
    return cached;
}

function subscribe(onChange: () => void): () => void {
    listeners.add(onChange);
    return () => {
        listeners.delete(onChange);
    };
}

function write(density: Density): void {
    cached = density;
    try {
        window.localStorage.setItem(KEY, density);
    } catch {
        // Not worth telling anyone about; the choice still holds for this session.
    }
    listeners.forEach((listener) => listener());
}

export function useDensity(): [Density, (density: Density) => void] {
    const density = useSyncExternalStore(subscribe, read, () => DEFAULT);
    const setDensity = useCallback((next: Density) => write(next), []);
    return [density, setDensity];
}

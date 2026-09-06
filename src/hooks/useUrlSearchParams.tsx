'use client';

import { Suspense, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());
const subscribe = (listener: () => void) => {
    listeners.add(listener);
    window.addEventListener('popstate', listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('popstate', listener);
    };
};
const getSnapshot = () => window.location.search;
const getServerSnapshot = () => '';

// Keep Next's query subscription inside its own boundary. The content can prerender the
// unfiltered view, then read the actual URL after hydration without duplicating filter state.
function Observer() {
    const params = useSearchParams();
    useEffect(notify, [params]);
    return null;
}

export function UrlSearchParamsObserver() {
    return <Suspense fallback={null}><Observer /></Suspense>;
}

export function useUrlSearchParams() {
    const query = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return useMemo(() => new URLSearchParams(query), [query]);
}

const subscribeHydration = () => () => {};
export function useHydrated() {
    return useSyncExternalStore(subscribeHydration, () => true, () => false);
}

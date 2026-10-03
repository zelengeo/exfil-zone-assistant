'use client';

import {useSyncExternalStore} from 'react';
import {StorageService, cookiePreferencesSchema, type CookiePreferences} from '@/services/StorageService';

interface PreferenceSnapshot {
    preferences: CookiePreferences | null;
    hydrated: boolean;
    /** Once injected, SDK scripts outlive React; keep their route tracking mounted. */
    analyticsInitialized: boolean;
}

const SERVER_SNAPSHOT: PreferenceSnapshot = {
    preferences: null,
    hydrated: false,
    analyticsInitialized: false,
};
let snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let unsubscribeStorage: (() => void) | undefined;
let deniedForSession = false;

function refresh(): void {
    const stored = StorageService.getCookieConsent();
    const preferences = deniedForSession && stored ? {...stored, analytics: false} : stored;
    snapshot = {
        preferences,
        hydrated: true,
        analyticsInitialized: snapshot.analyticsInitialized || preferences?.analytics === true,
    };
    listeners.forEach(listener => listener());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    if (!unsubscribeStorage) {
        unsubscribeStorage = StorageService.subscribeCookieConsent(() => {
            deniedForSession = false;
            refresh();
        });
        // Read only after hydration, including changes while there were no subscribers.
        refresh();
    }
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            unsubscribeStorage?.();
            unsubscribeStorage = undefined;
        }
    };
}

function save(preferences: CookiePreferences): void {
    const validated = cookiePreferencesSchema.parse(preferences);
    try {
        StorageService.setCookieConsent(JSON.stringify(validated));
        deniedForSession = false;
        refresh();
    } catch {
        // A failed revocation must still stop collection in this tab. A failed opt-in stays off.
        deniedForSession = true;
        snapshot = {...snapshot, preferences: {...validated, analytics: false}, hydrated: true};
        listeners.forEach(listener => listener());
    }
    try {
        StorageService.setCookieConsentDate(new Date().toISOString());
    } catch {
        // The timestamp is not the collection decision.
    }
}

/** Read at send time, not from a render closure or only from a queued storage event. */
export function isAnalyticsEnabled(): boolean {
    return snapshot.hydrated && snapshot.preferences?.analytics === true
        && StorageService.getCookieConsent()?.analytics === true;
}

export function filterAnalyticsEvent<T>(event: T): T | null {
    return isAnalyticsEnabled() ? event : null;
}

export const cookiePreferencesStore = {
    subscribe,
    getSnapshot: () => snapshot,
    getServerSnapshot: () => SERVER_SNAPSHOT,
    save,
};

export function useCookiePreferences() {
    const state = useSyncExternalStore(subscribe, cookiePreferencesStore.getSnapshot,
        cookiePreferencesStore.getServerSnapshot);
    return {...state, savePreferences: save};
}

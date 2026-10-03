import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const track = vi.hoisted(() => vi.fn());
vi.mock('@vercel/analytics', () => ({track}));

const optIn = {essential: true, analytics: true, thirdParty: false};
const optOut = {...optIn, analytics: false};
let storage: Storage;
let events: EventTarget;
let cleanup: (() => void)[];

beforeEach(() => {
    vi.resetModules();
    track.mockClear();
    const values = new Map<string, string>();
    storage = {
        get length() {return values.size;},
        key: index => [...values.keys()][index] ?? null,
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => {values.set(key, value);},
        removeItem: key => {values.delete(key);},
        clear: () => values.clear(),
    };
    events = new EventTarget();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', {
        localStorage: storage,
        addEventListener: events.addEventListener.bind(events),
        removeEventListener: events.removeEventListener.bind(events),
    });
    cleanup = [];
});

afterEach(() => {
    cleanup.forEach(unsubscribe => unsubscribe());
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function storageChanged(key: string | null = 'cookie-consent', storageArea = storage) {
    const event = new Event('storage');
    Object.assign(event, {key, storageArea});
    events.dispatchEvent(event);
}

async function loadStore() {
    const preferences = await import('./useCookiePreferences');
    cleanup.push(preferences.cookiePreferencesStore.subscribe(vi.fn()));
    return preferences;
}

describe('analytics preference contract', () => {
    it('keeps SSR and initial hydration off without reading storage', async () => {
        storage.setItem('cookie-consent', JSON.stringify(optIn));
        const read = vi.spyOn(storage, 'getItem');
        const {cookiePreferencesStore: store, isAnalyticsEnabled} = await import('./useCookiePreferences');
        expect(store.getSnapshot()).toEqual(store.getServerSnapshot());
        expect(store.getServerSnapshot().hydrated).toBe(false);
        expect(isAnalyticsEnabled()).toBe(false);
        expect(read).not.toHaveBeenCalled();
        cleanup.push(store.subscribe(vi.fn()));
        expect(isAnalyticsEnabled()).toBe(true);
        expect(store.getServerSnapshot().hydrated).toBe(false);
    });

    it.each([null, '{', 'null', '[]', '{}', '{"analytics":true}',
        '{"essential":true,"analytics":"true","thirdParty":false}', JSON.stringify(optOut)])(
        'defaults off for missing, malformed or rejected consent: %s', async value => {
            if (value !== null) storage.setItem('cookie-consent', value);
            const {filterAnalyticsEvent, isAnalyticsEnabled} = await loadStore();
            expect(isAnalyticsEnabled()).toBe(false);
            expect(filterAnalyticsEvent({type: 'pageview'})).toBeNull();
            expect(filterAnalyticsEvent({type: 'vital'})).toBeNull();
            expect(filterAnalyticsEvent({type: 'event'})).toBeNull();
        });

    it('accepts and revokes immediately, preserves unrelated storage, and keeps SDKs initialized', async () => {
        storage.setItem('exfilzone-tasks', 'progress');
        storage.setItem('unrelated', 'value');
        const {cookiePreferencesStore: store, filterAnalyticsEvent} = await loadStore();
        const event = {type: 'event'};
        store.save(optIn);
        expect(filterAnalyticsEvent(event)).toBe(event);
        expect(JSON.parse(storage.getItem('cookie-consent')!)).toEqual(optIn);
        expect(storage.getItem('cookie-consent-date')).toBeTruthy();
        store.save(optOut);
        expect(filterAnalyticsEvent(event)).toBeNull();
        expect(store.getSnapshot().analyticsInitialized).toBe(true);
        expect(storage.getItem('exfilzone-tasks')).toBe('progress');
        expect(storage.getItem('unrelated')).toBe('value');
    });

    it('honors cross-tab updates, removals and clear, and ignores unrelated events', async () => {
        const {cookiePreferencesStore: store, isAnalyticsEnabled} = await loadStore();
        storage.setItem('cookie-consent', JSON.stringify(optIn));
        const before = store.getSnapshot();
        storageChanged('unrelated');
        expect(store.getSnapshot()).toBe(before);
        storageChanged();
        expect(isAnalyticsEnabled()).toBe(true);
        storage.setItem('cookie-consent', '{');
        // Even before the storage event is delivered, the installed filter fails closed.
        expect(isAnalyticsEnabled()).toBe(false);
        storageChanged();
        expect(store.getSnapshot().preferences).toBeNull();
        storage.setItem('cookie-consent', JSON.stringify(optIn));
        storageChanged();
        expect(isAnalyticsEnabled()).toBe(true);
        storage.removeItem('cookie-consent');
        storageChanged();
        expect(isAnalyticsEnabled()).toBe(false);
        store.save(optIn);
        storage.clear();
        storageChanged(null);
        expect(isAnalyticsEnabled()).toBe(false);
    });

    it('notifies for same-tab StorageService writes and resets', async () => {
        const {cookiePreferencesStore: store, isAnalyticsEnabled} = await loadStore();
        const {StorageService} = await import('@/services/StorageService');
        StorageService.setCookieConsent(JSON.stringify(optIn));
        expect(isAnalyticsEnabled()).toBe(true);
        StorageService.clearAllData();
        expect(store.getSnapshot().preferences).toBeNull();
        expect(isAnalyticsEnabled()).toBe(false);
    });

    it('fails closed when storage cannot be read or written', async () => {
        const {cookiePreferencesStore: store, isAnalyticsEnabled} = await loadStore();
        const write = vi.spyOn(storage, 'setItem').mockImplementation(() => {throw new Error('quota');});
        store.save(optIn);
        expect(isAnalyticsEnabled()).toBe(false);
        write.mockRestore();
        store.save(optIn);
        expect(isAnalyticsEnabled()).toBe(true);
        vi.spyOn(storage, 'setItem').mockImplementation(() => {throw new Error('quota');});
        store.save(optOut);
        expect(isAnalyticsEnabled()).toBe(false);
        cleanup.forEach(unsubscribe => unsubscribe());
        cleanup.push(store.subscribe(vi.fn()));
        expect(isAnalyticsEnabled()).toBe(false);
        vi.spyOn(storage, 'getItem').mockImplementation(() => {throw new Error('denied');});
        storageChanged();
        expect(isAnalyticsEnabled()).toBe(false);
    });

    it('does not disable valid consent when only the timestamp write fails', async () => {
        const {cookiePreferencesStore: store, isAnalyticsEnabled} = await loadStore();
        const write = storage.setItem;
        vi.spyOn(storage, 'setItem').mockImplementation((key, value) => {
            if (key === 'cookie-consent-date') throw new Error('quota');
            write(key, value);
        });
        store.save(optIn);
        expect(isAnalyticsEnabled()).toBe(true);
    });

    it('never queues custom events without consent, including after revocation', async () => {
        const {cookiePreferencesStore: store} = await loadStore();
        const {trackAnalyticsEvent} = await import('@/lib/analytics');
        trackAnalyticsEvent('test');
        expect(track).not.toHaveBeenCalled();
        store.save(optIn);
        trackAnalyticsEvent('test', {count: 1});
        expect(track).toHaveBeenCalledExactlyOnceWith('test', {count: 1});
        store.save(optOut);
        trackAnalyticsEvent('test');
        expect(track).toHaveBeenCalledTimes(1);
    });
});

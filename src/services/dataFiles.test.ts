import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadDataFile } from './dataFiles';
import { clearItemsCache, fetchItemsData } from './ItemService';
import dataAssets from './generated/data-assets.json';

afterEach(() => {
    clearItemsCache();
    vi.unstubAllGlobals();
});

describe('versioned data loading', () => {
    it('reads the same published catalogue on the server', async () => {
        const catalogue = await loadDataFile<unknown[]>('catalogue.json');
        expect(catalogue.length).toBeGreaterThan(0);
        expect(JSON.stringify(catalogue)).toContain('/assets/items/');
        expect(JSON.stringify(catalogue)).not.toContain('/images/items/');
    });

    it('makes one browser request for concurrent catalogue consumers and reuses the cache', async () => {
        vi.stubGlobal('window', {});
        const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify([
            { id: 'test', name: 'Test', category: 'misc', images: {}, stats: {} },
        ])));
        vi.stubGlobal('fetch', fetch);
        const [first, second] = await Promise.all([fetchItemsData(), fetchItemsData()]);
        await fetchItemsData();
        expect(first.items).toEqual(second.items);
        expect(fetch).toHaveBeenCalledExactlyOnceWith(dataAssets['catalogue.json']);
    });

    it('does not cache a failed request and permits a subsequent retry', async () => {
        vi.stubGlobal('window', {});
        const fetch = vi.fn()
            .mockResolvedValueOnce(new Response('', { status: 503 }))
            .mockResolvedValueOnce(new Response(JSON.stringify([
                { id: 'test', name: 'Test', category: 'misc', images: {}, stats: {} },
            ])));
        vi.stubGlobal('fetch', fetch);
        await expect(fetchItemsData()).rejects.toThrow('503');
        expect((await fetchItemsData()).items).toHaveLength(1);
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('rejects unlisted filenames instead of fetching arbitrary paths', async () => {
        vi.stubGlobal('window', {});
        const fetch = vi.fn();
        vi.stubGlobal('fetch', fetch);
        await expect(loadDataFile('../private.json')).rejects.toThrow('Unknown data asset');
        await expect(loadDataFile('toString')).rejects.toThrow('Unknown data asset');
        expect(fetch).not.toHaveBeenCalled();
    });
});

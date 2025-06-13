import {fetchItemsData, ItemCache} from '@/services/ItemService';
import { Item } from '@/types/items';

// In-memory cache to avoid redundant fetches
let itemsCache: Item[] | null = null;
let itemsMap: Map<string, Item> | null = null;
let fetchPromise: Promise<ItemCache> | null = null;
let fetchError: Error | null = null; // To store and re-throw errors

function getItemsAsync(): Promise<ItemCache> {
    if (itemsCache) {
        return Promise.resolve({items: itemsCache, itemMap: itemsMap!});
    }

    if (fetchError) {
        return Promise.reject(fetchError);
    }

    if (!fetchPromise) {
        fetchPromise = fetchItemsData()
            .then(data => {
                itemsCache = data.items;
                itemsMap = data.itemMap;
                fetchPromise = null; // Clear promise on success
                fetchError = null;
                return data;
            })
            .catch(error => {
                fetchError = error; // Store error
                fetchPromise = null; // Clear promise on error
                throw error; // Re-throw to propagate
            });
    }
    return fetchPromise;
}

function getItemById(id: string): Item | undefined {
        return itemsMap?.get(id);

}

export function useFetchItems(): { items: Item[], getItemById: (id: string) => Item | undefined } {
    if (itemsCache) {
        return { items: itemsCache, getItemById };
    }

    if (fetchError) {
        throw fetchError; // Re-throw stored error
    }

    // If items are not in cache and no error, throw the promise
    throw getItemsAsync();
}

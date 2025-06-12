import { fetchItemsData } from '@/services/ItemService';
import { Item } from '@/types/items';

// In-memory cache to avoid redundant fetches
let itemsCache: Item[] | null = null;
let fetchPromise: Promise<Item[]> | null = null;
let fetchError: Error | null = null; // To store and re-throw errors

function getItemsAsync(): Promise<Item[]> {
    if (itemsCache) {
        return Promise.resolve(itemsCache);
    }

    if (fetchError) {
        return Promise.reject(fetchError);
    }

    if (!fetchPromise) {
        fetchPromise = fetchItemsData()
            .then(data => {
                itemsCache = data;
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

export function useFetchItems(): { items: Item[] } {
    if (itemsCache) {
        return { items: itemsCache };
    }

    if (fetchError) {
        throw fetchError; // Re-throw stored error
    }

    // If items are not in cache and no error, throw the promise
    throw getItemsAsync();
}

// Optional: Export a function to clear the cache if needed
export function clearItemsCache() {
    itemsCache = null;
    fetchPromise = null;
    fetchError = null;
}
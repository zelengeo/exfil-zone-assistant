// hooks/useFetchItems.ts
import { useState, useEffect } from 'react';
import { fetchItemsData } from '@/services/ItemService';
import { Item } from '@/types/items';

interface UseFetchItemsResult {
    items: Item[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// In-memory cache to avoid redundant fetches
let itemsCache: Item[] | null = null;
let fetchPromise: Promise<Item[]> | null = null;

export function useFetchItems(): UseFetchItemsResult {
    const [items, setItems] = useState<Item[]>(itemsCache || []);
    const [loading, setLoading] = useState(!itemsCache);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async (forceRefresh = false) => {
        try {
            // Use cache if available and not forcing refresh
            if (itemsCache && !forceRefresh) {
                setItems(itemsCache);
                setLoading(false);
                return;
            }

            // If a fetch is already in progress, wait for it
            if (fetchPromise && !forceRefresh) {
                const data = await fetchPromise;
                setItems(data);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            // Create a new fetch promise
            fetchPromise = fetchItemsData();
            const data = await fetchPromise;

            // Update cache
            itemsCache = data;
            setItems(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load items:', err);
            setError('Failed to load items. Please try again.');
        } finally {
            setLoading(false);
            fetchPromise = null;
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    // Refetch function to manually trigger a refresh
    const refetch = async () => {
        await loadItems(true);
    };

    return { items, loading, error, refetch };
}

// Optional: Export a function to clear the cache if needed
export function clearItemsCache() {
    itemsCache = null;
}
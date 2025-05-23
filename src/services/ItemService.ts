import { Item } from '@/types/items';

// Cache for the items data
let itemsCache: Item[] | null = null;

// List of data files to fetch
const DATA_FILES = [
    'weapons.json',
    'ammunition.json',
    'medical.json',
    'gear.json',
    'food.json',
    'attachments.json',
    'keys.json',
    'misc.json',
    'magazines.json',
    'throwables.json',
    'task-items.json'
];

/**
 * Fetch and parse items data from multiple JSON files
 */
export async function fetchItemsData(): Promise<Item[]> {
    // Return cached data if available
    if (itemsCache) {
        return itemsCache;
    }

    try {
        const allItems: Item[] = [];

        // Fetch all data files concurrently
        const fetchPromises = DATA_FILES.map(async (filename) => {
            try {
                const response = await fetch(`/data/${filename}`);
                if (!response.ok) {
                    console.warn(`Failed to fetch ${filename}: ${response.statusText}`);
                    return [];
                }

                const data = await response.json();

                // Each file should have a single category key with an array of items
                const categoryKey = Object.keys(data)[0];
                return data[categoryKey] || [];
            } catch (error) {
                console.warn(`Error fetching ${filename}:`, error);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);

        // Flatten all results into a single array
        results.forEach(items => {
            if (Array.isArray(items)) {
                allItems.push(...items);
            }
        });

        // Cache the results
        itemsCache = allItems;

        console.log(`✅ Loaded ${allItems.length} items from ${DATA_FILES.length} data files`);
        return allItems;
    } catch (error) {
        console.error('Error fetching items data:', error);
        throw error;
    }
}

/**
 * Get a single item by ID
 */
export async function getItemById(id: string): Promise<Item | undefined> {
    const items = await fetchItemsData();
    return items.find(item => item.id === id);
}

/**
 * Get items by category
 */
export async function getItemsByCategory(categoryId: string): Promise<Item[]> {
    const items = await fetchItemsData();
    return items.filter(item => item.category === categoryId);
}

/**
 * Get items by category and subcategory
 */
export async function getItemsByCategoryAndSubcategory(categoryId: string, subcategory: string): Promise<Item[]> {
    const items = await fetchItemsData();
    return items.filter(item => item.category === categoryId && item.subcategory === subcategory);
}

/**
 * Search items by name or description
 */
export async function searchItems(query: string): Promise<Item[]> {
    const items = await fetchItemsData();
    const normalizedQuery = query.toLowerCase().trim();

    return items.filter(item =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery)
    );
}

/**
 * Clear the cache (useful for development or when data updates)
 */
export function clearItemsCache(): void {
    itemsCache = null;
}

/**
 * Get all unique categories from items data
 */
export async function getItemCategories(): Promise<string[]> {
    const items = await fetchItemsData();
    const categories = new Set(items.map(item => item.category));
    return Array.from(categories);
}

/**
 * Get all unique subcategories for a specific category
 */
export async function getSubcategoriesForCategory(categoryId: string): Promise<string[]> {
    const items = await fetchItemsData();
    const subcategories = new Set(
        items
            .filter(item => item.category === categoryId && item.subcategory)
            .map(item => item.subcategory)
    );
    return Array.from(subcategories);
}
import { Item } from '@/types/items';

// Cache for the items data
let itemsCache: Item[] | null = null;

/**
 * Fetch and parse items data from JSON file
 */
export async function fetchItemsData(): Promise<Item[]> {
    // Return cached data if available
    if (itemsCache) {
        return itemsCache;
    }

    try {
        const response = await fetch('/data/items.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch items data: ${response.statusText}`);
        }

        const data = await response.json();

        // Flatten the categorized data into a single array
        const allItems: Item[] = [];

        // Combine all categories into one array
        Object.values(data).forEach((categoryItems: any) => {
            if (Array.isArray(categoryItems)) {
                allItems.push(...categoryItems);
            }
        });

        // Cache the results
        itemsCache = allItems;

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
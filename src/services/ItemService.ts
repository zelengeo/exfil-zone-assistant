import {Item, RARITY_CONFIG} from '@/types/items';
import {isAmmunition, isBodyArmor, isFaceShield, isHelmet, isWeapon} from "@/app/combat-sim/utils/types";

// Cache for the items data
let itemsCache: Item[] | null = null;

// List of data files to fetch
const DATA_FILES = [
    'weapons.json',
    'ammunition.json',
    'armor.json',
    'helmets.json',
    'face-shields.json'
    // 'medical.json',
    // 'food.json',
    // 'attachments.json',
    // 'keys.json',
    // 'misc.json',
    // 'magazines.json',
    // 'throwables.json',
    // 'task-items.json'
];



/**
 * Transform raw item data to match our Item interface
 */
function transformItemData(rawItem: Item): Item {
    // Handle different data structures from various files
    const baseItem: Item = {
        id: rawItem.id,
        name: rawItem.name,
        description: rawItem.description,
        category: rawItem.category,
        subcategory: rawItem.subcategory || '',
        images: {
            icon: rawItem.images?.icon || '/images/items/placeholder.webp',
            thumbnail: rawItem.images?.thumbnail || rawItem.images?.icon || '/images/items/placeholder.webp',
            fullsize: rawItem.images?.fullsize || rawItem.images?.thumbnail || rawItem.images?.icon || '/images/items/placeholder.webp'
        },

        stats: {
            rarity: rawItem.stats?.rarity || RARITY_CONFIG.Common.name,
            price: rawItem.stats?.price || 0,
            weight: rawItem.stats?.weight || 0,
            // size: rawItem.stats?.size || '1x1',
            // safeSlots: rawItem.stats?.safeSlots || 1,
        },

        notes: rawItem.notes,
        tips: rawItem.tips,
    };

    // Add category-specific stats
    if (rawItem.stats) {
        // Weapons stats
        if (rawItem.category === 'weapons') {
            if (!isWeapon(rawItem) || !isWeapon(baseItem)) return baseItem;
            baseItem.stats.caliber = rawItem.stats.caliber;
            baseItem.stats.fireRate = rawItem.stats.fireRate;
            baseItem.stats.ergonomics = rawItem.stats.ergonomics;
            baseItem.stats.ADSSpeed = rawItem.stats.ADSSpeed;
            baseItem.stats.MOA = rawItem.stats.MOA;
            baseItem.stats.fireMode = rawItem.stats.fireMode;
            baseItem.stats.recoilParameters = rawItem.stats.recoilParameters;
            // baseItem.stats.penetration = rawItem.stats.penetration || 1;
        }

        // Ammo stats
        if (rawItem.category === 'ammo') {
            if (!isAmmunition(rawItem) || !isAmmunition(baseItem)) return baseItem;
            baseItem.stats.caliber = rawItem.stats.caliber;
            baseItem.stats.damage = rawItem.stats.damage;
            baseItem.stats.penetration = rawItem.stats.penetration;
            baseItem.stats.pellets = rawItem.stats.pellets;
            baseItem.stats.muzzleVelocity = rawItem.stats.muzzleVelocity;
            baseItem.stats.bleedingChance = rawItem.stats.bleedingChance;
            baseItem.stats.bluntDamageScale = rawItem.stats.bluntDamageScale;
            baseItem.stats.protectionGearPenetratedDamageScale = rawItem.stats.protectionGearPenetratedDamageScale;
            baseItem.stats.protectionGearBluntDamageScale = rawItem.stats.protectionGearBluntDamageScale;
            baseItem.stats.damageAtRange = rawItem.stats.damageAtRange;
            baseItem.stats.penetrationAtRange = rawItem.stats.penetrationAtRange;
            baseItem.stats.ballisticCurves = rawItem.stats.ballisticCurves;
        }

        if (rawItem.category === 'gear' && rawItem.subcategory === 'Body Armor') {
            if (!isBodyArmor(rawItem) || !isBodyArmor(baseItem)) return baseItem;
            baseItem.stats.armorClass = rawItem.stats.armorClass;
            baseItem.stats.maxDurability = rawItem.stats.maxDurability;
            baseItem.stats.bluntDamageScalar = rawItem.stats.bluntDamageScalar;
            baseItem.stats.durabilityDamageScalar = rawItem.stats.durabilityDamageScalar;
            baseItem.stats.protectiveData = rawItem.stats.protectiveData;
            baseItem.stats.penetrationChanceCurve = rawItem.stats.penetrationChanceCurve;
            baseItem.stats.penetrationDamageScalarCurve = rawItem.stats.penetrationDamageScalarCurve;
            baseItem.stats.antiPenetrationDurabilityScalarCurve = rawItem.stats.antiPenetrationDurabilityScalarCurve;
        }

        if (rawItem.category === 'gear' && rawItem.subcategory === 'Helmets') {
            if (!isHelmet(rawItem) || !isHelmet(baseItem)) return baseItem;
            baseItem.stats.armorClass = rawItem.stats.armorClass;
            baseItem.stats.maxDurability = rawItem.stats.maxDurability;
            baseItem.stats.bluntDamageScalar = rawItem.stats.bluntDamageScalar;
            baseItem.stats.durabilityDamageScalar = rawItem.stats.durabilityDamageScalar;
            baseItem.stats.protectiveData = rawItem.stats.protectiveData;
            baseItem.stats.penetrationChanceCurve = rawItem.stats.penetrationChanceCurve;
            baseItem.stats.penetrationDamageScalarCurve = rawItem.stats.penetrationDamageScalarCurve;
            baseItem.stats.antiPenetrationDurabilityScalarCurve = rawItem.stats.antiPenetrationDurabilityScalarCurve;
            baseItem.stats.soundMix = rawItem.stats.soundMix;
            baseItem.stats.canAttach = rawItem.stats.canAttach;
        }
        if (rawItem.category === 'gear' && rawItem.subcategory === 'Face Shields') {
            if (!isFaceShield(rawItem) || !isFaceShield(baseItem)) return baseItem;
            baseItem.stats.armorClass = rawItem.stats.armorClass;
            baseItem.stats.maxDurability = rawItem.stats.maxDurability;
            baseItem.stats.bluntDamageScalar = rawItem.stats.bluntDamageScalar;
            baseItem.stats.durabilityDamageScalar = rawItem.stats.durabilityDamageScalar;
            baseItem.stats.protectiveData = rawItem.stats.protectiveData;
            baseItem.stats.penetrationChanceCurve = rawItem.stats.penetrationChanceCurve;
            baseItem.stats.penetrationDamageScalarCurve = rawItem.stats.penetrationDamageScalarCurve;
            baseItem.stats.antiPenetrationDurabilityScalarCurve = rawItem.stats.antiPenetrationDurabilityScalarCurve;
        }

        // Medical stats
        // if (rawItem.category === 'medicine') {
        //     baseItem.stats.healAmount = rawItem.stats.healAmount;
        //     baseItem.stats.useTime = rawItem.stats.useTime;
        //     baseItem.stats.duration = rawItem.stats.duration;
        // }

        // Food stats
        // if (rawItem.category === 'food') {
        //     baseItem.stats.energyValue = rawItem.stats.energyValue;
        //     baseItem.stats.hydrationValue = rawItem.stats.hydrationValue;
        //     baseItem.stats.useTime = rawItem.stats.useTime;
        // }

        // Other Gear stats
        // if (rawItem.category === 'gear') {
        //     baseItem.stats.armorClass = rawItem.stats.armorClass;
        //     baseItem.stats.durability = rawItem.stats.maxDurability;
        //     baseItem.stats.repairability = rawItem.stats.repairability;
        //     baseItem.stats.ergoPenalty = rawItem.stats.ergoPenalty;
        //     baseItem.stats.turnPenalty = rawItem.stats.turnPenalty;
        // }

        // Key stats
        // if (rawItem.category === 'keys') {
        //     baseItem.stats.uses = rawItem.stats.uses;
        // }
    }

    // Add optional fields
    // if (rawItem.locations) baseItem.locations = rawItem.locations;
    // if (rawItem.relatedQuests) baseItem.relatedQuests = rawItem.relatedQuests;
    // if (rawItem.craftingRecipes) baseItem.craftingRecipes = rawItem.craftingRecipes;
    if (rawItem.notes) baseItem.notes = rawItem.notes;
    if (rawItem.tips) baseItem.tips = rawItem.tips;

    return baseItem;
}

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

                // Handle different file structures
                let items: Item[] = [];

                if (Array.isArray(data)) {
                    // Direct array of items
                    items = data;
                } else if (typeof data === 'object') {
                    // Object with category keys containing arrays
                    const categoryKey = Object.keys(data)[0];
                    if (Array.isArray(data[categoryKey])) {
                        items = data[categoryKey];
                    } else {
                        // Flat object structure, convert to array
                        items = Object.values(data);
                    }
                }

                // Transform each item to match our interface
                return items.map(transformItemData).filter(item => item.id && item.name);
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

        console.log(`✅ Loaded ${allItems.length} items from ${DATA_FILES.length} data files`, allItems );
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
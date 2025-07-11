import {Item, RARITY_CONFIG} from '@/types/items';
import {
    isAmmunition, isAttachment,
    isBandage,
    isBodyArmor,
    isFaceShield, isGrenade,
    isHelmet, isLimbRestore, isMagazine, isMedicine, isMisc, isKeys,
    isPainkiller, isProvisions, isSight, isStim, isSyringe, isTactical, isTaskItem,
    isWeapon, isBackpack, isHolster
} from "@/app/combat-sim/utils/types";

// Cache for the items data
let itemsCache: Item[] | null = null;
let itemsMapCache: Map<string, Item> | null = null;
let cacheTimestamp: number | null = null;
let fetchPromise: Promise<Item[]> | null = null;

export interface ItemCache {
    items: Item[];
    itemMap: Map<string, Item>;
}

// List of data files to fetch
const DATA_FILES = [
    'weapons.json',
    'ammunition.json',
    `magazines.json`,
    'attachments.json',
    'grenades.json',
    'armor.json',
    'helmets.json',
    'face-shields.json',
    'backpacks.json',
    'holsters.json',
    'medical.json',
    'provisions.json',
    'task-items.json',
    'keys.json',
    'misc.json',
];

// Import all data files statically
// This approach works both in dev and build time
const dataImports = {
    'weapons.json': () => import('@/public/data/weapons.json'),
    'ammunition.json': () => import('@/public/data/ammunition.json'),
    'magazines.json': () => import('@/public/data/magazines.json'),
    'attachments.json': () => import('@/public/data/attachments.json'),
    'grenades.json': () => import('@/public/data/grenades.json'),
    'armor.json': () => import('@/public/data/armor.json'),
    'helmets.json': () => import('@/public/data/helmets.json'),
    'face-shields.json': () => import('@/public/data/face-shields.json'),
    'backpacks.json': () => import('@/public/data/backpacks.json'),
    'holsters.json': () => import('@/public/data/holsters.json'),
    'medical.json': () => import('@/public/data/medical.json'),
    'provisions.json': () => import('@/public/data/provisions.json'),
    'task-items.json': () => import('@/public/data/task-items.json'),
    'keys.json': () => import('@/public/data/keys.json'),
    'misc.json': () => import('@/public/data/misc.json'),
};

/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
    return Boolean(itemsCache && itemsMapCache && cacheTimestamp);
}

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
        },

        notes: rawItem.notes,
        tips: rawItem.tips,
    };

    // Add category-specific stats
    if (rawItem.stats) {
        // Weapons stats
        if (isWeapon(rawItem)) {
            if (!isWeapon(baseItem)) return baseItem;
            baseItem.stats.caliber = rawItem.stats.caliber;
            baseItem.stats.fireRate = rawItem.stats.fireRate;
            baseItem.stats.ergonomics = rawItem.stats.ergonomics;
            baseItem.stats.ADSSpeed = rawItem.stats.ADSSpeed;
            baseItem.stats.MOA = rawItem.stats.MOA;
            baseItem.stats.fireMode = rawItem.stats.fireMode;
            baseItem.stats.firingPower = rawItem.stats.firingPower;
            baseItem.stats.recoilParameters = rawItem.stats.recoilParameters;
        }

        // Ammo stats
        if (isAmmunition(rawItem)) {
            if (!isAmmunition(baseItem)) return baseItem;
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

        if (isGrenade(rawItem)) {
            if (!isGrenade(baseItem)) return baseItem;
            baseItem.stats.fuseTime = rawItem.stats.fuseTime;
            baseItem.stats.radius = rawItem.stats.radius;
            baseItem.stats.effectTime = rawItem.stats.effectTime;
            baseItem.stats.bluntDamageScale = rawItem.stats.bluntDamageScale;
            baseItem.stats.bleedingChance = rawItem.stats.bleedingChance;
            baseItem.stats.protectionGearPenetratedDurabilityDamageScale = rawItem.stats.protectionGearPenetratedDurabilityDamageScale;
            baseItem.stats.protectionGearBluntDurabilityDamageScale = rawItem.stats.protectionGearBluntDurabilityDamageScale;
            baseItem.stats.applyChanceCurve = rawItem.stats.applyChanceCurve;
            baseItem.stats.damageOverDistance = rawItem.stats.damageOverDistance;
            baseItem.stats.penetrationPowerOverDistance = rawItem.stats.penetrationPowerOverDistance;
        }

        if (isAttachment(rawItem)) {
            // Ensure attachment stats are properly mapped
            if (!isAttachment(baseItem)) return baseItem;
            if (isMagazine(rawItem)) {
                if (!isMagazine(baseItem)) return baseItem;
                baseItem.stats.capacity = rawItem.stats.capacity;
                baseItem.stats.caliber = rawItem.stats.caliber;
                baseItem.stats.ergonomicsModifier = rawItem.stats.ergonomicsModifier;
                baseItem.stats.ADSSpeedModifier = rawItem.stats.ADSSpeedModifier;
                baseItem.stats.compatibleWeapons = rawItem.stats.compatibleWeapons;
            } else {
                if (isSight(rawItem)) {
                    if (!isSight(baseItem)) return baseItem;
                    baseItem.stats.magnification = rawItem.stats.magnification;
                    baseItem.stats.zeroedDistanceValue = rawItem.stats.zeroedDistanceValue;
                }
                if (isTactical(rawItem)) {
                    if (!isTactical(baseItem)) return baseItem;
                    baseItem.stats.traceDistance = rawItem.stats.traceDistance;
                }
                if (rawItem.stats.attachmentData) {
                    baseItem.stats.attachmentData = {...rawItem.stats.attachmentData};
                }
                if (rawItem.stats.attachmentModifier) {
                    baseItem.stats.attachmentModifier = {...rawItem.stats.attachmentModifier};
                }
            }
        }


        if (isBodyArmor(rawItem)) {
            if (!isBodyArmor(baseItem)) return baseItem;
            baseItem.stats.armorClass = rawItem.stats.armorClass;
            baseItem.stats.maxDurability = rawItem.stats.maxDurability;
            baseItem.stats.bluntDamageScalar = rawItem.stats.bluntDamageScalar;
            baseItem.stats.durabilityDamageScalar = rawItem.stats.durabilityDamageScalar;
            baseItem.stats.protectiveData = rawItem.stats.protectiveData;
            baseItem.stats.penetrationChanceCurve = rawItem.stats.penetrationChanceCurve;
            baseItem.stats.penetrationDamageScalarCurve = rawItem.stats.penetrationDamageScalarCurve;
            baseItem.stats.antiPenetrationDurabilityScalarCurve = rawItem.stats.antiPenetrationDurabilityScalarCurve;
        }

        if (isHelmet(rawItem)) {
            if (!isHelmet(baseItem)) return baseItem;
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
        if (isFaceShield(rawItem)) {
            if (!isFaceShield(baseItem)) return baseItem;
            baseItem.stats.armorClass = rawItem.stats.armorClass;
            baseItem.stats.maxDurability = rawItem.stats.maxDurability;
            baseItem.stats.bluntDamageScalar = rawItem.stats.bluntDamageScalar;
            baseItem.stats.durabilityDamageScalar = rawItem.stats.durabilityDamageScalar;
            baseItem.stats.protectiveData = rawItem.stats.protectiveData;
            baseItem.stats.penetrationChanceCurve = rawItem.stats.penetrationChanceCurve;
            baseItem.stats.penetrationDamageScalarCurve = rawItem.stats.penetrationDamageScalarCurve;
            baseItem.stats.antiPenetrationDurabilityScalarCurve = rawItem.stats.antiPenetrationDurabilityScalarCurve;
        }

        if (isBackpack(rawItem)) {
            if (!isBackpack(baseItem)) return baseItem;
            baseItem.stats.sizes = rawItem.stats.sizes;
            baseItem.stats.attachmentPoints = rawItem.stats.attachmentPoints;
        }

        if (isHolster(rawItem)) {
            if (!isHolster(baseItem)) return baseItem;
            baseItem.stats.canAttach = rawItem.stats.canAttach;
        }

        if (isMedicine(rawItem)) {
            if (isBandage(rawItem)) {
                if (!isBandage(baseItem)) return baseItem;
                baseItem.stats.canHealDeepWound = rawItem.stats.canHealDeepWound;
            } else if (isPainkiller(rawItem)) {
                if (!isPainkiller(baseItem)) return baseItem;
                baseItem.stats.usesCount = rawItem.stats.usesCount;
                baseItem.stats.effectTime = rawItem.stats.effectTime;
                baseItem.stats.energyFactor = rawItem.stats.energyFactor;
                baseItem.stats.hydraFactor = rawItem.stats.hydraFactor;
                baseItem.stats.sideEffectTime = rawItem.stats.sideEffectTime;
            } else if (isSyringe(rawItem)) {
                if (!isSyringe(baseItem)) return baseItem;
                baseItem.stats.capacity = rawItem.stats.capacity;
                baseItem.stats.cureSpeed = rawItem.stats.cureSpeed;
                baseItem.stats.canReduceBleeding = rawItem.stats.canReduceBleeding;
            } else if (isStim(rawItem)) {
                if (!isStim(baseItem)) return baseItem;
                baseItem.stats.effectTime = rawItem.stats.effectTime;
                baseItem.stats.useTime = rawItem.stats.useTime;
            } else if (isLimbRestore(rawItem)) {
                if (!isLimbRestore(baseItem)) return baseItem;
                baseItem.stats.hpPercentage = rawItem.stats.hpPercentage;
                baseItem.stats.useTime = rawItem.stats.useTime;
                baseItem.stats.usesCount = rawItem.stats.usesCount;
                baseItem.stats.brokenHP = rawItem.stats.brokenHP;
            }
        }

        if (isProvisions(rawItem)) {
            if (!isProvisions(baseItem)) return baseItem;
            baseItem.stats.capacity = rawItem.stats.capacity;
            baseItem.stats.threshold = rawItem.stats.threshold;
            baseItem.stats.consumptionSpeed = rawItem.stats.consumptionSpeed;
            baseItem.stats.energyFactor = rawItem.stats.energyFactor;
            baseItem.stats.hydraFactor = rawItem.stats.hydraFactor;

        }

        if (isTaskItem(rawItem)) {
            if (!isTaskItem(baseItem)) return baseItem;
            baseItem.stats.taskIds = rawItem.stats.taskIds;
        }

        if (isKeys(rawItem)) {
            if (!isKeys(baseItem)) return baseItem;
        }


        if (isMisc(rawItem)) {
            if (!isMisc(baseItem)) return baseItem;
            // if (rawItem.stats.backpackDimensionMultiplier !== undefined) {
            //     baseItem.stats.backpackDimensionMultiplier = rawItem.stats.backpackDimensionMultiplier;
            // }
            // if (rawItem.stats.safeContainerBoundScale !== undefined) {
            //     baseItem.stats.safeContainerBoundScale = rawItem.stats.safeContainerBoundScale;
            // }
        }
    }

    if (rawItem.notes) baseItem.notes = rawItem.notes;
    if (rawItem.tips) baseItem.tips = rawItem.tips;

    return baseItem;
}

/**
 * Load data using Node.js fs module (for build time)
 */
async function loadDataServerSide(): Promise<Item[]> {
    const allItems: Item[] = [];

    const importPromises = DATA_FILES.map(async (filename) => {
        try {
            const importFn = dataImports[filename as keyof typeof dataImports];
            if (!importFn) {
                console.warn(`No import function for ${filename}`);
                return [];
            }

            const importedData = await importFn();
            const data = importedData.default || importedData;

            // Handle different file structures
            let items: Item[] = [];

            if (Array.isArray(data)) {
                items = data as Item[];
            }
            return items.map(transformItemData).filter(item => item.id && item.name);
        } catch (error) {
            console.warn(`Error importing ${filename}:`, error);
            return [];
        }
    });

    const results = await Promise.all(importPromises);
    results.forEach(items => {
        if (Array.isArray(items)) {
            allItems.push(...items);
        }
    });

    return allItems;
}

/**
 * Core data fetching logic
 */
async function fetchDataInternal(): Promise<Item[]> {
    const allItems: Item[] = [];

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        // Server-side: use fs to read files
        return await loadDataServerSide();
    }

    // Client-side: use fetch
    const fetchPromises = DATA_FILES.map(async (filename) => {
        try {
            const response = await fetch(`/data/${filename}`);
            if (!response.ok) {
                console.warn(`Failed to fetch ${filename}: ${response.statusText}`);
                return [];
            }

            const data = await response.json();

            let items: Item[] = [];

            if (Array.isArray(data)) {
                items = data;
            }

            return items.map(transformItemData).filter(item => item.id && item.name);
        } catch (error) {
            console.warn(`Error fetching ${filename}:`, error);
            return [];
        }
    });

    const results = await Promise.all(fetchPromises);
    results.forEach(items => {
        if (Array.isArray(items)) {
            allItems.push(...items);
        }
    });

    return allItems;
}

/**
 * Fetch and parse items data from multiple JSON files
 * This is the main export that handles caching and deduplication
 */
export async function fetchItemsData(): Promise<ItemCache> {
    // Return cached data if valid
    if (isCacheValid()) {
        return {items: itemsCache!, itemMap: itemsMapCache!};
    }

    if (fetchPromise) {
        const data = await fetchPromise;
        return {
            items: data, itemMap: data.reduce((map, item: Item) => {
                map.set(item.id, item);
                return map;
            }, new Map as Map<string, Item>)
        };
    }

    try {
        // Start the fetch
        fetchPromise = fetchDataInternal();
        const data = await fetchPromise;

        // Update cache
        itemsCache = data;
        itemsMapCache = data.reduce((map, item: Item) => {
            map.set(item.id, item);
            return map;
        }, new Map as Map<string, Item>)
        cacheTimestamp = Date.now();

        console.log(`✅ Loaded ${data.length} items from ${DATA_FILES.length} data files`);
        return {items: data, itemMap: itemsMapCache};
    } catch (error) {
        console.error('Error fetching items data:', error);
        throw error;
    } finally {
        // Clear the fetch promise
        fetchPromise = null;
    }
}

/**
 * Get a single item by ID
 */
export async function getItemById(id: string): Promise<Item | undefined> {
    const itemCache = await fetchItemsData();
    return itemCache.itemMap.get(id);
}

/**
 * Get items by category
 */
export async function getItemsByCategory(categoryId: string): Promise<Item[]> {
    const items = await fetchItemsData();
    return items.items.filter(item => item.category === categoryId);
}

/**
 * Get items by category and subcategory
 */
export async function getItemsByCategoryAndSubcategory(categoryId: string, subcategory: string): Promise<Item[]> {
    const items = await fetchItemsData();
    return items.items.filter(item => item.category === categoryId && item.subcategory === subcategory);
}

/**
 * Search items by name or description
 */
export async function searchItems(query: string): Promise<Item[]> {
    const items = await fetchItemsData();
    const normalizedQuery = query.toLowerCase().trim();

    return items.items.filter(item =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery)
    );
}

/**
 * Clear the cache (useful for development or when data updates)
 */
export function clearItemsCache(): void {
    itemsCache = null;
    itemsMapCache = null;
    cacheTimestamp = null;
    fetchPromise = null;
}

/**
 * Get cache status (useful for debugging)
 */
export function getCacheStatus(): { cached: boolean; timestamp: number | null; itemCount: number } {
    return {
        cached: isCacheValid(),
        timestamp: cacheTimestamp,
        itemCount: itemsCache?.length || 0
    };
}

/**
 * Get all unique categories from items data
 */
export async function getItemCategories(): Promise<string[]> {
    const items = await fetchItemsData();
    const categories = new Set(items.items.map(item => item.category));
    return Array.from(categories);
}

/**
 * Get all unique subcategories for a specific category
 */
export async function getSubcategoriesForCategory(categoryId: string): Promise<string[]> {
    const items = await fetchItemsData();
    const subcategories = new Set(
        items.items
            .filter(item => item.category === categoryId && item.subcategory)
            .map(item => item.subcategory)
    );
    return Array.from(subcategories);
}
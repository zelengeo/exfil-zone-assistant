import {Armor, Item, RARITY_CONFIG, isTaskItemSubcategory} from '@/types/items';
import {loadDataFile} from '@/services/dataFiles';
import {
    isAmmunition, isAttachment,
    isBandage,
    isBodyArmor,
    isFaceShield, isGrenade,
    isHelmet, isLimbRestore, isMagazine, isMedicine, isMisc, isKeys, isNightVision,
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


/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
    return Boolean(itemsCache && itemsMapCache && cacheTimestamp);
}

/**
 * A quest item's trader is curated - nothing in the game files links the two - so items the
 * extraction found but nobody has classified arrive carrying the game's folder name
 * (`ItemRetrieval/Photo`, `DLCTask`). Bucket those into `Unassigned` rather than letting each
 * become its own filter on the category page.
 */
function normalizeSubcategory(rawItem: Item): string {
    const subcategory = rawItem.subcategory || '';
    if (rawItem.category === 'task-items' && !isTaskItemSubcategory(subcategory)) {
        return 'Unassigned';
    }
    return subcategory;
}

/** The stats every piece of armour carries, shared by body armour, helmets and face shields. */
function copyArmorStats(raw: Armor, target: Armor): void {
    target.stats.armorClass = raw.stats.armorClass;
    target.stats.maxDurability = raw.stats.maxDurability;
    target.stats.bluntDamageScalar = raw.stats.bluntDamageScalar;
    target.stats.durabilityDamageScalar = raw.stats.durabilityDamageScalar;
    target.stats.sellId = raw.stats.sellId;
    target.stats.protectiveData = raw.stats.protectiveData;
    target.stats.penetrationChanceCurve = raw.stats.penetrationChanceCurve;
    target.stats.penetrationDamageScalarCurve = raw.stats.penetrationDamageScalarCurve;
    target.stats.antiPenetrationDurabilityScalarCurve = raw.stats.antiPenetrationDurabilityScalarCurve;
}

/**
 * Transform raw item data to match our Item interface
 *
 * Note this copies fields **by name**: anything not listed here is dropped, so a new field in the
 * extracted data needs a line below before it reaches the app.
 */
function transformItemData(rawItem: Item): Item {
    // Handle different data structures from various files
    const baseItem: Item = {
        id: rawItem.id,
        name: rawItem.name,
        description: rawItem.description,
        category: rawItem.category,
        subcategory: normalizeSubcategory(rawItem),
        images: {
            icon: rawItem.images?.icon || '/images/items/placeholder.webp',
            thumbnail: rawItem.images?.thumbnail || rawItem.images?.icon || '/images/items/placeholder.webp',
            fullsize: rawItem.images?.fullsize || rawItem.images?.thumbnail || rawItem.images?.icon || '/images/items/placeholder.webp'
        },

        stats: {
            rarity: rawItem.stats?.rarity || RARITY_CONFIG.Common.name,
            weight: rawItem.stats?.weight || 0,
            // The price block travels as a unit: an item has all three fields or none, which is
            // what lets `isPriced` be a single test rather than three.
            basePrice: rawItem.stats?.basePrice,
            sellPrices: rawItem.stats?.sellPrices,
            buyOffers: rawItem.stats?.buyOffers,
        },

        notes: rawItem.notes,
        tips: rawItem.tips,
        extractionStatus: rawItem.extractionStatus,
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
            baseItem.stats.fireModes = rawItem.stats.fireModes;
            baseItem.stats.penetration = rawItem.stats.penetration;
            baseItem.stats.firingPower = rawItem.stats.firingPower;
            baseItem.stats.recoilParameters = rawItem.stats.recoilParameters;

            // The gunsmith build: what the player buys and what it is made of.
            baseItem.gunsmithDisplay = rawItem.gunsmithDisplay;
            baseItem.parts = rawItem.parts;
            baseItem.receiverId = rawItem.receiverId;
            baseItem.defaultClip = rawItem.defaultClip;
            baseItem.compatibleMagazines = rawItem.compatibleMagazines;
            baseItem.family = rawItem.family;
            baseItem.gameClass = rawItem.gameClass;
            baseItem.gameId = rawItem.gameId;
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
            baseItem.stats.damageFalloffFactor = rawItem.stats.damageFalloffFactor;
            baseItem.stats.penetrationFalloffFactor = rawItem.stats.penetrationFalloffFactor;
            baseItem.stats.bulletProfileId = rawItem.stats.bulletProfileId;
        }

        if (isGrenade(rawItem)) {
            if (!isGrenade(baseItem)) return baseItem;
            baseItem.stats.fuseTime = rawItem.stats.fuseTime;
            baseItem.stats.radius = rawItem.stats.radius;
            baseItem.stats.radiusMax = rawItem.stats.radiusMax;
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
                baseItem.stats.ammoSubcategory = rawItem.stats.ammoSubcategory;
                baseItem.stats.compatibleWeapons = rawItem.stats.compatibleWeapons;
                baseItem.gameId = rawItem.gameId;
                baseItem.family = rawItem.family;
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
                baseItem.stats.gunsmithId = rawItem.stats.gunsmithId;
            }
        }


        if (isBodyArmor(rawItem)) {
            if (!isBodyArmor(baseItem)) return baseItem;
            copyArmorStats(rawItem, baseItem);
        }

        if (isHelmet(rawItem)) {
            if (!isHelmet(baseItem)) return baseItem;
            copyArmorStats(rawItem, baseItem);
            baseItem.stats.coneRegions = rawItem.stats.coneRegions;
            baseItem.stats.faceWidthAngle = rawItem.stats.faceWidthAngle;
            baseItem.stats.faceHeightAngle = rawItem.stats.faceHeightAngle;
            baseItem.stats.soundMix = rawItem.stats.soundMix;
            baseItem.stats.canAttach = rawItem.stats.canAttach;
        }
        if (isFaceShield(rawItem)) {
            if (!isFaceShield(baseItem)) return baseItem;
            copyArmorStats(rawItem, baseItem);
            baseItem.stats.coneRegions = rawItem.stats.coneRegions;
            baseItem.stats.maskWidthAngle = rawItem.stats.maskWidthAngle;
            baseItem.stats.maskHeightAngle = rawItem.stats.maskHeightAngle;
        }

        // Night-vision devices have no protection model at all - only the shop id is theirs.
        if (isNightVision(rawItem)) {
            if (!isNightVision(baseItem)) return baseItem;
            baseItem.stats.sellId = rawItem.stats.sellId;
        }

        if (isBackpack(rawItem)) {
            if (!isBackpack(baseItem)) return baseItem;
            baseItem.stats.sizes = rawItem.stats.sizes;
            baseItem.stats.storageGrid = rawItem.stats.storageGrid;
            baseItem.stats.sellId = rawItem.stats.sellId;
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
                baseItem.stats.healPerSecond = rawItem.stats.healPerSecond;
                baseItem.stats.healDuration = rawItem.stats.healDuration;
                baseItem.stats.operationRequirement = rawItem.stats.operationRequirement;
            } else if (isPainkiller(rawItem)) {
                if (!isPainkiller(baseItem)) return baseItem;
                baseItem.stats.usesCount = rawItem.stats.usesCount;
                baseItem.stats.effectTime = rawItem.stats.effectTime;
                baseItem.stats.energyFactor = rawItem.stats.energyFactor;
                baseItem.stats.hydraFactor = rawItem.stats.hydraFactor;
                baseItem.stats.sideEffectTime = rawItem.stats.sideEffectTime;
                baseItem.stats.threshold = rawItem.stats.threshold;
                baseItem.stats.consumptionSpeed = rawItem.stats.consumptionSpeed;
            } else if (isSyringe(rawItem)) {
                if (!isSyringe(baseItem)) return baseItem;
                baseItem.stats.capacity = rawItem.stats.capacity;
                baseItem.stats.cureSpeed = rawItem.stats.cureSpeed;
                baseItem.stats.canReduceBleeding = rawItem.stats.canReduceBleeding;
                baseItem.stats.healPerSecond = rawItem.stats.healPerSecond;
                baseItem.stats.healDuration = rawItem.stats.healDuration;
                baseItem.stats.useTime = rawItem.stats.useTime;
            } else if (isStim(rawItem)) {
                if (!isStim(baseItem)) return baseItem;
                baseItem.stats.effectTime = rawItem.stats.effectTime;
                baseItem.stats.useTime = rawItem.stats.useTime;
                baseItem.stats.sellId = rawItem.stats.sellId;
                baseItem.stats.perk = rawItem.stats.perk;
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
            baseItem.stats.thresholdTime = rawItem.stats.thresholdTime;
            baseItem.stats.consumptionSpeed = rawItem.stats.consumptionSpeed;
            baseItem.stats.energyFactor = rawItem.stats.energyFactor;
            baseItem.stats.hydraFactor = rawItem.stats.hydraFactor;
            baseItem.stats.stackSize = rawItem.stats.stackSize;
        }

        if (isTaskItem(rawItem)) {
            if (!isTaskItem(baseItem)) return baseItem;
            baseItem.stats.taskIds = rawItem.stats.taskIds;
        }

        if (isKeys(rawItem)) {
            if (!isKeys(baseItem)) return baseItem;
            baseItem.stats.uses = rawItem.stats.uses;
            baseItem.stats.location = rawItem.stats.location;
            baseItem.gameId = rawItem.gameId;
        }


        if (isMisc(rawItem)) {
            if (!isMisc(baseItem)) return baseItem;
            baseItem.stats.backpackDimensionMultiplier = rawItem.stats.backpackDimensionMultiplier;
            baseItem.stats.safeContainerBoundScale = rawItem.stats.safeContainerBoundScale;
        }
    }

    if (rawItem.notes) baseItem.notes = rawItem.notes;
    if (rawItem.tips) baseItem.tips = rawItem.tips;

    return baseItem;
}

/**
 * Read every data file and fold the rows into one list.
 *
 * A file that fails to load is warned about and skipped rather than failing the whole database:
 * losing one category is recoverable, losing all of them leaves the page with nothing to render.
 */
async function fetchDataInternal(): Promise<Item[]> {
    const perFile = await Promise.all(DATA_FILES.map(async (filename): Promise<Item[]> => {
        try {
            const data = await loadDataFile<unknown>(filename);
            if (!Array.isArray(data)) return [];
            return (data as Item[])
                .map(transformItemData)
                .filter(item => item.id && item.name);
        } catch (error) {
            console.warn(`Error loading ${filename}:`, error);
            return [];
        }
    }));

    return perFile.flat();
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
import type { Item } from '@/types/items';
import { baseValue, hasBarter, isBuyable, isPriced } from '@/lib/trade';
import { isAmmunition, isArmor, isWeapon } from '@/app/combat-sim/utils/types';
import { coveragePips } from '@/lib/protection/summary';
import type { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * The list page's filter and sort state, and its URL spelling.
 *
 * All of it lives in the query string next to `category` and `subcategory`, which the route already
 * read from `useSearchParams`. A filtered list stays a shareable link, browser history works, and
 * there is no filter state to keep in sync anywhere else.
 */

export const SORT_KEYS = ['name', 'value', 'weight', 'category'] as const;
export type SortKey = typeof SORT_KEYS[number];

export type SortDirection = 'asc' | 'desc';

export type Availability = 'any' | 'buyable' | 'loot' | 'barter';

export const DENSITIES = ['grid', 'table'] as const;
export type Density = typeof DENSITIES[number];

export interface ItemFilters {
    category: string;
    subcategory: string;
    search: string;
    availability: Availability;
    /** Vendor keys that must sell the item. Empty means "any vendor". */
    vendors: string[];
    minValue: number | null;
    maxValue: number | null;
    /** Minimum armour class, for gear. 0 means unset. */
    minArmorClass: number;
    /** Body parts the gear must cover, by `PipPart` name. Empty means "anywhere". */
    coversParts: string[];
    sort: SortKey;
    direction: SortDirection;
}

export const DEFAULT_FILTERS: ItemFilters = {
    category: '',
    subcategory: '',
    search: '',
    availability: 'any',
    vendors: [],
    minValue: null,
    maxValue: null,
    minArmorClass: 0,
    coversParts: [],
    sort: 'name',
    direction: 'asc',
};

/**
 * The category-aware sort key.
 *
 * `category` sorts by whatever the active category actually cares about — penetration for ammo,
 * armour class for gear, ergonomics for weapons — which is the only sort a generic list cannot
 * offer and the one people reach for.
 */
export function categorySortLabel(category: string): string | null {
    switch (category) {
        case 'ammo':
            return 'Penetration';
        case 'gear':
            return 'Armor class';
        case 'weapons':
            return 'Ergonomics';
        default:
            return null;
    }
}

function categorySortValue(item: Item, category: string): number {
    switch (category) {
        case 'ammo':
            return isAmmunition(item) ? item.stats.penetration ?? 0 : 0;
        case 'gear':
            return isArmor(item) ? item.stats.armorClass ?? 0 : 0;
        case 'weapons':
            return isWeapon(item) ? item.stats.ergonomics ?? 0 : 0;
        default:
            return 0;
    }
}

const num = (raw: string | null): number | null => {
    if (raw === null || raw === '') return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
};

export function parseFilters(params: ReadonlyURLSearchParams | URLSearchParams): ItemFilters {
    const availability = params.get('availability');
    const sort = params.get('sort');
    const vendors = params.get('vendors');
    const covers = params.get('covers');

    return {
        category: params.get('category') ?? '',
        subcategory: params.get('subcategory') ?? '',
        search: params.get('q') ?? '',
        availability: (['buyable', 'loot', 'barter'] as const).find((a) => a === availability) ?? 'any',
        vendors: vendors ? vendors.split(',').filter(Boolean) : [],
        minValue: num(params.get('min')),
        maxValue: num(params.get('max')),
        minArmorClass: num(params.get('class')) ?? 0,
        coversParts: covers ? covers.split(',').filter(Boolean) : [],
        sort: SORT_KEYS.find((k) => k === sort) ?? 'name',
        direction: params.get('dir') === 'desc' ? 'desc' : 'asc',
    };
}

/** Only non-default values are written, so a plain `/items` stays a plain URL. */
export function serializeFilters(filters: ItemFilters): string {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.search) params.set('q', filters.search);
    if (filters.availability !== 'any') params.set('availability', filters.availability);
    if (filters.vendors.length) params.set('vendors', filters.vendors.join(','));
    if (filters.minValue !== null) params.set('min', String(filters.minValue));
    if (filters.maxValue !== null) params.set('max', String(filters.maxValue));
    if (filters.minArmorClass > 0) params.set('class', String(filters.minArmorClass));
    if (filters.coversParts.length) params.set('covers', filters.coversParts.join(','));
    if (filters.sort !== 'name') params.set('sort', filters.sort);
    if (filters.direction !== 'asc') params.set('dir', filters.direction);
    return params.toString();
}

/** Whether anything beyond the category rail is narrowing the list. */
export function hasActiveFilters(filters: ItemFilters): boolean {
    return (
        filters.availability !== 'any' ||
        filters.vendors.length > 0 ||
        filters.minValue !== null ||
        filters.maxValue !== null ||
        filters.minArmorClass > 0 ||
        filters.coversParts.length > 0
    );
}

function matchesAvailability(item: Item, availability: Availability): boolean {
    switch (availability) {
        case 'buyable':
            return isBuyable(item.stats);
        case 'loot':
            return !isBuyable(item.stats);
        case 'barter':
            return hasBarter(item.stats);
        default:
            return true;
    }
}

export function applyFilters(items: Item[], filters: ItemFilters): Item[] {
    const query = filters.search.trim().toLowerCase();

    return items.filter((item) => {
        if (query) {
            const hit =
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query);
            if (!hit) return false;
        }

        if (filters.category && item.category !== filters.category) return false;
        if (filters.subcategory && item.subcategory !== filters.subcategory) return false;

        if (!matchesAvailability(item, filters.availability)) return false;

        if (filters.vendors.length) {
            const sellers = new Set((item.stats.buyOffers ?? []).map((offer) => offer.vendor));
            if (!filters.vendors.some((vendor) => sellers.has(vendor))) return false;
        }

        if (filters.minValue !== null || filters.maxValue !== null) {
            // An unpriced item is not "worth 0" — it is unknown, so a value range excludes it.
            if (!isPriced(item.stats)) return false;
            const value = baseValue(item.stats);
            if (filters.minValue !== null && value < filters.minValue) return false;
            if (filters.maxValue !== null && value > filters.maxValue) return false;
        }

        if (filters.minArmorClass > 0) {
            if (!isArmor(item) || (item.stats.armorClass ?? 0) < filters.minArmorClass) return false;
        }

        // "Covers this zone" - the one filter the protection data made possible. Every named part
        // must be covered, so ticking two asks for a piece that does both rather than either.
        if (filters.coversParts.length) {
            if (!isArmor(item)) return false;
            const covered = new Set(
                coveragePips(item.stats.protectiveData)
                    .filter((pip) => pip.armorClass > 0)
                    .map((pip) => pip.part as string),
            );
            if (!filters.coversParts.every((part) => covered.has(part))) return false;
        }

        return true;
    });
}

export function sortItems(items: Item[], filters: ItemFilters): Item[] {
    const sign = filters.direction === 'desc' ? -1 : 1;

    const compare = (a: Item, b: Item): number => {
        switch (filters.sort) {
            case 'value':
                return baseValue(a.stats) - baseValue(b.stats);
            case 'weight':
                return (a.stats.weight ?? 0) - (b.stats.weight ?? 0);
            case 'category':
                return (
                    categorySortValue(a, filters.category) - categorySortValue(b, filters.category)
                );
            default:
                return a.name.localeCompare(b.name);
        }
    };

    // Name is the tiebreak everywhere, so an equal sort key still renders in a stable order.
    return [...items].sort((a, b) => sign * compare(a, b) || a.name.localeCompare(b.name));
}

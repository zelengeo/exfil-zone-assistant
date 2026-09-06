'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Rows3, Search, SlidersHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useHydrated, useUrlSearchParams, UrlSearchParamsObserver } from '@/hooks/useUrlSearchParams';
import Layout from '@/components/layout/Layout';
import ItemCard from '@/app/items/components/ItemCard';
import ItemRow from '@/app/items/components/ItemRow';
import WeaponFamilyGroup from '@/app/items/components/WeaponFamilyGroup';
import FilterSidebar from '@/app/items/components/FilterSidebar';
import { groupWeaponsByFamily } from '@/app/items/utils/weaponFamilies';
import {
    DEFAULT_FILTERS,
    type Density,
    type ItemFilters,
    type SortKey,
    applyFilters,
    categorySortLabel,
    countMatches,
    hasActiveFilters,
    parseFilters,
    serializeFilters,
    sortItems,
} from '@/app/items/utils/filters';
import { itemCategories } from '@/types/items';
import { cn } from '@/lib/utils';
import { useFetchItems } from '@/hooks/useFetchItems';
import { useDebounce } from '@/hooks/useDebounce';
import { useDensity } from '@/app/items/hooks/useDensity';

/**
 * The catalogue: 852 items behind a search box and a category rail.
 *
 * Two densities, because they answer different questions. The grid helps you recognise an item;
 * the table lets you compare forty of them, which is what makes "cheapest 5.45 AP that penetrates
 * class 5" answerable at all. Everything except the density preference lives in the URL, so a
 * filtered list stays a shareable link.
 */

export default function ItemsPageContent() {
    const { items, getItemById } = useFetchItems();
    const pathname = usePathname();
    const searchParams = useUrlSearchParams();
    const hydrated = useHydrated();
    const [density, setDensity] = useDensity();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

    // The search box is local and debounced into the URL: typing should not push a history entry
    // per keystroke.
    const [searchDraft, setSearchDraft] = useState({ value: filters.search, source: filters.search });
    const searchValue = searchDraft.source === filters.search ? searchDraft.value : filters.search;
    const debouncedSearch = useDebounce(searchValue, 200);

    const write = useCallback(
        (next: ItemFilters) => {
            const query = serializeFilters(next);
            window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname);
        },
        [pathname],
    );

    const update = useCallback(
        (patch: Partial<ItemFilters>) => write({ ...filters, ...patch }),
        [filters, write],
    );

    useEffect(() => {
        if (hydrated && searchDraft.source === filters.search && debouncedSearch === searchDraft.value &&
            debouncedSearch !== filters.search) update({ search: debouncedSearch });
        // Only the debounced value should drive this, not every filter change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const visible = useMemo(
        () => sortItems(applyFilters(items, filters), filters),
        [items, filters],
    );

    // The rail's counts ignore the category selection, so every row answers "how many are in here"
    // rather than "0, because you are looking at something else".
    const counts = useMemo(() => countMatches(items, filters), [items, filters]);

    // The gun rework took the weapons list from 69 items to 134 presets over 38 families - 27 of
    // them with more than one preset, and many variants differing only cosmetically. Flat, that is
    // a worse page than the old one, so weapons collapse into their family in the grid. The table
    // stays flat, because comparing is the whole reason to be in it.
    const isWeaponsView = filters.category === 'weapons' && density === 'grid';
    const expandGroups = filters.search.length > 0;
    const { groups, singles } = isWeaponsView
        ? groupWeaponsByFamily(visible)
        : { groups: [], singles: hydrated ? visible : visible.slice(0, 40) };

    const categoryKey = categorySortLabel(filters.category);
    const sortOptions: { key: SortKey; label: string }[] = [
        { key: 'name', label: 'Name' },
        { key: 'value', label: 'Value' },
        { key: 'weight', label: 'Weight' },
        ...(categoryKey ? [{ key: 'category' as SortKey, label: categoryKey }] : []),
    ];

    const toggleSort = (key: SortKey) => {
        if (filters.sort === key) {
            update({ direction: filters.direction === 'asc' ? 'desc' : 'asc' });
        } else {
            // Value and the category key are almost always wanted best-first.
            update({ sort: key, direction: key === 'name' ? 'asc' : 'desc' });
        }
    };

    return (
        <Layout>
            <UrlSearchParamsObserver />
            <div className="container mx-auto px-4 py-8">
                <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-5">
                    <h1 className="font-display text-3xl md:text-4xl text-ink-hi leading-none">ITEMS</h1>
                    <span className="font-mono text-[11px] uppercase tracking-eyebrow text-ink-700">
                        {items.length.toLocaleString('en-US')} items ·{' '}
                        {Object.keys(itemCategories).length} categories
                    </span>
                </header>

                <div className="flex flex-wrap items-center gap-2 mb-5">
                    <div className="relative flex-grow max-w-md min-w-0">
                        <Search
                            size={15}
                            className="absolute inset-y-0 left-3 my-auto text-ink-700 pointer-events-none"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            placeholder="Search items…"
                            value={searchValue}
                            onChange={(e) => setSearchDraft({ value: e.target.value, source: filters.search })}
                            aria-label="Search items by name or description"
                            className="w-full py-2 pl-9 pr-3 bg-steel-750 border border-line-600 focus:border-line-400 focus:outline-none text-sm text-ink-100 placeholder-ink-700"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open filters"
                        className={cn(
                            'md:hidden flex items-center gap-2 px-3 py-2 border text-xs transition-colors',
                            hasActiveFilters(filters)
                                ? 'border-line-400 text-ink-100'
                                : 'border-line-700 text-ink-500',
                        )}
                    >
                        <SlidersHorizontal size={14} />
                        Filters
                    </button>

                    {/* Sort */}
                    <div className="flex items-center gap-1 ml-auto">
                        <span className="eyebrow hidden sm:inline mr-1">Sort</span>
                        {sortOptions.map((option) => {
                            const active = filters.sort === option.key;
                            return (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => toggleSort(option.key)}
                                    aria-pressed={active}
                                    className={cn(
                                        'micro-label px-2 py-1 border transition-colors',
                                        active
                                            ? 'border-line-400 bg-steel-650 text-ink-100'
                                            : 'border-line-800 text-ink-600 hover:text-ink-300 hover:border-line-600',
                                    )}
                                >
                                    {option.label}
                                    {active && (filters.direction === 'asc' ? ' ↑' : ' ↓')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Density */}
                    <div className="flex border border-line-800" role="group" aria-label="List density">
                        {([
                            { value: 'grid' as Density, icon: LayoutGrid, label: 'Grid' },
                            { value: 'table' as Density, icon: Rows3, label: 'Table' },
                        ]).map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setDensity(value)}
                                aria-label={`${label} density`}
                                aria-pressed={density === value}
                                className={cn(
                                    'px-2.5 py-2 transition-colors',
                                    density === value
                                        ? 'bg-steel-650 text-ink-100'
                                        : 'text-ink-700 hover:text-ink-300',
                                )}
                            >
                                <Icon size={14} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-5">
                    <FilterSidebar
                        categories={itemCategories}
                        filters={filters}
                        counts={counts}
                        onChange={update}
                        onClearAll={() => write({ ...DEFAULT_FILTERS, search: filters.search })}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />

                    <div className="flex-grow min-w-0">
                        <div className="flex items-baseline justify-between mb-3">
                            <span className="eyebrow">
                                {filters.subcategory || (filters.category && itemCategories[filters.category]?.name) || 'All items'}
                            </span>
                            <span className="font-mono tabular text-xs text-ink-600">
                                {visible.length.toLocaleString('en-US')} matches
                            </span>
                        </div>

                        {visible.length === 0 ? (
                            <div className="bg-steel-900 border border-line-900 p-8 text-center">
                                <div className="eyebrow mb-2">Nothing matches</div>
                                <p className="text-sm text-ink-500">
                                    Try a different search, or reset the filters to see more items.
                                </p>
                            </div>
                        ) : density === 'table' ? (
                            <div className="border border-line-900 divide-y divide-line-900">
                                {visible.map((item) => (
                                    <ItemRow key={item.id} item={item} resolve={getItemById} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {groups.map((group) => (
                                    <WeaponFamilyGroup
                                        // Remount when the search toggles, so the group's own open
                                        // state picks up the new default instead of sticking.
                                        key={`${group.key}${expandGroups ? ':open' : ''}`}
                                        group={group}
                                        showCaliber={!filters.subcategory}
                                        defaultExpanded={expandGroups}
                                    />
                                ))}
                                {singles.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {singles.map((item) => (
                                            <ItemCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

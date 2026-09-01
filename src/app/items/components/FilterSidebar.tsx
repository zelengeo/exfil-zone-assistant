'use client';

import React from 'react';
import {
    Apple,
    BookmarkCheck,
    Bomb,
    BriefcaseMedical,
    ChevronDown,
    ChevronRight,
    ChevronsUp,
    Drill,
    Fence,
    Shield,
    Swords,
    X,
} from 'lucide-react';
import { ItemCategory } from '@/types/items';
import { cn } from '@/lib/utils';
import { vendorLabel } from '@/lib/trade';
import { VENDOR_ORDER } from '@/types/trade';
import type { Availability, ItemFilters } from '@/app/items/utils/filters';
import { PIP_LABELS, PIP_PARTS } from '@/lib/protection/summary';

/**
 * The category rail, plus the three groups the trade and protection data made possible.
 *
 * Categories and subcategories are unchanged. Everything new is collapsed by default so the rail is
 * no taller than it was, and the protection group only appears for gear — a "covers this zone"
 * filter on a list of provisions is noise.
 */

const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
        case 'weapons':
            return <Swords size={16} />;
        case 'ammo':
            return <Fence size={16} />;
        case 'medicine':
            return <BriefcaseMedical size={16} />;
        case 'grenades':
            return <Bomb size={16} />;
        case 'provisions':
            return <Apple size={16} />;
        case 'gear':
            return <Shield size={16} />;
        case 'misc':
            return <Drill size={16} />;
        case 'task-items':
            return <BookmarkCheck size={16} />;
        case 'attachments':
            return <ChevronsUp size={16} />;
        case 'keys':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden="true"
                >
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
            );
        default:
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            );
    }
};

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
    { value: 'any', label: 'Any' },
    { value: 'buyable', label: 'Buyable' },
    { value: 'loot', label: 'Loot only' },
    { value: 'barter', label: 'Barter' },
];

const ARMOR_CLASSES = [2, 3, 4, 5, 6] as const;

/** A collapsed section of the rail. Everything below the category tree uses it. */
function Group({
    title,
    active,
    children,
    defaultOpen = false,
}: {
    title: string;
    active?: boolean;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = React.useState(defaultOpen);

    return (
        <div className="border-t border-line-900">
            <button
                type="button"
                onClick={() => setOpen((was) => !was)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-steel-800 transition-colors"
            >
                <span className={cn('eyebrow', active && 'text-info')}>{title}</span>
                <ChevronDown
                    size={13}
                    className={cn('text-ink-700 transition-transform', open && 'rotate-180')}
                    aria-hidden="true"
                />
            </button>
            {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
        </div>
    );
}

function Chip({
    selected,
    onClick,
    children,
}: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={cn(
                'micro-label px-2 py-1 border transition-colors',
                selected
                    ? 'border-line-400 bg-steel-650 text-ink-100'
                    : 'border-line-800 text-ink-600 hover:text-ink-300 hover:border-line-600',
            )}
        >
            {children}
        </button>
    );
}

export interface FilterSidebarProps {
    categories: Record<string, ItemCategory>;
    filters: ItemFilters;
    onChange: (patch: Partial<ItemFilters>) => void;
    onClearAll: () => void;
    isOpen: boolean;
    onClose: () => void;
}

function SidebarBody({
    categories,
    filters,
    onChange,
    onClearAll,
    onNavigate,
}: Omit<FilterSidebarProps, 'isOpen' | 'onClose'> & { onNavigate: () => void }) {
    // Toggles the reader has made, by category id. Absent means "follow the selection", so the
    // active category is open without an effect having to write that state down.
    const [toggled, setToggled] = React.useState<Record<string, boolean>>({});
    const isExpanded = (categoryId: string): boolean =>
        toggled[categoryId] ?? categoryId === filters.category;

    const selectCategory = (categoryId: string) => {
        // Clicking the active category clears it, which is how the rail has always behaved.
        const next = categoryId === filters.category && !filters.subcategory ? '' : categoryId;
        onChange({ category: next, subcategory: '', minArmorClass: 0, coversParts: [] });
        setToggled((prev) => ({ ...prev, [categoryId]: !isExpanded(categoryId) }));
        onNavigate();
    };

    const selectSubcategory = (categoryId: string, subcategory: string) => {
        onChange({ category: categoryId, subcategory });
        onNavigate();
    };

    const toggleCoversPart = (part: string) => {
        const coversParts = filters.coversParts.includes(part)
            ? filters.coversParts.filter((p) => p !== part)
            : [...filters.coversParts, part];
        onChange({ coversParts });
    };

    const toggleVendor = (vendor: string) => {
        const vendors = filters.vendors.includes(vendor)
            ? filters.vendors.filter((v) => v !== vendor)
            : [...filters.vendors, vendor];
        onChange({ vendors });
    };

    return (
        <>
            <div className="p-3 space-y-1">
                <button
                    type="button"
                    onClick={() => {
                        onChange({ category: '', subcategory: '', minArmorClass: 0, coversParts: [] });
                        onNavigate();
                    }}
                    className={cn(
                        'w-full px-3 py-2 text-left text-sm transition-colors',
                        !filters.category
                            ? 'bg-steel-650 text-ink-100'
                            : 'text-ink-500 hover:bg-steel-800 hover:text-ink-200',
                    )}
                >
                    All items
                </button>

                {Object.values(categories).map((category) => {
                    const isActive = filters.category === category.id;
                    const hasSubs = (category.subcategories?.length ?? 0) > 0;

                    return (
                        <div key={category.id}>
                            <button
                                type="button"
                                onClick={() => selectCategory(category.id)}
                                className={cn(
                                    'w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 transition-colors',
                                    isActive && !filters.subcategory
                                        ? 'bg-steel-650 text-ink-100'
                                        : 'text-ink-500 hover:bg-steel-800 hover:text-ink-200',
                                )}
                            >
                                <span className="flex items-center gap-2.5 min-w-0">
                                    <span className={isActive ? 'text-info' : 'text-ink-700'}>
                                        {getCategoryIcon(category.id)}
                                    </span>
                                    <span className="truncate">{category.name}</span>
                                </span>
                                {hasSubs &&
                                    (isExpanded(category.id) ? (
                                        <ChevronDown size={13} className="text-ink-700 shrink-0" />
                                    ) : (
                                        <ChevronRight size={13} className="text-ink-700 shrink-0" />
                                    ))}
                            </button>

                            {hasSubs && isExpanded(category.id) && (
                                <div className="pl-5 mt-0.5 space-y-0.5">
                                    {category.subcategories.map((subcategory) => (
                                        <button
                                            key={subcategory}
                                            type="button"
                                            onClick={() => selectSubcategory(category.id, subcategory)}
                                            className={cn(
                                                'w-full px-3 py-1.5 text-left text-xs transition-colors',
                                                isActive && filters.subcategory === subcategory
                                                    ? 'bg-steel-700 text-ink-100'
                                                    : 'text-ink-600 hover:bg-steel-800 hover:text-ink-300',
                                            )}
                                        >
                                            {subcategory}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <Group title="Trade" active={filters.availability !== 'any' || filters.vendors.length > 0}>
                <div className="flex flex-wrap gap-1">
                    {AVAILABILITY_OPTIONS.map((option) => (
                        <Chip
                            key={option.value}
                            selected={filters.availability === option.value}
                            onClick={() => onChange({ availability: option.value })}
                        >
                            {option.label}
                        </Chip>
                    ))}
                </div>
                <div className="pt-1">
                    <div className="micro-label text-ink-700 mb-1.5">Sold by</div>
                    <div className="flex flex-wrap gap-1">
                        {VENDOR_ORDER.map((vendor) => (
                            <Chip
                                key={vendor}
                                selected={filters.vendors.includes(vendor)}
                                onClick={() => toggleVendor(vendor)}
                            >
                                {vendorLabel(vendor)}
                            </Chip>
                        ))}
                    </div>
                </div>
            </Group>

            <Group title="Value" active={filters.minValue !== null || filters.maxValue !== null}>
                {/* Two number inputs, never a slider: the range runs to 5,090,550. */}
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Min"
                        value={filters.minValue ?? ''}
                        onChange={(e) =>
                            onChange({ minValue: e.target.value === '' ? null : Number(e.target.value) })
                        }
                        aria-label="Minimum value in EZD"
                        className="w-full min-w-0 bg-steel-750 border border-line-600 px-2 py-1.5 font-mono tabular text-xs text-ink-100 placeholder-ink-700 focus:border-line-400 focus:outline-none"
                    />
                    <span className="text-ink-700 text-xs shrink-0">–</span>
                    <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Max"
                        value={filters.maxValue ?? ''}
                        onChange={(e) =>
                            onChange({ maxValue: e.target.value === '' ? null : Number(e.target.value) })
                        }
                        aria-label="Maximum value in EZD"
                        className="w-full min-w-0 bg-steel-750 border border-line-600 px-2 py-1.5 font-mono tabular text-xs text-ink-100 placeholder-ink-700 focus:border-line-400 focus:outline-none"
                    />
                </div>
                <p className="micro-label text-ink-700">EZD, by base value</p>
            </Group>

            {filters.category === 'gear' && (
                <Group
                    title="Protection"
                    active={filters.minArmorClass > 0 || filters.coversParts.length > 0}
                >
                    <div className="micro-label text-ink-700 mb-1.5">Class at least</div>
                    <div className="flex flex-wrap gap-1">
                        {ARMOR_CLASSES.map((armorClass) => (
                            <Chip
                                key={armorClass}
                                selected={filters.minArmorClass === armorClass}
                                onClick={() =>
                                    onChange({
                                        minArmorClass:
                                            filters.minArmorClass === armorClass ? 0 : armorClass,
                                    })
                                }
                            >
                                {armorClass}
                            </Chip>
                        ))}
                    </div>
                    <div className="pt-1">
                        <div className="micro-label text-ink-700 mb-1.5">Covers</div>
                        <div className="flex flex-wrap gap-1">
                            {PIP_PARTS.map((part) => (
                                <Chip
                                    key={part}
                                    selected={filters.coversParts.includes(part)}
                                    onClick={() => toggleCoversPart(part)}
                                >
                                    {PIP_LABELS[part]}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </Group>
            )}

            <div className="border-t border-line-900 p-3">
                <button
                    type="button"
                    onClick={() => {
                        onClearAll();
                        onNavigate();
                    }}
                    className="w-full px-3 py-2 border border-line-700 text-xs text-ink-500 hover:text-ink-200 hover:border-line-500 transition-colors"
                >
                    Reset filters
                </button>
            </div>
        </>
    );
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose, ...body }) => (
    <>
        {/* Mobile: a drawer over the list. */}
        <div
            className={cn(
                'fixed inset-0 z-50 md:hidden transition-transform duration-200 ease-out',
                isOpen ? 'translate-x-0' : '-translate-x-full',
            )}
        >
            <div className="absolute inset-0 bg-steel-950/80" onClick={onClose} />
            <div className="relative w-4/5 max-w-sm h-full bg-steel-900 border-r border-line-800 overflow-y-auto">
                <div className="px-3 py-3 flex items-center justify-between border-b border-line-900">
                    <span className="eyebrow">Filters</span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close filters"
                        className="w-8 h-8 flex items-center justify-center bg-steel-800 hover:bg-steel-700 text-ink-400"
                    >
                        <X size={16} />
                    </button>
                </div>
                <SidebarBody {...body} onNavigate={onClose} />
            </div>
        </div>

        {/* Desktop: always there. */}
        <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-steel-900 border border-line-900 sticky top-4">
                <SidebarBody {...body} onNavigate={() => undefined} />
            </div>
        </aside>
    </>
);

export default FilterSidebar;

# Hideout Upgrades Documentation

## Documentation Hierarchy

**Parent:** [App Router](../CLAUDE.md) - Next.js pages & routing
**Root:** [Root CLAUDE.md](../../../CLAUDE.md) - Project overview
**Index:** [CLAUDE-INDEX.md](../../../CLAUDE.md) - Complete navigation

**Related Documentation:**
- [Services](../../services/CLAUDE.md) - Data access patterns
- [Types](../../types/CLAUDE.md) - Type definitions
- [Public Data](../../../public/data/CLAUDE.md) - JSON schemas

**See Also:**
- For localStorage patterns, see [Services CLAUDE.md](../../services/CLAUDE.md) - StorageService
- For hideout data schemas, see [Public Data CLAUDE.md](../../../public/data/CLAUDE.md)

---

## Overview

The **Hideout Upgrades** feature provides a visual planner for managing hideout facility upgrades in Contractors Showdown: ExfilZone. Users can:

- View interactive hideout map with upgrade locations
- Track upgrade dependencies and prerequisites
- See required items and costs for each upgrade
- Calculate total costs for desired upgrade path
- Persist upgrade selections to localStorage
- Navigate between categories (Kitchen, Medical, Lounge, Storage)

**Route:** `/hideout-upgrades`

**Key Features:**
- **Visual map interface:** Click areas on hideout image
- **Dependency system:** Prerequisites must be completed first
- **Category navigation:** Filter by room category
- **Cost calculator:** Total items/money needed
- **Undo functionality:** Revert upgrades if no dependents
- **Progress tracking:** Saved to localStorage

---

## Directory Structure

```
app/hideout-upgrades/
├── components/                              # React components
│   ├── HideoutOverview.tsx                 # Interactive map UI
│   ├── HideoutUpgradesClient.tsx           # Main client component
│   └── TotalCostsDisplay.tsx               # Cost calculator
├── extracted_hideout_levelup_button_data.json  # Legacy data
├── extracted_hideout_upgrade_data.json         # Legacy data
├── hideout-config.json                     # Configuration
└── page.tsx                                 # Server component wrapper
```

**Data Location:**
- `src/data/hideout-upgrades.ts` - Upgrade definitions, tasks, icons

---

## Hideout Upgrades Page

### Route: `/hideout-upgrades`

**File:** `app/hideout-upgrades/page.tsx`

**Pattern:** Server Component with Suspense

```typescript
import {Metadata} from 'next';
import {Suspense} from 'react';
import Layout from "@/components/layout/Layout";
import HideoutUpgradesClient from './components/HideoutUpgradesClient';

export const metadata: Metadata = {
    title: 'Hideout Upgrades Calculator',
    description: 'Plan and calculate your hideout upgrades...',
    keywords: ["hideout", "upgrades", "upgrade costs"],
    openGraph: {
        title: 'Hideout Upgrades Calculator',
        description: 'Plan and calculate your hideout upgrades...',
        type: 'website',
        images: [{
            url: '/og/og-image-hideout.jpg',
            width: 1200,
            height: 630,
        }],
    },
};

function ItemsLoading() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="military-box p-8 rounded-sm text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Hideout Upgrades Calculator</h2>
                        <p className="text-tan-300">Loading hideout upgrades...</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default function HideoutUpgradesPage() {
    return (
        <Suspense fallback={<ItemsLoading />}>
            <HideoutUpgradesClient />
        </Suspense>
    );
}
```

---

## Hideout Upgrades Client Component

### Component: `HideoutUpgradesClient`

**File:** `app/hideout-upgrades/components/HideoutUpgradesClient.tsx`

**Pattern:** Client Component with localStorage

```typescript
'use client';

import React, {useState, useMemo, useEffect} from 'react';
import {hideoutUpgrades} from '@/data/hideout-upgrades';
import TotalCostsDisplay from "@/app/hideout-upgrades/components/TotalCostsDisplay";
import Layout from "@/components/layout/Layout";
import {useFetchItems} from "@/hooks/useFetchItems";
import HideoutOverview from "@/app/hideout-upgrades/components/HideoutOverview";
import {StorageService} from "@/services/StorageService";

type HideoutUpgradeKey = keyof typeof hideoutUpgrades;

const isValidHideoutUpgradeKey = (key: string): key is HideoutUpgradeKey => {
    return key in hideoutUpgrades;
};

// Save upgrades to localStorage
const saveUpgrades = (upgradedAreas: Set<string>) => {
    StorageService.setHideout([...upgradedAreas]);
};

// Load upgrades from localStorage
const loadUpgrades = (): Set<HideoutUpgradeKey> => {
    if (typeof window === 'undefined') return new Set<HideoutUpgradeKey>();

    const saved = StorageService.getHideout();
    if (!saved || !saved.length) return new Set<HideoutUpgradeKey>();

    try {
        // Filter out invalid keys for type safety
        const validKeys = saved.filter(isValidHideoutUpgradeKey);
        return new Set<HideoutUpgradeKey>(validKeys);
    } catch (error) {
        console.error('Failed to parse saved hideout upgrades:', error);
        return new Set<HideoutUpgradeKey>();
    }
};

export default function HideoutUpgradesClient() {
    const {getItemById} = useFetchItems();
    const [upgradedAreas, setUpgradedAreas] = useState<Set<HideoutUpgradeKey>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        setUpgradedAreas(loadUpgrades());
        setIsLoaded(true);
    }, []);

    // Handle upgrade toggle
    const onAreaUpgrade = (upgradeKey: HideoutUpgradeKey, isLevelUp: boolean = true) => {
        setUpgradedAreas(prev => {
            let newState;
            if (isLevelUp) {
                newState = new Set([...prev, upgradeKey]);
            } else {
                newState = new Set([...prev]);
                newState.delete(upgradeKey);
            }
            saveUpgrades(newState);
            return newState;
        });
    };

    // Reset all upgrades
    const resetUpgrades = () => {
        const newState = new Set<HideoutUpgradeKey>();
        saveUpgrades(newState);
        setUpgradedAreas(newState);
    };

    // Track current level for each area
    const areaLevels = useMemo(() => {
        const levels: Record<string, number> = {
            Player: 10 // Player always level 10
        };

        // Initialize category levels
        categories.forEach(categoryId => {
            levels[categoryId] = 1;
        });

        // Some areas start at level 0
        levels['KitchenArea'] = 0;
        levels['MedicalArea'] = 0;

        // Initialize all areas at level 0
        Object.values(hideoutUpgrades).forEach(upgrade => {
            if (!levels[upgrade.areaId]) {
                levels[upgrade.areaId] = 0;
            }
        });

        // Update levels based on upgrades
        upgradedAreas.forEach(upgradeKey => {
            const upgrade = hideoutUpgrades[upgradeKey];
            if (upgrade) {
                levels[upgrade.areaId] = Math.max(levels[upgrade.areaId] || 0, upgrade.level);
            }
        });

        return levels;
    }, [upgradedAreas]);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2 military-stencil">
                        HIDEOUT UPGRADES
                    </h1>
                    <p className="text-tan-300 max-w-3xl">
                        Manage and track your hideout improvements
                    </p>
                </div>

                {/* Hideout Overview Section */}
                <section className="mb-12">
                    <HideoutOverview
                        upgradedAreas={upgradedAreas}
                        areaLevels={areaLevels}
                        onAreaUpgrade={onAreaUpgrade}
                        resetUpgrades={resetUpgrades}
                        getItemById={getItemById}
                        isLoaded={isLoaded}
                    />
                </section>

                {/* Divider */}
                <div className="border-t border-military-600 my-8"></div>

                {/* Total Costs Summary Section */}
                <section>
                    {isLoaded && (
                        <TotalCostsDisplay
                            upgradedAreas={upgradedAreas}
                            getItemById={getItemById}
                        />
                    )}
                </section>
            </div>
        </Layout>
    );
}
```

**Key Features:**
- **LocalStorage integration:** Automatic save/load
- **Server-side safety:** Check `typeof window` before localStorage access
- **Type-safe keys:** Validate upgrade keys
- **Memoized levels:** Efficient area level tracking
- **Upgrade toggle:** Add or remove upgrades

**State Management:**
- `upgradedAreas` - Set of completed upgrade keys
- `isLoaded` - Client-side hydration flag
- `areaLevels` - Computed current level per area (memoized)

---

## Hideout Overview Component

### Component: `HideoutOverview`

**File:** `app/hideout-upgrades/components/HideoutOverview.tsx`

**Pattern:** Interactive map with modal popover

```typescript
export default function HideoutOverview({
    upgradedAreas,
    areaLevels,
    getItemById,
    resetUpgrades,
    onAreaUpgrade,
    isLoaded = true,
}: HideoutOverviewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('None');
    const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeData | null>(null);

    // ESC to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedUpgrade(null);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    // Handle area click
    const handleAreaClick = (areaId: string) => {
        // If it's a category, switch to that category
        if (categories.has(areaId) && areaLevels[areaId] === 1) {
            setSelectedCategory(prevState =>
                prevState === areaId ? "None" : areaId
            );
            return;
        }

        // Find next upgrade or current upgrade
        const nextUpgrade = upgradesByArea[areaId].find(upgrade =>
            upgrade.level === (areaLevels[areaId] + 1)
        );

        if (nextUpgrade) {
            setSelectedUpgrade(nextUpgrade);
            return;
        }

        // Show current upgrade if maxed
        if (areaLevels[areaId]) {
            const upgrade = upgradesByArea[areaId].find(upgrade =>
                upgrade.level === areaLevels[areaId]
            );
            if (upgrade) {
                setSelectedUpgrade(upgrade);
            }
        }
    };

    // Handle level up/down
    const handleUpgrade = (isLevelUp: boolean = true) => {
        if (selectedUpgrade) {
            const upgradeId = getAreaUpgradeId(selectedUpgrade.areaId, selectedUpgrade.level);
            if (!upgradeId) return;

            onAreaUpgrade(upgradeId, isLevelUp);

            if (isLevelUp) {
                // Show next level if exists
                const nextUpgradeId = getAreaUpgradeId(selectedUpgrade.areaId, selectedUpgrade.level + 1);
                if (nextUpgradeId) {
                    setSelectedUpgrade(hideoutUpgrades[nextUpgradeId]);
                }
            }
        }
    };

    return (
        <>
            <div className="military-box rounded-sm p-4">
                <h2 className="text-xl font-bold text-olive-400 mb-4 text-center">
                    HIDEOUT OVERVIEW
                </h2>

                {/* Hideout Image with Overlay Areas */}
                <div className="relative w-full aspect-square max-w-[1024px] mx-auto bg-black/50 rounded-sm overflow-hidden">
                    {/* Background Image */}
                    <div className={`absolute inset-0 transition-transform duration-500 ${
                        selectedCategory !== 'None' ? 'scale-110' : 'scale-100'
                    }`}>
                        <Image
                            src="/images/hideout/Image_bg_SquareBackgroundbg612.webp"
                            alt="Hideout"
                            fill
                            sizes={"full"}
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Overlay Areas */}
                    {isLoaded && areasByCategory[selectedCategory].map((areaId) => {
                        const position = AREA_POSITIONS[areaId] || {top: '50%', left: '50%'};
                        const isCategory = categories.has(areaId) && areaLevels[areaId] === 1;
                        const canUpgrade = !isCategory && checkLevelConditions(areaId, null, areaLevels);

                        const iconConfig = getAreaIconSafe(areaId);

                        return (
                            <button
                                key={areaId}
                                onClick={() => handleAreaClick(areaId)}
                                className={`absolute w-8 h-8 sm:w-14 sm:h-14 rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer ${
                                    !canUpgrade && !isCategory ? 'opacity-70' : ""
                                }`}
                                style={{
                                    top: position.top,
                                    left: position.left,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div className={`relative w-full h-full rounded-sm overflow-hidden ${
                                    isCategory
                                        ? 'bg-blue-400/40 border-2 border-blue-200'
                                        : 'bg-black/80 border-2 border-olive-600'
                                }`}>
                                    <Image
                                        src={`/images/hideout/${iconConfig?.icon || "Image_bg_close.webp"}`}
                                        alt={iconConfig?.alt || areaId}
                                        fill
                                        sizes={"full"}
                                        className="object-contain sm:p-2"
                                    />
                                    {/* Level indicator */}
                                    {!isCategory && (
                                        <div className="absolute bottom-0 right-0 px-1 text-xs text-olive-400 font-bold">
                                            {areaLevels[areaId]}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {/* Reset All button */}
                    {isLoaded && upgradedAreas.size > 0 && (
                        <button
                            onClick={resetUpgrades}
                            className="absolute top-[89%] left-[89%] sm:top-[94%] sm:left-[91%] w-8 h-8 sm:w-22 rounded-sm transition-all hover:scale-110 bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600/30"
                        >
                            <RotateCcw size={16}/>
                            <span className="max-sm:hidden">Reset All</span>
                        </button>
                    )}
                </div>

                {/* Upgrade Modal Popover (see below) */}
                {selectedUpgrade && <UpgradeModal />}
            </div>
        </>
    );
}
```

**Key Features:**
- **Interactive map:** Click icons on hideout image
- **Category filtering:** Show different room categories
- **Positioned icons:** Absolute positioning with AREA_POSITIONS
- **Level indicators:** Show current level on icons
- **Category icons:** Blue border for categories
- **Zoom effect:** Scale on category selection
- **ESC to close:** Modal closes on Escape key
- **Reset all:** Button appears when upgrades exist

**Position System:**
```typescript
const AREA_POSITIONS: Record<string, AreaPosition> = {
    'MedicalArea': {top: '28%', left: '44%'},
    'KitchenArea': {top: '47%', left: '30%'},
    'Storage': {top: '30%', left: '70%'},
    // ... more positions
};
```

---

## Upgrade Modal

### Pattern: Full-screen modal popover

The modal displays when an area is clicked:

```typescript
{selectedUpgrade && (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
         onClick={() => setSelectedUpgrade(null)}>
        <div
            className="bg-military-gradient border-2 border-olive-600 rounded-sm p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}>

            {/* Header with background image */}
            <div className="relative h-32 mb-4 bg-black/90 rounded-sm overflow-hidden">
                <Image
                    src={`/images/hideout/${selectedUpgrade.levelUpIcon}.webp`}
                    alt={selectedUpgrade.upgradeName}
                    fill
                    className="object-cover"
                />
                <div className="absolute top-4 left-4">
                    <h3 className="text-2xl font-bold">{selectedUpgrade.upgradeName}</h3>
                    <p className="text-olive-400">Level {selectedUpgrade.level}</p>
                </div>

                {/* Close button */}
                <button onClick={() => setSelectedUpgrade(null)}>
                    <X size={18}/>
                </button>

                {/* Navigation buttons (up/down levels) */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button onClick={goToNextLevel} disabled={!hasNextLevel}>
                        <ChevronUp size={18}/>
                    </button>
                    <button onClick={goToPrevLevel} disabled={!hasPrevLevel}>
                        <ChevronDown size={18}/>
                    </button>
                </div>
            </div>

            {/* Description */}
            <div className="mb-6 p-4 bg-black/90 rounded-sm">
                <p className="text-tan-200 whitespace-pre-line">
                    {selectedUpgrade.upgradeDesc}
                </p>
            </div>

            {/* Requirements */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Requirements</h4>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={20}/>
                    <span>Price:</span>
                    <span className="text-xl font-bold text-olive-400">
                        ${selectedUpgrade.price.toLocaleString()}
                    </span>
                </div>

                {/* Required Items */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(selectedUpgrade.exchange).map(([itemId, quantity]) => {
                        const item = getItemById(itemId);
                        return (
                            <div key={itemId} className="bg-black/90 border rounded-sm p-2 flex items-center gap-2">
                                <Image
                                    src={item?.images.icon || '/images/items/unknown.png'}
                                    alt={item?.name || itemId}
                                    width={40}
                                    height={40}
                                />
                                <div>
                                    <p className="text-xs truncate">{item?.name || itemId}</p>
                                    <p className="text-sm font-bold text-olive-400">×{quantity}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Required Tasks */}
                {selectedUpgrade.relatedQuests?.length > 0 && (
                    <div className="mb-3">
                        <p className="text-sm mb-2">Required Tasks:</p>
                        {selectedUpgrade.relatedQuests.map((questId) => (
                            <div key={questId} className="bg-black/90 border rounded-sm px-3 py-2">
                                <p>{hideoutUpgradesTasks[questId].name}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Required Areas */}
                {Object.entries(selectedUpgrade.levelConditions).length > 0 && (
                    <div className="mb-3">
                        <p className="text-sm mb-2">Required Areas:</p>
                        {Object.entries(selectedUpgrade.levelConditions).map(([areaId, level]) => (
                            <div key={areaId} className="bg-black/90 border rounded-sm px-3 py-2">
                                <p className={
                                    (areaLevels[areaId] || 0) < level
                                        ? "text-red-500"
                                        : "text-tan-200"
                                }>
                                    {areaId}: Level {level}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Button (Level Up or Undo) */}
            <div className="flex">
                {(areaLevels[selectedUpgrade.areaId] || 0) >= selectedUpgrade.level ? (
                    <button
                        disabled={!checkCanUndo(selectedUpgrade.areaId, selectedUpgrade.level, upgradedAreas)}
                        onClick={() => handleUpgrade(false)}
                        className="flex-1 py-3 bg-black/80 border text-tan-500 flex items-center justify-center gap-2"
                    >
                        <Undo size={18}/>
                        Undo
                    </button>
                ) : (
                    <button
                        onClick={() => handleUpgrade(true)}
                        disabled={!checkLevelConditions(selectedUpgrade.areaId, selectedUpgrade.level, areaLevels)}
                        className="flex-1 py-3 bg-olive-600 text-black font-bold flex items-center justify-center gap-2"
                    >
                        <ArrowUp size={18}/>
                        Level Up
                    </button>
                )}
            </div>
        </div>
    </div>
)}
```

**Key Features:**
- **Full-screen overlay:** Dark background, centered modal
- **Click outside to close:** Click backdrop to dismiss
- **Navigate levels:** Up/down chevrons to browse levels
- **Red text for unmet requirements:** Visual indication
- **Conditional actions:** Level Up vs Undo button
- **Undo validation:** Cannot undo if other upgrades depend on it

---

## Total Costs Display Component

### Component: `TotalCostsDisplay`

**File:** `app/hideout-upgrades/components/TotalCostsDisplay.tsx`

Calculates and displays:
- **Total money cost** - Sum of all upgrade prices
- **Total items needed** - Aggregated item requirements
- **Item quantities** - Combined across all upgrades

**Pattern:**
```typescript
export default function TotalCostsDisplay({ upgradedAreas, getItemById }) {
    const totalCosts = useMemo(() => {
        let totalMoney = 0;
        const totalItems: Record<string, number> = {};

        upgradedAreas.forEach(upgradeKey => {
            const upgrade = hideoutUpgrades[upgradeKey];
            if (upgrade) {
                totalMoney += upgrade.price;

                Object.entries(upgrade.exchange).forEach(([itemId, quantity]) => {
                    totalItems[itemId] = (totalItems[itemId] || 0) + quantity;
                });
            }
        });

        return { totalMoney, totalItems };
    }, [upgradedAreas]);

    return (
        <div className="military-box rounded-sm p-6">
            <h2 className="text-xl font-bold text-olive-400 mb-4">TOTAL COSTS</h2>

            {/* Total Money */}
            <div className="mb-6 flex items-center gap-2">
                <DollarSign className="text-olive-400" size={24}/>
                <span className="text-tan-200 text-lg">Total Money:</span>
                <span className="text-2xl font-bold text-olive-400">
                    ${totalCosts.totalMoney.toLocaleString()}
                </span>
            </div>

            {/* Total Items */}
            {Object.keys(totalCosts.totalItems).length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-tan-100 mb-3">Total Items Needed:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {Object.entries(totalCosts.totalItems).map(([itemId, quantity]) => {
                            const item = getItemById(itemId);
                            return (
                                <div key={itemId} className="bg-black/90 border border-military-600 rounded-sm p-2">
                                    <Image
                                        src={item?.images.icon || '/images/items/unknown.png'}
                                        alt={item?.name || itemId}
                                        width={40}
                                        height={40}
                                        className="mx-auto"
                                    />
                                    <p className="text-xs text-center text-tan-300 truncate mt-1">
                                        {item?.name || itemId}
                                    </p>
                                    <p className="text-sm font-bold text-olive-400 text-center">
                                        ×{quantity}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {upgradedAreas.size === 0 && (
                <p className="text-tan-400 text-center">
                    No upgrades selected yet. Click on areas to plan upgrades.
                </p>
            )}
        </div>
    );
}
```

---

## Hideout Data Structure

### File: `src/data/hideout-upgrades.ts`

**Upgrade Definition:**
```typescript
export const hideoutUpgrades = {
    "RestRoomLv1": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Toilet",
        "upgradeDesc": "Character experience gain +2%",
        "price": 120000,
        "exchange": {
            "misc_b_toiletpaper": 1,
            "misc_b_rustedcleaner": 2,
            "misc_b_pesticide": 2,
            "misc_b_soap": 1
        },
        "levelConditions": {
            "WaterCollector": 1
        },
        "relatedQuests": ["task.mall.4"],
        "levelUpIcon": "Image_rest_room"
    },
    // ... 100+ more upgrades
} as const;
```

**Key:** `{areaId}Lv{level}` (e.g., "RestRoomLv1", "GeneratorLv2")

**Properties:**
- `areaId` - Unique area identifier
- `categoryId` - Category group (Medical, Kitchen, Lounge, Storage, None)
- `level` - Upgrade level (1-4)
- `upgradeName` - Display name
- `upgradeDesc` - Description of benefits
- `price` - Money cost
- `exchange` - Required items (itemId → quantity)
- `levelConditions` - Prerequisites (areaId → required level)
- `relatedQuests` - Required tasks
- `levelUpIcon` - Image filename

**Tasks:**
```typescript
export const hideoutUpgradesTasks = {
    "task.mall.2": {
        "name": "The Source of Life",
        "info": "[Unlocks Water Collector's upgrades]..."
    },
    // ... more tasks
} as const;
```

**Icons:**
```typescript
export const areaIcons = {
    "RestRoom": {
        "icon": "Frame_5782.webp",
        "alt": "Rest Room"
    },
    // ... more icons
} as const;
```

---

## Helper Functions

### checkLevelConditions
```typescript
const checkLevelConditions = (
    areaId: string,
    level: number | null,
    areaLevels: Record<string, number>
): boolean => {
    if (level === null) level = areaLevels[areaId] + 1;
    if (level > areaLevels[areaId] + 1) return false;

    const upgrade = upgradesByArea[areaId]?.find(u => u.level === level);
    if (!upgrade) return false;

    for (const [requiredArea, requiredLevel] of Object.entries(upgrade.levelConditions)) {
        const currentLevel = areaLevels[requiredArea] || 0;
        if (currentLevel < requiredLevel) {
            return false;
        }
    }

    return true;
};
```

Checks if all prerequisites are met for an upgrade.

### checkCanUndo
```typescript
const checkCanUndo = (
    areaId: string,
    level: number,
    upgradedAreas: Set<HideoutUpgradeKey>
) => {
    for (const upgrade of upgradedAreas) {
        const levelConditions = hideoutUpgrades[upgrade].levelConditions;

        if (areaId in levelConditions) {
            const requiredLevel = levelConditions[areaId];
            if (requiredLevel === level) {
                return false; // Cannot undo - another upgrade depends on it
            }
        }
    }
    return true;
};
```

Prevents undoing if other upgrades depend on this level.

### getAreaUpgradeId
```typescript
const getAreaUpgradeId = (areaId: string, level: number) => {
    const upgradeId = `${areaId}Lv${level}`;
    if (isValidHideoutUpgradeKey(upgradeId)) return upgradeId;
    return null;
};
```

Generates and validates upgrade keys.

---

## Common Patterns

### DO's ✅

```typescript
// ✅ Check window exists before localStorage
if (typeof window === 'undefined') return new Set();

// ✅ Validate upgrade keys
const validKeys = saved.filter(isValidHideoutUpgradeKey);

// ✅ Use memoized area levels
const areaLevels = useMemo(() => {
    // Calculate levels
}, [upgradedAreas]);

// ✅ Save on every change
saveUpgrades(newState);

// ✅ Check prerequisites before allowing upgrade
if (!checkLevelConditions(areaId, level, areaLevels)) {
    // Disable button
}

// ✅ Prevent undo if dependents exist
if (!checkCanUndo(areaId, level, upgradedAreas)) {
    // Disable undo button
}
```

### DON'Ts ❌

```typescript
// ❌ Don't access localStorage directly
localStorage.setItem('hideout', JSON.stringify(upgrades)); // Use StorageService

// ❌ Don't use invalid upgrade keys
onAreaUpgrade('InvalidKey'); // Validate first

// ❌ Don't allow undo without checking dependents
onAreaUpgrade(upgradeId, false); // Check canUndo first

// ❌ Don't forget SSR safety
const saved = localStorage.getItem('hideout'); // Check typeof window first

// ❌ Don't calculate area levels on every render
const levels = calculateLevels(upgradedAreas); // Use useMemo
```

---

## LocalStorage Integration

**Storage Key:** `'hideout_upgrades'`

**Format:** Array of upgrade keys
```json
["RestRoomLv1", "GeneratorLv2", "WaterCollectorLv1"]
```

**Load:**
```typescript
const loadUpgrades = (): Set<HideoutUpgradeKey> => {
    if (typeof window === 'undefined') return new Set();

    const saved = StorageService.getHideout();
    if (!saved?.length) return new Set();

    const validKeys = saved.filter(isValidHideoutUpgradeKey);
    return new Set(validKeys);
};
```

**Save:**
```typescript
const saveUpgrades = (upgradedAreas: Set<string>) => {
    StorageService.setHideout([...upgradedAreas]);
};
```

---

## External Resources

### Next.js & React
- **useState**: [react.dev/reference/react/useState](https://react.dev/reference/react/useState)
- **useMemo**: [react.dev/reference/react/useMemo](https://react.dev/reference/react/useMemo)
- **Image Component**: [nextjs.org/docs/app/api-reference/components/image](https://nextjs.org/docs/app/api-reference/components/image)

### TypeScript
- **Type Guards**: [typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)

---

## Summary

The Hideout Upgrades feature provides an interactive visual planner with:
- **Visual map interface** with clickable areas
- **Dependency system** with prerequisite validation
- **Cost calculator** with aggregated totals
- **LocalStorage persistence** for user progress
- **Undo functionality** with dependent checking
- **Category navigation** for room filtering

All patterns follow project standards: No `any` types, Tailwind 4+ syntax, type-safe implementations, and client-side storage with SSR safety.

import React, {useEffect, useState} from 'react';
import Image from 'next/image';
import {areaIcons, categoriesWithoutArea, hideoutUpgrades, hideoutUpgradesTasks} from '@/data/hideout-upgrades';
import {Item} from '@/types/items';
import {X, ArrowUp, DollarSign, Undo, RotateCcw, ChevronDown, ChevronUp} from 'lucide-react';


type HideoutUpgradeKey = keyof typeof hideoutUpgrades;
type UpgradeData = typeof hideoutUpgrades[HideoutUpgradeKey];
const isValidHideoutUpgradeKey = (key: string): key is HideoutUpgradeKey => {
    return key in hideoutUpgrades;
};

interface HideoutOverviewProps {
    /**
     * Names for the quest ids an upgrade is gated behind, keyed by the game's own dotted id
     * (`task.mall.4`). Joined on the server from the task database's `gameId` - see `page.tsx`
     * for why it arrives as a prop rather than as an import.
     */
    questNames: Record<string, string>;
    upgradedAreas: Set<HideoutUpgradeKey>;
    areaLevels: Record<string, number>;
    getItemById: (id: string) => Item | undefined;
    resetUpgrades: () => void;
    onAreaUpgrade: (upgradeKey: HideoutUpgradeKey, isLevelUp: boolean) => void;
    isLoaded: boolean;
}

interface AreaPosition {
    top: string;
    left: string;
    width?: string;
    height?: string;
}

// Define positions for areas/categories on the hideout image
// These would need to be adjusted based on your actual hideout image
const AREA_POSITIONS: Record<string, AreaPosition> = {
    // Storage Zone screen
    'None': {top: '7.5%', left: '96.5%'},
    'AreaUpgradeArea': {top: '27.5%', left: '46.5%'},
    'BlackmarketMoreitem': {top: '44.75%', left: '48%'},
    'BlackmarketQuality': {top: '36.75%', left: '58%'},

    // Hideout screen
    'MedicalArea': {top: '51.25%', left: '70%'},
    'KitchenArea': {top: '31.25%', left: '78%'},
    'Lounge': {top: '57.5%', left: '43.25%'},
    'StorageZoneLock1': {top: '9.25%', left: '41.5%'},
    'StorageZoneLock2': {top: '41%', left: '28.5%'},
    'StorageZoneLock3': {top: '81%', left: '29.25%'},
    'WorkshopZone': {top: '35%', left: '37.75%'},
    'Gunsmith': {top: '22.75%', left: '33.75%'},
    'RestRoom': {top: '73.5%', left: '65.75%'},
    'WaterCollector': {top: '37.75%', left: '70.75%'},
    'Generator': {top: '17%', left: '56.5%'},
    'ShootingRange': {top: '26.5%', left: '87.75%'},
    'CryptoMining': {top: '8.75%', left: '64%'},
    'GeneratorZone': {top: '27%', left: '63%'},
    'HQPAD': {top: '31.75%', left: '52.25%'},
    'StorageZoneLock4': {top: '69.75%', left: '17%'},
    'StorageExpansionStart': {top: '27.5%', left: '45%'},
    'Intelligent': {top: '40%', left: '58%'},
    'RestroomZone': {top: '45.75%', left: '45.5%'},

    // Kitchen Area screen
    'CoffeeMaker': {top: '37%', left: '65.25%'},
    'Refrigerator': {top: '46.25%', left: '72.25%'},
    'MicrowaveOven': {top: '23%', left: '71%'},

    // Medical Area screen
    'OperationBed': {top: '66.25%', left: '67.75%'},
    'Planting': {top: '46.25%', left: '64%'},
    'MedDesk': {top: '39.5%', left: '73.25%'},

    // Lounge screen
    'Sofa': {top: '53%', left: '49%'},
    'Bookcase': {top: '68.5%', left: '45.75%'},
    'TVSet': {top: '45.5%', left: '41.25%'},
};



/**
 * The name behind one quest id.
 *
 * `relatedQuests` holds the game's own dotted ids (`task.mall.4`). Two sources can name them: the
 * real task list, joined on its `gameId` and handed down as `questNames`, and the curated
 * `hideoutUpgradesTasks` prose written before the extraction existed. S5 gates eight upgrades on
 * quests this wiki has not published yet, so neither source knows them and the id itself is shown -
 * which is at least a searchable string, and never a crash.
 */
const questName = (names: Record<string, string>, questId: string) =>
    names[questId]
    ?? (hideoutUpgradesTasks as Record<string, { name: string } | undefined>)[questId]?.name
    ?? questId;

/** An area's display name - `areaIcons` carries it as the pin's alt text. */
const getAreaName = (areaId: string) =>
    (areaIcons as Record<string, { alt: string } | undefined>)[areaId]?.alt ?? areaId;

/**
 * Where a pin sits when nothing has placed it yet.
 *
 * `AREA_POSITIONS` is hand-placed against the background plate - the game files hold no coordinates
 * for any of this - so a season that adds areas will always add them before someone has placed
 * them. Defaulting to the centre stacks every such pin on the same spot, where only the last one
 * drawn can be clicked; laying them along the bottom edge instead keeps each one reachable and
 * makes it obvious which ones still need placing.
 */
const unplacedPosition = (areaId: string, all: string[]): AreaPosition => {
    const index = Math.max(0, all.indexOf(areaId));
    return {top: '92%', left: `${5 + (index % 16) * 6}%`};
};

const getAreaIconSafe = (areaId: string) => {
    return (areaIcons as Record<string, typeof areaIcons[keyof typeof areaIcons]>)[areaId] || null;
};


const categories = Object.values(hideoutUpgrades).reduce((acc, upgrade) => {
    acc.add(upgrade.categoryId);
    return acc;
}, new Set<string>());

const areasByCategory: Record<string, string[]> = Object.values(hideoutUpgrades).reduce((areasByCategory, upgrade) => {
    if (!areasByCategory[upgrade.categoryId]) {
        if (upgrade.categoryId === 'None') {
            areasByCategory[upgrade.categoryId] = Array.from(categories).filter(cat => cat !== 'None');
        } else {
            areasByCategory[upgrade.categoryId] = ["None"];
            // A category that is also an area (Medical Area, Kitchen Area) gets its own pin from
            // the loop below, because some upgrade names it as `areaId`. Lounge and HQPAD are
            // categories only, so their pin has to be added here. The list is derived from the
            // data rather than spelled out, so a new season's categories need no edit.
            if (categoriesWithoutArea.includes(upgrade.categoryId)) {
                areasByCategory[upgrade.categoryId].push(upgrade.categoryId);
            }
        }
    }
    if (!areasByCategory[upgrade.categoryId].includes(upgrade.areaId)) areasByCategory[upgrade.categoryId].push(upgrade.areaId);

    return areasByCategory;
}, {} as Record<string, string[]>);

const upgradesByArea: Record<string, Array<UpgradeData>> = Object.values(hideoutUpgrades).reduce((upgradesByArea, upgrade) => {
    if (!upgradesByArea[upgrade.areaId]) {
        upgradesByArea[upgrade.areaId] = [];
    }
    upgradesByArea[upgrade.areaId].push(upgrade);
    console.log(`upgradesBy area`, upgradesByArea);
    return upgradesByArea;
}, {} as Record<string, Array<UpgradeData>>);

const checkLevelConditions = (areaId: string, level: number | null, areaLevels: HideoutOverviewProps["areaLevels"]): boolean => {
    if (level === null) level = areaLevels[areaId] + 1;
    if (level > areaLevels[areaId] + 1) return false;
    const upgrade = upgradesByArea[areaId]?.find(upgrade => upgrade.level === level);
    if (!upgrade) return false;
    for (const [requiredArea, requiredLevel] of Object.entries(upgrade.levelConditions)) {
        const currentLevel = areaLevels[requiredArea] || 0;
        if (currentLevel < requiredLevel) {
            return false;
        }
    }
    return true;
};

const checkCanUndo = (areaId: string, level: number, upgradedAreas: HideoutOverviewProps["upgradedAreas"]) => {
    for (const upgrade of upgradedAreas) {
        const levelConditions = hideoutUpgrades[upgrade].levelConditions;


        if (areaId in levelConditions) {
            const requiredLevel = levelConditions[areaId as keyof typeof levelConditions];
            if (requiredLevel === level) {
                return false;
            }
        }
    }
    return true;
}

const getAreaUpgradeId = (areaId: string, level: number) => {
    const upgradeId = `${areaId}Lv${level}`;
    if (isValidHideoutUpgradeKey(upgradeId)) return upgradeId;
    return null;
};


export default function HideoutOverview({
                                            questNames,
                                            upgradedAreas,
                                            areaLevels,
                                            getItemById,
                                            resetUpgrades,
                                            onAreaUpgrade,
                                            isLoaded = true,
                                        }: HideoutOverviewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('None');
    const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeData | null>(null);

    /**
     * Whether a pin navigates into a category instead of opening its own upgrade popover.
     *
     * An area that is also a category has to do both. From the outside its pin is the way into
     * the category; on the category's own screen it is the area itself, so its remaining levels
     * stay reachable - Kitchen Area has four of them, and keying this off `level === 1` used to
     * strand every one past the first. Pins that are categories only (Lounge, HQPAD, and the
     * `None` back pin) hold no upgrades, so they always navigate.
     */
    const isCategoryPin = (areaId: string) => {
        if (!categories.has(areaId)) return false;
        if (!upgradesByArea[areaId]) return true;
        return (areaLevels[areaId] ?? 0) >= 1 && areaId !== selectedCategory;
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedUpgrade(null);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [setSelectedUpgrade]);

    const handleAreaClick = (areaId: string) => {
        // If it's a category, switch to that category
        if (isCategoryPin(areaId)) {
            setSelectedCategory(prevState => prevState === areaId ? "None" : areaId);
            return;
        }

        const nextUpgrade = upgradesByArea[areaId].find(upgrade => upgrade.level === (areaLevels[areaId] + 1));

        // Show upgrade popover
        if (nextUpgrade) {
            setSelectedUpgrade(nextUpgrade)
            return;
        }

        if (areaLevels[areaId]) {
            const upgrade = upgradesByArea[areaId].find(upgrade => upgrade.level === (areaLevels[areaId]))
            if (upgrade) {
                setSelectedUpgrade(upgrade);
            }
            return;
        }

        console.warn(`Area ${areaId} has invalid level`);
    };

    const handleUpgrade = (isLevelUp: boolean = true) => {
        if (selectedUpgrade) {
            const upgradeId = getAreaUpgradeId(selectedUpgrade.areaId, selectedUpgrade.level);
            if (!upgradeId) {
                console.error(`Invalid upgrade ID: ${selectedUpgrade.areaId}Lv${selectedUpgrade.level}`);
                setSelectedUpgrade(null);
                return;
            }
            onAreaUpgrade(upgradeId, isLevelUp);
            if (isLevelUp) {
                const nextUpgradeId = getAreaUpgradeId(selectedUpgrade.areaId, selectedUpgrade.level + 1)
                if (nextUpgradeId) setSelectedUpgrade(hideoutUpgrades[nextUpgradeId])
            }

        }
    };

    return (
        <>
            <div className="military-box rounded-sm p-4">
                <h2 className="text-xl font-bold text-olive-400 mb-4 text-center">HIDEOUT OVERVIEW</h2>
                {/* Hideout Image with Overlay Areas */}
                {/* The plate is 1024x512, so the stage is 2:1 - a square box with `object-cover`
                    would crop half the floor plan away. Pin coordinates are percentages of this
                    box, so they are tied to this aspect ratio as much as to the image. */}
                <div
                    className="relative w-full aspect-[2/1] max-w-[1024px] mx-auto bg-black/50 rounded-sm overflow-hidden">
                    {/* Background Image */}
                    <div
                        className={`absolute inset-0 transition-transform duration-500 ${selectedCategory !== 'None' ? 'scale-110' : 'scale-100'}`}>
                        <Image
                            src="/images/hideout/Image_bg_SquareBackgroundbg6_4.webp"
                            alt="Hideout"
                            fill
                            sizes={"full"}
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Overlay Areas */}
                    {isLoaded && areasByCategory[selectedCategory].map((areaId) => {
                        const unplaced = !AREA_POSITIONS[areaId];
                        const position = AREA_POSITIONS[areaId]
                            || unplacedPosition(areaId, areasByCategory[selectedCategory]);
                        const isCategory = isCategoryPin(areaId);
                        const canUpgrade = !isCategory && checkLevelConditions(areaId, null, areaLevels);


                        const iconConfig = getAreaIconSafe(areaId);
                        return (
                            <button
                                key={areaId}
                                onClick={() => handleAreaClick(areaId)}
                                className={`absolute  w-8 h-8 sm:w-14 sm:h-14 min-w-8 min-h-8 sm:min-w-14 sm:min-h-14
 rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer ${!canUpgrade && !isCategory ? 'opacity-70' : ""}`}
                                style={{
                                    top: position.top,
                                    left: position.left,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div className={`relative w-full h-full rounded-sm overflow-hidden ${
                                    unplaced
                                        ? 'bg-black/80 border-2 border-dashed border-tan-500'
                                        : isCategory
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
                                        <div
                                            className="absolute bottom-0 right-0  px-1 text-xs text-olive-400 font-bold">
                                            {areaLevels[areaId]}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                    {isLoaded && upgradedAreas.size > 0 && (<button
                        onClick={resetUpgrades}
                        className={`absolute top-[89%] left-[89%] sm:top-[94%] sm:left-[91%] w-8 h-8 min-w-8 min-h-8 sm:min-w-14 sm:min-h-14 sm:w-22 rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer bg-red-600/20 border border-red-500 
                                 text-red-400 hover:bg-red-600/30 hover:text-red-300`}
                        style={{
                            // top: "94%",
                            // left: "94%",
                            // transform: 'translate(-50%, -50%)'
                        }}
                    ><RotateCcw size={16}/>
                        <span className="max-sm:hidden">Reset All</span>
                    </button>)
                    }
                </div>

                {/* Upgrade Popover */}
                {selectedUpgrade && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
                         onClick={() => setSelectedUpgrade(null)}>
                        <div
                            className="bg-military-gradient border-2 border-olive-600 rounded-sm p-6 max-w-2xl w-full mx-4"
                            onClick={(e) => e.stopPropagation()}>
                            {/* Header with image */}
                            <div className="relative h-32 mb-4 bg-black/90 rounded-sm overflow-hidden">
                                <Image
                                    src={`/images/hideout/${selectedUpgrade.levelUpIcon}.webp`} // Adjust path
                                    alt={selectedUpgrade.upgradeName}
                                    unoptimized={true}
                                    fill
                                    sizes={"full"}
                                    className="object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <h3 className="text-2xl font-bold text-tan-100">{selectedUpgrade.upgradeName}</h3>
                                    <p className="text-olive-400 font-medium">Level {selectedUpgrade.level}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedUpgrade(null)}
                                    className="absolute min-h-6 min-w-6 h-6 w-6 top-4 right-4 bg-black/50 text-tan-400 hover:text-tan-100 hover:bg-black/80"
                                >
                                    <X size={18}/>
                                </button>
                                <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2">
                                    {<button
                                        onClick={() => {
                                            const upgradeId = getAreaUpgradeId(selectedUpgrade.areaId, selectedUpgrade.level + 1)
                                            if (upgradeId) setSelectedUpgrade(hideoutUpgrades[upgradeId])
                                        }}
                                        className="min-h-6 min-w-6 h-6 w-6 bg-black/50 text-tan-400 hover:text-tan-100 hover:bg-black/80
                  transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={getAreaUpgradeId(selectedUpgrade.areaId, selectedUpgrade.level + 1) === null}
                                        title="Next Level"
                                    >
                                        <ChevronUp size={18}/>
                                    </button>}
                                    <button
                                        onClick={() => {
                                            const upgradeId = getAreaUpgradeId(selectedUpgrade.areaId, selectedUpgrade.level - 1)
                                            if (upgradeId) setSelectedUpgrade(hideoutUpgrades[upgradeId])
                                        }}
                                        className="min-h-6 min-w-6 h-6 w-6 bg-black/50 text-tan-400 hover:text-tan-100 hover:bg-black/80
                  transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={getAreaUpgradeId(selectedUpgrade.areaId, selectedUpgrade.level - 1) === null}
                                        title="Previous Level"
                                    >
                                        <ChevronDown size={18}/>
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6 p-4 bg-black/90 rounded-sm border border-military-600">
                                <p className="text-tan-200 whitespace-pre-line">{selectedUpgrade.upgradeDesc}</p>
                            </div>

                            {/* Requirements */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-tan-100 mb-3">Requirements</h4>

                                {/* Price */}
                                <div className="flex items-center gap-2 mb-3">
                                    <DollarSign className="text-olive-400" size={20}/>
                                    <span className="text-tan-200">Price:</span>
                                    <span className="text-xl font-bold text-olive-400">
                    ${selectedUpgrade.price.toLocaleString()}
                  </span>
                                </div>

                                {/* Items */}
                                {Object.entries(selectedUpgrade.exchange).length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {Object.entries(selectedUpgrade.exchange).map(([itemId, quantity]) => {
                                            const item = getItemById(itemId);
                                            return (
                                                <div key={itemId}
                                                     className="bg-black/90 border border-military-600 rounded-sm p-2 flex items-center gap-2">
                                                    {/* Fixed box + `fill`: the icons are not all
                                                        square, and `width`/`height` alone lets a
                                                        tall one (misc_b_gastank_large) stretch the
                                                        row, because preflight forces `height:auto`. */}
                                                    <div className="relative w-10 h-10 flex-shrink-0">
                                                        <Image
                                                            src={item?.images.icon || '/images/items/unknown.png'}
                                                            alt={item?.name || itemId}
                                                            unoptimized={true}
                                                            fill
                                                            sizes="40px"
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <p className="text-xs text-tan-300 truncate">{item?.name || itemId}</p>
                                                        <p className="text-sm font-bold text-olive-400">×{quantity}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Required Tasks */}
                                {selectedUpgrade.relatedQuests && selectedUpgrade.relatedQuests.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-sm text-tan-300 mb-2">Required Tasks:</p>
                                        <div className="space-y-1">
                                            {selectedUpgrade.relatedQuests.map((questId) => (
                                                <div key={questId}
                                                     className="bg-black/90 border border-military-600 rounded-sm px-3 py-2">
                                                    <p className="text-sm text-tan-200">{questName(questNames, questId)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Required Areas */}
                                {Object.values(selectedUpgrade.levelConditions).length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-sm text-tan-300 mb-2">Required Areas:</p>
                                        <div className="space-y-1">
                                            {Object.entries(selectedUpgrade.levelConditions).map(([areaId, level]) => (
                                                <div key={areaId}
                                                     className="bg-black/90 border border-military-600 rounded-sm px-3 py-2">
                                                    <p className={`text-sm ${((areaLevels[areaId] || 0) < level) ? "text-red-500" : "text-tan-200"}`}>{getAreaName(areaId)}:
                                                        Level {level}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex">
                                {((areaLevels[selectedUpgrade.areaId] || 0) >= selectedUpgrade.level) ? (
                                        <button
                                            disabled={!checkCanUndo(selectedUpgrade.areaId, selectedUpgrade.level, upgradedAreas)}
                                            className="flex-1 py-3 bg-black/80 border hover:bg-black/95 transition-colors border-military-600 rounded-sm
                           text-tan-500 font-medium flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() => handleUpgrade(false)}
                                        >
                                            <Undo size={18}/>
                                            Undo
                                        </button>
                                    ) :
                                    (<button
                                        onClick={() => handleUpgrade(true)}
                                        disabled={!checkLevelConditions(selectedUpgrade.areaId, selectedUpgrade.level, areaLevels)}
                                        className="flex-1 py-3 bg-olive-600 rounded-sm text-black font-bold
                           flex items-center justify-center gap-2 hover:bg-olive-500
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowUp size={18}/>
                                        Level Up
                                    </button>)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
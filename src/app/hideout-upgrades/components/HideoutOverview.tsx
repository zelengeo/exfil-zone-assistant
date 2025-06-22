import React, {useState} from 'react';
import Image from 'next/image';
import {areaIcons, hideoutUpgrades, hideoutUpgradesTasks} from '@/data/hideout-upgrades';
import {Item} from '@/types/items';
import {X, ArrowUp, DollarSign, Undo, RotateCcw, ChevronDown, ChevronUp} from 'lucide-react';


type HideoutUpgradeKey = keyof typeof hideoutUpgrades;
type UpgradeData = typeof hideoutUpgrades[HideoutUpgradeKey];
const isValidHideoutUpgradeKey = (key: string): key is HideoutUpgradeKey => {
    return key in hideoutUpgrades;
};

interface HideoutOverviewProps {
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
    // Categories
    'None': {top: '5%', left: '95%'},
    'MedicalArea': {top: '28%', left: '44%'},
    'KitchenArea': {top: '47%', left: '30%'},
    'Storage': {top: '30%', left: '70%'},
    'Lounge': {top: '68%', left: '35%'},

    // Storage Areas
    'StorageZoneLock1': {top: '40%', left: '78%'},
    'StorageZoneLock2': {top: '33%', left: '93%'},
    'StorageZoneLock3': {top: '20%', left: '75%'},
    'WorkshopZone': {top: '30%', left: '83%'},

    // Kitchen Areas
    'CoffeeMaker': {top: '48%', left: '20%'},
    'Refrigerator': {top: '55%', left: '27%'},
    'MicrowaveOven': {top: '38%', left: '24%'},

    // Medical Areas
    'OperationBed': {top: '35%', left: '33%'},
    'Planting': {top: '30%', left: '25%'},
    'MedDesk': {top: '18%', left: '38%'},

    // Lounge Areas
    'Sofa': {top: '71%', left: '23%'},
    'Bookcase': {top: '75%', left: '39%'},
    'TVSet': {top: '80%', left: '30%'},

    // Individual areas
    'RestRoom': {top: '87%', left: '30%'},
    'WaterCollector': {top: '40%', left: '40%'},
    'Generator': {top: '72%', left: '69%'},
    'ShootingRange': {top: '60%', left: '15%'},
    'Intelligent': {top: '43%', left: '52%'},
    'CryptoMining': {top: '55%', left: '46%'},

    // Add more positions as needed...
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
            if (upgrade.categoryId === 'Lounge' || upgrade.categoryId === 'Storage') {
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
                                            upgradedAreas,
                                            areaLevels,
                                            getItemById,
                                            resetUpgrades,
                                            onAreaUpgrade,
                                            isLoaded = true,
                                        }: HideoutOverviewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('None');
    const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeData | null>(null);

    const handleAreaClick = (areaId: string) => {
        // If it's a category, switch to that category
        if (categories.has(areaId) && areaLevels[areaId] === 1) {
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
                <div
                    className="relative w-full aspect-square max-w-[1024px] mx-auto bg-black/50 rounded-sm overflow-hidden">
                    {/* Background Image */}
                    <div
                        className={`absolute inset-0 transition-transform duration-500 ${selectedCategory !== 'None' ? 'scale-110' : 'scale-100'}`}>
                        <Image
                            src="/images/hideout/Image_bg_SquareBackgroundbg612.webp" // You'll need to add your hideout background image
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
                                className={`absolute w-14 h-14 rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer ${!canUpgrade && !isCategory ? 'opacity-70' : ""}`}
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
                                        className="object-contain p-2"
                                    />
                                    {/* Level indicator */}
                                    {!isCategory && (
                                        <div
                                            className="absolute bottom-0 right-0 bg-black/90 px-1 text-xs text-olive-400 font-bold">
                                            L{areaLevels[areaId]}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                    {isLoaded && upgradedAreas.size > 0 && (<button
                        onClick={resetUpgrades}
                        className={`absolute w-22 h-6 rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer bg-red-600/20 border border-red-500 
                                 text-red-400 hover:bg-red-600/30 hover:text-red-300`}
                        style={{
                            top: "97%",
                            left: "95%",
                            transform: 'translate(-50%, -50%)'
                        }}
                    ><RotateCcw size={16}/>
                        Reset All

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
                                    className="absolute min-h-6 min-w-6 h-6 w-6 top-4 right-4 bg-black/20 text-tan-400 hover:text-tan-100 hover:bg-black/60"
                                >
                                    <X size={18}/>
                                </button>
                                <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2">
                                    {<button
                                        onClick={() => {
                                            const upgradeId = getAreaUpgradeId(selectedUpgrade.areaId, selectedUpgrade.level + 1)
                                            if (upgradeId) setSelectedUpgrade(hideoutUpgrades[upgradeId])
                                        }}
                                        className="min-h-6 min-w-6 h-6 w-6 bg-black/20 text-tan-400 hover:text-tan-100 hover:bg-black/60
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
                                        className="min-h-6 min-w-6 h-6 w-6 bg-black/20 text-tan-400 hover:text-tan-100 hover:bg-black/60
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
                                                    <Image
                                                        src={item?.images.icon || '/images/items/unknown.png'}
                                                        alt={item?.name || itemId}
                                                        width={40}
                                                        height={40}
                                                        className="object-contain"
                                                    />
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
                                                    <p className="text-sm text-tan-200">{hideoutUpgradesTasks[questId].name}</p>
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
                                                    <p className={`text-sm ${((areaLevels[areaId] || 0) < level) ? "text-red-500" : "text-tan-200"}`}>{areaId}:
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
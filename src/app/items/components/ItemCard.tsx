import React from 'react';
import Link from 'next/link';
import {ShieldIcon, DollarSign, Info, Zap, Crosshair, Cross} from 'lucide-react';
import {
    Item,
    getRarityColorClass,
    getRarityBorderClass,
    getCategoryById,
    formatPrice,
    FIRE_MODE_CONFIG
} from '@/types/items';
import {ItemImage} from './ItemImage';
import {
    isAmmunition,
    isArmor, isAttachment,
    isBandage, isCompensator, isGrenade, isGrip,
    isLimbRestore, isMagazine,
    isMedicine,
    isPainkiller, isRail, isSight, isStim, isSuppressor, isSyringe, isTactical,
    isWeapon
} from "@/app/combat-sim/utils/types";


// Function to render specific stats based on category
const renderCategoryStats = (item: Item) => {
    switch (item.category) {
        case 'weapons':
            if (!isWeapon(item)) break;
            return (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Fire Rate:</span>
                        <span className="text-tan-100 font-mono">{item.stats.fireRate || 'N/A'} RPM</span>
                    </div>
                    {item.stats.ergonomics && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-olive-400 font-medium">Ergonomics:</span>
                            <span className="text-tan-100 font-mono">{(item.stats.ergonomics)}</span>
                        </div>
                    )}
                    {item.stats.MOA && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-olive-400 font-medium">Accuracy:</span>
                            <span className="text-tan-100 font-mono">{item.stats.MOA.toFixed(1)} MOA</span>
                        </div>
                    )}
                </div>
            );

        case 'ammo':
            if (!isAmmunition(item)) break;
            return (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Damage:</span>
                        <span className="text-tan-100 font-mono">{item.stats.damage || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Penetration:</span>
                        <span className="text-tan-100 font-mono">{item.stats.penetration || 'N/A'}</span>
                    </div>
                    {item.stats.muzzleVelocity && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-olive-400 font-medium">Velocity:</span>
                            <span
                                className="text-tan-100 font-mono">{Math.round(item.stats.muzzleVelocity / 100)} m/s</span>
                        </div>
                    )}
                </div>
            );

        case 'attachments':
            if (!isAttachment(item)) break;
            if (isMagazine(item)) return (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Caliber:</span>
                        <span className="text-tan-100 font-mono">{(item.stats.caliber)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Capacity:</span>
                        <span className="text-tan-100 font-mono">{item.stats.capacity}</span>
                    </div>
                </div>
            );
            if (isSight(item)) return (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Magnification:</span>
                        <span className="text-tan-100 font-mono">{(item.stats.magnification)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Ergonomics:</span>
                        <span className="text-tan-100 font-mono">{(item.stats.attachmentModifier?.ergonomicsModifier || 0)}</span>
                    </div>
                </div>
            )
            if (isTactical(item)) return (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Range:</span>
                        <span className="text-tan-100 font-mono">{item.stats.traceDistance/100}m</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Ergonomics:</span>
                        <span className="text-tan-100 font-mono">{(item.stats.attachmentModifier?.ergonomicsModifier || 0)}</span>
                    </div>
                </div>
            )
            if (isSuppressor(item) || isCompensator(item) || isGrip(item)) return (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Vertical recoil:</span>
                        <span className="text-tan-100 font-mono">{item.stats.attachmentModifier?.verticalRecoilModifier || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Horizontal recoil:</span>
                        <span className="text-tan-100 font-mono">{item.stats.attachmentModifier?.horizontalRecoilModifier || 0}</span>
                    </div>
                </div>
            )
            if (isRail(item)) return (<div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-olive-400 font-medium">Ergonomics:</span>
                    <span className="text-tan-100 font-mono">{(item.stats.attachmentModifier?.ergonomicsModifier || 0)}</span>
                </div>
            </div>)
            break;

        case 'grenades':
            if (!isGrenade(item)) break;
            return (
                <div className="space-y-1">
                    {item.stats.fuseTime !== null && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-olive-400 font-medium">Fuse Time:</span>
                            <span className="text-tan-100 font-mono">
                        {item.stats.fuseTime === 0 ? 'Impact' : `${item.stats.fuseTime}s`}
                    </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-olive-400 font-medium">Effective radius:</span>
                        <span className="text-tan-100 font-mono">
                    {(item.stats.radius)}m
                </span>
                    </div>
                </div>
            );

        case "gear":
            if (!isArmor(item)) break;
            return (
                <div className="space-y-1">
                    {item.stats.armorClass && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-olive-400 font-medium">Armor Class:</span>
                            <span className="text-tan-100 font-mono">Class {item.stats.armorClass}</span>
                        </div>
                    )}
                    {item.stats.maxDurability && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-olive-400 font-medium">Durability:</span>
                            <span className="text-tan-100 font-mono">{item.stats.maxDurability}</span>
                        </div>
                    )}
                    {item.stats.bluntDamageScalar && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-olive-400 font-medium">Blunt Dmg:</span>
                            <span
                                className="text-tan-100 font-mono">{(item.stats.bluntDamageScalar * 100).toFixed(0)}%</span>
                        </div>
                    )}
                </div>
            );
        case 'medicine':
            if (!isMedicine(item)) break;
            return (
                <div className="space-y-1">
                    {/* Bandages */}
                    {isBandage(item) && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-olive-400 font-medium">Type:</span>
                            <span className="text-tan-100 font-mono">Bleeding Control</span>
                        </div>
                    )}

                    {/* Limb Restorers */}
                    {isLimbRestore(item) && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-olive-400 font-medium">Max HP penalty:</span>
                                <span
                                    className="text-tan-100 font-mono">{(item.stats.hpPercentage * 100).toFixed(0)}%</span>
                            </div>
                        </>
                    )}

                    {/* Painkillers */}
                    {isPainkiller(item) && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-olive-400 font-medium">Duration:</span>
                                <span className="text-tan-100 font-mono">{item.stats.effectTime}s</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-olive-400 font-medium">Uses:</span>
                                <span className="text-tan-100 font-mono">{item.stats.usesCount}</span>
                            </div>
                        </>
                    )}

                    {/* Syringes */}
                    {isSyringe(item) && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-olive-400 font-medium">Healing:</span>
                                <span className="text-tan-100 font-mono">{item.stats.capacity} HP</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-olive-400 font-medium">Speed:</span>
                                <span className="text-tan-100 font-mono">{item.stats.cureSpeed} HP/s</span>
                            </div>
                        </>
                    )}

                    {/* Stims */}
                    {isStim(item) && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-olive-400 font-medium">Duration:</span>
                                <span className="text-tan-100 font-mono">{item.stats.effectTime}s</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-olive-400 font-medium">Use time:</span>
                                <span className="text-tan-100 font-mono">{item.stats.useTime}s</span>
                            </div>
                        </>
                    )}
                </div>
            );


        default:
            return (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-olive-400 font-medium">Weight:</span>
                    <span className="text-tan-100 font-mono">{item.stats.weight.toFixed(2)} kg</span>
                </div>
            );
    }
};

// Function to get performance indicator for items
//TODO rework - probably handmade values are needed here
const getPerformanceIndicator = (item: Item) => {
    switch (item.category) {
        case 'weapons':
            if (!isWeapon(item)) break;

            if (item.stats.fireMode !== "fullAuto") return {
                icon: <Info size={14}/>,
                label: FIRE_MODE_CONFIG[item.stats.fireMode],
                color: 'text-yellow-400'
            }


            if (item.stats.MOA && item.stats.MOA > 5) return {
                icon: <Crosshair size={14}/>,
                label: 'Low Accuracy',
                color: 'text-red-400'
            }


            // Base performance on recoil control - lower recoil = better control
            if (item.stats.recoilParameters?.verticalRecoilControl && item.stats.recoilParameters.horizontalRecoilControl && ((item.stats.recoilParameters.verticalRecoilControl + item.stats.recoilParameters.horizontalRecoilControl) / 2) < 0.25) {
                return {
                    icon: <Crosshair size={14}/>,
                    label: 'Low Recoil',
                    color: 'text-green-400'
                }
            }

            if (item.stats.fireRate > 840) return {
                icon: <Zap size={14}/>,
                label: 'High Fire Rate',
                color: 'text-green-400'
            }

            break;

        case 'ammo':
            if (!isAmmunition(item)) break;
            // High damage = better performance
            const penetration = item.stats.penetration || 0;
            if (penetration >= 6) return {icon: <Zap size={14}/>, label: 'Pen everything', color: 'text-green-400'};
            break;

        case 'grenades':
            if (!isGrenade(item)) break;

            // Impact grenades
            if (item.stats.fuseTime === 0) return {
                icon: <Zap size={14}/>,
                label: 'Impact',
                color: 'text-red-400'
            };

            // Flash/Smoke grenades (no bleeding)
            if (item.subcategory === "Utility") return {
                icon: <Info size={14}/>,
                label: 'Non-Lethal',
                color: 'text-blue-400'
            };
            break;

        case 'gear':
            if (!isArmor(item)) break;
            // High armor class = better protection
            const armorClass = item.stats.armorClass || 0;
            if (armorClass >= 6) return {icon: <ShieldIcon size={14}/>, label: 'Good', color: 'text-green-400'};
            if (armorClass >= 4) return {icon: <ShieldIcon size={14}/>, label: 'Viable', color: 'text-yellow-400'};
            if (armorClass >= 0) return {icon: <ShieldIcon size={14}/>, label: 'Poor', color: 'text-grey-400'};
            break;

        case 'medicine':
            if (!isMedicine(item)) break;
            // High armor class = better protection
            if (isBandage(item) && item.stats.canHealDeepWound) return {
                icon: <Cross size={14}/>, label: 'Deep Wound', color: 'text-green-400'
            };

    }
    return null;
};

interface ItemCardProps {
    item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({item}) => {
    const category = getCategoryById(item.category);
    const rarityColorClass = getRarityColorClass(item.stats.rarity);
    const rarityBorderClass = getRarityBorderClass(item.stats.rarity);
    const performanceIndicator = getPerformanceIndicator(item);

    return (
        <Link
            href={`/items/${item.id}`}
            className="military-card rounded-sm overflow-hidden block transition-all duration-200 hover:translate-y-[-2px] border border-military-700 hover:border-olive-600 hover:shadow-lg group"
        >
            {/* Item image and rarity badge */}
            <div className="relative aspect-square bg-military-900 border-b border-military-700 overflow-hidden">
                {/* Item image */}
                <ItemImage
                    item={item}
                    size="thumbnail"
                    className="w-full h-full"
                    showZoom={false}
                />

                {/* Rarity tag */}
                <div
                    className={`absolute top-0 right-0 px-2 py-0.5 text-xs font-medium ${rarityColorClass} border-l border-b ${rarityBorderClass} bg-military-900/90`}>
                    {item.stats.rarity}
                </div>

                {/* Performance indicator */}
                {performanceIndicator && (
                    <div
                        className={`absolute bottom-2 right-2 px-2 py-1 rounded-sm bg-military-800/90 border border-military-600 flex items-center gap-1 ${performanceIndicator.color}`}>
                        {performanceIndicator.icon}
                        <span className="text-xs font-medium">{performanceIndicator.label}</span>
                    </div>
                )}
            </div>

            {/* Item details */}
            <div className="p-4">
                {/* Item name and subcategory */}
                <div className="mb-3">
                    <h3 className="font-bold text-tan-100 leading-tight mb-1 group-hover:text-olive-300 transition-colors">
                        {item.name}
                    </h3>
                    <div className="text-xs text-tan-400 flex items-center gap-2">
                        <span>{category?.name}</span>
                        {item.subcategory && (
                            <>
                                <span>•</span>
                                <span className="text-olive-500 font-medium">{item.subcategory}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Category-specific stats */}
                <div className="mb-3">
                    {renderCategoryStats(item)}
                </div>

                {/* Price and additional info */}
                <div className="flex items-center justify-between border-t border-military-700 pt-3">
                    <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-olive-500"/>
                        <span className="text-tan-100 font-mono text-sm font-medium">
                            {formatPrice(item.stats.price)}
                        </span>
                    </div>

                    {/* Weight indicator */}
                    <div className="text-xs text-tan-400">
                        {item.stats.weight.toFixed(2)} kg
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ItemCard;
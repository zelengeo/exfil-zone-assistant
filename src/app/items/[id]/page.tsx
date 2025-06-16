'use client';

import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronLeft,
    Crosshair,
    Shield,
    Timer,
    Info,
    Gavel,
    ShieldMinus,
    BowArrow,
    ShieldX,
    Snail,
    Zap, Volume2, HelpCircle, ChevronsUpDown, ChevronsLeftRight, Bandage, Hash, Cross, Bone, Gauge
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import BallisticCurveChart from '@/components/items/BallisticCurveChart';
import ArmorZonesDisplay from '@/components/items/ArmorZonesDisplay';
import {
    formatPrice,
    formatWeight,
    getRarityColorClass,
    getRarityBorderClass,
    getCategoryById, AnyItem, FIRE_MODE_CONFIG, Item
} from '@/types/items';
import {getItemById} from "@/services/ItemService";
import {
    isAnyItem,
    isArmor,
    isBandage,
    isHelmet,
    isLimbRestore,
    isPainkiller, isStim,
    isSyringe
} from "@/app/combat-sim/utils/types";

// Component for displaying item images with zoom functionality
const ItemImageDisplay: React.FC<{
    src: string;
    alt: string;
    className?: string;
}> = ({src, alt, className = ''}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    if (imageError) {
        // Fallback when image fails to load
        return (
            <div className={`flex items-center justify-center bg-military-800 ${className}`}>
                <div className="text-center p-4">
                    <div className="text-olive-500 mb-2 font-medium military-stencil">{alt}</div>
                    <div className="text-tan-400 text-sm">Image not available</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className} group`}>
            {/* Loading spinner */}
            {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-military-800 z-10">
                    <div
                        className="animate-spin w-8 h-8 border-2 border-olive-600 border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* Image */}
            <div
                className={`relative w-full h-full cursor-pointer transition-transform duration-200 hover:scale-105`}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain p-4"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    sizes="(max-width: 768px) 400px, 600px"
                    priority
                />
            </div>
        </div>
    );
};

// Helper to render stats based on item category
const renderCategorySpecificStats = (item: AnyItem) => {
    //FIXME remove log
    console.log(`render Item`, item);

    switch (item.category) {
        case 'weapons':
            return (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Fire Rate:</span>
                            <span className="text-tan-100">{item.stats.fireRate} rpm</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Crosshair size={18} className="text-olive-400"/>
                            <span className="text-tan-300">MOA:</span>
                            <span className="text-tan-100">{item.stats.MOA?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Caliber:</span>
                            <span className="text-tan-100">{item.stats.caliber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Ergonomics:</span>
                            <span className="text-tan-100">{(item.stats.ergonomics * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Fire Mode:</span>
                            <span className="text-tan-100">{FIRE_MODE_CONFIG[item.stats.fireMode]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Snail size={18} className="text-olive-400"/>
                            <span className="text-tan-300">ADS speed:</span>
                            <span className="text-tan-100">{(item.stats.ADSSpeed * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChevronsUpDown size={18} className="text-olive-400"/>
                            <span className="text-tan-400">Vertical Recoil:</span>
                            <span className="text-tan-100 font-mono">
                                        {(item.stats.recoilParameters.verticalRecoilControl * 100).toFixed(0)}%
                                    </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChevronsLeftRight size={18} className="text-olive-400"/>
                            <span className="text-tan-400">Horizontal Recoil:</span>
                            <span className="text-tan-100 font-mono">
                                        {(item.stats.recoilParameters.horizontalRecoilControl * 100).toFixed(0)}%
                                    </span>
                        </div>
                        {/* Fire Power with tooltip */}
                        <div className="flex items-center gap-2 relative group  cursor-help">
                            <HelpCircle size={18} className="text-olive-400 hover:text-olive-300"/>
                            <div
                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-xs text-tan-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                The more - the better. Ammo penetration power is affected by <span
                                className="text-olive-400">firing power - 0.5</span>.
                            </div>
                            <span className="text-tan-400">Fire Power:</span>
                            <span className="text-tan-100 font-mono">{item.stats.firingPower}</span>
                        </div>
                    </div>
                    {/*{item.stats.recoilParameters && (
                        <WeaponRecoilDisplay
                            recoilParameters={item.stats.recoilParameters}
                            className="mt-6"
                        />
                    )}*/}
                </>
            );
        case 'ammo':
            return (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Crosshair size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Damage:</span>
                            <span className="text-tan-100">{item.stats.damage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldX size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Penetration:</span>
                            <span className="text-tan-100">{item.stats.penetration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Velocity:</span>
                            <span className="text-tan-100">{item.stats.muzzleVelocity / 100} m/s</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-olive-400"/>
                            <span className="text-tan-300">Caliber:</span>
                            <span className="text-tan-100">{item.stats.caliber}</span>
                        </div>
                    </div>

                    {/* Damage modifiers */}
                    <div className="military-card p-4 rounded-sm mb-6">
                        <h4 className="text-lg font-bold text-olive-400 mb-3">Damage Modifiers</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-tan-400">Blunt Damage Scale:</span>
                                <span
                                    className="text-tan-100 ml-2">{(item.stats.bluntDamageScale * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="text-tan-400">Bleeding Chance:</span>
                                <span
                                    className="text-tan-100 ml-2">{(item.stats.bleedingChance * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="text-tan-400">Armor Pen Damage:</span>
                                <span
                                    className="text-tan-100 ml-2">{(item.stats.protectionGearPenetratedDamageScale * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="text-tan-400">Armor Blunt Damage:</span>
                                <span
                                    className="text-tan-100 ml-2">{(item.stats.protectionGearBluntDamageScale * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Ballistic curves */}
                    {item.stats.ballisticCurves && (
                        <>
                            <BallisticCurveChart
                                title="Damage Over Distance"
                                curves={[{
                                    name: 'Damage',
                                    data: item.stats.ballisticCurves.damageOverDistance,
                                    color: '#ef4444'
                                }]}
                                xLabel="Distance (cm)"
                                yLabel="Damage"
                                height={250}
                            />
                            <div className="mt-4">
                                <BallisticCurveChart
                                    title="Penetration Over Distance"
                                    curves={[{
                                        name: 'Penetration',
                                        data: item.stats.ballisticCurves.penetrationPowerOverDistance,
                                        color: '#9ba85e'
                                    }]}
                                    xLabel="Distance (cm)"
                                    yLabel="Penetration Power"
                                    height={250}
                                />
                            </div>
                        </>
                    )}
                </>
            );
        case 'gear':
            if (isArmor(item)) {
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <BowArrow size={18} className="text-olive-400"/>
                                <span className="text-tan-300">Penetration Damage</span>
                                <span
                                    className="text-tan-100">{(item.stats.penetrationDamageScalarCurve[1].value * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={18} className="text-olive-400"/>
                                <span className="text-tan-300">Max Durability:</span>
                                <span className="text-tan-100">{item.stats.maxDurability}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Gavel size={18} className="text-olive-400"/>
                                <span className="text-tan-300">Blunt Damage:</span>
                                <span className="text-tan-100">{(item.stats.bluntDamageScalar * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldMinus size={18} className="text-olive-400"/>
                                <span className="text-tan-300">Durability Damage:</span>
                                <span
                                    className="text-tan-100">{(item.stats.durabilityDamageScalar * 300).toFixed(0)}%</span>
                            </div>
                            {isHelmet(item) && (
                                <div className="flex items-center gap-2">
                                    <Volume2 size={18} className="text-olive-400"/>
                                    <span className="text-tan-300">Sound Dampening:</span>
                                    <span
                                        className="text-tan-100">{item.stats.soundMix === "default" ? "None" : (item.stats.soundMix === "OPSWAT" || item.stats.soundMix === "Delta") ? "Weak" : "Strong"}</span>
                                </div>
                            )}
                        </div>

                        {/* Protection zones */}
                        {item.stats.protectiveData && item.stats.protectiveData.length > 0 && (
                            <ArmorZonesDisplay
                                protectiveData={item.stats.protectiveData}
                                className="mb-6"
                            />
                        )}

                        {/* Penetration curves */}
                        {item.stats.penetrationChanceCurve && (
                            <BallisticCurveChart
                                title="Penetration Chance Curve"
                                curves={[{
                                    name: 'Penetration Chance',
                                    data: item.stats.penetrationChanceCurve,
                                    color: '#ef4444'
                                }]}
                                xLabel="Penetration - Armor Class"
                                yLabel="Chance"
                                height={250}
                            />
                        )}

                        {item.stats.penetrationDamageScalarCurve && (
                            <div className="mt-4">
                                <BallisticCurveChart
                                    title="Penetration Damage Scalar"
                                    curves={[{
                                        name: 'Damage Multiplier',
                                        data: item.stats.penetrationDamageScalarCurve,
                                        color: '#9ba85e'
                                    }]}
                                    xLabel="Armor Class - Penetration"
                                    yLabel="Damage Scalar"
                                    height={250}
                                />
                            </div>
                        )}

                        {item.stats.antiPenetrationDurabilityScalarCurve && (
                            <div className="mt-4">
                                <BallisticCurveChart
                                    title="Durability Effectiveness"
                                    curves={[{
                                        name: 'Armor Effectiveness',
                                        data: item.stats.antiPenetrationDurabilityScalarCurve,
                                        color: '#60a5fa'
                                    }]}
                                    xLabel="Missing Durability %"
                                    yLabel="Effectiveness"
                                    height={250}
                                />
                            </div>
                        )}
                    </>
                );
            }
            break;
        case 'medicine':
            return (
                <>
                    {/* Bandages */}
                    {isBandage(item) && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Bandage size={18} className="text-olive-400"/>
                                <span className="text-tan-400">Heals Deep Wound:</span>
                                <span className={`${item.stats.canHealDeepWound ? 'text-green-400' : 'text-red-400'}`}>
                                    {item.stats.canHealDeepWound ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    )}

                    {/* Limb Restorers */}
                    {isLimbRestore(item) && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Cross size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">Max HP Penalty:</span>
                                    <span
                                        className="text-tan-100">{(item.stats.hpPercentage * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">Use Time:</span>
                                    <span className="text-tan-100">{item.stats.useTime}s</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Hash size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">Uses Count:</span>
                                    <span className="text-tan-100">{item.stats.usesCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Bone size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">HP after restore:</span>
                                    <span className="text-tan-100">{item.stats.brokenHP}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Painkillers */}
                    {isPainkiller(item) && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Timer size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">Duration:</span>
                                    <span className="text-tan-100">{item.stats.effectTime}s</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Hash size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">Uses Count:</span>
                                    <span className="text-tan-100">{item.stats.usesCount}</span>
                                </div>
                            </div>
                            <div className="military-card p-4 rounded-sm">
                                <h4 className="text-olive-400 font-medium mb-3">Side Effects</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-tan-400">Energy Cost:</span>
                                        <span className="text-red-400">{(item.stats.energyFactor)}/s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-tan-400">Hydration Effect:</span>
                                        <span className="text-red-400">{(item.stats.hydraFactor)}/s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-tan-400">Side Effect Duration:</span>
                                        <span className="text-yellow-400">{item.stats.sideEffectTime}s</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Syringes */}
                    {isSyringe(item) && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Cross size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">Total Healing:</span>
                                    <span className="text-tan-100">{item.stats.capacity} HP</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Gauge size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">Healing Speed:</span>
                                    <span className="text-tan-100">{item.stats.cureSpeed} HP/s</span>
                                </div>
                            </div>
                            <div className="military-card p-4 rounded-sm">
                                <h4 className="text-olive-400 font-medium mb-3">Additional Effects</h4>
                                <div className="flex p-4 justify-between">
                                    <span className="text-tan-400">Reduce Bleeding:</span>
                                    <span
                                        className={`${item.stats.canReduceBleeding ? 'text-green-400' : 'text-red-400'}`}>
                                    {item.stats.canReduceBleeding ? 'Yes' : 'No'}
                                </span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Stims */}
                    {isStim(item) && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Gauge size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">Use Time:</span>
                                    <span className="text-tan-100">{item.stats.useTime}s</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer size={18} className="text-olive-400"/>
                                    <span className="text-tan-400">Effect Duration:</span>
                                    <span className="text-tan-100">{item.stats.effectTime}s</span>
                                </div>
                            </div>

                            <div className="military-card p-4 rounded-sm">
                                <h4 className="text-olive-400 font-medium mb-3">Usage Notes</h4>
                                <div className="space-y-2 text-sm">
                                    <p className="text-tan-300">
                                        High-performance combat stimulants with specialized effects. Use strategically
                                        before combat or specific activities.
                                    </p>
                                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-2 mt-2">
                                        <p className="text-yellow-200 text-xs">
                                            <strong>Warning:</strong> Some stimulants may have side effects like
                                            increased hunger/thirst consumption.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            );
        default:
            return null;
    }
};

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ItemDetail({params}: PageProps) {
    const {id} = React.use(params);
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadItem = async () => {
            try {
                const itemData = await getItemById(id);
                setItem(itemData || null);
            } catch (error) {
                console.error('Failed to load item:', error);
            } finally {
                setLoading(false);
            }
        };

        loadItem();
    }, [id]);


    // Show loading state
    if (loading) {
        return (
            <Layout title="Items Database">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="military-box p-8 rounded-sm text-center">
                            <div
                                className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Item</h2>
                            <p className="text-tan-300">Retrieving tactical equipment data...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Show error state
    if (!item) {
        return (
            <Layout title="Items Database">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="military-box p-8 rounded-sm text-center border-l-4 border-red-600">
                            <h2 className="text-xl font-bold text-red-400 mb-2">Item Not Found</h2>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const category = getCategoryById(item.category);

    return (
        <Layout title={`${item.name}`}>
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb navigation */}
                <div className="flex items-center gap-2 mb-6 text-tan-300">
                    <Link href="/items" className="flex items-center gap-1 hover:text-olive-400 transition-colors">
                        <ChevronLeft size={16}/>
                        <span>Items</span>
                    </Link>
                    <span>/</span>
                    <Link
                        href={`/items?category=${item.category}`}
                        className="hover:text-olive-400 transition-colors"
                    >
                        {category?.name}
                    </Link>
                    {item.subcategory && (
                        <>
                            <span>/</span>
                            <Link
                                href={`/items?category=${item.category}&subcategory=${item.subcategory}`}
                                className="hover:text-olive-400 transition-colors"
                            >
                                {item.subcategory}
                            </Link>
                        </>
                    )}
                </div>

                {/* Item header */}
                <div className={`mb-8 border-l-4 pl-4 ${getRarityBorderClass(item.stats.rarity)}`}>
                    <div className="inline-block px-2 py-0.5 bg-military-800/80 mb-1">
            <span className={`text-sm ${getRarityColorClass(item.stats.rarity)}`}>
              {item.stats.rarity}
            </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2">{item.name}</h1>
                    <div className="flex items-center gap-2 text-tan-300">
                        <span>{category?.name}</span>
                        {item.subcategory && (
                            <>
                                <span>•</span>
                                <span>{item.subcategory}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left column - Item image */}
                    <div className="md:col-span-1">
                        {/* Item image display */}
                        <div className="military-card rounded-sm p-4 overflow-hidden">
                            <div
                                className="aspect-square relative bg-military-950 rounded-sm overflow-hidden border border-military-700">
                                <ItemImageDisplay
                                    src={item.images.fullsize}
                                    alt={item.name}
                                    className="w-full h-full"
                                />
                            </div>
                        </div>

                        {/* Item price and basic stats */}
                        <div className="military-card rounded-sm mt-6 p-5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-tan-300">Market Value:</span>
                                <span
                                    className="text-olive-400 font-mono text-xl">{formatPrice(item.stats.price)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-tan-300">Weight:</span>
                                <span className="text-tan-100 font-mono">{formatWeight(item.stats.weight)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Item details */}
                    <div className="md:col-span-2">
                        <div className="military-box p-6 rounded-sm">
                            <h2 className="text-2xl font-bold text-olive-400 mb-4">Description</h2>
                            <p className="text-tan-200 mb-6 leading-relaxed">{item.description}</p>


                            <h2 className="text-2xl font-bold text-olive-400 mb-4">Specifications</h2>
                            <div className="mb-6">
                                {isAnyItem(item) && renderCategorySpecificStats(item)}
                            </div>

                            {item.tips && (
                                <>
                                    <h2 className="text-2xl font-bold text-olive-400 mb-4">Tactical Tips</h2>
                                    <div className="military-card p-4 rounded-sm border-l-4 border-olive-600">
                                        <p className="text-tan-200 leading-relaxed">{item.tips}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
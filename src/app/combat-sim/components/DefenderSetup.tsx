import React, {useState, useEffect, useMemo, useRef} from 'react';
import {ChevronDown, Shield, HardHat, Info, ExternalLink, X, Eye} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
    DefenderSetup as DefenderSetupType,
    isArmor, isBodyArmor, isFaceShield, isHelmet
} from '../utils/types';
import {fetchItemsData} from '@/services/ItemService';
import {Armor, FaceShield, getRarityColorClass, Item} from '@/types/items';
import {getArmorClassColor} from '../utils/body-zones';

interface DefenderSetupProps {
    defender: DefenderSetupType;
    onUpdate: (updates: Partial<DefenderSetupType>) => void;
}

export default function DefenderSetup({defender, onUpdate}: DefenderSetupProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [bodyArmorSearchOpen, setBodyArmorSearchOpen] = useState(false);
    const [helmetSearchOpen, setHelmetSearchOpen] = useState(false);
    const [bodyArmorSearch, setBodyArmorSearch] = useState('');
    const [helmetSearch, setHelmetSearch] = useState('');

    // Refs for dropdown containers
    const bodyArmorDropdownRef = useRef<HTMLDivElement>(null);
    const helmetDropdownRef = useRef<HTMLDivElement>(null);

    // Load items data
    useEffect(() => {
        const loadItems = async () => {
            try {
                const data = await fetchItemsData();
                setItems(data);
            } catch (error) {
                console.error('Failed to load items:', error);
            } finally {
                setLoading(false);
            }
        };
        loadItems();
    }, []);

    // Handle clicking outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bodyArmorDropdownRef.current && !bodyArmorDropdownRef.current.contains(event.target as Node)) {
                setBodyArmorSearchOpen(false);
            }
            if (helmetDropdownRef.current && !helmetDropdownRef.current.contains(event.target as Node)) {
                setHelmetSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter armors
    const armors = useMemo(() => {
        const armorItems = items.filter(isArmor).sort((a, b) => {
            // Sort by armor class descending, then by name
            const classDiff = (b.stats.armorClass || 0) - (a.stats.armorClass || 0);
            if (classDiff !== 0) return classDiff;
            return a.name.localeCompare(b.name);
        });
        return armorItems as Armor[];
    }, [items]);

    // Separate body armors and helmets
    const bodyArmors = useMemo(() =>
            armors.filter(isBodyArmor),
        [armors]
    );

    const helmets = useMemo(() =>
            armors.filter(isHelmet),
        [armors]
    );

    const faceShieldsMap: Map<string, FaceShield> = useMemo(() =>
        armors.reduce((map, element) => {
            if (isFaceShield(element)) {
                map.set(element.id, element);
            }
            return map;
        }, new Map()),

        [armors]
    );

    // Filter based on search
    const filteredBodyArmors = useMemo(() => {
        if (!bodyArmorSearch) return bodyArmors;
        const search = bodyArmorSearch.toLowerCase();
        return bodyArmors.filter(a =>
            a.name.toLowerCase().includes(search) ||
            a.stats.armorClass?.toString().includes(search)
        );
    }, [bodyArmors, bodyArmorSearch]);

    const filteredHelmets = useMemo(() => {
        if (!helmetSearch) return helmets;
        const search = helmetSearch.toLowerCase();
        return helmets.filter(h =>
            h.name.toLowerCase().includes(search) ||
            h.stats.armorClass?.toString().includes(search)
        );
    }, [helmets, helmetSearch]);

    // Format durability percentage
    const formatDurability = (durability: number) => {
        if (durability >= 80) return 'text-green-400';
        if (durability >= 60) return 'text-yellow-400';
        if (durability >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    if (loading) {
        return (
            <div className="military-card p-4 rounded-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-military-700 rounded w-1/3 mb-3"></div>
                    <div className="h-10 bg-military-700 rounded mb-2"></div>
                    <div className="h-20 bg-military-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Body Armor Section */}
            <div className="military-card p-4 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Shield size={20} className="text-olive-400"/>
                    <h3 className="font-bold text-tan-100">Body Armor</h3>
                </div>

                {/* Armor Selection */}
                <div className="mb-3" ref={bodyArmorDropdownRef}>
                    <label className="block text-tan-300 text-xs font-medium mb-1">
                        Armor
                        {defender.bodyArmor && (
                            <Link
                                href={`/items/${defender.bodyArmor.id}`}
                                className="ml-2 inline-flex items-center gap-1 text-olive-400 hover:text-olive-300"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="text-xs">View</span>
                                <ExternalLink size={10}/>
                            </Link>
                        )}
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => {
                                setBodyArmorSearchOpen(!bodyArmorSearchOpen);
                                setHelmetSearchOpen(false);
                            }}
                            className="w-full px-2 py-2 bg-military-800 border border-military-700 rounded-sm text-left
        hover:border-olive-600 transition-colors flex items-center justify-between gap-2"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {defender.bodyArmor && (
                                    <div className="w-10 h-10 relative flex-shrink-0 bg-military-700 rounded-sm p-0.5">
                                        <Image
                                            src={defender.bodyArmor.images.icon}
                                            alt={defender.bodyArmor.name}
                                            fill
                                            className="object-contain"
                                            sizes="40px"
                                        />
                                    </div>
                                )}
                                <span className={`truncate ${defender.bodyArmor ? getRarityColorClass(defender.bodyArmor.stats.rarity) : 'text-tan-400'}`}>
                                    {defender.bodyArmor ? defender.bodyArmor.name : 'No armor equipped'}
                                </span>
                            </div>
                            <ChevronDown size={16} className="text-olive-400 flex-shrink-0"/>
                        </button>

                        {/* Armor Dropdown */}
                        {bodyArmorSearchOpen && (
                            <div
                                className="absolute z-10 w-full mt-1 bg-military-800 border border-military-700 rounded-sm shadow-lg">
                                <div className="p-2 border-b border-military-700">
                                    <input
                                        type="text"
                                        placeholder="Search body armor..."
                                        value={bodyArmorSearch}
                                        onChange={(e) => setBodyArmorSearch(e.target.value)}
                                        className="w-full px-2 py-1 bg-military-900 border border-military-600 rounded-sm
                            text-tan-100 placeholder-tan-400 text-sm focus:outline-none focus:border-olive-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    <button
                                        onClick={() => {
                                            onUpdate({bodyArmor: undefined, bodyArmorDurability: 100});
                                            setBodyArmorSearchOpen(false);
                                            setBodyArmorSearch('');
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-military-700 transition-colors text-sm"
                                    >
                                        <div className="text-tan-400">No armor (unprotected)</div>
                                    </button>
                                    {filteredBodyArmors.map(armor => (
                                        <button
                                            key={armor.id}
                                            onClick={() => {
                                                onUpdate({
                                                    bodyArmor: armor,
                                                    bodyArmorDurability: 100
                                                });
                                                setBodyArmorSearchOpen(false);
                                                setBodyArmorSearch('');
                                            }}
                                            className="w-full px-2 py-2 bg-military-800 border border-military-700 rounded-sm text-left
        hover:border-olive-600 transition-colors flex items-center justify-between gap-2"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div
                                                    className="w-10 h-10 relative flex-shrink-0 bg-military-700 rounded-sm p-0.5">
                                                    <Image
                                                        src={armor.images.icon}
                                                        alt={armor.name}
                                                        fill
                                                        className="object-contain"
                                                        sizes="40px"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className={`${getRarityColorClass(armor.stats.rarity)} truncate`}>{armor.name}</div>
                                                    <div className="text-tan-400 text-xs flex gap-3">
                                                            <span
                                                                className={getArmorClassColor(armor.stats.armorClass).text}>
                                                                Class {armor.stats.armorClass}
                                                            </span>
                                                        <span>Durability: {armor.stats.maxDurability}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Armor Stats */}
                {defender.bodyArmor && (
                    <div className="mt-2 space-y-2">
                        <div className="text-xs text-tan-400 flex gap-3">
                            <span className={getArmorClassColor(defender.bodyArmor.stats.armorClass).text}>
                                Class {defender.bodyArmor.stats.armorClass}
                            </span>
                            <span>Max Durability: {defender.bodyArmor.stats.maxDurability}</span>
                            <span>Price: {defender.bodyArmor.stats.price} EZD</span>
                        </div>

                        {/* Durability Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-tan-300">Durability</span>
                                <span
                                    className={`text-xs font-medium ${formatDurability(defender.bodyArmorDurability)}`}>
                                    {defender.bodyArmorDurability}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={defender.bodyArmorDurability}
                                onChange={(e) => onUpdate({bodyArmorDurability: Number(e.target.value)})}
                                className="w-full h-2 bg-military-700 rounded-sm appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                [&::-webkit-slider-thumb]:bg-olive-500 [&::-webkit-slider-thumb]:rounded-sm
                                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                                [&::-moz-range-thumb]:bg-olive-500 [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:border-0"
                            />
                            <div className="flex justify-between text-xs text-tan-400">
                                <span>Broken</span>
                                <span>Pristine</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Helmet Section */}
            <div className="military-card p-4 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                    <HardHat size={20} className="text-olive-400"/>
                    <h3 className="font-bold text-tan-100">Helmet</h3>
                </div>

                {/* Helmet Selection */}
                <div className="mb-3" ref={helmetDropdownRef}>
                    <label className="block text-tan-300 text-xs font-medium mb-1">
                        Helmet
                        {defender.helmet && (
                            <Link
                                href={`/items/${defender.helmet.id}`}
                                className="ml-2 inline-flex items-center gap-1 text-olive-400 hover:text-olive-300"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="text-xs">View</span>
                                <ExternalLink size={10}/>
                            </Link>
                        )}
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => {
                                setHelmetSearchOpen(!helmetSearchOpen);
                                setBodyArmorSearchOpen(false);
                            }}
                            className="w-full px-2 py-2 bg-military-800 border border-military-700 rounded-sm text-left
        hover:border-olive-600 transition-colors flex items-center justify-between gap-2"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {defender.helmet && (
                                    <div className="w-10 h-10 relative flex-shrink-0 bg-military-700 rounded-sm p-0.5">
                                        <Image
                                            src={defender.helmet.images.icon}
                                            alt={defender.helmet.name}
                                            fill
                                            className="object-contain"
                                            sizes="40px"
                                        />
                                    </div>
                                )}
                                <span className={`truncate ${defender.helmet ? getRarityColorClass(defender.helmet.stats.rarity) : 'text-tan-400'}`}>
                                    {defender.helmet ? defender.helmet.name : 'No helmet equipped'}
                                </span>
                            </div>
                            <ChevronDown size={16} className="text-olive-400 flex-shrink-0"/>
                        </button>

                        {/* Helmet Dropdown */}
                        {helmetSearchOpen && (
                            <div
                                className="absolute z-10 w-full mt-1 bg-military-800 border border-military-700 rounded-sm shadow-lg">
                                <div className="p-2 border-b border-military-700">
                                    <input
                                        type="text"
                                        placeholder="Search helmets..."
                                        value={helmetSearch}
                                        onChange={(e) => setHelmetSearch(e.target.value)}
                                        className="w-full px-2 py-1 bg-military-900 border border-military-600 rounded-sm
                            text-tan-100 placeholder-tan-400 text-sm focus:outline-none focus:border-olive-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    <button
                                        onClick={() => {
                                            onUpdate({helmet: undefined, helmetDurability: 100});
                                            setHelmetSearchOpen(false);
                                            setHelmetSearch('');
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-military-700 transition-colors text-sm"
                                    >
                                        <div className="text-tan-400">No helmet (unprotected)</div>
                                    </button>
                                    {filteredHelmets.map(helmet => (
                                        <button
                                            key={helmet.id}
                                            onClick={() => {
                                                onUpdate({
                                                    helmet: helmet,
                                                    helmetDurability: 100
                                                });
                                                setHelmetSearchOpen(false);
                                                setHelmetSearch('');
                                            }}
                                            className="w-full px-2 py-2 text-left hover:bg-military-700 transition-colors text-sm"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div
                                                    className="w-10 h-10 relative flex-shrink-0 bg-military-700 rounded-sm p-0.5">
                                                    <Image
                                                        src={helmet.images.icon}
                                                        alt={helmet.name}
                                                        fill
                                                        className="object-contain"
                                                        sizes="40px"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className={`${getRarityColorClass(helmet.stats.rarity)} truncate`}>{helmet.name}</div>
                                                    <div className="text-tan-400 text-xs flex gap-3">
                                                            <span
                                                                className={getArmorClassColor(helmet.stats.armorClass).text}>
                                                                Class {helmet.stats.armorClass}
                                                            </span>
                                                        <span>Durability: {helmet.stats.maxDurability}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Helmet Stats */}
                {defender.helmet && (
                    <div className="mt-2 space-y-2">
                        {/* Face Shield Section - Only show if helmet has canAttach options */}
                        {defender.helmet.stats.canAttach && defender.helmet.stats.canAttach.length > 0 && (
                            <div>
                                <label className="block text-tan-300 text-xs font-medium mb-1">
                                    Face Shield
                                </label>
                                <div className="flex items-center gap-2 overflow-x-auto">
                                    {/* Available face shields */}
                                    {defender.helmet.stats.canAttach.map((shieldId) => {
                                        const shield = faceShieldsMap.get(shieldId);
                                        if (!shield) return null;
                                        const isSelected = defender.faceShield && defender.faceShield.id === shield.id;

                                        return (
                                            <button
                                                key={shieldId}
                                                onClick={() => onUpdate({ faceShield: isSelected ? null : shield})}
                                                className={`flex-shrink-0 rounded-sm p-0 transition-all ${
                                                    isSelected
                                                        ? 'bg-olive-600/20 border-2 border-olive-500 shadow-md'
                                                        : 'bg-military-900 border-2 border-military-700 hover:border-military-600 hover:bg-military-800'
                                                }`}
                                                title={shield.name}
                                            >
                                                <div className="w-10 h-10 relative bg-military-700/50 rounded-sm overflow-hidden">
                                                    <Image
                                                        src={shield.images.icon}
                                                        alt={shield.name}
                                                        fill
                                                        className="object-contain"
                                                        sizes="40px"
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="text-xs text-tan-400 flex gap-3">
                            <span className={getArmorClassColor(defender.helmet.stats.armorClass).text}>
                                Class {defender.helmet.stats.armorClass}
                            </span>
                            <span>Max Durability: {defender.helmet.stats.maxDurability}</span>
                            <span>Price: {defender.helmet.stats.price} EZD</span>
                        </div>



                        {/* Durability Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-tan-300">Durability</span>
                                <span className={`text-xs font-medium ${formatDurability(defender.helmetDurability)}`}>
                                    {defender.helmetDurability}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={defender.helmetDurability}
                                onChange={(e) => onUpdate({helmetDurability: Number(e.target.value)})}
                                className="w-full h-2 bg-military-700 rounded-sm appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                [&::-webkit-slider-thumb]:bg-olive-500 [&::-webkit-slider-thumb]:rounded-sm
                                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                                [&::-moz-range-thumb]:bg-olive-500 [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:border-0"
                            />
                            <div className="flex justify-between text-xs text-tan-400">
                                <span>Broken</span>
                                <span>Pristine</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Defense Summary */}
            <div className="military-card p-4 rounded-sm bg-military-900">
                <div className="flex items-center gap-2 mb-3">
                    <Info size={16} className="text-olive-400"/>
                    <h4 className="font-medium text-tan-300 text-sm">Defense Summary</h4>
                </div>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-tan-400">Total Protection Value:</span>
                        <span className="text-tan-100">
                            ${((defender.bodyArmor?.stats.price || 0) + (defender.helmet?.stats.price || 0)).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-tan-400">Body Protection:</span>
                        <span
                            className={defender.bodyArmor ? getArmorClassColor(defender.bodyArmor.stats.armorClass).text : 'text-tan-300'}>
                            {defender.bodyArmor ? `Class ${defender.bodyArmor.stats.armorClass}` : 'None'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-tan-400">Head Protection:</span>
                        <span
                            className={defender.helmet ? getArmorClassColor(defender.helmet.stats.armorClass).text : 'text-tan-300'}>
                            {defender.helmet ? `Class ${defender.helmet.stats.armorClass}` : 'None'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
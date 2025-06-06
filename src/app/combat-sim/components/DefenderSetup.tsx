import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Shield, HardHat, Info } from 'lucide-react';
import {
    DefenderSetup as DefenderSetupType,
    isArmor, isBodyArmor, isHelmet
} from '../utils/types';
import { fetchItemsData } from '@/services/ItemService';
import {Armor, Item} from '@/types/items';
import { getArmorClassColor } from '../utils/body-zones';

interface DefenderSetupProps {
    defender: DefenderSetupType;
    onUpdate: (updates: Partial<DefenderSetupType>) => void;
}

export default function DefenderSetup({ defender, onUpdate }: DefenderSetupProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [bodyArmorSearchOpen, setBodyArmorSearchOpen] = useState(false);
    const [helmetSearchOpen, setHelmetSearchOpen] = useState(false);
    const [bodyArmorSearch, setBodyArmorSearch] = useState('');
    const [helmetSearch, setHelmetSearch] = useState('');

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
                    <Shield size={20} className="text-olive-400" />
                    <h3 className="font-bold text-tan-100">Body Armor</h3>
                </div>

                {/* Armor Selection */}
                <div className="mb-3">
                    <div className="relative">
                        <button
                            onClick={() => setBodyArmorSearchOpen(!bodyArmorSearchOpen)}
                            className="w-full px-3 py-2 bg-military-800 border border-military-700 rounded-sm text-left
                hover:border-olive-600 transition-colors flex items-center justify-between"
                        >
              <span className={defender.bodyArmor ? 'text-tan-100' : 'text-tan-400'}>
                {defender.bodyArmor ? defender.bodyArmor.name : 'No armor equipped'}
              </span>
                            <ChevronDown size={16} className="text-olive-400" />
                        </button>

                        {/* Body Armor Dropdown */}
                        {bodyArmorSearchOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-military-800 border border-military-700 rounded-sm shadow-lg">
                                <div className="p-2 border-b border-military-700">
                                    <input
                                        type="text"
                                        placeholder="Search body armor..."
                                        value={bodyArmorSearch}
                                        onChange={(e) => setBodyArmorSearch(e.target.value)}
                                        className="w-full px-2 py-1 bg-military-900 border border-military-600 rounded-sm
                      text-tan-100 placeholder-tan-400 text-sm focus:outline-none focus:border-olive-500"
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {/* No Armor Option */}
                                    <button
                                        onClick={() => {
                                            onUpdate({ bodyArmor: null });
                                            setBodyArmorSearchOpen(false);
                                            setBodyArmorSearch('');
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-military-700 transition-colors text-sm
                      border-b border-military-700"
                                    >
                                        <div className="text-tan-400">No armor</div>
                                    </button>

                                    {filteredBodyArmors.length > 0 ? (
                                        filteredBodyArmors.map(armor => {
                                            const armorColor = getArmorClassColor(armor.stats.armorClass);
                                            return (
                                                <button
                                                    key={armor.id}
                                                    onClick={() => {
                                                        onUpdate({ bodyArmor: armor });
                                                        setBodyArmorSearchOpen(false);
                                                        setBodyArmorSearch('');
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-military-700 transition-colors text-sm"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-tan-100">{armor.name}</div>
                                                            <div className="text-tan-400 text-xs flex items-center gap-3">
                                <span className={`flex items-center gap-1 ${armorColor.text}`}>
                                  <Shield size={12} />
                                  Class {armor.stats.armorClass}
                                </span>
                                                                <span>Durability: {armor.stats.maxDurability}</span>
                                                                <span>Price: {armor.stats.maxDurability} EZD</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="px-3 py-4 text-center text-tan-400 text-sm">
                                            No body armor found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Armor Stats */}
                    {defender.bodyArmor && (
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-tan-400">Protection:</span>
                                <span className={getArmorClassColor(defender.bodyArmor.stats.armorClass).text}>
                  Class {defender.bodyArmor.stats.armorClass}
                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-tan-400">Max Durability:</span>
                                <span className="text-tan-300">{defender.bodyArmor.stats.maxDurability}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Durability Slider */}
                {defender.bodyArmor && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-tan-400 text-xs">Current Durability</label>
                            <span className={`text-sm font-mono ${formatDurability(defender.bodyArmorDurability)}`}>
                {defender.bodyArmorDurability}%
              </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={defender.bodyArmorDurability}
                            onChange={(e) => onUpdate({ bodyArmorDurability: parseInt(e.target.value) })}
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
                )}
            </div>

            {/* Helmet Section */}
            <div className="military-card p-4 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                    <HardHat size={20} className="text-olive-400" />
                    <h3 className="font-bold text-tan-100">Helmet</h3>
                </div>

                {/* Helmet Selection */}
                <div className="mb-3">
                    <div className="relative">
                        <button
                            onClick={() => setHelmetSearchOpen(!helmetSearchOpen)}
                            className="w-full px-3 py-2 bg-military-800 border border-military-700 rounded-sm text-left
                hover:border-olive-600 transition-colors flex items-center justify-between"
                        >
              <span className={defender.helmet ? 'text-tan-100' : 'text-tan-400'}>
                {defender.helmet ? defender.helmet.name : 'No helmet equipped'}
              </span>
                            <ChevronDown size={16} className="text-olive-400" />
                        </button>

                        {/* Helmet Dropdown */}
                        {helmetSearchOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-military-800 border border-military-700 rounded-sm shadow-lg">
                                <div className="p-2 border-b border-military-700">
                                    <input
                                        type="text"
                                        placeholder="Search helmets..."
                                        value={helmetSearch}
                                        onChange={(e) => setHelmetSearch(e.target.value)}
                                        className="w-full px-2 py-1 bg-military-900 border border-military-600 rounded-sm
                      text-tan-100 placeholder-tan-400 text-sm focus:outline-none focus:border-olive-500"
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {/* No Helmet Option */}
                                    <button
                                        onClick={() => {
                                            onUpdate({ helmet: null });
                                            setHelmetSearchOpen(false);
                                            setHelmetSearch('');
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-military-700 transition-colors text-sm
                      border-b border-military-700"
                                    >
                                        <div className="text-tan-400">No helmet</div>
                                    </button>

                                    {filteredHelmets.length > 0 ? (
                                        filteredHelmets.map(helmet => {
                                            const armorColor = getArmorClassColor(helmet.stats.armorClass);
                                            return (
                                                <button
                                                    key={helmet.id}
                                                    onClick={() => {
                                                        onUpdate({ helmet: helmet });
                                                        setHelmetSearchOpen(false);
                                                        setHelmetSearch('');
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-military-700 transition-colors text-sm"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-tan-100">{helmet.name}</div>
                                                            <div className="text-tan-400 text-xs flex items-center gap-3">
                                <span className={`flex items-center gap-1 ${armorColor.text}`}>
                                  <Shield size={12} />
                                  Class {helmet.stats.armorClass}
                                </span>
                                                                <span>Durability: {helmet.stats.maxDurability}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-tan-300 text-xs">
                                                            {helmet.stats.price.toLocaleString()} EZD
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="px-3 py-4 text-center text-tan-400 text-sm">
                                            No helmets found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Helmet Stats */}
                    {defender.helmet && (
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-tan-400">Protection:</span>
                                <span className={getArmorClassColor(defender.helmet.stats.armorClass).text}>
                  Class {defender.helmet.stats.armorClass}
                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-tan-400">Max Durability:</span>
                                <span className="text-tan-300">{defender.helmet.stats.maxDurability}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Durability Slider */}
                {defender.helmet && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-tan-400 text-xs">Current Durability</label>
                            <span className={`text-sm font-mono ${formatDurability(defender.helmetDurability)}`}>
                {defender.helmetDurability}%
              </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={defender.helmetDurability}
                            onChange={(e) => onUpdate({ helmetDurability: parseInt(e.target.value) })}
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
                )}
            </div>

            {/* Defense Summary */}
            <div className="military-card p-4 rounded-sm bg-military-900">
                <div className="flex items-center gap-2 mb-3">
                    <Info size={16} className="text-olive-400" />
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
                        <span className={defender.bodyArmor ? getArmorClassColor(defender.bodyArmor.stats.armorClass).text : 'text-tan-300'}>
              {defender.bodyArmor ? `Class ${defender.bodyArmor.stats.armorClass}` : 'None'}
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-tan-400">Head Protection:</span>
                        <span className={defender.helmet ? getArmorClassColor(defender.helmet.stats.armorClass).text : 'text-tan-300'}>
              {defender.helmet ? `Class ${defender.helmet.stats.armorClass}` : 'None'}
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
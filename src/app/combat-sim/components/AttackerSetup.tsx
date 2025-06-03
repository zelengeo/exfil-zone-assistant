import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, AlertCircle } from 'lucide-react';
import {
    AttackerSetup as AttackerSetupType,
    isWeapon,
    isAmmunition,
    areWeaponAmmoCompatible
} from '../utils/types';
import { fetchItemsData } from '@/services/ItemService';
import {Ammunition, Item, Weapon} from '@/types/items';

interface AttackerSetupProps {
    attacker: AttackerSetupType;
    index: number;
    onUpdate: (updates: Partial<AttackerSetupType>) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export default function AttackerSetup({
                                          attacker,
                                          index,
                                          onUpdate,
                                          onRemove,
                                          canRemove
                                      }: AttackerSetupProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    //TODO - onClick close dropdowns
    const [weaponSearchOpen, setWeaponSearchOpen] = useState(false);
    const [ammoSearchOpen, setAmmoSearchOpen] = useState(false);
    const [weaponSearch, setWeaponSearch] = useState('');
    const [ammoSearch, setAmmoSearch] = useState('');

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

    // Filter weapons and ammo
    const weapons = useMemo(() =>
            items.filter(isWeapon).sort((a, b) => b.stats.price - a.stats.price),
        [items]
    );

    const ammunitions = useMemo(() =>
            items.filter(isAmmunition).sort((a, b) => b.stats.penetration - a.stats.penetration),
        [items]
    );

    // Get compatible ammo for selected weapon
    const compatibleAmmo = useMemo(() => {
        if (!attacker.weapon) return ammunitions;

        const weaponCaliber = attacker.weapon.stats.caliber;
        return ammunitions.filter(ammo => {
            return weaponCaliber === ammo.stats.caliber;
        });
    }, [attacker.weapon, ammunitions]);

    // Filter based on search
    const filteredWeapons = useMemo(() => {
        if (!weaponSearch) return weapons;
        const search = weaponSearch.toLowerCase();
        return weapons.filter(w =>
            w.name.toLowerCase().includes(search) ||
            w.stats?.caliber?.toLowerCase().includes(search)
        );
    }, [weapons, weaponSearch]);

    const filteredAmmo = useMemo(() => {
        const ammoList = attacker.weapon ? compatibleAmmo : ammunitions;
        if (!ammoSearch) return ammoList;
        const search = ammoSearch.toLowerCase();
        return ammoList.filter(a =>
            a.name.toLowerCase().includes(search) ||
            a.stats?.caliber?.toLowerCase().includes(search)
        );
    }, [compatibleAmmo, ammunitions, ammoSearch, attacker.weapon]);

    // Check if current setup is valid
    const isValidSetup = attacker.weapon && attacker.ammo &&
        areWeaponAmmoCompatible(attacker.weapon, attacker.ammo);

    const hasIncompatibleAmmo = attacker.weapon && attacker.ammo &&
        !areWeaponAmmoCompatible(attacker.weapon, attacker.ammo);

    // Format fire rate display
    const formatFireRate = (fireRate?: number) => {
        if (!fireRate) return 'N/A';
        return `${fireRate} RPM`;
    };

    if (loading) {
        return (
            <div className="military-card p-4 rounded-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-military-700 rounded w-1/3 mb-3"></div>
                    <div className="h-10 bg-military-700 rounded mb-2"></div>
                    <div className="h-10 bg-military-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`military-card p-4 rounded-sm border-2 ${attacker.color.class.replace('text-', 'border-')}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-sm ${attacker.color.class.replace('text-', 'bg-')}`} />
                    <span className="font-bold text-tan-100">Attacker {index + 1}</span>
                </div>
                {canRemove && (
                    <button
                        onClick={onRemove}
                        className="text-red-400 hover:text-red-300 p-1 rounded-sm hover:bg-military-700 transition-colors"
                        title="Remove attacker"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Weapon Selection */}
            <div className="mb-3">
                <label className="block text-tan-300 text-xs font-medium mb-1">Weapon</label>
                <div className="relative">
                    <button
                        onClick={() => {
                            setWeaponSearchOpen(!weaponSearchOpen);
                            setAmmoSearchOpen(false);
                        }}
                        className="w-full px-3 py-2 bg-military-800 border border-military-700 rounded-sm text-left
              hover:border-olive-600 transition-colors flex items-center justify-between"
                    >
            <span className={attacker.weapon ? 'text-tan-100' : 'text-tan-400'}>
              {attacker.weapon ? attacker.weapon.name : 'Select weapon...'}
            </span>
                        <ChevronDown size={16} className="text-olive-400" />
                    </button>

                    {/* Weapon Dropdown */}
                    {weaponSearchOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-military-800 border border-military-700 rounded-sm shadow-lg">
                            <div className="p-2 border-b border-military-700">
                                <input
                                    type="text"
                                    placeholder="Search weapons..."
                                    value={weaponSearch}
                                    onChange={(e) => setWeaponSearch(e.target.value)}
                                    className="w-full px-2 py-1 bg-military-900 border border-military-600 rounded-sm
                    text-tan-100 placeholder-tan-400 text-sm focus:outline-none focus:border-olive-500"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {filteredWeapons.length > 0 ? (
                                    filteredWeapons.map(weapon => (
                                        <button
                                            key={weapon.id}
                                            onClick={() => {
                                                onUpdate({ weapon: weapon as Weapon });
                                                setWeaponSearchOpen(false);
                                                setWeaponSearch('');
                                                // Clear ammo if incompatible
                                                if (attacker.ammo && !areWeaponAmmoCompatible(weapon as Weapon, attacker.ammo)) {
                                                    onUpdate({ weapon: weapon as Weapon, ammo: null });
                                                }
                                            }}
                                            className="w-full px-3 py-2 text-left hover:bg-military-700 transition-colors
                        flex items-center justify-between text-sm"
                                        >
                                            <div>
                                                <div className="text-tan-100">{weapon.name}</div>
                                                <div className="text-tan-400 text-xs">{weapon.subcategory}</div>
                                            </div>
                                            <div className="text-tan-300 text-xs">
                                                {formatFireRate(weapon.stats.fireRate)}
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-4 text-center text-tan-400 text-sm">
                                        No weapons found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Weapon Stats */}
                {attacker.weapon && (
                    <div className="mt-1 text-xs text-tan-400 flex gap-3">
                        <span>Fire Rate: {formatFireRate(attacker.weapon.stats.fireRate)}</span>
                        {attacker.weapon.stats.ergonomics && (
                            <span>Ergo: {(attacker.weapon.stats.ergonomics * 100).toFixed(0)}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Ammo Selection */}
            <div className="mb-3">
                <label className="block text-tan-300 text-xs font-medium mb-1">
                    Ammunition
                    {attacker.weapon && (
                        <span className="text-olive-400 ml-1">
              ({attacker.weapon.subcategory || attacker.weapon.stats.caliber})
            </span>
                    )}
                </label>
                <div className="relative">
                    <button
                        onClick={() => {
                            setAmmoSearchOpen(!ammoSearchOpen);
                            setWeaponSearchOpen(false);
                        }}
                        className={`w-full px-3 py-2 bg-military-800 border rounded-sm text-left 
              transition-colors flex items-center justify-between
              ${!attacker.weapon
                            ? 'border-military-700 opacity-50 cursor-not-allowed'
                            : hasIncompatibleAmmo
                                ? 'border-red-600 hover:border-red-500'
                                : 'border-military-700 hover:border-olive-600'
                        }`}
                        disabled={!attacker.weapon}
                    >
            <span className={attacker.ammo ? 'text-tan-100' : 'text-tan-400'}>
              {attacker.ammo ? attacker.ammo.name : 'Select ammo...'}
            </span>
                        <ChevronDown size={16} className="text-olive-400" />
                    </button>

                    {/* Ammo Dropdown */}
                    {ammoSearchOpen && attacker.weapon && (
                        <div className="absolute z-10 w-full mt-1 bg-military-800 border border-military-700 rounded-sm shadow-lg">
                            <div className="p-2 border-b border-military-700">
                                <input
                                    type="text"
                                    placeholder="Search ammunition..."
                                    value={ammoSearch}
                                    onChange={(e) => setAmmoSearch(e.target.value)}
                                    className="w-full px-2 py-1 bg-military-900 border border-military-600 rounded-sm
                    text-tan-100 placeholder-tan-400 text-sm focus:outline-none focus:border-olive-500"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {filteredAmmo.length > 0 ? (
                                    filteredAmmo.map(ammo => (
                                        <button
                                            key={ammo.id}
                                            onClick={() => {
                                                onUpdate({ ammo: ammo as Ammunition });
                                                setAmmoSearchOpen(false);
                                                setAmmoSearch('');
                                            }}
                                            className="w-full px-3 py-2 text-left hover:bg-military-700 transition-colors text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-tan-100">{ammo.name}</div>
                                                    <div className="text-tan-400 text-xs flex gap-3">
                                                        <span>DMG: {ammo.stats.damage}</span>
                                                        <span>PEN: {ammo.stats.penetration}</span>
                                                        <span> {ammo.stats.price} EZD</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-4 text-center text-tan-400 text-sm">
                                        No compatible ammunition found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Ammo Stats */}
                {attacker.ammo && (
                    <div className="mt-1 text-xs text-tan-400 flex gap-3">
                        <span>Damage: {attacker.ammo.stats.damage}</span>
                        <span>Penetration: {attacker.ammo.stats.penetration}</span>
                        <span>Price: {attacker.ammo.stats.price} EZD</span>
                    </div>
                )}

                {/* Incompatibility Warning */}
                {hasIncompatibleAmmo && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle size={12} />
                        <span>Incompatible with {attacker.weapon?.name || "undefined"}</span>
                    </div>
                )}
            </div>

            {/* Setup Summary - useless for now*/}
            {/*{isValidSetup && (
                <div className="mt-3 pt-3 border-t border-military-700">
                    <div className="text-xs text-tan-300">
                        <div className="flex justify-between mb-1">
                            <span>Total Setup:</span>
                            <span className="text-tan-100">
                ${(attacker.weapon!.stats.price + attacker.ammo!.stats.price).toLocaleString()}
              </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Caliber:</span>
                            <span className="text-olive-400">
                {attacker.ammo!.stats.caliber || attacker.ammo!.subcategory}
              </span>
                        </div>
                    </div>
                </div>
            )}*/}
        </div>
    );
}
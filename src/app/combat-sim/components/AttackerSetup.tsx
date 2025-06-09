import React, {useState, useEffect, useMemo, useRef} from 'react';
import {X, ChevronDown, AlertCircle, ExternalLink} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
    AttackerSetup as AttackerSetupType,
    isWeapon,
    isAmmunition,
    areWeaponAmmoCompatible, ATTACKER_COLORS
} from '../utils/types';
import {fetchItemsData} from '@/services/ItemService';
import {Ammunition, getRarityColorClass, Item, Weapon} from '@/types/items';

interface AttackerSetupProps {
    attacker: AttackerSetupType;
    index: number;
    onUpdate: (updates: Partial<AttackerSetupType>) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export default function AttackerSetup({
                                          attacker,
                                          onUpdate,
                                          onRemove,
                                          canRemove
                                      }: AttackerSetupProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [weaponSearchOpen, setWeaponSearchOpen] = useState(false);
    const [ammoSearchOpen, setAmmoSearchOpen] = useState(false);
    const [weaponSearch, setWeaponSearch] = useState('');
    const [ammoSearch, setAmmoSearch] = useState('');

    // Refs for dropdown containers
    const weaponDropdownRef = useRef<HTMLDivElement>(null);
    const ammoDropdownRef = useRef<HTMLDivElement>(null);

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
            if (weaponDropdownRef.current && !weaponDropdownRef.current.contains(event.target as Node)) {
                setWeaponSearchOpen(false);
            }
            if (ammoDropdownRef.current && !ammoDropdownRef.current.contains(event.target as Node)) {
                setAmmoSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
        <div
            className={`military-card p-4 rounded-sm border-2 ${ATTACKER_COLORS[attacker.id].class.replace('text-', 'border-')}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-tan-100 flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{backgroundColor: ATTACKER_COLORS[attacker.id].hex}}
                    />
                    {ATTACKER_COLORS[attacker.id].name} Setup
                </h3>
                {canRemove && (
                    <button
                        onClick={onRemove}
                        className="text-red-400 hover:text-red-300 p-1 rounded-sm hover:bg-military-700 transition-colors"
                        title="Remove attacker"
                    >
                        <X size={16}/>
                    </button>
                )}
            </div>

            {/* Weapon Selection */}
            <div className="mb-3" ref={weaponDropdownRef}>
                <label className="block text-tan-300 text-xs font-medium mb-1">
                    Weapon
                    {attacker.weapon && (
                        <Link
                            href={`/items/${attacker.weapon.id}`}
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
                            setWeaponSearchOpen(!weaponSearchOpen);
                            setAmmoSearchOpen(false);
                        }}
                        className="w-full px-2 py-2 bg-military-800 border border-military-700 rounded-sm text-left
              hover:border-olive-600 transition-colors flex items-center justify-between gap-2"
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {attacker.weapon && (
                                <div className="w-22 h-10 relative flex-shrink-0 bg-military-700 rounded-sm p-0.5">
                                    <Image
                                        src={attacker.weapon.images.icon}
                                        alt={attacker.weapon.name}
                                        fill
                                        className="object-contain"
                                        sizes="76px"
                                    />
                                </div>
                            )}
                            <span
                                className={`truncate ${attacker.weapon ? getRarityColorClass(attacker.weapon.stats.rarity) : 'text-tan-400'}`}>
                                {attacker.weapon ? attacker.weapon.name : 'Select weapon...'}
                            </span>
                        </div>
                        <ChevronDown size={16} className="text-olive-400 flex-shrink-0"/>
                    </button>

                    {/* Weapon Dropdown */}
                    {weaponSearchOpen && (
                        <div
                            className="absolute z-10 w-full mt-1 bg-military-800 border border-military-700 rounded-sm shadow-lg">
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
                                                onUpdate({weapon: weapon as Weapon, ammo: undefined});
                                                setWeaponSearchOpen(false);
                                                setWeaponSearch('');
                                            }}
                                            className="w-full px-2 py-2 text-left hover:bg-military-700 transition-colors text-sm"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div
                                                    className="w-22 h-10 relative flex-shrink-0 bg-military-700 rounded-sm p-0.5">
                                                    <Image
                                                        src={weapon.images.icon}
                                                        alt={weapon.name}
                                                        fill
                                                        className="object-contain"
                                                        sizes="76px"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div
                                                        className={`${getRarityColorClass(weapon.stats.rarity)} truncate`}>{weapon.name}</div>
                                                    <div className="text-tan-400 text-xs">
                                                        {weapon.stats.caliber} • {formatFireRate(weapon.stats.fireRate)}
                                                    </div>
                                                </div>
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
                        <span>Caliber: {attacker.weapon.stats.caliber}</span>
                        <span>Fire Rate: {formatFireRate(attacker.weapon.stats.fireRate)}</span>
                    </div>
                )}
            </div>

            {/* Ammo Selection */}
            <div className="mb-3" ref={ammoDropdownRef}>
                <label className="block text-tan-300 text-xs font-medium mb-1">
                    Ammunition
                    {attacker.ammo && (
                        <Link
                            href={`/items/${attacker.ammo.id}`}
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
                            setAmmoSearchOpen(!ammoSearchOpen);
                            setWeaponSearchOpen(false);
                        }}
                        className={`w-full px-3 py-2 bg-military-800 border rounded-sm text-left
              transition-colors flex items-center justify-between gap-2 ${
                            !attacker.weapon
                                ? 'border-military-700 opacity-50 cursor-not-allowed'
                                : hasIncompatibleAmmo
                                    ? 'border-red-600 hover:border-red-500'
                                    : 'border-military-700 hover:border-olive-600'
                        }`}
                        disabled={!attacker.weapon}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {attacker.ammo && (
                                <div className="w-10 h-10 relative flex-shrink-0 bg-military-700 rounded-sm p-0.5">
                                    <Image
                                        src={attacker.ammo.images.icon}
                                        alt={attacker.ammo.name}
                                        fill
                                        className="object-contain"
                                        sizes="40px"
                                    />
                                </div>
                            )}
                            <span
                                className={`truncate ${attacker.ammo ? getRarityColorClass(attacker.ammo.stats.rarity) : 'text-tan-400'}`}>
                                {attacker.ammo ? attacker.ammo.name : 'Select ammo...'}
                            </span>
                        </div>
                        <ChevronDown size={16} className="text-olive-400 flex-shrink-0"/>
                    </button>

                    {/* Ammo Dropdown */}
                    {ammoSearchOpen && attacker.weapon && (
                        <div
                            className="absolute z-10 w-full mt-1 bg-military-800 border border-military-700 rounded-sm shadow-lg">
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
                                                onUpdate({ammo: ammo as Ammunition});
                                                setAmmoSearchOpen(false);
                                                setAmmoSearch('');
                                            }}
                                            className="w-full px-2 py-2 text-left hover:bg-military-700 transition-colors text-sm"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div
                                                    className="w-10 h-10 relative flex-shrink-0 bg-military-700 rounded-sm p-0.5">
                                                    <Image
                                                        src={ammo.images.icon}
                                                        alt={ammo.name}
                                                        fill
                                                        className="object-contain"
                                                        sizes="40px"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div
                                                        className={`${getRarityColorClass(ammo.stats.rarity)} truncate`}>{ammo.name}</div>
                                                    <div className="text-tan-400 text-xs flex gap-3">
                                                        <span>DMG: {ammo.stats.damage}</span>
                                                        <span>PEN: {ammo.stats.penetration}</span>
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
                        <AlertCircle size={12}/>
                        <span>Incompatible with {attacker.weapon?.name || "undefined"}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
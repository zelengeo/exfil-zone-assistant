/**
 * Type definitions for Combat Simulator
 */

import { Item } from '@/types/items';

// Display modes for the simulator
export type DisplayMode = 'ttk' | 'stk' | 'ctk';
export type SortBy = 'ttk' | 'damage' | 'cost';

// Attacker colors for visual distinction
export const ATTACKER_COLORS = {
    0: { name: 'Blue', hex: '#3B82F6', class: 'text-blue-500' },
    1: { name: 'Red', hex: '#EF4444', class: 'text-red-500' },
    2: { name: 'Green', hex: '#10B981', class: 'text-green-500' },
    3: { name: 'Yellow', hex: '#F59E0B', class: 'text-yellow-500' }
} as const;

// Weapon type based on Item but with required weapon stats
export interface Weapon extends Item {
    category: 'weapons';
    stats: Item['stats'] & {
        fireRate: number;
        ergonomics?: number;
        MOA?: number;
        verticalRecoil?: number;
        horizontalRecoil?: number;
    };
}

// Ammunition type based on Item but with required ammo stats
export interface Ammunition extends Item {
    category: 'ammo';
    stats: Item['stats'] & {
        damage: number;
        penetration: number;
        muzzleVelocity?: number;
        bluntDamageScale?: number;
        protectionGearPenetratedDamageScale?: number;
        protectionGearBluntDamageScale?: number;
        caliber: string;
        damageAtRange?: {
            '0m': number;
            '100m': number;
            '300m': number;
            '500m': number;
        };
        penetrationAtRange?: {
            '0m': number;
            '100m': number;
            '300m': number;
            '500m': number;
        };
    };
}

// Armor type based on Item but with required armor stats
export interface Armor extends Item {
    category: 'gear' | 'armor';
    stats: Item['stats'] & {
        armorClass: number;
        maxDurability: number;
        durabilityDamageScalar?: number;
        bluntDamageScalar?: number;
    };
    // Protection data from the actual armor items
    protectiveData?: ProtectiveZone[];
    penetrationChanceCurve?: CurvePoint[];
    penetrationDamageScalarCurve?: CurvePoint[];
}

// Protective zone definition from armor data
export interface ProtectiveZone {
    bodyPart: string;
    armorClass: number;
    bluntDamageScalar: number;
    protectionAngle: number;
}

// Curve point for penetration calculations
export interface CurvePoint {
    interpMode?: string;
    tangentMode?: string;
    time: number;
    value: number;
    arriveTangent?: number;
    leaveTangent?: number;
}

// Attacker setup configuration
export interface AttackerSetup {
    id: string;
    weapon: Weapon | null;
    ammo: Ammunition | null;
    color: typeof ATTACKER_COLORS[keyof typeof ATTACKER_COLORS];
}

// Defender setup configuration
export interface DefenderSetup {
    bodyArmor: Armor | null;
    bodyArmorDurability: number; // 0-100%
    helmet: Armor | null;
    helmetDurability: number; // 0-100%
}

// Combat simulation state
export interface CombatSimulation {
    attackers: AttackerSetup[];
    defender: DefenderSetup;
    range: number; // in meters
    displayMode: DisplayMode;
    sortBy: SortBy;
}

// Calculation result for a specific zone
export interface ZoneCalculation {
    zoneId: string;
    bodyPartId: string;
    ttk: number;
    shotsToKill: number;
    costToKill: number;
    penetrationChance: number;
    effectiveDamage: number;
    bluntDamage: number;
    isProtected: boolean;
    armorClass: number;
}

// Summary statistics for an attacker
export interface AttackerSummary {
    attackerId: string;
    bestZone: {
        zoneId: string;
        ttk: number;
    };
    worstZone: {
        zoneId: string;
        ttk: number;
    };
    averageTTK: number;
    totalCost: number;
    viableZones: number; // Count of zones that can be killed in reasonable time
}

// Range preset for quick selection
export interface RangePreset {
    name: string;
    value: number;
    description: string;
}

export const RANGE_PRESETS: RangePreset[] = [
    { name: 'CQB', value: 10, description: 'Close quarters combat' },
    { name: 'Short', value: 50, description: 'Short range engagement' },
    { name: 'Medium', value: 150, description: 'Medium range combat' },
    { name: 'Long', value: 300, description: 'Long range engagement' },
    { name: 'Sniper', value: 500, description: 'Extreme range sniping' }
];

// Filter options for weapon/ammo selection
export interface WeaponFilter {
    caliber?: string;
    minFireRate?: number;
    maxFireRate?: number;
}

export interface AmmoFilter {
    caliber?: string;
    minDamage?: number;
    minPenetration?: number;
}

// Validation helpers
export function isWeapon(item: Item): item is Weapon {
    return item.category === 'weapons' &&
        typeof item.stats.fireRate === 'number';
}

export function isAmmunition(item: Item): item is Ammunition {
    return item.category === 'ammo' &&
        typeof item.stats.damage === 'number' &&
        typeof item.stats.penetration === 'number' &&
        typeof item.stats.caliber === 'string';
}

export function isArmor(item: Item): item is Armor {
    return (item.category === 'gear' || item.category === 'armor') && item.subcategory === "Body Armor";
}

// Check if weapon and ammo are compatible
export function areWeaponAmmoCompatible(weapon: Weapon | null, ammo: Ammunition | null): boolean {
    if (!weapon || !ammo) return false;

    // Extract caliber from weapon subcategory or stats
    const weaponCaliber = weapon.stats.caliber;
    const ammoCaliber = ammo.stats.caliber;

    return weaponCaliber === ammoCaliber;
}

// Display mode labels
export const DISPLAY_MODE_LABELS = {
    ttk: 'Time to Kill',
    stk: 'Shots to Kill',
    ctk: 'Cost to Kill'
} as const;

// Sort options labels
export const SORT_BY_LABELS = {
    ttk: 'Fastest TTK',
    damage: 'Highest Damage',
    cost: 'Cost Efficiency'
} as const;
/**
 * Improved Type definitions for Combat Simulator
 * Aligns with actual game data structure
 */

import {Ammunition, AnyItem, Armor, BodyArmor, Helmet, Item, Weapon} from "@/types/items";

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

// Attacker setup configuration
export interface AttackerSetup {
    id: string;
    weapon: Weapon | null;
    ammo: Ammunition | null;
    color: typeof ATTACKER_COLORS[keyof typeof ATTACKER_COLORS];
}

// Defender setup configuration
export interface DefenderSetup {
    bodyArmor: BodyArmor | null;
    bodyArmorDurability: number; // 0-100%
    helmet: Helmet | null;
    helmetDurability: number; // 0-100%
}

export interface ShotResult {
    isPenetrating: boolean;
    damageToBodyPart: number;
    damageToArmor: number;
    penetrationChance: number;
}

export interface CombatSimulationResult {
    shotsToKill: number;
    finalArmorDurability: number;
    totalDamageDealt: number;
    shots: ShotResult[];
}

// Combat simulation state
export interface CombatSimulation {
    attackers: AttackerSetup[];
    defender: DefenderSetup;
    range: number; // in meters
    displayMode: DisplayMode;
    sortBy: SortBy;
}

// Detailed damage calculation result
export interface DamageCalculationResult {
    penetrationChance: number;
    penetratingDamage: number;
    bluntDamage: number;
    totalDamage: number;
    isPenetrating: boolean;
    fragmentationChance?: number;
    bleedDamage?: number;
}

// Zone-specific calculation result
export interface ZoneCalculation extends CombatSimulationResult{
    zoneId: string;
    bodyPartId: string;
    ttk: number;
    costToKill: number;
    isProtected: boolean;
    armorClass: number;
    fragmentationDamage?: number;
    bleedDamagePerSecond?: number;
    // Statistical data for probability distribution
    averagePenetrationChance?: number;
    stkDistribution?: { shots: number; probability: number }[];
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
    viableZones: number;
}

// Range preset for quick selection
export interface RangePreset {
    name: string;
    value: number;
    description: string;
}

export const  RANGE_VALUES = [0, 60, 120, 240, 480];

export const RANGE_PRESETS: RangePreset[] = [
    { name: 'CQB', value: RANGE_VALUES[0], description: 'Close quarters combat' },
    { name: 'Short', value: RANGE_VALUES[1], description: 'Short range engagement' },
    { name: 'Medium', value: RANGE_VALUES[2], description: 'Medium range combat' },
    { name: 'Long', value: RANGE_VALUES[3], description: 'Long range engagement' },
    { name: 'Sniper', value: RANGE_VALUES[4], description: 'Extreme range sniping' }
];

// Type guards with improved checks
export function isAnyItem(item: Item): item is AnyItem {
    return isWeapon(item) || isAmmunition(item) || isArmor(item);
}

export function isWeapon(item: Item): item is Weapon {
    return item.category === 'weapons'
}

export function isAmmunition(item: Item): item is Ammunition {
    return item.category === 'ammo'
}

export function isArmor(item: Item): item is Armor {
    return (item.category === 'gear') &&
        (item.subcategory === 'Body Armor' || item.subcategory === 'Helmets')
}

export function isBodyArmor(item: Item): item is BodyArmor {
    return (item.category === 'gear') &&
        (item.subcategory === 'Body Armor' || item.subcategory === 'Helmets')
}

export function isHelmet(item: Item): item is Helmet {
    return (item.category === 'gear') &&
        item.subcategory === 'Helmets'
}

// Check if weapon and ammo are compatible
export function areWeaponAmmoCompatible(weapon: Weapon | null, ammo: Ammunition | null): boolean {
    if (!weapon || !ammo) return false;
    return weapon.stats.caliber === ammo.stats.caliber;
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
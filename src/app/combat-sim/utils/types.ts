/**
 * Improved Type definitions for Combat Simulator
 * Aligns with actual game data structure
 */

import {
    Ammunition,
    AnyItem,
    Armor, Attachment,
    Bandage,
    BodyArmor,
    FaceShield, Grenade, Grip,
    Helmet,
    Item, LimbRestore, Magazine,
    Medicine, Misc, Painkiller, Rail, Sight, Stim, Suppressor, Syringe, TacticalAttachment,
    Weapon
} from "@/types/items";

// Display modes for the simulator
export type DisplayMode = 'ttk' | 'stk' | 'ctk';
export function isDisplayMode(mode: string | null): mode is DisplayMode {
    return !!mode && ['ttk', 'stk', 'ctk'].includes(mode)
}

export type SortBy = 'ttk' | 'stk' | 'ctk';

// Attacker colors for visual distinction
export const ATTACKER_COLORS: {
    [key: string]: {
        name: string;
        hex: string;
        class: string;
    };
} = {
    "0": {name: 'Alpha', hex: '#00D9FF', class: 'text-cyan-400'},      // Cyan
    "1": {name: 'Bravo', hex: '#FF6B6B', class: 'text-rose-400'},     // Rose
    "2": {name: 'Charlie', hex: '#4ECDC4', class: 'text-teal-400'},   // Teal
    "3": {name: 'Delta', hex: '#FFE66D', class: 'text-amber-300'}      // Amber
} as const;

// Attacker setup configuration
export interface AttackerSetup {
    id: string;
    weapon: Weapon | null;
    ammo: Ammunition | null;
}

// Defender setup configuration
export interface DefenderSetup {
    bodyArmor: BodyArmor | null;
    bodyArmorDurability: number; // 0-100%
    helmet: Helmet | null;
    helmetDurability: number; // 0-100%
    faceShield: FaceShield | null;
}

export interface ShotResult {
    isPenetrating: boolean;
    damageToBodyPart: number;
    damageToArmor: number;
    penetrationChance: number;
}

export interface ShotResultWithLeftovers extends ShotResult{
    remainingArmorDurability: number;
    remainingHp: number;
}

export interface CombatSimulationResult {
    shotsToKill: number;
    finalArmorDurability: number;
    totalDamageDealt: number;
    shots: ShotResultWithLeftovers[];
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
export interface ZoneCalculation extends CombatSimulationResult {
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

export const RANGE_VALUES = [0, 60, 120, 240, 480];

export const RANGE_PRESETS: RangePreset[] = [
    {name: 'CQB', value: RANGE_VALUES[0], description: 'Close quarters combat'},
    {name: 'Short', value: RANGE_VALUES[1], description: 'Short range engagement'},
    {name: 'Medium', value: RANGE_VALUES[2], description: 'Medium range combat'},
    {name: 'Long', value: RANGE_VALUES[3], description: 'Long range engagement'},
    {name: 'Sniper', value: RANGE_VALUES[4], description: 'Extreme range sniping'}
];

// Type guards with improved checks
export function isAnyItem(item: Item): item is AnyItem {
    return isWeapon(item) || isAmmunition(item) || isGrenade(item) || isArmor(item) || isMedicine(item) || isAttachment(item);
}

export function isWeapon(item: Item): item is Weapon {
    return item.category === 'weapons'
}

export function isAmmunition(item: Item): item is Ammunition {
    return item.category === 'ammo'
}

// Check if weapon and ammo are compatible
export function areWeaponAmmoCompatible(weapon: Weapon | null, ammo: Ammunition | null): boolean {
    if (!weapon || !ammo) return false;
    return weapon.stats.caliber === ammo.stats.caliber;
}

export function isAttachment(item: Item): item is Attachment {
    return item.category === 'attachments'
}

export function isMagazine(item: Item): item is Magazine {
    return isAttachment(item) && item.subcategory === 'Magazines'
}

export function isSight(item: Item): item is Sight {
    return isAttachment(item) && item.subcategory === 'Sights'
}

export function isCompensator(item: Item): item is Sight {
    return isAttachment(item) && item.subcategory === 'Compensators'
}

export function isSuppressor(item: Item): item is Suppressor {
    return isAttachment(item) && item.subcategory === 'Suppressors'
}

export function isGrip(item: Item): item is Grip {
    return isAttachment(item) && item.subcategory === 'Grips'
}

export function isTactical(item: Item): item is TacticalAttachment {
    return isAttachment(item) && item.subcategory === 'Tactical'
}

export function isRail(item: Item): item is Rail {
    return isAttachment(item) && item.subcategory === 'Rails'
}

export function isGrenade(item: Item): item is Grenade {
    return item.category === 'grenades'
}

export function isArmor(item: Item): item is Armor {
    return (item.category === 'gear') &&
    (item.subcategory === 'Body Armor' || item.subcategory === 'Helmets' || item.subcategory === 'Face Shields')
}

export function isBodyArmor(item: Item): item is BodyArmor {
    return (item.category === 'gear') &&
    (item.subcategory === 'Body Armor')
}

export function isHelmet(item: Item): item is Helmet {
    return (item.category === 'gear') &&
    item.subcategory === 'Helmets'
}

export function isFaceShield(item: Item): item is FaceShield {
    return (item.category === 'gear') &&
    item.subcategory === 'Face Shields'
}


export function isMedicine(item: Item): item is Medicine {
    return (item.category === 'medicine')
}

export function isBandage(item: Item): item is Bandage {
    return (item.category === 'medicine') &&
    item.subcategory === 'Bandages'
}

export function isStim(item: Item): item is Stim {
    return (item.category === 'medicine') &&
    item.subcategory === 'Stims'
}

export function isSyringe(item: Item): item is Syringe {
    return (item.category === 'medicine') &&
    item.subcategory === 'Syringes'
}

export function isLimbRestore(item: Item): item is LimbRestore {
    return (item.category === 'medicine') &&
    item.subcategory === 'Suturing Tools'
}

export function isPainkiller(item: Item): item is Painkiller {
    return (item.category === 'medicine') &&
    item.subcategory === 'Painkillers'
}

export function isMisc(item: Item): item is Misc {
    return (item.category === 'misc')
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
    stk: 'Highest Damage',
    ctk: 'Cost Efficiency'
} as const;
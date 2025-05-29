/**
 * Improved Type definitions for Combat Simulator
 * Aligns with actual game data structure
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

// Interpolation modes for curves
export type InterpolationMode = 'cubic' | 'linear';
export type TangentMode = 'user' | 'auto';

// Ballistic curve point with all properties from game data
export interface BallisticCurvePoint {
    interpMode: InterpolationMode;
    tangentMode: TangentMode;
    time: number;
    value: number;
    arriveTangent: number;
    leaveTangent: number;
}

// Weapon type with complete stats from game data
export interface Weapon extends Item {
    category: 'weapons';
    stats: Item['stats'] & {
        // Required weapon stats
        fireRate: number;
        caliber: string;

        // Recoil parameters
        recoilParameters?: {
            shiftMomentum: number;
            pitchBaseMomentum: number;
            yawBaseMomentum: number;
            rollBaseMomentum?: number;
            shiftStiffness: number;
            pitchStiffness: number;
            yawStiffness: number;
            rollStiffness: number;
            shiftDamping?: number;
            pitchDamping: number;
            yawDamping: number;
            rollDamping: number;
            shiftMass?: number;
            pitchMass: number;
            yawMass: number;
            rollMass: number;
            oneHandedADSMultiplier?: number;
            verticalRecoilControl: number;
            horizontalRecoilControl: number;
        };

        // Other weapon properties
        MOA?: number;
        ADSSpeed?: number;
        ergonomics?: number;
        //Needs investigation - In game UI shows some power values, but not sure what they are
        firingPower?: number;
        //PROBABLY LEFTOVER DATA FROM OTHER MODE/GAME cuz these values are AMMO-related
        damageRangeCurve?: string;
        bulletDropFactor?: number;
        muzzleVelocity?: number;
        hitDamage?: number;
        headDamageScale?: number;
    };
}

// Complete ammunition type with ballistic curves
export interface Ammunition extends Item {
    category: 'ammo';
    stats: Item['stats'] & {
        // Required ammo stats
        damage: number;
        penetration: number;
        caliber: string;

        // Damage modifiers
        bluntDamageScale: number;
        bleedingChance: number;
        protectionGearPenetratedDamageScale: number;
        protectionGearBluntDamageScale: number;

        // Ballistics
        muzzleVelocity?: number;
        bulletDropFactor?: number;

        //precalculated values (cache)
        damageAtRange: {
            '60m': number;
            '120m': number;
            '240m': number;
            '480m': number;
        };
        penetrationAtRange: {
            '60m': number;
            '120m': number;
            '240m': number;
            '480m': number;
        };

        // Full ballistic curves from game data
        ballisticCurves: {
            damageOverDistance?: BallisticCurvePoint[];
            penetrationPowerOverDistance?: BallisticCurvePoint[];
        };
    };
}

// Protective zone from armor data
export interface ProtectiveZone {
    bodyPart: string; // bodypart.id e.g., "spine_03", "pelvis", "UpperArm_L"
    armorClass: number;
    bluntDamageScalar: number;
    protectionAngle: number; // not used in simulation yet
}

// Complete armor type with all curves
export interface Armor extends Item {
    category: 'gear';
    subcategory: 'Body Armor' | 'Helmets';
    stats: Item['stats'] & {
        // Required armor stats
        armorClass: number;
        maxDurability: number;

        // Damage scalars
        durabilityDamageScalar?: number;
        bluntDamageScalar?: number;

        // Protection zones
        protectiveData?: ProtectiveZone[];

        // Penetration curves from game data
        penetrationChanceCurve?: BallisticCurvePoint[];
        penetrationDamageScalarCurve?: BallisticCurvePoint[];
        antiPenetrationDurabilityScalarCurve?: BallisticCurvePoint[];
    };
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
    fragmentationDamage?: number;
    bleedDamagePerSecond?: number;
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
export function isWeapon(item: Item): item is Weapon {
    return item.category === 'weapons' &&
        typeof item.stats.fireRate === 'number' &&
        typeof item.stats.caliber === 'string';
}

export function isAmmunition(item: Item): item is Ammunition {
    return item.category === 'ammo' &&
        typeof item.stats.damage === 'number' &&
        typeof item.stats.penetration === 'number' &&
        typeof item.stats.caliber === 'string';
}

export function isArmor(item: Item): item is Armor {
    return (item.category === 'gear') &&
        (item.subcategory === 'Body Armor' || item.subcategory === 'Helmets') &&
        typeof item.stats.armorClass === 'number' &&
        typeof item.stats.maxDurability === 'number';
}

// Check if weapon and ammo are compatible
export function areWeaponAmmoCompatible(weapon: Weapon | null, ammo: Ammunition | null): boolean {
    if (!weapon || !ammo) return false;
    return weapon.stats.caliber === ammo.stats.caliber;
}

// Helper to check if armor has ballistic curves
export function hasBallisticCurves(armor: Armor): boolean {
    return !!(armor.stats.penetrationChanceCurve &&
        armor.stats.penetrationChanceCurve.length > 0);
}

// Helper to check if ammo has ballistic curves
export function hasAmmoCurves(ammo: Ammunition): boolean {
    return !!(ammo.stats.ballisticCurves?.damageOverDistance &&
        ammo.stats.ballisticCurves.damageOverDistance.length > 0);
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
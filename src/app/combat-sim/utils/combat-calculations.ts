/**
 * Combat Calculation Engine
 * Integrates damage calculations with zone-specific analysis
 */

import {
    AttackerSetup,
    DefenderSetup,
    ZoneCalculation,
    AttackerSummary,
    Weapon,
    Ammunition,
    Armor
} from './types';
import {
    ARMOR_ZONES,
    BODY_PARTS,
    getBodyPartForArmorZone,
    isZoneProtectedBy
} from './body-zones';
import {
    calculateEffectiveDamage,
    calculateShotsToKill,
    type ArmorProperties,
    type AmmoProperties
} from './damage-calculations';
import {ProtectiveZone} from "@/app/combat-sim/utils/types";

/**
 * Calculate combat results for all attackers against defender
 */
export function calculateCombatResults(
    attackers: AttackerSetup[],
    defender: DefenderSetup,
    range: number
): Record<string, ZoneCalculation[]> {
    const results: Record<string, ZoneCalculation[]> = {};

    // Process each valid attacker
    attackers.forEach(attacker => {
        if (!attacker.weapon || !attacker.ammo) return;

        const zoneCalcs = calculateAttackerZones(
            attacker.weapon,
            attacker.ammo,
            defender,
            range
        );

        results[attacker.id] = zoneCalcs;
    });

    return results;
}

/**
 * Calculate results for a single attacker against all zones
 */
function calculateAttackerZones(
    weapon: Weapon,
    ammo: Ammunition,
    defender: DefenderSetup,
    range: number
): ZoneCalculation[] {
    const calculations: ZoneCalculation[] = [];

    // Process each armor zone
    Object.entries(ARMOR_ZONES).forEach(([zoneId, zone]) => {
        const bodyPart = getBodyPartForArmorZone(zoneId);
        if (!bodyPart) return;

        // Determine armor protecting this zone
        const armor = getZoneArmor(zoneId, defender);
        const armorClass = armor?.stats.armorClass || 0;

        // Convert ammo to required format
        const ammoProps: AmmoProperties = {
            damage: ammo.stats.damage,
            penetration: ammo.stats.penetration,
            bluntDamageScale: ammo.stats.bluntDamageScale || 0.1,
            protectionGearPenetratedDamageScale: ammo.stats.protectionGearPenetratedDamageScale || 1,
            protectionGearBluntDamageScale: ammo.stats.protectionGearBluntDamageScale || 1,
            damageAtRange: ammo.stats.damageAtRange,
            penetrationAtRange: ammo.stats.penetrationAtRange
        };

        // Convert armor to required format if present
        const armorProps: ArmorProperties | null = armor ? {
            armorClass: armor.stats.armorClass,
            maxDurability: armor.stats.maxDurability,
            currentDurability: getArmorDurability(zoneId, defender),
            durabilityDamageScalar: armor.stats.durabilityDamageScalar || 0.5,
            bluntDamageScalar: armor.stats.bluntDamageScalar || 0.2,
            penetrationChanceCurve: armor.penetrationChanceCurve,
            penetrationDamageScalarCurve: armor.penetrationDamageScalarCurve
        } : null;

        // Calculate damage for this zone
        const damageResult = calculateEffectiveDamage(ammoProps, armorProps, range);

        // Calculate shots to kill
        const shotsToKill = calculateShotsToKill(bodyPart.hp, damageResult);

        // Calculate time to kill
        const fireRate = weapon.stats.fireRate || 600;
        const adsTime = 0.3; // Assume 300ms ADS time
        const ttk = calculateTimeToKill(shotsToKill, fireRate, adsTime);

        // Calculate cost to kill
        const costToKill = shotsToKill * ammo.stats.price;

        calculations.push({
            zoneId,
            bodyPartId: bodyPart.id,
            ttk,
            shotsToKill,
            costToKill,
            penetrationChance: damageResult.penetrationChance,
            effectiveDamage: damageResult.totalDamage,
            bluntDamage: damageResult.bluntDamage,
            isProtected: armorClass > 0,
            armorClass
        });
    });

    return calculations;
}

/**
 * Get armor protecting a specific zone
 */
function getZoneArmor(zoneId: string, defender: DefenderSetup): Armor | null {
    const zone = ARMOR_ZONES[zoneId];
    if (!zone) return null;

    // Check if zone is protected by helmet
    if (isZoneProtectedBy(zoneId, 'helmet')) {
        return defender.helmet;
    }

    // Check if zone is protected by body armor
    if (isZoneProtectedBy(zoneId, 'armor')) {
        // Check if body armor actually protects this specific zone
        if (defender.bodyArmor) {
            // If armor has specific protective data, check if this zone is covered
            if (defender.bodyArmor.protectiveData) {
                const protectsZone = defender.bodyArmor.protectiveData.some((pd: ProtectiveZone) =>
                    pd.bodyPart === zone.bodyPart || pd.bodyPart === zoneId
                );
                if (protectsZone) return defender.bodyArmor;
            } else {
                // If no specific data, assume armor protects its default zones
                return defender.bodyArmor;
            }
        }
    }

    return null;
}

/**
 * Get current durability for armor protecting a zone
 */
function getArmorDurability(zoneId: string, defender: DefenderSetup): number {
    if (isZoneProtectedBy(zoneId, 'helmet') && defender.helmet) {
        return (defender.helmetDurability / 100) * defender.helmet.stats.maxDurability;
    }

    if (isZoneProtectedBy(zoneId, 'armor') && defender.bodyArmor) {
        return (defender.bodyArmorDurability / 100) * defender.bodyArmor.stats.maxDurability;
    }

    return 0;
}

/**
 * Calculate time to kill from shots required
 */
function calculateTimeToKill(
    shotsToKill: number,
    fireRate: number,
    adsTime: number
): number {
    if (shotsToKill === Infinity) return Infinity;

    const timeBetweenShots = 60 / fireRate;
    return adsTime + (shotsToKill - 1) * timeBetweenShots;
}

/**
 * Calculate summary statistics for an attacker
 */
export function calculateAttackerSummary(
    attackerId: string,
    zoneCalculations: ZoneCalculation[]
): AttackerSummary {
    // Filter out non-viable zones (infinite TTK)
    const viableZones = zoneCalculations.filter(z => z.ttk !== Infinity);

    // Find best and worst zones
    const sortedByTTK = [...zoneCalculations].sort((a, b) => a.ttk - b.ttk);
    const bestZone = sortedByTTK[0];
    const worstViableZone = viableZones.length > 0
        ? viableZones[viableZones.length - 1]
        : sortedByTTK[sortedByTTK.length - 1];

    // Calculate average TTK (only from viable zones)
    const averageTTK = viableZones.length > 0
        ? viableZones.reduce((sum, z) => sum + z.ttk, 0) / viableZones.length
        : Infinity;

    // Calculate total cost (average shots across all zones)
    const totalCost = zoneCalculations.reduce((sum, z) =>
        sum + (z.costToKill === Infinity ? 0 : z.costToKill), 0
    ) / (viableZones.length || 1);

    return {
        attackerId,
        bestZone: {
            zoneId: bestZone.zoneId,
            ttk: bestZone.ttk
        },
        worstZone: {
            zoneId: worstViableZone.zoneId,
            ttk: worstViableZone.ttk
        },
        averageTTK,
        totalCost: Math.round(totalCost),
        viableZones: viableZones.length
    };
}

/**
 * Sort zone calculations based on selected criteria
 */
export function sortZoneCalculations(
    calculations: ZoneCalculation[],
    sortBy: 'ttk' | 'damage' | 'cost'
): ZoneCalculation[] {
    const sorted = [...calculations];

    switch (sortBy) {
        case 'ttk':
            return sorted.sort((a, b) => a.ttk - b.ttk);
        case 'damage':
            return sorted.sort((a, b) => b.effectiveDamage - a.effectiveDamage);
        case 'cost':
            return sorted.sort((a, b) => a.costToKill - b.costToKill);
        default:
            return sorted;
    }
}

/**
 * Get color for TTK value (for heat map)
 */
export function getTTKColor(ttk: number): string {
    if (ttk === Infinity) return '#dc2626'; // Red for impossible
    if (ttk < 1) return '#10b981'; // Green for very fast
    if (ttk < 2) return '#84cc16'; // Light green
    if (ttk < 3) return '#facc15'; // Yellow
    if (ttk < 5) return '#fb923c'; // Orange
    return '#ef4444'; // Red for slow
}

/**
 * Format TTK for display
 */
export function formatTTK(ttk: number): string {
    if (ttk === Infinity) return '∞';
    return `${ttk.toFixed(1)}s`;
}

/**
 * Format STK for display
 */
export function formatSTK(stk: number): string {
    if (stk === Infinity) return '∞';
    return stk.toString();
}

/**
 * Format CTK for display
 */
export function formatCTK(ctk: number): string {
    if (ctk === Infinity) return '∞';
    return `$${ctk.toLocaleString()}`;
}
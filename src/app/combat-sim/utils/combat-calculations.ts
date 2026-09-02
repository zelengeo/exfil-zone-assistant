/**
 * Combat Calculation Engine
 * Integrates damage calculations with zone-specific analysis
 */

import {
    AttackerSetup,
    DefenderSetup,
    ZoneCalculation,
    AttackerSummary,
} from './types';
import {cheapestOffer} from '@/lib/trade';
import {
    ARMOR_ZONES,
    getBodyPartForArmorZone,
    isZoneCoveredAtAngle,
    isZoneProtectedBy
} from './body-zones';
import {
    simulateCombat
} from './damage-calculations';
import {AmmoProperties, Ammunition, Armor, ArmorProperties, ProtectiveZone, Weapon} from '@/types/items';

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

        results[attacker.id] = calculateAttackerZones(
            attacker.weapon,
            attacker.ammo,
            defender,
            range
        );
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
    Object.keys(ARMOR_ZONES).forEach((zoneId) => {
        //TODO optimization - cache bodyParts simulation runs
        const bodyPart = getBodyPartForArmorZone(zoneId);
        if (!bodyPart) return;

        // Determine armor protecting this zone
        const armor = getZoneArmor(zoneId, defender);

        //TODO REVISIT FALLBACK VALUES

        // Convert ammo to required format
        const ammoProps: AmmoProperties = {
            damage: ammo.stats.damage,
            penetration: ammo.stats.penetration,
            caliber: ammo.stats.caliber,
            pellets: ammo.stats.pellets,
            muzzleVelocity: ammo.stats.muzzleVelocity,
            bleedingChance: ammo.stats.bleedingChance || 0,
            bluntDamageScale: ammo.stats.bluntDamageScale || 0.1,
            protectionGearPenetratedDamageScale: ammo.stats.protectionGearPenetratedDamageScale || 0.5,
            protectionGearBluntDamageScale: ammo.stats.protectionGearBluntDamageScale || 0.9,
            damageAtRange: ammo.stats.damageAtRange,
            penetrationAtRange: ammo.stats.penetrationAtRange,
            ballisticCurves: ammo.stats.ballisticCurves,
        };

        // Convert armor to required format if present
        const armorProps: ArmorProperties | null = armor ? {
            ...getZoneArmorClassAndBluntScalar(zoneId, armor),
            maxDurability: armor.stats.maxDurability,
            currentDurability: getArmorDurability(zoneId, defender),
            // More accurate default values based on armor data
            durabilityDamageScalar: armor.stats.durabilityDamageScalar,
            protectiveData: armor.stats.protectiveData,
            penetrationChanceCurve: armor.stats.penetrationChanceCurve,
            penetrationDamageScalarCurve: armor.stats.penetrationDamageScalarCurve,
            antiPenetrationDurabilityScalarCurve: armor.stats.antiPenetrationDurabilityScalarCurve
        } : null;

        // Calculate shots to kill
        const combatResult = simulateCombat(ammoProps, armorProps, weapon.stats.firingPower, zoneId, bodyPart, range);

        const shotsToKill = combatResult.shotsToKill;

        // Calculate time to kill
        const fireRate = weapon.stats.fireRate || 600; //TODO cover bolt actions and pump shotguns, TODO wtf is this 600 fallback - defaults should be global
        const ttk = calculateTimeToKill(shotsToKill, fireRate);

        // Calculate cost to kill. What the shooter pays, so this is the buy price - the cheapest
        // offer any vendor lists - not what a vendor would pay them for the same round.
        const costToKill = shotsToKill * (cheapestOffer(ammo.stats)?.price ?? 0);

        //TODO randomness of penetration is missing here
        calculations.push({
            zoneId,
            bodyPartId: bodyPart.id,
            ttk,
            costToKill,
            isProtected: armorProps !== null,
            armorClass: armorProps?.armorClass || 0,
            ...combatResult,
        });
    });

    return calculations;
}

/**
 * Get armor class for a specific zone from the armor item
 */
/**
 * The numbers the game actually reads for a hit: the matched zone's own, never the item's headline.
 *
 * `ProcessDamageReceived` uses `Zone.AntiPenetration` and `Zone.BluntDamageScalar` out of the
 * matched `ProtectiveData` entry. The item-level `armorClass` / `bluntDamageScalar` are
 * `AntiPenetrationDisplay` / `BluntDamageScalarDisplay` - a shop badge, and on four items they
 * disagree with every zone they claim to describe: the Rampage Bells and Rampage Skull advertise
 * class 5 over zones that all author 4, and the Security Vest and Soft Armor advertise 0.35 blunt
 * over zones that all author 0.9. Several more vests rate their arm and thigh plates a full class
 * below the chest.
 *
 * The display values remain the fallback only for gear that carries no zone list at all (curated
 * head gear), where there is nothing better to use.
 */
function getZoneArmorClassAndBluntScalar(zoneId: string, armor: Armor): {
    armorClass: number,
    bluntDamageScalar: number
} {
    const protection = armor.stats.protectiveData?.find(pd => pd.bodyPart === zoneId);
    if (protection) {
        return {armorClass: protection.armorClass, bluntDamageScalar: protection.bluntDamageScalar};
    }

    return {armorClass: armor.stats.armorClass, bluntDamageScalar: armor.stats.bluntDamageScalar};
}

/**
 * Get armor protecting a specific zone
 */
function getZoneArmor(zoneId: string, defender: DefenderSetup): Armor | null {
    const zone = ARMOR_ZONES[zoneId];
    if (!zone) return null;

    // Check if zone is protected by helmet
    if (isZoneProtectedBy(zoneId, 'helmet')) {
        if (defender.helmet) {
            // Check if body armor actually protects this specific zone
            if (defender.helmet.stats.protectiveData) {
                const protectsZone = defender.helmet.stats.protectiveData.some((pd: ProtectiveZone) =>
                    pd.bodyPart === zoneId // Direct match with zone ID (head_top etc.)
                ) || (defender.faceShield && defender.helmet.stats.canAttach?.includes(defender.faceShield.id));

                if (protectsZone) return defender.helmet;
            }
        }
        return null;
    }

    // Check if zone is protected by body armor
    if (isZoneProtectedBy(zoneId, 'armor')) {
        if (defender.bodyArmor) {
            // `VestBase.GetProtectiveData` walks the zone list and takes the FIRST entry whose bone
            // matches AND whose wedge contains the hit. Anything else - no entry for the bone, or an
            // entry the shot arrived outside of - reports "not protected", and `ProcessDamageReceived`
            // then returns before touching either the damage or the durability. So a miss here is not
            // weak armour, it is no armour: full damage and no wear.
            if (defender.bodyArmor.stats.protectiveData) {
                const covering = defender.bodyArmor.stats.protectiveData.find((pd: ProtectiveZone) =>
                    pd.bodyPart === zoneId
                    && isZoneCoveredAtAngle(pd.protectionAngle, defender.engagementAngle ?? 0)
                );
                if (covering) return defender.bodyArmor;
            } else {
                // No zone list at all: nothing can match, so nothing is covered.
                return null;
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
    fireRate: number
): number {
    if (shotsToKill === Infinity) return Infinity;

    const timeBetweenShots = 60 / fireRate;
    return (shotsToKill - 1) * timeBetweenShots;
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
    sortBy: 'ttk' | 'stk' | 'ctk'
): ZoneCalculation[] {
    const sorted = [...calculations];

    switch (sortBy) {
        case 'ttk':
            return sorted.sort((a, b) => a.ttk - b.ttk);
        case 'stk':
            return sorted.sort((a, b) => b.shotsToKill - a.shotsToKill);
        case 'ctk':
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
    return `${ttk.toFixed(2)}s`;
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
    if (ctk < 1000) {
        return `$${ctk}`;
    } else if (ctk < 100000) {
        // For numbers like 8000, 9500, format as $8k, $9.5k
        const thousands = ctk / 1000;
        if (thousands % 1 === 0) { // Check if it's a whole number of thousands
            return `$${thousands}k`;
        } else {
            const formatted = `$${thousands.toFixed(1)}k`;
            // Ensure it doesn't exceed 6 symbols (e.g., $9.9k is 5 symbols)
            if (formatted.length <= 6) {
                return formatted;
            } else {
                // Fallback for cases like $9.99k, which might exceed 6 if rounded up
                return `$${Math.round(thousands)}k`; // e.g., $10k
            }
        }
    }
    return `$${ctk.toLocaleString()}`;
}
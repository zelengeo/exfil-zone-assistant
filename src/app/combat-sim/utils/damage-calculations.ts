/**
 * Effective Damage Calculation for Combat Simulator
 * Handles armor durability, penetration mechanics, and blunt damage
 */
import {BODY_HP,} from "@/app/combat-sim/utils/body-zones";
import {
    CombatSimulationResult,
    RANGE_VALUES, ShotResult, ShotResultWithLeftovers
} from "@/app/combat-sim/utils/types";
import {AmmoProperties, ArmorProperties, CurvePoint} from "@/types/items";

/**
 * Simulate combat shot-by-shot with armor degradation
 * Uses deterministic approach - average expected damage per shot
 */
function simulateCombat(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    bodyPartHP: number,
    isVital: boolean = false,
    range: number
): CombatSimulationResult {
    const shots: ShotResultWithLeftovers[] = [];
    let currentBodyPartHP = isVital ? bodyPartHP : BODY_HP;
    let currentArmorDurability = armor?.currentDurability || 0;
    let totalDamageDealt = 0;
    let shotsToKill = 0;

    while (currentBodyPartHP > 0 && shotsToKill < 100) { // Safety limit
        shotsToKill++;

        const shotResult = calculateShotDamage(
            ammo,
            armor,
            currentArmorDurability,
            range,
            null,
            false
        );

        // Apply damage to body part
        currentBodyPartHP -= shotResult.damageToBodyPart;
        totalDamageDealt += shotResult.damageToBodyPart;

        // Apply damage to armor durability
        if (armor && currentArmorDurability > 0) {
            // Ensure we don't go below 0
            const actualArmorDamage = Math.min(currentArmorDurability, shotResult.damageToArmor);
            currentArmorDurability = Math.max(0, currentArmorDurability - actualArmorDamage);
        }

        shots.push(extendShotResult(shotResult, currentArmorDurability, currentBodyPartHP))

        // Check if dead
        if (currentBodyPartHP <= 0) {
            break;
        }
    }

    return {
        shotsToKill,
        finalArmorDurability: currentArmorDurability,
        totalDamageDealt,
        shots
    };
}

function calculateShotDamage(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    currentArmorDurability: number | null,
    range: number,
    overridePenetrationChance: boolean | null = null,
    applyRandom: boolean = false,
): ShotResult {
    // Apply range falloff to base damage and penetration
    const rangeDamage = applyRangeFalloff(ammo.damage, ammo, range);
    const rangePenetration = applyRangePenetrationFalloff(ammo.penetration, ammo, range);

    // If no armor, full damage applies
    if (!armor) {
        return {
            isPenetrating: true,
            damageToBodyPart: rangeDamage,
            damageToArmor: 0,
            penetrationChance: 1
        };
    }

    // Calculate armor effectiveness based on current durability
    const durabilityPercent = currentArmorDurability == null ? 1 : currentArmorDurability / armor.maxDurability;

    const armorEffectiveness = getArmorEffectivenessFromDurability(
        durabilityPercent,
        armor.antiPenetrationDurabilityScalarCurve
    );

    // Calculate effective armor class
    const effectiveArmorClass = armor.armorClass * armorEffectiveness;

    // Calculate penetration chance
    const penetrationChance = calculatePenetrationChance(
        rangePenetration,
        effectiveArmorClass,
        armor.penetrationChanceCurve
    );

    // Determine if this shot penetrates
    const isPenetrating = overridePenetrationChance ?? (applyRandom ? (Math.random() < penetrationChance) : (penetrationChance > 0.5));

    let damageToBodyPart = 0;
    let damageToArmor = 0;

    if (isPenetrating) {
        //It is possible that first damageTo armor is computed and then depleted armor value is used for the scalar...
        const penetrationDamageScalar = getPenetrationDamageScalar(armor.penetrationDamageScalarCurve, rangePenetration, effectiveArmorClass);

        damageToBodyPart = rangeDamage * penetrationDamageScalar;

        // Armor damage for penetrating shots
        damageToArmor = rangeDamage * ammo.protectionGearPenetratedDamageScale * armor.durabilityDamageScalar * 3//Measured damage deviates by <2% (rounded measured data...), so it seems correct...
    } else {
        // Non-penetrating shot (blunt damage)
        damageToBodyPart = rangeDamage * ammo.bluntDamageScale * armor.bluntDamageScalar;

        // Armor damage for non-penetrating shots
        damageToArmor = rangeDamage * ammo.protectionGearBluntDamageScale * armor.durabilityDamageScalar * 3
        // * armor.durabilityDamageScalar;  not sure what this scalar does
    }

    return {
        isPenetrating,
        damageToBodyPart,
        damageToArmor,
        penetrationChance
    };
}

/**
 * Get armor effectiveness from antiPenetrationDurabilityScalarCurve
 * This determines how much the armor class is reduced based on durability
 */
function getArmorEffectivenessFromDurability(
    durabilityPercent: number,
    curve?: CurvePoint[]
): number {
    if (!curve || curve.length === 0) {
        // Default: linear degradation
        // At 100% durability: 1.0 effectiveness
        // At 0% durability: 0.0 effectiveness (armor class becomes 0)
        return durabilityPercent;
    }

    // Use the curve to determine effectiveness. It seems curve uses missing durability percent
    return interpolateBallisticCurve(curve, 1 - durabilityPercent);
}

/**
 * Calculate penetration chance using armor curves
 */
function calculatePenetrationChance(
    penetrationPower: number,
    effectiveArmorClass: number,
    penetrationCurve: CurvePoint[]
): number {
    // FIXME - probably wrong, however works fine with edgecases
    const ratio = effectiveArmorClass - penetrationPower;
    return interpolateBallisticCurve(penetrationCurve, ratio);
}

/**
 * Get penetration damage scalar from curve
 */
function getPenetrationDamageScalar(
    penetrationDamageScalarCurve: CurvePoint[],
    penetrationPower: number,
    effectiveArmorClass: number
): number {


    // Calculate penetration difference (not ratio)
    // This could be what the curve x-axis represents
    const penetrationDifference = Math.max(0, effectiveArmorClass - penetrationPower);

    // Interpolate the damage scalar
    // The curve seems centered around 0, where:
    // x < 0: penetration barely beats armor (reduced damage)
    // x = 0: penetration equals effective armor
    // x > 0: penetration exceeds armor (better damage)

    return interpolateBallisticCurve(
        penetrationDamageScalarCurve,
        penetrationDifference
    );
}

/**
 * Interpolate value from ballistic curve
 */
function interpolateBallisticCurve(
    curve: CurvePoint[],
    x: number
): number {
    if (curve.length === 0) return 0;
    if (x <= curve[0].time) return curve[0].value;
    if (x >= curve[curve.length - 1].time) return curve[curve.length - 1].value;

    // Find the two points to interpolate between
    for (let i = 0; i < curve.length - 1; i++) {
        const current = curve[i];
        const next = curve[i + 1];

        if (x >= current.time && x <= next.time) {
            if (current.interpMode === 'linear') {
                // Linear interpolation
                const t = (x - current.time) / (next.time - current.time);
                return current.value + t * (next.value - current.value);
            } else if (current.interpMode === 'cubic') {
                // Cubic Hermite interpolation
                return interpolateCubicHermite(
                    current.time, current.value, current.leaveTangent || 0,
                    next.time, next.value, next.arriveTangent || 0,
                    x
                );
            }
        }
    }

    return curve[curve.length - 1].value;
}

/**
 * Apply damage falloff based on range using ammo's ballistic curves
 */
function applyRangeFalloff(
    baseDamage: number,
    ammo: AmmoProperties,
    range: number
): number {
    if (RANGE_VALUES.includes(range)) {
        if (range === 0) return baseDamage;
        // @ts-expect-error - range is value 60, 120, 240, or 480
        return ammo.damageAtRange[range + 'm'] || baseDamage;
    }

    // Convert range from meters to distance units used in curves (appears to be in cm)
    const rangeInCurveUnits = range * 100;

    // If we have ballistic curve data, use it
    if (ammo.ballisticCurves?.damageOverDistance) {
        return  interpolateBallisticCurve(ammo.ballisticCurves.damageOverDistance, rangeInCurveUnits);
    }

    // Default falloff formula if no curve data
    const falloffFactor = Math.max(1 - (range / 1000) * 0.3, 0.5);
    return baseDamage * falloffFactor;
}

/**
 * Apply penetration falloff based on range using ammo's ballistic curves
 */
function applyRangePenetrationFalloff(
    basePenetration: number,
    ammo: AmmoProperties,
    range: number
): number {
    if (RANGE_VALUES.includes(range)) {
        if (range === 0) return basePenetration;
        // @ts-expect-error - range is value 60, 120, 240, or 480
        return ammo.penetrationAtRange[range + 'm'] || basePenetration;
    }

    // Convert range from meters to distance units used in curves
    const rangeInCurveUnits = range * 100;

    // If we have ballistic curve data for penetration, use it
    if (ammo.ballisticCurves?.penetrationPowerOverDistance) {
        return interpolateBallisticCurve(ammo.ballisticCurves.penetrationPowerOverDistance, rangeInCurveUnits);
    }

    // Default falloff formula if no curve data
    const falloffFactor = Math.max(1 - (range / 1500) * 0.25, 0.6);
    return basePenetration * falloffFactor;
}

/**
 * Cubic Hermite interpolation for smooth curves
 */
function interpolateCubicHermite(
    x0: number, y0: number, m0: number,
    x1: number, y1: number, m1: number,
    x: number
): number {
    const t = (x - x0) / (x1 - x0);
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    return h00 * y0 + h10 * (x1 - x0) * m0 + h01 * y1 + h11 * (x1 - x0) * m1;
}

function extendShotResult(shotResult: ShotResult, armorDurabilityLeft: number, hpLeft: number): ShotResultWithLeftovers {
    return { ...shotResult, remainingArmorDurability: armorDurabilityLeft, remainingHp: hpLeft };
}

export {
    simulateCombat,
    calculateShotDamage
};
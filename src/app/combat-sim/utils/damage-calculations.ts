/**
 * Effective Damage Calculation for Combat Simulator
 * Handles armor durability, penetration mechanics, and blunt damage
 */
import {BODY_HP, } from "@/app/combat-sim/utils/body-zones";
import {
    CombatSimulationResult,
    DamageCalculationResult,
    RANGE_VALUES, ShotResult
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
    const shots: ShotResult[] = [];
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
            null
        );

        shots.push(shotResult);

        // Apply damage to body part
        currentBodyPartHP -= shotResult.damageToBodyPart;
        totalDamageDealt += shotResult.damageToBodyPart;

        // Apply damage to armor durability
        if (armor && currentArmorDurability > 0) {
            // Ensure we don't go below 0
            const actualArmorDamage = Math.min(currentArmorDurability, shotResult.damageToArmor);
            currentArmorDurability = Math.max(0, currentArmorDurability - actualArmorDamage);
        }

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

/**
 * Calculate damage for a single shot - deterministic approach
 */
function calculateShotDamageDeterministicPrototype(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    currentArmorDurability: number,
    range: number
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
    const durabilityPercent = currentArmorDurability / armor.maxDurability;

    // Get armor effectiveness from the antiPenetrationDurabilityScalarCurve
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

    // For deterministic simulation, use expected damage based on penetration chance
    let damageToBodyPart = 0;
    let damageToArmor = 0;

    // Calculate penetrating damage
    const penetrationDamageScalar = getPenetrationDamageScalar(
        rangePenetration,
        effectiveArmorClass,
        armor.penetrationDamageScalarCurve
    );

    // Important: Even at 0 durability, armor still applies penetration damage reduction
    const penetratingDamage = rangeDamage * penetrationDamageScalar;

    // Calculate blunt damage
    const bluntDamage = rangeDamage * ammo.bluntDamageScale * armor.bluntDamageScalar;

    // Expected damage is weighted average based on penetration chance
    damageToBodyPart = (penetratingDamage * penetrationChance) + (bluntDamage * (1 - penetrationChance));

    // Armor damage calculation based on game observations
    if (currentArmorDurability > 0) {
        // When not penetrating, armor takes significant damage
        const nonPenArmorDamage = rangeDamage * ammo.protectionGearBluntDamageScale * armor.durabilityDamageScalar;

        // When penetrating, armor takes less damage
        const penArmorDamage = rangePenetration * ammo.protectionGearPenetratedDamageScale * armor.durabilityDamageScalar;

        // Expected armor damage
        damageToArmor = (penArmorDamage * penetrationChance) + (nonPenArmorDamage * (1 - penetrationChance));
    }

    // For display purposes, determine if this shot would penetrate based on chance
    const isPenetrating = penetrationChance > 0.5;

    return {
        isPenetrating,
        damageToBodyPart,
        damageToArmor,
        penetrationChance
    };
}

function calculateShotDamage(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    currentArmorDurability: number | null,
    range: number,
    overridePenentrationChance: boolean | null,
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
    const isPenetrating = overridePenentrationChance ?? (Math.random() < penetrationChance);

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
    penetrationCurve?: CurvePoint[]
): number {
    if (effectiveArmorClass <= 0) {
        // 0 armor class means almost guaranteed penetration
        return 0.98; // Not 100% as game shows rare non-pens even at 0 durability
    }

    if (penetrationCurve && penetrationCurve.length > 0) {
        // The curve x-axis represents penetration/armor ratio
        const ratio = penetrationPower / effectiveArmorClass;
        return interpolateBallisticCurve(penetrationCurve, ratio);
    }

    // Fallback formula if no curve data
    const penetrationRatio = penetrationPower / effectiveArmorClass;

    if (penetrationRatio >= 2) return 0.95;
    if (penetrationRatio >= 1.5) return 0.85;
    if (penetrationRatio >= 1.2) return 0.70;
    if (penetrationRatio >= 1) return 0.50;
    if (penetrationRatio >= 0.8) return 0.30;
    if (penetrationRatio >= 0.6) return 0.15;
    if (penetrationRatio >= 0.4) return 0.05;
    return 0.02;
}

/**
 * Get penetration damage scalar from curve
 */
function getPenetrationDamageScalar(
    penetrationDamageScalarCurve: CurvePoint[],
    penetrationPower: number,
    effectiveArmorClass: number
): number {
    // //FIXME
    // return penetrationDamageScalarCurve[1].value

    //I was not able to find ingame cases when this Curve effect occurred, in both overpen/underpen(0 durability) it was always very close to second element of this curve.
    //Measured damage is less by x < 10% (rounded measured data...)
    //return interpolateBallisticCurve(penetrationDamageScalarCurve, ratio);


    // Step 3: Calculate penetration difference (not ratio)
    // This could be what the curve x-axis represents
    const penetrationDifference = Math.max(0, effectiveArmorClass - penetrationPower);

    // Step 4: Interpolate the damage scalar
    // The curve seems centered around 0, where:
    // x < 0: penetration barely beats armor (reduced damage)
    // x = 0: penetration equals effective armor
    // x > 0: penetration exceeds armor (better damage)
    const damageScalar = interpolateBallisticCurve(
        penetrationDamageScalarCurve,
        penetrationDifference
    );

    return damageScalar;

    //FIXME REMOVE - logaritmic approach
    /*const durabilityPercent = currentDurability / maxDurability;
    const penetrationRatio = penetrationPower / effectiveArmorClass;

    // Calculate penetration effectiveness considering durability
    // When armor is fresh, penetration is less effective
    const penetrationEffectiveness = penetrationRatio * (2 - durabilityPercent);

    // Apply logarithmic transformation
    // log(1) = 0, which maps to the second curve point
    // Values < 1 go negative (toward first point)
    // Values > 1 go positive (toward later points)
    const logEffectiveness = Math.log10(penetrationEffectiveness);

    // Clamp to curve range [-1, 2]
    const curveX = Math.max(-1, Math.min(2, logEffectiveness));

    return interpolateBallisticCurve(penetrationDamageScalarCurve, curveX);*/

    //FIXME REMOVE - handpicked sweetspot
    /*// Calculate durability percentage (1 = full, 0 = broken)
    const durabilityPercent = currentDurability / maxDurability;

    // Calculate penetration ratio
    const penetrationRatio = penetrationPower / effectiveArmorClass;

    // When armor is at high durability AND penetration is marginal,
    // use a modified interpolation approach
    if (durabilityPercent > 0.5 && penetrationRatio < 1.5) {
        // For high durability with marginal penetration,
        // interpolate between curve points based on durability
        // This maps high durability to lower damage scalars

        // Map durability 100%-50% to curve x-axis 0 to 0.4
        const curveX = (1 - durabilityPercent) * 0.8; // 0 to 0.4 range


        return interpolateBallisticCurve(penetrationDamageScalarCurve, curveX);
    } else {
        // For low durability or high penetration, use the standard scalar
        // This typically gives us the second curve point value (0.72)
        return penetrationDamageScalarCurve[1].value;
    }*/
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
 * Calculate effective damage after armor interaction
 * This is the legacy function for backward compatibility
 */
function calculateEffectiveDamage(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    range: number
): DamageCalculationResult {
    const shotResult = calculateShotDamage(ammo, armor, armor?.currentDurability || 0, range);

    return {
        penetrationChance: shotResult.penetrationChance,
        penetratingDamage: shotResult.isPenetrating ? shotResult.damageToBodyPart : 0,
        bluntDamage: !shotResult.isPenetrating ? shotResult.damageToBodyPart : 0,
        totalDamage: shotResult.damageToBodyPart,
        isPenetrating: shotResult.isPenetrating
    };
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
        const damage = interpolateBallisticCurve(ammo.ballisticCurves.damageOverDistance, rangeInCurveUnits);
        return damage;
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

export {
    calculateEffectiveDamage,
    simulateCombat,
    calculateShotDamage
};
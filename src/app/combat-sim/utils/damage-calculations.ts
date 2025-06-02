/**
 * Effective Damage Calculation for Combat Simulator
 * Handles armor durability, penetration mechanics, and blunt damage
 */
import {BODY_HP, BodyPart} from "@/app/combat-sim/utils/body-zones";
import {
    AmmoProperties,
    ArmorProperties,
    BallisticCurvePoint,
    CombatSimulationResult,
    DamageCalculationResult,
    RANGE_VALUES, ShotResult
} from "@/app/combat-sim/utils/types";

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
            range
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

/**
 * Calculate damage for a single shot
 */
function calculateShotDamageOrig(
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

    // Determine if this shot penetrates (random roll).
    //FIXME temp approach to stabilize damage mechanics
    const isPenetrating = Math.random() < penetrationChance;

    let damageToBodyPart = 0;
    let damageToArmor = 0;

    if (isPenetrating) {
        // Penetrating shot
        const penetrationDamageScalar = getPenetrationDamageScalar(
            rangePenetration,
            effectiveArmorClass,
            armor.penetrationDamageScalarCurve
        );

        damageToBodyPart = rangeDamage * penetrationDamageScalar  //almost 2 times less then in game


        // Armor takes durability damage on penetration
        damageToArmor = rangePenetration * ammo.protectionGearPenetratedDamageScale; // almost 10 times less then in game

        //TODO revisit - why durabilityDamageScalar is not used here?
        // damageToArmor = calculateArmorDurabilityDamage(
        //     rangePenetration,
        //     effectiveArmorClass,
        //     armor.durabilityDamageScalar
        // );
    } else {
        // Non-penetrating shot (blunt damage)
        damageToBodyPart = rangeDamage * ammo.bluntDamageScale * armor.bluntDamageScalar; //Seems correct


        // Armor takes durability damage when stopping bullet
        damageToArmor = rangeDamage * ammo.protectionGearBluntDamageScale * armor.bluntDamageScalar; // 30% less then ingame

        // // Armor takes durability damage when stopping bullet
        // damageToArmor = calculateArmorDurabilityDamage(
        //     rangePenetration,
        //     effectiveArmorClass,
        //     armor.durabilityDamageScalar
        // );
    }

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
    const armorEffectiveness = getArmorEffectivenessFromDurability(
        durabilityPercent,
        armor.antiPenetrationDurabilityScalarCurve
    );

    // Calculate effective armor class
    const effectiveArmorClass = armor.armorClass // * armorEffectiveness;

    // Calculate penetration chance
    const penetrationChance = calculatePenetrationChance(
        rangePenetration,
        effectiveArmorClass,
        armor.penetrationChanceCurve
    );

    // Determine if this shot penetrates
    const isPenetrating = true; //Math.random() < penetrationChance;

    let damageToBodyPart = 0;
    let damageToArmor = 0;

    if (isPenetrating) {
        // For penetrationDamageScalarCurve, try using armor class directly
        const penetrationDamageScalar = getPenetrationDamageScalarFixed(
            effectiveArmorClass,  // Use armor class, not ratio
            armor.penetrationDamageScalarCurve
        );

        damageToBodyPart = rangeDamage * penetrationDamageScalar;

        // Armor damage for penetrating shots - use damage, not penetration
        damageToArmor = rangeDamage * ammo.protectionGearPenetratedDamageScale * armor.durabilityDamageScalar;

    } else {
        // Non-penetrating shot (blunt damage)
        damageToBodyPart = rangeDamage * ammo.bluntDamageScale * armor.bluntDamageScalar;

        // Armor damage for non-penetrating shots
        damageToArmor = rangeDamage * ammo.protectionGearBluntDamageScale * armor.durabilityDamageScalar;
    }

    return {
        isPenetrating,
        damageToBodyPart,
        damageToArmor,
        penetrationChance
    };
}

// New function for penetration damage scalar
function getPenetrationDamageScalarFixed(
    armorClass: number,
    penetrationDamageScalarCurve?: BallisticCurvePoint[]
): number {
    if (penetrationDamageScalarCurve && penetrationDamageScalarCurve.length > 0) {
        // The curve x-axis appears to be armor class based on the -1 to 2 range
        // Map armor class (0-6) to curve range (-1 to 2)
        const normalizedValue = (armorClass - 3) / 2; // Maps AC 0-6 to -1.5 to 1.5
        return interpolateBallisticCurve(penetrationDamageScalarCurve, normalizedValue);
    }

    // Default fallback
    return 0.75;
}

/**
 * Get armor effectiveness from antiPenetrationDurabilityScalarCurve
 * This determines how much the armor class is reduced based on durability
 */
function getArmorEffectivenessFromDurability(
    durabilityPercent: number,
    curve?: BallisticCurvePoint[]
): number {
    if (!curve || curve.length === 0) {
        // Default: linear degradation
        // At 100% durability: 1.0 effectiveness
        // At 0% durability: 0.0 effectiveness (armor class becomes 0)
        return durabilityPercent;
    }

    // Use the curve to determine effectiveness
    return interpolateBallisticCurve(curve, durabilityPercent);
}

/**
 * Calculate penetration chance using armor curves
 */
function calculatePenetrationChance(
    penetrationPower: number,
    effectiveArmorClass: number,
    penetrationCurve?: BallisticCurvePoint[]
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
    penetrationPower: number,
    armorClass: number,
    penetrationDamageScalarCurve?: BallisticCurvePoint[]
): number {
    if (penetrationDamageScalarCurve && penetrationDamageScalarCurve.length > 0) {
        // The curve x-axis often represents the penetration/armor ratio
        const ratio = armorClass > 0 ? penetrationPower / armorClass : 2;
        return interpolateBallisticCurve(penetrationDamageScalarCurve, ratio);
    }

    // Default: higher penetration = less damage reduction
    const ratio = armorClass > 0 ? penetrationPower / armorClass : 2;
    if (ratio >= 2) return 0.95;
    if (ratio >= 1.5) return 0.85;
    if (ratio >= 1) return 0.75;
    return 0.65;
}

/**
 * Interpolate value from ballistic curve
 */
function interpolateBallisticCurve(
    curve: BallisticCurvePoint[],
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
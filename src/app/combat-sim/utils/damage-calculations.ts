/**
 * Effective Damage Calculation for Combat Simulator
 * Handles armor durability, penetration mechanics, and blunt damage
 */

interface DamageCalculationResult {
    penetrationChance: number;
    penetratingDamage: number;
    bluntDamage: number;
    totalDamage: number;
    isPenetrating: boolean;
}

interface ArmorProperties {
    armorClass: number;
    maxDurability: number;
    currentDurability: number;
    durabilityDamageScalar: number;
    bluntDamageScalar: number;
    penetrationChanceCurve?: PenetrationCurvePoint[];
    penetrationDamageScalarCurve?: PenetrationCurvePoint[];
}

interface AmmoProperties {
    damage: number;
    penetration: number;
    bluntDamageScale: number;
    protectionGearPenetratedDamageScale: number;
    protectionGearBluntDamageScale: number;
}

interface PenetrationCurvePoint {
    time: number;
    value: number;
}

/**
 * Calculate effective damage after armor interaction
 * @param ammo - Ammunition properties
 * @param armor - Armor properties (null if unarmored)
 * @param range - Distance to target in meters
 * @returns Detailed damage calculation results
 */
function calculateEffectiveDamage(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    range: number
): DamageCalculationResult {
    // Apply range falloff to base damage
    const rangeDamage = applyRangeFalloff(ammo.damage, ammo, range);
    const rangePenetration = applyRangePenetrationFalloff(ammo.penetration, ammo, range);

    // If no armor, full damage applies
    if (!armor) {
        return {
            penetrationChance: 1,
            penetratingDamage: rangeDamage,
            bluntDamage: 0,
            totalDamage: rangeDamage,
            isPenetrating: true
        };
    }

    // Calculate armor effectiveness based on durability
    const durabilityPercent = armor.currentDurability / armor.maxDurability;
    const armorEffectiveness = calculateArmorEffectiveness(durabilityPercent, armor.armorClass);

    // Calculate penetration chance
    const penetrationChance = calculatePenetrationChance(
        rangePenetration,
        armor.armorClass,
        armorEffectiveness,
        armor.penetrationChanceCurve
    );

    // Calculate damage based on penetration
    let penetratingDamage = 0;
    let bluntDamage = 0;

    if (penetrationChance > 0) {
        // Calculate penetrating damage with armor reduction
        const penetrationDamageScalar = getPenetrationDamageScalar(
            rangePenetration,
            armor.armorClass,
            armor.penetrationDamageScalarCurve
        );

        penetratingDamage = rangeDamage *
            penetrationDamageScalar *
            ammo.protectionGearPenetratedDamageScale;
    }

    // Calculate blunt damage (always applies when armor stops the bullet)
    const bluntChance = 1 - penetrationChance;
    if (bluntChance > 0) {
        bluntDamage = rangeDamage *
            armor.bluntDamageScalar *
            ammo.bluntDamageScale *
            ammo.protectionGearBluntDamageScale *
            bluntChance;
    }

    // Determine if this shot would penetrate (for single shot calculation)
    const isPenetrating = Math.random() < penetrationChance;

    // For expected damage calculation (average over many shots)
    const totalDamage = (penetratingDamage * penetrationChance) + bluntDamage;

    return {
        penetrationChance,
        penetratingDamage,
        bluntDamage,
        totalDamage,
        isPenetrating
    };
}

/**
 * Calculate armor effectiveness based on durability
 * At 0% durability, armor loses its ability to deflect bullets
 * but still provides some penetration reduction
 */
function calculateArmorEffectiveness(
    durabilityPercent: number,
    armorClass: number
): number {
    // At 0% durability, armor retains 20-30% effectiveness based on class
    const minEffectiveness = 0.2 + (armorClass * 0.02);

    // Linear degradation from 100% to minimum
    return minEffectiveness + (1 - minEffectiveness) * durabilityPercent;
}

/**
 * Calculate penetration chance using armor curves or default formula
 */
function calculatePenetrationChance(
    penetrationPower: number,
    armorClass: number,
    armorEffectiveness: number,
    penetrationCurve?: PenetrationCurvePoint[]
): number {
    // Adjust armor class by effectiveness
    const effectiveArmorClass = armorClass * armorEffectiveness;

    if (penetrationCurve && penetrationCurve.length > 0) {
        // Use custom penetration curve from armor data
        return interpolateCurve(penetrationCurve, penetrationPower / effectiveArmorClass);
    }

    // Default penetration formula
    const penetrationRatio = penetrationPower / effectiveArmorClass;

    if (penetrationRatio >= 2) return 0.95; // Almost guaranteed penetration
    if (penetrationRatio >= 1.5) return 0.85;
    if (penetrationRatio >= 1.2) return 0.70;
    if (penetrationRatio >= 1) return 0.50;
    if (penetrationRatio >= 0.8) return 0.30;
    if (penetrationRatio >= 0.6) return 0.15;
    if (penetrationRatio >= 0.4) return 0.05;
    return 0.02; // Minimal chance
}

/**
 * Get penetration damage scalar from curve or default
 */
function getPenetrationDamageScalar(
    penetrationPower: number,
    armorClass: number,
    penetrationDamageScalarCurve?: PenetrationCurvePoint[]
): number {
    if (penetrationDamageScalarCurve && penetrationDamageScalarCurve.length > 0) {
        const ratio = penetrationPower / armorClass;
        return interpolateCurve(penetrationDamageScalarCurve, ratio);
    }

    // Default: higher penetration = less damage reduction
    const ratio = penetrationPower / armorClass;
    if (ratio >= 2) return 0.95;
    if (ratio >= 1.5) return 0.85;
    if (ratio >= 1) return 0.75;
    return 0.65;
}

/**
 * Apply damage falloff based on range
 */
function applyRangeFalloff(
    baseDamage: number,
    ammo: AmmoProperties & { damageAtRange?: any },
    range: number
): number {
    // If we have specific range data, use it
    if (ammo.damageAtRange) {
        if (range <= 0) return ammo.damageAtRange['0m'] || baseDamage;
        if (range <= 100) {
            return interpolateRange(0, ammo.damageAtRange['0m'], 100, ammo.damageAtRange['100m'], range);
        }
        if (range <= 300) {
            return interpolateRange(100, ammo.damageAtRange['100m'], 300, ammo.damageAtRange['300m'], range);
        }
        if (range <= 500) {
            return interpolateRange(300, ammo.damageAtRange['300m'], 500, ammo.damageAtRange['500m'], range);
        }
    }

    // Default falloff formula
    const falloffFactor = 1 - (range / 1000) * 0.3; // 30% reduction at 1000m
    return baseDamage * Math.max(falloffFactor, 0.5); // Minimum 50% damage
}

/**
 * Apply penetration falloff based on range
 */
function applyRangePenetrationFalloff(
    basePenetration: number,
    ammo: AmmoProperties & { penetrationAtRange?: any },
    range: number
): number {
    // If we have specific range data, use it
    if (ammo.penetrationAtRange) {
        if (range <= 0) return ammo.penetrationAtRange['0m'] || basePenetration;
        if (range <= 100) {
            return interpolateRange(0, ammo.penetrationAtRange['0m'], 100, ammo.penetrationAtRange['100m'], range);
        }
        if (range <= 300) {
            return interpolateRange(100, ammo.penetrationAtRange['100m'], 300, ammo.penetrationAtRange['300m'], range);
        }
        if (range <= 500) {
            return interpolateRange(300, ammo.penetrationAtRange['300m'], 500, ammo.penetrationAtRange['500m'], range);
        }
    }

    // Default falloff formula
    const falloffFactor = 1 - (range / 1500) * 0.25; // 25% reduction at 1500m
    return basePenetration * Math.max(falloffFactor, 0.6); // Minimum 60% penetration
}

/**
 * Linear interpolation helper
 */
function interpolateRange(x1: number, y1: number, x2: number, y2: number, x: number): number {
    return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
}

/**
 * Interpolate value from curve points
 */
function interpolateCurve(curve: PenetrationCurvePoint[], x: number): number {
    if (curve.length === 0) return 0;
    if (x <= curve[0].time) return curve[0].value;
    if (x >= curve[curve.length - 1].time) return curve[curve.length - 1].value;

    for (let i = 0; i < curve.length - 1; i++) {
        if (x >= curve[i].time && x <= curve[i + 1].time) {
            return interpolateRange(
                curve[i].time,
                curve[i].value,
                curve[i + 1].time,
                curve[i + 1].value,
                x
            );
        }
    }

    return curve[curve.length - 1].value;
}

/**
 * Calculate shots to kill considering both penetrating and blunt damage
 */
function calculateShotsToKill(
    targetHP: number,
    damageResult: DamageCalculationResult
): number {
    if (damageResult.totalDamage <= 0) return Infinity;

    // For expected shots (statistical average)
    return Math.ceil(targetHP / damageResult.totalDamage);
}

export {
    calculateEffectiveDamage,
    calculateShotsToKill,
    type DamageCalculationResult,
    type ArmorProperties,
    type AmmoProperties
};
/**
 * Effective Damage Calculation for Combat Simulator
 * Handles armor durability, penetration mechanics, and blunt damage
 */
import {BODY_HP, BodyPart} from "@/app/combat-sim/utils/body-zones";
import {BallisticCurvePoint, RANGE_PRESETS, RANGE_VALUES} from "@/app/combat-sim/utils/types";

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
    // Apply range falloff to base damage and penetration
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

    // Calculate penetrating damage
    let penetratingDamage = 0;
    if (penetrationChance > 0) {
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
    let bluntDamage = 0;
    if (bluntChance > 0) {
        bluntDamage = rangeDamage *
            armor.bluntDamageScalar *
            ammo.bluntDamageScale *
            ammo.protectionGearBluntDamageScale *
            bluntChance;
    }

    // Calculate expected total damage (statistical average)
    const totalDamage = (penetratingDamage * penetrationChance) + bluntDamage;

    return {
        penetrationChance,
        penetratingDamage,
        bluntDamage,
        totalDamage,
        isPenetrating: Math.random() < penetrationChance
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
        return ammo.damageAtRange[range+'m'];
    }

    // Convert range from meters to distance units used in curves (appears to be in cm based on the data)
    const rangeInCurveUnits = range * 100; // Convert meters to centimeters

    // If we have ballistic curve data, use it
    if (ammo.ballisticCurves?.damageOverDistance) {
        const curve = ammo.ballisticCurves.damageOverDistance;

        // Find the appropriate curve segment for interpolation
        for (let i = 0; i < curve.length - 1; i++) {
            const currentPoint = curve[i];
            const nextPoint = curve[i + 1];

            if (rangeInCurveUnits >= currentPoint.time && rangeInCurveUnits <= nextPoint.time) {
                // Interpolate between the two points
                if (currentPoint.interpMode === 'linear') {
                    return interpolateRange(
                        currentPoint.time,
                        currentPoint.value,
                        nextPoint.time,
                        nextPoint.value,
                        rangeInCurveUnits
                    );
                } else if (currentPoint.interpMode === 'cubic') {
                    // For cubic interpolation, use Hermite interpolation with tangents
                    return interpolateCubicHermite(
                        currentPoint.time,
                        currentPoint.value,
                        currentPoint.leaveTangent || 0,
                        nextPoint.time,
                        nextPoint.value,
                        nextPoint.arriveTangent || 0,
                        rangeInCurveUnits
                    );
                }
            }
        }

        // If range is beyond curve data, use the last point's value
        if (rangeInCurveUnits >= curve[curve.length - 1].time) {
            return curve[curve.length - 1].value;
        }

        // If range is before curve data, use the first point's value
        if (rangeInCurveUnits <= curve[0].time) {
            return curve[0].value;
        }
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
        return ammo.penetrationAtRange[range+'m'];
    }

    // Convert range from meters to distance units used in curves
    const rangeInCurveUnits = range * 100;

    // If we have ballistic curve data for penetration, use it
    if (ammo.ballisticCurves?.penetrationPowerOverDistance) {
        const curve = ammo.ballisticCurves.penetrationPowerOverDistance;

        // Find the appropriate curve segment for interpolation
        for (let i = 0; i < curve.length - 1; i++) {
            const currentPoint = curve[i];
            const nextPoint = curve[i + 1];

            if (rangeInCurveUnits >= currentPoint.time && rangeInCurveUnits <= nextPoint.time) {
                if (currentPoint.interpMode === 'linear') {
                    return interpolateRange(
                        currentPoint.time,
                        currentPoint.value,
                        nextPoint.time,
                        nextPoint.value,
                        rangeInCurveUnits
                    );
                } else if (currentPoint.interpMode === 'cubic') {
                    return interpolateCubicHermite(
                        currentPoint.time,
                        currentPoint.value,
                        currentPoint.leaveTangent || 0,
                        nextPoint.time,
                        nextPoint.value,
                        nextPoint.arriveTangent || 0,
                        rangeInCurveUnits
                    );
                }
            }
        }

        // Handle out-of-range cases
        if (rangeInCurveUnits >= curve[curve.length - 1].time) {
            return curve[curve.length - 1].value;
        }
        if (rangeInCurveUnits <= curve[0].time) {
            return curve[0].value;
        }
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
    bodyPart: BodyPart,
    damageResult: DamageCalculationResult
): number {
    if (damageResult.totalDamage <= 0) return Infinity;

    const targetHP = bodyPart.isVital ? bodyPart.hp : BODY_HP;

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
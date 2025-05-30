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
 */
function simulateCombat(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    bodyPartHP: number,
    isVital: boolean = false,
    range: number
): CombatSimulationResult {
    const shots: ShotResult[] = [];
    let currentBodyPartHP = isVital ? bodyPartHP : BODY_HP; // For non-vital parts, we need to track total body HP
    let currentArmorDurability = armor?.currentDurability || 0; //FIXME consider maxDurability instead of 0
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
            currentArmorDurability = Math.max(0, currentArmorDurability - shotResult.damageToArmor);
        }

        // Check if dead
        if (currentBodyPartHP <= 0) {
            break; // Vital part destroyed = death
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
 * Calculate damage for a single shot
 */
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
    //TODO RETEST INGAME IF 0 DURABILITY CAN BE NOT PENNED AND AFFECTS DAMAGE
    if (!armor || currentArmorDurability <= 0) {
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

    // Calculate penetration chance with degraded armor
    const effectiveArmorClass = armor.armorClass * armorEffectiveness;
    const penetrationChance = calculatePenetrationChance(
        rangePenetration,
        effectiveArmorClass,
        armor.penetrationChanceCurve
    );

    // Determine if this shot penetrates (random roll).
    //TODO consider reworking this part, I want simulation result always be the same, probably add some flag that will indicate accumulating pen probabilities'
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

        damageToBodyPart = rangeDamage * penetrationDamageScalar


        // Armor takes durability damage on penetration
        damageToArmor = rangePenetration * ammo.protectionGearPenetratedDamageScale;
        //TODO revisit - why durabilityDamageScalar is not used here?
        // damageToArmor = calculateArmorDurabilityDamage(
        //     rangePenetration,
        //     effectiveArmorClass,
        //     armor.durabilityDamageScalar
        // );
    } else {
        // Non-penetrating shot (blunt damage)
        damageToBodyPart = rangeDamage * ammo.bluntDamageScale * armor.bluntDamageScalar;


        // Armor takes durability damage when stopping bullet
        damageToArmor = rangeDamage * ammo.protectionGearBluntDamageScale * armor.bluntDamageScalar;

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

/**
 * Get armor effectiveness from antiPenetrationDurabilityScalarCurve
 */
function getArmorEffectivenessFromDurability(
    durabilityPercent: number,
    curve?: BallisticCurvePoint[]
): number {
    if (!curve || curve.length === 0) {
        // Default: linear degradation from 1.0 to 0.3
        return 0.3 + (0.7 * durabilityPercent);
    }

    // Use the curve to determine effectiveness
    // The curve maps durability (0-1) to effectiveness scalar (0-1)
    return interpolateBallisticCurve(curve, durabilityPercent);
}

/**
 * Calculate armor durability damage
 */
//TODO revisit - seems like nonsense
function calculateArmorDurabilityDamage(
    penetrationPower: number,
    effectiveArmorClass: number,
    durabilityDamageScalar: number
): number {
    // Base durability damage is related to the penetration power
    // Higher penetration = more durability damage
    const penetrationRatio = penetrationPower / effectiveArmorClass;

    // Base damage scaled by armor's durability damage scalar
    const baseDurabilityDamage = 1 + (penetrationRatio * 2); // 1-3 base damage

    return baseDurabilityDamage * durabilityDamageScalar;
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
    // For backward compatibility, return average expected damage
    // This is used for heat maps and quick comparisons

    if (!armor) {
        const rangeDamage = applyRangeFalloff(ammo.damage, ammo, range);
        return {
            penetrationChance: 1,
            penetratingDamage: rangeDamage,
            bluntDamage: 0, //TODO test if blunt is not applied on penetration
            totalDamage: rangeDamage,
            isPenetrating: true
        };
    }

    // Calculate average based on current armor durability
    const durabilityPercent = armor.currentDurability / armor.maxDurability;
    const armorEffectiveness = getArmorEffectivenessFromDurability(
        durabilityPercent,
        armor.antiPenetrationDurabilityScalarCurve
    );

    const effectiveArmorClass = armor.armorClass * armorEffectiveness;
    const rangeDamage = applyRangeFalloff(ammo.damage, ammo, range);
    const rangePenetration = applyRangePenetrationFalloff(ammo.penetration, ammo, range);

    const penetrationChance = calculatePenetrationChance(
        rangePenetration,
        effectiveArmorClass,
        armor.penetrationChanceCurve
    );

    const penetrationDamageScalar = getPenetrationDamageScalar(
        rangePenetration,
        effectiveArmorClass,
        armor.penetrationDamageScalarCurve
    );

    const penetratingDamage = rangeDamage *
        penetrationDamageScalar *
        ammo.protectionGearPenetratedDamageScale;

    const bluntDamage = rangeDamage *
        armor.bluntDamageScalar *
        ammo.bluntDamageScale *
        ammo.protectionGearBluntDamageScale;

    // Average expected damage
    const totalDamage = (penetratingDamage * penetrationChance) +
        (bluntDamage * (1 - penetrationChance));

    return {
        penetrationChance,
        penetratingDamage,
        bluntDamage,
        totalDamage,
        isPenetrating: penetrationChance > 0.5
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
    effectiveArmorClass: number,
    penetrationCurve?: BallisticCurvePoint[]
): number {
    if (penetrationCurve && penetrationCurve.length > 0) {
        // Use custom penetration curve from armor data
        return interpolateCurve(penetrationCurve, penetrationPower / effectiveArmorClass);
    }

    //TODO REVISIT FALLBACK VALUES
    console.warn('Penetration chance curve not found for armor, using default formula.')

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
    penetrationDamageScalarCurve?: BallisticCurvePoint[]
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
        return ammo.damageAtRange[range + 'm'];
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
        return ammo.penetrationAtRange[range + 'm'];
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
function interpolateCurve(curve: BallisticCurvePoint[], x: number): number {
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

export {
    calculateEffectiveDamage,
    simulateCombat
};
/**
 * Effective damage for the combat simulator: armour durability, penetration and blunt damage.
 *
 * This follows the decompiled model in the extraction repo's docs/DAMAGE_MODEL.md §3-§7 rather
 * than a fit to measurements - `ProcessDamageReceived` and `GetDamagePostGearProtection` are read
 * out of the shipped binary. The order the game works in, and the order below:
 *
 *   damage   = ammo damage at range                     (DamageOverDistance)
 *   base     = damage x body-part multiplier x firePower
 *   pen      = ammo penetration at range                (PenetrationPowerOverDistance)
 *   armour   = armorClass x effectiveness(1 - dur/max)
 *   delta    = armour - pen
 *   through  = dur <= 0 ? always : penetrationChanceCurve(delta) >= roll
 *   body     = base x (through ? penDamageCurve(max(delta,-2))
 *                              : bluntDamageScalar x ammo.bluntDamageScale) x firePower
 *   armourHP = base x durabilityDamageScalar x (through ? penDurScale : bluntDurScale)
 *
 * Two traps that cost the previous version its accuracy: firePower is applied TWICE on a hit the
 * armour covers and once on a bare one, and the armour is billed from the same `base` as the body -
 * including the body-part multiplier - using the durability it had BEFORE the bullet landed.
 *
 * Not modelled: `PenetrationUsed` (penetration spent on surfaces the bullet already passed
 * through), the per-shot random seed, bleeding, and a vest's directional ProtectionAngle wedge -
 * so an armoured zone is treated as covering every angle. See docs/ARMOR_PENETRATION_AUDIT.md.
 */
import {ARMOR_ZONES, BODY_HP, BodyPart,} from "@/app/combat-sim/utils/body-zones";
import {
    CombatSimulationResult,
    RANGE_VALUES, ShotResult, ShotResultWithLeftovers
} from "@/app/combat-sim/utils/types";
import {AmmoProperties, ArmorProperties, CurvePoint} from "@/types/items";

/**
 * Simulate combat shot by shot, wearing the armour down as it goes.
 *
 * Deterministic: every shot takes the MORE LIKELY of penetrate/blunt rather than rolling. That is
 * not an average - near a 50 % penetration chance the two branches are far apart and the true
 * expected damage sits between them, so shots-to-kill is a modal figure, not a mean.
 */
function simulateCombat(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    weaponFiringPower: number,
    zoneId: keyof typeof ARMOR_ZONES,
    bodyPart: BodyPart,
    range: number,
): CombatSimulationResult {
    const shots: ShotResultWithLeftovers[] = [];
    const armorZone = ARMOR_ZONES[zoneId];
    let currentBodyPartHP = bodyPart.hp;
    let currentBodyHP = BODY_HP;
    let currentArmorDurability = armor?.currentDurability || 0;
    let totalDamageDealt = 0;
    let shotsToKill = 0;


    while ((bodyPart.isVital ? currentBodyPartHP > 0 : currentBodyHP > 0) && shotsToKill < 99) { // Safety limit
        shotsToKill++;

        const shotResult = calculateShotDamage(
            ammo,
            armor,
            currentArmorDurability,
            weaponFiringPower,
            (currentBodyPartHP > 0) ? armorZone.damageModifier : armorZone.destroyedDamageModifier,
            range,
            null,
            false,
        );

        // Apply damage to body part
        currentBodyPartHP = Math.max(0, currentBodyPartHP - shotResult.damageToBodyPart);
        currentBodyHP -= shotResult.damageToBodyPart;
        totalDamageDealt += shotResult.damageToBodyPart;

        // Apply damage to armor durability
        if (armor && currentArmorDurability > 0) {
            const actualArmorDamage = Math.min(currentArmorDurability, shotResult.damageToArmor);
            currentArmorDurability = Math.max(0, currentArmorDurability - actualArmorDamage);
        }

        shots.push(extendShotResult(shotResult, currentArmorDurability, currentBodyHP));
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
    weaponFiringPower: number,
    damageModifier: number = 1,
    range: number,
    overridePenetrationChance: boolean | null = null,
    applyRandom: boolean = false,
): ShotResult {
    // Range falloff, straight off the ammo's own curves. //FIXME DAMAGE manipulation is to handle buckshot
    const rangeDamage = applyRangeFalloff((ammo.pellets || 1) * ammo.damage, ammo, range);
    // Firing power never touches penetration - see the note on firePowerScalar().
    const rangePenetration = Math.max(0, applyRangePenetrationFalloff(ammo.penetration, ammo, range));

    /*
     * `GetDamagePostGearProtection` scales by the body-part multiplier and by firing power BEFORE
     * it offers the hit to any gear, and it hands that value to `ProcessDamageReceived` as
     * `BaseDamage`. So this one number is what both the body and the armour are computed from -
     * the armour is not billed from some separate pre-multiplier figure.
     */
    const firePower = firePowerScalar(weaponFiringPower);
    const baseDamage = rangeDamage * damageModifier * firePower;

    // No armour at all, or none covering this hit: `ProcessDamageReceived` returns before it writes
    // OutRawDamage, so the caller's value survives untouched and the shot deals full damage.
    if (!armor) {
        return {
            isPenetrating: true,
            damageToBodyPart: baseDamage,
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

    /*
     * Broken armour is bypassed, not merely weakened: `GetIsPenetrated` returns true immediately
     * when DurabilityLevel <= 0, without consulting the curve at all.
     *
     * Otherwise the game draws a per-shot number and penetrates when `chance >= roll`. The seed
     * travels with the shot so client and server agree; we cannot reproduce it, so `applyRandom`
     * rolls our own and the default path takes the more likely of the two outcomes. That default is
     * an approximation of a coin flip, NOT the rule - near chance = 0.5 the two branches differ by
     * a lot and the true expected damage lies between them.
     */
    const isPenetrating = overridePenetrationChance
        ?? (durabilityPercent <= 0
            || (applyRandom ? penetrationChance >= Math.random() : penetrationChance > 0.5));

    let damageToBodyPart = baseDamage;
    // The armour is billed from the same BaseDamage the body is, and from the durability it had
    // BEFORE this bullet - §4 settles the old "maybe armour is depleted first" question: it is not.
    let damageToArmor = baseDamage * armor.durabilityDamageScalar;

    if (isPenetrating) {
        damageToBodyPart *= getPenetrationDamageScalar(
            armor.penetrationDamageScalarCurve, rangePenetration, effectiveArmorClass);
        damageToArmor *= ammo.protectionGearPenetratedDamageScale;
    } else {
        damageToBodyPart *= ammo.bluntDamageScale * armor.bluntDamageScalar;
        damageToArmor *= ammo.protectionGearBluntDamageScale;
    }

    // Firing power a second time. `GetDamagePostGearProtection` applied it once before handing the
    // hit over, and `ProcessDamageReceived` multiplies its own damage scale by it again - so a hit
    // the armour covers is scaled twice and a bare hit only once. The armour's durability loss is
    // NOT scaled again; it is billed from BaseDamage, which carries the single earlier factor.
    damageToBodyPart *= firePower;

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
    // Confirmed against the decompiled `GetIsPenetrated`: the curve's x is the DIFFERENCE
    // `AntiPenetration - Penetration`, not a ratio, and it is not clamped.
    return interpolateBallisticCurve(penetrationCurve, effectiveArmorClass - penetrationPower);
}

/**
 * Get penetration damage scalar from curve
 */
function getPenetrationDamageScalar(
    penetrationDamageScalarCurve: CurvePoint[],
    penetrationPower: number,
    effectiveArmorClass: number
): number {


    /*
     * Same x as the chance curve - `AntiPenetration - Penetration` - clamped at -2, which is what
     * `maxss xmm6, [-2.0f]` does immediately before the lookup. So:
     *
     *   x > 0  armour outclasses the round; it scraped through and keeps the least damage
     *   x = 0  penetration exactly equals effective armour class
     *   x < 0  the round outclasses the armour; every curve reaches 1.0 by x = -1, so beating it
     *          by a full class is already full damage and there is no reward past that
     *
     * Clamping the low end at 0 (as this used to) truncated the whole region where good ammo beats
     * good armour, and under-read damage on every over-penetrating shot.
     */
    const penetrationDifference = Math.max(-2, effectiveArmorClass - penetrationPower);

    return interpolateBallisticCurve(penetrationDamageScalarCurve, penetrationDifference);
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
    // Prefer the precalculated cache, but only rounds that were on the published wiki carry it -
    // the rest fall through to the curve it was computed from.
    if (RANGE_VALUES.includes(range)) {
        if (range === 0) return baseDamage;
        // @ts-expect-error - range is value 60, 120, 240, or 480
        const cached = ammo.damageAtRange?.[range + 'm'];
        if (cached) return cached;
    }

    // Convert range from meters to distance units used in curves (appears to be in cm)
    const rangeInCurveUnits = range * 100;

    // If we have ballistic curve data, use it
    if (ammo.ballisticCurves?.damageOverDistance) {
        return interpolateBallisticCurve(ammo.ballisticCurves.damageOverDistance, rangeInCurveUnits);
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
        const cached = ammo.penetrationAtRange?.[range + 'm'];
        if (cached) return cached;
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
 * The weapon's firing-power factor on DAMAGE. `0.9 + 0.2 * FiringPower`, read out of
 * `GetDamagePostGearProtection` and `ProcessDamageReceived`, which each apply it once.
 *
 * This replaces a fitted `1 - (0.5 - fp)/4.479`. That divisor sat between this expression and its
 * square, which is exactly what fitting a single curve to a mix of armoured and unarmoured
 * observations produces - the armoured ones are scaled twice. The old note blaming the mismatch on
 * "some mistake at armor damage reduction part" was half right: the armour side was wrong too, but
 * the doubling is why one factor could never fit both cases.
 *
 * There is deliberately no firing-power term on PENETRATION. `ProcessDamageReceived` never touches
 * the round's penetration with it; the only thing subtracted there is `PenetrationUsed`, the
 * penetration already spent on surfaces the bullet passed through, which we do not model.
 */
function firePowerScalar(firingPower: number): number {
    return 0.9 + 0.2 * firingPower;
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
    return {...shotResult, remainingArmorDurability: armorDurabilityLeft, remainingHp: hpLeft};
}

export {
    simulateCombat,
    calculateShotDamage
};
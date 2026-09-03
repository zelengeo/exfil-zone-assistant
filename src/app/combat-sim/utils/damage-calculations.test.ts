/**
 * The shot model, pinned at the points where it has been wrong before.
 *
 * Two of these are regression bars rather than fresh checks. Firing power is `0.9 + 0.2 * fp`
 * applied once, replacing a fitted curve that scaled armoured shots twice; and the penetration
 * damage scalar is looked up on `armourClass - penetration` clamped at -2, replacing a clamp at 0
 * that truncated the whole region where good ammo beats good armour.
 *
 * Everything runs with `applyRandom` off and the penetration roll overridden, so a failure here is
 * the model changing rather than a die landing differently.
 *
 * The fixture carries ballistic curves because every one of the published rounds does. Two things
 * follow that are easy to get wrong when reading the code cold: the curve is keyed in centimetres,
 * and past point blank it supplies the damage outright rather than scaling the round's own figure.
 */
import { describe, expect, it } from 'vitest';
import { calculateShotDamage } from '@/app/combat-sim/utils/damage-calculations';
import { CALIBERS, type AmmoProperties, type ArmorProperties, type CurvePoint } from '@/types/items';

/** A straight line between the given points — enough to make a lookup predictable. */
const linear = (points: readonly (readonly [number, number])[]): CurvePoint[] =>
    points.map(([time, value]) => ({
        interpMode: 'linear' as const,
        tangentMode: 'auto' as const,
        time,
        value,
        arriveTangent: 0,
        leaveTangent: 0,
    }));

/** 100 damage at the muzzle falling to 50 at 500 m; the x axis is centimetres. */
const DAMAGE_OVER_DISTANCE = linear([[0, 100], [50_000, 50]]);

const ammo = (extra: Partial<AmmoProperties> = {}): AmmoProperties => ({
    damage: 100,
    penetration: 30,
    caliber: CALIBERS[0],
    bluntDamageScale: 0.2,
    bleedingChance: 0,
    protectionGearPenetratedDamageScale: 1,
    protectionGearBluntDamageScale: 1,
    muzzleVelocity: 800,
    ballisticCurves: {
        damageOverDistance: DAMAGE_OVER_DISTANCE,
        penetrationPowerOverDistance: linear([[0, 30], [50_000, 15]]),
    },
    ...extra,
});

const armor = (extra: Partial<ArmorProperties> = {}): ArmorProperties => ({
    armorClass: 4,
    maxDurability: 100,
    currentDurability: 100,
    durabilityDamageScalar: 1,
    bluntDamageScalar: 1,
    penetrationChanceCurve: linear([[-10, 1], [10, 0]]),
    penetrationDamageScalarCurve: linear([[-2, 1], [0, 0.5]]),
    antiPenetrationDurabilityScalarCurve: linear([[0, 1], [100, 1]]),
    ...extra,
});

/** Firing power of 0.5 makes the scalar exactly 1, so it drops out of the arithmetic. */
const NEUTRAL_FIRING_POWER = 0.5;

const unarmoured = (over: { range?: number; modifier?: number; round?: AmmoProperties } = {}) =>
    calculateShotDamage(
        over.round ?? ammo(),
        null,
        null,
        NEUTRAL_FIRING_POWER,
        over.modifier ?? 1,
        over.range ?? 0,
    );

describe('an unarmoured hit at point blank', () => {
    // Range zero short-circuits ahead of the curve and uses the round's own damage.
    it('lands the round its full damage', () => {
        expect(unarmoured().damageToBodyPart).toBeCloseTo(100);
    });

    it('counts every pellet of a buckshot round', () => {
        expect(unarmoured({ round: ammo({ pellets: 8, damage: 10 }) }).damageToBodyPart)
            .toBeCloseTo(80);
    });

    it('scales by the body-part modifier', () => {
        expect(unarmoured({ modifier: 2 }).damageToBodyPart).toBeCloseTo(200);
    });

    it('applies firing power once, as 0.9 + 0.2 * fp', () => {
        // The bug this guards: a fitted curve that scaled armoured shots twice.
        const shot = calculateShotDamage(ammo(), null, null, 1, 1, 0);

        expect(shot.damageToBodyPart).toBeCloseTo(110);
    });

    it('never penetrates armour that is not there, and never damages it', () => {
        const shot = unarmoured();

        expect(shot.damageToArmor).toBe(0);
        expect(shot.damageToBodyPart).toBeGreaterThan(0);
    });
});

describe('range falloff', () => {
    it('reads the curve in centimetres', () => {
        // 100 m is 10 000 curve units, a fifth of the way down a line from 100 to 50.
        expect(unarmoured({ range: 100 }).damageToBodyPart).toBeCloseTo(90);
        expect(unarmoured({ range: 500 }).damageToBodyPart).toBeCloseTo(50);
    });

    it('falls off further out', () => {
        const near = unarmoured({ range: 100 }).damageToBodyPart;
        const far = unarmoured({ range: 500 }).damageToBodyPart;

        expect(far).toBeLessThan(near);
        expect(near).toBeLessThan(unarmoured({ range: 0 }).damageToBodyPart);
    });

    it('holds at the end of the curve rather than running on down', () => {
        expect(unarmoured({ range: 5_000 }).damageToBodyPart).toBeCloseTo(50);
        expect(unarmoured({ range: 100_000 }).damageToBodyPart).toBeCloseTo(50);
    });

    it('never returns a negative figure', () => {
        for (const range of [0, 50, 250, 1_000, 10_000]) {
            expect(unarmoured({ range }).damageToBodyPart).toBeGreaterThanOrEqual(0);
        }
    });

    it('still scales the curve figure by the body-part modifier', () => {
        expect(unarmoured({ range: 500, modifier: 2 }).damageToBodyPart).toBeCloseTo(100);
    });
});

describe('an armoured hit', () => {
    const shoot = (override: boolean, plate = armor()) =>
        calculateShotDamage(ammo(), plate, plate.maxDurability, NEUTRAL_FIRING_POWER, 1, 0, override);

    it('reports the roll it was told to take', () => {
        expect(shoot(true).isPenetrating).toBe(true);
        expect(shoot(false).isPenetrating).toBe(false);
    });

    it('lets less through when the plate holds than when it does not', () => {
        expect(shoot(false).damageToBodyPart).toBeLessThan(shoot(true).damageToBodyPart);
    });

    it('costs the plate durability either way', () => {
        expect(shoot(true).damageToArmor).toBeGreaterThan(0);
        expect(shoot(false).damageToArmor).toBeGreaterThan(0);
    });

    it('keeps a stopped round under what the same round does to bare flesh', () => {
        expect(shoot(false).damageToBodyPart).toBeLessThan(unarmoured().damageToBodyPart);
    });

    it('rewards beating the armour class, rather than truncating at parity', () => {
        // The scalar is read on `armourClass - penetration` clamped at -2. Clamping at 0 used to
        // throw away the whole region where good ammo outclasses good armour.
        const outclassed = calculateShotDamage(
            ammo({ penetration: 60 }), armor(), 100, NEUTRAL_FIRING_POWER, 1, 0, true,
        );
        const parity = calculateShotDamage(
            ammo({ penetration: 4 }), armor(), 100, NEUTRAL_FIRING_POWER, 1, 0, true,
        );

        expect(outclassed.damageToBodyPart).toBeGreaterThan(parity.damageToBodyPart);
    });
});

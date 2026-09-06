/**
 * The two argument blocks `calculateShotDamage` takes, built from an item and a resolved zone.
 *
 * Separate from both the engine and the spray estimate because both need them and neither should
 * own them. Nothing here decides anything — it is the plumbing between the catalogue's item shapes
 * and the shot model's own.
 */

import type { AmmoProperties, Ammunition, ArmorProperties } from '@/types/items';
import type { ZoneArmour } from './target-model';

/**
 * The blunt scale a round actually carries.
 *
 * Nine published rounds ship `bluntDamageScale: 0`, and that zero is the extraction's rather than
 * the game's: a bullet profile whose blunt scale equals the class default omits the float
 * entirely, and `parse_ammo.py` writes a zero for a value it knows it does not have. The
 * substitute is the parent CDO's, the same way `Weight` is filled in when nothing authors it.
 *
 * **0.2 is measured, not inferred.** 5.45x39mm PP into an ApexMC chest, AKS74UN at 99%, thirteen
 * shots from full to dead: at 0.2 the shot model reproduces all thirteen HP readings, all thirteen
 * durability readings and all thirteen armour-class readings; at 0 — and at the undocumented 0.1
 * this used to guess — it reproduces none of the HP. The game's own ammunition panel agrees, since
 * it prints `damage x scale`: PP reads 11 against a damage of 55.
 *
 * **0.03 is not measured.** The two 12GA shells sit an order of magnitude below the rifle ladder
 * and take a separate base; 0.03 is where their own neighbours put them, and T23's shotgun cell in
 * the extraction repo's `docs/IN_GAME_TESTS.md` is what would settle it.
 *
 * The real fix belongs upstream in `parse_ammo.py`, which should read the parent CDO. Until it
 * does, this is the single place the substitution happens — so the picker and the shot model
 * cannot disagree about it, which they did: the picker printed "0% if stopped" over a sim that was
 * quietly using 0.1.
 */
export const DEFAULT_BLUNT_DAMAGE_SCALE = 0.2;
export const DEFAULT_SHOTGUN_BLUNT_DAMAGE_SCALE = 0.03;

export function bluntDamageScale(ammo: Ammunition): number {
    if (ammo.stats.bluntDamageScale) return ammo.stats.bluntDamageScale;
    return ammo.stats.caliber === '12GA'
        ? DEFAULT_SHOTGUN_BLUNT_DAMAGE_SCALE
        : DEFAULT_BLUNT_DAMAGE_SCALE;
}

/**
 * Defaults are the game's, not a guess: an ammunition row that omits one of these omits it because
 * the value is the class default, and the shot model needs a number either way.
 */
export function ammoProperties(ammo: Ammunition): AmmoProperties {
    return {
        damage: ammo.stats.damage,
        penetration: ammo.stats.penetration,
        caliber: ammo.stats.caliber,
        pellets: ammo.stats.pellets,
        muzzleVelocity: ammo.stats.muzzleVelocity,
        bleedingChance: ammo.stats.bleedingChance || 0,
        bluntDamageScale: bluntDamageScale(ammo),
        protectionGearPenetratedDamageScale: ammo.stats.protectionGearPenetratedDamageScale || 0.5,
        protectionGearBluntDamageScale: ammo.stats.protectionGearBluntDamageScale || 0.9,
        damageAtRange: ammo.stats.damageAtRange,
        penetrationAtRange: ammo.stats.penetrationAtRange,
        ballisticCurves: ammo.stats.ballisticCurves,
    };
}

/**
 * The armour as the shot model reads it, at a given condition.
 *
 * `armorClass` and `bluntDamageScalar` come off the *matched zone*, resolved upstream in
 * `target-model.ts` — never the item's headline, which on four shipped items disagrees with every
 * zone it claims to describe.
 */
export function armorProperties(armour: ZoneArmour | null): ArmorProperties | null {
    if (!armour) return null;
    const stats = armour.item.stats;
    return {
        armorClass: armour.armorClass,
        bluntDamageScalar: armour.blunt,
        maxDurability: stats.maxDurability,
        currentDurability: armour.condition * stats.maxDurability,
        durabilityDamageScalar: stats.durabilityDamageScalar,
        protectiveData: stats.protectiveData,
        penetrationChanceCurve: stats.penetrationChanceCurve,
        penetrationDamageScalarCurve: stats.penetrationDamageScalarCurve,
        antiPenetrationDurabilityScalarCurve: stats.antiPenetrationDurabilityScalarCurve,
    };
}

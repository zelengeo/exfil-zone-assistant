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
        bluntDamageScale: ammo.stats.bluntDamageScale || 0.1,
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

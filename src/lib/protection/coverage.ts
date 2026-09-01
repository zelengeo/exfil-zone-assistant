import type { Armor, ProtectiveZone } from '@/types/items';
import {
    capsulePoints,
    isProtected,
    resolveBone,
    type Basis,
    type BodyModel,
    type Bone,
    type Capsule,
    type ProtectionZone,
} from './bodyModel';

/**
 * What a piece of armour actually covers, measured rather than asserted.
 *
 * This is the one place `Is Protected` is run. The viewers draw its result and the card's pip strip
 * summarises it; neither re-derives coverage, and neither knows anything about items or prices.
 *
 * Route-neutral on purpose: the items route passes one vest, and the combat simulator can pass the
 * same thing for a defender's loadout without this module learning about either.
 */

/** How thoroughly a capsule's surface is sampled. 400 points settles the fraction to about ±2%. */
const SAMPLES = 400;

export interface ZoneCoverage {
    /** The collision body this describes. */
    capsule: Capsule;
    /** Body part the bone drains, e.g. `UpperChest`. */
    part: string;
    /** Damage multiplier for a hit here. */
    scalar: number;
    /** HP pool the part draws on. */
    maxHealth: number;
    vital: boolean;
    /** Fraction of the capsule's surface the gear covers, 0–1. */
    fraction: number;
    /** The zone doing the covering, where anything does. */
    zone: ProtectionZone | null;
}

export interface Coverage {
    zones: ZoneCoverage[];
    model: BodyModel;
    bonesByName: Map<string, Bone>;
    /** True when the gear authors no protection at all — a chest rig, or night vision. */
    empty: boolean;
}

/** `protectiveData[]` as the geometry needs it, with the axes defaulted the way the game does. */
export function toProtectionZones(protectiveData: ProtectiveZone[] | undefined): ProtectionZone[] {
    return (protectiveData ?? []).map((zone) => ({
        bone: zone.bodyPart,
        angle: zone.protectionAngle,
        // Every published zone authors forward 1 / up 0. Defaulting rather than assuming keeps the
        // viewer honest if a later build ships something else.
        forwardAxis: zone.forwardAxis ?? 1,
        upAxis: zone.upAxis ?? 0,
        armorClass: zone.armorClass,
        blunt: zone.bluntDamageScalar,
    }));
}

function boneMap(model: BodyModel): Map<string, Bone> {
    const map = new Map<string, Bone>();
    for (const bone of model.bones) map.set(bone.name.toLowerCase(), bone);
    return map;
}

/**
 * The fraction of one capsule that `zones` covers.
 *
 * Measured by sampling the capsule's surface and running the game's own test at each point, rather
 * than by trusting the angle: a 90° wedge on the chest and a 25° wedge on a thigh are the same
 * field in the data and very different pictures.
 */
function coverCapsule(
    capsule: Capsule,
    zones: ProtectionZone[],
    bones: Map<string, Bone>,
): { fraction: number; zone: ProtectionZone | null } {
    const key = capsule.bone.toLowerCase();
    const candidates = zones.filter((zone) => zone.bone.toLowerCase() === key);
    if (!candidates.length) return { fraction: 0, zone: null };

    const bone = bones.get(key);
    if (!bone) return { fraction: 0, zone: null };

    const points = capsulePoints(capsule, SAMPLES);
    let covered = 0;
    let winner: ProtectionZone | null = null;

    for (const point of points) {
        // First matching zone wins, exactly as `GetProtectiveData` walks the list.
        for (const zone of candidates) {
            if (isProtected(zone, point, bone.origin, bone.basis as Basis)) {
                covered += 1;
                if (!winner) winner = zone;
                break;
            }
        }
    }

    return { fraction: covered / points.length, zone: winner };
}

/** Run the coverage test for one piece of body armour against the shipped body model. */
export function bodyCoverage(model: BodyModel, armor: Armor | null): Coverage {
    const bonesByName = boneMap(model);
    const zones = toProtectionZones(armor?.stats.protectiveData);

    return {
        model,
        bonesByName,
        empty: zones.length === 0,
        zones: model.capsules.map((capsule): ZoneCoverage => {
            const resolved = resolveBone(capsule.bone);
            const { fraction, zone } = coverCapsule(capsule, zones, bonesByName);
            return {
                capsule,
                part: resolved.part,
                scalar: resolved.scalar,
                maxHealth: resolved.maxHealth,
                vital: resolved.vital,
                fraction,
                zone,
            };
        }),
    };
}

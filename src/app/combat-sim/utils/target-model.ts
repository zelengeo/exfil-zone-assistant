/**
 * What the shot is aimed at: the game's own collision bodies, and what covers each of them.
 *
 * This replaces `body-zones.ts`, which authored its own abstract zones — `head_eyes`, `stomach`,
 * a `displayPosition` in percentages — before `src/lib/protection/` existed. Those zones were an
 * approximation of the rig; these thirteen capsules *are* the rig, and the coverage figures are
 * measured by running the game's `Is Protected` over each capsule's surface rather than asserted.
 *
 * Two consequences worth stating, because they change published numbers:
 *
 *  - **One damage multiplier per bone, from `DETAIL_SCALAR`.** The old table carried a
 *    `damageModifier` *and* a `destroyedDamageModifier`, and neither agreed with the extraction —
 *    it rated a thigh 1.0 where `BodyPartDamageScalar` says 0.7, and a calf 1.0 where it says 0.5.
 *    The decompiled model has exactly one scalar, keyed on the bone hit, with no destroyed-limb
 *    variant, so that is what is used here.
 *  - **The shot's direction is real geometry now.** The old code asked `isZoneCoveredAtAngle`,
 *    which compared the zone's wedge against an azimuth and ignored where the bone actually is.
 *    Here the capsule is sampled, the half of it facing the shooter is kept, and `Is Protected` is
 *    run on those points — so `covered` answers "how much of what I can see is plated". The wedge
 *    is two-sided, so front and rear agree and only the flank differs; that is the model, not an
 *    approximation of it.
 *
 * The head is the one bone that is not one reading: see `headReadings` below.
 */

import type { Armor, BodyArmor, FaceShield, Helmet } from '@/types/items';
import {
    capsuleNormal,
    capsulePoints,
    dot,
    isProtected,
    resolveBone,
    TOTAL_HP,
    type Basis,
    type BodyModel,
    type Capsule,
    type ProtectionZone,
    type Vec3,
} from '@/lib/protection/bodyModel';
import { bodyCoverage, toProtectionZones, type Coverage } from '@/lib/protection/coverage';
import { headCoverage, type HeadCoverage } from '@/lib/protection/headCoverage';
import type { HeadZoneName } from '@/lib/protection/headModel';

/** The capsule index of the head, which every head reading shares. */
export const HEAD_CAPSULE = 8;

/**
 * Display groups: the seven marks a pip strip has room for, and the columns the compare grid uses.
 *
 * Mirrored limbs collapse — a left thigh and a right thigh are the same armour and the same HP
 * pool size, and drawing both doubles the reading for no information. The torso collapses the way
 * the game's own body parts do: `spine_02`/`spine_03` drain UpperChest, `spine_01`/`pelvis` drain
 * LowerChest.
 */
export const ZONE_GROUPS = ['head', 'chest', 'pelvis', 'upperArm', 'forearm', 'thigh', 'calf'] as const;
export type ZoneGroup = typeof ZONE_GROUPS[number];

export const ZONE_GROUP_LABELS: Record<ZoneGroup, string> = {
    head: 'Head',
    chest: 'Chest',
    pelvis: 'Pelvis',
    upperArm: 'Upper arm',
    forearm: 'Forearm',
    thigh: 'Thigh',
    calf: 'Calf',
};

/** The same groups named as a set, for a verdict that covers more than one capsule. */
export const ZONE_GROUP_PLURALS: Record<ZoneGroup, string> = {
    head: 'the head',
    chest: 'the chest',
    pelvis: 'the pelvis',
    upperArm: 'upper arms',
    forearm: 'forearms',
    thigh: 'thighs',
    calf: 'calves',
};

/**
 * Limbs come in two damage tiers, and both tiers cross the arm/leg divide.
 *
 * `DETAIL_SCALAR` rates an upper arm and a thigh at 0.7, and a forearm and a calf at 0.5 — so on a
 * bare target the upper arms and thighs return the same shots-to-kill, as do the forearms and
 * calves. Naming one of the four is arbitrary, which is why the verdict says "upper limbs" when all
 * four tie rather than picking "left upper arm" out of a hat.
 *
 * A tier is only ever *offered* as a name. Whether it is used is decided against the outcome, since
 * a vest reaching a shoulder and not a thigh breaks the tie and makes the shared name a lie.
 */
export const LIMB_TIERS: ReadonlyArray<{ label: string; groups: readonly ZoneGroup[] }> = [
    { label: 'upper limbs', groups: ['upperArm', 'thigh'] },
    { label: 'lower limbs', groups: ['forearm', 'calf'] },
];

const GROUP_OF_BONE: Record<string, ZoneGroup> = {
    head: 'head',
    spine_03: 'chest', spine_02: 'chest',
    spine_01: 'pelvis', pelvis: 'pelvis',
    upperarm_l: 'upperArm', upperarm_r: 'upperArm',
    lowerarm_l: 'forearm', lowerarm_r: 'forearm',
    thigh_l: 'thigh', thigh_r: 'thigh',
    calf_l: 'calf', calf_r: 'calf',
};

const LABEL_OF_BONE: Record<string, string> = {
    head: 'Head',
    spine_03: 'Upper chest', spine_02: 'Mid chest',
    spine_01: 'Lower chest', pelvis: 'Pelvis',
    upperarm_l: 'Left upper arm', upperarm_r: 'Right upper arm',
    lowerarm_l: 'Left forearm', lowerarm_r: 'Right forearm',
    thigh_l: 'Left thigh', thigh_r: 'Right thigh',
    calf_l: 'Left calf', calf_r: 'Right calf',
};

/** What is stopping the round here, resolved to the numbers `ProcessDamageReceived` reads. */
export interface ZoneArmour {
    source: 'vest' | 'helmet' | 'mask';
    /** The item itself — the penetration and durability curves come off it. */
    item: Armor;
    name: string;
    /**
     * The matched zone's own class, never the item's headline. On four shipped items the two
     * disagree; `coverage.ts` and `headCoverage.ts` both already resolve this.
     */
    armorClass: number;
    blunt: number;
    /** Durability remaining, 0–1 of the item's maximum. */
    condition: number;
}

/** One thing a round can hit, and everything the engine needs to resolve a hit on it. */
export interface TargetZone {
    /** Stable across a defender change, so a selection survives one. */
    id: string;
    /** Capsule index — the key `BodyViewer`'s `overlay` is addressed by. */
    capsule: number;
    bone: string;
    label: string;
    group: ZoneGroup;
    /** The HP pool the damage comes off, e.g. `UpperChest`. */
    part: string;
    /** `BodyPartDamageScalar` for the bone hit. */
    scalar: number;
    maxHealth: number;
    /** At zero HP this one kills; everything else is a crippled limb. */
    vital: boolean;
    /** Share of this capsule's surface the gear reaches, 0–1. Measured, not asserted. */
    covered: number;
    armour: ZoneArmour | null;
    /**
     * Head readings only: the head zones that share this reading, so a table can name them. A
     * capsule zone leaves it undefined.
     */
    headZones?: HeadZoneName[];
    /** Head readings only: share of the whole head this reading applies to, 0–1. */
    headShare?: number;
    /** Head readings only: one word for the verdict bar, where three of them share a line. */
    short?: 'face' | 'shell' | 'open';
}

export interface TargetModel {
    /** Every capsule except the head, plus the head's readings, in draw order. */
    zones: TargetZone[];
    /** The head's readings alone — one, two or three of them. */
    head: TargetZone[];
    /** Everything else — what "aimed" is chosen from. */
    body: TargetZone[];
    coverage: Coverage;
    headCoverage: HeadCoverage | null;
    /** Sum of every part's HP. Death is a vital part at zero, never this reaching zero. */
    totalHealth: number;
}

export interface Defender {
    vest: BodyArmor | null;
    /** 0–1 of maximum durability. */
    vestCondition: number;
    helmet: Helmet | null;
    helmetCondition: number;
    faceShield: FaceShield | null;
}

export const EMPTY_DEFENDER: Defender = {
    vest: null,
    vestCondition: 1,
    helmet: null,
    helmetCondition: 1,
    faceShield: null,
};

/**
 * Where the shot comes from, as the reader chooses it.
 *
 * Three, not a slider, because there are only three answers: the wedge test takes the absolute
 * value of the dot product, so a plate covering the chest covers the back by the same angle. Front
 * and rear differ in nothing the simulator computes; the flank is the whole question.
 */
export const FACINGS = [
    { id: 'front', label: 'Front', azimuth: 0 },
    { id: 'flank', label: 'Flank', azimuth: 90 },
    { id: 'rear', label: 'Rear', azimuth: 180 },
] as const;

export type Facing = typeof FACINGS[number]['id'];

const RAD = Math.PI / 180;

/** How thoroughly a capsule's visible half is sampled. The shared viewer uses the same 400. */
const SAMPLES = 400;

/**
 * The share of the capsule a shooter at this azimuth can see that the vest also covers.
 *
 * Sampling and then discarding the far half is the point: a plate carrier's chest zone covers a
 * torso capsule's front and back and none of its flanks, so a figure taken over the whole surface
 * says "half covered" from every direction and answers nobody's question.
 */
function facingCoverage(
    capsule: Capsule,
    zones: ProtectionZone[],
    model: BodyModel,
    azimuth: number,
): { covered: number; zone: ProtectionZone | null } {
    const key = capsule.bone.toLowerCase();
    const candidates = zones.filter((zone) => zone.bone.toLowerCase() === key);
    const bone = model.bones.find((entry) => entry.name.toLowerCase() === key);
    if (!candidates.length || !bone) return { covered: 0, zone: null };

    // Display space is (forward, right, up): +X out of the chest, +Y to the character's right.
    const toShooter: Vec3 = [Math.cos(azimuth * RAD), Math.sin(azimuth * RAD), 0];

    let visible = 0;
    let covered = 0;
    let winner: ProtectionZone | null = null;

    for (const point of capsulePoints(capsule, SAMPLES)) {
        if (dot(capsuleNormal(capsule, point), toShooter) <= 0) continue;
        visible += 1;
        for (const zone of candidates) {
            // First matching zone wins, exactly as `GetProtectiveData` walks the list.
            if (isProtected(zone, point, bone.origin, bone.basis as Basis)) {
                covered += 1;
                if (!winner) winner = zone;
                break;
            }
        }
    }

    return { covered: visible ? covered / visible : 0, zone: winner };
}

/**
 * The head's distinct readings, which is never six and rarely one.
 *
 * A helmet has one armour class for its whole shell and its cone regions are the *holes* in it; a
 * face shield is the inverse, its regions *are* its shell and its reverse regions are holes cut in
 * that; and the two never stack, so every protected point on a head belongs to exactly one of them
 * (`docs/HEAD_PROTECTION.md` §14.2–14.3, run by `headCoverage`). That gives at most three distinct
 * shots-to-kill values — shield, shell, and whatever neither reaches — however many zones the
 * model names.
 *
 * Each of the six named zones is filed under whichever reading covers most of it, so the table can
 * say *where* a reading applies without pretending a zone is uniform.
 */
function headReadings(head: HeadCoverage | null, defender: Defender): TargetZone[] {
    const bone = resolveBone('head');
    const base = {
        capsule: HEAD_CAPSULE,
        bone: 'head',
        group: 'head' as ZoneGroup,
        part: bone.part,
        scalar: bone.scalar,
        maxHealth: bone.maxHealth,
        vital: bone.vital,
    };

    if (!head || head.empty) {
        return [{
            ...base,
            id: 'head:open',
            label: 'Head — open',
            short: 'open',
            covered: 0,
            armour: null,
            headZones: undefined,
            headShare: 1,
        }];
    }

    // Which reading owns each named zone. A zone with no samples is not on this head at all.
    const owners: Record<'open' | 'helmet' | 'mask', HeadZoneName[]> = { open: [], helmet: [], mask: [] };
    for (const zone of head.zones) {
        if (!zone.samples) continue;
        const bare = zone.samples - zone.byHelmet - zone.byMask;
        const winner = zone.byMask > zone.byHelmet && zone.byMask > bare
            ? 'mask'
            : zone.byHelmet > bare ? 'helmet' : 'open';
        owners[winner].push(zone.zone);
    }

    const readings: TargetZone[] = [];

    const shieldShare = head.byMask;
    if (shieldShare > 0.001 && defender.faceShield) {
        readings.push({
            ...base,
            id: 'head:mask',
            label: `Face — ${defender.faceShield.name}`,
            short: 'face',
            covered: 1,
            headZones: owners.mask,
            headShare: shieldShare,
            armour: {
                source: 'mask',
                item: defender.faceShield,
                name: defender.faceShield.name,
                armorClass: head.gear.mask?.armorClass ?? defender.faceShield.stats.armorClass,
                blunt: head.gear.mask?.bluntDamageScalar ?? defender.faceShield.stats.bluntDamageScalar,
                // A shield shares the helmet's condition: the pair is worn as one and the sim has
                // never carried a second durability track for it.
                condition: defender.helmetCondition,
            },
        });
    }

    if (head.byHelmet > 0.001 && defender.helmet) {
        readings.push({
            ...base,
            id: 'head:helmet',
            label: `Shell — ${defender.helmet.name}`,
            short: 'shell',
            covered: 1,
            headZones: owners.helmet,
            headShare: head.byHelmet,
            armour: {
                source: 'helmet',
                item: defender.helmet,
                name: defender.helmet.name,
                armorClass: head.gear.helmet?.armorClass ?? defender.helmet.stats.armorClass,
                blunt: head.gear.helmet?.bluntDamageScalar ?? defender.helmet.stats.bluntDamageScalar,
                condition: defender.helmetCondition,
            },
        });
    }

    const open = 1 - head.total;
    if (open > 0.001 || readings.length === 0) {
        readings.push({
            ...base,
            id: 'head:open',
            label: 'Head — open',
            short: 'open',
            covered: 0,
            armour: null,
            headZones: owners.open,
            headShare: Math.max(open, 0),
        });
    }

    return readings;
}

/**
 * Build the target from the shipped body model, what the defender is wearing, and where the shot
 * comes from.
 */
export function buildTargetModel(
    model: BodyModel,
    defender: Defender,
    facing: Facing = 'front',
): TargetModel {
    const coverage = bodyCoverage(model, defender.vest);
    const head = headCoverage(model, defender.helmet, defender.faceShield ?? null);
    const vestZones = toProtectionZones(defender.vest?.stats.protectiveData);
    const azimuth = FACINGS.find((entry) => entry.id === facing)?.azimuth ?? 0;

    const body: TargetZone[] = coverage.zones
        .filter((zone) => zone.capsule.bone.toLowerCase() !== 'head')
        .map((zone): TargetZone => {
            const bone = zone.capsule.bone.toLowerCase();
            const seen = facingCoverage(zone.capsule, vestZones, model, azimuth);
            const armed = seen.zone && defender.vest && seen.covered > 0.001;
            return {
                id: `capsule:${zone.capsule.index}`,
                capsule: zone.capsule.index,
                bone,
                label: LABEL_OF_BONE[bone] ?? bone,
                group: GROUP_OF_BONE[bone] ?? 'chest',
                part: zone.part,
                scalar: zone.scalar,
                maxHealth: zone.maxHealth,
                vital: zone.vital,
                covered: seen.covered,
                armour: armed && seen.zone && defender.vest
                    ? {
                        source: 'vest',
                        item: defender.vest,
                        name: defender.vest.name,
                        armorClass: seen.zone.armorClass,
                        blunt: seen.zone.blunt,
                        condition: defender.vestCondition,
                    }
                    : null,
            };
        });

    const headZones = headReadings(head, defender);

    return {
        zones: [...headZones, ...body],
        head: headZones,
        body,
        coverage,
        headCoverage: head,
        totalHealth: TOTAL_HP,
    };
}

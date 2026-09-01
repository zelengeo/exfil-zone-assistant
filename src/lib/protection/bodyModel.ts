/**
 * The game's body model — the single copy of it.
 *
 * Ported verbatim from `exfil-zone-assistant-extraction/tools/bodyViz/bodyModel.js`. The
 * conversion is types only: no restructuring, and the provenance below is the reason anyone should
 * believe the picture drawn from it.
 *
 * Three separate decompiles meet in this file and nothing here is interpretation:
 *
 *  - the bone → body-part mapping, the damage multipliers and the HP pools, from
 *    `docs/DAMAGE_MODEL.md` §8 (native `GetBodyPartDetail` / `GetBodyPart` plus the player CDO's
 *    two `TMap`s);
 *  - the collision capsules and the reference pose, from `csv/body_collision.csv` and
 *    `csv/body_skeleton.csv`, shipped to the app as `public/data/body-model.json`;
 *  - `isProtected`, which is `ProtectiveGearBlueprintFunctionLibrary.Is Protected` decompiled with
 *    `tools/pakExtract/kismet.py` — the test a vest runs before it protects anything.
 *
 * `PART_HP` here is the same 35 / 85 / 70 / 60 / 60 / 65 / 65 that `combat-sim/utils/body-zones.ts`
 * arrived at by hand: they are one model, extracted in one place and inferred in the other.
 */

export type Vec3 = [number, number, number];

/** The bone's own {forward, right, up}, which `Is Protected` indexes into by number. */
export type Basis = [Vec3, Vec3, Vec3];

export const DEG = 180 / Math.PI;

export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];

export function norm(a: Vec3): Vec3 {
    const l = Math.hypot(a[0], a[1], a[2]);
    return l === 0 ? [0, 0, 0] : [a[0] / l, a[1] / l, a[2] / l];
}

/* ============================================================
   docs/DAMAGE_MODEL.md §8 — the model, keyed on bone name
   ============================================================ */

/** `GetBodyPartDetail`, 0x14435c3d0. Decides the damage multiplier. FName compares ignore case. */
export const BODY_PART_DETAIL: Record<string, string> = {
    head: 'Head',
    spine_02: 'UpperChest', spine_03: 'UpperChest',
    spine_01: 'LowerChest', pelvis: 'LowerChest',
    upperarm_l: 'LeftUpperArm', upperarm_r: 'RightUpperArm',
    lowerarm_l: 'LeftLowerArm', lowerarm_r: 'RightLowerArm',
    hand_l: 'LeftHand', hand_r: 'RightHand',
    thigh_l: 'LeftUpperLeg', thigh_r: 'RightUpperLeg',
    calf_l: 'LeftLowerLeg', calf_r: 'RightLowerLeg',
    foot_l: 'LeftFoot', foot_r: 'RightFoot',
};

/** `GetBodyPart`, 0x14435c220. Decides which HP pool the damage comes off. */
export const BODY_PART: Record<string, string> = {
    head: 'Head',
    spine_02: 'UpperChest', spine_03: 'UpperChest',
    spine_01: 'LowerChest', pelvis: 'LowerChest',
    upperarm_l: 'LeftArm', lowerarm_l: 'LeftArm', hand_l: 'LeftArm',
    upperarm_r: 'RightArm', lowerarm_r: 'RightArm', hand_r: 'RightArm',
    thigh_l: 'LeftLeg', calf_l: 'LeftLeg', foot_l: 'LeftLeg',
    thigh_r: 'RightLeg', calf_r: 'RightLeg', foot_r: 'RightLeg',
};

/**
 * `BodyPartDamageScalar` on the player CDO — twelve entries.
 *
 * `LeftHand`, `RightHand`, `LeftFoot` and `RightFoot` are deliberately absent: they miss the
 * lookup and keep the 1.0 default, so a hand would take *more* damage than the forearm above it.
 * "Would": the physics asset authors no collision body for those four bones, so no bullet ever
 * reports one.
 */
export const DETAIL_SCALAR: Record<string, number> = {
    None: 1, Head: 1, UpperChest: 1, LowerChest: 0.8,
    LeftUpperArm: 0.7, RightUpperArm: 0.7,
    LeftLowerArm: 0.5, RightLowerArm: 0.5,
    LeftUpperLeg: 0.7, RightUpperLeg: 0.7,
    LeftLowerLeg: 0.5, RightLowerLeg: 0.5,
};

const DETAIL_ABSENT_FROM_MAP = new Set(['LeftHand', 'RightHand', 'LeftFoot', 'RightFoot']);

/** `BodyPartMaxHealth`, verified byte-identical to `BodyPartHealth` in the shipped CDO. Total 440. */
export const PART_HP: Record<string, number> = {
    Head: 35, UpperChest: 85, LowerChest: 70,
    LeftArm: 60, RightArm: 60, LeftLeg: 65, RightLeg: 65,
};

export const PART_ORDER = [
    'Head', 'UpperChest', 'LowerChest', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg',
] as const;

export type PartName = typeof PART_ORDER[number];

/** `ShouldDie()` — only these two at zero are fatal. Everything else is a crippled limb. */
export const VITAL_PARTS: ReadonlySet<string> = new Set(['Head', 'UpperChest']);

export const TOTAL_HP = PART_ORDER.reduce((sum, part) => sum + PART_HP[part], 0);

export interface ResolvedBone {
    detail: string;
    part: string;
    scalar: number;
    scalarIsDefault: boolean;
    maxHealth: number;
    vital: boolean;
}

/** What a bone name resolves to. Any casing; the game's FName compare ignores it. */
export function resolveBone(bone: string): ResolvedBone {
    const key = String(bone || '').toLowerCase();
    const detail = BODY_PART_DETAIL[key] || 'None';
    const part = BODY_PART[key] || 'None';
    return {
        detail,
        part,
        scalar: DETAIL_SCALAR[detail] !== undefined ? DETAIL_SCALAR[detail] : 1,
        scalarIsDefault: DETAIL_ABSENT_FROM_MAP.has(detail) || detail === 'None',
        maxHealth: PART_HP[part] || 0,
        vital: VITAL_PARTS.has(part),
    };
}

/* ============================================================
   Capsules
   ============================================================ */

/** One collision body: the shape a bullet actually reports a hit against. */
export interface Capsule {
    index: number;
    bone: string;
    boneIndex: number;
    centre: Vec3;
    axis: Vec3;
    radius: number;
    half: number;
}

export interface Bone {
    index: number;
    name: string;
    parentIndex: number;
    origin: Vec3;
    basis: Basis;
    hasCollision: boolean;
}

/** `public/data/body-model.json`, as shipped. */
export interface BodyModel {
    bones: Bone[];
    capsules: Capsule[];
}

/** The two endpoints of a capsule's inner segment (caps excluded). */
export function segment(cap: Capsule): [Vec3, Vec3] {
    const h = cap.half;
    return [sub(cap.centre, mul(cap.axis, h)), add(cap.centre, mul(cap.axis, h))];
}

/** Outward unit normal at a point on (or near) a capsule. */
export function capsuleNormal(cap: Capsule, p: Vec3): Vec3 {
    const [A, B] = segment(cap);
    const ab = sub(B, A);
    const abab = dot(ab, ab);
    let k = abab > 1e-12 ? dot(ab, sub(p, A)) / abab : 0;
    k = Math.max(0, Math.min(1, k));
    return norm(sub(p, add(A, mul(ab, k))));
}

/** Radius of a sphere about the capsule centre that contains it — for culling and framing. */
export const capsuleExtent = (cap: Capsule): number => cap.half + cap.radius;

/**
 * Area-weighted sample points on a capsule's surface: cylinder wall plus both caps.
 *
 * The viewer shades a capsule by how much of it a vest covers, and that fraction is measured by
 * running `isProtected` over these points — so they have to be spread by area, not by parameter,
 * or a fat short capsule would report its caps as most of its surface.
 */
export function capsulePoints(cap: Capsule, count: number): Vec3[] {
    const a = norm(cap.axis);
    const seed: Vec3 = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const u = norm(cross(a, seed));
    const v = cross(a, u);
    const wall = 2 * Math.PI * cap.radius * 2 * cap.half;
    const caps = 4 * Math.PI * cap.radius * cap.radius;
    const nWall = Math.round((count * wall) / (wall + caps || 1));
    const out: Vec3[] = [];

    for (let i = 0; i < nWall; i++) {
        const th = 2 * Math.PI * ((i * 0.6180339887498949) % 1);
        const s = ((i + 0.5) / nWall) * 2 - 1;
        const radial = add(mul(u, Math.cos(th)), mul(v, Math.sin(th)));
        out.push(add(add(cap.centre, mul(a, s * cap.half)), mul(radial, cap.radius)));
    }
    for (let i = 0; i < count - nWall; i++) {
        // Fibonacci sphere, then pushed out to whichever cap its axial sign belongs to.
        const k = i + 0.5;
        const z = 1 - (2 * k) / (count - nWall || 1);
        const r = Math.sqrt(Math.max(0, 1 - z * z));
        const th = Math.PI * (1 + Math.sqrt(5)) * k;
        const d = add(add(mul(u, r * Math.cos(th)), mul(v, r * Math.sin(th))), mul(a, z));
        out.push(add(add(cap.centre, mul(a, Math.sign(z) * cap.half)), mul(d, cap.radius)));
    }
    return out;
}

/* ============================================================
   Vest coverage — `ProtectiveGearBlueprintFunctionLibrary.Is Protected`
   ============================================================ */

/**
 * The axis selector both `ForwardVector` and `UpVector` carry on an `FProtectiveData`: an index
 * into the *hit bone's* own basis, not a vector. Every zone in the shipped build authors
 * ForwardVector = 1 and UpVector = 0.
 */
export const AXIS_NAMES = ['forward', 'right', 'up'] as const;

/** One protection point, as `isProtected` needs it. */
export interface ProtectionZone {
    bone: string;
    angle: number;
    forwardAxis: number;
    upAxis: number;
    armorClass: number;
    blunt: number;
}

/**
 * `Is Protected(BoneLocation, BoneRotation, HitLocation, GearProtectionData)`:
 *
 *     Fwd = <bone basis>[data.ForwardVector]
 *     Up  = <bone basis>[data.UpVector]
 *     d   = Normal(ProjectVectorOnToPlane(HitLocation - BoneLocation, Up))
 *     return DegAcos(Abs(Dot(d, Fwd))) < data.ProtectionAngle
 *
 * Three things fall out of it. The `Abs` makes the wedge **two-sided** — a plate that covers the
 * chest covers the back by the same angle. The projection is onto the plane perpendicular to the
 * bone's own forward axis, which for every torso bone is the body's long axis, so the test is a
 * pure azimuth around the torso. And `ProtectionAngle = 90` can never fail, which is why 126 of
 * the 143 published zones are simply "this whole bone".
 *
 * `basis` is the bone's {forward, right, up}; `p` and `origin` are in the same space. Directions
 * only, so display space works equally well as long as both agree.
 */
export function isProtected(zone: ProtectionZone, p: Vec3, origin: Vec3, basis: Basis): boolean {
    const fwd = basis[zone.forwardAxis] || basis[0];
    const up = basis[zone.upAxis] || basis[0];
    const offset = sub(p, origin);
    const k = dot(offset, up);
    const flat = norm([offset[0] - up[0] * k, offset[1] - up[1] * k, offset[2] - up[2] * k]);
    if (flat[0] === 0 && flat[1] === 0 && flat[2] === 0) return false;
    const angle = Math.acos(Math.min(1, Math.abs(dot(flat, fwd)))) * DEG;
    return angle < zone.angle;
}

/**
 * The zone covering a hit at `p` on `bone`, or null.
 *
 * `VestBase.GetProtectiveData` walks `ProtectiveData` in order and takes the first entry whose
 * bone name matches AND whose `Is Protected` passes; a miss returns {AntiPenetration 0, Blunt 1}
 * and leaves the damage untouched. Published order is the game's own order and must not be
 * re-sorted.
 */
export function zoneAt(
    zones: ProtectionZone[],
    bone: string,
    p: Vec3,
    bones: Map<string, Bone>,
): ProtectionZone | null {
    const key = String(bone || '').toLowerCase();
    for (const zone of zones) {
        if (zone.bone.toLowerCase() !== key) continue;
        const b = bones.get(key);
        if (!b) continue;
        if (isProtected(zone, p, b.origin, b.basis)) return zone;
    }
    return null;
}

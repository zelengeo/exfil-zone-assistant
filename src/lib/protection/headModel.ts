/**
 * The game's head-protection hit test — the single copy of it.
 *
 * Ported from `exfil-zone-assistant-extraction/tools/coneViz/coneGeometry.js`, which is the file the
 * extraction repo's node probes and its standalone inspector both run, so the picture this draws is
 * the picture that was checked against in-game reports. The conversion is types only.
 *
 * Nothing here is interpretation. From `docs/HEAD_PROTECTION.md`:
 *
 *  - the frustum test (§3) is decompiled from `HelmetBase.HitConeRegion`;
 *  - the protection rule and its polarity (§14) from four more Blueprint functions — a **helmet's**
 *    regions are holes, a **face shield's** are armour and its reverse regions are holes cut in it;
 *  - the head (§13) is the capsule the character physics asset authors on the `head` bone, which
 *    this repo already ships inside `public/data/body-model.json`.
 *
 * The one thing the shipped data does not carry is `WarfareHelmet_Warrior`'s override of
 * `GetProtectiveData` (§14.4) — see `GEOMETRY_OVERRIDE_IDS` below.
 */

import { cross, dot, norm, sub, type Basis, type BodyModel, type Vec3 } from './bodyModel';

export const RAD = Math.PI / 180;
export const DEG = 180 / Math.PI;

/* ============================================================
   The frustum test — DECOMPILED, docs/HEAD_PROTECTION.md §3
   ============================================================ */

export interface RotatorBasis {
    F: Vec3;
    R: Vec3;
    U: Vec3;
}

/** Forward/right/up of an `FRotator`, matching `FRotator::Vector()` and its companions. */
export function rotatorBasis(pitch: number, yaw: number, roll: number): RotatorBasis {
    const p = pitch * RAD;
    const y = yaw * RAD;
    const r = roll * RAD;
    const cp = Math.cos(p);
    const sp = Math.sin(p);
    const cy = Math.cos(y);
    const sy = Math.sin(y);
    const cr = Math.cos(r);
    const sr = Math.sin(r);
    return {
        F: [cp * cy, cp * sy, sp],
        R: [sr * sp * cy - cr * sy, sr * sp * sy + cr * cy, -sr * cp],
        U: [-(cr * sp * cy + sr * sy), -(cr * sp * sy - sr * cy), cr * cp],
    };
}

/**
 * `DegAcos(Dot(F, Normal(ProjectVectorOnToPlane(dir, n))))` — always 0..180, which is why the
 * authored angles are half-angles.
 */
function deviation(dir: Vec3, F: Vec3, n: Vec3): number {
    const k = dot(dir, n);
    const px = dir[0] - n[0] * k;
    const py = dir[1] - n[1] * k;
    const pz = dir[2] - n[2] * k;
    const l = Math.hypot(px, py, pz);
    if (l === 0) return 180;
    const d = (F[0] * px + F[1] * py + F[2] * pz) / l;
    return Math.acos(Math.max(-1, Math.min(1, d))) * DEG;
}

/** One authored `FConeRegion`, re-framed into the space the game tests it in. */
export interface PreparedRegion {
    /** Index across the whole worn set, so a colour survives helmet + shield being drawn together. */
    index: number;
    /** Index within its own item, which is what the region table numbers. */
    local: number;
    /** `cone` or `reverse_cone`, as authored. */
    kind: string;
    /** Half-angles, degrees. */
    width: number;
    height: number;
    /** Apex, in head-bone display space. */
    origin: Vec3;
    /** The region's true axis — the frame's Right vector, not its Forward (§3, error 1). */
    F: Vec3;
    /** `width` is the deviation in the plane spanned by `F` and this. */
    R: Vec3;
    /** `height` is the deviation in the plane spanned by `F` and this. */
    U: Vec3;
    reverse: boolean;
}

/** Is a hit at `p` inside this frustum? Measured from the region's own apex. */
export function insideRegion(p: Vec3, region: PreparedRegion): boolean {
    const d = norm(sub(p, region.origin));
    return (
        deviation(d, region.F, region.U) < region.width
        && deviation(d, region.F, region.R) < region.height
    );
}

/** An authored region, in the shape `stats.coneRegions` ships it. */
export interface AuthoredRegion {
    region: string;
    widthAngle: number;
    heightAngle: number;
    offset: { x: number; y: number; z: number };
    rotation: { pitch: number; yaw: number; roll: number };
}

/**
 * Turn authored regions into the frame the game actually tests them in.
 *
 * `HelmetBase.HitConeRegion` does **not** use `TransformOffset` as authored. Decompiled, every
 * region is re-framed into head-bone space first:
 *
 *     translation   MakeVector(X = loc.Z, Y = loc.X, Z = loc.Y)
 *     rotation      MakeRotator(Roll = -rot.Yaw, Pitch = rot.Roll, Yaw = -rot.Pitch)
 *     frame         ComposeRotators(that, HitBoneRotation)
 *     origin        HitBoneLocation + RotateVector(translation, frame)
 *
 * and then measures both deviations from the frame's **Right** vector rather than its Forward. The
 * two readings agree whenever yaw is 0, which is why front regions always looked right under the
 * obvious reading, and they invert the elevation whenever yaw is ±180 — every rear region in the
 * game.
 *
 * Everything comes back in display space (X forward, Y wearer's right, Z up), measured from the
 * head bone: `HitBoneLocation` is the origin and `HitBoneRotation` the identity by construction,
 * because the head capsule is authored in that same bone's local space (§13.3).
 */
export function prepareRegions(regions: AuthoredRegion[], offset = 0): PreparedRegion[] {
    // bone (up, forward, right) -> display (forward, right, up)
    const toDisplay = (v: Vec3): Vec3 => [v[1], v[2], v[0]];

    return regions.map((r, i) => {
        const b = rotatorBasis(r.rotation.roll, -r.rotation.pitch, -r.rotation.yaw);
        const t: Vec3 = [r.offset.z, r.offset.x, r.offset.y];
        // RotateVector(t, frame) — the apex is turned by the region's own rotation, not merely
        // translated (§3, error 3).
        const origin = [0, 1, 2].map(
            (axis) => t[0] * b.F[axis] + t[1] * b.R[axis] + t[2] * b.U[axis],
        ) as Vec3;

        return {
            index: offset + i,
            local: i,
            kind: r.region,
            // Width and height are swapped relative to the obvious reading (§3, error 4).
            width: r.widthAngle,
            height: r.heightAngle,
            origin: toDisplay(origin),
            F: toDisplay(b.R),
            R: toDisplay(b.U),
            U: toDisplay(b.F),
            reverse: r.region === 'reverse_cone',
        };
    });
}

/* ============================================================
   The protection rule — DECOMPILED, docs/HEAD_PROTECTION.md §14
   ============================================================ */

/**
 * Helmets whose `GetProtectiveData` override makes their cone regions dead data.
 *
 * `WarfareHelmet.GetProtectiveData` is where the geometry test lives — it calls `IsFaceHit` and
 * returns `{0, 1}` inside any region. `WarfareHelmet_Warrior` overrides that with a copy of
 * `HelmetBase`'s, which tests the bone name and nothing else, so the Warrior protects the whole
 * head uniformly and the ±37×33 region it inherits is never consulted. Its wearer reports exactly
 * that: "full head protection, no weak spots" (§14.4).
 *
 * It is the only such override in the build, and the shipped item data carries no flag for it — so
 * it is keyed by item id here, mirroring `GEOMETRY_OVERRIDE_STEMS` in the extraction repo's
 * `tools/coneViz/buildConeViz.js`. If the export ever grows the flag, read it instead of this.
 */
export const GEOMETRY_OVERRIDE_IDS: ReadonlySet<string> = new Set(['helmet-warrior']);

/** One piece of head gear, prepared for the hit test. */
export interface WornGear {
    id: string;
    name: string;
    regions: PreparedRegion[];
    /** True where the item ignores its own regions — see `GEOMETRY_OVERRIDE_IDS`. */
    overridesGeometry: boolean;
    armorClass: number | null;
    bluntDamageScalar: number | null;
}

export interface WornSet {
    helmet: WornGear | null;
    mask: WornGear | null;
}

export interface ProtectionSample {
    /** Index of the first ordinary region containing the point, or -1. For colouring only. */
    hit: number;
    /** True where a reverse region contains the point. For colouring only. */
    reverse: boolean;
    /** Whether a hit here would actually be stopped. */
    protected: boolean;
    /** Which piece does the stopping. The two never stack. */
    by: 'helmet' | 'mask' | null;
}

/**
 * The shipped protection rule, from four Blueprint functions (§14.1):
 *
 *     HelmetBase.GetProtectiveData      bone name only, no geometry
 *     WarfareHelmet.GetProtectiveData   ...then {0, 1} inside any region  <- helmet regions are HOLES
 *     WF_WarfareMask.GetProtectiveData  bone name, owner casts to a helmet, ActiveMask,
 *                                       owner.IsFaceHit(...), and IsFaceHitMask(...) — all five
 *     WF_WarfareMask.IsFaceHitMask      a reverse region wins outright, then any ordinary region
 *
 * Three composition rules fall out of it, and none of them is visible in the geometry:
 *
 *   1. A shield only ever fills a helmet's holes — it calls `owner.IsFaceHit` first, so where the
 *      helmet covers, the shield contributes nothing. The two **never stack**.
 *   2. A shield worn without a helmet protects nothing: the owner cast fails.
 *   3. `ActiveMask` gates it entirely — a flipped-up shield is not armour.
 */
export function protectionAt(p: Vec3, gear: WornSet): ProtectionSample {
    const { helmet, mask } = gear;
    let hit = -1;
    let reverse = false;

    // Which region a point falls in, for the per-region colouring. Independent of protection.
    for (const set of [helmet, mask]) {
        if (!set) continue;
        for (const region of set.regions) {
            if (!insideRegion(p, region)) continue;
            if (region.reverse) reverse = true;
            else if (hit < 0) hit = region.index;
        }
    }

    const inHelmetHole = Boolean(
        helmet
        && !helmet.overridesGeometry
        && helmet.regions.some((region) => !region.reverse && insideRegion(p, region)),
    );

    if (helmet && !inHelmetHole) {
        return { hit, reverse, protected: true, by: 'helmet' };
    }
    // Rule 2 is enforced here rather than assumed away: no helmet, no protection, however much
    // plate the shield authors. The extraction repo's inspector deliberately draws the hypothetical
    // instead and says so in a caption; a stats page cannot, because the number would be read as
    // the answer.
    if (mask && helmet && inHelmetHole) {
        const cut = mask.regions.some((region) => region.reverse && insideRegion(p, region));
        if (!cut && mask.regions.some((region) => !region.reverse && insideRegion(p, region))) {
            return { hit, reverse, protected: true, by: 'mask' };
        }
    }
    return { hit, reverse, protected: false, by: null };
}

/* ============================================================
   The head — MEASURED, docs/HEAD_PROTECTION.md §13
   ============================================================ */

/** The head hitbox, in head-bone display space (X forward, Y wearer's right, Z up). */
export interface HeadCapsule {
    centre: Vec3;
    /** Capsule axis; the sign is irrelevant, it is a segment. */
    axis: Vec3;
    radius: number;
    /** Half the cylinder segment, caps excluded. */
    half: number;
}

/**
 * The head capsule, read out of the shipped body model rather than restated here.
 *
 * `body-model.json` publishes the physics asset in world space; cone regions are tested in the head
 * bone's own local space. The bone's `basis` rows are its axes expressed in world, so a world
 * offset resolves to bone-local by three dot products — and the bone turns out to be
 * **X = up, Y = forward, Z = lateral**, which is why the display permutation below is the same
 * `(Y, Z, X)` that `prepareRegions` applies to the authored offsets. Two unrelated sources, one
 * answer (§13.4).
 *
 * Comes out as centre (3.39, 0.15, 7.05), radius 7.31, axis within 9° of vertical: a head standing
 * chin-to-crown, 14.8 deep, 14.9 wide, 23.3 tall.
 */
export function headCapsuleOf(model: BodyModel): HeadCapsule | null {
    const bone = model.bones.find((b) => b.name.toLowerCase() === 'head');
    const capsule = model.capsules.find((c) => c.bone.toLowerCase() === 'head');
    if (!bone || !capsule) return null;

    const basis = bone.basis as Basis;
    const toLocal = (v: Vec3): Vec3 => [dot(v, basis[0]), dot(v, basis[1]), dot(v, basis[2])];
    // bone (up, forward, right) -> display (forward, right, up)
    const toDisplay = (v: Vec3): Vec3 => [v[1], v[2], v[0]];

    return {
        centre: toDisplay(toLocal(sub(capsule.centre, bone.origin))),
        axis: toDisplay(toLocal(capsule.axis)),
        radius: capsule.radius,
        half: capsule.half,
    };
}

/** The capsule's two segment endpoints. */
export function headSegment(head: HeadCapsule): [Vec3, Vec3] {
    const [cx, cy, cz] = head.centre;
    const a = head.axis;
    const h = head.half;
    return [
        [cx - a[0] * h, cy - a[1] * h, cz - a[2] * h],
        [cx + a[0] * h, cy + a[1] * h, cz + a[2] * h],
    ];
}

/** Radius of a sphere about the centre that contains the whole capsule — for camera framing. */
export const headExtent = (head: HeadCapsule): number => head.half + head.radius;

/** Outward unit normal at a point on (or near) the capsule. */
export function headNormal(head: HeadCapsule, p: Vec3): Vec3 {
    const [A, B] = headSegment(head);
    const ab = sub(B, A);
    const abab = dot(ab, ab);
    let k = abab > 1e-12 ? dot(ab, sub(p, A)) / abab : 0;
    k = Math.max(0, Math.min(1, k));
    return norm([p[0] - (A[0] + ab[0] * k), p[1] - (A[1] + ab[1] * k), p[2] - (A[2] + ab[2] * k)]);
}

export interface HeadHit {
    t: number;
    point: Vec3;
    normal: Vec3;
}

/**
 * Nearest ray/capsule hit in front of `origin`, or null.
 *
 * Infinite-cylinder solve first, accepted only where the hit projects onto the segment; the two
 * hemispherical caps are then tried separately. Doing it that way rather than as one distance field
 * keeps it exact, which matters because the viewer reads the surface normal straight off it.
 */
export function headRay(head: HeadCapsule, origin: Vec3, dir: Vec3): HeadHit | null {
    const [A, B] = headSegment(head);
    const ab = sub(B, A);
    const ao = sub(origin, A);
    const abab = dot(ab, ab);
    const abd = dot(ab, dir);
    const abao = dot(ab, ao);
    let best = Infinity;

    if (abab > 1e-12) {
        const a = dot(dir, dir) - (abd * abd) / abab;
        const b = 2 * (dot(dir, ao) - (abd * abao) / abab);
        const c = dot(ao, ao) - (abao * abao) / abab - head.radius * head.radius;
        const disc = b * b - 4 * a * c;
        if (Math.abs(a) > 1e-12 && disc >= 0) {
            const s = Math.sqrt(disc);
            for (const t of [(-b - s) / (2 * a), (-b + s) / (2 * a)]) {
                if (t < 0 || t >= best) continue;
                const along = (abao + t * abd) / abab;
                if (along >= 0 && along <= 1) best = t;
            }
        }
    }

    for (const cap of [A, B]) {
        const oc = sub(origin, cap);
        const a = dot(dir, dir);
        const b = 2 * dot(oc, dir);
        const c = dot(oc, oc) - head.radius * head.radius;
        const disc = b * b - 4 * a * c;
        if (disc < 0) continue;
        const s = Math.sqrt(disc);
        for (const t of [(-b - s) / (2 * a), (-b + s) / (2 * a)]) {
            if (t < 0 || t >= best) continue;
            const p: Vec3 = [origin[0] + dir[0] * t, origin[1] + dir[1] * t, origin[2] + dir[2] * t];
            const along = dot(ab, sub(p, A)) / (abab || 1);
            if (cap === A ? along <= 0 : along >= 1) best = t;
        }
    }

    if (!Number.isFinite(best)) return null;
    const point: Vec3 = [
        origin[0] + dir[0] * best,
        origin[1] + dir[1] * best,
        origin[2] + dir[2] * best,
    ];
    return { t: best, point, normal: headNormal(head, point) };
}

/** Where a direction out of the head centre meets the surface. Never returns null. */
export function headSurface(head: HeadCapsule, dir: Vec3): Vec3 {
    const hit = headRay(head, head.centre, dir);
    if (hit) return hit.point;
    return [
        head.centre[0] + dir[0] * head.radius,
        head.centre[1] + dir[1] * head.radius,
        head.centre[2] + dir[2] * head.radius,
    ];
}

export interface HeadPoint {
    point: Vec3;
    normal: Vec3;
    /** Direction from the head centre — what the zone split is expressed in. */
    dir: Vec3;
}

/**
 * Area-weighted samples over the capsule surface: cylinder wall plus the two caps.
 *
 * Weighted by area rather than by solid angle because a cell of the latter is a share of direction,
 * not of skin, and on a body 23 cm long and 15 cm across the two differ a lot (§13.5).
 */
export function headPoints(head: HeadCapsule, count: number): HeadPoint[] {
    const a = norm(head.axis);
    const seed: Vec3 = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const u = norm(cross(a, seed));
    const v = cross(a, u);
    const wall = 2 * Math.PI * head.radius * 2 * head.half;
    const caps = 4 * Math.PI * head.radius * head.radius;
    const nWall = Math.round((count * wall) / (wall + caps));
    const nCaps = count - nWall;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const out: HeadPoint[] = [];

    const push = (along: number, radial: Vec3) => {
        const p: Vec3 = [
            head.centre[0] + a[0] * along + radial[0] * head.radius,
            head.centre[1] + a[1] * along + radial[1] * head.radius,
            head.centre[2] + a[2] * along + radial[2] * head.radius,
        ];
        out.push({ point: p, normal: radial, dir: norm(sub(p, head.centre)) });
    };

    for (let i = 0; i < nWall; i++) {
        const t = golden * i;
        const c = Math.cos(t);
        const s = Math.sin(t);
        push(((2 * (i + 0.5)) / nWall - 1) * head.half, [
            u[0] * c + v[0] * s,
            u[1] * c + v[1] * s,
            u[2] * c + v[2] * s,
        ]);
    }
    for (let i = 0; i < nCaps; i++) {
        const z = 1 - (2 * (i + 0.5)) / nCaps;
        const r = Math.sqrt(Math.max(0, 1 - z * z));
        const t = golden * i;
        const c = Math.cos(t) * r;
        const s = Math.sin(t) * r;
        push(z >= 0 ? head.half : -head.half, [
            a[0] * z + u[0] * c + v[0] * s,
            a[1] * z + u[1] * c + v[1] * s,
            a[2] * z + u[2] * c + v[2] * s,
        ]);
    }
    return out;
}

/* ============================================================
   Anatomical zones
   ============================================================ */

/**
 * Zones as (yaw, pitch) ranges of the direction from the head centre.
 *
 * These boundaries are the wiki's, not the game's — nothing in the build splits the head, because
 * a helmet has exactly one armour class for all of it (§4). They exist so a coverage figure can be
 * read as a place, and §14.6 notes they are doing some of the disagreeing with player reports.
 */
export const HEAD_ZONES = [
    ['face', (y: number, p: number) => Math.abs(y) <= 40 && p >= -25 && p <= 25],
    ['jaw', (y: number, p: number) => Math.abs(y) <= 55 && p < -25],
    ['brow', (y: number, p: number) => Math.abs(y) <= 55 && p > 25 && p <= 45],
    ['crown', (_y: number, p: number) => p > 45],
    ['sides', (y: number, p: number) => Math.abs(y) > 55 && Math.abs(y) <= 130 && Math.abs(p) <= 45],
    ['nape', (y: number, p: number) => Math.abs(y) > 130 && p <= 45],
] as const satisfies ReadonlyArray<readonly [string, (yaw: number, pitch: number) => boolean]>;

export type HeadZoneName = typeof HEAD_ZONES[number][0] | 'other';

export const HEAD_ZONE_NAMES = HEAD_ZONES.map(([name]) => name);

export function zoneOf(yaw: number, pitch: number): HeadZoneName {
    for (const [name, test] of HEAD_ZONES) {
        if (test(yaw, pitch)) return name;
    }
    return 'other';
}

/** The zone a surface direction belongs to. */
export function zoneOfDirection(dir: Vec3): HeadZoneName {
    return zoneOf(
        Math.atan2(dir[1], dir[0]) * DEG,
        Math.asin(Math.max(-1, Math.min(1, dir[2]))) * DEG,
    );
}

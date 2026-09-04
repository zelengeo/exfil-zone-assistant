/**
 * What happens when you hold the trigger on centre mass.
 *
 * Every other figure on this page is read out of the decompiled model. **This one models the
 * player**, so it is an estimate and is labelled one wherever it appears. It exists because the
 * aimed number quietly assumes a reader who lands every round on the zone they chose, and nobody
 * playing this game in a headset does that.
 *
 * The design sketched it as an expectation — a cone gives `p(zone)`, expected damage per round is
 * `Σ p(zone) × dmg(zone)`, and rounds are `pool ÷ that`. What runs here is the same idea resolved
 * one step more exactly: rather than averaging a hit distribution, the gun's **own recoil pattern**
 * is walked shot by shot.
 *
 *   1. `simulateRecoil` — the game's own `GetNewRecoilSimulationResult` — gives the crosshair at
 *      each shot, in degrees of pitch and yaw.
 *   2. `offsetAt` turns those into a displacement on a target at range, and
 *      `spreadRadiusPerMetre` gives the cone the round is then sampled inside.
 *   3. The landing point is tested against the thirteen collision capsules, seen from the front.
 *   4. Damage, durability and the HP pools resolve exactly as they do for an aimed shot — the same
 *      `calculateShotDamage`, and one shared durability track per piece of gear, because a vest
 *      being worn down by chest hits is the same vest when a round strays onto a shoulder.
 *
 * `p(zone)` still falls out of it, and is reported, because it is the part a reader can check
 * against their own experience.
 *
 * **Assumptions, all of them arguable and none of them hidden.** The shooter holds the aim point at
 * the centre of the upper chest and pulls back against `COMPENSATION` of the climb — see the note
 * on that constant, which is the one dial still genuinely open. The target is frontal, standing,
 * and in the model's reference pose, which holds the arms out wider than a firing stance would.
 * Movement, leaning, and the second and third bursts after a reset are not modelled.
 */

import { segment, type Capsule } from '@/lib/protection/bodyModel';
import { offsetAt, simulateRecoil, spreadRadiusPerMetre } from '@/lib/gunsmith/recoil';
import type { Ammunition, RecoilParameters } from '@/types/items';
import { calculateShotDamage } from './damage-calculations';
import { ammoProperties, armorProperties } from './props';
import { HEAD_CAPSULE, ZONE_GROUPS, type TargetModel, type TargetZone, type ZoneGroup } from './target-model';

/** Runs averaged. Enough that the figure is stable to the nearest round; cheap enough to redraw. */
const SEEDS = 24;

/** Trigger held this long, in rounds, before the estimate gives up and calls it survivable. */
const MAX_ROUNDS = 60;

/** Where the shooter is holding: the centre of the upper chest. */
const AIM_CAPSULE = 3;

/**
 * How much of the recoil climb the shooter pulls back out, 0 to 1.
 *
 * **This is the number still to settle.** At 0 the crosshair walks off the top of a target in a
 * second and the estimate reports that almost nothing lands, which is true of a burst nobody is
 * controlling and untrue of anyone who has played the game; at 1 recoil stops mattering and the
 * figure collapses back into the aimed one. 0.7 is a placeholder for "a player who is pulling down
 * but not perfectly", chosen because it leaves recoil visibly worth improving without making the
 * estimate a caricature.
 *
 * It is a property of the *player*, so no amount of further extraction will settle it — only
 * measurement against real bursts, or a decision. Everything else in this file is the game's.
 */
const COMPENSATION = 0.7;

export interface SprayHit {
    group: ZoneGroup | 'miss';
    /** Share of rounds fired that landed here, 0–1. */
    p: number;
}

export interface SprayEstimate {
    /** Rounds fired before the target goes down, averaged over the seeds. Null: it never does. */
    rounds: number | null;
    /** That many rounds at this build's fire rate. */
    seconds: number | null;
    /** Where the rounds went, most-hit first. Includes `miss`. */
    distribution: SprayHit[];
    /** Share of rounds that hit anything at all, 0–1. */
    hitRate: number;
    /** The cone's radius on the target, in centimetres. */
    spreadRadiusCm: number;
    /** How far the crosshair had climbed by the last round of the burst, in centimetres, after
     *  whatever the shooter pulls back out of it. */
    climbCm: number;
    /** The share of the climb the shooter is assumed to cancel — the estimate's one open dial. */
    compensation: number;
}

/** A capsule as the shooter sees it: a 2D segment and a radius, in centimetres on the target. */
interface FlatCapsule {
    capsule: number;
    ax: number; ay: number;
    bx: number; by: number;
    radius: number;
}

/** Right and up, dropping the depth axis: a frontal shooter looks down the model's +X. */
function flatten(capsule: Capsule): FlatCapsule {
    const [a, b] = segment(capsule);
    return {
        capsule: capsule.index,
        ax: a[1], ay: a[2],
        bx: b[1], by: b[2],
        radius: capsule.radius,
    };
}

/** Distance from a point to a 2D segment, which is what a flattened capsule's surface is offset from. */
function distanceToSegment(px: number, py: number, cap: FlatCapsule): number {
    const dx = cap.bx - cap.ax;
    const dy = cap.by - cap.ay;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq > 1e-9
        ? Math.max(0, Math.min(1, ((px - cap.ax) * dx + (py - cap.ay) * dy) / lengthSq))
        : 0;
    return Math.hypot(px - (cap.ax + t * dx), py - (cap.ay + t * dy));
}

/**
 * Which capsule a round landed on, or null for a miss.
 *
 * Capsules overlap where limbs meet the torso, so the winner is the one the point is deepest
 * inside — the ratio, not the raw distance, so a fat torso does not swallow a shoulder.
 */
function capsuleAt(px: number, py: number, flats: FlatCapsule[]): number | null {
    let best: number | null = null;
    let bestRatio = 1;
    for (const cap of flats) {
        const ratio = distanceToSegment(px, py, cap) / cap.radius;
        if (ratio <= 1 && ratio < bestRatio) {
            bestRatio = ratio;
            best = cap.capsule;
        }
    }
    return best;
}

/** A small LCG, so a seed always draws the same burst. `Math.random` would make the page flicker. */
function rng(seed: number): () => number {
    let state = (seed * 1103515245 + 12345) >>> 0;
    return () => {
        state = (state * 1103515245 + 12345) >>> 0;
        return state / 4294967296;
    };
}

/** Where the reading applies, for a head hit. Weighted by share: 2D cannot tell brow from jaw. */
function pickHeadReading(readings: TargetZone[], roll: number): TargetZone {
    let remaining = roll;
    for (const reading of readings) {
        remaining -= reading.headShare ?? 0;
        if (remaining <= 0) return reading;
    }
    return readings[readings.length - 1];
}

export interface SprayInput {
    target: TargetModel;
    ammo: Ammunition;
    firingPower: number;
    fireRate: number;
    moa: number | null;
    recoil: Partial<RecoilParameters> | undefined;
    /** Metres. */
    range: number;
}

export function estimateSpray({
    target, ammo, firingPower, fireRate, moa, recoil, range,
}: SprayInput): SprayEstimate {
    const flats = target.coverage.zones.map((zone) => flatten(zone.capsule));
    const aim = target.coverage.zones.find((zone) => zone.capsule.index === AIM_CAPSULE)?.capsule
        ?? target.coverage.zones[0].capsule;
    const aimX = aim.centre[1];
    const aimY = aim.centre[2];

    const zoneByCapsule = new Map<number, TargetZone>();
    for (const zone of target.body) zoneByCapsule.set(zone.capsule, zone);

    const ammoProps = ammoProperties(ammo);
    // Centimetres on the target at this range, straight off the build's MOA.
    const spreadRadius = spreadRadiusPerMetre(moa) * range;

    const pattern = simulateRecoil(recoil, { rounds: MAX_ROUNDS, fireRate });
    const drift = 1 - COMPENSATION;
    const climbCm = pattern.shots.length
        ? offsetAt(pattern.shots[pattern.shots.length - 1].pitch, range) * 100 * drift
        : 0;

    const hits = new Map<ZoneGroup | 'miss', number>();
    let fired = 0;
    let downs = 0;
    let roundsToDown = 0;

    for (let seed = 1; seed <= SEEDS; seed++) {
        const random = rng(seed);
        const health = new Map<string, number>();
        const durability = new Map<string, number>();
        let pool = target.totalHealth;
        let down = false;

        for (let i = 0; i < MAX_ROUNDS; i++) {
            const shot = pattern.shots[i] ?? pattern.shots[pattern.shots.length - 1];
            // The crosshair where this round left, plus a sample inside the cone around it.
            const angle = random() * Math.PI * 2;
            const radius = spreadRadius * Math.sqrt(random());
            const px = aimX + offsetAt(shot.yaw, range) * 100 * drift + Math.cos(angle) * radius;
            const py = aimY + offsetAt(shot.pitch, range) * 100 * drift + Math.sin(angle) * radius;

            fired += 1;
            const capsule = capsuleAt(px, py, flats);
            if (capsule === null) {
                hits.set('miss', (hits.get('miss') ?? 0) + 1);
                continue;
            }

            const zone = capsule === HEAD_CAPSULE
                ? pickHeadReading(target.head, random())
                : zoneByCapsule.get(capsule);
            if (!zone) {
                hits.set('miss', (hits.get('miss') ?? 0) + 1);
                continue;
            }
            hits.set(zone.group, (hits.get(zone.group) ?? 0) + 1);

            // One durability track per piece of gear, shared across every zone it covers.
            const armour = zone.armour;
            const gearKey = armour ? `${armour.source}:${armour.item.id}` : '';
            const props = armorProperties(armour);
            if (props && !durability.has(gearKey)) durability.set(gearKey, props.currentDurability);
            const current = props ? durability.get(gearKey) ?? 0 : 0;

            const result = calculateShotDamage(
                ammoProps, props, current, firingPower, zone.scalar, range, null, false,
            );

            if (props) durability.set(gearKey, Math.max(0, current - result.damageToArmor));

            const remaining = (health.get(zone.part) ?? zone.maxHealth) - result.damageToBodyPart;
            health.set(zone.part, Math.max(0, remaining));
            pool -= result.damageToBodyPart;

            if ((zone.vital && remaining <= 0) || pool <= 0) {
                down = true;
                downs += 1;
                roundsToDown += i + 1;
                break;
            }
        }

        if (!down) roundsToDown += MAX_ROUNDS;
    }

    const rounds = downs > 0 ? roundsToDown / SEEDS : null;
    const landed = fired - (hits.get('miss') ?? 0);

    const distribution: SprayHit[] = [...ZONE_GROUPS, 'miss' as const]
        .map((group): SprayHit => ({ group, p: (hits.get(group) ?? 0) / (fired || 1) }))
        .filter((entry) => entry.p > 0)
        .sort((a, b) => b.p - a.p);

    return {
        rounds,
        seconds: rounds !== null ? ((rounds - 1) * 60) / fireRate : null,
        distribution,
        hitRate: landed / (fired || 1),
        spreadRadiusCm: spreadRadius,
        climbCm,
        compensation: COMPENSATION,
    };
}

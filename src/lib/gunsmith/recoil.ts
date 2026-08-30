/**
 * The game's recoil model, as the gun itself runs it.
 *
 * A TypeScript port of `tools/recoilViz/recoilModel.js` in the extraction repo. Nothing here is
 * fitted or interpreted: every line was read out of x86-64 in `Contractors_Showdown.exe`, and
 * docs/GUN_MODEL.md §5 gives the addresses. Three pieces of engine (`FMath::InvExpApprox`,
 * `FMath::SpringDamper`, `UKismetMathLibrary::FloatSpringInterp`) and one of game
 * (`AZomboyGunBase::GetNewRecoilSimulationResult`).
 *
 * Two axes and a third that never shows: **pitch is vertical, yaw is horizontal**, and *shift* is
 * the gun travelling back along its own axis. Shift moves no crosshair — it only gates whether a
 * shot's angular kick is applied at all (see `SHIFT_GATE`), which is why a fast burst stacks its
 * kicks into fewer, later jumps.
 *
 * Feed it the **assembled** recoil parameters (`assembleGun().sim.recoilParameters`): the parts'
 * momentum and stiffness modifiers are proportional and belong folded in before this is called.
 */

import type { RecoilParameters } from '@/types/items';
import { DEFAULT_RECOIL_PARAMETERS, NATIVE_FIRE_RATE } from './assembly';

const RAD = Math.PI / 180;
const TWO_PI = Math.PI * 2;

/**
 * The integration step, as the literal the binary holds — **not** 1/288. It is fixed and does not
 * depend on frame rate, so the pattern a gun draws is deterministic given its RNG stream.
 */
export const SIM_DT = 0.003470000112429261;

/**
 * A shot's angular kick is withheld until the shift spring's velocity has climbed back above
 * `-0.02 × shiftImpulse`, i.e. until the gun has almost finished travelling into the shoulder.
 */
const SHIFT_GATE = -0.02;

/** A shot's pitch kick is scaled by U(0.8, 1) and its yaw kick by ±U(0.7, 1). */
const PITCH_JITTER_FLOOR = 0.8;
const YAW_JITTER_FLOOR = 0.7;

/**
 * `FMath::InvExpApprox` — a rational stand-in for `exp(-X)`, used by every damped branch of
 * `SpringDamper`. The three coefficients are verbatim from the binary; using a real `Math.exp`
 * here would be *more* accurate than the game and therefore wrong.
 */
export function invExpApprox(x: number): number {
    const a = 1.007460594177246;
    const b = 0.4505390226840973;
    const c = 0.25724631547927856;
    return 1 / (1 + a * x + b * x * x + c * x * x * x);
}

interface SpringState {
    value: number;
    rate: number;
    prevTarget: number;
    prevTargetValid: boolean;
}

function springState(): SpringState {
    return { value: 0, rate: 0, prevTarget: 0, prevTargetValid: false };
}

/**
 * `FMath::SpringDamper` — an exact integrator, not a Euler step, with a separate closed form for
 * each damping regime. `state` is mutated in place.
 */
function springDamper(
    state: SpringState,
    target: number,
    targetRate: number,
    dt: number,
    undampedFrequency: number,
    dampingRatio: number,
): void {
    if (dt <= 0) return;

    const w = undampedFrequency * TWO_PI;
    if (w < 1e-8) {
        // No stiffness at all: coast.
        state.value += state.rate * dt;
        return;
    }

    const z = dampingRatio;
    if (z < 1e-8) {
        // Undamped: a pure harmonic oscillator about the raw target.
        const err = state.value - target;
        const b = state.rate / w;
        const s = Math.sin(w * dt);
        const c = Math.cos(w * dt);
        state.value = target + err * c + b * s;
        state.rate = state.rate * c - err * (w * s);
        return;
    }

    // A non-zero target velocity is chased by displacing the target, not by adding a term.
    const targetAdjusted = target + (2 * z / w) * targetRate;
    const err = state.value - targetAdjusted;
    const rate = state.rate;

    if (z > 1) {
        // Overdamped — two real exponentials.
        const wd = w * Math.sqrt(z * z - 1);
        const c2 = -(rate + (w * z - wd) * err) / (2 * wd);
        const c1 = err - c2;
        const a1 = wd - z * w;
        const a2 = -(wd + z * w);
        const e1 = invExpApprox(-a1 * dt);
        const e2 = invExpApprox(-a2 * dt);
        state.value = targetAdjusted + c1 * e1 + c2 * e2;
        state.rate = c1 * a1 * e1 + c2 * a2 * e2;
    } else if (z === 1) {
        // Critically damped — the default, because `*Damping` defaults to 1.
        const c1 = rate + w * err;
        const e = invExpApprox(w * dt);
        state.value = targetAdjusted + (err + c1 * dt) * e;
        state.rate = (rate - w * c1 * dt) * e;
    } else {
        // Underdamped — it overshoots, which is what a gun that "bounces" is doing.
        const wd = w * Math.sqrt(1 - z * z);
        const a = err;
        const b = (rate + z * w * err) / wd;
        const s = Math.sin(wd * dt);
        const c = Math.cos(wd * dt);
        const e = invExpApprox(z * w * dt);
        state.value = targetAdjusted + e * (a * c + b * s);
        state.rate = -e * ((a * w * z - b * wd) * c + (a * wd + b * w * z) * s);
    }
}

/**
 * `UKismetMathLibrary::FloatSpringInterp`, with the argument list the simulation actually passes:
 * target 0, `targetVelocityAmount` 1, clamping off.
 *
 * The frequency handed to `SpringDamper` is `sqrt(stiffness/mass) / 2π`, so **mass and stiffness
 * only ever appear as a ratio** in the recovery, while mass appears alone in the impulse
 * (`momentum / mass`). Halving both leaves the spring identical and doubles the kick.
 */
function floatSpringInterp(
    state: SpringState,
    current: number,
    target: number,
    stiffness: number,
    criticalDampingFactor: number,
    dt: number,
    mass: number,
): number {
    if (dt <= 1e-8 || Math.abs(mass) <= 1e-8) return current;

    state.value = current;
    const targetRate = state.prevTargetValid ? (target - state.prevTarget) / dt : 0;
    const undampedFrequency = Math.sqrt(stiffness / mass) * (1 / TWO_PI);
    springDamper(state, target, targetRate, dt, undampedFrequency, criticalDampingFactor);
    state.prevTarget = target;
    state.prevTargetValid = true;
    return state.value;
}

/**
 * The MSVC CRT `rand()` the gun simulation calls: a 32-bit LCG whose output is bits 16..30.
 * Seeded here so a page can redraw the same pattern.
 */
export function crtRand(seed = 1): () => number {
    let s = seed >>> 0;
    return () => {
        s = (Math.imul(s, 214013) + 2531011) >>> 0;
        return (s >>> 16) & 0x7fff;
    };
}

/** `rand() / 32768` — the game's uniform, to the same 15 bits. */
export function crtUnit(rand: () => number): () => number {
    return () => rand() * 3.0518509447574615e-5;
}

const numberOr = (value: unknown, fallback: number): number =>
    (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

/** Fill a partial `recoilParameters` block from the C++ defaults. */
export function withRecoilDefaults(params: Partial<RecoilParameters> | undefined): Record<string, number> {
    const out: Record<string, number> = { ...DEFAULT_RECOIL_PARAMETERS };
    if (params) {
        for (const key of Object.keys(DEFAULT_RECOIL_PARAMETERS)) {
            const value = (params as Record<string, unknown>)[key];
            if (typeof value === 'number' && Number.isFinite(value)) out[key] = value;
        }
    }
    return out;
}

/** One round, sampled where the crosshair sat **before** that round's own kick. */
export interface RecoilShot {
    index: number;
    t: number;
    /** Degrees. Positive is up. */
    pitch: number;
    /** Degrees. Positive is right. */
    yaw: number;
}

export interface RecoilTracePoint {
    t: number;
    pitch: number;
    yaw: number;
}

export interface RecoilSimulation {
    shots: RecoilShot[];
    trace: RecoilTracePoint[];
    interval: number;
    duration: number;
}

export interface RecoilOptions {
    rounds?: number;
    /** RPM; sets the interval as 60/RPM. */
    fireRate?: number;
    /** Seconds between shots, overriding `fireRate`. */
    interval?: number;
    /** CRT rand seed — the same seed always draws the same pattern. */
    seed?: number;
    /** Drop the jitter, keeping the timing and the shoulder gate. */
    deterministic?: boolean;
}

/**
 * `AZomboyGunBase::GetNewRecoilSimulationResult` — the gun's own model, and the one a player feels.
 *
 * Per 0.00347 s tick, in this order — the order **is** the model:
 *   1. if the shot clock has come round, record the crosshair where it is now (so a sample is the
 *      aim *before* that round's kick, which is what a shot pattern is), advance the clock and
 *      push the shift spring backwards by `shiftMomentum/shiftMass`;
 *   2. integrate all three springs towards 0;
 *   3. if a shot is pending and the shift velocity has recovered past `SHIFT_GATE`, apply that
 *      shot's pitch and yaw kick and clear the pending flag.
 */
export function simulateRecoil(
    params: Partial<RecoilParameters> | undefined,
    options: RecoilOptions = {},
): RecoilSimulation {
    const p = withRecoilDefaults(params);
    const rounds = Math.max(1, Math.round(numberOr(options.rounds, 30)));
    const interval = numberOr(options.interval, 60 / numberOr(options.fireRate, NATIVE_FIRE_RATE));
    const unit = crtUnit(crtRand(numberOr(options.seed, 1)));
    const flat = options.deterministic === true;

    const shiftImpulse = p.shiftMomentum / p.shiftMass;
    const pitchImpulse = p.pitchBaseMomentum / p.pitchMass;
    const yawImpulse = p.yawBaseMomentum / p.yawMass;

    const shift = springState();
    const pitch = springState();
    const yaw = springState();
    let shiftValue = 0;
    let pitchDeg = 0;
    let yawDeg = 0;

    const duration = rounds * interval;
    const shots: RecoilShot[] = [];
    const trace: RecoilTracePoint[] = [];
    let nextShot = 0;
    let pending = false;

    for (let t = 0; t < duration; t += SIM_DT) {
        if (t >= nextShot) {
            shots.push({ index: shots.length, t, pitch: pitchDeg, yaw: yawDeg });
            nextShot += interval;
            shift.rate -= shiftImpulse;
            pending = true;
        }

        shiftValue = floatSpringInterp(shift, shiftValue, 0, p.shiftStiffness, p.shiftDamping, SIM_DT, p.shiftMass);
        pitchDeg = floatSpringInterp(pitch, pitchDeg, 0, p.pitchStiffness, p.pitchDamping, SIM_DT, p.pitchMass);
        yawDeg = floatSpringInterp(yaw, yawDeg, 0, p.yawStiffness, p.yawDamping, SIM_DT, p.yawMass);

        if (pending && shift.rate > SHIFT_GATE * shiftImpulse) {
            if (flat) {
                pitch.rate += pitchImpulse;
                yaw.rate += (shots.length % 2 ? 1 : -1) * yawImpulse;
            } else {
                const kickUp = PITCH_JITTER_FLOOR * pitchImpulse;
                pitch.rate += kickUp + unit() * (pitchImpulse - kickUp);
                const kickSide = YAW_JITTER_FLOOR * yawImpulse;
                const side = kickSide + unit() * (yawImpulse - kickSide);
                yaw.rate += Math.trunc(Math.min(unit() * 2, 1)) === 1 ? side : -side;
            }
            pending = false;
        }

        trace.push({ t, pitch: pitchDeg, yaw: yawDeg });
    }

    return { shots, trace, interval, duration };
}

/**
 * The build's MOA turned into the radius the game samples inside, in centimetres at one metre.
 *
 * `GetGunFiringLocationAndDirection` does exactly this: `tan(DegToRad(MOA / 60)) * 100`. So the
 * game's "MOA" **is** minutes of arc — the `/60` is there.
 */
export function spreadRadiusPerMetre(moa: number | null): number {
    const value = numberOr(moa, 0);
    if (value <= 0) return 0;
    return Math.tan((value / 60) * RAD) * 100;
}

/** `tan(angle°) × distance` — the game's own conversion from an aim angle to a point on a target. */
export function offsetAt(angleDegrees: number, distanceMetres: number): number {
    return Math.tan(numberOr(angleDegrees, 0) * RAD) * distanceMetres;
}

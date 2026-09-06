/**
 * How a gun's stats are built out of the parts bolted onto it.
 *
 * A TypeScript port of `tools/gunAssembly/gunAssembly.js` in the extraction repo, which is the
 * single copy of this model and is written to be copied here. Every constant below was read back
 * out of the game's own baked display stats; the formulas reproduce the six numbers the gunsmith
 * screen shows **float-exactly** across the shipped presets (RPM 134/134, ergonomics 129/129,
 * vertical recoil 131/132, horizontal 131/132, spread 131/131, firing power 122/122 — the single
 * miss is a preset whose parts list has an unnamed slot).
 *
 * Signs run two ways, and that is the usual source of a wrong number:
 *   - `verticalRecoilModifier` / `horizontalRecoilModifier` are **recoil** deltas: negative is
 *     better, a compensator is -0.07.
 *   - `accuracyModifier` is an **accuracy** delta: positive is better, it *reduces* spread.
 *   - `ergonomicsModifier` / `firingPowerModifier` are deltas on their own quantity.
 *
 * Two scales come back separately and are not interchangeable: `sim` is what the simulation is
 * authored in (and what `recoil.ts` takes), `display` is what a player compares guns by.
 */

import type { RecoilParameters } from '@/types/items';
import type { AttachmentModifier, GunsmithPart, PartGunData } from '@/types/gunsmith';

/**
 * The display scale for both recoil axes. `verticalRecoilControl` is authored around 0.15-1.6 and
 * the gunsmith screen shows 83-805, at exactly 600x on every preset.
 */
export const RECOIL_DISPLAY_SCALE = 600;

/** Ergonomics is authored 0.15-0.8 and shown as a percentage. */
export const ERGONOMICS_DISPLAY_SCALE = 100;

/**
 * Firing power's display is an affine map, and the base and the modifiers do *not* share a
 * coefficient: `90 + base*20 + sum*100`.
 */
export const FIRING_POWER_DISPLAY_OFFSET = 90;
export const FIRING_POWER_BASE_SCALE = 20;
export const FIRING_POWER_MODIFIER_SCALE = 100;

/**
 * The sim scale carries the same asymmetry, and for the same reason the display does.
 * `GetAttachmentModifiers` (GUN_MODEL.md §5.1) accumulates `FiringPowerModifier` **divided by
 * 0.2** — the literal in the binary is `1/0.2f`, `4.999999046325684` — and its consumer then
 * computes `(GunData.FiringPower + sum) * 0.2`. So a part is worth five times its face value to
 * the shot model, and dividing here is what makes the two scales the same statement:
 * `0.9 + 0.2 * (base + sum/0.2)` is `(90 + base*20 + sum*100) / 100`.
 */
export const FIRING_POWER_MODIFIER_DIVISOR = 0.2;

/**
 * `GunData.FiringRate` when the receiver authors none — a native C++ default the PAK cannot show.
 * 14 of the 61 receivers are in that position and every preset built on one bakes 600 RPM.
 */
export const NATIVE_FIRE_RATE = 600;

/**
 * `FWeaponRecoilParameters`' C++ defaults. The PAK serializes only what a receiver *changes*, so a
 * member missing from the published `recoilParameters` is this value — not zero, and not unknown.
 */
export const DEFAULT_RECOIL_PARAMETERS: Record<string, number> = {
    shiftMomentum: 410,
    pitchBaseMomentum: 230,
    yawBaseMomentum: 120,
    rollBaseMomentum: 0,
    shiftStiffness: 500,
    pitchStiffness: 2000,
    yawStiffness: 1200,
    rollStiffness: 700,
    shiftDamping: 1,
    pitchDamping: 1,
    yawDamping: 1,
    rollDamping: 1,
    shiftMass: 1,
    pitchMass: 1,
    yawMass: 1,
    rollMass: 1,
    oneHandedADSMultiplier: 0.25,
    verticalRecoilControl: 0.4,
    horizontalRecoilControl: 0.4,
};

/** Every `AttachmentModifier` member, in the spelling the published data uses. */
export const MODIFIER_KEYS = [
    'ergonomicsModifier',
    'verticalRecoilModifier',
    'horizontalRecoilModifier',
    'accuracyModifier',
    'firingPowerModifier',
    'shotgunSpreadModifer',
    'ADSSpeedModifier',
    'headDamageScaleModifier',
    'damageDropModifer',
    'shiftMomentumModifer',
    'yawMomentumModifer',
    'pitchMomentumModifer',
    'rollMomentumModifer',
    'shiftStiffnessModifer',
    'yawStiffnessModifer',
    'pitchStiffnessModifer',
    'rollStiffnessModifer',
] as const;

export type ModifierKey = typeof MODIFIER_KEYS[number];
export type ModifierTotals = Record<ModifierKey, number>;

/** Recoil-parameter members a part can shift, as `modifier key -> recoilParameters key`. */
export const RECOIL_PARAMETER_MODIFIERS: Partial<Record<ModifierKey, keyof RecoilParameters>> = {
    shiftMomentumModifer: 'shiftMomentum',
    yawMomentumModifer: 'yawBaseMomentum',
    pitchMomentumModifer: 'pitchBaseMomentum',
    rollMomentumModifer: 'rollBaseMomentum',
    shiftStiffnessModifer: 'shiftStiffness',
    yawStiffnessModifer: 'yawStiffness',
    pitchStiffnessModifer: 'pitchStiffness',
    rollStiffnessModifer: 'rollStiffness',
};

/**
 * Does this part change what the shooter *feels*, or only the number on the screen?
 *
 * `VerticalRecoilControl` and `HorizontalRecoilControl` are **display only** — neither recoil
 * simulation reads them (GUN_MODEL.md §5.3). The kick comes from the momentum, mass and stiffness
 * members, so a part advertising "−7% vertical recoil" moves the pattern only if it *also* carries
 * a momentum or stiffness modifier. Compensators do; most stocks and foregrips do not.
 *
 * 81 of the 710 parts pass this test; another 326 change a recoil rating and nothing else.
 */
export function affectsRecoilSimulation(part: GunsmithPart): boolean {
    const modifier = part.stats?.attachmentModifier ?? {};
    return (Object.keys(RECOIL_PARAMETER_MODIFIERS) as ModifierKey[])
        .some((key) => Boolean(modifier[key]));
}

const numberOr = (value: unknown, fallback: number): number =>
    (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

/** Kill the float noise a sum of hundredths leaves behind (0.30000000000000004 and friends). */
export function round(value: number, places = 6): number {
    const factor = 10 ** places;
    return Math.round(value * factor) / factor;
}

/** One entry of a build. `count` defaults to 1; only magazines ever carry another number. */
export interface BuildEntry {
    part: GunsmithPart;
    count?: number;
}

/** Every modifier in a build, summed. */
export function sumModifiers(entries: BuildEntry[]): ModifierTotals {
    const totals = {} as ModifierTotals;
    for (const key of MODIFIER_KEYS) totals[key] = 0;
    for (const entry of entries) {
        const count = numberOr(entry.count, 1);
        const modifier: AttachmentModifier = entry.part?.stats?.attachmentModifier || {};
        for (const key of MODIFIER_KEYS) totals[key] += numberOr(modifier[key], 0) * count;
    }
    for (const key of MODIFIER_KEYS) totals[key] = round(totals[key]);
    return totals;
}

/**
 * The build's base MOA: **the first part that declares a `partMOA`, not the receiver's**.
 *
 * The receiver's own `GunData.MOA` is the bare-action figure and is superseded the moment a barrel
 * is installed — the game shows the barrel's number even when it is worse. It stays the fallback
 * because 26 receivers author no MOA at all.
 */
export function baseMOA(gun: PartGunData | null, entries: BuildEntry[]): number | null {
    for (const entry of entries) {
        const moa = entry.part?.stats?.partMOA;
        if (typeof moa === 'number' && Number.isFinite(moa)) return moa;
    }
    const receiverMOA = gun?.MOA;
    return typeof receiverMOA === 'number' && Number.isFinite(receiverMOA) ? receiverMOA : null;
}

/**
 * Assembled weight: the sum of the parts.
 *
 * Deliberately not a preset's authored `Weight`, which disagrees with its own parts list on 125 of
 * the 127 presets that carry one.
 */
export function assembledWeight(entries: BuildEntry[]): number {
    let total = 0;
    for (const entry of entries) {
        total += numberOr(entry.part?.stats?.weight, 0) * numberOr(entry.count, 1);
    }
    return round(total);
}

export interface AssembledSim {
    fireRate: number;
    caliber: string | null;
    /** Spread in minutes of arc, after `accuracyModifier`. */
    MOA: number | null;
    baseMOA: number | null;
    ergonomics: number;
    firingPower: number;
    ADSSpeed: number | null;
    penetration: number | null;
    muzzleVelocity: number | null;
    recoilParameters: Partial<RecoilParameters>;
    weight: number;
}

export interface AssembledDisplay {
    RPM: number;
    caliber: string | null;
    ergonomics: number;
    verticalRecoil: number | null;
    horizontalRecoil: number | null;
    firingPower: number;
    spreadMOA: number | null;
}

export interface AssembledGun {
    sim: AssembledSim;
    display: AssembledDisplay;
    modifiers: ModifierTotals;
    warnings: string[];
}

/**
 * Assemble one build.
 *
 * @param gun     the receiver's `stats.gunData`
 * @param entries every part in the build, **receiver included** — its own modifier block is all
 *                zeros, so including it is both correct and simplest.
 */
export function assembleGun(gun: PartGunData | null, entries: BuildEntry[]): AssembledGun {
    const totals = sumModifiers(entries);
    const warnings: string[] = [];

    const fireRate = numberOr(gun?.fireRate, NATIVE_FIRE_RATE);
    if (!Number.isFinite(gun?.fireRate ?? NaN)) {
        warnings.push(`Fire rate is not authored on this receiver — the native default of ${NATIVE_FIRE_RATE} RPM is shown.`);
    }

    const ergonomics = round(numberOr(gun?.ergonomics, 0) + totals.ergonomicsModifier);
    // Divided, not added at face value: see FIRING_POWER_MODIFIER_DIVISOR. Adding raw under-counts
    // every attachment fivefold, and silently — the display line below has always been right, so
    // the gunsmith screen agreed with the game while the sim quietly shot a weaker gun. An RC416
    // with a 368mm barrel and a QDSS-NT4 read 1.01 where the game shows 105%.
    const firingPower = round(numberOr(gun?.firingPower, 0)
        + totals.firingPowerModifier / FIRING_POWER_MODIFIER_DIVISOR);
    const moa = baseMOA(gun, entries);
    if (moa === null) warnings.push('Neither the receiver nor any fitted part publishes an MOA, so spread cannot be shown.');

    // The two recoil control scalars and every momentum/stiffness member are **proportional**: a
    // -0.30 sum means 30% less recoil, not 0.30 less. `GetNewRecoilSimulationResult` multiplies
    // each parameter by its aggregated modifier, and the aggregator seeds those accumulators at
    // 1.0 while seeding ergonomics, firing power and accuracy at 0. See GUN_MODEL.md §5.
    const recoil = gun?.recoilParameters || {};
    const verticalControl = typeof recoil.verticalRecoilControl === 'number' ? recoil.verticalRecoilControl : null;
    const horizontalControl = typeof recoil.horizontalRecoilControl === 'number' ? recoil.horizontalRecoilControl : null;
    const verticalFactor = 1 + totals.verticalRecoilModifier;
    const horizontalFactor = 1 + totals.horizontalRecoilModifier;

    const recoilParameters: Partial<RecoilParameters> = { ...recoil };
    for (const modifierKey of Object.keys(RECOIL_PARAMETER_MODIFIERS) as ModifierKey[]) {
        if (!totals[modifierKey]) continue;
        const parameterKey = RECOIL_PARAMETER_MODIFIERS[modifierKey];
        if (!parameterKey) continue;
        const base = numberOr(recoilParameters[parameterKey], DEFAULT_RECOIL_PARAMETERS[parameterKey]);
        recoilParameters[parameterKey] = round(base * (1 + totals[modifierKey]));
    }
    if (verticalControl !== null) recoilParameters.verticalRecoilControl = round(verticalControl * verticalFactor);
    if (horizontalControl !== null) recoilParameters.horizontalRecoilControl = round(horizontalControl * horizontalFactor);

    const adsSpeed = typeof gun?.ADSSpeed === 'number' ? gun.ADSSpeed : null;

    const sim: AssembledSim = {
        fireRate,
        caliber: gun?.caliber ?? null,
        // `accuracyModifier` is an accuracy delta, so it subtracts from the spread.
        MOA: moa === null ? null : round(moa * (1 - totals.accuracyModifier)),
        baseMOA: moa,
        ergonomics,
        firingPower,
        ADSSpeed: adsSpeed === null ? null : round(adsSpeed * (1 + totals.ADSSpeedModifier)),
        penetration: gun?.penetration ?? null,
        muzzleVelocity: gun?.muzzleVelocity ?? null,
        recoilParameters,
        weight: assembledWeight(entries),
    };

    const display: AssembledDisplay = {
        RPM: fireRate,
        caliber: gun?.caliber ?? null,
        ergonomics: round(ergonomics * ERGONOMICS_DISPLAY_SCALE),
        verticalRecoil: verticalControl === null
            ? null : round(verticalControl * verticalFactor * RECOIL_DISPLAY_SCALE),
        horizontalRecoil: horizontalControl === null
            ? null : round(horizontalControl * horizontalFactor * RECOIL_DISPLAY_SCALE),
        firingPower: round(FIRING_POWER_DISPLAY_OFFSET
            + numberOr(gun?.firingPower, 0) * FIRING_POWER_BASE_SCALE
            + totals.firingPowerModifier * FIRING_POWER_MODIFIER_SCALE),
        spreadMOA: sim.MOA,
    };

    return { sim, display, modifiers: totals, warnings };
}

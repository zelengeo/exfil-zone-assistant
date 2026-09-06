/**
 * The two firing-power scales, pinned against the gunsmith screen.
 *
 * `display` and `sim` are the same statement at different scales, and the code got that wrong once
 * in the direction that hides: the display line was right, so the wiki's gunsmith agreed with the
 * game while the sim quietly shot a weaker gun. Every cell below is an in-game reading of the
 * gunsmith screen, so a failure here means the port has drifted from what a player sees.
 *
 * Readings taken 2026-09-06 on `oculus-5.5.3-release-1.108.0-v76.0-CL-0`.
 */
import { describe, expect, it } from 'vitest';
import { assembleGun, type BuildEntry } from '@/lib/gunsmith/assembly';
import type { GunsmithPart, PartGunData } from '@/types/gunsmith';

/** A part that carries one firing-power modifier and nothing else. */
const part = (firingPowerModifier: number): BuildEntry => ({
    part: { stats: { attachmentModifier: { firingPowerModifier } } } as unknown as GunsmithPart,
});

const receiver = (firingPower: number) => ({ firingPower } as PartGunData);

/** What `calculateShotDamage` makes of an assembled build. */
const shotScalar = (simFiringPower: number) => 0.9 + 0.2 * simFiringPower;

describe('firing power', () => {
    // RC416 receiver 0.5, shipped on the AR-15 368mm barrel (+0.03). The muzzle is the variable.
    const rc416 = (...muzzle: BuildEntry[]) => assembleGun(receiver(0.5), [part(0.03), ...muzzle]);

    it.each([
        ['bare barrel', [] as BuildEntry[], 103, 0.65],
        ['SLR HiHeat compensator (+0.005)', [part(0.005)], 103.5, 0.675],
        ['QDSS-NT4 suppressor (+0.02)', [part(0.02)], 105, 0.75],
    ])('RC416 with %s reads %d on the gunsmith screen', (_label, muzzle, display, sim) => {
        const built = rc416(...muzzle);
        expect(built.display.firingPower).toBe(display);
        expect(built.sim.firingPower).toBe(sim);
    });

    it.each([
        ['AKS74UN, no muzzle', 0.45, [] as BuildEntry[], 99, 0.45],
        ['AKS74UN + TGP-A (+0.005)', 0.45, [part(0.005)], 99.5, 0.475],
    ])('%s reads %d', (_label, base, parts, display, sim) => {
        const built = assembleGun(receiver(base), parts);
        expect(built.display.firingPower).toBe(display);
        expect(built.sim.firingPower).toBe(sim);
    });

    /*
     * The bug this file exists for. A modifier is worth `1/0.2` to the shot model, so adding it at
     * face value under-counted every attachment fivefold: the RC416 above came out at 1.01 - the
     * MP5's scalar - against the 1.05 the game shows. Stating it as the round trip rather than as
     * a magic number, because the round trip is the actual invariant.
     */
    it('agrees with the display scale on every build', () => {
        for (const base of [0.45, 0.5, 0.65]) {
            for (const sum of [0, 0.005, 0.03, 0.05, -0.02]) {
                const built = assembleGun(receiver(base), [part(sum)]);
                expect(shotScalar(built.sim.firingPower) * 100)
                    .toBeCloseTo(built.display.firingPower, 6);
            }
        }
    });
});

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { BodyModel } from '@/lib/protection/bodyModel';
import type { Ammunition } from '@/types/items';
import { buildTargetModel, EMPTY_DEFENDER } from './target-model';
import { estimateSpray } from './spray';

/**
 * The spray estimate is the one figure on the page that models the *player*, so it is the one that
 * most needs pinning: an assumption changed by accident would move a published number and nothing
 * else in the suite would notice.
 *
 * These check the properties the estimate claims, not a golden figure — the formula is explicitly
 * still open, and a test that pins its output would be a test of the current guess.
 */

const model: BodyModel = JSON.parse(
    readFileSync(resolve(process.cwd(), 'public/data/body-model.json'), 'utf-8'),
) as BodyModel;

/** A plain rifle round with a flat curve, so range changes nothing but the geometry. */
function round(): Ammunition {
    return {
        id: 'test-round',
        name: 'Test round',
        category: 'ammo',
        stats: {
            damage: 40,
            penetration: 3,
            caliber: '5.45x39',
            pellets: 1,
            muzzleVelocity: 900,
            bleedingChance: 0,
            bluntDamageScale: 0.1,
            protectionGearPenetratedDamageScale: 0.5,
            protectionGearBluntDamageScale: 0.9,
        },
    } as unknown as Ammunition;
}

const input = (range: number) => ({
    target: buildTargetModel(model, EMPTY_DEFENDER),
    ammo: round(),
    firingPower: 1,
    fireRate: 650,
    moa: 3,
    recoil: undefined,
    range,
});

describe('the spray estimate', () => {
    it('is deterministic — the same setup always draws the same burst', () => {
        expect(estimateSpray(input(60))).toEqual(estimateSpray(input(60)));
    });

    it('puts most rounds on the torso, because that is where the aim point is', () => {
        const { distribution } = estimateSpray(input(0));
        expect(distribution[0].group === 'chest' || distribution[0].group === 'pelvis').toBe(true);
    });

    it('reports a distribution that accounts for every round fired', () => {
        const total = estimateSpray(input(60)).distribution.reduce((sum, entry) => sum + entry.p, 0);
        expect(total).toBeCloseTo(1, 6);
    });

    it('scatters more at range — the cone and the climb both grow with distance', () => {
        const near = estimateSpray(input(0));
        const far = estimateSpray(input(240));
        expect(far.spreadRadiusCm).toBeGreaterThan(near.spreadRadiusCm);
        expect(far.hitRate).toBeLessThanOrEqual(near.hitRate);
    });

    it('takes more rounds than an aimed shot would, which is the whole point of it', () => {
        const spray = estimateSpray(input(0));
        expect(spray.rounds).not.toBeNull();
        // 440 HP of pool against a 40-damage round: an aimed burst on one vital part is far fewer.
        expect(spray.rounds!).toBeGreaterThan(1);
    });
});

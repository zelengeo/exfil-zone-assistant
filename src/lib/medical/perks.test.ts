/**
 * The perk reader, exercised against the real `medical.json` rather than fixtures.
 *
 * The awkward shapes are all in the data and none of them are hypothetical: a perk with no effects
 * at all, a perk whose "+0.3" is a cost rather than a gain, and exactly one item with a comedown.
 * A fixture would have to invent those, and inventing them is how you end up testing the invention.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Medicine } from '@/types/items';
import {
    effectRow,
    formatEffectValue,
    medicinePerkOf,
    perkEarnsPanel,
    perkName,
    targetLabel,
} from './perks';

const items: Medicine[] = JSON.parse(
    readFileSync(path.join(process.cwd(), 'public/data/medical.json'), 'utf8'),
);

const byId = (id: string): Medicine => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`no such medical item: ${id}`);
    return item;
};

describe('perkName', () => {
    it('derives every perk in the data without a lookup table', () => {
        expect(perkName('RapidPulsePerk')).toBe('Rapid Pulse');
        expect(perkName('BoundlessEnergyPerk')).toBe('Boundless Energy');
        expect(perkName('LoadMasterPerk')).toBe('Load Master');
        expect(perkName('HemostasisPerk')).toBe('Hemostasis');
        expect(perkName('PainkillerPerk')).toBe('Painkiller');
    });

    it('names a perk the extraction has not shipped yet', () => {
        expect(perkName('SteadyHandsPerk')).toBe('Steady Hands');
    });
});

describe('targetLabel', () => {
    it('is sentence case, not title case — these are labels, not names', () => {
        expect(targetLabel('maxStamina')).toBe('Max stamina');
        expect(targetLabel('staminaRecovery')).toBe('Stamina recovery');
        expect(targetLabel('movementSpeed')).toBe('Movement speed');
        expect(targetLabel('hydrationDrain')).toBe('Hydration drain');
    });

    it('writes out the one that reads badly derived', () => {
        expect(targetLabel('weightLimit')).toBe('Carry weight');
    });

    it('falls back readably for a target nobody has seen', () => {
        expect(targetLabel('recoilControl')).toBe('Recoil control');
    });
});

describe('formatEffectValue', () => {
    it('prints a scalar as a percentage and a rate per second', () => {
        expect(formatEffectValue({ attribute: 'a', value: 0.25, target: 'maxStamina', mode: 'scalar' }))
            .toBe('+25%');
        expect(formatEffectValue({ attribute: 'a', value: 0.1, target: 'energyDrain', mode: 'perSecond' }))
            .toBe('+0.1/s');
    });

    it('carries a minus sign for a negative', () => {
        expect(formatEffectValue({ attribute: 'a', value: -0.2, target: 'staminaRecovery', mode: 'scalar' }))
            .toBe('−20%');
    });

    it('refuses to guess a unit onto a mode it does not know', () => {
        expect(formatEffectValue({ attribute: 'a', value: 3, target: 'x', mode: 'flat' })).toBe('+3');
    });
});

describe('cost is not the sign', () => {
    it('counts a positive drain as something you pay', () => {
        expect(effectRow({ attribute: 'a', value: 0.3, target: 'energyDrain', mode: 'perSecond' }).cost)
            .toBe(true);
        expect(effectRow({ attribute: 'a', value: 0.3, target: 'hydrationDrain', mode: 'perSecond' }).cost)
            .toBe(true);
    });

    it('counts the same positive on a benefit as a gain', () => {
        expect(effectRow({ attribute: 'a', value: 0.3, target: 'weightLimit', mode: 'scalar' }).cost)
            .toBe(false);
    });

    it('counts a negative on a benefit as a cost', () => {
        expect(effectRow({ attribute: 'a', value: -0.2, target: 'staminaRecovery', mode: 'scalar' }).cost)
            .toBe(true);
    });
});

describe('medicinePerkOf, against the real catalogue', () => {
    it('finds a perk on eight of the eighteen medical items', () => {
        expect(items.filter((item) => medicinePerkOf(item.stats)).length).toBe(8);
    });

    it('is null for an item with no perk', () => {
        expect(medicinePerkOf(byId('med-bandage-lv1').stats)).toBeNull();
    });

    it('reads the KB-22 as carry weight bought with drain', () => {
        const perk = medicinePerkOf(byId('med-stimul-kb22').stats);
        expect(perk?.name).toBe('Load Master');
        expect(perk?.duration).toBe(600);
        expect(perk?.effects).toEqual([
            { attribute: 'LoadMaster_weight_scalar', label: 'Carry weight', value: '+30%', cost: false },
            // Both drains are rates, not scalars — the same 0.3 reads differently per mode.
            { attribute: 'LoadMaster_energy', label: 'Energy drain', value: '+0.3/s', cost: true },
            { attribute: 'LoadMaster_hydra', label: 'Hydration drain', value: '+0.3/s', cost: true },
        ]);
    });

    it('keeps a perk that has no effects rather than dropping it', () => {
        // Morphine is filed under Stims and applies the painkiller perk, which lists no modifiers.
        const perk = medicinePerkOf(byId('med-stimul-morphine').stats);
        expect(perk?.name).toBe('Painkiller');
        expect(perk?.duration).toBe(120);
        expect(perk?.effects).toEqual([]);
        expect(perk?.after).toBeNull();
    });

    it('reads the P4 comedown as its own window', () => {
        const perk = medicinePerkOf(byId('med-stimul-p4').stats);
        expect(perk?.effects).toHaveLength(4);
        expect(perk?.after?.duration).toBe(30);
        expect(perk?.after?.effects).toEqual([
            {
                attribute: 'boundlessEnergy_stamina_restore_scalar',
                label: 'Stamina recovery',
                value: '−20%',
                cost: true,
            },
        ]);
    });

    it('gives every effect in the catalogue a label and a united value', () => {
        for (const item of items) {
            const perk = medicinePerkOf(item.stats);
            if (!perk) continue;
            for (const row of [...perk.effects, ...(perk.after?.effects ?? [])]) {
                expect(row.label).not.toBe('');
                expect(row.value).toMatch(/^[+−]/);
            }
        }
    });
});

describe('perkEarnsPanel', () => {
    const perkFor = (id: string) => {
        const item = byId(id);
        const perk = medicinePerkOf(item.stats);
        if (!perk) throw new Error(`${id} has no perk`);
        return { perk, name: item.name };
    };

    it('drops the panel where the item name already says it and there are no effects', () => {
        for (const id of ['med-painkiller-lv1', 'med-painkiller-lv2', 'med-painkiller-lv3']) {
            const { perk, name } = perkFor(id);
            expect(perkEarnsPanel(perk, name)).toBe(false);
        }
    });

    it('keeps it for morphine, where the perk is news', () => {
        const { perk, name } = perkFor('med-stimul-morphine');
        expect(perk.effects).toEqual([]);
        expect(perkEarnsPanel(perk, name)).toBe(true);
    });

    it('keeps it whenever there are effects, whatever the item is called', () => {
        const { perk } = perkFor('med-stimul-kb22');
        expect(perkEarnsPanel(perk, 'Load Master')).toBe(true);
    });

    it('leaves five of the eight showing a panel', () => {
        const shown = items.filter((item) => {
            const perk = medicinePerkOf(item.stats);
            return perk && perkEarnsPanel(perk, item.name);
        });
        expect(shown.map((item) => item.id)).toEqual([
            'med-stimul-adrenaline',
            'med-stimul-hc',
            'med-stimul-kb22',
            'med-stimul-morphine',
            'med-stimul-p4',
        ]);
    });
});

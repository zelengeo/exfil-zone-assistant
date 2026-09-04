/**
 * What stands between a player and an offer.
 *
 * These used to be the alarm on a join: `gates.ts` matched the goods data's in-game ids against the
 * task database through `gameId`, and that join was dead for a season without anyone noticing,
 * because an unresolved gate still renders as a legible id. The extraction resolves it now, so what
 * is left here is the reading of what an offer carries — and one guard that the join has not crept
 * back in. The published data itself is checked by `npm run validate-data`.
 */
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { collectGates, offerGates } from '@/lib/gates';
import type { BuyOffer, TaskGate } from '@/types/trade';

const seaside: TaskGate = {
    gameId: 'task.marc.part2.01',
    id: 'ark_36',
    name: 'Seaside Pursuit',
    corpId: 'ark',
};

const offer = (extra: Partial<BuyOffer>): BuyOffer =>
    ({ vendor: 'ark', level: 1, price: 100, ...extra });

describe('offerGates', () => {
    it('has nothing to say about a missing offer', () => {
        expect(offerGates(undefined)).toEqual([]);
    });

    it('names a task gate by the id the goods data uses, not the route id', () => {
        // The two are different ids and always have been: `task.marc.part2.01` is what the offer
        // names, `ark_36` is what /tasks routes on. A gate is identified by the former.
        const [gate] = offerGates(offer({ requiresTasks: [seaside] }));

        expect(gate).toEqual({
            kind: 'task',
            id: 'task.marc.part2.01',
            task: { id: 'ark_36', name: 'Seaside Pursuit', corpId: 'ark' },
        });
    });

    it('keeps a gate the extraction could not resolve printable as an id', () => {
        const [gate] = offerGates(offer({ requiresTasks: [{ gameId: 'task.nobody.knows.this' }] }));

        expect(gate).toEqual({ kind: 'task', id: 'task.nobody.knows.this', task: null });
    });

    it('prints the id rather than half a name when the join is incomplete', () => {
        // Partial resolution is the shape a broken publish would produce. A chip with an id and no
        // name renders as an empty link, which reads as a bug in the page rather than in the data.
        const [gate] = offerGates(offer({
            requiresTasks: [{ gameId: 'task.marc.part2.01', id: 'ark_36' }],
        }));

        expect(gate).toEqual({ kind: 'task', id: 'task.marc.part2.01', task: null });
    });

    it('resolves a daily, whose corp id is the empty string', () => {
        // `corpId: ''` is how the data files a daily, and it is a real value rather than a gap —
        // so the all-or-nothing test above must not read it as one.
        const [gate] = offerGates(offer({
            requiresTasks: [{ gameId: 'task.daily.1', id: 'daily_1', name: 'Deployment', corpId: '' }],
        }));

        expect(gate.kind === 'task' && gate.task).toEqual({
            id: 'daily_1', name: 'Deployment', corpId: '',
        });
    });

    it('labels a known DLC with its season', () => {
        const [gate] = offerGates(offer({ requiresDlc: ['dlc.s5.brokencontact'] }));

        expect(gate).toEqual({
            kind: 'dlc',
            id: 'dlc.s5.brokencontact',
            label: 'Season 5 · Broken Contact',
        });
    });

    it('never guesses a pack name it does not hold', () => {
        const [gate] = offerGates(offer({ requiresDlc: ['dlc.s9.unreleased'] }));

        expect(gate).toEqual({ kind: 'dlc', id: 'dlc.s9.unreleased', label: null });
    });

    it('puts playtime before money', () => {
        const gates = offerGates(offer({
            requiresDlc: ['dlc.s3.ak'],
            requiresTasks: [seaside],
        }));

        expect(gates.map((gate) => gate.kind)).toEqual(['task', 'dlc']);
    });
});

describe('collectGates', () => {
    it('names each gate once across the whole set', () => {
        const gates = collectGates([
            offer({ requiresTasks: [seaside] }),
            offer({ vendor: 'ntg', requiresTasks: [seaside] }),
        ]);

        expect(gates).toHaveLength(1);
    });

    it('orders tasks before DLC across the set, not just within an offer', () => {
        const gates = collectGates([
            offer({ requiresDlc: ['dlc.s3.m4'] }),
            offer({ requiresTasks: [seaside] }),
        ]);

        expect(gates.map((gate) => gate.kind)).toEqual(['task', 'dlc']);
    });

    it('has nothing to say about an empty catalogue', () => {
        expect(collectGates([])).toEqual([]);
    });
});

describe('the module itself', () => {
    it('reads gates from the offer rather than from the task database', async () => {
        // The load-bearing one. `gates.ts` is reached from the items catalogue and the gunsmith
        // bench, so importing the task database here put 431 KB of tasks in both bundles to name
        // a gate. The join lives in the extraction now; see docs/EXTRACTION_CHANGE_REQUEST.md.
        const source = await readFile(new URL('./gates.ts', import.meta.url), 'utf8');
        const values = [...source.matchAll(/^import (?!type )[^;]+from '([^']+)';/gm)]
            .map((match) => match[1]);

        expect(values).toEqual([]);
    });
});

/**
 * What stands between a player and an offer.
 *
 * The join these functions perform was dead for a while — the task database was a naming generation
 * behind the goods data and matched none of the gates — and it fails silently when it breaks, since
 * an unresolved gate still renders as a legible id. These specs are the alarm.
 */
import { describe, expect, it } from 'vitest';
import { tasksData } from '@/data/tasks';
import { collectGates, offerGates } from '@/lib/gates';
import type { BuyOffer } from '@/types/trade';

const knownTask = Object.values(tasksData).find((task) => task.gameId)!;

const offer = (extra: Partial<BuyOffer>): BuyOffer =>
    ({ vendor: 'ark', level: 1, price: 100, ...extra });

describe('offerGates', () => {
    it('has nothing to say about a missing offer', () => {
        expect(offerGates(undefined)).toEqual([]);
    });

    it('resolves a task gate through the game id, not the route id', () => {
        const [gate] = offerGates(offer({ requiresTasks: [knownTask.gameId] }));

        expect(gate).toMatchObject({ kind: 'task', id: knownTask.gameId });
        expect(gate.kind === 'task' && gate.task?.id).toBe(knownTask.id);
    });

    it('keeps an unresolved task gate printable as an id', () => {
        const [gate] = offerGates(offer({ requiresTasks: ['task.nobody.knows.this'] }));

        expect(gate).toEqual({ kind: 'task', id: 'task.nobody.knows.this', task: null });
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
            requiresTasks: [knownTask.gameId],
        }));

        expect(gates.map((gate) => gate.kind)).toEqual(['task', 'dlc']);
    });
});

describe('collectGates', () => {
    it('names each gate once across the whole set', () => {
        const gates = collectGates([
            offer({ requiresTasks: [knownTask.gameId] }),
            offer({ vendor: 'ntg', requiresTasks: [knownTask.gameId] }),
        ]);

        expect(gates).toHaveLength(1);
    });

    it('orders tasks before DLC across the set, not just within an offer', () => {
        const gates = collectGates([
            offer({ requiresDlc: ['dlc.s3.m4'] }),
            offer({ requiresTasks: [knownTask.gameId] }),
        ]);

        expect(gates.map((gate) => gate.kind)).toEqual(['task', 'dlc']);
    });

    it('has nothing to say about an empty catalogue', () => {
        expect(collectGates([])).toEqual([]);
    });
});

import { tasksData } from '@/data/tasks';
import type { Task } from '@/types/tasks';
import type { BuyOffer } from '@/types/trade';

/**
 * What stands between a player and an offer.
 *
 * Two kinds, and the difference matters more than the shared heading suggests: a task gate costs
 * playtime, a DLC gate costs money. Both are information rather than locks — the wiki tracks
 * neither a player's progress nor their purchases — but a reader deciding whether an item is
 * reachable wants to know which sort of wall they are looking at.
 *
 * A gate always carries the raw id the goods data names, so an unresolved one can still be printed
 * as an id. An id rendered in mono reads as an id, which is honest; a guessed name would not be.
 */

export type Gate =
    | {
          kind: 'task';
          /** The in-game id the offer names, e.g. `task.marc.part2.01`. */
          id: string;
          /** The published task. Null only if the task database does not know this id. */
          task: Task | null;
      }
    | {
          kind: 'dlc';
          /** The in-game id the offer names, e.g. `dlc.s5.brokencontact`. */
          id: string;
          /** A readable name, where one is known. Null means print the id. */
          label: string | null;
      };

/* --------------------------------------------------------------------------
 * Tasks
 *
 * `requiresTasks` names tasks by their in-game id, not by the wiki id the tasks route routes on,
 * so the join goes through `gameId`. It was a dead join for a while — the task database was a
 * naming generation behind the goods data and matched none of the 128 gates — and is now complete:
 * all 128 resolve against the 227 published tasks.
 * ----------------------------------------------------------------------- */

let byGameId: Map<string, Task> | null = null;

function taskIndex(): Map<string, Task> {
    if (!byGameId) {
        byGameId = new Map<string, Task>();
        for (const task of Object.values(tasksData)) {
            if (task.gameId) byGameId.set(task.gameId, task);
        }
    }
    return byGameId;
}

function taskGate(gameId: string): Gate {
    return { kind: 'task', id: gameId, task: taskIndex().get(gameId) ?? null };
}

/* --------------------------------------------------------------------------
 * DLC
 *
 * Four ids across 14 offers, all of the form `dlc.<season>.<pack>`. Nothing else in the app
 * describes them, so the names below are transcribed from the ids themselves rather than taken
 * from anywhere authoritative — REPLACE THEM with the published store names when those are to
 * hand. An id with no entry prints as an id, the same as an unresolved task.
 * ----------------------------------------------------------------------- */

const DLC_NAMES: Record<string, string> = {
    'dlc.s5.brokencontact': 'Broken Contact',
    'dlc.s3.ak': 'AK',
    'dlc.s3.m4': 'M4',
    'dlc.s3.zombie': 'Zombie',
};

/** `s5` → `Season 5`. Only the season segment is derived; the pack name is never guessed. */
function seasonOf(dlcId: string): string | null {
    const match = /^dlc\.s(\d+)\./.exec(dlcId);
    return match ? `Season ${match[1]}` : null;
}

function dlcGate(dlcId: string): Gate {
    const name = DLC_NAMES[dlcId];
    if (!name) return { kind: 'dlc', id: dlcId, label: null };
    const season = seasonOf(dlcId);
    return { kind: 'dlc', id: dlcId, label: season ? `${season} · ${name}` : name };
}

/* ----------------------------------------------------------------------- */

/** Every gate one offer names, tasks first — playtime before money. */
export function offerGates(offer: BuyOffer | undefined): Gate[] {
    if (!offer) return [];
    return [
        ...(offer.requiresTasks ?? []).map(taskGate),
        ...(offer.requiresDlc ?? []).map(dlcGate),
    ];
}

/** Every distinct gate across a set of offers, for one summary section. */
export function collectGates(offers: readonly BuyOffer[]): Gate[] {
    const seen = new Set<string>();
    const gates: Gate[] = [];
    for (const offer of offers) {
        for (const gate of offerGates(offer)) {
            if (seen.has(gate.id)) continue;
            seen.add(gate.id);
            gates.push(gate);
        }
    }
    // Tasks before DLC across the whole set, not just within each offer.
    return [
        ...gates.filter((gate) => gate.kind === 'task'),
        ...gates.filter((gate) => gate.kind === 'dlc'),
    ];
}

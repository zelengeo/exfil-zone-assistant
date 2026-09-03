/**
 * The chain layout and progress rules, exercised against the real 227 tasks rather than fixtures.
 *
 * The data is the point: a fixture would prove the functions self-consistent while saying nothing
 * about the database they actually run on, and every bug these rules have had so far came from real
 * shapes — a vendor whose chain interleaves with another's, a fan wide enough to strand the spine.
 */
import { describe, expect, it } from 'vitest';
import { tasksData } from '@/data/tasks';
import {
    ELBOW_RISE, LOCKED_TAIL, MAX_LANE, NODE_GAP, ROW_H, ROW_H_COMPACT,
    buildChains, laneX, locate, rowTextX, visibleRows,
} from '@/app/tasks/utils/chain';
import {
    EMPTY_PROGRESS, countsFor, gatesFor, nextUpIn, objectiveTicks,
    setDone, stateOf, toggleObjective,
} from '@/app/tasks/utils/progress';
import { externalPrereqsOf, ownerOf, populatedOwners, tasksForOwner } from '@/app/tasks/utils/vendors';
import type { TaskProgress } from '@/types/tasks';

const owners = populatedOwners();
const allTasks = Object.values(tasksData);
const lockedAt = (progress: TaskProgress) => (taskId: string) =>
    stateOf(tasksData[taskId], progress) === 'locked';

describe('every task is laid out exactly once', () => {
    it('covers the database with no repeats', () => {
        const placed = owners.flatMap((owner) =>
            buildChains(owner).chains.flatMap((chain) => chain.nodes.map((node) => node.taskId)));

        expect(new Set(placed).size).toBe(placed.length);
        expect(placed).toHaveLength(allTasks.length);
    });
});

describe.each(owners)('%s', (owner) => {
    const { chains, total } = buildChains(owner);
    const nodes = chains.flatMap((chain) => chain.nodes);

    it('lays out one node per task, inside the lane cap', () => {
        expect(nodes).toHaveLength(total);
        expect(Math.max(...nodes.map((node) => node.lane))).toBeLessThanOrEqual(MAX_LANE);
        expect(nodes.every((node) => node.lane >= 0)).toBe(true);
    });

    it('runs every edge downwards, so a prerequisite sits above its dependant', () => {
        for (const chain of chains) {
            for (const edge of chain.edges) {
                expect(edge.fromIndex, `${edge.from}->${edge.to}`).toBeLessThan(edge.toIndex);
            }
        }
    });

    it('numbers each node by its position in the chain', () => {
        for (const chain of chains) {
            expect(chain.nodes.map((node) => node.index)).toEqual(chain.nodes.map((_, i) => i));
        }
    });

    it('opens every chain on something reachable from nothing', () => {
        for (const chain of chains) {
            const root = tasksData[chain.rootTaskId];
            if (stateOf(root, EMPTY_PROGRESS) !== 'locked') continue;
            // A locked root is only legitimate when another vendor holds the key.
            expect(externalPrereqsOf(root), `${owner}: root ${root.id}`).not.toHaveLength(0);
        }
    });

    it('steps a branch out one lane at a time', () => {
        for (const chain of chains) {
            for (const edge of chain.edges) {
                expect(edge.toLane, `${edge.from}->${edge.to}`).toBeLessThanOrEqual(edge.fromLane + 1);
            }
        }
    });

    it('keeps the spine as the main line', () => {
        // Handing lane 0 to whichever successor was drawn first once put 23 of the gunsmith's 25
        // rows on the branch, beside an empty spine.
        for (const chain of chains) {
            const onBranch = chain.nodes.filter((node) => node.lane > 0).length;
            expect(onBranch * 2).toBeLessThanOrEqual(chain.nodes.length);
        }
    });

    it('clears every row of its own marker', () => {
        for (const node of nodes) {
            expect(rowTextX(node.lane)).toBeGreaterThan(laneX(node.lane));
        }
    });

    it('loses no rows when the locked tail collapses', () => {
        for (const chain of chains) {
            const { shown, hidden } = visibleRows(chain.nodes, lockedAt(EMPTY_PROGRESS));
            expect(shown.length + hidden).toBe(chain.nodes.length);
            if (hidden > 0) expect(shown.length).toBeGreaterThanOrEqual(LOCKED_TAIL);
        }
    });

    it('never folds the selected task away', () => {
        for (const chain of chains) {
            const last = chain.nodes[chain.nodes.length - 1];
            const { shown } = visibleRows(chain.nodes, lockedAt(EMPTY_PROGRESS), last.taskId);
            expect(shown.map((node) => node.taskId)).toContain(last.taskId);
        }
    });

    it('folds nothing when nothing is locked', () => {
        // Stated as a predicate rather than by walking a chain to completion: several chains cannot
        // be finished from inside themselves, because a task partway down waits on another vendor.
        for (const chain of chains) {
            expect(visibleRows(chain.nodes, () => false).hidden).toBe(0);
        }
    });
});

describe('walking a vendor to a standstill', () => {
    /* Completing next-up in a loop must clear everything the vendor can reach alone. */
    const walk = () => {
        let progress: TaskProgress = EMPTY_PROGRESS;
        const chain = buildChains('ark').chains[0];
        for (let steps = 0; steps < 500; steps += 1) {
            const next = nextUpIn(chain, progress);
            if (!next) return progress;
            progress = setDone(progress, tasksData[next], true);
        }
        throw new Error('ark walk did not terminate');
    };

    it('traces everything still locked back to a cross-vendor gate', () => {
        // ARK stalls at ark_59, which needs Regiment's regiment_16 — the two vendors interleave — so
        // the block is transitive and the check has to walk the prerequisites, not the stuck task.
        const progress = walk();
        const gatedElsewhere = (id: string, seen = new Set<string>()): boolean => {
            if (seen.has(id)) return false;
            seen.add(id);
            if (externalPrereqsOf(tasksData[id]).length > 0) return true;
            return tasksData[id].requiredTasks.some((prereq) => gatedElsewhere(prereq, seen));
        };

        const stuck = tasksForOwner('ark').filter((task) => stateOf(task, progress) === 'locked');
        expect(stuck.filter((task) => !gatedElsewhere(task.id)).map((task) => task.id)).toEqual([]);
    });

    it('leaves ark with progress on the board', () => {
        expect(countsFor(tasksForOwner('ark'), walk()).completed).toBeGreaterThan(0);
    });
});

describe('ticking objectives', () => {
    const sample = allTasks.find(
        (task) => task.objectives.length > 2 && stateOf(task, EMPTY_PROGRESS) === 'open',
    )!;

    it('completes a task once every objective is ticked', () => {
        let progress: TaskProgress = EMPTY_PROGRESS;
        sample.objectives.forEach((_, i) => { progress = toggleObjective(progress, sample, i); });
        expect(stateOf(sample, progress)).toBe('completed');
    });

    it('un-completes on un-ticking, keeping the other ticks', () => {
        let progress: TaskProgress = EMPTY_PROGRESS;
        sample.objectives.forEach((_, i) => { progress = toggleObjective(progress, sample, i); });
        progress = toggleObjective(progress, sample, 0);

        expect(stateOf(sample, progress)).not.toBe('completed');
        expect(objectiveTicks(sample, progress).filter(Boolean))
            .toHaveLength(sample.objectives.length - 1);
    });

    it('ticks every objective when the task is marked done, and leaves no record on undo', () => {
        let progress = setDone(EMPTY_PROGRESS, sample, true);
        expect(objectiveTicks(sample, progress).every(Boolean)).toBe(true);

        progress = setDone(progress, sample, false);
        expect(Object.keys(progress.tasks)).toHaveLength(0);
    });
});

describe('row geometry', () => {
    // The phone raises the row to 44px and the spine is arithmetic on that number rather than on a
    // constant, so both heights have to leave the connectors drawable.
    it.each([['desktop', ROW_H], ['compact', ROW_H_COMPACT]] as const)(
        'leaves %s connectors drawable',
        (_label, rowH) => {
            expect(NODE_GAP * 2).toBeLessThan(rowH);
            expect(ELBOW_RISE).toBeGreaterThan(NODE_GAP);
            expect(ELBOW_RISE).toBeLessThan(rowH - NODE_GAP);
        },
    );

    it('keeps the phone row a thumb target', () => {
        expect(ROW_H_COMPACT).toBeGreaterThanOrEqual(44);
        expect(ROW_H_COMPACT).toBeGreaterThan(ROW_H);
    });
});

describe('the database as a whole', () => {
    // Per-vendor walks stall on purpose, since the vendors interleave, so whether the campaign is
    // finishable can only be asked across all seven at once.
    it('points every prerequisite at a task that exists', () => {
        const dangling = allTasks.flatMap((task) =>
            task.requiredTasks.filter((id) => !tasksData[id]).map((id) => `${task.id}<-${id}`));
        expect(dangling).toEqual([]);
    });

    it('leaves every task reachable', () => {
        const reachable = new Set<string>();
        for (let moved = true; moved;) {
            moved = false;
            for (const task of allTasks) {
                if (reachable.has(task.id)) continue;
                if (task.requiredTasks.every((id) => reachable.has(id))) {
                    reachable.add(task.id);
                    moved = true;
                }
            }
        }
        expect(allTasks.filter((task) => !reachable.has(task.id)).map((task) => task.id)).toEqual([]);
    });

    it('never orders a prerequisite at or after its dependant', () => {
        // `order` is a tiebreak between rows at equal depth, so an inversion would sort a task above
        // something it depends on.
        const inversions = allTasks.flatMap((task) => task.requiredTasks.flatMap((id) => {
            const before = tasksData[id];
            const sameVendor = before && ownerOf(before) === ownerOf(task);
            return sameVendor && before.order >= task.order ? [`${id}>=${task.id}`] : [];
        }));
        expect(inversions).toEqual([]);
    });

    it('holds the published gate counts', () => {
        // A canary on the data rather than on the code: these move only when the database does.
        expect(allTasks.filter((task) => gatesFor(task).trust !== null)).toHaveLength(20);
        expect(allTasks.filter((task) => gatesFor(task).playerLevel !== null)).toHaveLength(18);
    });

    it('locates a known task in its chain', () => {
        expect(locate('gunsmith_2')).not.toBeNull();
    });
});

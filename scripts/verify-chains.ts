/* Stage-01 harness for the tasks rebuild: exercises the chain layout and progress rules against
 * the real 227 tasks. Run: npm run verify-chains */
import { tasksData } from '@/data/tasks';
import { buildChains, locate, MAX_LANE } from '@/app/tasks/utils/chain';
import {
    EMPTY_PROGRESS, countsFor, gatesFor, nextUpIn, objectiveTicks,
    setDone, standingFor, stateOf, toggleObjective,
} from '@/app/tasks/utils/progress';
import { OWNER_ORDER, externalPrereqsOf, populatedOwners, tasksForOwner } from '@/app/tasks/utils/vendors';
import type { TaskProgress } from '@/types/tasks';

let failures = 0;
const fail = (msg: string) => { failures += 1; console.log('  FAIL ' + msg); };

console.log('owners in rail order:', OWNER_ORDER.join(', '));
console.log('populated:', populatedOwners().join(', '));

let laidOut = 0;
const seen = new Set<string>();

for (const owner of populatedOwners()) {
    const { chains, total } = buildChains(owner);
    const nodes = chains.flatMap((c) => c.nodes);
    laidOut += nodes.length;
    nodes.forEach((n) => {
        if (seen.has(n.taskId)) fail(`${n.taskId} laid out twice`);
        seen.add(n.taskId);
    });

    if (nodes.length !== total) fail(`${owner}: ${nodes.length} nodes for ${total} tasks`);
    if (nodes.some((n) => n.lane > MAX_LANE)) fail(`${owner}: lane over cap`);

    // Every edge must run downwards: a prerequisite always sits above its dependant.
    for (const chain of chains) {
        for (const e of chain.edges) {
            if (e.fromIndex >= e.toIndex) fail(`${owner}: edge ${e.from}->${e.to} runs upwards`);
        }
        if (chain.nodes.some((n, i) => n.index !== i)) fail(`${owner}: index/position mismatch`);
    }

    const counts = countsFor(tasksForOwner(owner), EMPTY_PROGRESS);
    const standing = standingFor(owner, EMPTY_PROGRESS);
    const shape = chains.map((c) => `${c.nodes.length}@${tasksData[c.rootTaskId].name}`).join(' + ');
    const lanes = new Set(nodes.map((n) => n.lane));
    console.log(
        `${owner.padEnd(9)} ${String(total).padStart(3)} tasks | chains ${shape}` +
        ` | lanes ${[...lanes].sort().join('/')} | open ${counts.open} locked ${counts.locked}` +
        ` | rep max ${standing.reputationMax}${standing.hasReputation ? '' : ' (no tiers)'}`,
    );
}

if (laidOut !== Object.keys(tasksData).length) {
    fail(`${laidOut} tasks laid out, ${Object.keys(tasksData).length} in the database`);
}

/* Every chain must open on something reachable with nothing done. */
for (const owner of populatedOwners()) {
    for (const chain of buildChains(owner).chains) {
        const root = tasksData[chain.rootTaskId];
        const state = stateOf(root, EMPTY_PROGRESS);
        const external = externalPrereqsOf(root);
        if (state === 'locked' && external.length === 0) {
            fail(`${owner}: chain root ${root.id} is locked with no cross-vendor prerequisite`);
        }
    }
}

/* Walk a whole vendor: completing next-up in a loop must clear every task in the chain. */
let progress: TaskProgress = EMPTY_PROGRESS;
const arkChain = buildChains('ark').chains[0];
let steps = 0;
for (;;) {
    const next = nextUpIn(arkChain, progress);
    if (!next) break;
    progress = setDone(progress, tasksData[next], true);
    if (++steps > 500) { fail('ark walk did not terminate'); break; }
}
const arkCounts = countsFor(tasksForOwner('ark'), progress);
console.log(`ark walk: ${steps} steps, ${arkCounts.completed} done / ${arkCounts.locked} locked left`);

/*
 * Anything still locked must trace back to a cross-vendor gate. ARK stalls at `ark_59`, which needs
 * Regiment's `regiment_16` — the two vendors interleave — so the block is transitive and the check
 * has to walk the prerequisites rather than look at the stuck task alone.
 */
const gatedByOtherVendor = (id: string, seenIds = new Set<string>()): boolean => {
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    if (externalPrereqsOf(tasksData[id]).length > 0) return true;
    return tasksData[id].requiredTasks.some((prereq) => gatedByOtherVendor(prereq, seenIds));
};

if (arkCounts.locked > 0) {
    const stuck = tasksForOwner('ark').filter((t) => stateOf(t, progress) === 'locked');
    const unexplained = stuck.filter((t) => !gatedByOtherVendor(t.id));
    console.log(`  ${stuck.length} still locked, all traced to a cross-vendor gate: ${unexplained.length === 0}`);
    if (unexplained.length > 0) fail(`ark: locked with no external gate — ${unexplained.map((t) => t.id).join(',')}`);
}

/* Objective ticking. */
const sample = Object.values(tasksData).find(
    (t) => t.objectives.length > 2 && stateOf(t, EMPTY_PROGRESS) === 'open',
)!;
let p2: TaskProgress = EMPTY_PROGRESS;
sample.objectives.forEach((_, i) => { p2 = toggleObjective(p2, sample, i); });
if (stateOf(sample, p2) !== 'completed') fail('ticking every objective did not complete the task');
p2 = toggleObjective(p2, sample, 0);
if (stateOf(sample, p2) === 'completed') fail('un-ticking an objective left the task completed');
if (objectiveTicks(sample, p2).filter(Boolean).length !== sample.objectives.length - 1) {
    fail('objective ticks did not survive un-completing');
}
let p3 = setDone(EMPTY_PROGRESS, sample, true);
if (objectiveTicks(sample, p3).some((t) => !t)) fail('marking done did not tick every objective');
p3 = setDone(p3, sample, false);
if (Object.keys(p3.tasks).length !== 0) fail('undo left a record behind');

/* Data-shaped spot checks. */
const gated = Object.values(tasksData).filter((t) => gatesFor(t).trust !== null);
const levelled = Object.values(tasksData).filter((t) => gatesFor(t).playerLevel !== null);
console.log(`gates: ${levelled.length} level, ${gated.length} trust`);
if (gated.length !== 20 || levelled.length !== 18) fail('gate counts moved — check the data');

const located = locate('gunsmith_2');
console.log('locate gunsmith_2:', located ? `row ${located.node.index + 1} of ${located.chain.nodes.length}` : 'null');
if (!located) fail('locate() failed on a known task');

console.log(failures === 0 ? '\nOK — no failures' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);

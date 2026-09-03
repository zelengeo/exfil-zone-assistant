/* Stage-01 harness for the tasks rebuild: exercises the chain layout and progress rules against
 * the real 227 tasks. Run: npm run verify-chains */
import { tasksData } from '@/data/tasks';
import {
    ELBOW_RISE, LOCKED_TAIL, MAX_LANE, NODE_GAP, ROW_H, ROW_H_COMPACT,
    buildChains, laneX, locate, rowTextX, visibleRows,
} from '@/app/tasks/utils/chain';
import {
    EMPTY_PROGRESS, countsFor, gatesFor, nextUpIn, objectiveTicks,
    setDone, standingFor, stateOf, toggleObjective,
} from '@/app/tasks/utils/progress';
import { OWNER_ORDER, externalPrereqsOf, ownerOf, populatedOwners, tasksForOwner } from '@/app/tasks/utils/vendors';
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

/* --------------------------------------------------------------------------
 * Stage 03 — what the chain column draws
 * ----------------------------------------------------------------------- */

const lockedAt = (progress: TaskProgress) => (taskId: string) =>
    stateOf(tasksData[taskId], progress) === 'locked';

for (const owner of populatedOwners()) {
    for (const chain of buildChains(owner).chains) {
        // A branch steps out one lane at a time and rejoins; nothing may jump a lane.
        for (const e of chain.edges) {
            if (e.toLane > e.fromLane + 1) fail(`${owner}: edge ${e.from}->${e.to} jumps ${e.fromLane}->${e.toLane}`);
            if (e.toLane < 0 || e.fromLane < 0) fail(`${owner}: negative lane`);
        }

        // The spine has to stay the main line. Handing lane 0 to whichever successor was drawn
        // first put 23 of the gunsmith's 25 rows on the branch, beside an empty spine.
        const branchRows = chain.nodes.filter((n) => n.lane > 0).length;
        if (branchRows * 2 > chain.nodes.length) {
            fail(`${owner}: ${branchRows} of ${chain.nodes.length} rows are on the branch`);
        }

        // Rows must clear their own marker, whichever lane they sit in.
        for (const node of chain.nodes) {
            if (rowTextX(node.lane) <= laneX(node.lane)) fail(`${owner}: row text overlaps its marker`);
        }

        const { shown, hidden } = visibleRows(chain.nodes, lockedAt(EMPTY_PROGRESS));
        if (shown.length + hidden !== chain.nodes.length) fail(`${owner}: collapse lost rows`);
        if (hidden > 0 && shown.length < LOCKED_TAIL) fail(`${owner}: collapsed too aggressively`);

        // The selected task is never folded away, even at the very bottom of the tail.
        const last = chain.nodes[chain.nodes.length - 1];
        const withSelection = visibleRows(chain.nodes, lockedAt(EMPTY_PROGRESS), last.taskId);
        if (!withSelection.shown.some((node) => node.taskId === last.taskId)) {
            fail(`${owner}: collapse hid the selected task`);
        }

        // Nothing to fold away when nothing is locked. Stated as a predicate rather than by walking
        // a chain to completion: several chains cannot be finished from inside themselves, because
        // a task partway down waits on another vendor.
        if (visibleRows(chain.nodes, () => false).hidden !== 0) {
            fail(`${owner}: a chain with nothing locked still collapses`);
        }
    }
}

/*
 * Row heights. The phone raises the row to 44px, and the spine is arithmetic on that number rather
 * than on a constant, so both heights have to leave the connectors drawable.
 */
for (const rowH of [ROW_H, ROW_H_COMPACT]) {
    // A straight edge between adjacent rows: it starts below one marker and ends above the next.
    if (NODE_GAP * 2 >= rowH) fail(`row height ${rowH}: the node gaps swallow the connector`);

    // A lane change turns just above the row it lands on — below the marker it left, and clear of
    // the one it is heading for.
    if (ELBOW_RISE <= NODE_GAP) fail(`row height ${rowH}: the elbow strikes the marker it lands on`);
    if (ELBOW_RISE >= rowH - NODE_GAP) fail(`row height ${rowH}: the elbow turns above the row it left`);
}

// The phone's row is a thumb target, not a line of text.
if (ROW_H_COMPACT < 44) fail(`compact rows are ${ROW_H_COMPACT}px, under the 44px minimum`);
if (ROW_H_COMPACT <= ROW_H) fail('the compact row is not taller than the desktop row');

for (const owner of ['ark', 'gunsmith', 'trupiks'] as const) {
    for (const chain of buildChains(owner).chains) {
        const { shown, hidden } = visibleRows(chain.nodes, lockedAt(EMPTY_PROGRESS));
        const branch = chain.nodes.filter((n) => n.lane > 0).length;
        const joins = chain.nodes.filter((n) => chain.edges.filter((e) => e.to === n.taskId).length > 1).length;
        const fan = Math.max(...chain.nodes.map((n) => chain.edges.filter((e) => e.from === n.taskId).length));
        console.log(
            `${owner.padEnd(9)} chain @${tasksData[chain.rootTaskId].name}: ${chain.nodes.length} rows,` +
            ` ${branch} on the branch, ${joins} joins, ${chain.edges.length} edges, widest fan ${fan}` +
            ` | column draws ${shown.length}, folds ${hidden}`,
        );
    }
}

/* --------------------------------------------------------------------------
 * The database as a whole
 *
 * Per-vendor walks stall on purpose — the vendors interleave — so the question of whether the
 * campaign is finishable can only be asked across all seven at once.
 * ----------------------------------------------------------------------- */

const dangling = Object.values(tasksData).flatMap((task) =>
    task.requiredTasks.filter((id) => !tasksData[id]).map((id) => `${task.id}<-${id}`));
if (dangling.length > 0) fail(`prerequisites pointing at a task that does not exist: ${dangling.join(', ')}`);

const reachable = new Set<string>();
let rounds = 0;
for (let moved = true; moved; rounds += 1) {
    moved = false;
    for (const task of Object.values(tasksData)) {
        if (reachable.has(task.id)) continue;
        if (task.requiredTasks.every((id) => reachable.has(id))) {
            reachable.add(task.id);
            moved = true;
        }
    }
}
console.log(`whole campaign: ${reachable.size} of ${Object.keys(tasksData).length} reachable in ${rounds} rounds`);
if (reachable.size !== Object.keys(tasksData).length) {
    const stuck = Object.values(tasksData).filter((task) => !reachable.has(task.id));
    fail(`${stuck.length} tasks can never be completed — ${stuck.slice(0, 5).map((t) => t.id).join(', ')}`);
}

/*
 * `order` must never put a prerequisite after the task that needs it. It is a tiebreak between rows
 * at equal depth, so an inversion would sort a task above something it depends on.
 */
let inversions = 0;
for (const task of Object.values(tasksData)) {
    for (const prereq of task.requiredTasks) {
        const before = tasksData[prereq];
        if (before && ownerOf(before) === ownerOf(task) && before.order >= task.order) inversions += 1;
    }
}
console.log(`order inversions: ${inversions}`);
if (inversions > 0) fail(`${inversions} prerequisites are ordered at or after their dependant`);

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

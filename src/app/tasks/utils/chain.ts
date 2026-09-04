import { loadedTasks } from '@/services/TaskService';
import type { Task } from '@/types/tasks';
import { type ChainOwner, ownerOf, tasksForOwner } from './vendors';

/**
 * A vendor's tasks, laid out as the spine the route draws.
 *
 * Pure and progress-free: what a player has done changes how a row is *painted*, never where it
 * sits, so the layout is computed once per owner and memoised. The component reads `nodes` and
 * `edges` and derives every coordinate from them; nothing re-walks the graph.
 *
 * The ordering is topological, not `order`. That field looks like a sequence and is not one: 25 of
 * the 227 tasks collide on it, 19 of them in the gunsmith, whose 19 `research_*` bench tasks run
 * parallel to the story chain and reuse the numbers 1-25. Sorting by it puts two different tasks in
 * the same slot and hides the branch structure, which is why the gunsmith panel is unreadable
 * today. `order` survives here only as a tiebreak between tasks at equal depth, where it is the
 * authored intent and better than sorting by name.
 *
 * Cross-owner prerequisites are excluded from the graph — see `externalPrereqsOf`.
 */

/** Row height, and the lane geometry the spine is drawn on. One source for rows and SVG alike. */
export const ROW_H = 38;
/** The phone's row: 44px, so a row clears the minimum touch target on its own. */
export const ROW_H_COMPACT = 44;
export const LANE_X = 16;
export const LANE_STEP = 18;
/** Lane 0 is the spine, lane 1 the branch beside it. Deeper branches fold back onto lane 1. */
export const MAX_LANE = 1;

/** Centre of a lane, in the row's own coordinates. The spine and the row markers share it. */
export const laneX = (lane: number): number => LANE_X + lane * LANE_STEP;

/** Where a row's text starts: clear of its own marker, whichever lane it sits in. */
export const rowTextX = (lane: number): number => laneX(lane) + 30;

/** Clearance around a node, so a connector stops short of the marker instead of striking it. */
export const NODE_GAP = 8;
/** Where the elbow of a lane change sits: just above the row it lands on. */
export const ELBOW_RISE = 13;

export interface ChainNode {
    taskId: string;
    /** 0 is the spine. */
    lane: number;
    /** Longest path from a root of this chain. Layer, not row. */
    depth: number;
    /** Row position within the chain — what "task 06 of 35" counts, since `order` cannot. */
    index: number;
}

export interface ChainEdge {
    from: string;
    to: string;
    fromIndex: number;
    fromLane: number;
    toIndex: number;
    toLane: number;
}

export interface Chain {
    /** Stable across renders: the root task's id. */
    key: string;
    /** The task the chain opens on. Every component in the data has exactly one. */
    rootTaskId: string;
    nodes: ChainNode[];
    edges: ChainEdge[];
}

export interface OwnerChains {
    owner: ChainOwner;
    chains: Chain[];
    /** Every task of this owner, whether or not it sits in a chain. */
    total: number;
}

/** Prerequisites of `task` that belong to the same owner — the only edges the spine draws. */
function internalPrereqs(task: Task, ids: Set<string>): string[] {
    return task.requiredTasks.filter((id) => ids.has(id));
}

/**
 * Longest-path depth. Memoised, with a visited guard.
 *
 * Every per-owner graph in the current data is a verified DAG, so the guard is not load-bearing —
 * it is there so a future data drop that introduces a cycle renders a slightly wrong chain instead
 * of hanging the browser.
 */
function depthMap(tasks: Task[], ids: Set<string>): Map<string, number> {
    const depths = new Map<string, number>();
    const visiting = new Set<string>();

    const walk = (id: string): number => {
        const known = depths.get(id);
        if (known !== undefined) return known;
        if (visiting.has(id)) return 0;

        visiting.add(id);
        const task = loadedTasks()[id];
        let depth = 0;
        for (const prereq of internalPrereqs(task, ids)) {
            depth = Math.max(depth, walk(prereq) + 1);
        }
        visiting.delete(id);

        depths.set(id, depth);
        return depth;
    };

    tasks.forEach((task) => walk(task.id));
    return depths;
}

/**
 * Weakly-connected components over internal edges — a vendor can run more than one chain.
 *
 * An owner with no internal edges at all comes back as one group rather than as one component per
 * task. That is the dailies: eight standalone contracts with no prerequisites, which are a list and
 * not eight chains of one.
 */
function components(tasks: Task[], ids: Set<string>): Task[][] {
    if (!tasks.some((task) => internalPrereqs(task, ids).length > 0)) return [tasks];

    const parent = new Map<string, string>(tasks.map((task) => [task.id, task.id]));

    const find = (id: string): string => {
        let root = id;
        while (parent.get(root) !== root) root = parent.get(root) as string;
        // Path compression, so a 31-deep chain does not walk the whole spine per lookup.
        let step = id;
        while (parent.get(step) !== root) {
            const next = parent.get(step) as string;
            parent.set(step, root);
            step = next;
        }
        return root;
    };

    for (const task of tasks) {
        for (const prereq of internalPrereqs(task, ids)) {
            parent.set(find(task.id), find(prereq));
        }
    }

    const groups = new Map<string, Task[]>();
    for (const task of tasks) {
        const root = find(task.id);
        const group = groups.get(root);
        if (group) group.push(task);
        else groups.set(root, [task]);
    }
    return [...groups.values()];
}

/**
 * How much chain is left below a task — the longest path downwards, in rows.
 *
 * This is what decides which successor keeps the spine. Without it a fork hands lane 0 to whichever
 * successor is drawn first, and if that one is a leaf, the entire rest of the chain is drawn as a
 * branch: the gunsmith's first chain put 23 of its 25 rows in lane 1 beside an empty spine.
 */
function heightMap(tasks: Task[], ids: Set<string>): Map<string, number> {
    const children = new Map<string, string[]>();
    for (const task of tasks) {
        for (const prereq of internalPrereqs(task, ids)) {
            const list = children.get(prereq);
            if (list) list.push(task.id);
            else children.set(prereq, [task.id]);
        }
    }

    const heights = new Map<string, number>();
    const visiting = new Set<string>();

    const walk = (id: string): number => {
        const known = heights.get(id);
        if (known !== undefined) return known;
        if (visiting.has(id)) return 0;

        visiting.add(id);
        let height = 0;
        for (const child of children.get(id) ?? []) height = Math.max(height, walk(child) + 1);
        visiting.delete(id);

        heights.set(id, height);
        return height;
    };

    tasks.forEach((task) => walk(task.id));
    return heights;
}

/**
 * Lane assignment.
 *
 * A task keeps its parent's lane when it carries the longest continuation of that parent, and steps
 * one lane right otherwise — which is the branch the design draws stepping out of the spine. Sorting
 * by remaining depth rather than by draw order is what keeps the main line straight: the side quest
 * is the shorter of the two, whichever the data happens to list first.
 *
 * A task with more than one prerequisite is a join and returns to lane 0, which is what brings a
 * branch back in. Beyond `MAX_LANE` the branch stays where it is rather than marching off the
 * column; the gunsmith, with a three-way fork off its root, is the one to watch this on.
 */
function assignLanes(ordered: Task[], ids: Set<string>, heights: Map<string, number>): Map<string, number> {
    // The successor that inherits each parent's lane: the deepest, with the authored order as a
    // tiebreak so two equally long continuations resolve the same way on every render.
    const spineChild = new Map<string, string>();
    for (const task of ordered) {
        for (const parent of internalPrereqs(task, ids)) {
            const held = spineChild.get(parent);
            if (held === undefined || (heights.get(task.id) ?? 0) > (heights.get(held) ?? 0)) {
                spineChild.set(parent, task.id);
            }
        }
    }

    const lanes = new Map<string, number>();

    for (const task of ordered) {
        const prereqs = internalPrereqs(task, ids);

        if (prereqs.length !== 1) {
            lanes.set(task.id, 0);
            continue;
        }

        const [parent] = prereqs;
        const parentLane = lanes.get(parent) ?? 0;
        const keepsSpine = spineChild.get(parent) === task.id;

        lanes.set(task.id, keepsSpine ? parentLane : Math.min(parentLane + 1, MAX_LANE));
    }

    return lanes;
}

function buildChain(group: Task[], ids: Set<string>, depths: Map<string, number>): Chain {
    const heights = heightMap(group, ids);
    const ordered = [...group].sort((a, b) => {
        const byDepth = (depths.get(a.id) ?? 0) - (depths.get(b.id) ?? 0);
        if (byDepth !== 0) return byDepth;
        // `order` is intent within a layer, and a tiebreak only. Name settles the collisions.
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
    });

    const lanes = assignLanes(ordered, ids, heights);
    const nodes: ChainNode[] = ordered.map((task, index) => ({
        taskId: task.id,
        lane: lanes.get(task.id) ?? 0,
        depth: depths.get(task.id) ?? 0,
        index,
    }));

    const byId = new Map(nodes.map((node) => [node.taskId, node]));
    const edges: ChainEdge[] = [];
    for (const task of ordered) {
        const to = byId.get(task.id);
        if (!to) continue;
        for (const prereqId of internalPrereqs(task, ids)) {
            const from = byId.get(prereqId);
            if (!from) continue;
            edges.push({
                from: from.taskId,
                to: to.taskId,
                fromIndex: from.index,
                fromLane: from.lane,
                toIndex: to.index,
                toLane: to.lane,
            });
        }
    }

    return { key: nodes[0].taskId, rootTaskId: nodes[0].taskId, nodes, edges };
}

const cache = new Map<ChainOwner, OwnerChains>();

export function buildChains(owner: ChainOwner): OwnerChains {
    const cached = cache.get(owner);
    if (cached) return cached;

    const tasks = tasksForOwner(owner);
    const ids = new Set(tasks.map((task) => task.id));
    const depths = depthMap(tasks, ids);

    const chains = components(tasks, ids)
        .map((group) => buildChain(group, ids, depths))
        // The main chain first, then side chains. Size settles it everywhere in the current data;
        // `order` of the root breaks a tie without falling back on insertion order.
        .sort((a, b) => {
            const bySize = b.nodes.length - a.nodes.length;
            if (bySize !== 0) return bySize;
            const db = loadedTasks();
            return db[a.rootTaskId].order - db[b.rootTaskId].order;
        });

    const built: OwnerChains = { owner, chains, total: tasks.length };
    cache.set(owner, built);
    return built;
}

/**
 * How far past the frontier a chain shows its locked tail before collapsing the rest.
 *
 * Some chains run thirty rows past anything reachable today. The first dozen are what you are
 * working towards; the rest is a wall.
 */
export const LOCKED_TAIL = 12;

export interface VisibleRows {
    shown: ChainNode[];
    /** Rows folded away. Zero when the whole chain is on screen. */
    hidden: number;
}

/**
 * The rows a chain draws, with its locked tail folded away.
 *
 * Takes a predicate rather than a `TaskProgress` so the rule stays a layout decision: the tail is
 * the run of unreachable rows at the bottom, whatever made them unreachable. The selected task is
 * always kept, so the column never hides the task the detail pane is showing.
 */
export function visibleRows(
    nodes: ChainNode[],
    isLocked: (taskId: string) => boolean,
    selectedTaskId?: string,
): VisibleRows {
    let tail = 0;
    for (let index = nodes.length - 1; index >= 0; index -= 1) {
        const { taskId } = nodes[index];
        if (!isLocked(taskId) || taskId === selectedTaskId) {
            tail = index + 1;
            break;
        }
    }

    const selected = nodes.findIndex((node) => node.taskId === selectedTaskId);
    const keep = Math.max(Math.min(nodes.length, tail + LOCKED_TAIL), selected + 1);
    const hidden = nodes.length - keep;

    return hidden > 0 ? { shown: nodes.slice(0, keep), hidden } : { shown: nodes, hidden: 0 };
}

/** The chain a task sits in, and its node — what the detail pane's "task 06 of 35" reads. */
export function locate(taskId: string): { chain: Chain; node: ChainNode } | null {
    const task = loadedTasks()[taskId];
    if (!task) return null;

    for (const chain of buildChains(ownerOf(task)).chains) {
        const node = chain.nodes.find((candidate) => candidate.taskId === taskId);
        if (node) return { chain, node };
    }
    return null;
}

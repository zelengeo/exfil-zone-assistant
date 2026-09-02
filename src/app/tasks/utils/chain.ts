import { tasksData } from '@/data/tasks';
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
export const ROW_H_COMPACT = 44;
export const LANE_X = 16;
export const LANE_STEP = 18;
/** Lane 0 is the spine, lane 1 the branch beside it. Deeper branches fold back onto lane 1. */
export const MAX_LANE = 1;

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
        const task = tasksData[id];
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
 * Lane assignment.
 *
 * A task inherits its parent's lane when it is that parent's first placed successor, and steps one
 * lane right when it is a later one — which is the branch the design draws stepping out of the
 * spine. A task with more than one prerequisite is a join and returns to lane 0, which is what
 * brings a branch back in. Beyond `MAX_LANE` the branch stays where it is rather than marching off
 * the column; the densest graph in the data (the gunsmith, 8 branch nodes inside a depth of 15) is
 * the one to watch this on.
 */
function assignLanes(ordered: Task[], ids: Set<string>): Map<string, number> {
    const lanes = new Map<string, number>();
    const placedChildren = new Set<string>();

    for (const task of ordered) {
        const prereqs = internalPrereqs(task, ids);

        if (prereqs.length === 0 || prereqs.length > 1) {
            lanes.set(task.id, 0);
            prereqs.forEach((id) => placedChildren.add(id));
            continue;
        }

        const [parent] = prereqs;
        const parentLane = lanes.get(parent) ?? 0;
        const isFirstChild = !placedChildren.has(parent);
        placedChildren.add(parent);

        lanes.set(task.id, isFirstChild ? parentLane : Math.min(parentLane + 1, MAX_LANE));
    }

    return lanes;
}

function buildChain(group: Task[], ids: Set<string>, depths: Map<string, number>): Chain {
    const ordered = [...group].sort((a, b) => {
        const byDepth = (depths.get(a.id) ?? 0) - (depths.get(b.id) ?? 0);
        if (byDepth !== 0) return byDepth;
        // `order` is intent within a layer, and a tiebreak only. Name settles the collisions.
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
    });

    const lanes = assignLanes(ordered, ids);
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
            return tasksData[a.rootTaskId].order - tasksData[b.rootTaskId].order;
        });

    const built: OwnerChains = { owner, chains, total: tasks.length };
    cache.set(owner, built);
    return built;
}

/** The chain a task sits in, and its node — what the detail pane's "task 06 of 35" reads. */
export function locate(taskId: string): { chain: Chain; node: ChainNode } | null {
    const task = tasksData[taskId];
    if (!task) return null;

    for (const chain of buildChains(ownerOf(task)).chains) {
        const node = chain.nodes.find((candidate) => candidate.taskId === taskId);
        if (node) return { chain, node };
    }
    return null;
}

import { tasksData } from '@/data/tasks';
import type { Task, TaskProgress, TaskRecord, TaskState } from '@/types/tasks';
import type { Chain } from './chain';
import { type ChainOwner, ownerFace, tasksForOwner } from './vendors';

/**
 * What a player has done, and what that makes each task.
 *
 * Everything here is a pure function of a `TaskProgress` and the task database. Nothing reaches for
 * storage, nothing caches — the record is small (a handful of touched tasks) and the graph walk is
 * one level deep, so a component can call these freely inside a `useMemo`.
 *
 * The write helpers return a new `TaskProgress` rather than mutating, because the value is React
 * state and is persisted by watching it change.
 */

export const EMPTY_PROGRESS: TaskProgress = { tasks: {} };

export function recordFor(progress: TaskProgress, taskId: string): TaskRecord | undefined {
    return progress.tasks[taskId];
}

export function isDone(progress: TaskProgress, taskId: string): boolean {
    return progress.tasks[taskId]?.done === true;
}

/**
 * One flag per objective, always the length of `task.objectives`.
 *
 * A completed task reads as fully ticked whatever the array holds, so marking a task done from the
 * chain row — where the objectives are not even on screen — does not leave the pane showing three
 * of four objectives against a completed task.
 */
export function objectiveTicks(task: Task, progress: TaskProgress): boolean[] {
    const record = progress.tasks[task.id];
    if (!record) return task.objectives.map(() => false);
    return task.objectives.map((_, index) => record.done || record.objectives[index] === true);
}

export function objectivesDone(task: Task, progress: TaskProgress): number {
    return objectiveTicks(task, progress).filter(Boolean).length;
}

/**
 * How a task reads right now.
 *
 * Prerequisites are checked across every owner, not just this one: 16 tasks are gated by another
 * vendor's work, and treating those as met would show a task as open that the game will not offer.
 *
 * `requiredPlayerLevel` and `requiredTrust` are deliberately not consulted. The app cannot see a
 * player's level or loyalty, so enforcing them would lock tasks on a guess; they are rendered as
 * gate chips instead — information, not a lock, the rule the rest of the app already follows.
 */
export function stateOf(task: Task, progress: TaskProgress): TaskState {
    if (isDone(progress, task.id)) return 'completed';

    const blocked = task.requiredTasks.some((id) => !isDone(progress, id));
    return blocked ? 'locked' : 'open';
}

export function countsFor(tasks: Task[], progress: TaskProgress): Record<TaskState, number> {
    const counts: Record<TaskState, number> = { completed: 0, open: 0, locked: 0 };
    for (const task of tasks) counts[stateOf(task, progress)] += 1;
    return counts;
}

/**
 * The task a chain is waiting on: its first open one in row order.
 *
 * A property of the chain rather than of a task, which is why it is not a `TaskState` — a task can
 * be open in two chains' worth of context and be "next up" in neither.
 */
export function nextUpIn(chain: Chain, progress: TaskProgress): string | null {
    for (const node of chain.nodes) {
        const task = tasksData[node.taskId];
        if (task && stateOf(task, progress) === 'open') return node.taskId;
    }
    return null;
}

/* --------------------------------------------------------------------------
 * Writes
 *
 * Objectives and completion are kept consistent in one place, so no caller has to remember the
 * rule: finishing the last objective finishes the task, and un-finishing the task clears the ticks.
 * ----------------------------------------------------------------------- */

function withRecord(progress: TaskProgress, taskId: string, record: TaskRecord): TaskProgress {
    return { tasks: { ...progress.tasks, [taskId]: record } };
}

function without(progress: TaskProgress, taskId: string): TaskProgress {
    // An untouched task should leave no trace, so undoing everything empties the store rather than
    // filling it with all-false records.
    const tasks = { ...progress.tasks };
    delete tasks[taskId];
    return { tasks };
}

/**
 * Whether the player can record work on this task yet.
 *
 * A locked task cannot be ticked. Recording one done while its prerequisites are not would leave
 * the chain describing something the game will not let you do, and every count downstream — the
 * vendor's standing, the campaign total, which task is next up — would be counting it.
 *
 * Un-recording is always allowed, so there is no way to get stuck: undo the prerequisite and the
 * tasks that depended on it are simply locked again.
 */
export function canComplete(task: Task, progress: TaskProgress): boolean {
    return stateOf(task, progress) !== 'locked';
}

export function setDone(progress: TaskProgress, task: Task, done: boolean): TaskProgress {
    if (!done) return without(progress, task.id);
    if (!canComplete(task, progress)) return progress;
    return withRecord(progress, task.id, { done: true, objectives: task.objectives.map(() => true) });
}

export function toggleObjective(progress: TaskProgress, task: Task, index: number): TaskProgress {
    if (index < 0 || index >= task.objectives.length) return progress;
    if (!canComplete(task, progress)) return progress;

    const ticks = objectiveTicks(task, progress);
    ticks[index] = !ticks[index];

    const allTicked = ticks.length > 0 && ticks.every(Boolean);
    if (!allTicked && ticks.every((tick) => !tick)) return without(progress, task.id);

    return withRecord(progress, task.id, { done: allTicked, objectives: ticks });
}

/* --------------------------------------------------------------------------
 * Standing with a vendor
 * ----------------------------------------------------------------------- */

export interface Standing {
    owner: ChainOwner;
    done: number;
    total: number;
    /** Reputation earned so far, and the most this vendor's tasks can pay out. */
    reputation: number;
    reputationMax: number;
    /** Loyalty level, 1-4. Always 1 where the vendor publishes no tiers. */
    level: number;
    /** Reputation at which the next level lands, or null at the top — or where there are none. */
    nextLevelAt: number | null;
    hasReputation: boolean;
}

/**
 * Where a player stands with one owner.
 *
 * Reputation is summed from the owner's own tasks. Every reputation reward in the database credits
 * the corp that issued the task — all 227 checked — so there is no need to scan the whole database
 * for stray grants. Trupik's pays no reputation and publishes no tiers, which is a fact about the
 * vendor and not a gap: `hasReputation` is false and the rail prints no bar rather than "0/0".
 */
export function standingFor(owner: ChainOwner, progress: TaskProgress): Standing {
    const face = ownerFace(owner);
    const tasks = tasksForOwner(owner);

    let done = 0;
    let reputation = 0;
    let reputationMax = 0;

    for (const task of tasks) {
        const complete = isDone(progress, task.id);
        if (complete) done += 1;

        for (const reward of task.reward) {
            if (reward.type !== 'reputation' || reward.corpId !== owner) continue;
            reputationMax += reward.quantity;
            if (complete) reputation += reward.quantity;
        }
    }

    const level = face.levelCap.filter((cap) => reputation >= cap).length + 1;

    return {
        owner,
        done,
        total: tasks.length,
        reputation,
        reputationMax,
        level,
        nextLevelAt: face.levelCap.find((cap) => cap > reputation) ?? null,
        hasReputation: face.hasReputation && reputationMax > 0,
    };
}

/* --------------------------------------------------------------------------
 * Gates
 * ----------------------------------------------------------------------- */

export interface TaskGates {
    /** Character level the game asks for. Null where the task asks for none. */
    playerLevel: number | null;
    /** Loyalty the issuing vendor asks for, 1-4. Null where the task asks for none. */
    trust: { owner: ChainOwner; level: number } | null;
}

/**
 * What the game asks for beyond finished prerequisites.
 *
 * 18 tasks name a character level and 20 a loyalty level; the loyalty one has never been rendered
 * anywhere in the app. Both are shown and neither is enforced — see `stateOf`.
 */
export function gatesFor(task: Task): TaskGates {
    return {
        playerLevel: task.requiredPlayerLevel > 0 ? task.requiredPlayerLevel : null,
        trust: task.requiredTrust > 0 && task.corpId
            ? { owner: task.corpId as ChainOwner, level: task.requiredTrust }
            : null,
    };
}

export function hasGates(task: Task): boolean {
    const gates = gatesFor(task);
    return gates.playerLevel !== null || gates.trust !== null;
}

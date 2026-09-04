/**
 * What a task is, and what a player has done to one — two different questions, kept apart.
 *
 * The published shape is defined once, as the zod schema in `lib/schemas/task.ts`, and re-exported
 * here so that `@/types/tasks` stays the import path the app reads. It used to be declared twice:
 * an interface here and an inferred `ITask` there, which is the exact pair critical rule 4 and
 * [ADR 0002](../../docs/adr/0002-zod-schemas-are-the-source-of-truth-for-types.md) forbid. The
 * schema won because it is the one of the two that also validates `public/data/tasks.json` when
 * `TaskService` loads it.
 *
 * Everything below the re-exports is progress, which is this app's own idea and has no published
 * counterpart.
 */
export type {
    ITask as Task,
    TaskMap,
    TaskReward,
    TaskType,
    TaskVideoGuide,
    TasksDatabase,
} from '@/lib/schemas/task';

/* --------------------------------------------------------------------------
 * Progress
 *
 * Two vocabularies, and keeping them apart is the point.
 *
 * `TaskRecord` is what the player did — ticked an objective, marked a task done. It is the only
 * thing written to storage, and it holds nothing that can be worked out from the task database.
 * `TaskState` is how a task reads right now, derived from that record plus the prerequisite graph
 * every time it is asked for. The old shape stored a status string per task, which meant storage
 * held `'locked'` for tasks that were no longer locked and had to be reconciled on read.
 *
 * The route derives one further distinction that is deliberately not in either: "next up", the
 * first open task in a chain. It belongs to a chain, not to a task, so it cannot be a state.
 * ----------------------------------------------------------------------- */

/** What a player has done to one task. Absent from the record means untouched. */
export interface TaskRecord {
    /** Ticked objectives, by index into `Task.objectives`. May be shorter than that array. */
    objectives: boolean[];
    /** Set when the player marked the whole task done. */
    done: boolean;
}

export interface TaskProgress {
    tasks: Record<string, TaskRecord>;
}

/** How a task reads right now. Derived on every read, never stored. */
export type TaskState = 'completed' | 'open' | 'locked';

/**
 * Storage is a text file a player can edit, so anything read back out of it is checked.
 *
 * This deliberately rejects the pre-rebuild shape (`Record<string, 'completed' | 'active' |
 * 'locked'>`), which resets progress that predates several wipes rather than trying to migrate it.
 */
export const isTaskProgress = (value: unknown): value is TaskProgress => {
    if (typeof value !== 'object' || value === null) return false;

    const obj = value as Record<string, unknown>;
    if (!('tasks' in obj) || typeof obj.tasks !== 'object' || obj.tasks === null) return false;

    for (const record of Object.values(obj.tasks as Record<string, unknown>)) {
        if (typeof record !== 'object' || record === null) return false;
        const { objectives, done } = record as Partial<TaskRecord>;
        if (typeof done !== 'boolean') return false;
        if (!Array.isArray(objectives) || objectives.some((tick) => typeof tick !== 'boolean')) return false;
    }

    return true;
};

export type TaskStatus = 'completed' | 'active' | 'locked' ;

export interface UserProgress {
    tasks: Record<string, TaskStatus>;
}

export const isUserProgress = (value: unknown): value is UserProgress => {
    // Check if value is an object and not null
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    // Check if it has a 'tasks' property
    const obj = value as Record<string, unknown>;
    if (!('tasks' in obj) || typeof obj.tasks !== 'object' || obj.tasks === null) {
        return false;
    }

    // Validate each entry in tasks
    const validStatuses: TaskStatus[] = ['completed', 'active', 'locked'];
    const tasks = obj.tasks as Record<string, unknown>;

    for (const status of Object.values(tasks)) {
        if (typeof status !== 'string' || !validStatuses.includes(status as TaskStatus)) {
            return false;
        }
    }

    return true;
};

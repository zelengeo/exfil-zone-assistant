export interface TaskReward {
    type: 'money' | 'reputation' | 'experience' | 'item';
    quantity: number;
    corpId?: string; // For reputation rewards
    item_name?: string; // Temp for item rewards
    item_id?: string; // Item rewards
}

export type TaskType =
    | 'reach'
    | 'extract'
    | 'retrieve'
    | 'eliminate'
    | 'submit'
    | 'mark'
    | 'place'
    | 'photo'
    | 'signal'
    /** Bench work for Anna rather than a field objective. Arrived with the 227-task extraction. */
    | 'gunsmith';

export type TaskVideoGuide = { author: string, ytId: string, startTs?: number, endTs?: number }

export type TaskMap =
    | 'suburb'
    | 'resort'
    | 'dam'
    | 'metro'
    /** The fifth map, added by the 227-task extraction. */
    | 'smuggling'
    | 'any';

export interface Task {
    id: string;
    name: string;
    gameId: string;
    description: string;
    objectives: string[];
    corpId: string;
    type: TaskType[];
    map: TaskMap[];
    reward: TaskReward[];
    preReward: TaskReward[];
    requiredTasks: string[];
    /** Renamed from `requiredLevel` by the 227-task extraction. */
    requiredPlayerLevel: number;
    /** Loyalty level with the issuing corp, 0-4. New with the same extraction. */
    requiredTrust: number;
    tips: string;
    videoGuides: TaskVideoGuide[];
    order: number;
}

export interface TasksDatabase {
    [key: string]: Task;
}

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


// Interface for merchant information
export interface Corp {
    name: string;
    icon: string;
    merchant: string;
    merchantIcon: string;
    ogImage: string;
    levelCap: number[];
}

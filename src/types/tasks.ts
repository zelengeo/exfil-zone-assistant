export interface TaskReward {
    type: 'money' | 'reputation' | 'experience' | 'item';
    quantity: number;
    corpId?: string; // For reputation rewards
    item_name?: string; // Temp for item rewards
    item_id?: string; // Item rewards
}

export type TaskType = 'reach' | 'extract' | 'retrieve' | 'eliminate' | 'submit' | 'mark' | 'place' | 'photo' | "signal";

export type TaskVideoGuide = { author: string, ytId: string, startTs?: number, endTs?: number }

export type TaskMap = 'suburb' | 'resort' | 'dam' | 'metro' | 'any';

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
    requiredLevel: number;
    tips: string;
    videoGuides: TaskVideoGuide[];
    order: number;
}

export interface TasksDatabase {
    [key: string]: Task;
}

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

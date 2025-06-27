export interface TaskReward {
    type: 'money' | 'reputation' | 'experience' | 'item';
    quantity: number;
    corpId?: string; // For reputation rewards
    item_name?: string; // Temp for item rewards
    item_id?: string; // Item rewards
}

export type TaskType = 'arrive' | 'extract' | 'retrieve' | 'elimination' | 'submit' | 'mark' | 'place' | 'photo';

export type TaskMap = 'suburb' | 'resort' | 'dam' | 'metro' | 'any';

export interface Task {
    id: string;
    name: string;
    gameId: string;
    description: string;
    objectives: string[];
    corpId: string;
    type: TaskType[];
    map: TaskMap | TaskMap[];
    reward: TaskReward[];
    preReward: TaskReward[];
    requiredTasks: string[];
    requiredLevel: number;
    tips: string;
    videoGuides: string[];
    order?: number;
}

export interface TasksDatabase {
    [key: string]: Task;
}


// Interface for merchant information
export interface Corp {
    name: string;
    icon: string;
    merchant: string;
    merchantIcon: string;
}

// Interface for the entire corps object
export interface Corps {
    [key: string]: Corp;
}

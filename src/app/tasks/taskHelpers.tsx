import {Task, TaskReward, TaskStatus, TaskType, UserProgress} from "@/types/tasks";
import {
    BookUp2,
    Camera,
    CheckCircle,
    Clock,
    Crosshair,
    Flag,
    Lock, MapPin,
    Navigation,
    Package,
    Plane,
    Search,
    Send,
    Target
} from "lucide-react";
import {getTasksByMerchant} from "@/data/tasks";
import React from "react";
import {Item} from "@/types/items";
import Link from "next/link";


export interface MerchantPanelProps {
    merchant: string;
    filteredMerchantTasks: Task[];
    userProgress: UserProgress;
    onMerchantSelect: (merchantId: string | null) => void;
    onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    getTaskStatus: (task: Task) => TaskStatus;
}

export const getTaskCounts = (tasks: Task[], getTaskStatus: MerchantPanelProps["getTaskStatus"]) => {
    const counts = {
        completed: 0,
        active: 0,
        locked: 0
    } as Record<TaskStatus, number>;

    tasks.forEach(task => {
        const status = getTaskStatus(task);
        counts[status]++;
    });
    return counts;
};

// Get current tasks (available + active)
export const getCurrentTasks = (tasks: Task[], getTaskStatus: MerchantPanelProps["getTaskStatus"]) => {
    return tasks.filter(task => getTaskStatus(task) === 'active');
};

export const getStatusConfig = (status: TaskStatus, onStatusChange: MerchantPanelProps["onTaskStatusChange"], taskId: string) => {
    switch (status) {
        case 'active':
            return {
                borderColor: 'border-green-600/50',
                bgColor: 'bg-military-700',
                icon: <Clock size={16} className="text-green-400"/>,
                badgeColor: 'bg-green-600',
                actionButton: (
                    <button
                        onClick={() => onStatusChange(taskId, 'completed')}
                        className="bg-olive-600 hover:bg-olive-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                        Mark Complete
                    </button>
                )
            };
        case 'completed':
            return {
                borderColor: 'border-olive-600/30',
                bgColor: 'bg-military-700/50',
                icon: <CheckCircle size={16} className="text-olive-400"/>,
                badgeColor: 'bg-olive-600',
                actionButton: null
            };
        case 'locked':
            return {
                borderColor: 'border-red-600/30',
                bgColor: 'bg-military-700/30',
                icon: <Lock size={16} className="text-red-400"/>,
                badgeColor: 'bg-red-600/50',
                actionButton: null
            };
        default:
            return {
                borderColor: 'border-military-600',
                bgColor: 'bg-military-700',
                icon: <Target size={16} className="text-tan-400"/>,
                badgeColor: 'bg-military-600',
                actionButton: null
            };
    }
};


export const getCurrentReputation = (merchantId: MerchantPanelProps["merchant"], getTaskStatus: MerchantPanelProps["getTaskStatus"], userProgress: MerchantPanelProps["userProgress"]) => {
    const reputationObject = {currentReputation: 0, reputationMax: 0, merchantLevel: 1}
    getTasksByMerchant(merchantId)
        .forEach((task) => {
            const repReward = task.reward.find(r => r.type === 'reputation' && r.corpId === merchantId);
            if (getTaskStatus(task) === 'completed') {
                reputationObject.currentReputation += (repReward?.quantity || 0);
            }
            reputationObject.reputationMax += (repReward?.quantity || 0);
        });

    return reputationObject
}

// Format reward for display
export const formatReward = (reward: TaskReward) => {
    switch (reward.type) {
        case 'money':
            return `$${reward.quantity.toLocaleString()}`;
        case 'reputation':
            return `+${reward.quantity} REP`;
        case 'item':
            return `${reward.item_id} x${reward.quantity}`;
        default:
            return `${reward.type}: ${reward.quantity}`;
    }
};

export const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
        case 'reach':
            return <MapPin size={12} />;
        case 'extract':
            return <Plane size={12} />;
        case 'retrieve':
            return <Search size={12} />;
        case 'eliminate':
            return <Crosshair size={12} />;
        case 'submit':
            return <BookUp2 size={12} />;
        case 'mark':
            return <Flag size={12} />;
        case 'place':
            return <Package size={12} />;
        case 'photo':
            return <Camera size={12} />;
        default:
            return <Target size={12} />;
    }
};

// Helper function to parse markdown-style links
export const parseMarkdownLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Add the link
        parts.push({
            type: 'link',
            text: match[1],
            url: match[2]
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
};

// Helper component to render parsed content
export const RenderTipsContent = ({ content }: { content: string }) => {
    const parts = parseMarkdownLinks(content);

    return (
        <>
            {parts.map((part, index) => {
                if (typeof part === 'string') {
                    return <span key={index}>{part}</span>;
                } else {
                    return (
                        <Link
                            key={index}
                            target={"_blank"}
                            href={part.url}
                            className="text-olive-400 hover:text-olive-300 underline transition-colors"
                        >
                            {part.text}
                        </Link>
                    );
                }
            })}
        </>
    );
};
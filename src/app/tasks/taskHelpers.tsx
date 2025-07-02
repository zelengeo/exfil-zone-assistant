import {Task, TaskStatus, TaskType, UserProgress} from "@/types/tasks";
import {
    BookUp2,
    Camera,
    CheckCircle,
    Clock,
    Crosshair,
    Flag,
    Lock, MapPin,
    Package,
    Plane,
    Search,
    Target, Undo2
} from "lucide-react";
import {corps, getTasksByMerchant} from "@/data/tasks";
import React from "react";
import Link from "next/link";


export interface MerchantPanelSpecificProps extends MerchantPanelBaseProps{
    filteredMerchantTasks: Task[];
    toggleMerchantExpanded: () => void;
}


export interface MerchantPanelBaseProps {
    merchant: string;
    userProgress: UserProgress;
    searchQuery: string;
    onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    getTaskStatus: (task: Task) => TaskStatus;
}



export const getTaskCounts = (tasks: Task[], getTaskStatus: MerchantPanelBaseProps["getTaskStatus"]) => {
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

// Get active tasks active
export const getActiveTasks = (tasks: Task[], getTaskStatus: MerchantPanelBaseProps["getTaskStatus"]) => {
    return tasks.filter(task => getTaskStatus(task) === 'active');
};

export const getStatusConfig = (status: TaskStatus, onStatusChange?: MerchantPanelBaseProps["onTaskStatusChange"], taskId?: string) => {
    const isActionDisabled = !(onStatusChange && taskId)
    switch (status) {
        case 'active':
            return {
                borderColor: 'border-green-600/50',
                bgColor: 'bg-military-700',
                icon: <Clock size={16} className="text-green-400"/>,
                label: 'Active',
                badgeColor: 'bg-green-600/40',
                // Tab styling
                tabBgActive: 'bg-green-600/20',
                tabTextActive: 'text-green-400',
                tabBorderActive: 'border border-green-600/50',
                tabBgInactive: 'bg-military-700',
                tabTextInactive: 'text-tan-400 hover:text-tan-200',
                // ActionButton
                actionButton: <button
                    onClick={() => !isActionDisabled && onStatusChange(taskId, 'completed')}
                    disabled={isActionDisabled}
                    className="ml-auto hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-tan-100 px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                >
                    <CheckCircle size={16} />
                    Mark Complete
                </button>
            };
        case 'completed':
            return {
                borderColor: 'border-olive-600/30',
                bgColor: 'bg-military-700/50',
                icon: <CheckCircle size={16} className="text-olive-400"/>,
                label: 'Completed',
                badgeColor: 'bg-olive-600/40',
                // Tab styling
                tabBgActive: 'bg-olive-600/20',
                tabTextActive: 'text-olive-400',
                tabBorderActive: 'border border-olive-600/50',
                tabTextInactive: 'text-tan-400 hover:text-tan-200',
                // Action button
                actionButton: <button
                    onClick={() => !isActionDisabled && onStatusChange(taskId, 'active')}
                    disabled={isActionDisabled}
                    className="ml-auto bg-military-600 hover:bg-military-500 disabled:bg-military-600/50 disabled:cursor-not-allowed text-tan-300 px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                >
                    <Undo2 size={16}/>
                    Undo
                </button>
            };
        case 'locked':
            return {
                borderColor: 'border-red-600/30',
                bgColor: 'bg-military-700/30',
                icon: <Lock size={16} className="text-red-400"/>,
                label: 'Locked',
                badgeColor: 'bg-red-600/40',
                // Tab styling
                tabBgActive: 'bg-red-600/20',
                tabTextActive: 'text-red-400',
                tabBorderActive: 'border border-red-600/50',
                tabTextInactive: 'text-tan-400 hover:text-tan-200',
                actionButton: null
            };
        default:
            return {
                borderColor: 'border-military-600',
                bgColor: 'bg-military-700',
                icon: <Target size={16} className="text-tan-400"/>,
                label: 'Available',
                badgeColor: 'bg-military-600/40',
                tabBgActive: 'bg-military-600',
                tabTextActive: 'text-tan-200',
                tabBorderActive: 'border border-military-600',
                actionButton: null
            };
    }
};


export const getCurrentReputation = (merchantId: MerchantPanelBaseProps["merchant"], getTaskStatus: MerchantPanelBaseProps["getTaskStatus"]) => {
    const reputationObject = {currentReputation: 0, reputationMax: 0, merchantLevel: 1}
    getTasksByMerchant(merchantId)
        .forEach((task) => {
            const repReward = task.reward.find(r => r.type === 'reputation' && r.corpId === merchantId);
            if (getTaskStatus(task) === 'completed') {
                reputationObject.currentReputation += (repReward?.quantity || 0);
            }
            reputationObject.reputationMax += (repReward?.quantity || 0);
        });
    reputationObject.merchantLevel = corps[merchantId].levelCap.findLastIndex(value => value <= reputationObject.currentReputation) + 2;

    return reputationObject
}

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
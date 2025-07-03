import {Task, TaskReward, TaskStatus, TaskType, UserProgress} from "@/types/tasks";
import {
    BookUp2,
    Camera,
    CheckCircle,
    Clock,
    Crosshair, DollarSign,
    Flag,
    Lock, MapPin,
    Package,
    Plane,
    Search,
    Target, Undo2
} from "lucide-react";
import {corps, getTasksByMerchant, tasksData} from "@/data/tasks";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {Item} from "@/types/items";


export interface MerchantPanelSpecificProps extends MerchantPanelBaseProps {
    filteredMerchantTasks: Task[];
    toggleMerchantExpanded: () => void;
}


export interface MerchantPanelBaseProps {
    merchant: string;
    userProgress: UserProgress;
    searchQuery: string;
    onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    getItemById: (id: string) => Item | undefined;
}


export const getTaskCounts = (tasks: Task[], userProgress: UserProgress) => {
    const counts = {
        completed: 0,
        active: 0,
        locked: 0
    } as Record<TaskStatus, number>;

    tasks.forEach(task => {
        const status = getTaskStatus(task, userProgress);
        counts[status]++;
    });
    return counts;
};

// Get task status for a given task
export const getTaskStatus = (task: Task, userProgress: UserProgress): TaskStatus => {
    const progress = userProgress.tasks[task.id];
    if (progress) return progress;

    // Check if task is locked due to prerequisites
    const hasUnmetPrerequisites = task.requiredTasks.some(reqTaskId => {
        const reqTaskStatus = userProgress.tasks[reqTaskId];
        return !reqTaskStatus || (reqTaskStatus !== 'completed');
    });

    return hasUnmetPrerequisites ? 'locked' : 'active';
};

// Get active tasks active
export const getActiveTasks = (tasks: Task[], userProgress: UserProgress) => {
    return tasks.filter(task => getTaskStatus(task, userProgress) === 'active');
};

export const renderReward = (reward: TaskReward, index: number, getItemById: MerchantPanelBaseProps['getItemById']) => {
    const isWeaponIcon = (reward.type === "item") && reward.item_id && (getItemById(reward.item_id)?.category === "weapons");
    return (
        <div key={index}
             className="bg-military-800 p-3 rounded flex items-center gap-2">
            {/* Reward Icon/Image */}
            <div className={`${isWeaponIcon ? "w-20" : "w-10"} h-10 flex-shrink-0 flex items-center justify-center`}>

                {reward.type === 'money' && (
                    <div
                        className="w-10 h-10 bg-military-600 border border-yellow-600/50 rounded flex items-center justify-center">
                        <DollarSign size={16} className="text-yellow-400"/>
                    </div>
                )}

                {reward.type === 'experience' && (
                    <div
                        className="w-10 h-10 bg-military-600 border border-tan-500/50 rounded flex items-center justify-center text-tan-200 font-bold text-xs">
                        XP
                    </div>
                )}

                {reward.type === 'reputation' && (
                    <div className="w-10 h-10 rounded bg-military-600">
                        <Image
                            src={(reward.corpId && corps[reward.corpId]?.icon) || '/images/corps/default.png'}
                            alt={reward.corpId || 'reputation'}
                            unoptimized={true}
                            className="w-full h-full object-cover"
                            width={32}
                            height={32}
                        />
                    </div>
                )}

                {reward.type === 'item' && (
                    <div
                        className={`${isWeaponIcon ? "w-20" : "w-10"} h-10 p-0.5 rounded bg-military-600`}>
                        {reward.item_id && getItemById ? (
                            <Link href={`/items/${reward.item_id}`} target="_blank" rel="noopener noreferrer">
                                <Image
                                    src={getItemById(reward.item_id)?.images?.icon || '/images/items/default.png'}
                                    alt={reward.item_id}
                                    unoptimized={true}
                                    className={`w-full h-full ${isWeaponIcon
                                        ? "object-contain"
                                        : "object-cover"} hover:scale-110 transition-transform cursor-pointer`}
                                    width={40}
                                    height={40}
                                />
                            </Link>
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-tan-400 text-xs font-bold">
                                {reward.item_name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quantity */}
            <div className="min-w-0 flex-1">
                <div className="text-olive-400 font-bold text-sm">
                    {reward.type === 'money' ? `$${reward.quantity.toLocaleString()}` :
                        reward.type === 'reputation' ? `+${reward.quantity}` :
                            `×${reward.quantity}`}
                </div>
                {reward.type === 'item' && (
                    <div className="text-tan-400 text-xs truncate">
                        {(reward.item_id && getItemById(reward.item_id)?.name) || reward.item_name || 'Unknown Item'}
                    </div>
                )}
            </div>
        </div>
    )
}

export function checkStatusAction(status: TaskStatus, userProgress: UserProgress, taskId: string) {
    if (!(taskId in tasksData)) return false;
    switch (status) {
        case 'active':
            return tasksData[taskId].requiredTasks.every(reqTaskId=> userProgress.tasks[reqTaskId] === 'completed');
        case 'completed':
            return Object.keys(userProgress.tasks).every(progressTaskId => {
                if (userProgress.tasks[progressTaskId] !== 'completed') return true;
                return (
                    !tasksData[progressTaskId].requiredTasks.includes(taskId)
                )
            })
        case 'locked':
            return false;
        default:
            return false;
    }
}


export const getStatusConfig = (status: TaskStatus, onStatusChange?: MerchantPanelBaseProps["onTaskStatusChange"], taskId?: string, isDisabled?: boolean) => {
    const isActionDisabled = isDisabled || !onStatusChange || !taskId
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
                    <CheckCircle size={16}/>
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
                    className="ml-auto bg-military-600 hover:bg-military-500 disabled:bg-military-600/80 disabled:cursor-not-allowed text-tan-300 px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
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


export const getCurrentReputation = (merchantId: MerchantPanelBaseProps["merchant"], userProgress: UserProgress) => {
    const reputationObject = {currentReputation: 0, reputationMax: 0, merchantLevel: 1}
    getTasksByMerchant(merchantId)
        .forEach((task) => {
            const repReward = task.reward.find(r => r.type === 'reputation' && r.corpId === merchantId);
            if (getTaskStatus(task, userProgress) === 'completed') {
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
            return <MapPin size={12}/>;
        case 'extract':
            return <Plane size={12}/>;
        case 'retrieve':
            return <Search size={12}/>;
        case 'eliminate':
            return <Crosshair size={12}/>;
        case 'submit':
            return <BookUp2 size={12}/>;
        case 'mark':
            return <Flag size={12}/>;
        case 'place':
            return <Package size={12}/>;
        case 'photo':
            return <Camera size={12}/>;
        default:
            return <Target size={12}/>;
    }
};

// Helper function to parse markdown-style links
export function parseMarkdownLinks(text: string) {
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
}

export function quickHighlight(text: string) {
    return text.split(/(\[[^\]]+\])/).map((part, index) =>
        part.match(/\[([^\]]+)\]/)
            ? <span key={index} className="text-olive-400 hover:text-olive-300 font-bold">{part.slice(1, -1)}</span>
            : part
    );
}

// Helper component to render parsed content
export const RenderTipsContent = ({content}: { content: string }) => {
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

// Function to create normal YouTube URL from video ID and optional start time
export function getYouTubeUrl(videoId: string, startTime?: number): string {
    let url = `https://www.youtube.com/watch?v=${videoId}`;
    if (startTime && startTime > 0) {
        url += `&t=${startTime}s`;
    }
    return url;
}

// Function to create YouTube embed URL from video ID and optional start time
export function getYouTubeEmbedUrl(videoId: string, startTime?: number): string {
    let url = `https://www.youtube-nocookie.com/embed/${videoId}`;
    if (startTime && startTime > 0) {
        url += `?start=${startTime}`;
    }
    return url;
}
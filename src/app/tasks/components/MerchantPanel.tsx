import React, {useMemo} from 'react';
import Image from 'next/image';
import {User, Target, CheckCircle, Lock, ChevronRight, ChevronDown, Undo2} from 'lucide-react';
import {Task, TaskStatus, UserProgress} from '@/types/tasks';
import {corps, tasksData} from "@/data/tasks";

interface MerchantPanelProps {
    merchant: string;
    selectedMerchant: string | null;
    filteredTasks: (keyof typeof tasksData)[];
    userProgress: UserProgress;
    onMerchantSelect: (merchantId: string | null) => void;
    onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    getTaskStatus: (task: Task) => TaskStatus;
}

export default function MerchantPanel({
                                          merchant,
                                          selectedMerchant,
                                          filteredTasks,
                                          onMerchantSelect,
                                          onTaskStatusChange,
                                          getTaskStatus,
                                      }: MerchantPanelProps) {

    // Determine panel state
    // const isSelected = selectedMerchant === merchant;
    const isCollapsed = selectedMerchant !== null && selectedMerchant !== merchant;
    const isCompact = selectedMerchant === null;

    const merchantTasks = useMemo(() => {
        const grouped: Task[] = [];

        filteredTasks.forEach(taskId => {
            const task = tasksData[taskId];
            if (task && (task.corpId === merchant)) grouped.push(task);
        });

        // Sort tasks within each merchant by order
        grouped.sort((a, b) => a.order - b.order);


        return grouped;
    }, [filteredTasks, merchant]);

    // Get task counts
    const getTaskCounts = () => {
        const counts = {
            completed: 0,
            active: 0,
            locked: 0
        };

        merchantTasks.forEach(task => {
            const status = getTaskStatus(task);
            counts[status]++;
        });

        return counts;
    };

    // Get current tasks (available + active)
    const getCurrentTasks = () => {
        return merchantTasks.filter(task => {
            const status = getTaskStatus(task);
            return status === 'active';
        });
    };

    // Get status icon
    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={16} className="text-olive-400"/>;
            case 'locked':
                return <Lock size={16} className="text-red-400"/>;
            default:
                return <Target size={16} className="text-green-400"/>;
        }
    };

    const counts = getTaskCounts();
    const currentTasks = getCurrentTasks();

    const currentReputation = merchantTasks
        .filter(task => getTaskStatus(task) === 'completed')
        .reduce((total, task) => {
            const repReward = task.reward.find(r => r.type === 'reputation' && r.corpId === merchant);
            return total + (repReward?.quantity || 0);
        }, 0);
    const merchantLevel = 1;

    // Collapsed view (different merchant is selected)
    if (isCollapsed) {
        return (
            <button
                onClick={() => onMerchantSelect(merchant)}
                className="w-full p-3 rounded-sm border border-military-600 bg-military-800
                 text-left transition-all duration-200 hover:border-olive-600
                 hover:bg-military-700 group"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-olive-600/20 rounded-sm flex items-center justify-center">
                            <User size={14} className="text-olive-400"/>
                        </div>
                        <span className="font-medium text-tan-300 group-hover:text-tan-100 transition-colors">
              {merchant.toUpperCase()}
            </span>
                    </div>
                    <ChevronRight size={16} className="text-tan-400 group-hover:text-olive-400 transition-colors"/>
                </div>

                <div className="mt-2 text-xs text-tan-400 ml-9">
                    {counts.active} active
                </div>
            </button>
        );
    }

    // Compact view (multi-merchant overview)
    if (isCompact) {
        return (
            <div className="military-card p-6 rounded-sm">
                {/* Merchant Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-military-600">
                    <button
                        onClick={() => onMerchantSelect(merchant)}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 bg-olive-600 rounded-sm flex items-center justify-center">
                            <User size={20} className="text-white"/>
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-tan-100 group-hover:text-olive-400 transition-colors">
                                {merchant.toUpperCase()}
                            </h3>
                            <p className="text-tan-400 text-sm">Corporation Tasks</p>
                        </div>
                        <ChevronRight size={20}
                                      className="text-tan-400 group-hover:text-olive-400 transition-colors ml-2"/>
                    </button>

                    <div className="flex items-center gap-4 text-sm">
            <span className="text-olive-400">
              {counts.active} Available
            </span>
                        {counts.locked > 0 && (
                            <span className="text-red-400">{counts.locked} Locked</span>
                        )}
                        {counts.completed > 0 && (
                            <span className="text-green-400">{counts.completed} Completed</span>
                        )}
                    </div>
                </div>

                {/* Current Tasks */}
                {currentTasks.length > 0 ? (
                    <div className="space-y-3">
                        {currentTasks.map(task => {
                            const status = getTaskStatus(task);

                            return (
                                <div key={task.id} className="bg-military-700 p-4 rounded-sm border border-military-600
                                           hover:border-olive-600/50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                      <span className="bg-olive-600 text-white px-2 py-1 rounded text-xs font-bold">
                        #{task.order}
                      </span>
                                            <h4 className="font-medium text-tan-100">{task.name}</h4>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(status)}
                                            {status === 'active' && (
                                                <button
                                                    onClick={() => onTaskStatusChange(task.id, 'completed')}
                                                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-tan-300 text-sm mb-3">
                                        <Target size={14} className="inline mr-1"/>
                                        {task.objectives[0]}
                                        {task.objectives.length > 1 && (
                                            <span className="text-tan-400 ml-1">
                        (+{task.objectives.length - 1} more)
                      </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs flex-wrap">
                                        {(Array.isArray(task.map) ? task.map : [task.map]).map(map => (
                                            <span key={map} className="bg-military-600 text-tan-300 px-2 py-1 rounded">
                        📍 {map}
                      </span>
                                        ))}
                                        {task.type.map(type => (
                                            <span key={type}
                                                  className="bg-olive-600/20 text-olive-400 px-2 py-1 rounded">
                        🎯 {type}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-tan-400">
                        <Target size={48} className="mx-auto mb-3 opacity-50"/>
                        <p>No active tasks for this merchant</p>
                        <button
                            onClick={() => onMerchantSelect(merchant)}
                            className="mt-2 text-olive-400 hover:text-olive-300 transition-colors text-sm"
                        >
                            View all tasks →
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Selected view (detailed single merchant view)
    return <div className="military-card rounded-sm">
        {/* Mobile Header */}
        <div className="block lg:hidden p-4 border-b border-military-600">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-olive-600/20 rounded-sm flex items-center justify-center">
                        {/* Small corp image placeholder */}
                        <User size={14} className="text-olive-400"/>
                    </div>
                    <h2 className="text-xl font-bold text-tan-100">{merchant.toUpperCase()}</h2>
                </div>

                <button
                    onClick={() => onMerchantSelect('')}
                    className="flex items-center gap-1 text-tan-400 hover:text-tan-200 transition-colors text-sm"
                >
                    <ChevronDown size={16}/>
                    Back
                </button>
            </div>

            {/* Mobile Task Count Badges */}
            <div className="flex flex-wrap gap-2">
        <span className="bg-olive-600/20 text-olive-400 px-2 py-1 rounded text-xs font-medium">
          {counts.completed} Completed
        </span>
                <span className="bg-yellow-600/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
          {counts.active} Active
        </span>
                <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs font-medium">
          {counts.locked} Locked
        </span>
            </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6 p-6">
            {/* Left Side - Merchant Info */}
            <div className="lg:col-span-1">
                <div className="space-y-3">
                    {/* Corp Image + Progress Bar */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm overflow-hidden">
                            {/* Corp image */}
                            <Image
                                src={corps[merchant]?.icon}
                                alt={corps[merchant]?.name || merchant}
                                unoptimized={true}
                                width="16"
                                height="16"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="w-full bg-military-700 rounded-full h-2">
                                <div
                                    className="bg-olive-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${Math.min((currentReputation / 600) * 100, 100)}%`
                                    }}
                                />
                            </div>
                            <div className="text-xs text-tan-400 mt-1">
                                {currentReputation}/600 REP • Level {merchantLevel}
                            </div>
                        </div>
                    </div>

                    {/* Merchant Header with inline return button */}
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-left text-xl font-bold">
                            <span className="text-olive-400">{corps[merchant]?.name || 'CORP'}</span>
                            <span className="text-tan-100 ml-1">{corps[merchant]?.merchant || merchant.toUpperCase()}</span>
                        </h2>

                        <button
                            onClick={() => onMerchantSelect(null)}
                            className="flex min-h-6 min-w-6 items-center gap-1 px-3 py-1 bg-military-700 hover:bg-military-600
             text-tan-400 hover:text-tan-200 transition-colors rounded-sm text-sm flex-shrink-0"
                        >
                            <Undo2 size={14} />
                            <span className="hidden xl:inline">Back</span>
                        </button>
                    </div>

                    {/* Merchant Image */}
                    <div className="text-center">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative flex-1 aspect-square rounded-sm overflow-hidden border-2 border-olive-600/30">
                                <Image
                                    src={corps[merchant]?.merchantIcon}
                                    alt={corps[merchant]?.merchant || merchant}
                                    unoptimized={true}
                                    className="w-full h-full object-cover"
                                    width="128"
                                    height="128"
                                />
                                {/* Overlay Badges */}
                                <div className="absolute top-2 right-2 space-y-1">
                                    <div className="bg-green-600/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold">
                                        {counts.active} Active
                                    </div>
                                    <div className="bg-olive-600/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold">
                                        {counts.completed} Done
                                    </div>
                                    <div className="bg-red-600/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold">
                                        {counts.locked} Locked
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Tasks */}
            <div className="lg:col-span-3">
                {/* Task content will go here in next iteration */}
                <div className="text-center py-12 text-tan-400">
                    <Target size={48} className="mx-auto mb-3 opacity-50"/>
                    <p>Task list component coming next</p>
                </div>
            </div>
        </div>

        {/* Mobile Tasks */}
        <div className="block lg:hidden p-4">
            {/* Task content will go here in next iteration */}
            <div className="text-center py-8 text-tan-400">
                <Target size={32} className="mx-auto mb-2 opacity-50"/>
                <p className="text-sm">Task list component coming next</p>
            </div>
        </div>
    </div>
}
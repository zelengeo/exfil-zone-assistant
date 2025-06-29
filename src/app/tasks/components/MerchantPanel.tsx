import React, {useMemo} from 'react';
import {User, Target, CheckCircle, Lock, ChevronRight} from 'lucide-react';
import {Task, TaskStatus} from '@/types/tasks';
import {tasksData} from "@/data/tasks";
import MerchantPanelCollapsed from "@/app/tasks/components/MerchantPanelCollapsed";
import MerchantPanelExpanded, {MerchantPanelExpandedProps} from "@/app/tasks/components/MerchantPanelExpanded";

interface MerchantPanelRootProps extends MerchantPanelExpandedProps {
    selectedMerchant: string | null;
    filteredTasks: (keyof typeof tasksData)[];
}

export default function MerchantPanel({
                                          merchant,
                                          selectedMerchant,
                                          filteredTasks,
                                          userProgress,
                                          onMerchantSelect,
                                          onTaskStatusChange,
                                          getTaskStatus,
                                          getItemById,
                                      }: MerchantPanelRootProps) {

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
        return <MerchantPanelCollapsed merchant={merchant} filteredMerchantTasks={merchantTasks}
                                       userProgress={userProgress} onMerchantSelect={onMerchantSelect}
                                       onTaskStatusChange={onTaskStatusChange}
                                       getTaskStatus={getTaskStatus}/>;
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
    return <MerchantPanelExpanded merchant={merchant} filteredMerchantTasks={merchantTasks}
                                  userProgress={userProgress} onMerchantSelect={onMerchantSelect}
                                  onTaskStatusChange={onTaskStatusChange}
                                  getTaskStatus={getTaskStatus} getItemById={getItemById}/>;
}
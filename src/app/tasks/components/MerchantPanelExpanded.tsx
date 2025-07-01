import React, {useMemo, useState} from 'react';
import Image from 'next/image';
import {User, Target, CheckCircle, Lock, ChevronRight, ChevronDown, Undo2, Clock, ChevronUp} from 'lucide-react';
import {Task, TaskStatus, UserProgress} from '@/types/tasks';
import {corps, tasksData} from "@/data/tasks";
import {
    getCurrentReputation,
    getCurrentTasks, getStatusConfig,
    getTaskCounts,
    MerchantPanelProps
} from "@/app/tasks/taskHelpers";
import TaskCard from "@/app/tasks/components/TaskCard";
import {Item} from "@/types/items";

const getTasksByStatus = (tasks: MerchantPanelProps["filteredMerchantTasks"], getTaskStatus: MerchantPanelProps["getTaskStatus"], status: TaskStatus) => {
    return tasks.filter(task => getTaskStatus(task) === status);
};

export interface MerchantPanelExpandedProps extends MerchantPanelProps {
    getItemById: (id: string) => Item | undefined;
}


export default function MerchantPanelExpanded({
                                                  merchant,
                                                  filteredMerchantTasks,
                                                  userProgress,
                                                  toggleMerchantExpanded,
                                                  onTaskStatusChange,
                                                  getTaskStatus,
                                                  getItemById,
                                              }: MerchantPanelExpandedProps) {
    const [activeTab, setActiveTab] = useState<TaskStatus>('active');

    const counts = getTaskCounts(filteredMerchantTasks, getTaskStatus);
    const currentTasks = getCurrentTasks(filteredMerchantTasks, getTaskStatus);
    const {
        currentReputation,
        reputationMax,
        merchantLevel
    } = getCurrentReputation(merchant, getTaskStatus, userProgress)

    return (
        <div className="military-card rounded-sm">
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
            <div className="grid grid-cols-4 lg:grid-cols-5 lg:gap-6 p-6">
                <div
                    className="absolute top-0 left-0 right-0 h-12 bg-military-700/50 cursor-pointer hover:bg-military-700 transition-colors flex items-center justify-center group"
                    onClick={toggleMerchantExpanded}
                >
                    <div className="flex items-center gap-2 text-tan-400 group-hover:text-tan-200">
                        <ChevronUp size={16} />
                        <span className="text-sm">Click to collapse</span>
                        <ChevronUp size={16} />
                    </div>
                </div>
                {/* Left Side - Merchant Info */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="space-y-3">
                        {/* Corp Image + Progress Bar */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm overflow-hidden">
                                {/* Corp image */}
                                <Image
                                    src={corps[merchant]?.icon}
                                    alt={corps[merchant]?.name || merchant}
                                    unoptimized={true}
                                    width="32"
                                    height="32"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="w-full bg-military-700 rounded-full h-2">
                                    <div
                                        className="bg-olive-600 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${reputationMax ? Math.min((currentReputation / reputationMax) * 100, 100) : 100}%`
                                        }}
                                    />
                                </div>
                                <div className="text-xs text-tan-400 mt-1">{currentReputation}/{reputationMax} REP •
                                    Level {merchantLevel}</div>
                            </div>
                        </div>

                        {/* Merchant Header*/}
                        <h2 className="text-xl font-bold mb-3">
                            <span className="text-olive-400">{corps[merchant]?.name || 'CORP'}</span>
                            <span
                                className="text-tan-100 ml-1">{corps[merchant]?.merchant || merchant.toUpperCase()}</span>
                        </h2>

                        {/* Merchant Image */}
                        <Image
                            src={corps[merchant]?.merchantIcon}
                            alt={corps[merchant]?.merchant || merchant}
                            unoptimized={true}
                            className="w-full h-full object-cover"
                            width="128"
                            height="128"
                        />
                    </div>
                </div>

                {/* Right Side - Tasks */}
                <div className="col-span-4">
                    <div className="space-y-6">
                        {/* Task Navigation Tabs */}
                        <div className="border-b border-military-600 mb-6">
                            <div className="flex gap-1">
                                {(['active', 'completed', 'locked'] as TaskStatus[]).map((tabStatus) => {
                                    const config = getStatusConfig(tabStatus);
                                    const isActive = activeTab === tabStatus;
                                    const count = counts[tabStatus];

                                    return (
                                        <button
                                            key={tabStatus}
                                            onClick={() => setActiveTab(tabStatus)}
                                            className={`min-h-8 h-8 p-2 rounded-t-sm text-sm font-medium border-b-2 transition-all ${
                                                isActive
                                                    ? `${config.tabBgActive} ${config.tabTextActive} ${config.tabBorderActive}`
                                                    : `${config.tabTextInactive}`
                                            }`}
                                        >
                                            {config.label}({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tasks List */}
                        <div className="space-y-4">
                            {getTasksByStatus(filteredMerchantTasks, getTaskStatus, activeTab).map((task, index) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    status={getTaskStatus(task)}
                                    userProgress={userProgress}
                                    isAutoExpanded={activeTab === 'active' && (index === 0)} // Auto-expand active tasks
                                    onStatusChange={onTaskStatusChange}
                                    getItemById={getItemById}
                                />
                            ))}

                            {getTasksByStatus(filteredMerchantTasks, getTaskStatus, activeTab).length === 0 && (
                                <div className="text-center py-12 text-tan-400">
                                    <Target size={48} className="mx-auto mb-3 opacity-50"/>
                                    <p>No {activeTab} tasks for this merchant</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tasks */}
            {/*<div className="block lg:hidden p-4">
                 Task content will go here in next iteration
                <div className="text-center py-8 text-tan-400">
                    <Target size={32} className="mx-auto mb-2 opacity-50"/>
                    <p className="text-sm">Task list component coming next</p>
                </div>
            </div>*/}
        </div>
    );
}
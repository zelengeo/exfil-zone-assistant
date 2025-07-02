import React, {useState} from 'react';
import Image from 'next/image';
import {Target, ChevronUp} from 'lucide-react';
import {TaskStatus} from '@/types/tasks';
import {corps,} from "@/data/tasks";
import {
    getCurrentReputation,
    getStatusConfig,
    getTaskCounts,
    MerchantPanelSpecificProps
} from "@/app/tasks/taskHelpers";
import TaskCard from "@/app/tasks/components/TaskCard";
import {Item} from "@/types/items";

const getTasksByStatus = (tasks: MerchantPanelSpecificProps["filteredMerchantTasks"], getTaskStatus: MerchantPanelSpecificProps["getTaskStatus"], status: TaskStatus) => {
    return tasks.filter(task => getTaskStatus(task) === status);
};

export interface MerchantPanelExpandedProps extends MerchantPanelSpecificProps {
    getItemById: (id: string) => Item | undefined;
}


export default function MerchantPanelExpanded({
                                                  merchant,
                                                  filteredMerchantTasks,
                                                  searchQuery,
                                                  userProgress,
                                                  toggleMerchantExpanded,
                                                  onTaskStatusChange,
                                                  getTaskStatus,
                                                  getItemById,
                                              }: MerchantPanelExpandedProps) {
    const [activeTab, setActiveTab] = useState<TaskStatus>('active');

    const counts = getTaskCounts(filteredMerchantTasks, getTaskStatus);
    const {
        currentReputation,
        reputationMax,
        merchantLevel
    } = getCurrentReputation(merchant, getTaskStatus)

    return (
        <div className="military-card rounded-sm">
            <div className="block">
                {/* Header with merchant info and tabs */}
                <div className="p-6 pt-4 pb-0">
                    <div className="w-full grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-6">
                        {/* Left Side - Merchant Info (moved from sidebar) */}
                        <div className="col-span-2 lg:col-span-1">
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
                                        <div
                                            className="text-xs text-tan-400 mt-1">{currentReputation}/{reputationMax} REP
                                            •
                                            Level {merchantLevel}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Tabs */}
                        <div className="col-span-4">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {(['active', 'completed', 'locked'] as TaskStatus[]).map((tabStatus) => {
                                        const config = getStatusConfig(tabStatus);
                                        const isActive = activeTab === tabStatus;
                                        const count = counts[tabStatus];

                                        return (
                                            <div key={tabStatus}
                                                 onClick={() => setActiveTab(tabStatus)}
                                                 className={`sm:px-2 px-0.5 py-0.5 rounded-sm text-xs font-medium cursor-pointer
                ${isActive
                                                ? `${config.tabBgActive} ${config.tabTextActive} ${config.tabBorderActive}`
                                                : config.tabTextInactive}`}>
                                                <div className="flex items-center gap-1 lg:hidden">
                                                    {config.icon}
                                                    <span>{count}</span>
                                                </div>
                                                <div className="hidden lg:block">{config.label} ({count})</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div
                                    className="ml-auto flex items-center rounded-sm pl-2 pr-2 hover:bg-military-600/30 gap-2 text-tan-400 cursor-pointer"
                                    onClick={toggleMerchantExpanded}
                                >
                                    <span className="text-sm font-medium">Collapse</span>
                                    <ChevronUp size={14}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="p-3 grid grid-cold-4 lg:grid-cols-5 gap-6">
                    <div className="hidden lg:block lg:col-span-1 self-start">
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
                    <div className="col-span-4 space-y-4">
                        {getTasksByStatus(filteredMerchantTasks, getTaskStatus, activeTab).map((task, index) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                status={getTaskStatus(task)}
                                userProgress={userProgress}
                                isAutoExpanded={activeTab === 'active' && (index === 0)}
                                onStatusChange={onTaskStatusChange}
                                getItemById={getItemById}
                            />
                        ))}

                        {getTasksByStatus(filteredMerchantTasks, getTaskStatus, activeTab).length === 0 && (
                            <div className="text-center py-12 text-tan-400">
                                <Target size={48} className="mx-auto mb-3 opacity-50"/>
                                <p>No {searchQuery ? "filtered " : ""}{activeTab} tasks for this merchant</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            {/*<div className="grid grid-cols-4 lg:grid-cols-5 lg:gap-6 p-6">
                 Left Side - Merchant Info
                <div className="hidden lg:block lg:col-span-1">
                    <div className="space-y-3">
                         Corp Image + Progress Bar
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm overflow-hidden">
                                 Corp image
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

                         Merchant Header
                        <h2 className="text-xl font-bold mb-3">
                            <span className="text-olive-400">{corps[merchant]?.name || 'CORP'}</span>
                            <span
                                className="text-tan-100 ml-1">{corps[merchant]?.merchant || merchant.toUpperCase()}</span>
                        </h2>

                         Merchant Image
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

                 Right Side - Tasks
                <div className="col-span-4">
                    <div className="space-y-6">
                         Task Navigation Tabs
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
                                            {config.label} ({count})
                                        </button>
                                    );
                                })}
                                <div
                                    className="ml-auto flex items-center rounded-sm pl-2 pr-2 hover:bg-military-600/30 gap-2 text-tan-400 cursor-pointer"
                                    onClick={toggleMerchantExpanded}
                                >
                                    <span className="text-sm font-medium">Collapse</span>
                                    <ChevronUp size={14}/>
                                </div>
                            </div>
                        </div>

                         Tasks List
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
                                    <p>No {searchQuery ? "filtered " : ""}{activeTab} tasks for this merchant</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>*/}
        </div>
    );
}
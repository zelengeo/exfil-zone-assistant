import React from 'react';
import Image from 'next/image';
import {corps,} from "@/data/tasks";
import {
    getCurrentReputation,
    getActiveTasks,
    getTaskCounts,
    MerchantPanelProps,
    getStatusConfig
} from "@/app/tasks/taskHelpers";
import {CheckCircle, ChevronDown, Clock, Lock} from "lucide-react";
import {TaskStatus} from "@/types/tasks";


export default function MerchantPanelCollapsed({
                                                   merchant,
                                                   filteredMerchantTasks,
                                                   toggleMerchantExpanded,
                                                   userProgress,
                                                   searchQuery,
                                                   onTaskStatusChange,
                                                   getTaskStatus,
                                               }: MerchantPanelProps) {


    const counts = getTaskCounts(filteredMerchantTasks, getTaskStatus);
    const activeTasks = getActiveTasks(filteredMerchantTasks, getTaskStatus);
    const {
        currentReputation,
        reputationMax,
        merchantLevel
    } = getCurrentReputation(merchant, getTaskStatus, userProgress)

    // Collapsed view (different merchant is selected)
    return (
        <button
            onClick={toggleMerchantExpanded}
            className="w-full p-3 rounded-sm border border-military-600 bg-military-800
              transition-all duration-200 hover:border-olive-600
               hover:bg-military-700 group"
        >
            <div className="w-full lg:grid lg:grid-cols-5 lg:gap-6 pl-3 pr-3">
                <div className="flex items-center gap-3">
                    {/*Merchant icon*/}
                    <div className="w-6 h-6 rounded-sm overflow-hidden flex-shrink-0">
                        <Image
                            src={corps[merchant]?.icon}
                            alt={corps[merchant]?.name || merchant}
                            unoptimized={true}
                            className="w-full h-full object-cover"
                            width="24"
                            height="24"
                        />
                    </div>

                    {/* Merchant info */}
                    <div className="text-left">
                        <div className="font-medium text-tan-300 group-hover:text-tan-100 transition-colors text-sm">
                            <span className="text-olive-400">{corps[merchant]?.name}</span>
                            <span className="ml-1">{corps[merchant]?.merchant}</span>
                        </div>
                        <div className="text-xs text-tan-400">
                            {currentReputation}/{reputationMax} REP • Level {merchantLevel}
                        </div>
                    </div>
                </div>


                <div className="lg:col-span-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Status badges - aligned to the left like tabs */}
                        <div className="flex items-center gap-1">
                            {(['active', 'completed', 'locked'] as TaskStatus[]).map((tabStatus) => {
                                const config = getStatusConfig(tabStatus);
                                const count = counts[tabStatus];

                                return (
                                    <div key={tabStatus} className={`px-2 py-0.5 rounded-sm text-xs font-medium
                ${count > 0
                                        ? `${config.tabBgActive} ${config.tabTextActive} ${config.tabBorderActive}`
                                        : 'text-tan-600'}`}>
                                        {config.label} ({count})
                                    </div>
                                );
                            })}
                        </div>

                        {/* Active task info */}
                        <div className="flex-1 min-w-0">
                            {activeTasks.length > 0 ? (

                                <span className="text-sm text-tan-300 truncate">
                        {activeTasks[0].order}: {activeTasks[0].name}
                                    {activeTasks.length > 1 && (
                                        <span className="text-tan-500 ml-1">
                                (+{activeTasks.length - 1})
                            </span>
                                    )}
                    </span>

                            ) : searchQuery ? null :(
                                <span className="text-sm text-tan-500 italic">
                                    No active tasks
                </span>
                            )}
                        </div>
                    </div>

                    {/* Chevron indicator - aligned to the right for consistency */}
                    <div className="text-tan-400 flex-shrink-0">
                        <ChevronDown size={14}/>
                    </div>
                </div>
            </div>
        </button>
    );
}
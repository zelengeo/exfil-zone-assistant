import React from 'react';
import Image from 'next/image';
import {corps,} from "@/data/tasks";
import {
    getCurrentReputation,
    getActiveTasks,
    getTaskCounts,
    MerchantPanelSpecificProps,
    getStatusConfig
} from "@/app/tasks/taskHelpers";
import {ChevronDown} from "lucide-react";
import {TaskStatus} from "@/types/tasks";


export default function MerchantPanelCollapsed({
                                                   merchant,
                                                   filteredMerchantTasks,
                                                   toggleMerchantExpanded,
                                                   searchQuery,
                                                   getTaskStatus,
                                               }: MerchantPanelSpecificProps) {


    const counts = getTaskCounts(filteredMerchantTasks, getTaskStatus);
    const activeTasks = getActiveTasks(filteredMerchantTasks, getTaskStatus);
    const {
        currentReputation,
        reputationMax,
        merchantLevel
    } = getCurrentReputation(merchant, getTaskStatus)

    // Collapsed view (different merchant is selected)
    return (
        <button
            onClick={toggleMerchantExpanded}
            className="w-full p-3 rounded-sm border border-military-600 bg-military-800
          transition-all duration-200 hover:border-olive-600
           hover:bg-military-700 group"
        >
            <div className="w-full grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-6 px-0 sm:px-3">
                {/* Mobile: stack vertically, Desktop: grid column 1 */}
                <div className="flex items-center gap-3">
                    {/*Merchant icon*/}
                    <div className="w-8 h-8 rounded-sm overflow-hidden flex-shrink-0">
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
                    <div className="text-left text-xs text-tan-400">
                        <div className="font-medium text-tan-300 group-hover:text-tan-100 transition-colors text-xs sm:text-sm">
                            <span className="text-olive-400">{corps[merchant]?.name}</span>
                            <span className="ml-1 truncate">{corps[merchant]?.merchant}</span>
                        </div>
                        <div className="hidden sm:block">
                            {currentReputation}/{reputationMax} REP • Level {merchantLevel}
                        </div>
                        <div className="block sm:hidden">
                            {currentReputation}/{reputationMax} • Lv{merchantLevel}
                        </div>
                    </div>
                </div>

                {/* Mobile: stack below, Desktop: grid columns 2-5 */}
                <div className="lg:col-span-4 flex items-center gap-2 lg:gap-4">
                    <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                        {/* Status badges */}
                        <div className="flex items-center gap-1">
                            {(['active', 'completed', 'locked'] as TaskStatus[]).map((tabStatus) => {
                                const config = getStatusConfig(tabStatus);
                                const count = counts[tabStatus];

                                return (
                                    <div key={tabStatus} className={`sm:px-2 px-0.5 py-0.5 rounded-sm text-xs font-medium
            ${count > 0
                                        ? `${config.tabBgActive} ${config.tabTextActive} ${config.tabBorderActive}`
                                        : 'text-tan-600'}`}>
                                        <div className="flex items-center gap-1 lg:hidden">
                                            {config.icon}
                                            <span>{count}</span>
                                        </div>
                                        <div className="hidden lg:block">{config.label} ({count})</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Active task info - hide on mobile if no space */}
                        <div className="flex-1 min-w-0 hidden lg:block">
                            {activeTasks.length > 0 ? (
                                <span className="text-sm text-tan-300 truncate block">
                                {activeTasks[0].order}: {activeTasks[0].name}
                                    {activeTasks.length > 1 && (
                                        <span className="text-tan-500 ml-1">
                                        (+{activeTasks.length - 1})
                                    </span>
                                    )}
                            </span>
                            ) : searchQuery ? null : (
                                <span className="text-sm text-tan-500">
                                No active tasks
                            </span>
                            )}
                        </div>
                    </div>

                    {/* Chevron indicator */}
                    <div className="text-tan-400 flex-shrink-0">
                        <ChevronDown size={14}/>
                    </div>
                </div>
            </div>
        </button>
    );
}
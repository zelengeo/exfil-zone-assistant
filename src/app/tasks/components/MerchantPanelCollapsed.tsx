import React from 'react';
import Image from 'next/image';
import {corps,} from "@/data/tasks";
import {getCurrentReputation, getCurrentTasks, getTaskCounts, MerchantPanelProps} from "@/app/tasks/taskHelpers";


export default function MerchantPanelCollapsed({
                                                   merchant,
                                                   filteredMerchantTasks,
                                                   onMerchantSelect,
                                                   userProgress,
                                                   onTaskStatusChange,
                                                   getTaskStatus,
                                               }: MerchantPanelProps) {


    const counts = getTaskCounts(filteredMerchantTasks, getTaskStatus);
    const currentTasks = getCurrentTasks(filteredMerchantTasks, getTaskStatus);
    const  {currentReputation, reputationMax ,merchantLevel} = getCurrentReputation(merchant, getTaskStatus, userProgress)

    // Collapsed view (different merchant is selected)
    return (
        <button
            onClick={() => onMerchantSelect(merchant)}
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

                <div className="lg:col-span-4">
                    {/* TODO 1 active task or Message that 0 tasks are active*/}
                </div>
            </div>
        </button>
    );
}
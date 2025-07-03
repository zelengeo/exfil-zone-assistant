import React, {useCallback, useMemo, useState} from 'react';
import {Task} from '@/types/tasks';
import {tasksData} from "@/data/tasks";
import MerchantPanelCollapsed from "@/app/tasks/components/MerchantPanelCollapsed";
import MerchantPanelExpanded from "@/app/tasks/components/MerchantPanelExpanded";
import {MerchantPanelBaseProps} from "@/app/tasks/taskHelpers";
import {Item} from "@/types/items";

interface MerchantPanelRootProps extends MerchantPanelBaseProps {
    filteredTasks: (keyof typeof tasksData)[];
    searchQuery: string;
    getItemById: (id: string) => Item | undefined;
}

const EXPANDED_MERCHANT_BASE = 'exfil-zone-tasks-expanded-merchant-';

export default function MerchantPanel({
                                          merchant,
                                          filteredTasks,
                                          userProgress,
                                          searchQuery,
                                          onTaskStatusChange,
                                          getItemById,
                                      }: MerchantPanelRootProps) {
    // Check if this merchant was the last opened one
    const [isExpanded, setIsExpanded] = useState(() => {
        if (typeof window !== 'undefined') {
            const expanded = localStorage.getItem(EXPANDED_MERCHANT_BASE + merchant);
            return expanded === "expanded";
        }
        return false;
    });


    const toggleMerchantExpanded = useCallback(() => {
        setIsExpanded(prevState => {
            localStorage.setItem(EXPANDED_MERCHANT_BASE + merchant, prevState ? "" : "expanded");
            return !prevState;
        });
    }, [merchant]);


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


    // Selected view (detailed single merchant view)
    if (isExpanded) {
        return <MerchantPanelExpanded merchant={merchant} filteredMerchantTasks={merchantTasks}
                                      searchQuery={searchQuery}
                                      userProgress={userProgress} toggleMerchantExpanded={toggleMerchantExpanded}
                                      onTaskStatusChange={onTaskStatusChange}
                                      getItemById={getItemById}/>;
    }


    // Collapsed view (different merchant is selected)
    return <MerchantPanelCollapsed merchant={merchant} filteredMerchantTasks={merchantTasks}
                                   searchQuery={searchQuery}
                                   userProgress={userProgress} toggleMerchantExpanded={toggleMerchantExpanded}
                                   onTaskStatusChange={onTaskStatusChange}
                                   getItemById={getItemById}/>;

}
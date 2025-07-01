import React, {useCallback, useMemo, useState} from 'react';
import {Task} from '@/types/tasks';
import {tasksData} from "@/data/tasks";
import MerchantPanelCollapsed from "@/app/tasks/components/MerchantPanelCollapsed";
import MerchantPanelExpanded, {MerchantPanelExpandedProps} from "@/app/tasks/components/MerchantPanelExpanded";

interface MerchantPanelRootProps extends MerchantPanelExpandedProps {
    selectedMerchant: string | null;
    filteredTasks: (keyof typeof tasksData)[];
}

const EXPANDED_MERCHANT_BASE = 'exfil-zone-tasks-expanded-merchant-';

export default function MerchantPanel({
                                          merchant,
                                          filteredTasks,
                                          userProgress,
                                          onTaskStatusChange,
                                          getTaskStatus,
                                          getItemById,
                                      }: MerchantPanelRootProps) {
    // Check if this merchant was the last opened one
    const [isExpanded, setIsExpanded] = useState(() => {
        if (typeof window !== 'undefined') {
            const lastOpened = localStorage.getItem(EXPANDED_MERCHANT_BASE + merchant);
            return lastOpened === merchant;
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
                                      userProgress={userProgress} toggleMerchantExpanded={toggleMerchantExpanded}
                                      onTaskStatusChange={onTaskStatusChange}
                                      getTaskStatus={getTaskStatus} getItemById={getItemById}/>;
    }



    // Collapsed view (different merchant is selected)
    return <MerchantPanelCollapsed merchant={merchant} filteredMerchantTasks={merchantTasks}
                                   userProgress={userProgress} toggleMerchantExpanded={toggleMerchantExpanded}
                                   onTaskStatusChange={onTaskStatusChange}
                                   getTaskStatus={getTaskStatus}/>;

}
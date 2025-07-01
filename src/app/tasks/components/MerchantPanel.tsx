import React, {useMemo} from 'react';
import {Task} from '@/types/tasks';
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


    // Collapsed view (different merchant is selected)
    if (isCollapsed) {
        return <MerchantPanelCollapsed merchant={merchant} filteredMerchantTasks={merchantTasks}
                                       userProgress={userProgress} onMerchantSelect={onMerchantSelect}
                                       onTaskStatusChange={onTaskStatusChange}
                                       getTaskStatus={getTaskStatus}/>;
    }

    // Selected view (detailed single merchant view)
    return <MerchantPanelExpanded merchant={merchant} filteredMerchantTasks={merchantTasks}
                                  userProgress={userProgress} onMerchantSelect={onMerchantSelect}
                                  onTaskStatusChange={onTaskStatusChange}
                                  getTaskStatus={getTaskStatus} getItemById={getItemById}/>;
}
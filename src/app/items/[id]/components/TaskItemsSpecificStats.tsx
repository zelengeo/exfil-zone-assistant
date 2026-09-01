import React from 'react';
import { Target, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import {TaskItem} from "@/types/items";
import {StatPanel} from "./StatLine";


export default function TaskItemsSpecificStats({ item }: {item: TaskItem;}) {
    const taskIds = item.stats.taskIds ?? [];

    return (
        <StatPanel title="Task item properties" icon={<Target size={14} />}>
            <div className="space-y-4">
                {taskIds.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={13} className="text-ink-700" aria-hidden="true" />
                            <span className="text-xs text-ink-600">Related tasks</span>
                        </div>
                        <div className="pl-5 space-y-1">
                            {taskIds.map((taskId) => (
                                <Link
                                    key={taskId}
                                    href={`/tasks/${taskId}`}
                                    className="block font-mono text-xs text-ink-400 hover:text-ink-hi underline decoration-line-600 underline-offset-2 transition-colors"
                                >
                                    {taskId}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-xs text-ink-500 border-l border-line-600 pl-3">
                    {item.subcategory === 'Universal'
                        ? 'This item can be used for tasks from any NPC.'
                        : `This item is specifically required for ${item.subcategory}'s tasks.`
                    }
                </p>
            </div>
        </StatPanel>
    );
}
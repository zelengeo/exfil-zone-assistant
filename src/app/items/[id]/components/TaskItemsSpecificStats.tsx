import React from 'react';
import { Target, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import {TaskItem} from "@/types/items";


export default function TaskItemsSpecificStats({ item }: {item: TaskItem;}) {
    return (
        <div className="military-card p-4 rounded-sm mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-olive-400" />
                <h4 className="text-lg font-bold text-olive-400">Task Item Properties</h4>
            </div>

            <div className="space-y-3">
                {/* Related Tasks */}
                {item.stats.taskIds && item.stats.taskIds.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={16} className="text-olive-400" />
                            <span className="text-tan-400">Related Tasks:</span>
                        </div>
                        <div className="pl-6 space-y-1">
                            {item.stats.taskIds.map((taskId) => (
                                <Link
                                    key={taskId}
                                    href={`/tasks/${taskId}`}
                                    className="block text-sm text-olive-300 hover:text-olive-200 transition-colors underline decoration-olive-400/50 hover:decoration-olive-300"
                                >
                                    {taskId}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Usage hint */}
                <div className="mt-4 p-3 bg-military-800/50 rounded border-l-2 border-olive-400/50">
                    <p className="text-sm text-tan-300">
                        {item.subcategory === 'Universal'
                            ? 'This item can be used for tasks from any NPC.'
                            : `This item is specifically required for ${item.subcategory}'s tasks.`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
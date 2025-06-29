import React, {useState} from 'react';
import {
    ChevronDown,
    ChevronRight,
    Target,
    MapPin,
    Map,
    Zap,
    Award, DollarSign,
    Package
} from 'lucide-react';
import Image from 'next/image';
import {Task, TaskReward, TaskStatus} from '@/types/tasks';
import {formatReward, getStatusConfig, getTaskTypeIcon, RenderTipsContent} from "@/app/tasks/taskHelpers";
import {SiYoutube} from "@icons-pack/react-simple-icons";
import {corps} from "@/data/tasks";
import {Item} from "@/types/items";
import Link from "next/link";

interface TaskCardProps {
    task: Task;
    status: TaskStatus;
    isAutoExpanded?: boolean; // For active tasks that should be expanded by default
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    getItemById: (id: string) => Item | undefined;
}

const renderReward = (reward: TaskReward, index: number, getItemById: TaskCardProps['getItemById']) => {
    const isWeaponIcon = (reward.type === "item") && reward.item_id && (getItemById(reward.item_id)?.category === "weapons");
    return (
        <div key={index}
             className="bg-military-800 p-3 rounded flex items-center gap-2">
            {/* Reward Icon/Image */}
            <div className={`${isWeaponIcon ? "w-20" : "w-10"} h-10 flex-shrink-0 flex items-center justify-center`}>

                {reward.type === 'money' && (
                    <div className="w-10 h-10 bg-military-600 border border-yellow-600/50 rounded flex items-center justify-center">
                        <DollarSign size={16} className="text-yellow-400" />
                    </div>
                )}

                {reward.type === 'experience' && (
                    <div className="w-10 h-10 bg-military-600 border border-tan-500/50 rounded flex items-center justify-center text-tan-200 font-bold text-xs">
                        XP
                    </div>
                )}

                {reward.type === 'reputation' && (
                    <div className="w-10 h-10 rounded overflow-hidden">
                        <Image
                            src={(reward.corpId && corps[reward.corpId]?.icon) || '/images/corps/default.png'}
                            alt={reward.corpId || 'reputation'}
                            unoptimized={true}
                            className="w-full h-full object-cover"
                            width={32}
                            height={32}
                        />
                    </div>
                )}

                {reward.type === 'item' && (
                    <div
                        className={`${isWeaponIcon ? "w-20" : "w-10"} h-10 rounded bg-military-600`}>
                        {reward.item_id && getItemById ? (
                            <Link href={`/items/${reward.item_id}`}>
                                <Image
                                    src={getItemById(reward.item_id)?.images?.icon || '/images/items/default.png'}
                                    alt={reward.item_id}
                                    unoptimized={true}
                                    className={`w-full h-full ${getItemById(reward.item_id)?.category === "weapon"
                                        ? "object-contain"
                                        : "object-cover"} hover:scale-110 transition-transform cursor-pointer`}
                                    width={40}
                                    height={40}
                                />
                            </Link>
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-tan-400 text-xs font-bold">
                                {reward.item_name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quantity */}
            <div className="min-w-0 flex-1">
                <div className="text-olive-400 font-bold text-sm">
                    {reward.type === 'money' ? `$${reward.quantity.toLocaleString()}` :
                        reward.type === 'reputation' ? `+${reward.quantity}` :
                            `×${reward.quantity}`}
                </div>
                {reward.type === 'item' && (
                    <div className="text-tan-400 text-xs truncate">
                        {(reward.item_id && getItemById(reward.item_id)?.name) || reward.item_name || 'Unknown Item'}
                    </div>
                )}
            </div>
        </div>
    )
}
export default function TaskCard({
                                     task,
                                     status,
                                     isAutoExpanded = false,
                                     onStatusChange,
                                     getItemById,
                                 }: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(isAutoExpanded);

    const statusConfig = getStatusConfig(status, onStatusChange, task.id);

    return (
        <div className={`rounded-sm border ${statusConfig.borderColor} ${statusConfig.bgColor} overflow-hidden`}>
            {/* Task Header - Always Visible */}
            <div
                className="p-3 cursor-pointer hover:bg-military-600/30 transition-colors" // Reduced padding from p-4 to p-3
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Expand/Collapse Icon */}
                        <div className="flex-shrink-0">
                            {isExpanded ? (
                                <ChevronDown size={16} className="text-tan-400"/>
                            ) : (
                                <ChevronRight size={16} className="text-tan-400"/>
                            )}
                        </div>

                        {/* Task Info - More compact */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-2"> {/* Increased gap and margin */}
                                <span
                                    className={`${statusConfig.badgeColor} text-white px-2 py-1 rounded text-xs font-bold flex-shrink-0`}>
            #{task.order}
          </span>
                                <h4 className="font-medium text-tan-100 truncate flex-shrink-0">{task.name}</h4>

                                {/* Map and Type badges in same row */}
                                <div
                                    className="flex items-center gap-2 ml-auto"> {/* ml-auto pushes badges to the right */}
                                    {/* Map badges */}
                                    {task.map.slice(0, 1).map(map => (
                                        <span key={map}
                                              className="bg-military-600 text-tan-300 px-2 py-1 rounded text-xs flex items-center gap-1 flex-shrink-0">
                <Map size={10}/>{map}
              </span>
                                    ))}
                                    {task.map.length > 1 && (
                                        <span className="text-tan-400 text-xs">+{task.map.length - 2}</span>
                                    )}

                                    {/* Type badges */}
                                    {task.type.slice(0, 2).map(type => (
                                        <span key={type}
                                              className="bg-olive-600/20 text-olive-400 px-2 py-1 rounded text-xs flex items-center gap-1 flex-shrink-0">
    <span className="text-sm">{getTaskTypeIcon(type)}</span>
                                            {type}
  </span>
                                    ))} {task.type.length > 2 && (
                                        <span className="text-tan-400 text-xs">+{task.type.length - 2}</span>
                                    )}
                                </div>
                            </div>

                            {/* First objective preview - now on separate line */}
                            <p className="text-tan-300 text-sm truncate">
                                {task.objectives[0]}
                                {task.objectives.length > 1 && (
                                    <span className="text-tan-400 ml-1">
              (+{task.objectives.length - 1} more)
            </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {statusConfig.actionButton && (
                        <div
                            className="ml-3 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {statusConfig.actionButton}
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-military-600 p-4 space-y-4">
                    {/* Top Row: Objectives (left) + Tips & Videos (right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Objectives */}
                        <div>
                            <h5 className="font-medium text-tan-100 mb-3 flex items-center gap-2">
                                <Target size={16}/>
                                Objectives
                            </h5>
                            <div className="space-y-2">
                                {task.objectives.map((objective, index) => (
                                    <div key={index} className="flex items-start gap-2 text-tan-300 text-sm">
                                        <div
                                            className="w-5 h-5 rounded-full bg-military-600 flex items-center justify-center text-xs text-tan-400 mt-0.5 flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <span>{objective}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Tips & Videos */}
                        <div className="space-y-4">
                            {/* Tips */}
                            {task.tips && (
                                <div>
                                    <h5 className="font-medium text-tan-100 mb-2">Tips</h5>
                                    <div className="bg-military-800 p-3 rounded text-sm text-tan-300 border-l-4 border-olive-600">
                                        <RenderTipsContent content={task.tips} />
                                    </div>
                                </div>
                            )}

                            {/* Video Guides */}
                            {task.videoGuides && task.videoGuides.length > 0 && (
                                <div>
                                    <h5 className="font-medium text-tan-100 mb-2">Video Guides</h5>
                                    <div className="space-y-2">
                                        {task.videoGuides.map(({url}, index) => (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center bg-military-800 p-2 rounded text-olive-400 hover:text-olive-300 transition-colors text-sm  gap-2"
                                            >
                                                <SiYoutube size={14}/>
                                                Watch Guide {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* If no tips or videos, show placeholder */}
                            {!task.tips && (!task.videoGuides || task.videoGuides.length === 0) && (
                                <div className="text-center py-8 text-tan-500">
                                    <div className="text-xs">No additional guidance available</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pre Rewards */}
                    {task.preReward && task.preReward.length > 0 && (
                        <div>
                            <h5 className="font-medium text-tan-100 mb-2 flex items-center gap-2">
                                <Package size={16}/>
                                Starting Items
                            </h5>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {task.preReward.map((reward, index) => renderReward(reward, index, getItemById))}
                            </div>
                        </div>
                    )}



                    {/* Rewards */}
                    {task.reward && task.reward.length > 0 && (
                        <div>
                            <h5 className="font-medium text-tan-100 mb-2 flex items-center gap-2">
                                <Award size={16}/>
                                Rewards
                            </h5>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {task.reward.map((reward, index) => renderReward(reward, index, getItemById))}
                            </div>
                        </div>
                    )}

                    {/* Prerequisites */}
                    {task.requiredTasks && task.requiredTasks.length > 0 && (
                        <div>
                            <h5 className="font-medium text-tan-100 mb-2">Prerequisites</h5>
                            <div className="text-sm text-tan-400">
                                Complete tasks: {task.requiredTasks.join(', ')}
                            </div>
                        </div>
                    )}

                    {/* Bottom Row: Maps and Types */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* All Maps */}
                        {task.map.length > 0 && (
                            <div>
                                <h6 className="text-tan-200 text-sm font-medium mb-2">Maps</h6>
                                <div className="space-y-1">
                                    {task.map.map(map => (
                                        <div key={map} className="text-tan-400 text-sm flex items-center gap-1">
                                            <MapPin size={12}/>
                                            {map}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Types */}
                        {task.type.length > 0 && (
                            <div>
                                <h6 className="text-tan-200 text-sm font-medium mb-2">Types</h6>
                                <div className="space-y-1">
                                    {task.type.map(type => (
                                        <div key={type} className="text-tan-400 text-sm flex items-center gap-2">
                                            {getTaskTypeIcon(type)}
                                            <span className="capitalize">{type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
        ;
}
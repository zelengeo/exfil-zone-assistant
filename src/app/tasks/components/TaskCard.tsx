import React, {useState} from 'react';
import {
    ChevronDown,
    ChevronRight,
    Target,
    Map,
    Flag,
    Award,
    Package, Info, MapPin,
} from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";
import {Task, TaskStatus, UserProgress} from '@/types/tasks';
import {
    getStatusConfig,
    getTaskTypeIcon,
    getYouTubeUrl,
    renderReward,
    RenderTipsContent
} from "@/app/tasks/taskHelpers";
import {corps, tasksData} from "@/data/tasks";
import {Item} from "@/types/items";
import {community} from "@/data/community";

interface TaskCardProps {
    task: Task;
    status: TaskStatus;
    userProgress: UserProgress;
    isAutoExpanded?: boolean; // For active tasks that should be expanded by default
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    getItemById: (id: string) => Item | undefined;
}

export default function TaskCard({
                                     task,
                                     status,
                                     userProgress,
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
                className="p-3 cursor-pointer hover:bg-military-600/30 transition-colors"
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
                                <h4 className="font-medium text-tan-100 flex-shrink-0">{task.name}</h4>

                                {/* Map and Type badges in same row, hidden on low width - displayed in expanded then */}
                                <div
                                    className="hidden lg:flex items-center gap-2 ml-auto">
                                    {/* Map badges */}
                                    {task.map.map(map => (
                                        <span key={map}
                                              className="bg-military-600 text-tan-300 px-2 py-1 rounded text-xs flex items-center gap-1 flex-shrink-0">
                <Map size={10}/>{map}
              </span>
                                    ))}

                                    {/* Type badges */}
                                    {task.type.slice(0, 3).map(type => (
                                        <span key={type}
                                              className="bg-olive-600/20 text-olive-400 px-2 py-1 rounded text-xs flex items-center gap-1 flex-shrink-0">
    <span className="text-sm">{getTaskTypeIcon(type)}</span>
                                            {type}
  </span>
                                    ))} {task.type.length > 3 && (
                                        <span className="text-tan-400 text-xs">+{task.type.length - 3}</span>
                                    )}
                                </div>
                            </div>

                            {isExpanded || (<p className="text-tan-300 text-sm">
                                {task.objectives[0]}
                                {task.objectives.length > 1 && (
                                    <span className="text-tan-400 ml-1">
              (+{task.objectives.length - 1} more)
            </span>
                                )}
                            </p>)}
                        </div>
                    </div>
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
                                    <div
                                        className="bg-military-800 p-3 rounded text-sm text-tan-300 border-l-4 border-olive-600">
                                        <RenderTipsContent content={task.tips}/>
                                    </div>
                                </div>
                            )}

                            {/* Video Guides */}
                            {task.videoGuides && task.videoGuides.length > 0 && (
                                <div>
                                    <h5 className="font-medium text-tan-100 mb-2">Video Guides</h5>
                                    <div className="space-y-2">
                                        {task.videoGuides.map(({author, ytId, startTs }, index) => {
                                            if (!author || !ytId || !(author in community)) { return null }
                                            const communityAuthor = community[author as keyof typeof community];
                                            return <Link
                                                key={author+ytId+startTs+index}
                                                href={getYouTubeUrl(ytId, startTs)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center bg-military-800 p-2 rounded text-olive-400 hover:text-olive-300 transition-colors text-sm  gap-2"
                                            >
                                                <Image
                                                    src={communityAuthor.logo}
                                                    alt={communityAuthor.name}
                                                    unoptimized={true}
                                                    className={`w-6 h-6 rounded-full cursor-pointer`}
                                                    width={32}
                                                    height={32}
                                                />
                                                <span><span className="font-bold">{communityAuthor.name}</span>&#39;s Guide</span>
                                            </Link>
                                        })}
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

                    {/* Prerequisites */}
                    {(task.requiredLevel || task.requiredTasks.length) ? (<div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h5 className="font-medium text-tan-100 flex items-center gap-2">
                                <Flag size={16}/>
                                Prerequisites
                            </h5>

                            {/* Info Icon with Tooltip */}
                            <div className="relative group">
                                <Info size={14} className="text-tan-400 cursor-help"/>

                                {/* Tooltip */}
                                <div className="absolute left-0 bottom-full mb-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                                    <div className="bg-military-800 border border-military-600 rounded p-3 shadow-lg w-64">
                                        <p className="text-xs text-tan-300 leading-relaxed">
                                            <span className="text-amber-400 font-medium">Note:</span> Task prerequisites are still being verified.
                                            If you find any inconsistencies, please report them on our{' '}
                                            <Link
                                                href="https://discord.gg/2FCDZK6C25"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Discord server
                                            </Link>.
                                        </p>
                                        {/* Tooltip arrow */}
                                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-military-800"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {/* Level Requirement */}
                            {task.requiredLevel ? (<div className="bg-military-600/30 rounded p-3">
                                <div className="text-xs text-tan-400 mb-1">Required Level</div>
                                <div className="text-sm font-medium text-tan-200">
                                    <span className="flex items-center gap-2">
                                        <Target size={14} className="text-amber-400"/>
                                        Level {task.requiredLevel}
                                    </span>
                                </div>
                            </div>) : null}

                            {/* Required Tasks */}
                            {task.requiredTasks && task.requiredTasks.length > 0 ? (
                                <div className="bg-military-600/30 rounded p-3">
                                    <div className="text-xs text-tan-400 mb-2">Required Tasks</div>
                                    <div className="space-y-2">
                                        {task.requiredTasks.map((reqTaskId) => {
                                            const reqTask = tasksData[reqTaskId];
                                            if (!reqTask) {
                                                console.warn(`Required Task ${reqTaskId} from ${task.id} was not found in tasksData`);
                                                return null;
                                            }

                                            const reqTaskStatus = userProgress.tasks[reqTaskId] || 'locked';
                                            const reqStatusConfig = getStatusConfig(reqTaskStatus, onStatusChange, reqTaskId);

                                            return (
                                                <Link
                                                    key={reqTaskId}
                                                    target="_blank"
                                                    href={`/tasks/${reqTaskId}`}
                                                    className={`block p-2 rounded border transition-all hover:bg-military-600/50 ${reqStatusConfig.borderColor} ${reqStatusConfig.bgColor}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {reqStatusConfig.icon}
                                                        <span
                                                            className="text-sm text-tan-200 flex-1 flex items-center gap-2">
                                                            {/* Corp Icon */}
                                                            <Image
                                                                src={corps[reqTask.corpId]?.icon}
                                                                alt={corps[reqTask.corpId]?.name || reqTask.corpId}
                                                                unoptimized={true}
                                                                className="w-6 h-6 object-contain flex-shrink-0"
                                                                width={24}
                                                                height={24}
                                                            />
                                                            {/* Task Order and Name */}
                                                            <span>
                                                                <span className="text-tan-400">{reqTask.order}:</span> {reqTask.name}
                                                            </span>
                                                        </span>
                                                        <ChevronRight size={14} className="text-tan-400"/>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-military-600/30 rounded p-3">
                                    <div className="text-xs text-tan-400 mb-1">Required Tasks</div>
                                    <div className="text-sm text-tan-400">No task prerequisites</div>
                                </div>
                            )}
                        </div>
                    </div>) : null}

                    {/* Pre Rewards */}
                    {task.preReward && task.preReward.length > 0 && (
                        <div>
                            <h5 className="font-medium text-tan-100 mb-2 flex items-center gap-2">
                                <Package size={16}/>
                                Starting Items
                            </h5>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                {task.reward.map((reward, index) => renderReward(reward, index, getItemById))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Row: Maps and Types on mobile screen */}
                    <div className="grid lg:hidden grid-cols-2 gap-4">
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
                    {/* Action Button */}
                    {statusConfig.actionButton && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                        >
                            {statusConfig.actionButton}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
        ;
}
'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {
    MapPin,
    Award,
    Package,
    Lock,
    CheckCircle2,
    ExternalLink, ChevronLeft, Map,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {tasksData, corps} from '@/data/tasks';
import {UserProgress} from '@/types/tasks';
import {useFetchItems} from '@/hooks/useFetchItems';
import {
    getStatusConfig,
    getTaskStatus,
    getTaskTypeIcon,
    getYouTubeEmbedUrl, getYouTubeUrl,
    quickHighlight,
    renderReward, RenderTipsContent
} from "@/app/tasks/taskHelpers";
import Image from "next/image";
import {communityCreatorMap} from "@/data/community";
import {TaskCorrectionFormAuth} from "@/components/corrections/TaskCorrectionForm";

interface TaskPageContentProps {
    taskId: string;
}

const STORAGE_KEY = 'exfil-zone-tasks-progress';

export default function TaskPageContent({taskId}: TaskPageContentProps) {
    const {getItemById} = useFetchItems();
    const task = tasksData[taskId];
    const merchant = task ? corps[task.corpId] : null;

    const [userProgress, setUserProgress] = useState<UserProgress>({
        tasks: {},
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load progress from localStorage
    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem(STORAGE_KEY);
            if (savedProgress) {
                const parsedProgress: UserProgress = JSON.parse(savedProgress);
                setUserProgress(parsedProgress);
            }
        } catch (error) {
            console.error('Failed to load task progress:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);


    if (isLoading || !task || !merchant) {
        return null; // Suspense handles the loading state
    }

    const taskStatus = getTaskStatus(task, userProgress);
    const config = getStatusConfig(taskStatus);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 mb-6 text-sm md:text-base text-tan-300">
                    <Link href="/tasks" className="flex items-center gap-1 hover:text-olive-400 transition-colors">
                        <ChevronLeft size={16}/>
                        <span>Tasks</span>
                    </Link>
                    <span>/</span>
                    <Link
                        href={`/tasks?merchant=${task.corpId}`}
                        className="hover:text-olive-400 transition-colors"
                    >
                        {merchant.name || task.corpId}
                    </Link>
                    <span>/</span>
                    <span>{task.name}</span>
                </nav>

                {/* Header */}
                <div className={`mb-8 border-l-4 pl-4 ${config.borderColor}`}>
                    <div className="flex items-center gap-1 lg:gap-2  mb-1">
                        <div className="inline-block p-1 rounded-sm bg-military-800/80">
                            <span className={`text-xs md:text-sm ${config.tabTextActive}`}>
                              {config.label}
                            </span>
                        </div>
                        <TaskCorrectionFormAuth task={task} />
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2 mb-1">
                        <Image
                            src={merchant?.icon || "/globe.svg"}
                            alt={merchant?.name || task.corpId}
                            unoptimized={true}
                            className="w-5 h-5 lg:w-8 lg:h-8 object-contain flex-shrink-0"
                            width={24}
                            height={24}
                        />
                        <h1 className="vr-heading font-bold text-tan-100">{task.order}: {task.name}</h1>
                    </div>
                    <div
                        className="flex items-center gap-2 flex-wrap">
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
                        ))}
                    </div>
                </div>

                {/* Main Content */}


                    {/* Task Description */}
                    <div className="hidden military-box rounded-sm p-3 sm:p-6  sm:grid sm:grid-cols-4 gap-6 mb-6">
                        <h2 className="col-span-4 vr-heading-2">
                            <span className="text-olive-400">{merchant?.name || 'CORP'}</span>
                            <span
                                className="text-tan-100 ml-1">{merchant?.merchant || task.corpId.toUpperCase()}</span>
                        </h2>

                        <div className="col-span-1">
                            {/* Merchant Image */}
                            <Image
                                src={merchant?.merchantIcon || "/globe.svg"}
                                alt={merchant?.merchant || task.corpId}
                                unoptimized={true}
                                className="w-full h-auto object-cover rounded"
                                width={128}
                                height={128}
                            />
                        </div>
                        <p className="text-tan-300 leading-relaxed bg-military-700 rounded-sm col-span-3 p-4 ">{quickHighlight(task.description)}</p>
                    </div>

                    {task.videoGuides.length ? (
                        <section className="military-box rounded-sm p-3 sm:p-6 mb-8">
                            <h2 className="vr-heading-2 text-tan-100 mb-4">Video Walkthrough</h2>
                            <div className="relative w-full aspect-video bg-military-700 rounded overflow-hidden">
                                <iframe
                                    src={getYouTubeEmbedUrl(task.videoGuides[0].ytId, task.videoGuides[0].startTs )}
                                    title={`${task.name} Video Guide`}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            {task.videoGuides.length > 1 && (
                                <div className="space-y-2">
                                    <h3 className="vr-heading-3 text-tan-100 my-2">Other Walkthroughs</h3>
                                    {task.videoGuides.map(({author, ytId, startTs }, index) => {
                                        if (index===0 || !author || !ytId || !(author in communityCreatorMap)) { return null }
                                        const communityAuthor = communityCreatorMap[author as keyof typeof communityCreatorMap];
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
                            )}
                        </section>
                    ) : null}

                    {/* Content Grid */}
                    <div className="military-box rounded-sm p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Objectives */}
                            <section>
                                <h2 className="vr-heading-2 text-tan-100 mb-4">Objectives</h2>
                                <div className="space-y-3">
                                    {task.objectives.map((objective, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-military-600/30 rounded"
                                        >
                                            <span className="text-tan-500 font-mono text-sm mt-0.5">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                            <p className="text-tan-200 flex-1">{objective}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Tips */}
                            {task.tips && (
                                <section>
                                    <h2 className="vr-heading-2 text-tan-100 mb-4">Tips & Strategies</h2>
                                    <div className="space-y-3">
                                        <div
                                            className="p-3 bg-military-600/30 rounded border-l-2 border-olive-600 text-tan-200"
                                        >
                                            <RenderTipsContent content={task.tips}/>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Prerequisites */}
                            {task.requiredTasks && task.requiredTasks.length > 0 && (
                                <section>
                                    <h2 className="vr-heading-2 text-tan-100 mb-4">Prerequisites</h2>
                                    <div className="space-y-3">
                                        {task.requiredTasks.map((reqTaskId) => {
                                            const reqTask = tasksData[reqTaskId];
                                            if (!reqTask) return null;

                                            const reqTaskStatus = userProgress.tasks[reqTaskId] || 'locked';
                                            const isCompleted = reqTaskStatus === 'completed';

                                            return (
                                                <Link
                                                    key={reqTaskId}
                                                    href={`/tasks/${reqTaskId}`}
                                                    className={`block p-4 rounded border transition-all hover:bg-military-600/50 ${
                                                        isCompleted
                                                            ? 'border-olive-600 bg-olive-900/20'
                                                            : 'border-red-600 bg-red-900/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {isCompleted ? (
                                                                <CheckCircle2 size={20} className="text-olive-400"/>
                                                            ) : (
                                                                <Lock size={20} className="text-red-400"/>
                                                            )}
                                                            <span className="text-tan-100 font-medium">
                                                                {reqTask.name}
                                                            </span>
                                                        </div>
                                                        <ExternalLink size={16} className="text-tan-500"/>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Task Info */}
                            <section className="bg-military-700/50 rounded p-4">
                                <h3 className="vr-heading-3 text-tan-100 mb-3">Task Information</h3>
                                <div className="space-y-3">
                                    {/*Required Level*/}
                                    {task.requiredLevel ? (
                                        <div>
                                            <p className="text-xs text-tan-400 mb-1">Required Level</p>
                                            <p className="text-tan-200">Level {task.requiredLevel}</p>
                                        </div>
                                    ) : null}
                                     {/*Maps */}
                                    {task.map && task.map.length > 0 && (
                                        <div>
                                            <p className="text-xs text-tan-400 mb-1">Maps</p>
                                            <div className="flex flex-wrap gap-2">
                                                {task.map.map((map) => (
                                                    <span
                                                        key={map}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-military-600 rounded text-xs text-tan-200"
                                                    >
                                                        <MapPin size={12}/>
                                                        {map}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                     {/*Task Types*/}
                                    {task.type && task.type.length > 0 && (
                                        <div>
                                            <p className="text-xs text-tan-400 mb-1">Task Types</p>
                                            <div className="flex flex-wrap gap-2">
                                                {task.type.map((type) => (
                                                    <span
                                                        key={type}
                                                        className={`inline-flex items-center gap-1 px-2 py-1 bg-military-600 rounded text-xs`}
                                                    >
                                                            {getTaskTypeIcon(type)}
                                                            <span className="capitalize">{type}</span>
                                                        </span>))
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Starting Items */}
                            {task.preReward && task.preReward.length > 0 && (
                                <section className="bg-military-700/50 rounded p-4">
                                    <h3 className="vr-heading-3 text-tan-100 mb-3 flex items-center gap-2">
                                        <Package size={18}/>
                                        Starting Items
                                    </h3>
                                    <div className="space-y-2">
                                        {task.preReward.map((reward, index) => (
                                            <div key={index}>
                                                {renderReward(reward, index, getItemById)}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Rewards */}
                            {task.reward && task.reward.length > 0 && (
                                <section className="bg-military-700/50 rounded p-4">
                                    <h3 className="vr-heading-3 text-tan-100 mb-3 flex items-center gap-2">
                                        <Award size={18}/>
                                        Rewards
                                    </h3>
                                    <div className="space-y-2">
                                        {task.reward.map((reward, index) => (
                                            <div key={index}>
                                                {renderReward(reward, index, getItemById)}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

            </div>
        </Layout>
    );
}
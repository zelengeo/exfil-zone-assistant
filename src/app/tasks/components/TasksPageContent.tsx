'use client';

import React, {useState, useEffect, useMemo} from 'react';
import {Search} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {tasksData, getAllMerchants} from '@/data/tasks';
import {UserProgress, TaskStatus} from '@/types/tasks';
import MerchantPanel from "@/app/tasks/components/MerchantPanel";
import {useFetchItems} from "@/hooks/useFetchItems";
import {communityCreatorMap} from "@/data/community";
import Link from "next/link";

// Types for component state
interface TasksPageState {
    searchQuery: string;
    userProgress: UserProgress;
    isLoading: boolean;
}

// Constants
const STORAGE_KEY = 'exfil-zone-tasks-progress';
const SEARCH_DEBOUNCE_MS = 300;

export default function TasksPageContent() {
    const {getItemById} = useFetchItems();
    // State management
    const [state, setState] = useState<TasksPageState>({
        searchQuery: '',
        userProgress: {
            tasks: {},
        },
        isLoading: true,
    });

    // Debounced search query
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Load progress from localStorage on mount
    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem(STORAGE_KEY);
            if (savedProgress) {
                const parsedProgress: UserProgress = JSON.parse(savedProgress);
                setState(prev => ({
                    ...prev,
                    userProgress: parsedProgress,
                    isLoading: false,
                }));
            } else {
                setState(prev => ({...prev, isLoading: false}));
            }
        } catch (error) {
            console.error('Failed to load task progress:', error);
            setState(prev => ({...prev, isLoading: false}));
        }
    }, []);

    // Save progress to localStorage when it changes
    useEffect(() => {
        if (!state.isLoading) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userProgress));
            } catch (error) {
                console.error('Failed to save task progress:', error);
            }
        }
    }, [state.userProgress, state.isLoading]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(state.searchQuery);
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [state.searchQuery]);

    // Filter and search tasks
    const filteredTasks = useMemo(() => {
        const allTasks = Object.values(tasksData);

        return allTasks.filter(task => {
            // Search filter
            if (debouncedSearchQuery) {
                const query = debouncedSearchQuery.toLowerCase();
                const matchesName = task.name.toLowerCase().includes(query);
                const matchesObjectives = task.objectives.some(obj =>
                    obj.toLowerCase().includes(query)
                );
                if (!matchesName && !matchesObjectives) return false;
            }

            return true;
        }).map(task => task.id);
    }, [debouncedSearchQuery]);

    // Update task status
    const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
        setState(prev => ({
            ...prev,
            userProgress: {
                ...prev.userProgress,
                tasks: {
                    ...prev.userProgress.tasks,
                    [taskId]: newStatus,
                }
            },
        }));
    };

    // Handle search input
    const handleSearchChange = (query: string) => {
        setState(prev => ({...prev, searchQuery: query}));
    };


    // Loading state
    if (state.isLoading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="military-box p-8 rounded-sm text-center">
                            <div
                                className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Tasks Database</h2>
                            <p className="text-tan-300">Retrieving mission data and progress tracking...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2 military-stencil">
                        TASKS & MISSIONS
                    </h1>
                    <p className="text-tan-300 max-w-3xl">
                        Track your mission progress, view rewards, and plan your next objectives.
                        Complete tasks to earn reputation with merchants and unlock new equipment.
                    </p>
                </div>

                {/* Search and Controls */}
                <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tan-400 w-4 h-4"/>
                        <input
                            type="text"
                            placeholder="Search tasks and objectives..."
                            value={state.searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-military-800 border border-military-600
                       rounded-sm text-tan-100 placeholder-tan-400 focus:outline-none text-sm lg:text-md
                       focus:border-olive-600 focus:ring-1 focus:ring-olive-600"
                        />
                        {state.searchQuery && (
                            <button
                                onClick={() => handleSearchChange('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tan-400
                         hover:text-tan-200 transition-colors border-0"
                            >
                                ×
                            </button>
                        )}
                    </div>

                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-6">
                    {getAllMerchants().map(merchant => (
                        <MerchantPanel key={merchant}
                                       merchant={merchant}
                                       filteredTasks={filteredTasks}
                                       searchQuery={state.searchQuery}
                                       userProgress={state.userProgress}
                                       onTaskStatusChange={updateTaskStatus}
                                       getItemById={getItemById}
                        />))}
                </div>
                <div className="text-sm text-tan-400 mt-8 p-4 border-t border-military-600">
                    <p>Some task data sourced by <Link href={communityCreatorMap.plumberKarl.link} target="_blank"
                                                       rel="noopener noreferrer" className="text-olive-400 hover:text-olive-300">@{communityCreatorMap.plumberKarl.name}</Link>. If you find any inconsistencies, please report them on our{' '}
                        <Link
                            href="https://discord.gg/2FCDZK6C25"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                        >
                            Discord server
                        </Link>.</p>
                </div>
            </div>
        </Layout>
    );
}
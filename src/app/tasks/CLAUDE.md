# Tasks Feature Documentation

## Documentation Hierarchy

**Parent:** [App Router](../CLAUDE.md) - Next.js pages & routing
**Root:** [Root CLAUDE.md](../../../CLAUDE.md) - Project overview
**Index:** [CLAUDE-INDEX.md](../../../CLAUDE-INDEX.md) - Complete navigation

**Related Documentation:**
- [Services](../../services/CLAUDE.md) - Data access patterns
- [Types](../../types/CLAUDE.md) - Task types and interfaces
- [Components](../../components/CLAUDE.md) - Reusable component patterns
- [Public Data](../../../public/data/CLAUDE.md) - Task JSON schemas

**See Also:**
- For localStorage patterns, see [Services CLAUDE.md](../../services/CLAUDE.md) - StorageService
- For task type definitions, see [Types CLAUDE.md](../../types/CLAUDE.md) - Tasks Types
- For component styling, see [Components CLAUDE.md](../../components/CLAUDE.md)

---

## Overview

The **Tasks feature** provides a comprehensive mission tracking system for Contractors Showdown: ExfilZone. Users can:

- Browse all tasks organized by merchant/corp
- Track task completion status (locked, active, completed)
- View task prerequisites and unlock progress
- See task rewards (money, XP, reputation, items)
- Search tasks by name or objectives
- View detailed task guides with objectives, tips, and walkthroughs
- Persist progress to localStorage

**Routes:**
- `/tasks` - Tasks list page with merchant panels
- `/tasks/[id]` - Task detail page with full guide

**Key Features:**
- **Status tracking:** Locked, active, completed states
- **Prerequisite system:** Tasks unlock based on completed prerequisites
- **Merchant reputation:** Track rep progress with each corp
- **LocalStorage persistence:** Progress saved automatically
- **Search functionality:** Debounced search across tasks
- **Video walkthroughs:** Embedded YouTube guides

---

## Directory Structure

```
app/tasks/
├── [id]/                          # Dynamic route for task details
│   ├── components/                # Task detail components
│   │   └── TaskPageContent.tsx   # Task detail page content
│   └── page.tsx                   # Task detail page (static params)
├── components/                     # Tasks list components
│   ├── MerchantPanel.tsx          # Merchant panel wrapper
│   ├── MerchantPanelCollapsed.tsx # Collapsed merchant view
│   ├── MerchantPanelExpanded.tsx  # Expanded merchant view
│   ├── TaskCard.tsx               # Individual task card
│   └── TasksPageContent.tsx       # Main list page content
├── taskHelpers.tsx                 # Utility functions
├── page.tsx                        # Tasks list page (server component)
└── TasksRouteSpecification.md      # Feature specification
```

---

## Tasks List Page

### Route: `/tasks`

**File:** `app/tasks/page.tsx`

**Pattern:** Server Component with Suspense

```typescript
import { Suspense } from 'react';
import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import TasksPageContent from './components/TasksPageContent';

export const metadata: Metadata = {
    title: 'Tasks Tracker',
    description: 'Complete mission database for Contractors Showdown ExfilZone...',
    keywords: ['tasks guide', 'ExfilZone tasks', 'ExfilZone quests'],
    openGraph: {
        title: 'Task Tracker - ExfilZone Assistant',
        description: 'Complete mission database with rewards, requirements, and walkthroughs.',
        type: 'website',
        images: [
            {
                url: '/og/og-image-task-manager.jpg',
                width: 1200,
                height: 630,
                alt: 'Tasks Tracker - ExfilZone Assistant',
            }
        ],
    },
};

// Loading component for Suspense fallback
function TasksLoading() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="military-box p-8 rounded-sm text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Tasks Database</h2>
                        <p className="text-tan-300">Retrieving mission data and progress tracking...</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Main page component - server component
export default function TasksPage() {
    return (
        <Suspense fallback={<TasksLoading />}>
            <TasksPageContent />
        </Suspense>
    );
}
```

**Key Features:**
- Server component wrapper
- Suspense boundary for loading state
- SEO metadata with Open Graph and Twitter cards
- Custom loading spinner with military theme

---

## Tasks List Content Component

### Component: `TasksPageContent`

**File:** `app/tasks/components/TasksPageContent.tsx`

**Pattern:** Client Component with localStorage integration

```typescript
'use client';

import React, {useState, useEffect, useMemo} from 'react';
import {Search} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {tasksData, getAllMerchants} from '@/data/tasks';
import {UserProgress, TaskStatus} from '@/types/tasks';
import MerchantPanel from "@/app/tasks/components/MerchantPanel";
import {useFetchItems} from "@/hooks/useFetchItems";
import {StorageService} from "@/services/StorageService";

// Types for component state
interface TasksPageState {
    searchQuery: string;
    userProgress: UserProgress;
    isLoading: boolean;
}

// Constants
const SEARCH_DEBOUNCE_MS = 300;

export default function TasksPageContent() {
    const {getItemById} = useFetchItems();

    // State management
    const [state, setState] = useState<TasksPageState>({
        searchQuery: '',
        userProgress: { tasks: {} },
        isLoading: true,
    });

    // Debounced search query
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Load progress from localStorage on mount
    useEffect(() => {
        try {
            const savedProgress = StorageService.getTasks();
            if (savedProgress) {
                setState(prev => ({
                    ...prev,
                    userProgress: savedProgress,
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
                StorageService.setTasks(state.userProgress);
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

    // Filter tasks based on search
    const filteredTasks = useMemo(() => {
        const allTasks = Object.values(tasksData);

        return allTasks.filter(task => {
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

    // Component JSX...
}
```

**Key Features:**
- **LocalStorage integration:** Automatic save/load of progress
- **Debounced search:** 300ms delay to prevent excessive filtering
- **State consolidation:** Single state object for search + progress
- **Error handling:** Try/catch for localStorage operations
- **Memoized filtering:** useMemo for efficient search results

**State Management:**
- `state.searchQuery` - Search input value
- `state.userProgress` - User's task completion status
- `state.isLoading` - Initial load state for localStorage
- `debouncedSearchQuery` - Debounced search for filtering

**LocalStorage Pattern:**
```typescript
// Load on mount
const savedProgress = StorageService.getTasks();

// Save on progress change
useEffect(() => {
    if (!state.isLoading) {
        StorageService.setTasks(state.userProgress);
    }
}, [state.userProgress, state.isLoading]);
```

**Search Debouncing:**
```typescript
useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearchQuery(state.searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
}, [state.searchQuery]);
```

---

## Merchant Panel Component

### Component: `MerchantPanel`

**File:** `app/tasks/components/MerchantPanel.tsx`

**Pattern:** Wrapper component with expand/collapse

```typescript
'use client';

import React, {useState} from 'react';
import {MerchantPanelBaseProps} from "@/app/tasks/taskHelpers";
import {getTasksByMerchant} from "@/data/tasks";
import MerchantPanelCollapsed from "@/app/tasks/components/MerchantPanelCollapsed";
import MerchantPanelExpanded from "@/app/tasks/components/MerchantPanelExpanded";

export default function MerchantPanel({
    merchant,
    filteredTasks,
    searchQuery,
    userProgress,
    onTaskStatusChange,
    getItemById
}: MerchantPanelBaseProps & {filteredTasks: string[]}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const filteredMerchantTasks = getTasksByMerchant(merchant)
        .filter(task => filteredTasks.includes(task.id));

    const toggleMerchantExpanded = () => setIsExpanded(!isExpanded);

    return isExpanded ? (
        <MerchantPanelExpanded
            merchant={merchant}
            filteredMerchantTasks={filteredMerchantTasks}
            userProgress={userProgress}
            searchQuery={searchQuery}
            onTaskStatusChange={onTaskStatusChange}
            getItemById={getItemById}
            toggleMerchantExpanded={toggleMerchantExpanded}
        />
    ) : (
        <MerchantPanelCollapsed
            merchant={merchant}
            filteredMerchantTasks={filteredMerchantTasks}
            userProgress={userProgress}
            searchQuery={searchQuery}
            onTaskStatusChange={onTaskStatusChange}
            getItemById={getItemById}
            toggleMerchantExpanded={toggleMerchantExpanded}
        />
    );
}
```

**Key Features:**
- **Conditional rendering:** Shows collapsed or expanded view
- **Filtered tasks:** Only shows tasks matching search
- **Toggle state:** Local state for expand/collapse

### MerchantPanelCollapsed

**File:** `app/tasks/components/MerchantPanelCollapsed.tsx`

Displays:
- Merchant name and icon
- Task counts (completed/active/locked)
- Reputation progress bar
- Merchant level
- Expand button

### MerchantPanelExpanded

**File:** `app/tasks/components/MerchantPanelExpanded.tsx`

Displays:
- All features from collapsed view
- Tabbed interface (Active, Locked, Completed)
- Task cards for each tab
- Collapse button

**Tab System:**
```typescript
const tabs = ['active', 'locked', 'completed'] as TaskStatus[];
const [activeTab, setActiveTab] = useState<TaskStatus>('active');

// Filter tasks by tab
const tabTasks = filteredMerchantTasks.filter(task =>
    getTaskStatus(task, userProgress) === activeTab
);
```

---

## Task Card Component

### Component: `TaskCard`

**File:** `app/tasks/components/TaskCard.tsx`

**Pattern:** Presentational component with status actions

```typescript
interface TaskCardProps {
    task: Task;
    status: TaskStatus;
    userProgress: UserProgress;
    onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    getItemById: (id: string) => Item | undefined;
}

export default function TaskCard({
    task,
    status,
    userProgress,
    onTaskStatusChange,
    getItemById
}: TaskCardProps) {
    const statusConfig = getStatusConfig(status, onTaskStatusChange, task.id);

    return (
        <div className={`military-card border-l-4 ${statusConfig.borderColor} p-4`}>
            {/* Task header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <Link href={`/tasks/${task.id}`}>
                        <h3 className="text-lg font-bold text-tan-100 hover:text-olive-400 transition-colors">
                            {task.name}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-tan-400 mt-1">
                        <span>{statusConfig.label}</span>
                        {/* Task type badges */}
                        {task.type?.map(type => (
                            <span key={type} className="px-1.5 py-0.5 bg-military-700 rounded">
                                {getTaskTypeIcon(type)}
                                {type}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Status action button */}
                {statusConfig.actionButton}
            </div>

            {/* Task objectives */}
            <div className="mb-3">
                <h4 className="text-sm font-semibold text-olive-400 mb-1">Objectives:</h4>
                <ul className="text-sm text-tan-300 space-y-1">
                    {task.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="text-olive-600">•</span>
                            <span>{obj}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Task rewards */}
            <div>
                <h4 className="text-sm font-semibold text-olive-400 mb-2">Rewards:</h4>
                <div className="grid grid-cols-2 gap-2">
                    {task.reward.map((reward, i) =>
                        renderReward(reward, i, getItemById)
                    )}
                </div>
            </div>

            {/* Prerequisites */}
            {task.requiredTasks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-military-600">
                    <p className="text-xs text-tan-400">
                        Requires: {task.requiredTasks.length} task(s) completed
                    </p>
                </div>
            )}
        </div>
    );
}
```

**Key Features:**
- **Status-based styling:** Border color changes with status
- **Action buttons:** Mark complete/incomplete (if allowed)
- **Prerequisites display:** Shows unlock requirements
- **Reward visualization:** Icons for money, XP, rep, items
- **Task type badges:** Icons for reach, extract, eliminate, etc.
- **Link to detail:** Click task name to see full guide

---

## Task Detail Page

### Route: `/tasks/[id]`

**File:** `app/tasks/[id]/page.tsx`

**Pattern:** Static generation with metadata

```typescript
import {Suspense, use} from 'react';
import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Layout from '@/components/layout/Layout';
import TaskPageContent from './components/TaskPageContent';
import {corps, tasksData} from '@/data/tasks';

interface TaskPageProps {
    params: Promise<{
        id: string;
    }>;
}

// Generate metadata for each task page
export async function generateMetadata({params}: TaskPageProps): Promise<Metadata> {
    const {id} = await params;
    const task = tasksData[id];

    if (!task) {
        return {
            title: 'Task Not Found',
            description: 'The requested task could not be found.',
        };
    }

    const merchant = corps[task.corpId];

    return {
        title: `${task.name} - Task Guide`,
        description: `Complete guide for "${task.name}" task in Contractors Showdown ExfilZone.`,
        keywords: [task.name, 'ExfilZone mission', 'task walkthrough', ...task.type || []],
        openGraph: {
            title: `${task.name} Guide - ExfilZone Assistant`,
            description: `Complete guide with objectives, rewards, and prerequisites.`,
            type: 'website',
            images: [{
                url: merchant?.ogImage || '/og/og-image-task-manager.jpg',
                width: 1200,
                height: 630,
            }],
        },
    };
}

// Generate static params for all tasks
export async function generateStaticParams() {
    return Object.keys(tasksData).map((id) => ({
        id: id,
    }));
}

// Main page component
export default function TaskPage({params}: TaskPageProps) {
    const {id} = use(params);
    const task = tasksData[id];

    if (!task) {
        notFound();
    }

    return (
        <Suspense fallback={<TaskLoading/>}>
            <TaskPageContent taskId={id}/>
        </Suspense>
    );
}
```

**Key Features:**
- **Static generation:** `generateStaticParams()` for all tasks
- **Dynamic metadata:** SEO-optimized for each task
- **Merchant OG images:** Merchant-specific Open Graph images
- **Not found handling:** 404 for invalid task IDs
- **Suspense boundary:** Loading state while content loads

**Task Detail Content:**
Displays:
- Task name, status, merchant
- Full objectives list with highlighting
- Prerequisites (with completion status)
- Rewards breakdown
- Tactical tips and strategies
- Video walkthrough (embedded YouTube)
- Map locations (if applicable)
- Related tasks

---

## Task Helpers & Utilities

### File: `app/tasks/taskHelpers.tsx`

**Core Helper Functions:**

#### getTaskStatus
```typescript
export const getTaskStatus = (task: Task, userProgress: UserProgress): TaskStatus => {
    const progress = userProgress.tasks[task.id];
    if (progress) return progress;

    // Check if task is locked due to prerequisites
    const hasUnmetPrerequisites = task.requiredTasks.some(reqTaskId => {
        const reqTaskStatus = userProgress.tasks[reqTaskId];
        return !reqTaskStatus || (reqTaskStatus !== 'completed');
    });

    return hasUnmetPrerequisites ? 'locked' : 'active';
};
```

**Logic:**
1. Check if user has explicitly set status
2. If not, check prerequisites
3. If any prereq incomplete → locked
4. Otherwise → active

#### getTaskCounts
```typescript
export const getTaskCounts = (tasks: Task[], userProgress: UserProgress) => {
    const counts = {
        completed: 0,
        active: 0,
        locked: 0
    } as Record<TaskStatus, number>;

    tasks.forEach(task => {
        const status = getTaskStatus(task, userProgress);
        counts[status]++;
    });

    return counts;
};
```

Returns counts for each status category.

#### getCurrentReputation
```typescript
export const getCurrentReputation = (merchantId: string, userProgress: UserProgress) => {
    const reputationObject = {
        currentReputation: 0,
        reputationMax: 0,
        merchantLevel: 1
    };

    getTasksByMerchant(merchantId).forEach((task) => {
        const repReward = task.reward.find(r => r.type === 'reputation' && r.corpId === merchantId);

        if (getTaskStatus(task, userProgress) === 'completed') {
            reputationObject.currentReputation += (repReward?.quantity || 0);
        }

        reputationObject.reputationMax += (repReward?.quantity || 0);
    });

    reputationObject.merchantLevel = corps[merchantId].levelCap
        .findLastIndex(value => value <= reputationObject.currentReputation) + 2;

    return reputationObject;
};
```

Calculates:
- Current reputation with merchant
- Max possible reputation
- Current merchant level (based on levelCap thresholds)

#### getStatusConfig
```typescript
export const getStatusConfig = (
    status: TaskStatus,
    onStatusChange?: (taskId: string, newStatus: TaskStatus) => void,
    taskId?: string,
    isDisabled?: boolean
) => {
    const isActionDisabled = isDisabled || !onStatusChange || !taskId;

    switch (status) {
        case 'active':
            return {
                borderColor: 'border-green-600/50',
                bgColor: 'bg-military-700',
                icon: <Clock size={16} className="text-green-400"/>,
                label: 'Active',
                badgeColor: 'bg-green-600/40',
                actionButton: (
                    <Button onClick={() => onStatusChange(taskId, 'completed')}>
                        Mark Complete
                    </Button>
                ),
            };
        case 'completed':
            return {
                borderColor: 'border-olive-600/30',
                icon: <CheckCircle size={16} className="text-olive-400"/>,
                label: 'Completed',
                actionButton: (
                    <Button onClick={() => onStatusChange(taskId, 'active')}>
                        Mark Incomplete
                    </Button>
                ),
            };
        case 'locked':
            return {
                borderColor: 'border-red-600/30',
                icon: <Lock size={16} className="text-red-400"/>,
                label: 'Locked',
                actionButton: null,
            };
    }
};
```

Returns configuration object with:
- Border/background colors
- Status icon
- Label text
- Action button (if applicable)
- Tab styling for expanded view

#### renderReward
```typescript
export const renderReward = (
    reward: TaskReward,
    index: number,
    getItemById: (id: string) => Item | undefined
) => {
    const isWeaponIcon = (reward.type === "item") &&
        reward.item_id &&
        (getItemById(reward.item_id)?.category === "weapons");

    return (
        <div key={index} className="bg-military-800 p-3 rounded flex items-center gap-2">
            {/* Reward Icon/Image */}
            <div className={`${isWeaponIcon ? "w-20" : "w-10"} h-10`}>
                {reward.type === 'money' && (
                    <div className="w-10 h-10 bg-military-600 border border-yellow-600/50 rounded flex items-center justify-center">
                        <DollarSign size={16} className="text-yellow-400"/>
                    </div>
                )}

                {reward.type === 'experience' && (
                    <div className="w-10 h-10 bg-military-600 border border-tan-500/50 rounded flex items-center justify-center text-tan-200 font-bold text-xs">
                        XP
                    </div>
                )}

                {reward.type === 'reputation' && (
                    <div className="w-10 h-10 rounded bg-military-600">
                        <Image
                            src={corps[reward.corpId]?.icon || '/images/corps/default.png'}
                            alt={reward.corpId || 'reputation'}
                            unoptimized={true}
                            width={32}
                            height={32}
                        />
                    </div>
                )}

                {reward.type === 'item' && reward.item_id && (
                    <Link href={`/items/${reward.item_id}`} target="_blank">
                        <Image
                            src={getItemById(reward.item_id)?.images?.icon || '/images/items/default.png'}
                            alt={reward.item_id}
                            unoptimized={true}
                            className={`w-full h-full ${isWeaponIcon ? "object-contain" : "object-cover"} hover:scale-110 transition-transform`}
                            width={40}
                            height={40}
                        />
                    </Link>
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
                        {getItemById(reward.item_id)?.name || reward.item_name || 'Unknown Item'}
                    </div>
                )}
            </div>
        </div>
    );
};
```

Renders reward with:
- Type-specific icon (money, XP, rep, item)
- Quantity display
- Item name (if item reward)
- Link to item page (if item)
- Weapon-specific sizing (wider for weapons)

#### getTaskTypeIcon
```typescript
export const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
        case 'reach': return <MapPin size={12}/>;
        case 'extract': return <Plane size={12}/>;
        case 'retrieve': return <Search size={12}/>;
        case 'eliminate': return <Crosshair size={12}/>;
        case 'submit': return <BookUp2 size={12}/>;
        case 'mark': return <Flag size={12}/>;
        case 'place': return <Package size={12}/>;
        case 'photo': return <Camera size={12}/>;
        case 'signal': return <Sparkle size={12}/>;
        default: return <Target size={12}/>;
    }
};
```

Returns lucide-react icon for each task type.

#### parseMarkdownLinks
```typescript
export function parseMarkdownLinks(text: string) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Add the link
        parts.push({
            type: 'link',
            text: match[1],
            url: match[2]
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}
```

Parses markdown-style links `[text](url)` into array of strings and link objects for rendering.

#### RenderTipsContent
```typescript
export const RenderTipsContent = ({content}: { content: string }) => {
    const parts = parseMarkdownLinks(content);

    return (
        <>
            {parts.map((part, index) => {
                if (typeof part === 'string') {
                    return <span key={index}>{part}</span>;
                } else {
                    return (
                        <Link
                            key={index}
                            target="_blank"
                            href={part.url}
                            className="text-olive-400 hover:text-olive-300 underline transition-colors"
                        >
                            {part.text}
                        </Link>
                    );
                }
            })}
        </>
    );
};
```

Component to render parsed markdown links with styling.

#### YouTube URL Helpers
```typescript
// Normal YouTube URL with UTM params
export function getYouTubeUrl(videoId: string, startTime?: number): string {
    let url = `https://www.youtube.com/watch?v=${videoId}`;
    if (startTime && startTime > 0) {
        url += `&t=${startTime}s`;
    }
    return url + "&utm_source=exfil-zone-assistant.app&utm_campaign=task-click&utm_medium=web";
}

// YouTube embed URL
export function getYouTubeEmbedUrl(videoId: string, startTime?: number): string {
    let url = `https://www.youtube-nocookie.com/embed/${videoId}`;
    if (startTime && startTime > 0) {
        url += `?start=${startTime}`;
    }
    return url;
}
```

---

## Task Data Structure

### Task Interface

**File:** `src/types/tasks.ts`

```typescript
export interface Task {
    id: string;
    name: string;
    corpId: string;               // Merchant ID
    objectives: string[];          // Task objectives
    reward: TaskReward[];          // Rewards array
    requiredTasks: string[];       // Prerequisite task IDs
    type?: TaskType[];             // Task types (reach, extract, etc.)
    tips?: string;                 // Tactical tips
    video?: {                      // Walkthrough video
        videoId: string;
        startTime?: number;
    };
}

export interface TaskReward {
    type: 'money' | 'experience' | 'reputation' | 'item';
    quantity: number;
    corpId?: string;               // For reputation rewards
    item_id?: string;              // For item rewards
    item_name?: string;            // Fallback item name
}

export type TaskStatus = 'locked' | 'active' | 'completed';

export type TaskType =
    | 'reach'      // Reach location
    | 'extract'    // Extract from raid
    | 'retrieve'   // Find item
    | 'eliminate'  // Kill target
    | 'submit'     // Submit item
    | 'mark'       // Mark location
    | 'place'      // Place item
    | 'photo'      // Take photo
    | 'signal'     // Signal/flare
    | 'survive';   // Survive condition

export interface UserProgress {
    tasks: Record<string, TaskStatus>;
}
```

**See:** [Public Data CLAUDE.md](../../../public/data/CLAUDE.md) for complete task data schemas

---

## Prerequisite System

### How Prerequisites Work

1. **Task Definition:**
```typescript
const task = {
    id: 'task-3',
    name: 'Advanced Mission',
    requiredTasks: ['task-1', 'task-2'], // Must complete these first
    // ...
};
```

2. **Status Calculation:**
```typescript
const getTaskStatus = (task, userProgress) => {
    // Check user's explicit status
    if (userProgress.tasks[task.id]) {
        return userProgress.tasks[task.id];
    }

    // Check prerequisites
    const hasUnmetPrerequisites = task.requiredTasks.some(reqId => {
        const reqStatus = userProgress.tasks[reqId];
        return !reqStatus || reqStatus !== 'completed';
    });

    return hasUnmetPrerequisites ? 'locked' : 'active';
};
```

3. **Status Transitions:**
```
locked → active: All prerequisites completed
active → completed: User marks as complete
completed → active: User marks as incomplete (if allowed)
```

4. **Validation:**
```typescript
export function checkStatusAction(status: TaskStatus, userProgress: UserProgress, taskId: string) {
    switch (status) {
        case 'active':
            // Can mark as active if prerequisites complete
            return tasksData[taskId].requiredTasks.every(reqId =>
                userProgress.tasks[reqId] === 'completed'
            );
        case 'completed':
            // Can mark as complete if no dependent tasks are completed
            return Object.keys(userProgress.tasks).every(progressTaskId => {
                if (userProgress.tasks[progressTaskId] !== 'completed') return true;
                return !tasksData[progressTaskId]?.requiredTasks.includes(taskId);
            });
        case 'locked':
            return false; // Can't manually lock
    }
}
```

**Prevents:**
- Marking task complete if prerequisites not met
- Marking task incomplete if dependent tasks are complete

---

## LocalStorage Integration

### Pattern: StorageService

```typescript
import {StorageService} from "@/services/StorageService";

// Load on mount
useEffect(() => {
    const savedProgress = StorageService.getTasks();
    if (savedProgress) {
        setState(prev => ({
            ...prev,
            userProgress: savedProgress,
            isLoading: false,
        }));
    }
}, []);

// Save on change
useEffect(() => {
    if (!state.isLoading) {
        StorageService.setTasks(state.userProgress);
    }
}, [state.userProgress, state.isLoading]);
```

**StorageService Methods:**
- `getTasks()` - Load user progress from localStorage
- `setTasks(progress)` - Save user progress to localStorage
- Handles JSON serialization/parsing
- Returns null if no saved data

**Storage Key:** `'exfilzone_tasks_progress'`

**Data Format:**
```json
{
    "tasks": {
        "task-1": "completed",
        "task-2": "active",
        "task-3": "locked"
    }
}
```

---

## Merchant System

### Merchant/Corp Structure

```typescript
export interface Corp {
    id: string;
    name: string;
    icon: string;           // Merchant icon image
    ogImage?: string;       // Open Graph image for SEO
    levelCap: number[];     // Rep thresholds for each level
}

export const corps: Record<string, Corp> = {
    'merchant-1': {
        id: 'merchant-1',
        name: 'The Coordinator',
        icon: '/images/corps/coordinator.png',
        levelCap: [0, 100, 250, 450, 700, 1000],
    },
    // ...
};
```

### Merchant Panel Features

**Collapsed View:**
- Merchant name and icon
- Task counts (X completed / Y active / Z locked)
- Reputation progress bar
- Current merchant level
- Expand button

**Expanded View:**
- All collapsed view features
- Tabbed interface (Active, Locked, Completed)
- Task cards for each category
- Collapse button

**Reputation Calculation:**
```typescript
const {currentReputation, reputationMax, merchantLevel} = getCurrentReputation(merchantId, userProgress);

const progress = (currentReputation / reputationMax) * 100;
```

**Level Display:**
```
Level 3 (250 / 450 REP) ████████░░ 56%
```

---

## Search Functionality

### Debounced Search Pattern

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
}, [searchQuery]);

const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            return task.name.toLowerCase().includes(query) ||
                   task.objectives.some(obj => obj.toLowerCase().includes(query));
        }
        return true;
    }).map(task => task.id);
}, [debouncedSearchQuery]);
```

**Benefits:**
- Prevents excessive filtering on every keystroke
- 300ms delay after typing stops
- Memoized for performance
- Searches both name and objectives

---

## Video Walkthrough Integration

### YouTube Embed Pattern

```typescript
{task.video && (
    <div className="aspect-video mb-6">
        <iframe
            src={getYouTubeEmbedUrl(task.video.videoId, task.video.startTime)}
            title={`${task.name} Walkthrough`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded border border-military-600"
        />
    </div>
)}
```

**Features:**
- Optional start time for specific moments
- Privacy-enhanced mode (youtube-nocookie.com)
- UTM tracking for analytics
- Responsive aspect ratio

---

## Common Patterns

### DO's ✅

```typescript
// ✅ Use getTaskStatus for status calculation
const status = getTaskStatus(task, userProgress);

// ✅ Validate status changes
if (checkStatusAction('completed', userProgress, taskId)) {
    onTaskStatusChange(taskId, 'completed');
}

// ✅ Debounce search input
useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
}, [query]);

// ✅ Handle localStorage errors
try {
    const progress = StorageService.getTasks();
} catch (error) {
    console.error('Failed to load progress:', error);
}

// ✅ Use helper functions for rendering
renderReward(reward, index, getItemById);

// ✅ Memoize expensive computations
const filteredTasks = useMemo(() => {
    return tasks.filter(/* ... */);
}, [tasks, searchQuery]);
```

### DON'Ts ❌

```typescript
// ❌ Don't set status without validation
onTaskStatusChange(taskId, 'completed'); // Might break prerequisites

// ❌ Don't search without debouncing
const filtered = tasks.filter(t => t.name.includes(query)); // On every keystroke

// ❌ Don't access localStorage directly
localStorage.getItem('tasks'); // Use StorageService

// ❌ Don't manually calculate status without helpers
const status = userProgress.tasks[taskId] || 'active'; // Wrong - ignores prerequisites

// ❌ Don't render rewards without type checking
<img src={reward.item_id} /> // What if it's money or XP?
```

---

## Performance Optimizations

### Implemented Optimizations

1. **Debounced search:** 300ms delay prevents excessive filtering
2. **Memoized filtering:** `useMemo` for expensive computations
3. **Conditional rendering:** Collapsed vs expanded merchant panels
4. **Lazy loading:** Only render active tab's tasks
5. **LocalStorage caching:** Persist progress client-side
6. **Static generation:** `generateStaticParams` for all task detail pages

---

## Testing Considerations

### Unit Tests

**TaskCard Component:**
```typescript
describe('TaskCard', () => {
    it('renders task name and status', () => {
        render(<TaskCard task={mockTask} status="active" {...props} />);
        expect(screen.getByText(mockTask.name)).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('shows lock icon for locked tasks', () => {
        render(<TaskCard task={mockTask} status="locked" {...props} />);
        expect(screen.getByText('Locked')).toBeInTheDocument();
    });

    it('allows marking active task as complete', () => {
        const onStatusChange = jest.fn();
        render(<TaskCard task={mockTask} status="active" onTaskStatusChange={onStatusChange} />);

        fireEvent.click(screen.getByText('Mark Complete'));
        expect(onStatusChange).toHaveBeenCalledWith(mockTask.id, 'completed');
    });
});
```

**getTaskStatus Helper:**
```typescript
describe('getTaskStatus', () => {
    it('returns user-set status if exists', () => {
        const userProgress = { tasks: { 'task-1': 'completed' } };
        expect(getTaskStatus({id: 'task-1', requiredTasks: []}, userProgress)).toBe('completed');
    });

    it('returns locked if prerequisites not met', () => {
        const task = { id: 'task-2', requiredTasks: ['task-1'] };
        const userProgress = { tasks: {} };
        expect(getTaskStatus(task, userProgress)).toBe('locked');
    });

    it('returns active if prerequisites met', () => {
        const task = { id: 'task-2', requiredTasks: ['task-1'] };
        const userProgress = { tasks: { 'task-1': 'completed' } };
        expect(getTaskStatus(task, userProgress)).toBe('active');
    });
});
```

---

## External Resources

### Next.js & React
- **Static Params**: [nextjs.org/docs/app/api-reference/functions/generate-static-params](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- **Dynamic Metadata**: [nextjs.org/docs/app/building-your-application/optimizing/metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- **useMemo**: [react.dev/reference/react/useMemo](https://react.dev/reference/react/useMemo)

### LocalStorage
- **Web Storage API**: [developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

---

## Summary

The Tasks feature is a comprehensive mission tracking system with:
- **Status tracking** with prerequisite validation
- **Merchant organization** with reputation progress
- **LocalStorage persistence** for user progress
- **Debounced search** for performance
- **Video walkthroughs** with YouTube embeds
- **Static generation** for SEO
- **Military theme** throughout

All patterns follow the project's critical rules: No `any` types, Tailwind 4+ syntax, shadcn UI components, and type-safe implementations.

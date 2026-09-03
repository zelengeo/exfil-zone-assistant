'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { tasksData } from '@/data/tasks';
import { useTaskProgress } from '../../hooks/useTaskProgress';
import { ownerFace, ownerOf } from '../../utils/vendors';
import TaskDetailPane from '../../components/TaskDetailPane';

/**
 * One task on its own page.
 *
 * The same pane the chain column opens, in its page variant — a task is the same thing whether it
 * arrives beside its chain or as a shared link, and keeping two renderings of it in step is what
 * went wrong with the old route. What changes here is the surroundings: a breadcrumb back into the
 * chain instead of a column, and the related-task rows become links to other pages rather than a
 * selection within one.
 *
 * Progress comes from the same store as `/tasks`, so ticking an objective here shows up there.
 */

export default function TaskPageContent({ taskId }: { taskId: string }) {
    const { progress, hydrated, setDone, toggleObjective } = useTaskProgress();

    const task = tasksData[taskId];
    // The route already calls notFound() for an unknown id; this is the belt to that's braces.
    if (!task) return null;

    const owner = ownerOf(task);
    const face = ownerFace(owner);

    return (
        <div className="flex flex-col gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 flex-wrap">
                <Link href="/tasks" className="micro-label hover:text-ink-200 transition-colors flex items-center gap-1">
                    <ChevronLeft size={12} />
                    All chains
                </Link>
                <span className="text-line-500" aria-hidden="true">/</span>
                <Link href={`/tasks?vendor=${owner}`} className="micro-label hover:text-ink-200 transition-colors">
                    {face.org}
                </Link>
                <span className="text-line-500" aria-hidden="true">/</span>
                <span className="micro-label text-ink-300" aria-current="page">{task.name}</span>
            </nav>

            <TaskDetailPane
                task={task}
                progress={progress}
                hydrated={hydrated}
                onToggleObjective={toggleObjective}
                onSetDone={setDone}
                variant="page"
            />

            <Link
                href={`/tasks?vendor=${owner}&task=${task.id}`}
                className="micro-label text-ink-600 hover:text-ink-200 transition-colors self-start"
            >
                Open this task in the {face.org} chain →
            </Link>
        </div>
    );
}

import {Suspense} from 'react';
import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Layout from '@/components/layout/Layout';
import TaskPageContent from './components/TaskPageContent';
import {fetchTasks} from '@/services/TaskService';
import { breadcrumbData, taskMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const dynamicParams = false;

interface TaskPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({params}: TaskPageProps): Promise<Metadata> {
    const {id} = await params;
    const tasks = await fetchTasks();
    const task = tasks[id];
    if (!task) notFound();
    return taskMetadata(task, Object.values(tasks));
}

// Generate static params for all tasks
export async function generateStaticParams() {
    return Object.keys(await fetchTasks()).map((id) => ({
        id: id,
    }));
}

// Loading component for Suspense fallback
function TaskLoading() {
    return (
        <div className="flex items-center justify-center min-h-96">
            <div className="bg-steel-900 border border-line-900 px-6 py-5 text-center">
                <div className="eyebrow mb-2">Loading</div>
                <p className="text-sm text-ink-500">Reading the task…</p>
            </div>
        </div>
    );
}

// Main page component
export default async function TaskPage({params}: TaskPageProps) {
    const {id} = await params;
    const task = (await fetchTasks())[id];

    if (!task) {
        notFound();
    }

    return (
        <Layout fullWidth containerClassName="w-full max-w-[1100px] mx-auto px-3 sm:px-4 py-4">
            <JsonLd data={breadcrumbData([
                { name: 'Home', path: '/' },
                { name: 'Tasks', path: '/tasks' },
                { name: task.name, path: `/tasks/${id}` },
            ])} />
            <Suspense fallback={<TaskLoading/>}>
                <TaskPageContent taskId={id}/>
            </Suspense>
        </Layout>
    );
}

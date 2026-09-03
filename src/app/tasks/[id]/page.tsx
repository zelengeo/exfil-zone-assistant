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
        description: `Complete guide for "${task.name}" task in Contractors Showdown ExfilZone. View objectives, requirements, and tips.`,
        keywords: [
            task.name,
            'ExfilZone mission',
            'task walkthrough',
            ...task.type || [],
        ],
        openGraph: {
            title: `${task.name} Guide - ExfilZone Assistant`,
            description: `Complete guide for "${task.name}" including objectives, rewards, and prerequisites.`,
            type: 'website',
            images: [
                {
                    url: merchant?.ogImage || '/og/og-image-task-manager.jpg',
                    width: 1200,
                    height: 630,
                    alt: `${task.name} Task Guide - ExfilZone Assistant`,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${task.name} Guide - ExfilZone Assistant`,
            description: `Complete guide with objectives, rewards, and tips for this task.`,
        },
        alternates: {
            canonical: `/tasks/${id}`,
        },
    };
}

// Generate static params for all tasks
export async function generateStaticParams() {
    return Object.keys(tasksData).map((id) => ({
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
export default function TaskPage({params}: TaskPageProps) {
    const {id} = use(params);
    const task = tasksData[id];

    if (!task) {
        notFound();
    }

    return (
        <Layout fullWidth containerClassName="w-full max-w-[1100px] mx-auto px-3 sm:px-4 py-4">
            <Suspense fallback={<TaskLoading/>}>
                <TaskPageContent taskId={id}/>
            </Suspense>
        </Layout>
    );
}

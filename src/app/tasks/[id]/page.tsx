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
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="military-box p-8 rounded-sm text-center">
                        <div
                            className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Task Details</h2>
                        <p className="text-tan-300">Retrieving task information...</p>
                    </div>
                </div>
            </div>
        </Layout>
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
        <Suspense fallback={<TaskLoading/>}>
            <TaskPageContent taskId={id}/>
        </Suspense>
    );
}
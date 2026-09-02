
import { Suspense } from 'react';
import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import TasksPageContent from './components/TasksPageContent';

export const metadata: Metadata = {
    title: 'Tasks Tracker',
    description: 'Complete mission database for Contractors Showdown ExfilZone. Track your progress, view rewards, requirements, and walkthroughs for all missions.',
    keywords: [
        'tasks guide',
        'ExfilZone tasks',
        'ExfilZone quests',
        'ExfilZone missions',
    ],
    openGraph: {
        title: 'Task Tracker - ExfilZone Assistant',
        description: 'Complete mission database with rewards, requirements, and walkthroughs. Track your mission progress and remaining items.',
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
    twitter: {
        card: 'summary_large_image',
        title: 'Tasks Tracker - ExfilZone Assistant',
        description: 'Complete mission database with rewards, requirements, and progress tracking.',
    },
    alternates: {
        canonical: '/tasks',
    },
};

function TasksLoading() {
    return (
        <div className="flex items-center justify-center min-h-96">
            <div className="bg-steel-900 border border-line-900 px-6 py-5 text-center">
                <div className="eyebrow mb-2">Loading</div>
                <p className="text-sm text-ink-500">Reading the task chains…</p>
            </div>
        </div>
    );
}

/**
 * Full width rather than the default container: the route is three panes side by side, and the
 * 7xl container would leave the chain column too narrow to hold a task name.
 */
export default function TasksPage() {
    return (
        <Layout fullWidth containerClassName="max-w-[1600px] mx-auto px-3 sm:px-4 py-4">
            <Suspense fallback={<TasksLoading />}>
                <TasksPageContent />
            </Suspense>
        </Layout>
    );
}

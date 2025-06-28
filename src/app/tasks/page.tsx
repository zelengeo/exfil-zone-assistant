
import { Suspense } from 'react';
import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import TasksPageContent from './components/TasksPageContent';

export const metadata: Metadata = {
    title: 'Tasks Database',
    description: 'Complete mission database for Contractors Showdown Exfil Zone. Track your progress, view rewards, requirements, and walkthroughs for all missions.',
    keywords: [
        'tasks database',
        'tasks guide',
        'ExfilZone tasks',
        'ExfilZone quests',
    ],
    openGraph: {
        title: 'TasksDatabase - Exfil Zone Assistant',
        description: 'Complete mission database with rewards, requirements, and walkthroughs. Track your mission progress and remaining items.',
        type: 'website',
        images: [
            {
                url: '/og/og-image-tasks.jpg',
                width: 1200,
                height: 630,
                alt: 'Tasks Database - Exfil Zone Assistant',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tasks Database - Exfil Zone Assistant',
        description: 'Complete mission database with rewards, requirements, and progress tracking.',
    },
    alternates: {
        canonical: '/tasks',
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

// Main page component - server component following the established pattern
export default function TasksPage() {
    return (
        <Suspense fallback={<TasksLoading />}>
            <TasksPageContent />
        </Suspense>
    );
}
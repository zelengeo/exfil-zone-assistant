import { Suspense } from 'react';
import ItemsPageContent from './components/ItemsPageContent';
import Layout from '@/components/layout/Layout';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Item Database',
    description: 'Complete weapon and equipment database for Contractors Showdown ExfilZone. Stats, attachments, and detailed information for all items.',
    keywords: ['item wiki', 'weapon database', 'equipment guide', 'weapon stats', 'attachments', 'Contractors items'],
    openGraph: {
        title: 'Item Database - ExfilZone Assistant',
        description: 'Complete weapon and equipment database with stats, attachments, and detailed information.',
        type: 'website',
    },
};

// Loading component for Suspense fallback
function ItemsLoading() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="military-box p-8 rounded-sm text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Items Database</h2>
                        <p className="text-tan-300">Retrieving tactical equipment data...</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Main page component - now a server component
export default function ItemsPage() {
    return (
        <Suspense fallback={<ItemsLoading />}>
            <ItemsPageContent />
        </Suspense>
    );
}
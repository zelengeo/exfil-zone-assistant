import { Suspense } from 'react';
import ItemsPageContent from './components/ItemsPageContent';
import Layout from '@/components/layout/Layout';

import { Metadata } from 'next';

export const metadata: Metadata = {
    alternates: { canonical: '/items' },
    title: 'Item Database',
    description: 'Complete weapon and equipment database for Contractors Showdown ExfilZone. Stats, attachments, and detailed information for all items.',
    keywords: ['item wiki', 'weapon database', 'equipment guide', 'weapon stats', 'attachments', 'Contractors items'],
    openGraph: {
        title: 'Item Database - ExfilZone Assistant',
        description: 'Complete weapon and equipment database with stats, attachments, and detailed information.',
        type: 'website',
        images: [
            {
                url: '/og/og-image-items.jpg',
                width: 1200,
                height: 630,
                alt: 'Item database for weapons, armor, equipment, and valuables',
            },
        ],
    },
};

// Loading component for Suspense fallback
function ItemsLoading() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="bg-steel-900 border border-line-900 p-8 text-center">
                        <div className="eyebrow mb-2">Loading</div>
                        <p className="text-sm text-ink-500">Retrieving the item database…</p>
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

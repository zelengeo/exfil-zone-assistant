import { Suspense } from 'react';
import { Metadata } from 'next';
import GuidesPageContent from './components/GuidesPageContent';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
    title: 'Guides & Tutorials',
    description: 'Comprehensive guides and tutorials for Contractors Showdown Exfil Zone. Learn gameplay mechanics, strategies, loadouts, and VR-specific tips.',
    keywords: ['game guides', 'tutorials', 'strategies', 'tips', 'VR guides', 'Exfil Zone tutorials', 'beginner guide'],
    openGraph: {
        title: 'Guides & Tutorials',
        description: 'Master Contractors Showdown with our comprehensive guides. From beginner basics to advanced strategies.',
        type: 'website',
        images: [
            {
                url: '/og/og-image-guides.jpg',
                width: 1200,
                height: 630,
                alt: 'Exfil Zone Guides and Tutorials',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Guides & Tutorials - Exfil Zone Assistant',
        description: 'Master ExfilZone with comprehensive guides and strategies.',
    },
    alternates: {
        canonical: '/guides',
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
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Guides</h2>
                        <p className="text-tan-300">Retrieving tactical knowledge data...</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Main page component - now a server component
export default function GuidesPage() {
    return (
        <Suspense fallback={<ItemsLoading />}>
            <GuidesPageContent />
        </Suspense>
    );
}
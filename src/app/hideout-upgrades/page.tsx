import {Metadata} from 'next';
import {Suspense} from 'react';
import Layout from "@/components/layout/Layout";
import HideoutUpgradesClient from './components/HideoutUpgradesClient';

export const metadata: Metadata = {
    title: 'Hideout Upgrades Calculator',
    description: 'Plan and calculate your hideout upgrades, view costs, and track required items for each upgrade level',
    keywords: ["hideout", "upgrades", "upgrade costs"],
    openGraph: {
        title: 'Hideout Upgrades Calculator',
        description: 'Plan and calculate your hideout upgrades, view costs, and track required items for each upgrade level.',
        type: 'website',
        images: [
            {
                url: '/og/og-image-hideout.jpg',
                width: 1200,
                height: 630,
                alt: 'Hideout Upgrades Calculator',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Hideout Upgrades Calculator - ExfilZone Assistant',
        description: 'Plan and calculate your hideout upgrades.',
    },
    alternates: {
        canonical: '/hideout-upgrades',
    },
};

function ItemsLoading() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="military-box p-8 rounded-sm text-center">
                        <div
                            className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Hideout Upgrades Calculator</h2>
                        <p className="text-tan-300">Loading hideout upgrades...</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
export default function HideoutUpgradesPage() {
    return (
        <Suspense fallback={<ItemsLoading />}>
            <HideoutUpgradesClient />
        </Suspense>
    );
}
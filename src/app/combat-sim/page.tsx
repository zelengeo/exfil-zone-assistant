import { Suspense } from 'react';
import { Metadata } from 'next';
import CombatSimulatorContent from './components/CombatSimulatorContent';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
    title: 'Combat Simulator',
    description: 'Test weapon damage, TTK calculations, and combat scenarios for Contractors Showdown Exfil Zone. Compare weapons and optimize your loadout.',
    keywords: ['combat simulator', 'weapon damage', 'TTK calculator', 'Contractors Showdown', 'loadout optimizer'],
    openGraph: {
        title: 'Combat Simulator | Exfil Zone Assistant',
        description: 'Test weapon damage, TTK calculations, and combat scenarios. Compare weapons and optimize your loadout.',
        type: 'website',
        images: [
            {
                url: '/og/og-image-combat-sim.jpg',
                width: 1200,
                height: 630,
                alt: 'Exfil Zone Assistant - VR Tactical Companion',
            },
        ]
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
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Combat Simulator </h2>
                        <p className="text-tan-300">Retrieving tactical knowledge data...</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Main page component - now a server component
export default function CombatSimulatorPage() {
    return (
        <Suspense fallback={<ItemsLoading />}>
            <CombatSimulatorContent />
        </Suspense>
    );
}
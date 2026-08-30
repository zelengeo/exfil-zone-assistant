import { Metadata } from 'next';
import { Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import GunsmithClient from './components/GunsmithClient';

export const metadata: Metadata = {
    title: 'Gunsmith',
    description:
        'Assemble a weapon from every gun part in Contractors Showdown: ExfilZone and see what it does — ergonomics, recoil, spread and firing power, plus the recoil pattern the gun actually draws.',
    keywords: ['gunsmith', 'weapon builder', 'gun parts', 'attachments', 'recoil', 'weapon stats'],
    openGraph: {
        title: 'Gunsmith - ExfilZone Assistant',
        description:
            'Build a gun from real parts and see its stats and recoil pattern, calculated with the game’s own model.',
        type: 'website',
    },
};

function GunsmithLoading() {
    return (
        <div className="flex items-center justify-center min-h-96">
            <div className="bg-steel-800 border border-line-800 px-6 py-5 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-info border-t-transparent mx-auto mb-3" />
                <p className="eyebrow">Loading the gunsmith</p>
            </div>
        </div>
    );
}

export default function GunsmithPage() {
    return (
        <Layout fullWidth containerClassName="max-w-[1600px] mx-auto px-3 sm:px-4 py-4">
            <Suspense fallback={<GunsmithLoading />}>
                <GunsmithClient />
            </Suspense>
        </Layout>
    );
}

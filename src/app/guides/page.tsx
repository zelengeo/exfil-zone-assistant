'use client'

import { Suspense } from 'react';
import GuidesPageContent from './components/GuidesPageContent';
import Layout from '@/components/layout/Layout';

// Loading component for Suspense fallback
function ItemsLoading() {
    return (
        <Layout title="Guides">
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
// src/app/feedback/page.tsx
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {ChevronDown, MessageSquare} from 'lucide-react';
import {FeedbackForm} from "@/app/feedback/components/FeedbackForm";

export const metadata = {
    title: 'Feedback | ExfilZone Assistant',
    description: 'Contribute data, share your feedback, suggestions, and bug reports to help us improve the ExfilZone Assistant.',
    openGraph: {
        title: 'Feedback - ExfilZone Assistant',
        description: 'Help us improve by sharing your feedback and suggestions.',
        type: 'website',
    },
};

export default function FeedbackPage() {
    const cards = <>
        <Card className="bg-military-800 border-military-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-olive-400 text-sm font-semibold uppercase tracking-wider">
                    Bug Reports
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-tan-300">
                    Found something not working correctly? Let us know about
                    crashes, incorrect data, or broken features.
                </CardDescription>
            </CardContent>
        </Card>

        <Card className="bg-military-800 border-military-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-olive-400 text-sm font-semibold uppercase tracking-wider">
                    Feature Requests
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-tan-300">
                    Have an idea for a new feature or improvement?
                    Share your suggestions for tools and functionality.
                </CardDescription>
            </CardContent>
        </Card>

        <Card className="bg-military-800 border-military-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-olive-400 text-sm font-semibold uppercase tracking-wider">
                    General Feedback
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-tan-300">
                    Share your overall experience, usability feedback,
                    or any other thoughts about the assistant.
                </CardDescription>
            </CardContent>
        </Card>
    </>
    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Header Section - Keep brief on mobile */}
                <div className="text-center mb-6 md:mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <MessageSquare className="h-8 w-8 text-olive-500" />
                        <h1 className="text-2xl md:text-4xl font-bold text-tan-100 military-stencil">
                            Feedback
                        </h1>
                    </div>
                    {/* Hide description on mobile or make it very brief */}
                    <p className="hidden md:block text-lg text-tan-300 max-w-2xl mx-auto">
                        Help us improve the Exfil Zone Assistant by sharing your feedback,
                        reporting bugs, or suggesting new features.
                    </p>
                </div>

                {/* Mobile: Form First, Desktop: Keep current layout */}
                <div className="flex flex-col gap-6 md:gap-8">
                    {/* Feedback Form - Show first on mobile */}
                    <Card className="bg-military-800 border-military-700 order-1 md:order-2">
                        <CardHeader>
                            <CardTitle className="text-tan-100">Submit Feedback</CardTitle>
                            <CardDescription className="text-tan-400">
                                Select a type and share your thoughts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FeedbackForm />
                        </CardContent>
                    </Card>

                    {/* Info Cards - Show after form on mobile */}
                    <details className="md:hidden order-2">
                        <summary className="text-tan-300 cursor-pointer mb-4 flex items-center gap-2">
                            <span>What type of feedback can I submit?</span>
                            <ChevronDown className="h-4 w-4" />
                        </summary>
                        <div className="grid gap-4">
                            {cards}
                        </div>
                    </details>

                    {/* Desktop: Show cards normally */}
                    <div className="hidden md:grid md:grid-cols-3 gap-6 order-1">
                        {cards}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
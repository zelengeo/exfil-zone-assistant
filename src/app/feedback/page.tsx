// src/app/feedback/page.tsx
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
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
    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <MessageSquare className="h-8 w-8 text-olive-500" />
                        <h1 className="text-3xl md:text-4xl font-bold text-tan-100 military-stencil">
                            Feedback
                        </h1>
                    </div>
                    <p className="text-lg text-tan-300 max-w-2xl mx-auto">
                        Help us improve the Exfil Zone Assistant by sharing your feedback,
                        reporting bugs, or suggesting new features. Your input helps make
                        this tool better for the entire community.
                    </p>
                </div>

                {/* Feedback Types Info */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                </div>

                {/* Feedback Form */}
                <Card className="bg-military-800 border-military-700">
                    <CardHeader>
                        <CardTitle className="text-tan-100">Submit Feedback</CardTitle>
                        <CardDescription className="text-tan-400">
                            All fields are optional, but more details help us provide better assistance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FeedbackForm />
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
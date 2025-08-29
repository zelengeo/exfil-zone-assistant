// src/components/feedback/FeedbackForm.tsx
'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Card, CardContent} from '@/components/ui/card';
import {AlertCircle, CheckCircle2, Send} from 'lucide-react';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {FeedbackCategory, FeedbackPriority, FeedbackType} from "@/lib/schemas/feedback";


interface FeedbackFormData {
    type: FeedbackType;
    priority: FeedbackPriority;
    title: string;
    description: string;
    userAgent: string;
    pageUrl: string;
    category?: FeedbackCategory;
}

export function FeedbackForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FeedbackFormData>({
        type: "general",
        priority: "low",
        title: '',
        description: '',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Failed to submit feedback.', {cause: data.error});
            }

            setIsSubmitted(true);
        } catch (err) {
            //FIXME REMOVE tsignore
            // @ts-expect-error cause is defined - it is AppError and has message or details if it is validation or else
            setError(err instanceof Error ? `${err.message} ${err.cause ? ` Cause: \n` + (err.cause.details || err.cause.message || err.cause) : ""}` : 'Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFormData = (field: keyof FeedbackFormData, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    if (isSubmitted) {
        return (
            <Card className="bg-olive-900/20 border-olive-700">
                <CardContent className="flex items-center gap-3 py-6">
                    <CheckCircle2 className="h-6 w-6 text-olive-400 flex-shrink-0"/>
                    <div>
                        <h3 className="font-semibold text-tan-100 mb-1">
                            Feedback Submitted Successfully
                        </h3>
                        <p className="text-tan-300 text-sm">
                            Thank you for your feedback! We&#39;ll review it and get back to you if needed.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <Alert className="border-red-600 bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-400"/>
                    <AlertDescription className="text-red-300">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Feedback Type and Priority */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="feedback-type" className="text-tan-200">
                        Feedback Type *
                    </Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value: FeedbackType) => updateFormData('type', value)}
                        required
                    >
                        <SelectTrigger className="bg-military-700 border-military-600 text-tan-100">
                            <SelectValue placeholder="Select feedback type"/>
                        </SelectTrigger>
                        <SelectContent className="bg-military-800 border-military-600">
                            <SelectItem value="bug" className="text-tan-100 focus:bg-military-700">
                                Bug Report
                            </SelectItem>
                            <SelectItem value="feature" className="text-tan-100 focus:bg-military-700">
                                Feature Request
                            </SelectItem>
                            <SelectItem value="general" className="text-tan-100 focus:bg-military-700">
                                General Feedback
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category" className="text-tan-200">
                        Category
                    </Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value: FeedbackCategory) => updateFormData('category', value)}
                    >
                        <SelectTrigger className="bg-military-700 border-military-600 text-tan-100">
                            <SelectValue placeholder="Select category"/>
                        </SelectTrigger>
                        <SelectContent className="bg-military-800 border-military-600">
                            <SelectItem value="items" className="text-tan-100 focus:bg-military-700">
                                Items
                            </SelectItem>
                            <SelectItem value="tasks" className="text-tan-100 focus:bg-military-700">
                                Tasks
                            </SelectItem>
                            <SelectItem value="hideout" className="text-tan-100 focus:bg-military-700">
                                Hideout
                            </SelectItem>
                            <SelectItem value="combat-sim" className="text-tan-100 focus:bg-military-700">
                                Combat Sim
                            </SelectItem>
                            <SelectItem value="guides" className="text-tan-100 focus:bg-military-700">
                                Guides
                            </SelectItem>
                            <SelectItem value="ui" className="text-tan-100 focus:bg-military-700">
                                UI
                            </SelectItem>
                            <SelectItem value="other" className="text-tan-100 focus:bg-military-700">
                                Other
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority" className="text-tan-200">
                        Priority
                    </Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value: FeedbackPriority) => updateFormData('priority', value)}
                    >
                        <SelectTrigger className="bg-military-700 border-military-600 text-tan-100">
                            <SelectValue placeholder="Select priority"/>
                        </SelectTrigger>
                        <SelectContent className="bg-military-800 border-military-600">
                            <SelectItem value="low" className="text-tan-100 focus:bg-military-700">
                                Low
                            </SelectItem>
                            <SelectItem value="medium" className="text-tan-100 focus:bg-military-700">
                                Medium
                            </SelectItem>
                            <SelectItem value="high" className="text-tan-100 focus:bg-military-700">
                                High
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title" className="text-tan-200">
                    Title *
                </Label>
                <Input
                    id="title"
                    type="text"
                    placeholder="Brief summary of your feedback"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="bg-military-700 border-military-600 text-tan-100 placeholder:text-tan-500"
                    required
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="text-tan-200">
                    Description *
                </Label>
                <Textarea
                    id="description"
                    placeholder="Provide detailed information about your feedback. For bugs, include steps to reproduce. For features, describe the desired functionality."
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className="bg-military-700 border-military-600 text-tan-100 placeholder:text-tan-500 min-h-[120px]"
                    required
                />
            </div>


            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isSubmitting || !formData.type || !formData.title || !formData.description}
                className="w-full bg-olive-600 hover:bg-olive-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <div
                            className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"/>
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2"/>
                        Submit Feedback
                    </>
                )}
            </Button>
        </form>
    );
}
// src/components/admin/FeedbackDetailModal.tsx
'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Bug,
    Lightbulb,
    Database,
    MessageSquare,
    User,
    Globe,
    Monitor,
    Calendar,
    Save,
    ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {FeedbackPriority, FeedbackStatus, IFeedback} from "@/lib/schemas/feedback";


interface FeedbackDetailModalProps {
    feedback: IFeedback;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (feedbackId: string, newStatus: string) => Promise<void>;
}

export function FeedbackDetailModal({
                                        feedback,
                                        isOpen,
                                        onClose,
                                        onStatusChange
                                    }: FeedbackDetailModalProps) {
    const [adminNotes, setAdminNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(feedback.status);
    const [selectedPriority, setSelectedPriority] = useState(feedback.priority);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bug': return <Bug className="h-5 w-5 text-red-500" />;
            case 'feature': return <Lightbulb className="h-5 w-5 text-yellow-500" />;
            case 'data_correction': return <Database className="h-5 w-5 text-blue-500" />;
            default: return <MessageSquare className="h-5 w-5 text-tan-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'new': 'bg-red-900 text-red-300 border-red-600',
            'in_review': 'bg-yellow-900 text-yellow-300 border-yellow-600',
            'accepted': 'bg-blue-900 text-blue-300 border-blue-600',
            'implemented': 'bg-green-900 text-green-300 border-green-600',
            'rejected': 'bg-gray-900 text-gray-300 border-gray-600',
            'duplicate': 'bg-purple-900 text-purple-300 border-purple-600',
        };

        return (
            <Badge className={`${variants[status] || variants.new}`}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, string> = {
            'critical': 'bg-red-900 text-red-300 border-red-600',
            'high': 'bg-orange-900 text-orange-300 border-orange-600',
            'medium': 'bg-yellow-900 text-yellow-300 border-yellow-600',
            'low': 'bg-green-900 text-green-300 border-green-600',
        };

        return (
            <Badge variant="outline" className={variants[priority] || variants.low}>
                {priority.toUpperCase()}
            </Badge>
        );
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/admin/feedback/${feedback._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: selectedStatus,
                    priority: selectedPriority,
                    adminNotes: adminNotes,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update feedback');
            }

            // Trigger parent component refresh
            await onStatusChange(feedback._id.toString(), selectedStatus);
            onClose();
        } catch (error) {
            console.error('Error saving changes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const getBrowserInfo = (userAgent?: string) => {
        if (!userAgent) return 'Unknown';

        // Simple browser detection
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Other';
    };

    const getDeviceType = (userAgent?: string) => {
        if (!userAgent) return 'Unknown';

        if (userAgent.includes('Mobile')) return 'Mobile';
        if (userAgent.includes('Tablet')) return 'Tablet';
        if (userAgent.includes('Quest')) return 'VR Headset';
        return 'Desktop';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-military-800 border-military-600 max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {getTypeIcon(feedback.type)}
                            <div>
                                <DialogTitle className="text-tan-100 text-lg">
                                    {feedback.title}
                                </DialogTitle>
                                <DialogDescription className="text-tan-400 mt-1">
                                    Feedback ID: {feedback._id.toString()}
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(feedback.status)}
                            {getPriorityBadge(feedback.priority)}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Feedback Content */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-tan-300 text-sm font-medium">
                                Description
                            </Label>
                            <div className="mt-2 p-4 bg-military-700 rounded-md border border-military-600">
                                <p className="text-tan-100 whitespace-pre-wrap">
                                    {feedback.description}
                                </p>
                            </div>
                        </div>

                        {feedback.category && (
                            <div>
                                <Label className="text-tan-300 text-sm font-medium">
                                    Category
                                </Label>
                                <p className="text-tan-100 mt-1 capitalize">
                                    {feedback.category}
                                </p>
                            </div>
                        )}
                    </div>

                    <Separator className="bg-military-600" />

                    {/* Submission Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-tan-100 font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Submitted By
                            </h3>
                            {   //FIXME load users
                                /*feedback.userId ? (
                                <div className="flex items-center gap-3">
                                    {feedback.userId.avatarUrl && (
                                        <img
                                            src={feedback.userId.avatarUrl}
                                            alt=""
                                            className="w-8 h-8 rounded-full"
                                        />
                                    )}
                                    <div>
                                        <p className="text-tan-100 font-medium">
                                            {feedback.userId.username}
                                        </p>
                                        <p className="text-tan-400 text-sm">
                                            {feedback.userId.email}
                                        </p>
                                    </div>
                                </div>
                            ) */}
                            <p className="text-tan-400">Unknown User</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-tan-100 font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Timeline
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-tan-400 text-sm">Created</p>
                                    <p className="text-tan-100">
                                        {format(new Date(feedback.createdAt), 'PPp')}
                                    </p>
                                    <p className="text-tan-500 text-xs">
                                        {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {feedback.updatedAt !== feedback.createdAt && (
                                    <div>
                                        <p className="text-tan-400 text-sm">Last Updated</p>
                                        <p className="text-tan-100">
                                            {format(new Date(feedback.updatedAt), 'PPp')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-military-600" />

                    {/* Technical Details */}
                    <div className="space-y-4">
                        <h3 className="text-tan-100 font-medium flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Technical Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {feedback.pageUrl && (
                                <div>
                                    <Label className="text-tan-400 text-sm">Page URL</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Globe className="h-4 w-4 text-tan-500" />
                                        <a
                                            href={feedback.pageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-olive-400 hover:text-olive-300 text-sm truncate max-w-[200px]"
                                        >
                                            {feedback.pageUrl}
                                        </a>
                                        <ExternalLink className="h-3 w-3 text-tan-500" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label className="text-tan-400 text-sm">Browser</Label>
                                <p className="text-tan-100 text-sm mt-1">
                                    {getBrowserInfo(feedback.userAgent)}
                                </p>
                            </div>

                            <div>
                                <Label className="text-tan-400 text-sm">Device</Label>
                                <p className="text-tan-100 text-sm mt-1">
                                    {getDeviceType(feedback.userAgent)}
                                </p>
                            </div>
                        </div>

                        {feedback.userAgent && (
                            <details className="cursor-pointer">
                                <summary className="text-tan-400 text-sm hover:text-tan-300">
                                    View User Agent
                                </summary>
                                <p className="text-tan-500 text-xs mt-2 font-mono bg-military-900 p-2 rounded">
                                    {feedback.userAgent}
                                </p>
                            </details>
                        )}
                    </div>

                    <Separator className="bg-military-600" />

                    {/* Admin Controls */}
                    <div className="space-y-4">
                        <h3 className="text-tan-100 font-medium">
                            Admin Actions
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-tan-300">Status</Label>
                                <Select value={selectedStatus} onValueChange={(value)=>setSelectedStatus(value as FeedbackStatus)}>
                                    <SelectTrigger className="bg-military-700 border-military-600 text-tan-100 mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-military-800 border-military-600">
                                        <SelectItem value="new" className="text-tan-100 focus:bg-military-700">
                                            New
                                        </SelectItem>
                                        <SelectItem value="in_review" className="text-tan-100 focus:bg-military-700">
                                            In Review
                                        </SelectItem>
                                        <SelectItem value="accepted" className="text-tan-100 focus:bg-military-700">
                                            Accepted
                                        </SelectItem>
                                        <SelectItem value="implemented" className="text-tan-100 focus:bg-military-700">
                                            Implemented
                                        </SelectItem>
                                        <SelectItem value="rejected" className="text-tan-100 focus:bg-military-700">
                                            Rejected
                                        </SelectItem>
                                        <SelectItem value="duplicate" className="text-tan-100 focus:bg-military-700">
                                            Duplicate
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-tan-300">Priority</Label>
                                <Select value={selectedPriority} onValueChange={(value)=>setSelectedPriority(value as FeedbackPriority)}>
                                    <SelectTrigger className="bg-military-700 border-military-600 text-tan-100 mt-1">
                                        <SelectValue />
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
                                        <SelectItem value="critical" className="text-tan-100 focus:bg-military-700">
                                            Critical
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label className="text-tan-300">Admin Notes</Label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add internal notes about this feedback..."
                                className="bg-military-700 border-military-600 text-tan-100 placeholder:text-tan-500 mt-1 min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="border-military-600 text-tan-300 hover:bg-military-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                className="bg-olive-600 hover:bg-olive-700 text-white"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
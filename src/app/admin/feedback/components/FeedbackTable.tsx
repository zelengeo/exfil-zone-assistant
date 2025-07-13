'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Bug,
    Lightbulb,
    Database,
    MessageSquare,
    MoreHorizontal,
    Eye,
    Edit,
    Check,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FeedbackDetailModal } from './FeedbackDetailModal';

interface FeedbackItem {
    _id: string;
    type: 'bug' | 'feature' | 'data_correction';
    status: 'new' | 'in_review' | 'accepted' | 'rejected' | 'implemented' | 'duplicate';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    category?: string;
    userId?: {
        _id: string;
        username: string;
        avatarUrl?: string;
        email: string;
    } | null;
    isAnonymous: boolean;
    sessionId?: string;
    pageUrl?: string;
    userAgent?: string;
    createdAt: string;
    updatedAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface FeedbackTableProps {
    feedback: FeedbackItem[];
    pagination: Pagination;
}

export function FeedbackTable({ feedback, pagination }: FeedbackTableProps) {
    const router = useRouter();
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bug': return <Bug className="h-4 w-4 text-red-500" />;
            case 'feature': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
            case 'data_correction': return <Database className="h-4 w-4 text-blue-500" />;
            default: return <MessageSquare className="h-4 w-4 text-tan-500" />;
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
            <Badge className={`${variants[status] || variants.new} text-xs`}>
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
            <Badge variant="outline" className={`${variants[priority] || variants.low} text-xs`}>
                {priority.toUpperCase()}
            </Badge>
        );
    };

    const handleStatusChange = async (feedbackId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Refresh the page to show updated data
            router.refresh();
        } catch (error) {
            console.error('Error updating status:', error);
            // You could add a toast notification here
        }
    };

    const openDetailModal = (feedback: FeedbackItem) => {
        setSelectedFeedback(feedback);
        setIsDetailModalOpen(true);
    };

    const changePage = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-md border border-military-600 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-military-600 hover:bg-military-700">
                            <TableHead className="text-tan-300">Type</TableHead>
                            <TableHead className="text-tan-300">Title</TableHead>
                            <TableHead className="text-tan-300">Status</TableHead>
                            <TableHead className="text-tan-300">Priority</TableHead>
                            <TableHead className="text-tan-300">Submitted By</TableHead>
                            <TableHead className="text-tan-300">Created</TableHead>
                            <TableHead className="text-tan-300 w-[50px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {feedback.map((item) => (
                            <TableRow
                                key={item._id}
                                className="border-military-600 hover:bg-military-700/50 cursor-pointer"
                                onClick={() => openDetailModal(item)}
                            >
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(item.type)}
                                        <span className="text-tan-300 text-sm capitalize">
                                            {item.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="max-w-xs">
                                        <p className="text-tan-100 font-medium truncate">
                                            {item.title}
                                        </p>
                                        {item.category && (
                                            <p className="text-tan-500 text-xs mt-1">
                                                {item.category}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    {getStatusBadge(item.status)}
                                </TableCell>
                                <TableCell className="py-3">
                                    {getPriorityBadge(item.priority)}
                                </TableCell>
                                <TableCell className="py-3">
                                    {item.isAnonymous ? (
                                        <span className="text-tan-500 text-sm">Anonymous</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {item.userId?.avatarUrl && (
                                                <img
                                                    src={item.userId.avatarUrl}
                                                    alt=""
                                                    className="w-6 h-6 rounded-full"
                                                />
                                            )}
                                            <span className="text-tan-300 text-sm">
                                                {item.userId?.username || 'Unknown'}
                                            </span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="py-3">
                                    <span className="text-tan-400 text-sm">
                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="bg-military-800 border-military-600"
                                        >
                                            <DropdownMenuLabel className="text-tan-300">
                                                Actions
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-military-600" />

                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDetailModal(item);
                                                }}
                                                className="text-tan-300 focus:bg-military-700"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>

                                            {item.status === 'new' && (
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(item._id, 'in_review');
                                                    }}
                                                    className="text-tan-300 focus:bg-military-700"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Mark In Review
                                                </DropdownMenuItem>
                                            )}

                                            {['new', 'in_review'].includes(item.status) && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(item._id, 'accepted');
                                                        }}
                                                        className="text-green-400 focus:bg-military-700"
                                                    >
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Accept
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(item._id, 'rejected');
                                                        }}
                                                        className="text-red-400 focus:bg-military-700"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Reject
                                                    </DropdownMenuItem>
                                                </>
                                            )}

                                            {item.status === 'accepted' && (
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(item._id, 'implemented');
                                                    }}
                                                    className="text-blue-400 focus:bg-military-700"
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Mark Implemented
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {feedback.length === 0 && (
                    <div className="text-center py-12 text-tan-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No feedback found matching the current filters.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-tan-500">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                        {pagination.totalCount} entries
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(pagination.page - 1)}
                            disabled={!pagination.hasPrevPage}
                            className="border-military-600 text-tan-300 hover:bg-military-700"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                const isActive = pageNum === pagination.page;

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={isActive ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => changePage(pageNum)}
                                        className={
                                            isActive
                                                ? "bg-olive-600 text-white"
                                                : "border-military-600 text-tan-300 hover:bg-military-700"
                                        }
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className="border-military-600 text-tan-300 hover:bg-military-700"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedFeedback && (
                <FeedbackDetailModal
                    feedback={selectedFeedback}
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedFeedback(null);
                    }}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>
    );
}
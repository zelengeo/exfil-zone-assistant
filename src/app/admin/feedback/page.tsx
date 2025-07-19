// src/app/admin/feedback/page.tsx
import React from 'react';
import {connectDB} from '@/lib/mongodb';
import {Feedback} from '@/models/Feedback';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {FeedbackTable} from './components/FeedbackTable';
import {FeedbackFilters} from './components/FeedbackFilters';
import {ShieldCheck, MessageSquare, Bug, Lightbulb, Database, TrendingUp} from 'lucide-react';
import {requireAdmin} from "@/lib/auth/utils";

interface FeedbackStats {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    recent: number; // Last 7 days
}

interface SearchParams {
    status?: string;
    type?: string;
    priority?: string;
    page?: string;
    userId?: string;
}


// Helper function to get feedback stats
async function getFeedbackStats(): Promise<FeedbackStats> {
    await connectDB();

    const [
        total,
        byStatus,
        byType,
        byPriority,
        recent
    ] = await Promise.all([
        Feedback.countDocuments(),
        Feedback.aggregate([
            {$group: {_id: '$status', count: {$sum: 1}}}
        ]),
        Feedback.aggregate([
            {$group: {_id: '$type', count: {$sum: 1}}}
        ]),
        Feedback.aggregate([
            {$group: {_id: '$priority', count: {$sum: 1}}}
        ]),
        Feedback.countDocuments({
            createdAt: {$gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        })
    ]);

    return {
        total,
        byStatus: Object.fromEntries(byStatus.map((item) => [item._id, item.count])),
        byType: Object.fromEntries(byType.map((item) => [item._id, item.count])),
        byPriority: Object.fromEntries(byPriority.map((item) => [item._id, item.count])),
        recent
    };
}

// Helper function to get paginated feedback
async function getFeedbackList(params: {
    page: number;
    limit: number;
    filters: Partial<SearchParams>;
}) {
    await connectDB();

    const {page, limit, filters} = params;
    const skip = (page - 1) * limit;

    // Build filter query
    const query = {
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.userId && { userId: filters.userId }),
    };

    const [feedback, totalCount] = await Promise.all([
        Feedback.find(query)
            .populate('userId', 'username avatarUrl email')
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .lean(),
        Feedback.countDocuments(query)
    ]);

    return {
        items: feedback,
        pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNextPage: page * limit < totalCount,
            hasPrevPage: page > 1,
        }
    };
}

export const metadata = {
    title: 'Admin - Feedback Management | ExfilZone Assistant',
    description: 'Manage user feedback, bug reports, and feature requests.',
};

export default async function AdminFeedbackPage({
                                                    searchParams
                                                }: {
    searchParams: SearchParams;
}) {
    // Require admin access
    const params = await searchParams;
    await requireAdmin();

    const page = parseInt(searchParams.page || '1');
    const limit = 20;

    const filters = {
        status: params.status,
        type: params.type,
        priority: params.priority,
        userId: params.userId,
    };

    // Fetch data
    const [stats, feedbackData] = await Promise.all([
        getFeedbackStats(),
        getFeedbackList({page, limit, filters})
    ]);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="h-8 w-8 text-olive-500"/>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 military-stencil">
                        Feedback Management
                    </h1>
                    <p className="text-tan-400 mt-1">
                        Monitor and manage user feedback, bug reports, and feature requests
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-military-800 border-military-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-tan-300">
                            Total Feedback
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-olive-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-tan-100">{stats.total}</div>
                        <p className="text-xs text-tan-500">
                            {stats.recent} new this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-military-800 border-military-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-tan-300">
                            Bug Reports
                        </CardTitle>
                        <Bug className="h-4 w-4 text-red-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-tan-100">
                            {stats.byType.bug || 0}
                        </div>
                        <p className="text-xs text-tan-500">
                            {stats.byStatus.new || 0} new reports
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-military-800 border-military-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-tan-300">
                            Feature Requests
                        </CardTitle>
                        <Lightbulb className="h-4 w-4 text-yellow-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-tan-100">
                            {stats.byType.feature || 0}
                        </div>
                        <p className="text-xs text-tan-500">
                            {stats.byStatus.accepted || 0} accepted
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-military-800 border-military-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-tan-300">
                            Data Issues
                        </CardTitle>
                        <Database className="h-4 w-4 text-blue-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-tan-100">
                            {stats.byType.data_correction || 0}
                        </div>
                        <p className="text-xs text-tan-500">
                            {stats.byStatus.implemented || 0} resolved
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Priority Breakdown */}
            <Card className="bg-military-800 border-military-700 mb-8">
                <CardHeader>
                    <CardTitle className="text-tan-100 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-olive-500"/>
                        Priority Breakdown
                    </CardTitle>
                    <CardDescription className="text-tan-400">
                        Current feedback distribution by priority level
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="bg-red-900 text-red-300">
                                Critical
                            </Badge>
                            <span className="text-tan-300">{stats.byPriority.critical || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-orange-900 text-orange-300">
                                High
                            </Badge>
                            <span className="text-tan-300">{stats.byPriority.high || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                                Medium
                            </Badge>
                            <span className="text-tan-300">{stats.byPriority.medium || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-green-600 text-green-400">
                                Low
                            </Badge>
                            <span className="text-tan-300">{stats.byPriority.low || 0}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters and Table */}
            <Card className="bg-military-800 border-military-700">
                <CardHeader>
                    <CardTitle className="text-tan-100">Feedback List</CardTitle>
                    <CardDescription className="text-tan-400">
                        Manage and respond to user feedback submissions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FeedbackFilters currentFilters={filters}/>
                    <FeedbackTable
                        feedback={JSON.parse(JSON.stringify(feedbackData.items))}
                        pagination={feedbackData.pagination}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
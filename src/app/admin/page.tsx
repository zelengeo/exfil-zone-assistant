// src/app/admin/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Feedback } from '@/models/Feedback';
import {
    Users,
    MessageSquare,
    Shield,
    Activity,
} from 'lucide-react';
import Link from "next/link";

async function getAdminStats() {
    await connectDB();

    const [
        totalUsers,
        activeUsers,
        totalFeedback,
        pendingFeedback,
        adminCount,
        moderatorCount
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({
            lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        Feedback.countDocuments(),
        Feedback.countDocuments({ status: 'new' }),
        User.countDocuments({ roles: 'admin' }),
        User.countDocuments({ roles: 'moderator' })
    ]);

    return {
        totalUsers,
        activeUsers,
        totalFeedback,
        pendingFeedback,
        adminCount,
        moderatorCount
    };
}

export default async function AdminPage() {
    const stats = await getAdminStats();

    const statsCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            description: 'Registered users',
            trend: '+12% from last month'
        },
        {
            title: 'Active Users',
            value: stats.activeUsers,
            icon: Activity,
            description: 'Last 30 days',
            trend: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total`
        },
        {
            title: 'Feedback Items',
            value: stats.totalFeedback,
            icon: MessageSquare,
            description: `${stats.pendingFeedback} pending review`,
            trend: stats.pendingFeedback > 0 ? 'Needs attention' : 'All reviewed'
        },
        {
            title: 'Staff Members',
            value: stats.adminCount + stats.moderatorCount,
            icon: Shield,
            description: `${stats.adminCount} admins, ${stats.moderatorCount} mods`,
            trend: 'Fully staffed'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-tan-100">Admin Dashboard</h1>
                <p className="text-tan-400 mt-1">System overview and quick stats</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => (
                    <Card key={stat.title} className="military-box border-military-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-tan-300">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-olive-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-tan-100">{stat.value}</div>
                            <p className="text-xs text-tan-400">{stat.description}</p>
                            <div className="mt-2">
                                <Badge
                                    variant="outline"
                                    className="text-xs border-olive-700 text-olive-400"
                                >
                                    {stat.trend}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="military-box border-military-700">
                    <CardHeader>
                        <CardTitle className="text-tan-100">Quick Actions</CardTitle>
                        <CardDescription className="text-tan-400">
                            Common administrative tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        {/*<Link
                            href="/admin/users"
                            className="flex items-center justify-between p-3 rounded-sm bg-military-800 hover:bg-military-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-olive-500" />
                                <span className="text-sm text-tan-300">Manage Users</span>
                            </div>
                            <span className="text-xs text-tan-500">→</span>
                        </Link>*/}
                        <Link
                            href="/admin/roles"
                            className="flex items-center justify-between p-3 rounded-sm bg-military-800 hover:bg-military-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-olive-500" />
                                <span className="text-sm text-tan-300">Manage Roles</span>
                            </div>
                            <span className="text-xs text-tan-500">→</span>
                        </Link>
                        <Link
                            href="/admin/feedback"
                            className="flex items-center justify-between p-3 rounded-sm bg-military-800 hover:bg-military-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-4 w-4 text-olive-500" />
                                <span className="text-sm text-tan-300">Review Feedback</span>
                            </div>
                            <Badge className="ml-auto mr-2 bg-red-900/30 text-red-400 border-red-800">
                                {stats.pendingFeedback}
                            </Badge>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="military-box border-military-700">
                    <CardHeader>
                        <CardTitle className="text-tan-100">System Health</CardTitle>
                        <CardDescription className="text-tan-400">
                            Current system status (FAKE)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-tan-300">Database</span>
                            <Badge className="bg-green-900/30 text-green-400 border-green-800">
                                Operational
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-tan-300">API</span>
                            <Badge className="bg-green-900/30 text-green-400 border-green-800">
                                Operational
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-tan-300">Authentication</span>
                            <Badge className="bg-green-900/30 text-green-400 border-green-800">
                                Operational
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-tan-300">Storage</span>
                            <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-800">
                                85% Used
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
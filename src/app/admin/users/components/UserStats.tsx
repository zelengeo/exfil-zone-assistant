// src/app/admin/users/components/UserStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {User} from "@/models/User";
import {connectDB} from "@/lib/mongodb";
import { Badge } from '@/components/ui/badge';
import {
    Users,
    UserCheck,
    UserPlus,
    Activity,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

async function getUserStats() {
    await connectDB();

    const [
        totalUsers,
        activeUsers30d,
        activeUsers7d,
        activeUsers1d,
        newUsers30d,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({
            lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        User.countDocuments({
            lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        User.countDocuments({
            lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }),
        User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
    ]);

    return {
        totalUsers,
        activeUsers: {
            last30Days: activeUsers30d,
            last7Days: activeUsers7d,
            last24Hours: activeUsers1d
        },
        newUsers30d,
    };
}

export async function UserStats() {
    const stats = await getUserStats();

    const statsCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            description: 'All registered users',
            trend: {
                value: stats.newUsers30d,
                label: `+${stats.newUsers30d} this month`,
                positive: true
            }
        },
        {
            title: 'Active Today',
            value: stats.activeUsers.last24Hours,
            icon: Activity,
            description: 'Users in last 24h',
            trend: {
                value: Math.round((stats.activeUsers.last24Hours / stats.totalUsers) * 100),
                label: `${Math.round((stats.activeUsers.last24Hours / stats.totalUsers) * 100)}% of total`,
                positive: stats.activeUsers.last24Hours > 0
            }
        },
        {
            title: 'Active This Week',
            value: stats.activeUsers.last7Days,
            icon: UserCheck,
            description: 'Users in last 7 days',
            trend: {
                value: Math.round((stats.activeUsers.last7Days / stats.totalUsers) * 100),
                label: `${Math.round((stats.activeUsers.last7Days / stats.totalUsers) * 100)}% of total`,
                positive: stats.activeUsers.last7Days > stats.totalUsers * 0.3
            }
        },
        {
            title: 'New Users',
            value: stats.newUsers30d,
            icon: UserPlus,
            description: 'Joined last 30 days',
            trend: {
                value: Math.round((stats.newUsers30d / stats.totalUsers) * 100),
                label: `${Math.round((stats.newUsers30d / stats.totalUsers) * 100)}% growth`,
                positive: stats.newUsers30d > 0
            }
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {statsCards.map((stat) => (
                <Card key={stat.title} className="military-box border-military-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tan-300">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-olive-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-tan-100">
                            {stat.value.toLocaleString()}
                        </div>
                        <p className="text-xs text-tan-400">{stat.description}</p>
                        <div className="mt-2 flex items-center gap-1">
                            {stat.trend.positive ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <Badge
                                variant="outline"
                                className={`text-xs ${
                                    stat.trend.positive
                                        ? 'border-green-800 text-green-400'
                                        : 'border-red-800 text-red-400'
                                }`}
                            >
                                {stat.trend.label}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
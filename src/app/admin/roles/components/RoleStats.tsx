// src/app/admin/roles/components/RoleStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import {
    Users,
    UserCheck,
    ShieldCheck,
    Crown
} from 'lucide-react';

async function getRoleStats() {
    await connectDB();

    const [
        totalUsers,
        adminCount,
        moderatorCount,
        partnerCount,
        contributorCount
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ roles: 'admin' }),
        User.countDocuments({ roles: 'moderator' }),
        User.countDocuments({ roles: 'partner' }),
        User.countDocuments({ roles: 'contributor' })
    ]);

    const regularUsers = totalUsers - adminCount - moderatorCount - partnerCount - contributorCount;

    return {
        totalUsers,
        adminCount,
        moderatorCount,
        partnerCount,
        contributorCount,
        regularUsers
    };
}

export async function RoleStats() {
    const stats = await getRoleStats();

    const roleCards = [
        {
            role: 'Admins',
            count: stats.adminCount,
            icon: Crown,
            color: 'text-red-400 bg-red-900/30 border-red-800',
            bgColor: 'bg-red-900/10'
        },
        {
            role: 'Moderators',
            count: stats.moderatorCount,
            icon: ShieldCheck,
            color: 'text-blue-400 bg-blue-900/30 border-blue-800',
            bgColor: 'bg-blue-900/10'
        },
        {
            role: 'Partners',
            count: stats.partnerCount,
            icon: UserCheck,
            color: 'text-purple-400 bg-purple-900/30 border-purple-800',
            bgColor: 'bg-purple-900/10'
        },
        {
            role: 'Contributors',
            count: stats.contributorCount,
            icon: Users,
            color: 'text-green-400 bg-green-900/30 border-green-800',
            bgColor: 'bg-green-900/10'
        },
        {
            role: 'Regular Users',
            count: stats.regularUsers,
            icon: Users,
            color: 'text-tan-400 bg-military-700 border-military-600',
            bgColor: 'bg-military-800/50'
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-5">
            {roleCards.map((card) => (
                <Card key={card.role} className={`military-box border-military-700 ${card.bgColor}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tan-300">
                            {card.role}
                        </CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color.split(' ')[0]}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-tan-100">{card.count}</div>
                        <Badge
                            variant="outline"
                            className={`text-xs mt-2 ${card.color}`}
                        >
                            {Math.round((card.count / stats.totalUsers) * 100)}% of users
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
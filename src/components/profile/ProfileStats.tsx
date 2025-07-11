import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, MessageSquare, Target, TrendingUp } from 'lucide-react';

interface ProfileStatsProps {
    user: {
        stats: {
            feedbackSubmitted: number;
            bugsReported: number;
            featuresProposed: number;
            dataCorrections: number;
            correctionsAccepted: number;
            contributionPoints: number;
        };
        level: number;
    };
}

export function ProfileStats({ user }: ProfileStatsProps) {
    const stats = [
        {
            label: 'Total Feedback',
            value: user.stats.feedbackSubmitted,
            icon: MessageSquare,
            color: 'text-blue-500',
        },
        {
            label: 'Corrections Accepted',
            value: user.stats.correctionsAccepted,
            icon: Target,
            color: 'text-green-500',
        },
        {
            label: 'Contribution Points',
            value: user.stats.contributionPoints,
            icon: Award,
            color: 'text-yellow-500',
        },
        {
            label: 'Level',
            value: user.level,
            icon: TrendingUp,
            color: 'text-purple-500',
        },
    ];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                <span className="text-sm font-medium">{stat.label}</span>
                            </div>
                            <span className="text-2xl font-bold">{stat.value}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Contribution breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Contribution Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bug Reports</span>
                        <span className="font-medium">{user.stats.bugsReported}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Feature Requests</span>
                        <span className="font-medium">{user.stats.featuresProposed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Data Corrections</span>
                        <span className="font-medium">{user.stats.dataCorrections}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
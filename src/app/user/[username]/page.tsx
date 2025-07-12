import { notFound } from 'next/navigation';
import { getUserByUsername } from '@/lib/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, MessageSquare, Bug, Lightbulb } from 'lucide-react';

export default async function UserProfilePage({
                                                  params
                                              }: {
    params: { username: string }
}) {
    const user = await getUserByUsername(params.username);

    if (!user) {
        notFound();
    }

    const stats = [
        { label: 'Contribution Points', value: user.stats?.contributionPoints || 0, icon: Trophy },
        { label: 'Feedback Submitted', value: user.stats?.feedbackSubmitted || 0, icon: MessageSquare },
        { label: 'Bugs Reported', value: user.stats?.bugsReported || 0, icon: Bug },
        { label: 'Features Proposed', value: user.stats?.featuresProposed || 0, icon: Lightbulb },
    ];

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="text-2xl">
                                {user.name?.[0] || user.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
                            <p className="text-muted-foreground">@{user.username}</p>
                            <Badge variant="secondary" className="mt-2 capitalize">
                                {user.rank || 'Recruit'}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
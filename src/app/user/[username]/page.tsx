import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import { getUserByUsername } from '@/lib/user';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfilePageProps {
    params: {
        username: string;
    };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const user = await getUserByUsername(params.username);

    if (!user) {
        return {
            title: 'User Not Found',
        };
    }

    return {
        title: `${user.username} - ExfilZone Assistant`,
        description: `View ${user.username}'s profile and contributions on ExfilZone Assistant`,
    };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const user = await getUserByUsername(params.username);

    if (!user) {
        notFound();
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <ProfileHeader user={user} />

                <div className="grid lg:grid-cols-3 gap-6 mt-8">
                    {/* Stats sidebar */}
                    <div className="lg:col-span-1">
                        <ProfileStats user={user} />
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="contributions">Contributions</TabsTrigger>
                                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            {user.bio || 'This user hasn\'t added a bio yet.'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="contributions" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Contributions</CardTitle>
                                        <CardDescription>
                                            Feedback and data corrections submitted by this user
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-center py-8">
                                            No public contributions yet
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="achievements" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Achievements</CardTitle>
                                        <CardDescription>
                                            Badges and milestones earned
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-center py-8">
                                            No achievements unlocked yet
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
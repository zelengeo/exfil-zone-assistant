import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/signin');
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user?.username) {
        redirect('/auth/welcome');
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Contribution Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {user.stats?.contributionPoints || 0}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Feedback Submitted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {user.stats?.feedbackSubmitted || 0}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rank</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold capitalize">
                            {user.rank || 'Recruit'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
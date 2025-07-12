import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await request.json();

    // Validate username
    if (!username || username.length < 3 || !/^[a-z0-9-]+$/.test(username)) {
        return Response.json({ error: 'Invalid username' }, { status: 400 });
    }

    try {
        await connectDB();

        // Check if username is taken
        const existing = await User.findOne({ username: username.toLowerCase() });
        if (existing) {
            return Response.json({ error: 'Username already taken' }, { status: 400 });
        }

        // Update user
        await User.findByIdAndUpdate(session.user.id, {
            username: username.toLowerCase(),
            updatedAt: new Date(),
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Update username error:', error);
        return Response.json({ error: 'Failed to update username' }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { username } = await request.json();

        // Validate username
        if (!username || username.length < 3 || username.length > 30) {
            return NextResponse.json(
                { error: 'Username must be between 3 and 30 characters' },
                { status: 400 }
            );
        }

        const usernameRegex = /^[a-z0-9-]+$/;
        if (!usernameRegex.test(username)) {
            return NextResponse.json(
                { error: 'Invalid username format' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already has username
        const currentUser = await User.findById(session.user.id);
        if (currentUser?.username) {
            return NextResponse.json(
                { error: 'Username already set' },
                { status: 400 }
            );
        }

        // Check if username is taken
        const existingUser = await User.findOne({
            username: username.toLowerCase()
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 400 }
            );
        }

        // Update user with username
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            {
                username: username.toLowerCase(),
                // Set default role if not set
                $addToSet: { roles: 'user' }
            },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            username: updatedUser.username,
        });

    } catch (error) {
        console.error('Set username error:', error);
        return NextResponse.json(
            { error: 'Failed to set username' },
            { status: 500 }
        );
    }
}
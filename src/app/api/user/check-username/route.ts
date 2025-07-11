import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || username.length < 3) {
        return NextResponse.json({
            available: false,
            message: 'Username must be at least 3 characters',
        });
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(username)) {
        return NextResponse.json({
            available: false,
            message: 'Username can only contain lowercase letters, numbers, and hyphens',
        });
    }

    // Reserved usernames
    const reserved = ['admin', 'api', 'app', 'auth', 'dashboard', 'settings', 'user', 'users'];
    if (reserved.includes(username)) {
        return NextResponse.json({
            available: false,
            message: 'This username is reserved',
        });
    }

    try {
        await connectDB();

        const existingUser = await User.findOne({
            username: username.toLowerCase()
        });

        return NextResponse.json({
            available: !existingUser,
            message: existingUser ? 'Username already taken' : null,
        });
    } catch (error) {
        console.error('Username check error:', error);
        return NextResponse.json(
            { error: 'Failed to check username' },
            { status: 500 }
        );
    }
}
// src/app/api/user/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function PATCH(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const {
            username,
            bio,
            location,
            vrHeadset,
            preferences,
        } = body;

        // Connect to database
        await connectDB();

        // Get current user
        const currentUser = await User.findById(session.user.id);
        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Validate username if it's being changed
        if (username && username !== currentUser.username) {
            // Check username format
            if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
                return NextResponse.json(
                    {
                        error: 'Invalid username format',
                        field: 'username',
                        details: 'Username must be 3-20 characters long and contain only letters, numbers, underscores, and hyphens'
                    },
                    { status: 400 }
                );
            }

            // Check if username is already taken
            const existingUser = await User.findOne({
                username: username.toLowerCase(),
                _id: { $ne: session.user.id }
            });

            if (existingUser) {
                return NextResponse.json(
                    {
                        error: 'Username already taken',
                        field: 'username'
                    },
                    { status: 400 }
                );
            }
        }

        // Build update object
        const updateData: any = {};

        // Profile fields
        if (username !== undefined) updateData.username = username.toLowerCase();
        if (bio !== undefined) updateData.bio = bio.slice(0, 500); // Enforce max length
        if (location !== undefined) updateData.location = location;
        if (vrHeadset !== undefined) updateData.vrHeadset = vrHeadset;

        // Preferences (merge with existing)
        if (preferences) {
            updateData.preferences = {
                ...currentUser.preferences,
                ...preferences
            };
        }

        // Add update timestamp
        updateData.updatedAt = new Date();

        // Perform update
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            updateData,
            {
                new: true, // Return updated document
                runValidators: true // Run schema validators
            }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'Failed to update user' },
                { status: 500 }
            );
        }

        // Return success with updated data
        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                bio: updatedUser.bio,
                location: updatedUser.location,
                vrHeadset: updatedUser.vrHeadset,
                preferences: updatedUser.preferences,
            }
        });

    } catch (error) {
        console.error('User update error:', error);

        // Handle mongoose validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optional: Add GET endpoint to fetch current user data
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const user = await User.findById(session.user.id).select(
            'username bio location vrHeadset preferences stats rank level badges'
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('User fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
// src/app/api/admin/users/[id]/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import {Session} from "@/models/Session";
import {Account} from "@/models/Account";
import {Feedback} from "@/models/Feedback";
import {requireAdmin} from "@/app/admin/components/utils";

// GET /api/admin/users/[id] - Get single user details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();
        await connectDB();

        const user = await User.findById(params.id)
            .select('-password')
            .lean();

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json({ user });

    } catch (error) {
        console.error('Admin get user error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to get user' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[id] - Delete user account (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user: currentUser } = await requireAdmin();
        await connectDB();

        // Prevent self-deletion
        if (currentUser._id.toString() === params.id) {
            return Response.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        const userToDelete = await User.findById(params.id);

        if (!userToDelete) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent deletion of other admins by non-super-admin
        if (userToDelete.roles?.includes('admin') && !currentUser.roles?.includes('super-admin')) {
            return Response.json(
                { error: 'Cannot delete other admin accounts' },
                { status: 403 }
            );
        }

        // Delete user's feedback (or anonymize it)
        await Feedback.updateMany(
            { userId: params.id },
            {
                $set: {
                    userId: null,
                    isAnonymous: true
                }
            }
        );

        // Delete user sessions
        await Session.deleteMany({ userId: params.id });

        // Delete user accounts (OAuth connections)
        await Account.deleteMany({ userId: params.id });


        // Delete the user
        await User.findByIdAndDelete(params.id);

        // Log the deletion
        console.log(`🗑️ User deleted: ${userToDelete.username} (${userToDelete.email}) by ${currentUser.username}`);

        return Response.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Admin delete user error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/users/[id] - Update user details (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();
        await connectDB();

        const body = await request.json();
        const { username, email, bio, location, vrHeadset, rank, isBanned, banReason } = body;

        // Validate input
        const updates: any = {};

        if (username) {
            // Check if username is already taken
            const existingUser = await User.findOne({
                username,
                _id: { $ne: params.id }
            });

            if (existingUser) {
                return Response.json(
                    { error: 'Username already taken' },
                    { status: 400 }
                );
            }

            updates.username = username;
        }

        if (email) {
            // Check if email is already taken
            const existingUser = await User.findOne({
                email,
                _id: { $ne: params.id }
            });

            if (existingUser) {
                return Response.json(
                    { error: 'Email already in use' },
                    { status: 400 }
                );
            }

            updates.email = email;
        }

        if (bio !== undefined) updates.bio = bio;
        if (location !== undefined) updates.location = location;
        if (vrHeadset !== undefined) updates.vrHeadset = vrHeadset;
        if (rank !== undefined) updates.rank = rank;
        if (isBanned !== undefined) updates.isBanned = isBanned;
        if (banReason !== undefined) updates.banReason = banReason;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            { $set: updates },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json({
            success: true,
            user: updatedUser,
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Admin update user error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
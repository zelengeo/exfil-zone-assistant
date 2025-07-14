// src/app/api/admin/users/[id]/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import {Session} from "@/models/Session";
import {Account} from "@/models/Account";
import {Feedback} from "@/models/Feedback";
import {requireAdmin} from "@/app/admin/components/utils";
import mongoose, {isValidObjectId} from "mongoose";
import {AuthorizationError, ConflictError, handleError, NotFoundError, ValidationError} from "@/lib/errors";
import {logger} from "@/lib/logger";

// GET /api/admin/users/[id] - Get single user details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();
        await connectDB();

        // Validate ObjectId format
        if (!isValidObjectId(params.id)) {
            throw new ValidationError('Invalid user ID format');
        }

        const user = await User.findById(params.id)
            // .select('-password')
            .lean();

        if (!user) {
            throw new NotFoundError('User');
        }

        return Response.json({ user });

    } catch (error) {
        logger.error('Failed to get user', error, {
            path: `/api/admin/users/${params.id}`,
            method: 'GET',
        });

        return handleError(error);
    }
}

// DELETE /api/admin/users/[id] - Delete user account (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { session } = await requireAdmin();

        // Validate ObjectId format
        if (!isValidObjectId(params.id)) {
            throw new ValidationError('Invalid user ID format');
        }

        // Prevent self-deletion
        if (session?.user?.id.toString() === params.id) {
            throw new ConflictError('Cannot delete your own account');
        }

        await connectDB();
        const userToDelete = await User.findById(params.id);

        if (!userToDelete) {
            throw new NotFoundError('User');
        }

        // Prevent deletion of other admins by non-super-admin
        if (userToDelete.roles?.includes('admin')) {
            throw new AuthorizationError('Cannot delete other admin accounts')
        }

        // Start transaction
        const mongooseSession = await mongoose.startSession();
        mongooseSession.startTransaction();

        try {
            // Anonymize feedback instead of deleting
            await Feedback.updateMany(
                { userId: params.id },
                { $set: { userId: null, isAnonymous: true } },
                { session: mongooseSession }
            );

            // Delete user data
            await Promise.all([
                Session.deleteMany({ userId: params.id }, { session: mongooseSession }),
                Account.deleteMany({ userId: params.id }, { session: mongooseSession }),
                User.findByIdAndDelete(params.id, { session: mongooseSession }),
            ]);

            await mongooseSession.commitTransaction();

            logger.info('User deleted', {
                deletedUserId: params.id,
                deletedBy: session.user.id.toString() ,
            });

            return Response.json({
                success: true,
                message: 'User account deleted successfully',
            });

        } catch (error) {
            await mongooseSession.abortTransaction();
            throw error;
        } finally {
            await mongooseSession.endSession();
        }

    } catch (error) {
        logger.error('Failed to delete user', error, {
            path: `/api/admin/users/${params.id}`,
            method: 'DELETE',
        });

        return handleError(error);
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
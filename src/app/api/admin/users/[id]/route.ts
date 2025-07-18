// src/app/api/admin/users/[id]/route.ts
import {NextRequest} from 'next/server';
import mongoose, {isValidObjectId} from "mongoose";
import {connectDB} from '@/lib/mongodb';
import {User} from '@/models/User';
import {Account} from "@/models/Account";
import {Feedback} from "@/models/Feedback";
import {requireAdmin} from "@/lib/auth/utils";
import {withRateLimit} from "@/lib/middleware";
import {
    AuthorizationError,
    ConflictError,
    handleError,
    NotFoundError,
    ValidationError
} from "@/lib/errors";
import {logger} from "@/lib/logger";
import {AdminUserUpdateInput, adminUserUpdateSchema, userUpdateSchema} from "@/lib/schemas/user";
import { sanitizeUserInput } from '@/lib/utils';

export async function GET(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    return withRateLimit(
        request,
        async () => {
            try {
                await requireAdmin();
                await connectDB();

                if (!isValidObjectId(params.id)) {
                    throw new ValidationError('Invalid user ID format');
                }

                const user = await User.findById(params.id)
                    .select('-providers')
                    .lean();

                if (!user) {
                    throw new NotFoundError('User');
                }

                return Response.json({user});

            } catch (error) {
                logger.error('Failed to get user', error, {
                    path: `/api/admin/users/${params.id}`,
                    method: 'GET',
                });
                return handleError(error);
            }
        },
        'admin'
    );
}

// DELETE /api/admin/users/[id] - Delete user account (admin only)
export async function DELETE(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    return withRateLimit(
        request,
        async () => {
            try {
                const {session} = await requireAdmin();

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
                        {userId: params.id},
                        {$set: {userId: null}},
                        {session: mongooseSession}
                    );

                    // Delete user data
                    await Promise.all([
                        // Session.deleteMany({ userId: params.id }, { session: mongooseSession }),
                        Account.deleteMany({userId: params.id}, {session: mongooseSession}),
                        User.findByIdAndDelete(params.id, {session: mongooseSession}),
                    ]);

                    await mongooseSession.commitTransaction();

                    logger.info('User deleted', {
                        deletedUserId: params.id,
                        deletedBy: session.user.id.toString(),
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

        },
        'admin'
    );
}

// PATCH /api/admin/users/[id] - Update user details (admin only)
export async function PATCH(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    return withRateLimit(request, async () => {
            try {
                const {session} = await requireAdmin();
                await connectDB();

                const body = await request.json();
                // Validate input
                const validatedData = adminUserUpdateSchema.parse(body);


                // Sanitize text inputs
                const updates: AdminUserUpdateInput = {...validatedData};
                if (validatedData.displayName) {
                    updates.displayName = sanitizeUserInput(validatedData.displayName);
                }
                if (validatedData.bio) {
                    updates.bio = sanitizeUserInput(validatedData.bio);
                }
                if (validatedData.banReason) {
                    updates.banReason = sanitizeUserInput(validatedData.banReason);
                }

                if (validatedData.username) {
                    // Check if username is already taken
                    const existingUser = await User.findOne({
                        username: validatedData.username,
                        _id: {$ne: params.id}
                    });

                    if (existingUser) {
                        throw new ConflictError('Username already in use');
                    }

                    updates.username = validatedData.username;
                }

                if (validatedData.email) {
                    // Check if email is already taken
                    const existingUser = await User.findOne({
                        email: validatedData.email,
                        _id: {$ne: params.id}
                    });

                    if (existingUser) {
                        throw new ConflictError('Email already in use');
                    }

                    updates.email = validatedData.email;
                }

                // Update user
                const updatedUser = await User.findByIdAndUpdate(
                    params.id,
                    {$set: updates},
                    {new: true}
                ).select('-password');

                if (!updatedUser) {
                    throw new NotFoundError('User');
                }

                logger.info('User profile updated', {
                    userId: session.user.id,
                    updatedFields: Object.keys(updates),
                });

                return Response.json({
                    success: true,
                    user: updatedUser,
                    message: 'User updated successfully'
                });

            } catch (error) {
                logger.error('Admin update user error:', error, {
                    path: '/api/admin/user/update',
                    method: 'PATCH',
                });
                return handleError(error);
            }
        },
        "admin")
}
// src/app/api/admin/users/[id]/route.ts
import {NextRequest, NextResponse} from 'next/server';
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
import {AdminUserUpdateInput, adminUserUpdateSchema, IUserApi, UserApi} from "@/lib/schemas/user";
import { sanitizeUserInput } from '@/lib/utils';

type ApiType = IUserApi['Admin']['ById']
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
                    .lean<ApiType['Get']['Response']['user']>();

                if (!user) {
                    throw new NotFoundError('User');
                }

                return NextResponse.json<ApiType['Get']['Response']>({user});

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
            const mongooseSession = await mongoose.startSession();

            try {
                const {session} = await requireAdmin();
                await connectDB();

                if (!isValidObjectId(params.id)) {
                    throw new ValidationError('Invalid user ID');
                }

                // Start transaction
                mongooseSession.startTransaction();

                const user = await User.findById(params.id).session(mongooseSession);
                if (!user) {
                    throw new NotFoundError('User');
                }

                // Prevent deleting yourself
                if (session.user.id === params.id) {
                    throw new ConflictError('Cannot delete your own account');
                }

                // Prevent deleting other admins
                if (user.roles?.includes('admin')) {
                    throw new AuthorizationError('Cannot delete admin accounts');
                }

                // Delete user
                await User.findByIdAndDelete(params.id).session(mongooseSession);

                // Delete associated accounts
                await Account.deleteMany({ userId: params.id }).session(mongooseSession);

                // Anonymize feedback instead of deleting
                await Feedback.updateMany(
                    { userId: params.id },
                    {
                        $unset: { userId: 1 },
                        $set: { isAnonymous: true }
                    }
                ).session(mongooseSession);

                // Commit transaction
                await mongooseSession.commitTransaction();

                logger.info('User deleted', {
                    adminId: session.user.id,
                    deletedUserId: params.id,
                    username: user.username
                });

                return NextResponse.json<ApiType['Delete']['Response']>({
                    success: true,
                    message: 'User account deleted successfully'
                });

            } catch (error) {
                // Abort transaction on error
                await mongooseSession.abortTransaction();

                logger.error('User deletion error:', error, {
                    path: `/api/admin/users/${params.id}`,
                    method: 'DELETE',
                });
                return handleError(error);
            } finally {
                // End session
                await mongooseSession.endSession();
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
                const validatedData = UserApi.Admin.ById.Patch.Request.parse(body);


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
                );//.select('-password');

                if (!updatedUser) {
                    throw new NotFoundError('User');
                }

                logger.info('User profile updated', {
                    userId: session.user.id,
                    updatedFields: Object.keys(updates),
                });

                return NextResponse.json<ApiType['Patch']['Response']>({
                    success: true,
                    user: updatedUser,
                    message: 'User updated successfully'
                });

            } catch (error) {
                logger.error('Admin update user error:', error, {
                    path: '/api/admin/users',
                    method: 'PATCH',
                });
                return handleError(error);
            }
        },
        "admin")
}
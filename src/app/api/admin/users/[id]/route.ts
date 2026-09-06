// src/app/api/admin/users/[id]/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {isValidObjectId} from "mongoose";
import {connectDB} from '@/lib/mongodb';
import {User} from '@/models/User';
import {requireAdmin} from "@/lib/auth/utils";
import {deleteUserAccount} from "@/lib/auth/account-deletion";
import {withRateLimit} from "@/lib/middleware";
import {
    AuthorizationError,
    ConflictError,
    handleError,
    NotFoundError,
    ValidationError
} from "@/lib/errors";
import {parseJsonBody} from "@/lib/request";
import {logger} from "@/lib/logger";
import {IUserApi} from "@/lib/schemas/user";
import { updateUserAsAdmin } from '@/lib/auth/admin-user-mutations';

type ApiType = IUserApi['Admin']['ById']
export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    return withRateLimit(
        request,
        async () => {
            const { id } = await params;
            try {
                await requireAdmin();
                await connectDB();

                if (!isValidObjectId(id)) {
                    throw new ValidationError('Invalid user ID format');
                }

                const user = await User.findById(id)
                    .lean<ApiType['Get']['Response']['user']>();

                if (!user) {
                    throw new NotFoundError('User');
                }

                return NextResponse.json<ApiType['Get']['Response']>({user});

            } catch (error) {
                logger.error('Failed to get user', error, {
                    path: `/api/admin/users/${id}`,
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
    {params}: { params: Promise<{ id: string }> }
) {
    return withRateLimit(
        request,
        async () => {
            const { id } = await params;

            try {
                const {session} = await requireAdmin();

                if (!isValidObjectId(id)) {
                    throw new ValidationError('Invalid user ID');
                }

                // Neither check needs the database, so a refused deletion never opens a session.
                if (session.user.id === id) {
                    throw new ConflictError('Cannot delete your own account');
                }

                const {username} = await deleteUserAccount(id, (user) => {
                    if (user.roles?.includes('admin')) {
                        throw new AuthorizationError('Cannot delete admin accounts');
                    }
                });

                logger.info('User deleted', {
                    adminId: session.user.id,
                    deletedUserId: id,
                    username
                });

                return NextResponse.json<ApiType['Delete']['Response']>({
                    success: true,
                    message: 'User account deleted successfully'
                });

            } catch (error) {
                logger.error('User deletion error:', error, {
                    path: `/api/admin/users/${id}`,
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
    {params}: { params: Promise<{ id: string }> }
) {
    return withRateLimit(request, async () => {
            const { id } = await params;
            try {
                const updatedUser = await updateUserAsAdmin(id, await parseJsonBody(request));

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

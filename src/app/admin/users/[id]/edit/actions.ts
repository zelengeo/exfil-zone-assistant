// src/app/admin/users/[id]/edit/actions.ts
'use server';

import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { requireAdmin } from '@/lib/auth/utils';
import {
    IUserApi,
    AdminUserUpdateInput
} from '@/lib/schemas/user';
import { isValidObjectId } from 'mongoose';
import { logger } from '@/lib/logger';
import { updateUserAsAdmin } from '@/lib/auth/admin-user-mutations';
import type { ErrorResponse } from '@/lib/schemas/core';
import { enforceRateLimit } from '@/lib/middleware';
import { revalidatePath } from 'next/cache';
import {
    NotFoundError,
    ValidationError,
    AuthorizationError,
    handleError
} from '@/lib/errors';

/**
 * Server action to fetch user for editing.
 *
 * A server action is a POST endpoint with a generated URL, not an internal call — the browser
 * invokes it, so anything reachable from the client is reachable by anyone who can call it. It
 * carries the same 'admin' policy as the equivalent API route.
 */
export async function getUserForEdit(id: string): Promise<GetUserForEditResult> {
    try {
        // 1. Check authentication and authorization
        await requireAdmin();
        await enforceRateLimit('admin');

        // 2. Validate input
        if (!isValidObjectId(id)) {
            throw new ValidationError('Invalid user ID format');
        }

        // 3. Connect to database
        await connectDB();

        // 4. Fetch user
        const user = await User.findById(id)
            .lean<IUserApi['Admin']['ById']['Get']['Response']['user']>();

        if (!user) {
            throw new NotFoundError('User');
        }

        // 5. Log the action (optional but recommended)
        logger.info('Admin fetched user for editing', {
            userId: id,
            action: 'admin.user.edit.view'
        });

        // 6. Return serialized data (important for server components)
        return {
            success: true as const,
            data: JSON.parse(JSON.stringify(user))
        };
    } catch (error) {
        // 7. Log errors
        logger.error('Failed to fetch user for edit', error, {
            userId: id,
            action: 'admin.user.edit.view'
        });

        // 8. Return error in a consistent format with error codes
        if (error instanceof NotFoundError) {
            return { success: false as const, error: 'User not found', code: 'NOT_FOUND' as const };
        }
        if (error instanceof ValidationError) {
            return { success: false as const, error: error.message, code: 'INVALID_INPUT' as const };
        }
        if (error instanceof AuthorizationError) {
            return { success: false as const, error: 'Unauthorized', code: 'UNAUTHORIZED' as const };
        }

        // Generic error
        return { success: false as const, error: 'Failed to fetch user', code: 'ERROR' as const };
    }
}

/**
 * Server action to update user
 * Includes validation, sanitization, and conflict checking
 */
export async function updateUser(
    userId: string,
    data: AdminUserUpdateInput
): Promise<UpdateUserResult> {
    try {
        await enforceRateLimit('admin');
        const updatedUser = await updateUserAsAdmin(userId, data);

        // Revalidate cached pages
        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}/edit`);
        revalidatePath(`/user/${updatedUser.username}`);

        // Return success with serialized data
        return {
            success: true as const,
            data: JSON.parse(JSON.stringify(updatedUser)),
            message: 'User updated successfully'
        };
    } catch (error) {
        // Log errors with context
        logger.error('Failed to update user', error, {
            userId,
            action: 'admin.user.edit.update'
        });

        const response: ErrorResponse = await handleError(error).json();
        return { success: false, error: response.error.message, code: response.error.code };
    }
}

/**
 * Type-safe server action result types with error codes
 */
export type GetUserForEditResult =
    | { success: true; data: IUserApi['Admin']['ById']['Get']['Response']['user'] }
    | { success: false; error: string; code?: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INVALID_INPUT' | 'ERROR' };

export type UpdateUserResult =
    | { success: true; data: IUserApi['Admin']['ById']['Patch']['Response']['user']; message: string }
    | { success: false; error: string; field?: string; code?: ErrorResponse['error']['code'] };
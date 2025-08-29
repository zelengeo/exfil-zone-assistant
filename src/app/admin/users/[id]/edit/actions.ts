// src/app/admin/users/[id]/edit/actions.ts
'use server';

import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { requireAdmin } from '@/lib/auth/utils';
import {
    IUserApi,
    AdminUserUpdateInput,
    adminUserUpdateSchema
} from '@/lib/schemas/user';
import { isValidObjectId } from 'mongoose';
import { logger } from '@/lib/logger';
import { sanitizeUserInput } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import {
    NotFoundError,
    ValidationError,
    AuthorizationError,
    ConflictError
} from '@/lib/errors';

/**
 * Server action to fetch user for editing
 * No rate limiting needed - this is internal server-side only
 */
export async function getUserForEdit(id: string): Promise<GetUserForEditResult> {
    try {
        // 1. Check authentication and authorization
        await requireAdmin();

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
        // 1. Check authentication and authorization
        const { session } = await requireAdmin();

        // 2. Validate inputs
        if (!isValidObjectId(userId)) {
            throw new ValidationError('Invalid user ID format');
        }

        const validatedData = adminUserUpdateSchema.parse(data);

        // 3. Connect to database
        await connectDB();

        // 4. Sanitize text inputs
        const updates: AdminUserUpdateInput = { ...validatedData };
        if (validatedData.displayName) {
            updates.displayName = sanitizeUserInput(validatedData.displayName);
        }
        if (validatedData.bio) {
            updates.bio = sanitizeUserInput(validatedData.bio);
        }
        if (validatedData.banReason) {
            updates.banReason = sanitizeUserInput(validatedData.banReason);
        }

        // 5. Check for conflicts (username/email uniqueness)
        if (validatedData.username) {
            const existingUser = await User.findOne({
                username: validatedData.username,
                _id: { $ne: userId }
            });

            if (existingUser) {
                throw new ConflictError('Username already in use');
            }
        }

        if (validatedData.email) {
            const existingUser = await User.findOne({
                email: validatedData.email,
                _id: { $ne: userId }
            });

            if (existingUser) {
                throw new ConflictError('Email already in use');
            }
        }

        // 6. Prevent self-modification of critical fields
        if (session.user.id === userId && validatedData.roles) {
            throw new AuthorizationError('Cannot modify your own roles');
        }

        // 7. Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).lean<IUserApi['Admin']['ById']['Patch']['Response']['user']>();

        if (!updatedUser) {
            throw new NotFoundError('User');
        }

        // 8. Log the action
        logger.info('User updated by admin', {
            adminId: session.user.id,
            targetUserId: userId,
            updatedFields: Object.keys(updates),
            action: 'admin.user.edit.update'
        });

        // 9. Revalidate cached pages
        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}/edit`);
        revalidatePath(`/user/${updatedUser.username}`);

        // 10. Return success with updated data
        return {
            success: true as const,
            data: JSON.parse(JSON.stringify(updatedUser)),
            message: 'User updated successfully'
        };
    } catch (error) {
        // 11. Log errors with context
        logger.error('Failed to update user', error, {
            userId,
            action: 'admin.user.edit.update'
        });

        // 12. Return typed errors
        if (error instanceof ValidationError) {
            return {
                success: false as const,
                error: error.message,
            };
        }
        if (error instanceof ConflictError) {
            return {
                success: false as const,
                error: error.message
            };
        }
        if (error instanceof AuthorizationError) {
            return {
                success: false as const,
                error: 'You do not have permission to perform this action'
            };
        }
        if (error instanceof NotFoundError) {
            return {
                success: false as const,
                error: 'User not found'
            };
        }

        // Generic error
        return {
            success: false as const,
            error: 'Failed to update user. Please try again.'
        };
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
    | { success: false; error: string; field?: string; code?: 'CONFLICT' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION' | 'ERROR' };
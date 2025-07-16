// src/app/api/user/update-username/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { withRateLimit } from '@/lib/middleware';
import { requireAuth } from '@/app/admin/components/utils';
import { ConflictError, handleError, NotFoundError } from '@/lib/errors';
import { UserUsernameUpdateInput, userUsernameUpdateSchema } from '@/lib/schemas/user';
import { sanitizeUserInput } from '@/lib/utils';
import { logger } from '@/lib/logger';

// Username update rate limit: 1 per week (604800 seconds)
const USERNAME_UPDATE_RATE_LIMIT = {
    interval: 60 * 60 * 24 * 7, // 1 week
    uniqueTokenPerInterval: 1,
};

export async function PATCH(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
            try {
                const session = await requireAuth();

                const body = await request.json();

                // Validate input
                const validatedData = userUsernameUpdateSchema.parse(body);

                // Sanitize username input
                const updates: UserUsernameUpdateInput = {
                    username: sanitizeUserInput(validatedData.username).toLowerCase(),
                };

                await connectDB();

                // Check if username is already taken by another user
                const existingUser = await User.findOne({
                    username: updates.username,
                    _id: { $ne: session.user.id }
                });

                if (existingUser) {
                    throw new ConflictError('Username already taken');
                }


                // Update user
                const updatedUser = await User.findByIdAndUpdate(
                    session.user.id,
                    {
                        $set: {
                            username: updates.username,
                        }
                    },
                    { new: true, runValidators: true }
                ).select('-password');

                if (!updatedUser) {
                    throw new NotFoundError('User');
                }

                logger.info('Username updated', {
                    userId: session.user.id,
                    newUsername: updates.username,
                });

                return NextResponse.json({
                    success: true,
                    user: {
                        id: updatedUser._id,
                        username: updatedUser.username,
                        displayName: updatedUser.displayName,
                    }
                });

            } catch (error) {
                logger.error('Username update failed', error, {
                    path: '/api/user/update-username',
                    method: 'PATCH',
                });

                return handleError(error);
            }
        },
        USERNAME_UPDATE_RATE_LIMIT
    );
}
// src/app/api/user/update-username/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { UserApi, IUserApi } from '@/lib/schemas/user';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { ConflictError, handleError, NotFoundError } from '@/lib/errors';
import { sanitizeUserInput } from '@/lib/utils';
import { requireAuth } from "@/lib/auth/utils";

type ApiType = IUserApi['UpdateUsername'];

// Username update rate limit: 1 per week
const USERNAME_UPDATE_RATE_LIMIT = {
    interval: 60 * 60 * 24 * 7, // 1 week
    uniqueTokenPerInterval: 1,
};

export async function PATCH(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            const body = await request.json();

            // Validate input
            const validatedData = UserApi.UpdateUsername.Patch.Request.parse(body);

            // Sanitize username
            const username = sanitizeUserInput(validatedData.username).toLowerCase();

            await connectDB();

            // Check if username is already taken
            const existingUser = await User.findOne({
                username,
                _id: { $ne: session.user.id }
            });

            if (existingUser) {
                throw new ConflictError('Username already taken');
            }

            // Update user
            const updatedUser = await User.findByIdAndUpdate(
                session.user.id,
                { $set: { username } },
                { new: true, runValidators: true }
            ).select('username');

            if (!updatedUser) {
                throw new NotFoundError('User');
            }

            logger.info('Username updated', {
                userId: session.user.id,
                newUsername: username,
            });

            return NextResponse.json<ApiType['Patch']['Response']>({
                success: true,
                message: 'Username updated successfully',
                username: updatedUser.username,
            });
        } catch (error) {
            logger.error('Failed to update username', error);
            return handleError(error);
        }
    }, USERNAME_UPDATE_RATE_LIMIT);
}
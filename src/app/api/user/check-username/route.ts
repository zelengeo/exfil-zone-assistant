// src/app/api/user/check-username/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { withRateLimit } from '@/lib/middleware';
import { handleError} from '@/lib/errors';
import { sanitizeUserInput } from '@/lib/utils';
import { logger } from '@/lib/logger';
import {userUsernameUpdateSchema} from "@/lib/schemas/user";

// Check username rate limit: 20 per minute
const CHECK_USERNAME_RATE_LIMIT = {
    interval: 60,
    uniqueTokenPerInterval: 20,
};

export async function GET(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
            try {
                const { searchParams } = new URL(request.url);
                const username = searchParams.get('username');

                // Sanitize and validate username
                let validatedUsername = userUsernameUpdateSchema.shape.username.parse(username);
                validatedUsername = userUsernameUpdateSchema.shape.username.parse(sanitizeUserInput(validatedUsername).toLowerCase());

                await connectDB();

                // Check if username is already taken
                const existingUser = await User.findOne({
                    username: validatedUsername
                });

                const isAvailable = !existingUser;

                return NextResponse.json({
                    available: isAvailable,
                    message: isAvailable ? null : 'Username already taken',
                });

            } catch (error) {
                logger.error('Username check failed', error, {
                    path: '/api/user/check-username',
                    method: 'GET',
                });

                return handleError(error);
            }
        },
        CHECK_USERNAME_RATE_LIMIT
    );
}
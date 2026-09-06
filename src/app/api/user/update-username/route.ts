// src/app/api/user/update-username/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateOwnUsername } from '@/lib/auth/profile-mutations';
import { IUserApi } from '@/lib/schemas/user';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/errors';
import { parseJsonBody } from '@/lib/request';

type ApiType = IUserApi['UpdateUsername'];

export async function PATCH(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const updatedUser = await updateOwnUsername(await parseJsonBody(request));

            return NextResponse.json<ApiType['Patch']['Response']>({
                success: true,
                message: 'Username updated successfully',
                username: updatedUser.username,
            });
        } catch (error) {
            logger.error('Failed to update username', error);
            return handleError(error);
        }
    }, 'usernameUpdate');
}
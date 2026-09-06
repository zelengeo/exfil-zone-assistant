// src/app/api/user/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IUserApi } from '@/lib/schemas/user';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { handleError, NotFoundError } from '@/lib/errors';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserByUsername } from '@/lib/user';

type ApiType = IUserApi['ByUsername'];

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    return withRateLimit(request, async () => {
        try {
            const { username } = await params;
            const session = await getServerSession(authOptions);
            const user = await getUserByUsername(username, session?.user?.id);
            if (!user) throw new NotFoundError('User profile');

            return NextResponse.json<ApiType['Get']['Response']>({ user });
        } catch (error) {
            logger.error('Failed to fetch user profile', error);
            return handleError(error);
        }
    }, 'api');
}
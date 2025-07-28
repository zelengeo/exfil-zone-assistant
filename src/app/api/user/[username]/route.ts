// src/app/api/user/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { IUserApi } from '@/lib/schemas/user';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { handleError, NotFoundError } from '@/lib/errors';
import { sanitizeUserInput } from '@/lib/utils';

type ApiType = IUserApi['ByUsername'];

export async function GET(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    return withRateLimit(request, async () => {
        try {
            const username = sanitizeUserInput(params.username).toLowerCase();

            await connectDB();

            const user = await User.findOne({
                username,
                isActive: true,
                isBanned: false,
            })
                .select('-email -lastLoginAt -isActive -isBanned -banReason -preferences.emailNotifications')
                .lean<ApiType['Get']['Response']['user']>();

            if (!user) {
                throw new NotFoundError('User profile');
            }

            // Apply privacy settings //TODO revisit - redefine private profile
            if (!user.preferences.publicProfile) {
                // Return limited data for private profiles
                return NextResponse.json<ApiType['Get']['Response']>({
                    user: {
                        _id: user._id,
                        username: user.username,
                        displayName: user.displayName,
                        avatarUrl: user.avatarUrl,
                        rank: user.rank,
                        badges: [],
                        bio: '',
                        location: user.location,
                        vrHeadset: user.vrHeadset,
                        createdAt: user.createdAt,
                        stats: {
                            contributionPoints: 0,
                            feedbackSubmitted: 0,
                            bugsReported: 0,
                            featuresProposed: 0,
                            dataCorrections: 0,
                            correctionsAccepted: 0,
                        },
                        preferences: {
                            publicProfile: false,
                            showContributions: false,
                        },
                    }
                });
            }

            return NextResponse.json<ApiType['Get']['Response']>({ user });
        } catch (error) {
            logger.error('Failed to fetch user profile', error);
            return handleError(error);
        }
    }, 'api');
}
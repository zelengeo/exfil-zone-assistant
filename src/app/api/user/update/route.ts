// src/app/api/user/update/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { updateOwnProfile } from '@/lib/auth/profile-mutations';
import {withRateLimit} from "@/lib/middleware";
import {handleError} from "@/lib/errors";
import { parseJsonBody } from '@/lib/request';
import {logger} from "@/lib/logger";


// SettingsSection still consumes this legacy response shape.
export async function PATCH(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
            try {
                const updatedUser = await updateOwnProfile(await parseJsonBody(request));

                return NextResponse.json({
                    success: true,
                    user: {
                        id: updatedUser._id,
                        username: updatedUser.username,
                        displayName: updatedUser.displayName,
                        bio: updatedUser.bio,
                        location: updatedUser.location,
                        vrHeadset: updatedUser.vrHeadset,
                        preferences: updatedUser.preferences,
                    }
                });

            } catch (error) {
                logger.error('User update failed', error, {
                    path: '/api/user/update',
                    method: 'PATCH',
                });

                return handleError(error);
            }
        },
        'userUpdate'
    );
}
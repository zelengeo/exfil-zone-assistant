// src/app/api/user/update/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {connectDB} from '@/lib/mongodb';
import {User} from '@/models/User';
import {withRateLimit} from "@/lib/middleware";
import {requireAuth} from "@/lib/auth/utils";
import {ConflictError, handleError, NotFoundError} from "@/lib/errors";
import {UserUpdateInput, userUpdateSchema} from "@/lib/schemas/user";
import {sanitizeUserInput} from "@/lib/utils";
import {logger} from "@/lib/logger";


export async function PATCH(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
            try {
                const session = await requireAuth();

                const body = await request.json();

                // Validate input
                const validatedData = userUpdateSchema.parse(body);

                // Sanitize text inputs
                const updates: UserUpdateInput = {...validatedData};
                if (validatedData.displayName) {
                    updates.displayName = sanitizeUserInput(validatedData.displayName);
                }
                if (validatedData.bio) {
                    updates.bio = sanitizeUserInput(validatedData.bio);
                }

                await connectDB();

                // Update user
                const updatedUser = await User.findByIdAndUpdate(
                    session.user.id,
                    { $set: updates },
                    { new: true, runValidators: true }
                ).select('-password');

                if (!updatedUser) {
                    throw new NotFoundError('User');
                }

                logger.info('User profile updated', {
                    userId: session.user.id,
                    updatedFields: Object.keys(updates),
                });

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
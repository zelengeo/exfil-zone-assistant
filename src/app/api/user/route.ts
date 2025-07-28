// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { UserApi, IUserApi } from '@/lib/schemas/user';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { handleError, NotFoundError } from '@/lib/errors';
import { requireAuth } from "@/lib/auth/utils";
import {sanitizeUserInput} from "@/lib/utils";
import mongoose from "mongoose";
import {Account} from "@/models/Account";
import {Feedback} from "@/models/Feedback";

type ApiType = IUserApi;
export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            await connectDB();

            const user = await User.findById(session.user.id)
                .lean<ApiType['Get']['Response']['user']>();

            if (!user) {
                throw new NotFoundError('User profile');
            }

            return NextResponse.json<ApiType['Get']['Response']>({ user });
        } catch (error) {
            logger.error('Failed to fetch user profile', error);
            return handleError(error);
        }
    }, 'api');
}

export async function PATCH(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            const body = await request.json();

            // Validate input
            const validatedData = UserApi.Patch.Request.parse(body);

            // Sanitize text inputs
            if (validatedData.displayName) {
                validatedData.displayName = sanitizeUserInput(validatedData.displayName);
            }
            if (validatedData.bio) {
                validatedData.bio = sanitizeUserInput(validatedData.bio);
            }

            await connectDB();

            // Update user
            const updatedUser = await User.findByIdAndUpdate(
                session.user.id,
                { $set: validatedData },
                { new: true, runValidators: true }
            ).lean<ApiType['Patch']['Response']['user']>();

            if (!updatedUser) {
                throw new NotFoundError('User');
            }

            logger.info('User profile updated', {
                userId: session.user.id,
                updatedFields: Object.keys(validatedData),
            });

            return NextResponse.json<ApiType['Patch']['Response']>({ user: updatedUser });
        } catch (error) {
            logger.error('Failed to update user profile', error);
            return handleError(error);
        }
    }, 'userUpdate');
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await requireAuth();

        await connectDB();

        // Start a transaction for safe deletion
        const mongooseSession = await mongoose.startSession();

        try {
            await mongooseSession.withTransaction(async () => {
                // Find the user to delete
                const userToDelete = await User.findById(session.user.id);
                if (!userToDelete) {
                    throw new NotFoundError('User');
                }

                // Delete associated accounts (OAuth connections)
                await Account.deleteMany({userId: session.user.id});

                // Handle feedback - either anonymize or delete based on your policy
                // For this example, we'll anonymize feedback to preserve data integrity
                await Feedback.updateMany(
                    {userId: session.user.id},
                    {
                        $unset: {userId: 1},
                        $push: {
                            reviewerNotes: {
                                note: `User account deleted - ${session.user.username || "|unknown_username|"}`,
                                addedByUserId: session.user.id
                                // timestamp gets set automatically
                            }
                        }
                    }
                );

                // Delete the user
                await User.findByIdAndDelete(session.user.id);

                logger.info('User account deleted', {
                    userId: session.user.id,
                    username: userToDelete.username,
                    deletedBy: session.user.id,
                });
            });

            return NextResponse.json({
                success: true,
                message: 'User account deleted successfully',
            });

        } catch (error) {
            await mongooseSession.abortTransaction();
            throw error;
        } finally {
            await mongooseSession.endSession();
        }

    } catch (error) {
        logger.error('User deletion failed', error, {
            path: '/api/user',
            method: 'DELETE',
        });

        return handleError(error);
    }

}
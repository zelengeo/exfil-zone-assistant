// src/app/api/user/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Account } from '@/models/Account';
import { Feedback } from '@/models/Feedback';
import { withRateLimit } from '@/lib/middleware';
import { requireAuth } from '@/app/admin/components/utils';
import { handleError, NotFoundError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import mongoose from 'mongoose';

// User delete rate limit: 1 per day (to prevent accidental deletions)
const USER_DELETE_RATE_LIMIT = {
    interval: 60 * 60 * 24, // 1 day
    uniqueTokenPerInterval: 1,
};

export async function DELETE(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
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
                        await Account.deleteMany({ userId: session.user.id });

                        // Handle feedback - either anonymize or delete based on your policy
                        // For this example, we'll anonymize feedback to preserve data integrity
                        await Feedback.updateMany(
                            { userId: session.user.id },
                            {
                                $unset: { userId: 1 },
                                $push: { reviewerNotes: {
                                        note: `User account deleted - ${session.user.username || "|unknown_username|"}`,
                                        addedByUserId: session.user.id
                                        // timestamp gets set automatically
                                    } }
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
                    path: '/api/user/delete',
                    method: 'DELETE',
                });

                return handleError(error);
            }
        },
        USER_DELETE_RATE_LIMIT
    );
}
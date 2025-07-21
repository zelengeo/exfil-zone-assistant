// src/app/api/feedback/route.ts
import {NextRequest} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/app/api/auth/[...nextauth]/route';
import {connectDB} from '@/lib/mongodb';
import mongoose from "mongoose";
import {Feedback} from '@/models/Feedback';
import {User} from '@/models/User';
import {feedbackSubmitSchema} from "@/lib/schemas/feedback";
import {withRateLimit} from "@/lib/middleware";
import {logger} from "@/lib/logger";
import {handleError} from "@/lib/errors";
import {sanitizeUserInput} from "@/lib/utils";
import {requireAuthWithUserCheck} from "@/lib/auth/utils";

export async function POST(request: Request) {
    return withRateLimit(
        request,
        async () => {
            const mongooseSession = await mongoose.startSession();

            try {
                const { session } = await requireAuthWithUserCheck();
                await connectDB();
                const body = await request.json();

                // Validate input with Zod
                const validatedData = feedbackSubmitSchema.parse(body);

                // Sanitize inputs
                const sanitizedData = {
                    ...validatedData,
                    title: sanitizeUserInput(validatedData.title),
                    description: sanitizeUserInput(validatedData.description),
                };

                // Start transaction
                mongooseSession.startTransaction();

                // Create feedback
                const feedbackData = {
                    ...sanitizedData,
                    userId: session?.user?.id,
                    status: 'new',
                    priority: sanitizedData.priority || 'medium',
                    userAgent: request.headers.get('user-agent'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const feedback = await Feedback.create([feedbackData], { session: mongooseSession });

                // Update user stats if authenticated
                if (session?.user?.id) {
                    await User.findByIdAndUpdate(
                        session.user.id,
                        {
                            $inc: {
                                'stats.feedbackSubmitted': 1,
                                [`stats.${validatedData.type}sReported`]: 1,
                            }
                        },
                        { session: mongooseSession }
                    );
                }

                // Commit transaction
                await mongooseSession.commitTransaction();

                // Log successful submission
                logger.info('Feedback submitted', {
                    feedbackId: feedback[0]._id.toString(),
                    type: feedback[0].type,
                    userId: session?.user?.id,
                    isAnonymous: feedback[0].isAnonymous,
                });

                return Response.json({
                    success: true,
                    feedbackId: feedback[0]._id,
                    message: 'Thank you for your feedback!',
                });

            } catch (error) {
                // Abort transaction on error
                await mongooseSession.abortTransaction();

                logger.error('Feedback submission failed', error, {
                    path: '/api/feedback/submit',
                    method: 'POST',
                });

                return handleError(error);
            } finally {
                // End session
                await mongooseSession.endSession();
            }
        },
        'feedbackPostAuthenticated'
    );
}
// GET endpoint for retrieving feedback (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user?.id) {
            return Response.json({error: 'Unauthorized'}, {status: 401});
        }

        await connectDB();

        const user = await User.findById(session.user.id);
        if (!user?.roles?.includes('admin')) {
            return Response.json({error: 'Forbidden'}, {status: 403});
        }

        const {searchParams} = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const priority = searchParams.get('priority');

        // Build filter
        const filter = {
            ...(status && { status }),
            ...(type && { type }),
            ...(priority && { priority }),
        };

        // Get feedback with pagination
        const skip = (page - 1) * limit;
        const [feedback, totalCount] = await Promise.all([
            Feedback.find(filter)
                .populate('userId', 'username avatarUrl')
                .sort({createdAt: -1})
                .skip(skip)
                .limit(limit)
                .lean(),
            Feedback.countDocuments(filter)
        ]);

        return Response.json({
            feedback,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page * limit < totalCount,
                hasPrevPage: page > 1,
            }
        });

    } catch (error) {
        console.error('Feedback retrieval error:', error);
        return Response.json(
            {error: 'Failed to retrieve feedback'},
            {status: 500}
        );
    }
}
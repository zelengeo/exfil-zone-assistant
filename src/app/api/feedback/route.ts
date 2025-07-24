// src/app/api/feedback/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {connectDB} from '@/lib/mongodb';
import mongoose from "mongoose";
import {Feedback} from '@/models/Feedback';
import {User} from '@/models/User';
import {IFeedbackApi, FeedbackApi} from "@/lib/schemas/feedback";
import {withRateLimit} from "@/lib/middleware";
import {logger} from "@/lib/logger";
import {handleError} from "@/lib/errors";
import {sanitizeUserInput} from "@/lib/utils";
import {requireAuthWithUserCheck} from "@/lib/auth/utils";


type ApiType = IFeedbackApi;
export async function POST(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
            const mongooseSession = await mongoose.startSession();

            try {
                const {session} = await requireAuthWithUserCheck();
                await connectDB();
                const body = await request.json();
                const validatedData = FeedbackApi["Post"]["Request"].parse(body);

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

                const feedback = await Feedback.create([feedbackData], {session: mongooseSession})

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
                        {session: mongooseSession}
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

                return NextResponse.json<ApiType["Post"]["Response"]>({
                    success: true,
                    feedbackId: feedback[0]._id,
                    message: 'Thank you for your feedback!',
                });

            } catch (error) {
                // Abort transaction on error
                if (mongooseSession.inTransaction()) {
                    await mongooseSession.abortTransaction();
                }

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
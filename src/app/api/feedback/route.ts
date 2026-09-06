// src/app/api/feedback/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {connectDB} from '@/lib/mongodb';
import mongoose, {type ClientSession} from "mongoose";
import {Feedback} from '@/models/Feedback';
import {User} from '@/models/User';
import {IFeedbackApi, FeedbackApi, type SubmittableFeedbackType} from "@/lib/schemas/feedback";
import {withRateLimit} from "@/lib/middleware";
import {logger} from "@/lib/logger";
import {handleError} from "@/lib/errors";
import { parseJsonBody } from '@/lib/request';
import {sanitizeUserInput} from "@/lib/utils";
import {requireAuthWithUserCheck} from "@/lib/auth/utils";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";


type ApiType = IFeedbackApi;

/** Declared User.stats counters, by the feedback type that increments them. */
const PER_TYPE_STAT: Partial<Record<SubmittableFeedbackType, string>> = {
    bug: 'stats.bugsReported',
    feature: 'stats.featuresProposed',
};
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    return withRateLimit(
        request,
        async () => {
            let mongooseSession: ClientSession | null = null;

            try {
                const body = await parseJsonBody(request);
                const validatedData = FeedbackApi["Post"]["Request"].parse(body);

                // If user is logged in, verify they're not banned
                if (session) {
                    await requireAuthWithUserCheck();
                }

                await connectDB();
                mongooseSession = await mongoose.startSession();

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
                    // The per-type counter is looked up, not built from the type name: the old
                    // template produced 'stats.featuresReported' and 'stats.generalsReported',
                    // neither of which the User schema declares, so strict mode dropped them and
                    // only bug reports ever counted.
                    const perTypeStat = PER_TYPE_STAT[validatedData.type];

                    await User.findByIdAndUpdate(
                        session.user.id,
                        {
                            $inc: {
                                'stats.feedbackSubmitted': 1,
                                ...(perTypeStat ? {[perTypeStat]: 1} : {}),
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
                });

                return NextResponse.json<ApiType["Post"]["Response"]>({
                    success: true,
                    feedbackId: feedback[0]._id,
                    message: 'Thank you for your feedback!',
                });

            } catch (error) {
                // Abort transaction on error
                if (mongooseSession?.inTransaction()) {
                    try {
                        await mongooseSession.abortTransaction();
                    } catch (cleanupError) {
                        logger.error('Failed to abort feedback transaction', cleanupError);
                    }
                }

                logger.error('Feedback submission failed', error, {
                    path: '/api/feedback/submit',
                    method: 'POST',
                });

                return handleError(error);
            } finally {
                // End session
                if (mongooseSession) {
                    try {
                        await mongooseSession.endSession();
                    } catch (cleanupError) {
                        logger.error('Failed to end feedback session', cleanupError);
                    }
                }
            }
        },
        session ? 'feedbackPostAuthenticated' : 'feedbackPostUnauthenticated'
    );
}

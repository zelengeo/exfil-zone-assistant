// src/app/api/admin/feedback/[id]/route.ts
import {NextRequest} from 'next/server';
import {connectDB} from '@/lib/mongodb';
import {Feedback} from '@/models/Feedback';
import {User} from '@/models/User';
import {requireAdmin} from "@/app/admin/components/utils";
import {withRateLimit} from "@/lib/middleware";
import {isValidObjectId} from "mongoose";
import {handleError, NotFoundError, ValidationError} from '@/lib/errors';
import {feedbackStatusUpdateSchema, IFeedback} from "@/lib/schemas/feedback";
import {logger} from "@/lib/logger";

// GET /api/admin/feedback/[id] - Get specific feedback item
export async function GET(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    return withRateLimit(
        request,
        async () => {
            try {
                if (!isValidObjectId(params.id)) {
                    throw new ValidationError('Invalid feedback ID');
                }

                const {session} = await requireAdmin();

                const feedback = await Feedback.findById(params.id)
                    .populate('userId', 'username')
                    .lean<IFeedback>();

                if (!feedback) {
                    throw new NotFoundError('Feedback');
                }

                // Remove sensitive data for anonymous users
                if (!session?.user?.roles?.includes('admin')) {
                    delete feedback.reviewerNotes;
                }

                return Response.json({feedback});

            } catch (error) {
                logger.error('Get feedback error:', error, {
                    path: `/api/feedback/${params.id}`,
                    method: 'GET',
                });
                return handleError(error);
            }
        },
        'api'
    );
}

// PATCH /api/admin/feedback/[id] - Update feedback item
export async function PATCH(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    return withRateLimit(
        request,
        async () => {
            try {
                const {session} = await requireAdmin();

                const body = await request.json();
                const validatedData = feedbackStatusUpdateSchema.parse(body);

                const feedback = await Feedback.findByIdAndUpdate(
                    params.id,
                    {
                        $set: {
                            ...validatedData,
                            reviewedBy: session.user.id,
                            reviewedAt: new Date(),
                            updatedAt: new Date()
                        }
                    },
                    {new: true}
                ).populate('userId', 'username');

                if (!feedback) {
                    throw new NotFoundError('Feedback');
                }

                logger.info('Feedback updated', {
                    feedbackId: params.id,
                    adminId: session.user.id,
                    updates: Object.keys(validatedData)
                });

                return Response.json({feedback});

            } catch (error) {
                logger.error('Update feedback error:', error, {
                    path: `/api/feedback/${params.id}`,
                    method: 'PATCH',
                });
                return handleError(error);
            }
        },
        'admin'
    );
}

// DELETE /api/admin/feedback/[id] - Delete feedback item (admin only)
export async function DELETE(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    withRateLimit(request, async () => {
            try {
                if (!isValidObjectId(params.id)) {
                    throw new ValidationError('Invalid feedback ID');
                }

                await requireAdmin();

                const feedback = await Feedback.findByIdAndDelete(params.id);

                if (!feedback) {
                    throw new NotFoundError('Feedback');
                }

                return Response.json({
                    success: true,
                    message: 'Feedback deleted successfully'
                });

            } catch (error) {
                logger.error('Admin delete feedback error:', error, {
                    path: `/api/feedback/${params.id}`,
                    method: 'DELETE',
                });
                return handleError(error);
            }
        },
        'admin')
}
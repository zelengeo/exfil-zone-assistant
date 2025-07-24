// src/app/api/admin/feedback/[id]/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {isValidObjectId} from "mongoose";
import {Feedback} from '@/models/Feedback';
import {IFeedbackApi, FeedbackApi} from "@/lib/schemas/feedback";
import {withRateLimit} from "@/lib/middleware";
import {requireAdmin} from "@/lib/auth/utils";
import {handleError, NotFoundError, ValidationError} from '@/lib/errors';
import {logger} from "@/lib/logger";


type ApiType = IFeedbackApi["Admin"]["ById"];
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

                await requireAdmin();

                const feedback = await Feedback.findById(params.id)
                    .populate('userId', 'username')
                    .lean<ApiType["Get"]["Response"]['feedback']>();

                if (!feedback) {
                    throw new NotFoundError('Feedback');
                }

                return NextResponse.json<ApiType["Get"]["Response"]>({feedback});

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
                const validatedData = FeedbackApi.Admin.ById.Patch.Request.parse(body);

                const updateData = {
                    $set: {
                        ...(validatedData.status && { status: validatedData.status }),
                        ...(validatedData.priority && { priority: validatedData.priority }),
                        updatedAt: new Date(),
                    },
                    ...(validatedData.reviewerNotes && {
                        $push:{
                            reviewerNotes: {
                                note: validatedData.reviewerNotes.note,
                                timestamp: new Date(),
                                addedByUserId: session.user.id,
                            }
                        }
                    })
                };

                // Update the feedback
                const feedback = await Feedback.findByIdAndUpdate(
                    params.id,
                    updateData,
                    { new: true }
                ).populate('userId', 'username').lean<IFeedbackApi['Admin']['ById']['Patch']['Response']['feedback']>();

                if (!feedback) {
                    throw new NotFoundError('Feedback');
                }

                logger.info('Feedback updated', {
                    feedbackId: params.id,
                    adminId: session.user.id,
                    updates: Object.keys(validatedData)
                });

                return NextResponse.json<IFeedbackApi['Admin']['ById']['Patch']['Response']>({feedback});

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
    return withRateLimit(request, async () => {
            try {
                if (!isValidObjectId(params.id)) {
                    throw new ValidationError('Invalid feedback ID');
                }

                await requireAdmin();

                const feedback = await Feedback.findByIdAndDelete(params.id);

                if (!feedback) {
                    throw new NotFoundError('Feedback');
                }

                return NextResponse.json<IFeedbackApi['Admin']['ById']['Delete']['Response']>({
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
// src/app/api/admin/corrections/[id]/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {connectDB} from '@/lib/mongodb';
import {DataCorrection} from '@/models/DataCorrection';
import {User} from '@/models/User';
import {dataCorrectionReviewSchema, IDataCorrectionAdminGet, IDataCorrectionAdminGetRelated} from '@/lib/schemas/dataCorrection';
import {withRateLimit} from '@/lib/middleware';
import {logger} from '@/lib/logger';
import {NotFoundError, ValidationError, handleError, ConflictError} from '@/lib/errors';
import mongoose, {isValidObjectId} from 'mongoose';
import {requireAdminOrModerator} from "@/lib/auth/utils";

// GET /api/admin/corrections/[id] - Get full correction details
export async function GET(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    return withRateLimit(request, async () => {
        try {
            await requireAdminOrModerator();

            if (!isValidObjectId(params.id)) {
                throw new ValidationError('Invalid correction ID');
            }

            await connectDB();

            const correction = await DataCorrection
                .findById(params.id)
                .populate('userId', 'username displayName image email')
                .populate('reviewedBy', 'username displayName')
                .lean<IDataCorrectionAdminGet>();

            if (!correction) {
                throw new NotFoundError('Correction not found');
            }

            // Get related corrections for context
            const relatedCorrections = await DataCorrection
                .find({
                    entityType: correction.entityType,
                    entityId: correction.entityId,
                    _id: {$ne: correction._id}
                })
                .select('status createdAt userId')
                .populate('userId', 'username')
                .sort({createdAt: -1})
                .limit(5)
                .lean<IDataCorrectionAdminGetRelated>();

            return NextResponse.json({
                correction,
                relatedCorrections
            });
        } catch (error) {
            logger.error('Failed to fetch correction details', error);
            return handleError(error);
        }
    }, 'admin');
}

// PATCH /api/admin/corrections/[id] - Review a correction
export async function PATCH(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    return withRateLimit(request, async () => {
        const session = await mongoose.startSession();

        try {
            const { session: adminSession } = await requireAdminOrModerator();

            if (!isValidObjectId(params.id)) {
                throw new ValidationError('Invalid correction ID');
            }

            const body = await request.json();
            const validatedData = dataCorrectionReviewSchema.parse(body);

            await connectDB();

            // Start transaction
            session.startTransaction();

            const correction = await DataCorrection.findById(params.id).session(session);
            if (!correction) {
                throw new NotFoundError('Correction not found');
            }

            if (correction.status !== 'pending') {
                throw new ConflictError('Only pending corrections can be reviewed');
            }

            // Update correction
            correction.status = validatedData.status;
            correction.reviewedBy = adminSession!.user.id;
            correction.reviewedAt = new Date();
            if (validatedData.reviewNotes) {
                correction.reviewNotes = validatedData.reviewNotes;
            }

            await correction.save({ session });

            // Update user stats if correction has a userId
            if (correction.userId) {
                const updateQuery = validatedData.status === 'approved'
                    ? {
                        $inc: {
                            'stats.dataCorrections': 1,
                            'stats.correctionsAccepted': 1,
                            'stats.contributionPoints': 10
                        }
                    }
                    : {$inc: {'stats.dataCorrections': 1}};

                await User.findByIdAndUpdate(
                    correction.userId,
                    updateQuery,
                    { session }
                );
            }

            // Commit transaction
            await session.commitTransaction();

            logger.info('Correction reviewed', {
                correctionId: correction._id,
                status: validatedData.status,
                reviewerId: adminSession!.user.id,
            });

            return NextResponse.json({
                success: true,
                correction: {
                    id: correction._id.toString(),
                    status: correction.status,
                    reviewedAt: correction.reviewedAt,
                },
            });

        } catch (error) {
            // Abort transaction on error
            await session.abortTransaction();

            logger.error('Failed to review correction', error);
            return handleError(error);
        } finally {
            // End session
            await session.endSession();
        }
    }, 'admin');
}

// DELETE /api/admin/corrections/[id] - Delete a correction
export async function DELETE(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    return withRateLimit(request, async () => {
        try {
            const { session } = await requireAdminOrModerator();

            if (!isValidObjectId(params.id)) {
                throw new ValidationError('Invalid correction ID');
            }

            await connectDB();

            const correction = await DataCorrection.findByIdAndDelete(params.id);
            if (!correction) {
                throw new NotFoundError('Correction not found');
            }

            logger.info('Correction deleted', {
                correctionId: params.id,
                deletedBy: session!.user.id,
            });

            return NextResponse.json({
                success: true,
                message: 'Correction deleted successfully',
            });
        } catch (error) {
            logger.error('Failed to delete correction', error);
            return handleError(error);
        }
    }, 'admin');
}
// src/app/api/corrections/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { DataCorrection } from '@/models/DataCorrection';
import { User } from '@/models/User';
import { dataCorrectionReviewSchema } from '@/lib/schemas/dataCorrection';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import {
    NotFoundError,
    ValidationError,
    handleError
} from '@/lib/errors';
import { isValidObjectId } from 'mongoose';
import {requireAdminOrModerator} from "@/app/admin/components/utils";


// GET /api/corrections/[id] - Get a specific correction
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withRateLimit(request, async () => {
        try {
            if (!isValidObjectId(params.id)) {
                throw new ValidationError('Invalid correction ID');
            }

            await connectDB();

            const correction = await DataCorrection
                .findById(params.id)
                .populate('userId', 'username displayName image')
                .populate('reviewedBy', 'username displayName')
                .lean();

            if (!correction) {
                throw new NotFoundError('Correction not found');
            }

            return NextResponse.json({ correction });
        } catch (error) {
            logger.error('Failed to fetch correction', error);
            return handleError(error);
        }
    }, 'standard');
}

// PATCH /api/corrections/[id] - Review a correction
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withRateLimit(request, async () => {
        try {
            const { session } = await requireAdminOrModerator();

            if (!isValidObjectId(params.id)) {
                throw new ValidationError('Invalid correction ID');
            }

            const body = await request.json();
            const validatedData = dataCorrectionReviewSchema.parse(body);

            await connectDB();

            const correction = await DataCorrection.findById(params.id);
            if (!correction) {
                throw new NotFoundError('Correction not found');
            }

            if (correction.status !== 'pending') {
                throw new ValidationError('Only pending corrections can be reviewed');
            }

            // Update correction
            correction.status = validatedData.status;
            correction.reviewedBy = session.user.id;
            correction.reviewedAt = new Date();
            if (validatedData.reviewNotes) {
                correction.reviewNotes = validatedData.reviewNotes;
            }

            await correction.save();

            // If approved, we could trigger an update to the actual data
            // This would depend on your implementation
            if (validatedData.status === 'approved') {
                // TODO: Apply the correction to the actual data
                // This would require entity-specific logic
                logger.info('Correction approved - ready for implementation', {
                    correctionId: correction._id,
                    entityType: correction.entityType,
                    entityId: correction.entityId,
                });
            }

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
                    : { $inc: { 'stats.dataCorrections': 1 } };

                await User.findByIdAndUpdate(correction.userId, updateQuery);
            }

            logger.info('Correction reviewed', {
                correctionId: correction._id,
                status: validatedData.status,
                reviewerId: session.user.id,
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
            logger.error('Failed to review correction', error);
            return handleError(error);
        }
    }, 'admin');
}

// DELETE /api/corrections/[id] - Delete a correction (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withRateLimit(request, async () => {
        try {
            const session = requireAdminOrModerator()

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
                deletedBy: session.user.id,
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
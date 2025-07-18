// src/app/api/corrections/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DataCorrection } from '@/models/DataCorrection';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import {
    NotFoundError,
    ValidationError,
    handleError, AuthorizationError
} from '@/lib/errors';
import { isValidObjectId } from 'mongoose';
import {requireAuth} from "@/lib/auth/utils";


// GET /api/corrections/[id] - Get a specific correction
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();

            if (!isValidObjectId(params.id)) {
                throw new ValidationError('Invalid correction ID');
            }

            await connectDB();
            const correction = await DataCorrection
                .findById(params.id)
                .select('-reviewNotes') // Hide internal review notes
                .populate('reviewedBy', 'username displayName')
                .lean();

            if (!correction) {
                throw new NotFoundError('Correction not found');
            }

            // Check ownership
            if (params.id !== session.user.id) {
                throw new AuthorizationError('You can only view your own corrections');
            }

            return NextResponse.json({ correction });
        } catch (error) {
            logger.error('Failed to fetch correction', error);
            return handleError(error);
        }
    }, 'feedbackGetAuthenticated');
}

// DELETE /api/corrections/[id] - Delete a correction (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth()

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
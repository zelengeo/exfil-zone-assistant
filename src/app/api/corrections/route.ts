// src/app/api/corrections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DataCorrection } from '@/models/DataCorrection';
import {DataCorrectionApi, IDataCorrectionApi} from '@/lib/schemas/dataCorrection';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import {handleError} from '@/lib/errors';
import { sanitizeUserInput } from '@/lib/utils';
import {requireAuth} from "@/lib/auth/utils";

type ApiType = IDataCorrectionApi
// GET /api/corrections - Get corrections (with filters)
export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            await connectDB();

            const { searchParams } = new URL(request.url);
            const params = DataCorrectionApi.Get.Request.parse(
                Object.fromEntries(searchParams.entries())
            );


            // Build query - always filtered by current user
            const query = {
                userId: session.user.id,
                ...(params.entityType && { entityType: params.entityType }),
                ...(params.status && { status: params.status }),
            };

            // Get total count
            const total = await DataCorrection.countDocuments(query);

            // Get paginated results
            const corrections = await DataCorrection
                .find(query)
                .select('-reviewNotes') // Hide internal review notes
                .populate('reviewedBy', 'username displayName')
                .sort({ createdAt: -1 })
                .skip((params.page - 1) * params.limit)
                .limit(params.limit)
                .lean<ApiType['Get']['Response']['corrections']>();

            return NextResponse.json<ApiType['Get']['Response']>({
                corrections,
                pagination: {
                    page: params.page,
                    limit: params.limit,
                    total,
                    pages: Math.ceil(total / params.limit),
                },
            });
        } catch (error) {
            logger.error('Failed to fetch user corrections', error);
            return handleError(error);
        }
    }, 'feedbackGetAuthenticated');
}

// POST /api/corrections - Submit a new correction
// type SanitizableData =
//     | string
//     | number
//     | boolean
//     | SanitizableData[]
//     | { [key: string]: SanitizableData };

// Deep sanitize all text fields in proposedData
const sanitizeProposedData = (data: any): any => {
    if (typeof data === 'string') {
        return sanitizeUserInput(data);
    } else if (Array.isArray(data)) {
        return data.map(item => sanitizeProposedData(item));
    } else if (typeof data === 'object' && data !== null) {
        const sanitized: any = {};
        Object.keys(data).forEach(key => {
            sanitized[key] = sanitizeProposedData(data[key]);
        });
        return sanitized;
    }
    return data;
};
export async function POST(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            const body = await request.json();

            // Validate input
            const validatedData = DataCorrectionApi.Post.Request.parse(body);


            // Sanitize all inputs
            if (validatedData.reason) {
                validatedData.reason = sanitizeUserInput(validatedData.reason);
            }
            validatedData.proposedData = sanitizeProposedData(validatedData.proposedData);

            await connectDB();

            // Create correction document
            const correction = await DataCorrection.create({
                ...validatedData,
                userId: session.user.id,
            });

            // Log the submission
            logger.info('Data correction submitted', {
                correctionId: correction._id,
                entityType: validatedData.entityType,
                entityId: validatedData.entityId,
                userId: session.user.id,
            });

            return NextResponse.json<ApiType["Post"]["Response"]>({
                success: true,
                correction: {
                    id: correction._id.toString(),
                    status: correction.status,
                },
            });
        } catch (error) {
            logger.error('Failed to submit correction', error);
            return handleError(error);
        }
    }, 'feedbackPostAuthenticated');
}
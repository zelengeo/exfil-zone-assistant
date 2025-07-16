// src/app/api/corrections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DataCorrection } from '@/models/DataCorrection';
import { dataCorrectionSubmitSchema } from '@/lib/schemas/dataCorrection';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { ValidationError, handleError } from '@/lib/errors';
import { sanitizeUserInput } from '@/lib/utils';
import {requireAuth} from "@/app/admin/components/utils";

// GET /api/corrections - Get corrections (with filters)
export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            await connectDB();

            const { searchParams } = new URL(request.url);
            const entityType = searchParams.get('entityType');
            const entityId = searchParams.get('entityId');
            const status = searchParams.get('status');
            const userId = searchParams.get('userId');
            const page = parseInt(searchParams.get('page') || '1', 10);
            const limit = parseInt(searchParams.get('limit') || '10', 10);

            // Build query
            const query: any = {};
            if (entityType) query.entityType = entityType;
            if (entityId) query.entityId = entityId;
            if (status) query.status = status;
            if (userId) query.userId = userId;

            // Get total count
            const total = await DataCorrection.countDocuments(query);

            // Get paginated results
            const corrections = await DataCorrection
                .find(query)
                .populate('userId', 'username displayName image')
                .populate('reviewedBy', 'username displayName')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            return NextResponse.json({
                corrections,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            logger.error('Failed to fetch corrections', error);
            return handleError(error);
        }
    }, 'feedbackAuthenticated');
}

// POST /api/corrections - Submit a new correction
export async function POST(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            const body = await request.json();

            // Validate input
            const validatedData = dataCorrectionSubmitSchema.parse(body);

            // Sanitize text inputs
            if (validatedData.reason) {
                validatedData.reason = sanitizeUserInput(validatedData.reason);
            }

            // Calculate changes diff
            const changes: Record<string, { from: any; to: any }> = {};

            const processChanges = (current: any, proposed: any, prefix = '') => {
                Object.keys(proposed).forEach(key => {
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    const currentValue = current?.[key];
                    const proposedValue = proposed[key];

                    if (proposedValue !== undefined && proposedValue !== currentValue) {
                        if (typeof proposedValue === 'object' && !Array.isArray(proposedValue)) {
                            processChanges(currentValue || {}, proposedValue, fullKey);
                        } else {
                            changes[fullKey] = { from: currentValue, to: proposedValue };
                        }
                    }
                });
            };

            processChanges(validatedData.currentData, validatedData.proposedData);

            // Ensure there are actual changes
            if (Object.keys(changes).length === 0) {
                throw new ValidationError('No changes detected in the proposed data');
            }

            await connectDB();

            // Create correction document
            const correction = await DataCorrection.create({
                ...validatedData,
                userId: session?.user?.id || null,
                changes,
            });

            // Log the submission
            logger.info('Data correction submitted', {
                correctionId: correction._id,
                entityType: validatedData.entityType,
                entityId: validatedData.entityId,
                userId: session?.user?.id,
                changesCount: Object.keys(changes).length,
            });

            return NextResponse.json({
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
    }, 'feedbackAuthenticated');
}
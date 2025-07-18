// src/app/api/corrections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DataCorrection } from '@/models/DataCorrection';
import { dataCorrectionSubmitSchema } from '@/lib/schemas/dataCorrection';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import {handleError} from '@/lib/errors';
import { sanitizeUserInput } from '@/lib/utils';
import {requireAuth} from "@/lib/auth/utils";

// GET /api/corrections - Get corrections (with filters)
export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            await connectDB();

            const { searchParams } = new URL(request.url);
            const page = parseInt(searchParams.get('page') || '1', 10);
            const limit = parseInt(searchParams.get('limit') || '10', 10);
            const status = searchParams.get('status');
            const entityType = searchParams.get('entityType');

            // Build query - always filtered by current user
            const query: any = { userId: session.user.id };
            if (status) query.status = status;
            if (entityType) query.entityType = entityType;

            // Get total count
            const total = await DataCorrection.countDocuments(query);

            // Get paginated results
            const corrections = await DataCorrection
                .find(query)
                .select('-reviewNotes') // Hide internal review notes
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
            logger.error('Failed to fetch user corrections', error);
            return handleError(error);
        }
    }, 'feedbackGetAuthenticated');
}
// export async function GET(request: NextRequest) {
//     return withRateLimit(request, async () => {
//         try {
//             await connectDB();
//
//             // Get session first
//             const session = await requireAuth();
//
//             // For authenticated users, verify their current roles from DB
//             let isAdminOrModerator = false;
//
//             // Fetch fresh user data from database
//             const user = await User.findById(session.user.id)
//                 .select('roles isBanned')
//                 .lean<IUser>();
//
//             if (!user) {
//                 throw new NotFoundError('User');
//             }
//
//             if (user.isBanned) {
//                 // User doesn't exist or is banned
//                 throw new AuthorizationError("User is banned. Please contact support if you believe this is an error.")
//             }
//
//             const verifiedUserId = user._id.toString();
//             isAdminOrModerator = user.roles?.some((role: string) =>
//                 ['admin', 'moderator'].includes(role)
//             ) || false;
//
//
//             const { searchParams } = new URL(request.url);
//             const entityType = searchParams.get('entityType');
//             const entityId = searchParams.get('entityId');
//             const status = searchParams.get('status');
//             const userId = searchParams.get('userId');
//             const page = parseInt(searchParams.get('page') || '1', 10);
//             const limit = parseInt(searchParams.get('limit') || '10', 10);
//
//             // Build query based on verified permissions
//             const query: any = {};
//
//             if (!isAdminOrModerator) {
//                 // Regular users can only see their own corrections
//                 query.userId = verifiedUserId;
//             } else if (userId) {
//                 // Admins/moderators can filter by specific user
//                 query.userId = userId;
//             }
//
//             // Apply other filters
//             if (entityType) query.entityType = entityType;
//             if (entityId) query.entityId = entityId;
//             if (status) query.status = status;
//
//             // Get total count
//             const total = await DataCorrection.countDocuments(query);
//
//             // Get paginated results
//             const corrections = await DataCorrection
//                 .find(query)
//                 .populate('userId', 'username displayName image')
//                 .populate('reviewedBy', 'username displayName')
//                 .sort({ createdAt: -1 })
//                 .skip((page - 1) * limit)
//                 .limit(limit)
//                 .lean();
//
//             return NextResponse.json({
//                 corrections,
//                 pagination: {
//                     page,
//                     limit,
//                     total,
//                     pages: Math.ceil(total / limit),
//                 },
//             });
//         } catch (error) {
//             logger.error('Failed to fetch corrections', error);
//             return handleError(error);
//         }
//     }, 'feedbackAuthenticated');
// }

// POST /api/corrections - Submit a new correction
export async function POST(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            const body = await request.json();

            // Validate input
            const validatedData = dataCorrectionSubmitSchema.parse(body);

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
    }, 'feedbackPostAuthenticated');
}
// export async function POST(request: NextRequest) {
//     return withRateLimit(request, async () => {
//         try {
//             const session = await requireAuth();
//             const body = await request.json();
//
//             // Validate input
//             const validatedData = dataCorrectionSubmitSchema.parse(body);
//
//             // Deep sanitize all text fields in proposedData
//             const sanitizeProposedData = (data: any): any => {
//                 if (typeof data === 'string') {
//                     return sanitizeUserInput(data);
//                 } else if (Array.isArray(data)) {
//                     return data.map(item => sanitizeProposedData(item));
//                 } else if (typeof data === 'object' && data !== null) {
//                     const sanitized: any = {};
//                     Object.keys(data).forEach(key => {
//                         sanitized[key] = sanitizeProposedData(data[key]);
//                     });
//                     return sanitized;
//                 }
//                 return data;
//             };
//
//             // Sanitize all inputs
//             if (validatedData.reason) {
//                 validatedData.reason = sanitizeUserInput(validatedData.reason);
//             }
//             validatedData.proposedData = sanitizeProposedData(validatedData.proposedData);
//
//             await connectDB();
//
//             // Create correction document
//             const correction = await DataCorrection.create({
//                 ...validatedData,
//                 userId: session?.user?.id || null,
//             });
//
//             // Log the submission
//             logger.info('Data correction submitted', {
//                 correctionId: correction._id,
//                 entityType: validatedData.entityType,
//                 entityId: validatedData.entityId,
//                 userId: session?.user?.id,
//             });
//
//             return NextResponse.json({
//                 success: true,
//                 correction: {
//                     id: correction._id.toString(),
//                     status: correction.status,
//                 },
//             });
//         } catch (error) {
//             logger.error('Failed to submit correction', error);
//             return handleError(error);
//         }
//     }, 'feedbackPostAuthenticated');
// }
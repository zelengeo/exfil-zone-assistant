// src/app/api/admin/corrections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DataCorrection } from '@/models/DataCorrection';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/errors';
import { requireAdminOrModerator } from "@/lib/auth/utils";
import {DataCorrectionApi, IDataCorrectionApi} from '@/lib/schemas/dataCorrection';


type ApiType = IDataCorrectionApi["Admin"];
// GET /api/admin/corrections - Get all corrections with filters
export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            await requireAdminOrModerator();
            await connectDB();

            const { searchParams } = new URL(request.url);
            const params = DataCorrectionApi.Admin.Get.Request.parse(
                Object.fromEntries(searchParams.entries())
            );


            const query = {
                ...(params.entityType && { entityType: params.entityType }),
                ...(params.entityId && { entityId: params.entityId }),
                ...(params.status && { status: params.status }),
                ...(params.userId && { userId: params.userId }),
            };

            // Get aggregate stats
            const [corrections, total, stats] = await Promise.all([
                DataCorrection
                    .find(query)
                    .populate('userId', 'username displayName image email')
                    .populate('reviewedBy', 'username displayName')
                    .sort({ [params.sortBy]: params.order === 'desc' ? -1 : 1 })
                    .skip((params.page - 1) * params.limit)
                    .limit(params.limit)
                    .lean<ApiType["Get"]["Response"]["corrections"]>(),
                DataCorrection.countDocuments(query),
                DataCorrection.aggregate([
                    { $match: query },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ])
            ]);

            // Format stats
            const formattedStats = {
                total,
                byStatus: stats.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {} as Record<string, number>)
            };

            return NextResponse.json<ApiType["Get"]["Response"]>({
                corrections,
                pagination: {
                    page: params.page,
                    limit: params.limit,
                    total,
                    pages: Math.ceil(total / params.limit),
                },
                stats: formattedStats
            });
        } catch (error) {
            logger.error('Failed to fetch admin corrections', error);
            return handleError(error);
        }
    }, 'admin');
}
// src/app/api/admin/corrections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DataCorrection } from '@/models/DataCorrection';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/errors';
import { requireAdminOrModerator } from "@/app/admin/components/utils";

// GET /api/admin/corrections - Get all corrections with filters
export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            await requireAdminOrModerator();
            await connectDB();

            const { searchParams } = new URL(request.url);
            const entityType = searchParams.get('entityType');
            const entityId = searchParams.get('entityId');
            const status = searchParams.get('status');
            const userId = searchParams.get('userId');
            const page = parseInt(searchParams.get('page') || '1', 10);
            const limit = parseInt(searchParams.get('limit') || '20', 10);
            const sortBy = searchParams.get('sortBy') || 'createdAt';
            const order = searchParams.get('order') || 'desc';


            const query = {
                ...(entityType && { entityType }),
                ...(entityId && { entityId }),
                ...(status && { status }),
                ...(userId && { userId })
            };

            // Get aggregate stats
            const [corrections, total, stats] = await Promise.all([
                DataCorrection
                    .find(query)
                    .populate('userId', 'username displayName image email')
                    .populate('reviewedBy', 'username displayName')
                    .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),
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

            return NextResponse.json({
                corrections,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
                stats: formattedStats
            });
        } catch (error) {
            logger.error('Failed to fetch admin corrections', error);
            return handleError(error);
        }
    }, 'admin');
}
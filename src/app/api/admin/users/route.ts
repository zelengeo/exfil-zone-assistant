// src/app/api/admin/users/route.ts
import {NextRequest} from 'next/server';
import {connectDB} from '@/lib/mongodb';
import {User} from '@/models/User';
import {requireAdmin, requireAdminOrModerator} from "@/app/admin/components/utils";
import {withRateLimit} from "@/lib/middleware";
import {adminStatsRequestSchema, adminUsersQuerySchema} from "@/lib/schemas/user";
import {logger} from "@/lib/logger";
import {handleError, ValidationError} from "@/lib/errors";
import {sanitizeSearchQuery} from "@/lib/utils";


// GET /api/admin/users - Get users list with filtering and pagination
export async function GET(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
            try {
                await requireAdmin();
                await connectDB();

                // Parse and validate query params
                const searchParams = Object.fromEntries(
                    request.nextUrl.searchParams.entries()
                );

                const query = adminUsersQuerySchema.parse(searchParams);
                if (query.search) {
                    query.search = sanitizeSearchQuery(query.search)
                }

                // Build MongoDB query
                const filter: any = {};
                if (query.search) {
                    filter.$or = [
                        {username: {$regex: query.search, $options: 'i'}},
                        {email: {$regex: query.search, $options: 'i'}}
                    ];
                }
                if (query.role) filter.roles = query.role;
                if (query.rank) filter.rank = query.rank;

                // Execute query with pagination
                const sort: any = {};
                if (query.sortBy) {
                    sort[query.sortBy] = query.order === 'desc' ? -1 : 1;
                } else {
                    sort.createdAt = -1;
                }

                const [users, total] = await Promise.all([
                    User.find(filter)
                        .sort(sort)
                        .limit(query.limit)
                        .skip((query.page - 1) * query.limit)
                        .select('username email roles rank stats.contributionPoints createdAt lastLoginAt')
                        .lean(),
                    User.countDocuments(filter)
                ]);

                return Response.json({
                    users,
                    pagination: {
                        page: query.page,
                        limit: query.limit,
                        total,
                        pages: Math.ceil(total / query.limit)
                    }
                });

            } catch (error) {
                logger.error('Admin users list error:', error, {
                    path: '/api/admin/users',
                    method: 'GET',
                });
                return handleError(error);
            }
        },
        'admin'
    );
}


// GET /api/admin/users/stats - Get user statistics
export async function POST(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
            try {
                await requireAdminOrModerator();
                await connectDB();

                const body = await request.json();
                const validatedData = adminStatsRequestSchema.parse(body);

                if (validatedData.type === 'stats') {
                    // Get role distribution and other stats
                    const [
                        totalUsers,
                        activeUsers30d,
                        activeUsers7d,
                        activeUsers1d,
                        newUsers30d,
                        roleDistribution,
                        rankDistribution
                    ] = await Promise.all([
                        User.countDocuments(),
                        User.countDocuments({
                            lastLoginAt: {$gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                        }),
                        User.countDocuments({
                            lastLoginAt: {$gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                        }),
                        User.countDocuments({
                            lastLoginAt: {$gte: new Date(Date.now() - 24 * 60 * 60 * 1000)}
                        }),
                        User.countDocuments({
                            createdAt: {$gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                        }),
                        User.aggregate([
                            {$unwind: '$roles'},
                            {$group: {_id: '$roles', count: {$sum: 1}}},
                            {$sort: {count: -1}}
                        ]),
                        User.aggregate([
                            {$group: {_id: '$rank', count: {$sum: 1}}},
                            {$sort: {count: -1}}
                        ])
                    ]);

                    return Response.json({
                        stats: {
                            totalUsers,
                            activeUsers: {
                                last30Days: activeUsers30d,
                                last7Days: activeUsers7d,
                                last24Hours: activeUsers1d
                            },
                            newUsers30d,
                            roleDistribution: roleDistribution.reduce((acc, item) => {
                                acc[item._id] = item.count;
                                return acc;
                            }, {}),
                            rankDistribution: rankDistribution.reduce((acc, item) => {
                                acc[item._id] = item.count;
                                return acc;
                            }, {})
                        }
                    });
                }

                // Search users for autocomplete
                if (validatedData.type === 'search') {

                    if (!validatedData.query || validatedData.query.length < 2) {
                        throw new ValidationError('Search query must be at least 2 characters');
                    }

                    const users = await User.find({
                        $or: [
                            {username: {$regex: validatedData.query, $options: 'i'}},
                            {email: {$regex: validatedData.query, $options: 'i'}}
                        ]
                    })
                        .select('username email roles rank')
                        .limit(10)
                        .lean();

                    return Response.json({users});
                }

                throw new ValidationError('Invalid request type');
            } catch (error) {
                logger.error('Admin users action error:', error, {
                    path: '/api/admin/users',
                    method: 'POST',
                });
                return handleError(error);
            }
        },
        "admin"
    )
}
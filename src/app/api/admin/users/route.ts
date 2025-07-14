// src/app/api/admin/users/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import {requireAdminOrModerator} from "@/app/admin/components/utils";


// GET /api/admin/users - Get users list with filtering and pagination
export async function GET(request: NextRequest) {
    try {
        await requireAdminOrModerator();
        await connectDB();

        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build query
        const query: any = {};

        // Search by username or email
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by role
        if (role && role !== 'all') {
            query.roles = role;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute queries
        const [users, totalCount] = await Promise.all([
            User.find(query)
                .select('username email roles rank stats.contributionPoints createdAt lastLoginAt profileImage bio')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return Response.json({
            users,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: totalPages,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.error('Admin users GET error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// GET /api/admin/users/stats - Get user statistics
export async function POST(request: NextRequest) {
    try {
        await requireAdminOrModerator();
        await connectDB();

        const body = await request.json();
        const { type } = body;

        if (type === 'stats') {
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
                    lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }),
                User.countDocuments({
                    lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }),
                User.countDocuments({
                    lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }),
                User.countDocuments({
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }),
                User.aggregate([
                    { $unwind: '$roles' },
                    { $group: { _id: '$roles', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]),
                User.aggregate([
                    { $group: { _id: '$rank', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
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
        if (type === 'search') {
            const { query } = body;

            if (!query || query.length < 2) {
                return Response.json({ users: [] });
            }

            const users = await User.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            })
                .select('username email roles rank')
                .limit(10)
                .lean();

            return Response.json({ users });
        }

        return Response.json({ error: 'Invalid request type' }, { status: 400 });

    } catch (error) {
        console.error('Admin users POST error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
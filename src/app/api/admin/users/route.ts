// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { UserApi, IUserApi } from '@/lib/schemas/user';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/errors';
import { sanitizeSearchQuery } from '@/lib/utils';
import { requireAdmin } from "@/lib/auth/utils";

type ApiType = IUserApi['Admin'];

export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            await requireAdmin();
            await connectDB();

            const { searchParams } = new URL(request.url);
            const params = UserApi.Admin.List.Request.parse(
                Object.fromEntries(searchParams.entries())
            );

            if (params.search) {
                params.search = sanitizeSearchQuery(params.search);
            }

            // Build query
            const query = {
                ...(params.search && {
                    $or: [
                        { username: { $regex: params.search, $options: 'i' } },
                        { email: { $regex: params.search, $options: 'i' } }
                    ]
                }),
                ...(params.role && { roles: params.role }),
                ...(params.rank && { rank: params.rank })
            };

            // Get total count
            const total = await User.countDocuments(query);

            // Get paginated results
            const users = await User
                .find(query)
                .select('_id username email roles rank createdAt lastLoginAt stats.contributionPoints')
                .sort({ [params.sortBy]: params.order === 'desc' ? -1 : 1 })
                .limit(params.limit)
                .skip((params.page - 1) * params.limit)
                .lean<ApiType['List']['Response']['users']>();

            return NextResponse.json<ApiType['List']['Response']>({
                users,
                pagination: {
                    page: params.page,
                    limit: params.limit,
                    total,
                    pages: Math.ceil(total / params.limit)
                }
            });
        } catch (error) {
            logger.error('Failed to fetch users list', error);
            return handleError(error);
        }
    }, 'admin');
}
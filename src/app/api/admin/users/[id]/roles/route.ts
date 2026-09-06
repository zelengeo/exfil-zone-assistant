// src/app/api/admin/users/[id]/roles/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { updateUserRolesAsAdmin } from '@/lib/auth/admin-user-mutations';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import {requireAdminOrModerator} from "@/lib/auth/utils";
import {withRateLimit} from "@/lib/middleware";
import {IUserApi, UserApi} from '@/lib/schemas/user';
import {handleError, NotFoundError} from "@/lib/errors";
import { parseJsonBody } from '@/lib/request';
import {logger} from "@/lib/logger";

// Helper function to validate roles
// const ROLE_HIERARCHY: Record<string, number> = {
//     'user': 1,
//     'contributor': 2,
//     'moderator': 3,
//     'partner': 4,
//     'admin': 5,
// };

// Helper to check if user can assign roles
// function canAssignRole(currentUserRoles: string[], targetRole: string): boolean {
//     const currentMaxLevel = Math.max(...currentUserRoles.map(role => ROLE_HIERARCHY[role] || 0));
//     const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
//
//     // Can only assign roles below your level (admins can assign admin)
//     return currentMaxLevel >= targetLevel;
// }

type ApiType = IUserApi['Admin']['ById']['Roles']

// PATCH /api/admin/users/[id]/roles - Update user roles
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withRateLimit(
        request,
        async () => {
            const { id } = await params;
            try {
                const body = await parseJsonBody(request);
                const validatedData = UserApi.Admin.ById.Roles.Patch.Request.parse(body);
                const targetUser = await updateUserRolesAsAdmin(id, validatedData);

                return NextResponse.json<ApiType['Patch']['Response']>({
                    success: true,
                    message: `Role ${validatedData.action}ed successfully`,
                    user: {
                        id: targetUser._id.toString(),
                        username: targetUser.username,
                        roles: targetUser.roles,
                        rank: targetUser.rank,
                    }
                });

            } catch (error) {
                logger.error('Role management error:', error, {
                    path: `/api/admin/users/${id}/roles`,
                    method: 'PATCH',
                });
                return handleError(error);
            }
        },
        'admin'
    );
}

// GET /api/admin/users/[id]/roles - Get user roles and permissions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withRateLimit(
        request,
        async () => {
            const { id } = await params;
            try {
                await requireAdminOrModerator();
                await connectDB();

                const user = await User.findById(id)
                    .select(' _id username email roles rank stats.contributionPoints createdAt lastLoginAt')
                    .lean<ApiType['Get']['Response']['user']>();

                if (!user) {
                    throw new NotFoundError('User');
                }

                return NextResponse.json<ApiType['Get']['Response']>({ user });

            } catch (error) {
                logger.error('Get user roles error:', error, {
                    path: `/api/admin/users/${id}/roles`,
                    method: 'GET',
                });
                return handleError(error);
            }
        },
        'api'
    );
}

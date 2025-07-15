// src/app/api/admin/users/[id]/roles/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import {requireAdmin, requireAdminOrModerator} from "@/app/admin/components/utils";
import {withRateLimit} from "@/lib/middleware";
import {UserRoles, userRoleUpdateSchema} from '@/lib/schemas/user';
import {AuthorizationError, handleError, NotFoundError} from "@/lib/errors";
import {logger} from "@/lib/logger";

// Helper function to validate roles
const ROLE_HIERARCHY: Record<string, number> = {
    'user': 1,
    'contributor': 2,
    'moderator': 3,
    'partner': 4,
    'admin': 5,
};

// Helper to check if user can assign roles
function canAssignRole(currentUserRoles: string[], targetRole: string): boolean {
    const currentMaxLevel = Math.max(...currentUserRoles.map(role => ROLE_HIERARCHY[role] || 0));
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

    // Can only assign roles below your level (admins can assign admin)
    return currentMaxLevel >= targetLevel;
}

// PATCH /api/admin/users/[id]/roles - Update user roles
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withRateLimit(
        request,
        async () => {
            try {
                const { session } = await requireAdmin();
                await connectDB();

                // Parse and validate request
                const body = await request.json();
                const validatedData = userRoleUpdateSchema.parse(body);

                const targetUser = await User.findById(params.id);
                if (!targetUser) {
                    throw new NotFoundError('User');
                }

                // Prevent self-role modification
                if (session.user.id === params.id) {
                    throw new AuthorizationError('Cannot modify your own roles');
                }

                // Prevent modification of other admins
                if (targetUser.roles?.includes('admin')) {
                    throw new AuthorizationError('Cannot change admin roles from another');
                }

                // Apply role change
                if (validatedData.action === 'add') {
                    if (!targetUser.roles?.includes(validatedData.role)) {
                        targetUser.roles.push(validatedData.role);
                    }
                } else {
                    targetUser.roles = targetUser.roles?.filter((r: UserRoles)  => r !== validatedData.role) || ["user"];
                }

                await targetUser.save();

                logger.info('User role updated', {
                    adminId: session.user.id,
                    targetUserId: params.id,
                    ...validatedData
                });

                return Response.json({
                    success: true,
                    message: `Role ${validatedData.action}ed successfully`,
                    user: {
                        id: targetUser._id,
                        username: targetUser.username,
                        roles: targetUser.roles,
                        rank: targetUser.rank,
                    }
                });

            } catch (error) {
                logger.error('Role management error:', error, {
                    path: `/api/admin/users/${params.id}/roles`,
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
    { params }: { params: { id: string } }
) {
    return withRateLimit(
        request,
        async () => {
            try {
                await requireAdminOrModerator();
                await connectDB();

                const user = await User.findById(params.id)
                    .select('username roles rank stats.contributionPoints createdAt lastLoginAt')
                    .lean();

                if (!user) {
                    throw new NotFoundError('User');
                }

                return Response.json({ user });

            } catch (error) {
                logger.error('Get user roles error:', error, {
                    path: `/api/admin/users/${params.id}/roles`,
                    method: 'GET',
                });
                return handleError(error);
            }
        },
        'api'
    );
}
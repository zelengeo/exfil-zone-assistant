// src/app/api/admin/users/[id]/roles/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import {IUser} from "@/types/user";

// Helper function to validate roles
const VALID_ROLES = ['user', 'contributor', 'moderator', 'partner', 'admin'];
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

async function requireAdminOrModerator() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    await connectDB();
    const user = await User.findById(session.user.id) as IUser;

    if (!user?.roles?.some((role) => ['admin', 'moderator'].includes(role))) {
        throw new Error('Forbidden');
    }

    return { session, user };
}

// PATCH /api/admin/users/[id]/roles - Update user roles
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user: currentUser } = await requireAdminOrModerator();
        await connectDB();

        const body = await request.json();
        const { action, role, reason } = body;

        // Validate input
        if (!['add', 'remove'].includes(action)) {
            return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (!VALID_ROLES.includes(role)) {
            return Response.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Check permissions
        if (!canAssignRole(currentUser.roles || [], role)) {
            return Response.json({
                error: 'Insufficient permissions to assign this role'
            }, { status: 403 });
        }

        // Find target user
        const targetUser = await User.findById(params.id);
        if (!targetUser) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent self-demotion from admin
        if (currentUser._id.toString() === targetUser._id.toString() &&
            action === 'remove' && role === 'admin') {
            return Response.json({
                error: 'Cannot remove admin role from yourself'
            }, { status: 400 });
        }

        // Update roles
        let updatedRoles = [...(targetUser.roles || [])];

        if (action === 'add' && !updatedRoles.includes(role)) {
            updatedRoles.push(role);
        } else if (action === 'remove') {
            updatedRoles = updatedRoles.filter(r => r !== role);
        }

        // Ensure user role is always present
        if (!updatedRoles.includes('user')) {
            updatedRoles.unshift('user');
        }

        // Update user
        targetUser.roles = updatedRoles;

        // Update rank based on highest role
        const maxLevel = Math.max(...updatedRoles.map(r => ROLE_HIERARCHY[r] || 0));
        if (maxLevel >= 5) targetUser.rank = 'elite';
        else if (maxLevel >= 4) targetUser.rank = 'veteran';
        else if (maxLevel >= 3) targetUser.rank = 'specialist';
        else if (maxLevel >= 2) targetUser.rank = 'soldier';
        else targetUser.rank = 'recruit';

        await targetUser.save();

        // Log the role change
        console.log(`🔐 Role ${action}: ${currentUser.username} ${action}ed ${role} ${action === 'add' ? 'to' : 'from'} ${targetUser.username}${reason ? ` (${reason})` : ''}`);

        return Response.json({
            success: true,
            message: `Role ${action}ed successfully`,
            user: {
                id: targetUser._id,
                username: targetUser.username,
                roles: targetUser.roles,
                rank: targetUser.rank,
            }
        });

    } catch (error) {
        console.error('Role management error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to update user roles' },
            { status: 500 }
        );
    }
}

// GET /api/admin/users/[id]/roles - Get user roles and permissions
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdminOrModerator();
        await connectDB();

        const user = await User.findById(params.id)
            .select('username email roles rank stats.contributionPoints createdAt lastLoginAt')
            .lean();

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json({ user });

    } catch (error) {
        console.error('Get user roles error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to get user roles' },
            { status: 500 }
        );
    }
}
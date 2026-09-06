import { isValidObjectId } from 'mongoose';

import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { UserApi, type AdminUserUpdateInput, type IUser } from '@/lib/schemas/user';
import { sanitizeUserInput } from '@/lib/utils';
import { User } from '@/models/User';
import { requireAdmin } from './utils';

async function getTarget(userId: string): Promise<IUser> {
    if (!isValidObjectId(userId)) throw new ValidationError('Invalid user ID format');
    const target = await User.findById(userId).lean<IUser>();
    if (!target) throw new NotFoundError('User');
    return target;
}

function assertRoleChangeAllowed(actorId: string, target: IUser): void {
    if (actorId === target._id.toString()) throw new AuthorizationError('Cannot modify your own roles');
    if (target.roles.includes('admin')) throw new AuthorizationError('Cannot change admin roles from another');
}

async function saveAdminUpdate(actorId: string, target: IUser, updates: AdminUserUpdateInput, reason?: string): Promise<IUser> {
    const userId = target._id.toString();
    const changesRoles = updates.roles !== undefined;
    if (changesRoles) assertRoleChangeAllowed(actorId, target);

    const updated = await User.findOneAndUpdate(
        // A concurrent promotion or role edit invalidates the decision made from this snapshot.
        { _id: userId, ...(changesRoles ? { roles: target.roles } : {}) },
        { $set: updates },
        { new: true, runValidators: true },
    ).lean<IUser>();
    if (!updated) {
        if (!await User.exists({ _id: userId })) throw new NotFoundError('User');
        throw new ConflictError('User roles changed. Refresh and retry.');
    }
    logger.info('User updated by admin', {
        adminId: actorId, targetUserId: userId, updatedFields: Object.keys(updates),
        action: 'admin.user.edit.update',
        ...(reason ? { reason: sanitizeUserInput(reason) } : {}),
    });
    return updated;
}

export async function updateUserAsAdmin(userId: string, body: unknown): Promise<IUser> {
    const { session } = await requireAdmin();
    const updates = UserApi.Admin.ById.Patch.Request.parse(body);
    const target = await getTarget(userId);

    for (const field of ['displayName', 'bio', 'banReason'] as const) {
        if (updates[field] !== undefined) updates[field] = sanitizeUserInput(updates[field]);
    }
    for (const field of ['username', 'email'] as const) {
        if (updates[field] !== undefined && await User.exists({ [field]: updates[field], _id: { $ne: userId } })) {
            throw new ConflictError(`${field === 'username' ? 'Username' : 'Email'} already in use`);
        }
    }

    if (updates.roles !== undefined) {
        updates.roles = [...new Set(updates.roles)];
        const current = new Set(target.roles);
        if (current.size === updates.roles.length && updates.roles.every(role => current.has(role))) {
            // The edit form sends unchanged roles too. Do not overwrite them or block profile edits.
            delete updates.roles;
        }
    }
    return saveAdminUpdate(session.user.id, target, updates);
}

export async function updateUserRolesAsAdmin(userId: string, body: unknown): Promise<IUser> {
    const { session } = await requireAdmin();
    const data = UserApi.Admin.ById.Roles.Patch.Request.parse(body);
    const target = await getTarget(userId);
    const roles = data.action === 'add'
        ? [...new Set([...target.roles, data.role])]
        : target.roles.filter(role => role !== data.role);
    return saveAdminUpdate(session.user.id, target, { roles }, data.reason);
}

import { ConflictError, NotFoundError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { UserApi, type IUser, type UserUpdateInput, type UserUsernameUpdateInput } from '@/lib/schemas/user';
import { sanitizeUserInput } from '@/lib/utils';
import { User } from '@/models/User';
import { requireAuthWithUserCheck } from './utils';

async function saveProfile(userId: string, updates: UserUpdateInput | UserUsernameUpdateInput): Promise<IUser> {
    const user = await User.findOneAndUpdate(
        { _id: userId, isBanned: { $ne: true } },
        { $set: updates },
        { new: true, runValidators: true },
    ).lean<IUser>();

    if (!user) {
        // A ban/deletion between authorization and the write must not admit that write.
        await requireAuthWithUserCheck();
        throw new NotFoundError('User');
    }
    logger.info('User profile updated', { userId, updatedFields: Object.keys(updates) });
    return user;
}

// Both profile PATCH endpoints retain their response contracts around this operation.
export async function updateOwnProfile(body: unknown): Promise<IUser> {
    const { session } = await requireAuthWithUserCheck();
    const updates = UserApi.Patch.Request.parse(body);
    if (updates.displayName !== undefined) updates.displayName = sanitizeUserInput(updates.displayName);
    if (updates.bio !== undefined) updates.bio = sanitizeUserInput(updates.bio);
    return saveProfile(session.user.id, updates);
}

export async function updateOwnUsername(body: unknown): Promise<IUser> {
    const { session } = await requireAuthWithUserCheck();
    const data = UserApi.UpdateUsername.Patch.Request.parse(body);
    const username = sanitizeUserInput(data.username).toLowerCase();
    if (await User.exists({ username, _id: { $ne: session.user.id } })) {
        throw new ConflictError('Username already taken');
    }
    return saveProfile(session.user.id, { username });
}

// src/lib/auth/account-deletion.ts
import { type ClientSession, isValidObjectId, Types } from 'mongoose';
import { connectDB, mongoose } from '@/lib/mongodb';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { IUser } from '@/lib/schemas/user';
import { Account } from '@/models/Account';
import { Feedback } from '@/models/Feedback';
import { User } from '@/models/User';

/**
 * The fields a caller's guard may decide on. Loaded inside the transaction, so a role change
 * committed between the gate and the delete cannot slip past the check.
 */
export type DeletableUser = Pick<IUser, 'username' | 'roles'>;

/** Throws to refuse the deletion. Runs inside the transaction, before any write. */
export type DeletionGuard = (user: DeletableUser) => void;

export interface DeletedAccount {
    userId: string;
    username?: string;
}

/**
 * Deletion policy — one rule for both entry points: the account's identity rows are destroyed,
 * and every surviving record loses its reference to the deleted id rather than gaining a
 * replacement for it.
 *
 * - `User` and `Account` are hard deleted. There is no soft-delete flag anywhere in the app.
 * - `Feedback` authored by the account survives with `userId` unset. Nothing identifying is
 *   written in its place: the anonymization step must not name the account it just erased.
 * - Review notes the account left stay readable; only `addedByUserId` goes.
 *
 * There is deliberately no `DataCorrection` step. The correction retirement (audit B12) removed the
 * model, so nothing here can reach that collection; the rows themselves outlive this code until an
 * operator erases them, which is a retention decision rather than an implementation one.
 */
async function removeAccount(
    userId: Types.ObjectId,
    guard: DeletionGuard | undefined,
    session: ClientSession,
): Promise<DeletedAccount> {
    const user = await User.findById(userId, 'username roles', { session })
        .lean<DeletableUser | null>();

    if (!user) {
        throw new NotFoundError('User');
    }

    guard?.(user);

    await Account.deleteMany({ userId }, { session });

    await Feedback.updateMany({ userId }, { $unset: { userId: 1 } }, { session });

    // arrayFilters are not cast by Mongoose, so the identifier has to already be an ObjectId.
    await Feedback.updateMany(
        { 'reviewerNotes.addedByUserId': userId },
        { $unset: { 'reviewerNotes.$[note].addedByUserId': 1 } },
        { arrayFilters: [{ 'note.addedByUserId': userId }], session },
    );

    await User.findByIdAndDelete(userId, { session });

    return { userId: userId.toString(), username: user.username };
}

/**
 * Deletes an account and everything the policy above says goes with it, in one transaction.
 * Every participating read and write carries the session, so an injected failure at any point
 * leaves all four collections as they were.
 */
export async function deleteUserAccount(
    userId: string,
    guard?: DeletionGuard,
): Promise<DeletedAccount> {
    if (!isValidObjectId(userId)) {
        throw new ValidationError('Invalid user ID');
    }

    const identifier = new Types.ObjectId(userId);

    await connectDB();

    let session: ClientSession | null = null;

    try {
        session = await mongoose.startSession();
        const activeSession = session;

        return await session.withTransaction(() => (
            removeAccount(identifier, guard, activeSession)
        ));
    } finally {
        if (session) {
            try {
                await session.endSession();
            } catch (cleanupError) {
                logger.error('Failed to end account deletion session', cleanupError);
            }
        }
    }
}

import type { Account as NextAuthAccount, Profile, User as NextAuthUser } from 'next-auth';
import type { ClientSession, SaveOptions } from 'mongoose';
import { connectDB, mongoose } from '@/lib/mongodb';
import { getVerifiedProviderEmail, type SupportedOAuthProvider } from '@/lib/auth/oauth-profile';
import { ensureUniqueUsername, generateUsername } from '@/lib/auth/username';
import type { IUser } from '@/lib/schemas/user';
import { Account } from '@/models/Account';
import { User } from '@/models/User';

const MAX_IDENTITY_RESOLUTION_ATTEMPTS = 3;

type AuthUserDocument = Pick<IUser, '_id' | 'lastLoginAt' | 'rank' | 'roles'> & {
    location: IUser['location'] | 'na';
    save(options?: SaveOptions): Promise<unknown>;
};

interface OAuthSignInInput {
    account: NextAuthAccount | null;
    profile?: Profile;
    user: NextAuthUser;
}

class OAuthSignInRejectedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OAuthSignInRejectedError';
    }
}

function isSupportedProvider(provider: string): provider is SupportedOAuthProvider {
    return provider === 'discord' || provider === 'google';
}

function isAdminEmail(email: string): boolean {
    const adminEmails = [
        process.env.ADMIN_EMAIL_1,
        process.env.ADMIN_EMAIL_2,
        process.env.ADMIN_EMAIL_3,
    ].filter((value): value is string => Boolean(value)).map(value => value.trim().toLowerCase());

    return adminEmails.includes(email);
}

function isDuplicateKeyError(error: unknown): error is { code: 11000 } {
    return typeof error === 'object'
        && error !== null
        && 'code' in error
        && error.code === 11000;
}

async function resolveUser(
    input: OAuthSignInInput,
    account: NextAuthAccount,
    provider: SupportedOAuthProvider,
    verifiedEmail: string | null,
    session: ClientSession,
): Promise<AuthUserDocument> {
    const accountIdentity = {
        provider,
        providerAccountId: account.providerAccountId,
    };
    const existingAccount = await Account.findOne(accountIdentity).session(session);

    let dbUser: AuthUserDocument | null;

    if (existingAccount) {
        dbUser = await User.findById(existingAccount.userId).session(session);
        if (!dbUser) {
            throw new OAuthSignInRejectedError('OAuth account is linked to a missing user');
        }
    } else {
        if (!verifiedEmail) {
            throw new OAuthSignInRejectedError('A verified provider email is required for account linking');
        }

        dbUser = await User.findOne({ email: verifiedEmail }).session(session);

        if (!dbUser) {
            const baseUsername = generateUsername({ ...input.user, email: verifiedEmail });
            const username = await ensureUniqueUsername(baseUsername, session);
            const admin = isAdminEmail(verifiedEmail);
            const newUser = new User({
                email: verifiedEmail,
                emailVerified: new Date(),
                displayName: input.user.name,
                username,
                avatarUrl: input.user.image ?? undefined,
                vrHeadset: null,
                level: 1,
                rank: admin ? 'elite' : 'recruit',
                badges: [],
                stats: {
                    contributionPoints: 0,
                    feedbackSubmitted: 0,
                    bugsReported: 0,
                    featuresProposed: 0,
                    dataCorrections: 0,
                    correctionsAccepted: 0,
                },
                roles: admin ? ['user', 'admin'] : ['user'],
                preferences: {
                    emailNotifications: false,
                    publicProfile: true,
                    showContributions: true,
                },
                isActive: true,
                isBanned: false,
                lastLoginAt: new Date(),
            });

            await newUser.save({ session });
            dbUser = newUser;
        }

        if (!dbUser) {
            throw new OAuthSignInRejectedError('Unable to resolve a user for this OAuth identity');
        }

        await Account.create([{
            userId: dbUser._id,
            type: account.type,
            provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
        }], { session });
    }

    if (!dbUser) {
        throw new OAuthSignInRejectedError('Unable to resolve a user for this OAuth identity');
    }

    if (verifiedEmail && isAdminEmail(verifiedEmail) && !dbUser.roles?.includes('admin')) {
        dbUser.roles = [...(dbUser.roles || []), 'admin'];
        dbUser.rank = 'elite';
    }

    if (dbUser.location === 'na') {
        dbUser.location = 'us_west';
    }

    dbUser.lastLoginAt = new Date();
    await dbUser.save({ session });

    return dbUser;
}

export async function authorizeOAuthSignIn(input: OAuthSignInInput): Promise<boolean> {
    const { account, profile, user } = input;

    if (!account || !isSupportedProvider(account.provider) || !account.providerAccountId) {
        return false;
    }

    const provider = account.provider;
    const verifiedEmail = getVerifiedProviderEmail(provider, profile);

    try {
        await connectDB();
    } catch (error) {
        console.error('OAuth sign in database connection failed:', error);
        return false;
    }

    for (let attempt = 0; attempt < MAX_IDENTITY_RESOLUTION_ATTEMPTS; attempt++) {
        let session: ClientSession | null = null;

        try {
            session = await mongoose.startSession();
            const activeSession = session;
            const dbUser = await session.withTransaction(() => (
                resolveUser(input, account, provider, verifiedEmail, activeSession)
            ));

            if (!dbUser) {
                return false;
            }

            user.id = dbUser._id.toString();
            return true;
        } catch (error) {
            if (error instanceof OAuthSignInRejectedError) {
                return false;
            }

            if (isDuplicateKeyError(error) && attempt + 1 < MAX_IDENTITY_RESOLUTION_ATTEMPTS) {
                continue;
            }

            console.error('OAuth sign in error:', error);
            return false;
        } finally {
            if (session) {
                try {
                    await session.endSession();
                } catch (error) {
                    console.error('OAuth sign in session cleanup failed:', error);
                }
            }
        }
    }

    return false;
}

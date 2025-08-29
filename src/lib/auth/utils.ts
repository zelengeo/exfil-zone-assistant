import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {connectDB} from "@/lib/mongodb";
import {User} from "@/models/User";
import {UserAuth} from "@/lib/schemas/user";
import {
    AuthenticationError,
    BannedUserError,
    InsufficientPermissionsError,
    NotFoundError
} from "@/lib/errors";

export async function requireAuth() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new AuthenticationError();
    }
    //For read operations consider that sufficient. POST operations will check db value
    if (session.user.isBanned) {
        throw new BannedUserError();
    }

    return session;
}

export async function requireAuthWithUserCheck() {
    const session = await requireAuth();

    await connectDB();
    const user = await User.findById(session.user.id).select('isBanned roles username').lean<UserAuth>();

    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (user.isBanned) {
        throw new BannedUserError();
    }

    return { session, user };
}

export async function requireAdmin() {
    const session = await requireAuth();

    await connectDB();
    const user = await User.findById(session.user.id).select('isBanned roles username').lean<UserAuth>();

    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (user.isBanned) {
        throw new BannedUserError();
    }

    if (!user?.roles?.includes('admin')) {
        throw new InsufficientPermissionsError('Admin');
    }

    return { session, user };
}

export async function requireAdminOrModerator() {
    const session = await requireAuth();

    await connectDB();
    const user = await User.findById(session.user.id).select('isBanned roles username').lean<UserAuth>();

    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (user.isBanned) {
        throw new BannedUserError();
    }

    const hasPermission = user?.roles?.some(role =>
        ['admin', 'moderator'].includes(role)
    );

    if (!hasPermission) {
        throw new InsufficientPermissionsError('Moderator');
    }

    return { session, user };
}
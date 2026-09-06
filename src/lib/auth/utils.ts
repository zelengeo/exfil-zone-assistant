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

// Identity only. Self-service deletion deliberately remains available to banned users.
export async function requireSession() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new AuthenticationError();
    }
    return session;
}

export async function requireAuth() {
    const session = await requireSession();
    // Cheap reads may use token state; mutation gates below always read the current row.
    if (session.user.isBanned) {
        throw new BannedUserError();
    }

    return session;
}

export async function requireAuthWithUserCheck() {
    const session = await requireSession();

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
    const { session, user } = await requireAuthWithUserCheck();

    if (!user?.roles?.includes('admin')) {
        throw new InsufficientPermissionsError('Admin');
    }

    return { session, user };
}

export async function requireAdminOrModerator() {
    const { session, user } = await requireAuthWithUserCheck();

    const hasPermission = user?.roles?.some(role =>
        ['admin', 'moderator'].includes(role)
    );

    if (!hasPermission) {
        throw new InsufficientPermissionsError('Moderator');
    }

    return { session, user };
}

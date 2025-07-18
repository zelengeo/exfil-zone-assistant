import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {connectDB} from "@/lib/mongodb";
import {User} from "@/models/User";
import {IUser} from "@/lib/schemas/user";
import {AuthenticationError, AuthorizationError, NotFoundError} from "@/lib/errors";

export async function requireAuth() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new AuthenticationError();
    }

    return session;
}

export async function requireAdmin() {
    const session = await requireAuth();

    await connectDB();
    const user = await User.findById(session.user.id).lean<IUser>();

    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (!user?.roles?.includes('admin')) {
        throw new AuthorizationError('Admin access required');
    }

    return { session, user };
}

export async function requireAdminOrModerator() {
    const session = await requireAuth();

    await connectDB();
    const user = await User.findById(session.user.id).lean<IUser>();

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const hasPermission = user?.roles?.some(role =>
        ['admin', 'moderator'].includes(role)
    );

    if (!hasPermission) {
        throw new AuthorizationError('Moderator access required');
    }

    return { session, user };
}
import {Bug, Database, Lightbulb, MessageSquare} from "lucide-react";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {connectDB} from "@/lib/mongodb";
import {User} from "@/models/User";
import {IUser} from "@/lib/schemas/user";
import {AuthenticationError, AuthorizationError, NotFoundError} from "@/lib/errors";

export const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'new':
            return 'destructive';
        case 'in_review':
            return 'secondary';
        case 'accepted':
            return 'default';
        case 'implemented':
            return 'default';
        case 'rejected':
            return 'outline';
        case 'duplicate':
            return 'outline';
        default:
            return 'secondary';
    }
};

export const getTypeIcon = (type: string) => {
    switch (type) {
        case 'bug':
            return Bug;
        case 'feature':
            return Lightbulb;
        case 'data_correction':
            return Database;
        default:
            return MessageSquare;
    }
};
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

    if (!user?.roles?.includes('admin')) {
        throw new AuthorizationError('Admin access required');
    }

    return { session, user };
}

export async function requireAdminOrModerator() {
    const session = await requireAuth();

    await connectDB();
    const user = await User.findById(session.user.id).select('roles').lean<IUser>();

    const hasPermission = user?.roles?.some(role =>
        ['admin', 'moderator'].includes(role)
    );

    if (!hasPermission) {
        throw new AuthorizationError('Moderator access required');
    }

    return { session, user };
}
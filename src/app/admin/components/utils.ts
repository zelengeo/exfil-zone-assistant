import {Bug, Database, Lightbulb, MessageSquare} from "lucide-react";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {connectDB} from "@/lib/mongodb";
import {User} from "@/models/User";
import {IUser} from "@/types/user";

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

export async function requireAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user?.roles?.includes('admin')) {
        throw new Error('Forbidden');
    }

    return { session, user };
}

export async function requireAdminOrModerator() {
    const session = await getServerSession(authOptions);
    //FIXME remove log
    console.log(`GetServerSession at utils`, session);


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
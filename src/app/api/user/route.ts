import {requireAuth} from "@/app/admin/components/utils";
import {connectDB} from "@/lib/mongodb";
import {User} from "@/models/User";
import {NextResponse} from "next/server";
import {logger} from "@/lib/logger";
import {handleError, NotFoundError} from "@/lib/errors";

export async function GET() {
    try {
        const session = await requireAuth()

        await connectDB();
        const user = await User.findById(session.user.id).select(
            'username bio location vrHeadset preferences stats rank level badges'
        );

        if (!user) {
            throw new NotFoundError('User');
        }

        return NextResponse.json({user});
    } catch (error) {
        logger.error('User fetch error:', error, {
            path: '/api/user',
            method: 'GET',
        });

        return handleError(error);
    }
}
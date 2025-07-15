// src/app/api/user/route.ts
import {connectDB} from "@/lib/mongodb";
import {requireAuth} from "@/app/admin/components/utils";
import {User} from "@/models/User";
import {logger} from "@/lib/logger";
import {handleError, NotFoundError} from "@/lib/errors";
import {withRateLimit} from "@/lib/middleware";

export async function GET(request: Request) {
    return withRateLimit(
        request,
        async () => {
            try {
                const session = await requireAuth()
                await connectDB();
                const user = await User.findById(session.user.id)
                    .select('name username bio location vrHeadset preferences stats roles rank  badges')
                    .lean();

                if (!user) {
                    throw new NotFoundError('User profile');
                }

                return Response.json({ user });
            } catch (error) {
                logger.error('User fetch error:', error, {
                    path: '/api/user',
                    method: 'GET',
                });
                return handleError(error);
            }
        },
        'api'
    );
}
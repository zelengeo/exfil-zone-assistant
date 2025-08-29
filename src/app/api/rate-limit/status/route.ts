import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRateLimiter } from '@/lib/rate-limit/rate-limit-factory';
import { getIdentifier, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit/rate-limit';
import {logger} from "@/lib/logger";
import {handleError} from "@/lib/errors";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const identifier = await getIdentifier(request, session?.user?.id);
        const rateLimiter = getRateLimiter();

        const limits = await Promise.all(
            Object.entries(RATE_LIMIT_CONFIGS).map(async ([key, config]) => {
                const result = await rateLimiter.check(`${identifier}:check`, config);
                return {
                    endpoint: key,
                    limit: config.uniqueTokenPerInterval,
                    interval: config.interval,
                    remaining: result.remaining,
                    reset: new Date(result.reset).toISOString(),
                };
            })
        );

        return Response.json({
            identifier: identifier.split(':')[0], // Don't expose full identifier
            limits,
        });
    } catch (error) {
        logger.error('Rate limit status error:', error, {
            path: '/api/rate-limit/status',
            method: 'GET',
        });
        return handleError(error);
    }
}
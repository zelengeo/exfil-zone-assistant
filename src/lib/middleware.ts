import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRateLimiter } from '@/lib/rate-limit/rate-limit-factory';
import { getIdentifier, RATE_LIMIT_CONFIGS, type RateLimitPolicy } from '@/lib/rate-limit/rate-limit';

/**
 * Every caller names a policy from RATE_LIMIT_CONFIGS. Inline configs are no longer accepted:
 * a counter needs a stable name to be namespaced by, and an anonymous object has none.
 */
export async function withRateLimit(
    request: Request,
    handler: () => Promise<Response>,
    policy: RateLimitPolicy
): Promise<Response> {
    const rateLimiter = getRateLimiter();

    // Get user session if available
    const session = await getServerSession(authOptions);
    const identifier = await getIdentifier(request, session?.user?.id);

    // Routes that limit signed-in and anonymous callers differently pass the policy that matches,
    // as the feedback route does. There is no automatic substitution here: the previous attempt
    // rewrote 'Authenticated' to a nonexistent 'Anonymous' policy name and always fell through.
    const finalConfig = RATE_LIMIT_CONFIGS[policy];

    // Check rate limit
    const result = await rateLimiter.check(policy, identifier, finalConfig);

    // Add rate limit headers
    const headers = new Headers({
        'X-RateLimit-Limit': finalConfig.uniqueTokenPerInterval.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    });

    if (!result.success) {
        headers.set('Retry-After', result.retryAfter!.toString());

        return new NextResponse(
            JSON.stringify({
                error: 'Too many requests',
                message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
                retryAfter: result.retryAfter,
            }),
            {
                status: 429,
                headers,
            }
        );
    }

    // Execute handler and add headers to response
    try {
        const response = await handler();

        // Clone response and add headers
        const newHeaders = new Headers(response.headers);
        headers.forEach((value, key) => newHeaders.set(key, value));

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
        });
    } catch (error) {
        // Still count failed requests against rate limit
        throw error;
    }
}
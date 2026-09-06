import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRateLimiter } from '@/lib/rate-limit/rate-limit-factory';
import {
    getIdentifier,
    RATE_LIMIT_CONFIGS,
    type RateLimitPolicy,
    type RateLimitResult,
} from '@/lib/rate-limit/rate-limit';
import { AppError, RateLimitError } from '@/lib/errors';

/** Raised when the limiter backend is unavailable and the policy refuses to guess. */
export class RateLimitUnavailableError extends AppError {
    constructor() {
        super('Rate limiting is temporarily unavailable. Please retry shortly.', 503, 'RATE_LIMIT_UNAVAILABLE');
    }
}

/** Bounded wait for a caller told to retry after a backend failure. */
const RETRY_AFTER_SECONDS = 30;

/**
 * Runs a policy against the current caller. Everything that limits anything goes through here, so
 * a route handler and a server action cannot end up with different notions of who is calling.
 */
export async function checkRateLimit(policy: RateLimitPolicy): Promise<RateLimitResult> {
    const session = await getServerSession(authOptions);
    const identifier = await getIdentifier(session?.user?.id);

    return getRateLimiter().check(policy, identifier, RATE_LIMIT_CONFIGS[policy]);
}

/**
 * For callers that have no Response to decorate — server actions, most notably. Throws the same
 * error the API surface returns as a 429, so `handleError` formats it identically.
 */
export async function enforceRateLimit(policy: RateLimitPolicy): Promise<void> {
    const result = await checkRateLimit(policy);

    if (result.degraded && RATE_LIMIT_CONFIGS[policy].failClosed) {
        throw new RateLimitUnavailableError();
    }

    if (!result.success) {
        throw new RateLimitError(result.retryAfter);
    }
}

/**
 * Every caller names a policy from RATE_LIMIT_CONFIGS. Inline configs are no longer accepted:
 * a counter needs a stable name to be namespaced by, and an anonymous object has none.
 */
export async function withRateLimit(
    request: Request,
    handler: () => Promise<Response>,
    policy: RateLimitPolicy
): Promise<Response> {
    // Routes that limit signed-in and anonymous callers differently pass the policy that matches,
    // as the feedback route does. There is no automatic substitution here: the previous attempt
    // rewrote 'Authenticated' to a nonexistent 'Anonymous' policy name and always fell through.
    const config = RATE_LIMIT_CONFIGS[policy];
    const result = await checkRateLimit(policy);

    // The backend could not answer. A mutation refuses rather than passing unchecked, so an outage
    // cannot be used as a way around the limit; a read is still served.
    if (result.degraded && config.failClosed) {
        return NextResponse.json(
            {
                error: 'Service unavailable',
                message: 'Rate limiting is temporarily unavailable. Please retry shortly.',
                retryAfter: RETRY_AFTER_SECONDS,
            },
            {
                status: 503,
                headers: { 'Retry-After': RETRY_AFTER_SECONDS.toString() },
            },
        );
    }

    // Add rate limit headers
    const headers = new Headers({
        'X-RateLimit-Limit': config.uniqueTokenPerInterval.toString(),
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
    const response = await handler();

    // Clone response and add headers
    const newHeaders = new Headers(response.headers);
    headers.forEach((value, key) => newHeaders.set(key, value));

    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    });
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRateLimiter } from '@/lib/rate-limit-factory';
import { getIdentifier, RATE_LIMIT_CONFIGS, type RateLimitConfig } from '@/lib/rate-limit';

export async function withRateLimit(
    request: Request,
    handler: () => Promise<Response>,
    configKey: keyof typeof RATE_LIMIT_CONFIGS | RateLimitConfig
): Promise<Response> {
    const rateLimiter = getRateLimiter();

    // Get user session if available
    const session = await getServerSession(authOptions);
    const identifier = await getIdentifier(request, session?.user?.id);

    // Get config
    const config = typeof configKey === 'string'
        ? RATE_LIMIT_CONFIGS[configKey]
        : configKey;

    // Apply stricter limits for anonymous users
    const finalConfig = !session?.user?.id && typeof configKey === 'string' && configKey.includes('Authenticated')
        ? RATE_LIMIT_CONFIGS[configKey.replace('Authenticated', 'Anonymous') as keyof typeof RATE_LIMIT_CONFIGS] || config
        : config;

    // Check rate limit
    const result = await rateLimiter.check(identifier, finalConfig);

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

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
        });
    } catch (error) {
        // Still count failed requests against rate limit
        throw error;
    }
}
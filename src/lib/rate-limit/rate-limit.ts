import { headers } from 'next/headers';

// Types
export interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
    retryAfter?: number;
    /**
     * The backend could not answer, so `success` is a guess rather than a decision. A caller must
     * be able to tell "you are within your quota" from "nobody knows", which is the distinction
     * the limiter used to collapse by returning a plain success on a KV exception.
     */
    degraded?: boolean;
}

export interface RateLimitConfig {
    interval: number; // Time window in seconds
    uniqueTokenPerInterval: number; // Max requests per interval
    /**
     * What to do when the backend is unavailable. `true` refuses the request with a 503 rather
     * than admitting it unchecked — the right answer for anything that mutates or authenticates,
     * where an outage would otherwise be a way around the limit. Reads stay open so an outage
     * degrades the site instead of taking it down.
     */
    failClosed: boolean;
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {

    // Authenticated feedback: 30 per hour
    feedbackPostAuthenticated: {
        interval: 60 * 60,
        uniqueTokenPerInterval: 30,
        failClosed: true,
    },

    // Unauthenticated feedback: 15 per hour
    feedbackPostUnauthenticated: {
        interval: 60 * 60,
        uniqueTokenPerInterval: 10,
        failClosed: true,
    },

    // Authenticated feedback load: 30 per hour
    feedbackGetAuthenticated: {
        interval: 60 * 60,
        uniqueTokenPerInterval: 60,
        failClosed: false,
    },

    // User updates: 3 per day
    userUpdate: {
        interval: 60 * 60 * 24,
        uniqueTokenPerInterval: 3,
        failClosed: true,
    },
    // Auth attempts: 5 per 15 minutes
    auth: {
        interval: 60 * 15,
        uniqueTokenPerInterval: 5,
        failClosed: true,
    },
    // Admin actions: 50 per 5min
    admin: {
        interval: 300,
        uniqueTokenPerInterval: 50,
        failClosed: true,
    },
    // General API: 30 per minute
    api: {
        interval: 60,
        uniqueTokenPerInterval: 30,
        failClosed: false,
    },
    // Username changes: 1 per week
    usernameUpdate: {
        interval: 60 * 60 * 24 * 7,
        uniqueTokenPerInterval: 1,
        failClosed: true,
    },
    // Username availability probe: 20 per minute
    usernameCheck: {
        interval: 60,
        uniqueTokenPerInterval: 20,
        failClosed: false,
    },
    // Account deletion: 5 per day. Deleting succeeds once; the allowance is for retries.
    accountDelete: {
        interval: 60 * 60 * 24,
        uniqueTokenPerInterval: 5,
        failClosed: true,
    },
    // Rate-limiter liveness probe used by the admin health view: 100 per minute
    healthCheck: {
        interval: 60,
        uniqueTokenPerInterval: 100,
        failClosed: false,
    },
} as const;

export type RateLimitPolicy = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Every policy owns its own counters. Two policies with the same interval — `feedbackGetAuthenticated`
 * at 60/hour and `feedbackPostAuthenticated` at 30/hour — used to land on one bucket for a caller,
 * so reads either inflated or exhausted the write allowance depending on the backend. The policy
 * name is part of the key precisely so that cannot happen; sharing an allowance now requires
 * deliberately passing the same policy name.
 */
export interface RateLimitWindow {
    /** Storage key: policy, then caller, then the fixed window this call falls in. */
    key: string;
    /** When the current window ends, in epoch milliseconds. */
    reset: number;
    /** Seconds until just after the window ends — never longer than the window itself. */
    ttlSeconds: number;
}

export function resolveWindow(
    policy: string,
    identifier: string,
    config: RateLimitConfig,
    now: number,
): RateLimitWindow {
    const windowIndex = Math.floor(now / 1000 / config.interval);
    const reset = (windowIndex + 1) * config.interval * 1000;

    return {
        key: `rl:${policy}:${identifier}:${windowIndex}`,
        reset,
        ttlSeconds: Math.ceil((reset - now) / 1000) + 1,
    };
}

/**
 * NextAuth serves several very different things on one catch-all, and only sign-in *initiation* is
 * worth limiting. `session` is polled by every signed-in page, `csrf` is fetched before each form
 * post, and `callback` is where the provider returns the user — throttling any of those breaks
 * ordinary logins rather than abuse.
 */
export function isSignInInitiation(method: string, pathname: string): boolean {
    return method.toUpperCase() === 'POST'
        && /\/api\/auth\/signin(\/|$)/.test(pathname);
}

/**
 * Which header carries the client address. A forwarded header is a claim, not a fact: it is
 * trustworthy only when the ingress in front of the app overwrites whatever the client sent.
 *
 * Set `RATE_LIMIT_TRUSTED_IP_HEADER` to whichever header the deployment's proxy guarantees. Left
 * unset, the order below is tried — good enough for a platform that rewrites `x-forwarded-for`,
 * and *not* something to rely on for a deployment whose ingress passes the client's value through.
 * Confirm the header for the actual host before treating anonymous limits as abuse-resistant.
 */
const TRUSTED_IP_HEADERS = ['x-forwarded-for', 'x-real-ip'] as const;

function configuredIpHeader(): string | null {
    const configured = process.env.RATE_LIMIT_TRUSTED_IP_HEADER?.trim().toLowerCase();
    return configured ? configured : null;
}

/**
 * Takes the client address out of a forwarded header value. `x-forwarded-for` is a list appended to
 * hop by hop, and the client is the first entry. Ports and IPv6 brackets are stripped so the same
 * caller cannot occupy several buckets by varying its source port.
 */
export function normalizeClientIp(value: string | null | undefined): string | null {
    const first = value?.split(',')[0]?.trim();

    if (!first) {
        return null;
    }

    // [2001:db8::1]:443 — bracketed IPv6, optionally with a port.
    const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(first);
    if (bracketed) {
        return bracketed[1].toLowerCase();
    }

    // 203.0.113.1:443 — IPv4 with a port. A bare IPv6 also contains colons, so only strip when
    // there is exactly one and what follows is numeric.
    const parts = first.split(':');
    if (parts.length === 2 && /^\d+$/.test(parts[1])) {
        return parts[0].toLowerCase();
    }

    return first.toLowerCase();
}

/**
 * Identifies the caller a limit applies to. A signed-in caller is their user id, which is the only
 * identity here that cannot be forged. Everyone else is their client address, and everyone whose
 * address cannot be determined shares one bucket — deliberately, since the alternative is an
 * unlimited unidentified caller.
 */
export async function getIdentifier(userId?: string): Promise<string> {
    if (userId) return `user:${userId}`;

    const headersList = await headers();
    const configured = configuredIpHeader();
    const candidates = configured ? [configured] : TRUSTED_IP_HEADERS;

    for (const header of candidates) {
        const ip = normalizeClientIp(headersList.get(header));
        if (ip) {
            return `ip:${ip}`;
        }
    }

    return 'ip:unknown';
}

// Rate limiter interface. Both backends admit identically: count this call, then compare the
// running count against the policy's cap.
export interface RateLimiter {
    check(policy: string, identifier: string, config: RateLimitConfig): Promise<RateLimitResult>;
}
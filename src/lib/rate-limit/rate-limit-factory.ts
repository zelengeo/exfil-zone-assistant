import { kvRateLimiter } from './rate-limit-kv';
import { memoryRateLimiter } from './rate-limit-memory';
import type { RateLimiter } from './rate-limit';

export type RateLimitBackend = 'kv' | 'memory';

export interface RateLimiterSelection {
    limiter: RateLimiter;
    backend: RateLimitBackend;
    /**
     * True when production is running on the in-memory limiter. That store is per instance, so on
     * serverless it is per lambda and provides no meaningful shared limit. It is a deployment
     * misconfiguration, not a healthy mode, and the health view says so — but it still serves,
     * because failing every request is worse than a weak limit.
     */
    misconfigured: boolean;
}

let selection: RateLimiterSelection | null = null;
let warned = false;

export function getRateLimiterSelection(): RateLimiterSelection {
    if (!selection) {
        const hasKV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction && hasKV) {
            selection = { limiter: kvRateLimiter, backend: 'kv', misconfigured: false };
        } else {
            selection = {
                limiter: memoryRateLimiter,
                backend: 'memory',
                misconfigured: isProduction,
            };
        }

        if (selection.misconfigured && !warned) {
            warned = true;
            console.error(
                'Rate limiting is running on the in-memory store in production. '
                + 'KV_REST_API_URL and KV_REST_API_TOKEN are not both set, so limits are '
                + 'per-instance and provide no shared protection.',
            );
        }
    }

    return selection;
}

export function getRateLimiter(): RateLimiter {
    return getRateLimiterSelection().limiter;
}

/** Test seam: the selection is cached for the life of the process. */
export function resetRateLimiterSelection(): void {
    selection = null;
    warned = false;
}

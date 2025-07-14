import { kvRateLimiter } from './rate-limit-kv';
import { kvRateLimiter as fallbackRateLimiter } from './rate-limit-memory';
import type { RateLimiter } from './rate-limit';

let rateLimiter: RateLimiter;

export function getRateLimiter(): RateLimiter {
    if (!rateLimiter) {
        // Use KV in production if available, otherwise fallback to memory
        const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

        if (process.env.NODE_ENV === 'production' && hasKV) {
            rateLimiter = kvRateLimiter;
            console.log('Using Vercel KV for rate limiting');
        } else {
            rateLimiter = fallbackRateLimiter;
            console.log('Using in-memory rate limiting');
        }
    }

    return rateLimiter;
}
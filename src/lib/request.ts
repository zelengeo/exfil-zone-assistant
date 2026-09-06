// src/lib/request.ts
import { ValidationError } from '@/lib/errors';

/**
 * Reads a JSON request body, turning a parse failure into the API's 400 rather than a 500.
 *
 * This exists as its own boundary so that only a failure *here* is treated as a client mistake.
 * Catching SyntaxError globally in `handleError` would quietly reclassify a genuine programming
 * error — a bad `JSON.parse` of our own data, say — as the caller's fault.
 *
 * The parsed value is `unknown`: it is untrusted input, and the route's zod schema is what turns it
 * into a type.
 */
export async function parseJsonBody(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new ValidationError('Request body is not valid JSON');
        }

        throw error;
    }
}

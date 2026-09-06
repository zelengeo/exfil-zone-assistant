/**
 * Error translation, exercised with the error objects the installed packages actually throw
 * rather than hand-made look-alikes — the bug this covers was precisely that the real driver
 * error did not have the shape the translator assumed.
 */
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { z } from 'zod';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError, ConflictError, handleError, isDuplicateKeyError, NotFoundError } from '@/lib/errors';
import { parseJsonBody } from '@/lib/request';

async function body(response: Response) {
    return await response.json() as {
        error: { message: string; code: string; statusCode: number; details?: string };
        requestId?: string;
    };
}

function duplicateKeyError(field: string, value: string) {
    return new MongoServerError({
        message: `E11000 duplicate key error collection: db.users index: ${field}_1 dup key: { ${field}: "${value}" }`,
        code: 11000,
        keyPattern: { [field]: 1 },
        keyValue: { [field]: value },
    });
}

describe('duplicate key translation', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('recognises the driver error the app actually receives', () => {
        const error = duplicateKeyError('username', 'taken');

        // The old guard required `instanceof MongooseError` and `name === 'MongoError'`. The real
        // error satisfies neither, which is how every uniqueness conflict became a 500.
        expect(error).not.toBeInstanceOf(MongooseError);
        expect(error.name).toBe('MongoServerError');
        expect(isDuplicateKeyError(error)).toBe(true);
    });

    it('returns 409 naming the field, without the colliding value', async () => {
        const response = handleError(duplicateKeyError('username', 'taken'));

        expect(response.status).toBe(409);

        const payload = await body(response);
        expect(payload.error.code).toBe('DUPLICATE_ERROR');
        expect(payload.error.message).toBe('username already exists');
        // The value that collided is another user's data.
        expect(JSON.stringify(payload)).not.toContain('taken');
    });

    it('falls back to a generic field name when no key pattern is present', async () => {
        const response = handleError(new MongoServerError({ message: 'dup', code: 11000 }));

        expect(response.status).toBe(409);
        expect((await body(response)).error.message).toBe('field already exists');
    });

    it.each([
        ['a plain object carrying the code', { code: 11000 }],
        ['a bulk write error shape', { name: 'MongoBulkWriteError', code: 11000 }],
    ])('recognises %s', (_label, error) => {
        expect(isDuplicateKeyError(error)).toBe(true);
    });

    it.each([
        ['a different mongo code', { code: 121 }],
        ['a string code', { code: '11000' }],
        ['null', null],
        ['a plain error', new Error('nope')],
    ])('does not mistake %s for a duplicate key', (_label, error) => {
        expect(isDuplicateKeyError(error)).toBe(false);
    });
});

describe('malformed JSON', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function post(payload: string): Request {
        return new Request('http://localhost/api/thing', {
            method: 'POST',
            body: payload,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    it('parses a valid body', async () => {
        await expect(parseJsonBody(post('{"a":1}'))).resolves.toEqual({ a: 1 });
    });

    it.each(['{ not json', '', '{"a":', 'undefined'])('rejects %s as a 400', async (payload) => {
        const response = await parseJsonBody(post(payload)).catch(handleError);

        expect(response).toBeInstanceOf(Response);
        expect((response as Response).status).toBe(400);
        expect((await body(response as Response)).error.code).toBe('VALIDATION_ERROR');
    });

    it('leaves a SyntaxError raised anywhere else as a 500', async () => {
        // Only a failure at the body boundary is the caller's mistake. A SyntaxError from our own
        // code is a bug, and reporting it as 400 would hide it.
        const response = handleError(new SyntaxError('Unexpected token in application code'));

        expect(response.status).toBe(500);
        expect((await body(response)).error.code).toBe('INTERNAL_ERROR');
    });
});

describe('other error shapes still translate', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('maps a real Mongoose ValidationError to 400', async () => {
        const response = handleError(new MongooseError.ValidationError());

        expect(response.status).toBe(400);
        expect((await body(response)).error.code).toBe('VALIDATION_ERROR');
    });

    it('maps a real Mongoose CastError to 400', async () => {
        const response = handleError(new MongooseError.CastError('ObjectId', 'nope', '_id'));

        expect(response.status).toBe(400);
        expect((await body(response)).error.code).toBe('INVALID_FORMAT');
    });

    it('maps a real ZodError to 400', async () => {
        const parsed = z.object({ name: z.string() }).safeParse({ name: 1 });
        expect(parsed.success).toBe(false);

        const response = handleError(parsed.error);
        expect(response.status).toBe(400);
        expect((await body(response)).error.code).toBe('VALIDATION_ERROR');
    });

    it.each([
        [new NotFoundError('User'), 404],
        [new ConflictError('Username already in use'), 409],
        [new AppError('boom', 500, 'INTERNAL_ERROR'), 500],
    ])('preserves an AppError status', async (error, status) => {
        expect(handleError(error).status).toBe(status);
    });

    it.each([
        ['null', null],
        ['a string', 'something went wrong'],
        ['a number', 42],
        ['undefined', undefined],
    ])('survives %s being thrown', async (_label, thrown) => {
        // Reading .message off a non-Error used to crash the handler itself.
        const response = handleError(thrown);

        expect(response.status).toBe(500);
        expect((await body(response)).error.code).toBe('INTERNAL_ERROR');
    });
});

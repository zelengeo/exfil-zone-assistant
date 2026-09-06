import {z, ZodError} from 'zod';
import {MongooseError} from 'mongoose';
import {NextResponse} from "next/server";
import {ErrorResponse} from "@/lib/schemas/core";

// Custom error classes
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string,
        public isOperational: boolean = true
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public details?: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}


export class BannedUserError extends AuthorizationError {
    code = 'USER_BANNED';
}


export class InsufficientPermissionsError extends AuthorizationError {
    code = 'INSUFFICIENT_PERMISSIONS';

    constructor(requiredRole?: string) {
        super(requiredRole
            ? `${requiredRole} role required`
            : 'Insufficient permissions'
        );
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT_ERROR');
    }
}

export class RateLimitError extends AppError {
    constructor(retryAfter?: number) {
        super(`Too many requests.${retryAfter ? `Retry after ${retryAfter}s.` : ""}`, 429, 'RATE_LIMIT_ERROR');
    }
}

interface DuplicateKeyError {
    code: 11000;
    keyPattern?: Record<string, number>;
}

/**
 * A unique-index violation, whichever layer surfaces it.
 *
 * This is a structural check on purpose. The installed driver throws `MongoServerError`, which is
 * **not** a `MongooseError` and is not named `MongoError` — the two conditions this used to be
 * guarded by — so every duplicate key was reported as a 500. Matching on `code` covers the driver's
 * error, a Mongoose-wrapped one and a bulk-write one without depending on a class identity that has
 * already changed once.
 */
export function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
    return typeof error === 'object'
        && error !== null
        && 'code' in error
        && (error as { code?: unknown }).code === 11000;
}

/** The field a duplicate-key error names, without exposing the value that collided. */
function duplicateKeyField(error: DuplicateKeyError): string {
    const pattern = error.keyPattern;
    const field = pattern ? Object.keys(pattern)[0] : undefined;

    return field ?? 'field';
}

interface ErrorDetails {
    message?: string;
    code?: string;
    statusCode?: number;
    stack?: string;
}


// Environment checks
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Sanitize error details based on environment
function sanitizeError(error: unknown): ErrorResponse {
    const requestId = crypto.randomUUID();

    // A thrown value is not necessarily an Error — `throw null` and `throw 'oops'` are legal, and
    // reading .message off them here used to crash the error handler itself.
    const asError = error instanceof Error ? error : undefined;
    const message = asError?.message ?? String(error);

    // Log full error in development
    if (isDevelopment || isTest) {
        console.error(`[${requestId}] Error:`, error);
    } else {
        // In production, log error but don't expose details
        const errorDetails: ErrorDetails = {
            message,
            stack: asError?.stack,
        }
        if (error instanceof AppError) {
            errorDetails.code = error.code;
            errorDetails.statusCode = error.statusCode;
        }

        console.error(`[${requestId}] Error:`, errorDetails);
    }

    // Handle known error types
    if (error instanceof AppError) {
        return {
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                details: error instanceof ValidationError ? error.details : undefined,
            },
            requestId: isDevelopment ? requestId : undefined,
        };
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return {
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                statusCode: 400,
                details: z.prettifyError(error)
            },
            requestId: isDevelopment ? requestId : undefined,
        };
    }

    // Checked before the Mongoose branch, because the driver's duplicate-key error is not a
    // MongooseError. A uniqueness conflict is an expected outcome of a race that no availability
    // pre-check can close, not a server fault.
    if (isDuplicateKeyError(error)) {
        return {
            error: {
                message: `${duplicateKeyField(error)} already exists`,
                code: 'DUPLICATE_ERROR',
                statusCode: 409,
            },
            requestId: isDevelopment ? requestId : undefined,
        };
    }

    // Handle Mongoose-specific errors
    if (error instanceof MongooseError) {
        // Validation error
        if (error.name === 'ValidationError') {
            return {
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    statusCode: 400,
                    details: isDevelopment ? error.message : undefined,
                },
                requestId: isDevelopment ? requestId : undefined,
            };
        }

        // Cast error (invalid ObjectId, etc)
        if (error.name === 'CastError') {
            return {
                error: {
                    message: 'Invalid data format',
                    code: 'INVALID_FORMAT',
                    statusCode: 400,
                },
            };
        }
    }

    // Generic error response for unknown errors. A SyntaxError reaches here on purpose: only a
    // deliberate request-body boundary (`parseJsonBody`) treats one as a client mistake, because
    // a SyntaxError raised anywhere else is a bug in this code, not in the request.
    return {
        error: {
            message: isDevelopment ? message : 'An unexpected error occurred',
            code: 'INTERNAL_ERROR',
            statusCode: 500,
            details: isDevelopment ? message : undefined,
        },
        requestId: isDevelopment ? requestId : undefined,
    };
}

// Main error handler
export function handleError(error: unknown): NextResponse {
    const errorResponse = sanitizeError(error);

    return NextResponse.json(errorResponse, {
        status: errorResponse.error.statusCode,
    });
}

// Async wrapper for route handlers
export function asyncHandler<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            throw error; // Let the route handler deal with it
        }
    };
}

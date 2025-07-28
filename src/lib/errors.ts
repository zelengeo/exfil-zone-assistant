import {z, ZodError} from 'zod';
import { MongooseError } from 'mongoose';
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
        super('Too many requests', 429, 'RATE_LIMIT_ERROR');
    }
}


// Environment checks
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Sanitize error details based on environment
function sanitizeError(error: any): ErrorResponse {
    const requestId = crypto.randomUUID();

    // Log full error in development
    if (isDevelopment || isTest) {
        console.error(`[${requestId}] Error:`, error);
    } else {
        // In production, log error but don't expose details
        console.error(`[${requestId}] Error:`, {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack,
        });
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

    // Handle Mongoose errors
    if (error instanceof MongooseError) {
        // Duplicate key error
        if (error.name === 'MongoError' && (error as any).code === 11000) {
            const field = Object.keys((error as any).keyPattern)[0];
            return {
                error: {
                    message: `${field} already exists`,
                    code: 'DUPLICATE_ERROR',
                    statusCode: 409,
                },
            };
        }

        // Validation error
        if (error.name === 'ValidationError') {
            return {
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    statusCode: 400,
                    details: isDevelopment ? error.message : undefined,
                },
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

    // Generic error response for unknown errors
    return {
        error: {
            message: 'An unexpected error occurred',
            code: 'INTERNAL_ERROR',
            statusCode: 500,
            details: isDevelopment ? error.message : undefined,
        },
        requestId: isDevelopment ? requestId : undefined,
    };
}

// Main error handler
export function handleError(error: any): NextResponse {
    const errorResponse = sanitizeError(error);

    return NextResponse.json(errorResponse, {
        status: errorResponse.error.statusCode,
    });
}

// Async wrapper for route handlers
export function asyncHandler<T extends any[], R>(
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
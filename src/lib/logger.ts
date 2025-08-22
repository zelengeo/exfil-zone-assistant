import {AppError} from "@/lib/errors";

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
    userId?: string;
    requestId?: string;
    path?: string;
    method?: string;
    ip?: string;
    userAgent?: string;
    [key: string]: unknown;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    private log(level: LogLevel, message: string, context?: LogContext) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...context,
        };

        // In production, you might want to send this to a logging service
        if (this.isDevelopment) {
            console[level](JSON.stringify(logEntry, null, 2));
        } else {
            // Structured logging for production
            console[level](JSON.stringify(logEntry));
        }
    }

    error(message: string, error?: unknown, context?: LogContext) {
        const errorDetails: {
            message?: string;
            stack?: string;
            code?: string | number;
        } = {};

        // Extract error details safely
        if (error instanceof Error) {
            errorDetails.message = error.message;
            errorDetails.stack = this.isDevelopment ? error.stack : undefined;

            // Check if it's an AppError with a code property
            if (error instanceof AppError) {
                errorDetails.code = error.code;
            }
        } else if (typeof error === 'string') {
            errorDetails.message = error;
        } else if (error && typeof error === 'object') {
            // Handle objects that might have error-like properties
            if ('message' in error && typeof error.message === 'string') {
                errorDetails.message = error.message;
            }
            if ('stack' in error && typeof error.stack === 'string') {
                errorDetails.stack = this.isDevelopment ? error.stack : undefined;
            }
            if ('code' in error && (typeof error.code === 'string' || typeof error.code === 'number')) {
                errorDetails.code = error.code;
            }
        }

        this.log('error', message, {
            ...context,
            error: errorDetails,
        });
    }

    warn(message: string, context?: LogContext) {
        this.log('warn', message, context);
    }

    info(message: string, context?: LogContext) {
        this.log('info', message, context);
    }

    debug(message: string, context?: LogContext) {
        if (this.isDevelopment) {
            this.log('debug', message, context);
        }
    }
}

export const logger = new Logger();
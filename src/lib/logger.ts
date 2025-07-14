type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
    userId?: string;
    requestId?: string;
    path?: string;
    method?: string;
    ip?: string;
    userAgent?: string;
    [key: string]: any;
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

    error(message: string, error?: any, context?: LogContext) {
        this.log('error', message, {
            ...context,
            error: {
                message: error?.message,
                stack: this.isDevelopment ? error?.stack : undefined,
                code: error?.code,
            },
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
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to error reporting service in production
        if (process.env.NODE_ENV === 'production') {
            // e.g., Sentry.captureException(error);
        } else {
            console.error('Page error:', error);
        }
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="text-2xl font-bold">Something went wrong!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    We apologize for the inconvenience. Please try again or contact support if the problem persists.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={reset} variant="default">
                        Try again
                    </Button>
                    <Button onClick={() => window.location.href = '/'} variant="outline">
                        Go home
                    </Button>
                </div>
            </div>
        </div>
    );
}
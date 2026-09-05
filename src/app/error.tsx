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
        <div className="min-h-screen bg-steel-950 text-ink-300 flex items-center justify-center p-4">
            <div className="text-center space-y-4 max-w-md">
                <AlertCircle className="mx-auto h-12 w-12 text-bad" strokeWidth={1.5} />
                <h2 className="font-display font-bold uppercase tracking-tight text-2xl text-ink-100">Something went wrong!</h2>
                <p className="text-ink-400">
                    We apologize for the inconvenience. Please try again or contact support if the problem persists.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={reset} variant="ember">
                        Try again
                    </Button>
                    <Button onClick={() => window.location.href = '/'} variant="quiet">
                        Go home
                    </Button>
                </div>
            </div>
        </div>
    );
}
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';
import { getAuthErrorMessage } from '@/lib/auth/errors';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const message = getAuthErrorMessage(error);

    // Determine severity based on error type
    const isCriticalError = ['Configuration', 'OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount'].includes(error || '');

    return (
        <div className="min-h-screen bg-steel-950 text-ink-300 flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md bg-steel-800 border-line-800 shadow-none">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 border border-bad/40 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <CardTitle className="font-display font-bold uppercase tracking-tight text-2xl text-ink-100">Authentication Error</CardTitle>
                    <CardDescription>
                        We encountered a problem signing you in
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Details</AlertTitle>
                        <AlertDescription className="mt-2">
                            {message}
                        </AlertDescription>
                    </Alert>

                    {error && (
                        <div className="bg-steel-750 border border-line-700 p-3">
                            <p className="text-xs text-muted-foreground">
                                Error code: <code className="font-mono">{error}</code>
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    <Button
                        asChild
                        className="w-full"
                        variant={isCriticalError ? "quiet" : "ember"}
                    >
                        <Link href="/auth/signin">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Try Again
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" className="w-full">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>

                    {isCriticalError && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            If this problem persists, please{' '}
                            <a
                                href="https://github.com/zelengeo/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                report an issue
                            </a>
                        </p>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-steel-950 text-ink-300 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md bg-steel-800 border-line-800 shadow-none">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 border border-bad/40 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <CardTitle className="font-display font-bold uppercase tracking-tight text-2xl text-ink-100">Authentication Error</CardTitle>
                        <CardDescription>
                            Loading error details...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
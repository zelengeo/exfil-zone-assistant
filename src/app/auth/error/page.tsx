'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errorMessages: Record<string, string> = {
        Configuration: 'There is a problem with the server configuration.',
        AccessDenied: 'You do not have permission to sign in.',
        Verification: 'The verification token has expired or has already been used.',
        OAuthSignin: 'Error occurred during OAuth sign in.',
        OAuthCallback: 'Error occurred during OAuth callback.',
        OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
        OAuthAccountNotLinked: 'An account with this email already exists. Please sign in with your original provider first, then link additional accounts in settings.',
        EmailCreateAccount: 'Could not create email provider user in the database.',
        Callback: 'Error occurred during callback.',
        Default: 'An unexpected error occurred.',
    };

    const message = errorMessages[error || 'Default'] || errorMessages.Default;

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-military-800 border border-red-700 rounded-sm p-8">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">
                        Authentication Error
                    </h1>
                    <p className="text-tan-300 mb-2">
                        {message}
                    </p>
                    <p className="text-sm text-tan-400 mb-6">
                        Error code: <code className="bg-military-900 px-2 py-1 rounded">{error}</code>
                    </p>
                    <Link
                        href="/auth/signin"
                        className="inline-block px-4 py-2 bg-olive-600 hover:bg-olive-500
                     text-white rounded-sm transition-colors"
                    >
                        Try Again
                    </Link>
                </div>
            </div>
        </div>
    );
}
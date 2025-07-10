'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {SiDiscord, SiFacebook, SiGoogle} from '@icons-pack/react-simple-icons';

export default function SignInPage() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const handleSignIn = async (provider: string) => {
        setIsLoading(provider);
        try {
            await signIn(provider, { callbackUrl });
        } catch (error: Error) {
            console.error('Sign in error:', error);
            setError(error.message);
            setIsLoading(null);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to track your contributions and access personalized features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        onClick={() => handleSignIn('google')}
                        disabled={isLoading !== null}
                        className="w-full"
                        variant="outline"
                    >
                        <SiGoogle className="mr-2 h-4 w-4" />
                        Continue with Google
                    </Button>

                    <Button
                        onClick={() => handleSignIn('discord')}
                        disabled={isLoading !== null}
                        className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                    >
                        <SiDiscord className="mr-2 h-4 w-4" />
                        Continue with Discord
                    </Button>

                    <Button
                        onClick={() => handleSignIn('facebook')}
                        disabled={isLoading !== null}
                        className="w-full bg-[#1877F2] hover:bg-[#0C63D4]"
                    >
                        <SiFacebook className="mr-2 h-4 w-4" />
                        Continue with Facebook
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-military-800 border border-olive-700 rounded-sm p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
                    <p className="text-tan-400 text-center mb-8">
                        Sign in to track your contributions and access personalized features
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleSignIn('discord')}
                            disabled={isLoading !== null}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3
                       bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50
                       text-white font-medium rounded-sm transition-colors"
                        >
                            <SiDiscord size={20} />
                            {isLoading === 'discord' ? 'Signing in...' : 'Continue with Discord'}
                        </button>

                        <button
                            onClick={() => handleSignIn('google')}
                            disabled={isLoading !== null}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3
                       bg-white hover:bg-gray-100 disabled:opacity-50
                       text-gray-900 font-medium rounded-sm transition-colors
                       border border-gray-300"
                        >
                            <SiGoogle size={20} />
                            {isLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-tan-400">
                        <p>By signing in, you agree to our</p>
                        <p>
                            <Link href="/terms" className="text-olive-500 hover:text-olive-400">
                                Terms of Service
                            </Link>
                            {' and '}
                            <Link href="/privacy" className="text-olive-500 hover:text-olive-400">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
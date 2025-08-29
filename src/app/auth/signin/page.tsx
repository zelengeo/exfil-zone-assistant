'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {SiDiscord, SiGoogle, SiMeta} from '@icons-pack/react-simple-icons';
import { Loader2, Shield, Users, Trophy } from 'lucide-react';
import { getAuthErrorMessage } from "@/lib/auth/errors";

function SignInContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleSignIn = async (provider: string) => {
        setIsLoading(provider);
        try {
            await signIn(provider, { callbackUrl });
        } catch (error) {
            console.error('Sign in error:', error);
            setIsLoading(null);
        }
    };

    const error = searchParams.get('error');
    const errorMessage = error ? getAuthErrorMessage(error) : null;

    return (
        <div className="min-h-screen bg-military-900 flex items-center justify-center px-4 py-12">
            {/* Background texture */}
            <div className="absolute inset-0 texture-overlay pointer-events-none opacity-50"></div>

            <div className="w-full max-w-5xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left side - Sign in form */}
                    <Card className="bg-military-800/90 backdrop-blur border-olive-700">
                        <CardHeader className="space-y-1 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 rounded-full bg-olive-600/20 flex items-center justify-center">
                                    <Shield className="w-10 h-10 text-olive-500" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-tan-100">Welcome Back, Operator</CardTitle>
                            <CardDescription className="text-tan-400">
                                Sign in to access your profile and contribute to the community
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {errorMessage && (
                                <Alert variant="destructive" className="border-red-800 bg-red-900/20">
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-3">
                                <Button
                                    onClick={() => handleSignIn('discord')}
                                    disabled={isLoading !== null}
                                    variant="outline"
                                    className="w-full h-12 relative border-olive-700 hover:bg-olive-900/20 hover:border-olive-600 transition-all"
                                >
                                    {isLoading === 'discord' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <SiDiscord className="w-5 h-5 absolute left-4" />
                                            <span>Continue with Discord</span>
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={() => handleSignIn('google')}
                                    disabled={isLoading !== null}
                                    variant="outline"
                                    className="w-full h-12 relative border-olive-700 hover:bg-olive-900/20 hover:border-olive-600 transition-all"
                                >
                                    {isLoading === 'google' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <SiGoogle className="w-5 h-5 absolute left-4" />
                                            <span>Continue with Google</span>
                                        </>
                                    )}
                                </Button>

                                <Button
                                    disabled={true}
                                    variant="outline"
                                    className="w-full h-12 relative border-olive-700 hover:bg-olive-900/20 hover:border-olive-600 transition-all"
                                >
                                        <SiMeta className="w-5 h-5 absolute left-4" />
                                        <span>Continue with Meta</span>
                                </Button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-military-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-military-800 px-2 text-tan-500">Or</span>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                className="w-full text-tan-400 hover:text-tan-200"
                                onClick={() => router.push(callbackUrl)}
                            >
                                Continue as Guest
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Right side - Benefits */}
                    <div className="space-y-6 lg:pt-8">
                        <div>
                            <h2 className="text-3xl font-bold text-tan-100 mb-2 military-stencil">
                                JOIN THE RANKS
                            </h2>
                            <p className="text-tan-400">
                                Create an account to unlock exclusive features and contribute to the ExfilZone community
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-lg bg-military-800/50 border border-olive-800/50">
                                <div className="flex-shrink-0">
                                    <Trophy className="w-8 h-8 text-olive-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-tan-200 mb-1">Track Your Progress</h3>
                                    <p className="text-sm text-tan-400">
                                        Earn ranks and badges as you contribute. Build your reputation in the community.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-lg bg-military-800/50 border border-olive-800/50">
                                <div className="flex-shrink-0">
                                    <Users className="w-8 h-8 text-olive-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-tan-200 mb-1">Submit Feedback</h3>
                                    <p className="text-sm text-tan-400">
                                        Report bugs, suggest features, and help improve the game data accuracy.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-lg bg-military-800/50 border border-olive-800/50">
                                <div className="flex-shrink-0">
                                    <Shield className="w-8 h-8 text-olive-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-tan-200 mb-1">Exclusive Access</h3>
                                    <p className="text-sm text-tan-400">
                                        Get early access to new features and participate in community decisions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 text-sm text-tan-500">
                            <p>By signing in, you agree to our{' '}
                                <Link href="/terms" className="text-olive-500 hover:text-olive-400 underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-olive-500 hover:text-olive-400 underline">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-military-900 flex items-center justify-center px-4 py-12">
                <div className="absolute inset-0 texture-overlay pointer-events-none opacity-50"></div>
                <div className="w-full max-w-md relative z-10">
                    <Card className="bg-military-800/90 backdrop-blur border-olive-700">
                        <CardHeader className="space-y-1 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 rounded-full bg-olive-600/20 flex items-center justify-center">
                                    <Shield className="w-10 h-10 text-olive-500" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-tan-100">Welcome Back, Operator</CardTitle>
                            <CardDescription className="text-tan-400">
                                Loading sign in options...
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
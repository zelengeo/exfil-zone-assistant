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
        <div className="min-h-screen bg-steel-950 text-ink-300 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-5xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left side - Sign in form */}
                    <Card className="bg-steel-800 border-line-800 shadow-none">
                        <CardHeader className="space-y-1 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 border border-line-600 flex items-center justify-center">
                                    <Shield className="w-10 h-10 text-info" strokeWidth={1.5} />
                                </div>
                            </div>
                            <CardTitle className="font-display font-bold uppercase tracking-tight text-2xl text-ink-100">Welcome Back, Operator</CardTitle>
                            <CardDescription className="text-ink-400">
                                Sign in to access your profile and contribute to the community
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {errorMessage && (
                                <Alert variant="destructive" className="border-bad/50 bg-steel-900">
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-3">
                                <Button
                                    onClick={() => handleSignIn('discord')}
                                    disabled={isLoading !== null}
                                    variant="quiet"
                                    className="w-full h-12 relative"
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
                                    variant="quiet"
                                    className="w-full h-12 relative"
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
                                    variant="quiet"
                                    className="w-full h-12 relative"
                                >
                                        <SiMeta className="w-5 h-5 absolute left-4" />
                                        <span>Continue with Meta</span>
                                </Button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-line-800" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-steel-800 px-2 font-mono text-[10px] tracking-eyebrow uppercase text-ink-600">Or</span>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                className="w-full text-ink-400 hover:text-ink-100 hover:bg-steel-700"
                                onClick={() => router.push(callbackUrl)}
                            >
                                Continue as Guest
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Right side - Benefits */}
                    <div className="space-y-6 lg:pt-8">
                        <div>
                            <h2 className="font-display font-extrabold uppercase tracking-tight text-3xl text-ink-100 mb-2">
                                Join the Ranks
                            </h2>
                            <p className="text-ink-400">
                                Create an account to unlock exclusive features and contribute to the ExfilZone community
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-steel-800 border border-line-800">
                                <div className="flex-shrink-0">
                                    <Trophy className="w-8 h-8 text-info" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-ink-200 mb-1">Track Your Progress</h3>
                                    <p className="text-sm text-ink-400">
                                        Earn ranks and badges as you contribute. Build your reputation in the community.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-steel-800 border border-line-800">
                                <div className="flex-shrink-0">
                                    <Users className="w-8 h-8 text-info" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-ink-200 mb-1">Submit Feedback</h3>
                                    <p className="text-sm text-ink-400">
                                        Report bugs, suggest features, and help improve the game data accuracy.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-steel-800 border border-line-800">
                                <div className="flex-shrink-0">
                                    <Shield className="w-8 h-8 text-info" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-ink-200 mb-1">Exclusive Access</h3>
                                    <p className="text-sm text-ink-400">
                                        Get early access to new features and participate in community decisions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 text-sm text-ink-600">
                            <p>By signing in, you agree to our{' '}
                                <Link href="/terms" className="text-info hover:text-info-light underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-info hover:text-info-light underline">
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
            <div className="min-h-screen bg-steel-950 text-ink-300 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md relative z-10">
                    <Card className="bg-steel-800 border-line-800 shadow-none">
                        <CardHeader className="space-y-1 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 border border-line-600 flex items-center justify-center">
                                    <Shield className="w-10 h-10 text-info" strokeWidth={1.5} />
                                </div>
                            </div>
                            <CardTitle className="font-display font-bold uppercase tracking-tight text-2xl text-ink-100">Welcome Back, Operator</CardTitle>
                            <CardDescription className="text-ink-400">
                                Loading sign in options&hellip;
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

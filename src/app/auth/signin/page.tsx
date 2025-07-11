'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {SiDiscord, SiFacebook, SiGoogle} from '@icons-pack/react-simple-icons';
import {getAuthErrorMessage} from "@/lib/auth/errors";

export default function SignInPage() {
    const searchParams = useSearchParams();
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
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    const error = searchParams.get('error');
    const errorMessage = error ? getAuthErrorMessage(error) : null;

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
                            <AlertDescription>{errorMessage}</AlertDescription>
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
                <CardFooter>
                    <div className=" text-center mx-auto text-sm ">
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
                </CardFooter>
            </Card>
        </div>
    );
}
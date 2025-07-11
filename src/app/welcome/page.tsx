'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function WelcomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }

        // If user already has username, redirect to profile
        if (session?.user?.username) {
            router.push(`/user/${session.user.username}`);
        }
    }, [session, status, router]);

    useEffect(() => {
        const checkUsername = async () => {
            if (username.length < 3) {
                setIsAvailable(null);
                return;
            }

            setIsChecking(true);
            setError('');

            try {
                const response = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`);
                const data = await response.json();

                setIsAvailable(data.available);
                if (!data.available && data.message) {
                    setError(data.message);
                }
            } catch (err) {
                setError('Failed to check username availability');
            } finally {
                setIsChecking(false);
            }
        };

        const debounce = setTimeout(checkUsername, 500);
        return () => clearTimeout(debounce);
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAvailable || username.length < 3) return;

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/user/set-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to set username');
            }

            // Redirect to profile
            router.push(`/user/${username}`);
            router.refresh(); // Refresh to update session
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    const validateUsername = (value: string) => {
        // Only lowercase letters, numbers, and hyphens
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setUsername(sanitized);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome to ExfilZone Assistant!</CardTitle>
                    <CardDescription>
                        Choose a username to complete your profile setup
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="john-doe"
                                    value={username}
                                    onChange={(e) => validateUsername(e.target.value)}
                                    className={`pr-10 ${
                                        isAvailable === false ? 'border-destructive' :
                                            isAvailable === true ? 'border-green-600' : ''
                                    }`}
                                    minLength={3}
                                    maxLength={30}
                                    required
                                    autoFocus
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                    {!isChecking && isAvailable === true && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                    {!isChecking && isAvailable === false && <AlertCircle className="h-4 w-4 text-destructive" />}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                3-30 characters, lowercase letters, numbers, and hyphens only
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {isAvailable && (
                            <Alert className="border-green-600">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-600">
                                    Great choice! @{username} is available
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!isAvailable || isSubmitting || username.length < 3}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting username...
                                </>
                            ) : (
                                'Continue'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>You can change your username later in settings</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
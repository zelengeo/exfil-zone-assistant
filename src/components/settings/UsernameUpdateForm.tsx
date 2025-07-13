'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, X } from 'lucide-react';

export function UsernameUpdateForm() {
    const { data: session, update } = useSession();
    const [username, setUsername] = useState(session?.user?.username || '');
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Clean up the timeout on component unmount
    useEffect(() => {
        return () => {
            clearTimeout(debounceTimeout.current);
        };
    }, []);

    const checkUsername = useCallback(async (value: string) => {
        setIsChecking(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/user/check-username?username=${value}`);
            const data = await res.json();
            setIsAvailable(data.available);
            if (!data.available) {
                setMessage({ type: 'error', text: data.message || 'Username not available' });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
            setMessage({ type: 'error', text: 'Failed to check username' });
            setIsAvailable(false);
        } finally {
            setIsChecking(false);
        }
    }, []);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setUsername(value);
        setMessage(null);
        setIsAvailable(null);
        clearTimeout(debounceTimeout.current);

        if (value === session?.user?.username) {
            return;
        }

        if (value.length > 0 && value.length < 3) {
            setMessage({ type: 'error', text: 'Username must be at least 3 characters' });
            setIsAvailable(false);
            return;
        }

        if (value.length >= 3) {
            debounceTimeout.current = setTimeout(() => {
                checkUsername(value);
            }, 500); // 500ms debounce delay
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAvailable && username !== session?.user?.username) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/update-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            if (res.ok) {
                // More efficient session update
                await update({ ...session, user: { ...session?.user, username } });
                setMessage({ type: 'success', text: 'Username updated successfully!' });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Failed to update username' });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Username</CardTitle>
                <CardDescription>
                    Your unique username for your public profile URL
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                            <Input
                                id="username"
                                value={username}
                                onChange={handleUsernameChange}
                                placeholder="your-username"
                                className="mt-1 pr-10"
                            />
                            {isChecking && (
                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {!isChecking && isAvailable === true && username !== session?.user?.username && (
                                <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                            )}
                            {!isChecking && isAvailable === false && (
                                <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your profile will be available at: /user/{username || 'your-username'}
                        </p>
                    </div>

                    {message && (
                        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                            <AlertDescription>{message.text}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        disabled={
                            (!isAvailable && username !== session?.user?.username) ||
                            isSubmitting ||
                            isChecking ||
                            username === session?.user?.username
                        }
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Username
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
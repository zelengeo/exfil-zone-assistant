// src/app/unauthorized/[reason]/page.tsx
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Shield, LogIn, Home, UserX, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reasonConfig = {
    'role': {
        icon: Shield,
        title: 'Insufficient Permissions',
        description: 'You need additional permissions to access this area.',
        showSignIn: true,
    },
    'banned': {
        icon: Ban,
        title: 'Account Suspended',
        description: 'Your account has been suspended. Please contact support.',
        showSignIn: false,
    },
    'inactive': {
        icon: UserX,
        title: 'Account Inactive',
        description: 'Your account is currently inactive.',
        showSignIn: true,
    },
} as const;

export default async function UnauthorizedReasonPage({
                                                   params
                                               }: {
    params: Promise<{ reason: keyof typeof reasonConfig }>
}) {
    const { reason } = await params;
    const config = reasonConfig[reason] || reasonConfig.role;
    const Icon = config.icon;

    return (
        <Layout>
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 border border-bad/40">
                            <Icon className="h-16 w-16 text-bad" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="font-display font-extrabold uppercase tracking-tight text-3xl text-ink-100">
                            {config.title}
                        </h1>
                        <p className="text-xl text-ink-400">
                            {config.description}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        {config.showSignIn && (
                            <Button asChild variant="ember">
                                <Link href="/auth/signin">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </Link>
                            </Button>
                        )}

                        <Button asChild variant="quiet">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
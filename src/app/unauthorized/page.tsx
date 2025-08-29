// src/app/unauthorized/page.tsx
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Shield, LogIn, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function UnauthorizedPage() {
    return (
        <Layout>
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-md">
                    {/* Icon and Title */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-900/20 rounded-full">
                            <Shield className="h-16 w-16 text-red-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-100">
                            Access Denied
                        </h1>
                        <p className="text-xl text-gray-400">
                            You don&#39;t have permission to view this page
                        </p>
                    </div>

                    {/* Alert Message */}
                    <Alert className="bg-military-850 border-military-700">
                        <AlertDescription className="text-gray-300">
                            This area requires special permissions. If you believe you should have access,
                            please contact an administrator.
                        </AlertDescription>
                    </Alert>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Button
                            asChild
                            variant="default"
                            className="bg-olive-700 hover:bg-olive-600"
                        >
                            <Link href="/auth/signin">
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign In
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="border-military-600 hover:bg-military-800"
                        >
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
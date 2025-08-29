// src/app/not-found.tsx
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <Layout>
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-md">
                    {/* Error Code */}
                    <div className="space-y-2">
                        <h1 className="text-8xl font-bold text-military-600">404</h1>
                        <h2 className="text-2xl font-semibold text-gray-100">
                            Page Not Found
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400">
                        The page you&#39;re looking for doesn&#39;t exist or has been moved.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Button
                            asChild
                            variant="default"
                            className="bg-olive-700 hover:bg-olive-600"
                        >
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="border-military-600 hover:bg-military-800"
                        >
                            <Link href="/guides">
                                <Search className="mr-2 h-4 w-4" />
                                Browse Guides
                            </Link>
                        </Button>
                    </div>

                    {/* Additional Help */}
                    <div className="mt-8 pt-8 border-t border-military-700">
                        <p className="text-sm text-gray-500">
                            If you believe this is an error, please{' '}
                            <Link
                                href="/feedback"
                                className="text-blue-400 hover:text-blue-300 underline"
                                rel="noopener noreferrer"
                            >
                                leave feedback
                            </Link>
                            {' '}or{' '}
                            <Link
                                href="https://discord.gg/2FCDZK6C25"
                                className="text-blue-400 hover:text-blue-300 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                report it on Discord
                            </Link>
                            {' '}or{' '}
                            <Link
                                href="https://github.com/zelengeo/exfil-zone-assistant/issues"
                                className="text-blue-400 hover:text-blue-300 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                open an issue on GitHub.
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
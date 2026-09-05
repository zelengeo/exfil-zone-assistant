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
                        <h1 className="font-display font-extrabold text-8xl text-ink-800 tabular">404</h1>
                        <h2 className="font-display font-bold uppercase tracking-tight text-2xl text-ink-100">
                            Page Not Found
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-ink-400">
                        The page you&#39;re looking for doesn&#39;t exist or has been moved.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Button asChild variant="ember">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>

                        <Button asChild variant="quiet">
                            <Link href="/guides">
                                <Search className="mr-2 h-4 w-4" />
                                Browse Guides
                            </Link>
                        </Button>
                    </div>

                    {/* Additional Help */}
                    <div className="mt-8 pt-8 border-t border-line-800">
                        <p className="text-sm text-ink-600">
                            If you believe this is an error, please{' '}
                            <Link
                                href="/feedback"
                                className="text-info hover:text-info-light underline"
                                rel="noopener noreferrer"
                            >
                                leave feedback
                            </Link>
                            {' '}or{' '}
                            <Link
                                href="https://discord.gg/2FCDZK6C25"
                                className="text-info hover:text-info-light underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                report it on Discord
                            </Link>
                            {' '}or{' '}
                            <Link
                                href="https://github.com/zelengeo/exfil-zone-assistant/issues"
                                className="text-info hover:text-info-light underline"
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

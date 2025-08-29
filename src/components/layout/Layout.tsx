import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    fullWidth?: boolean;
    noPadding?: boolean;
    noFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
                                           children,
                                           className,
                                           containerClassName,
                                           fullWidth = false,
                                           noPadding = false,
                                           noFooter = false,
                                       }) => {
    return (
        <div className={cn(
            "flex flex-col min-h-screen bg-military-900 text-tan-100 relative",
            className
        )}>
            {/* Texture overlay */}
            <div className="absolute inset-0 texture-overlay pointer-events-none" aria-hidden="true" />

            {/* Skip to content link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-olive-600 text-white px-4 py-2 rounded-sm z-50"
            >
                Skip to content
            </a>

            <Header />

            <main
                id="main-content"
                className={cn(
                    "flex-grow relative z-10",
                    !fullWidth && "container max-w-7xl mx-auto",
                    !noPadding && "px-4 sm:px-6 py-6 sm:py-8",
                    containerClassName
                )}
            >
                {children}
            </main>

            {!noFooter && <Footer />}

            {/* Global components */}
            <Toaster />
        </div>
    );
};

export default Layout;

// Export a variant for full-screen layouts (like maps or editors)
export const FullScreenLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Layout fullWidth noPadding noFooter>
            {children}
        </Layout>
    );
};

// Export a variant for content-focused pages (like articles)
export const ContentLayout: React.FC<{
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}> = ({ children, maxWidth = '4xl' }) => {
    const maxWidthClasses = {
        'sm': 'max-w-screen-sm',
        'md': 'max-w-screen-md',
        'lg': 'max-w-screen-lg',
        'xl': 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        '4xl': 'max-w-4xl',
    };

    return (
        <Layout containerClassName={cn("mx-auto", maxWidthClasses[maxWidth])}>
            <article className="prose prose-tan prose-lg max-w-none">
                {children}
            </article>
        </Layout>
    );
};
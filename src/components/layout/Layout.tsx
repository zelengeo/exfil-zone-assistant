import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const Layout: React.FC<LayoutProps> = ({
                                           children,
                                           title = 'Exfil Zone Assistant',
                                           description = 'Your ultimate tactical companion for the VR extraction shooter experience.'
                                       }) => {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
                <link rel="icon" href="/favicon.ico" />

                {/* Additional VR-specific meta tags */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#1a1c18" /> {/* Matches bg-military-900 */}
            </Head>

            <div className="flex flex-col min-h-screen bg-military-900 text-tan-100 relative">
                {/* Texture overlay */}
                <div className="absolute inset-0 texture-overlay pointer-events-none"></div>

                <Header />

                <main className="flex-grow relative z-10">
                    {children}
                </main>

                <Footer />
            </div>
        </>
    );
};

export default Layout;
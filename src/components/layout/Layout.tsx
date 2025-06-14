import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    noIndex?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
                                           children,
                                           title = 'Exfil Zone Assistant',
                                           description = 'Your ultimate tactical companion for the VR extraction shooter experience. Combat simulator, weapon database, and guides for Contractors Showdown Exfil Zone.',
                                           keywords = 'VR gaming, extraction shooter, combat simulator, weapon database, Contractors Showdown, tactical guide',
                                           canonicalUrl,
                                           ogImage = '/og-image.jpg',
                                           noIndex = false
                                       }) => {
    // Construct full title
    const fullTitle = title === 'Exfil Zone Assistant'
        ? title
        : `${title} | Exfil Zone Assistant`;

    // Get current URL for canonical and OG tags
    const currentUrl = typeof window !== 'undefined'
        ? window.location.href
        : canonicalUrl || 'https://www.exfil-zone-assistant.app/';

    return (
        <>
            <Head>
                {/* Basic Meta Tags */}
                <title>{fullTitle}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />

                {/* Canonical URL */}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

                {/* Robots */}
                {noIndex ? (
                    <meta name="robots" content="noindex, nofollow" />
                ) : (
                    <meta name="robots" content="index, follow" />
                )}

                {/* Favicon and Icons */}
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <meta name="msapplication-TileImage" content="/logo-144x144.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
                <link rel="manifest" href="/site.webmanifest" />

                {/* Open Graph Tags */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={fullTitle} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:site_name" content="Exfil Zone Assistant" />

                {/* Twitter Card Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={fullTitle} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={ogImage} />
                <meta name="twitter:creator" content="@pogapwnz" />

                {/* Additional VR-specific meta tags */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="theme-color" content="#1a1c18" />
                <meta name="msapplication-TileColor" content="#1a1c18" />

                {/* Structured Data for Gaming Website */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "Exfil Zone Assistant",
                            "description": description,
                            "url": "https://www.exfil-zone-assistant.app",
                            "inLanguage": "en",
                            "publisher": {
                                "@type": "Person",
                                "name": "pogapwnz",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": "https://www.exfil-zone-assistant.app/android-chrome-512x512.png",
                                    "width": 512,
                                    "height": 512
                                }
                            },
                            "isPartOf": {
                                "@type": "WebApplication",
                                "name": "Exfil Zone Assistant",
                                "applicationCategory": "GameApplication",
                                "operatingSystem": "Web"
                            }
                        })
                    }}
                />
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
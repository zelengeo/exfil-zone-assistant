import React from "react";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from '@/app/components/providers/AuthProvider';
import { Saira_Condensed, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import CookieConsentBanner from "@/components/CookieConsentBanner";

// Cold Steel type system.
// Saira Condensed  — headings, numerals-as-display, buttons, list titles
// IBM Plex Sans    — body, descriptions, objectives
// IBM Plex Mono    — all numbers, labels, eyebrows, badges, prices
const sairaCondensed = Saira_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: '#0A0E12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.exfil-zone-assistant.app'),
  title: {
    default: 'ExfilZone Assistant',
    template: '%s | ExfilZone Assistant'
  },
  description: 'Your ultimate tactical companion for the VR extraction shooter experience. Combat simulator, weapon database, and guides for Contractors Showdown ExfilZone.',
  keywords: ['VR gaming', 'extraction shooter', 'combat simulator', 'weapon database', 'Contractors Showdown', 'tactical guide', 'Contractors guides', 'ExfilZone guides'],
  authors: [{ name: 'pogapwnz' }],
  creator: 'pogapwnz',
  publisher: 'ExfilZone Assistant',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'ExfilZone Assistant - companion app for Contractors Showdown ExfilZone',
    description: 'Your complete guide to the best VR extraction shooter. Combat simulations, weapon database, and tactical guides.',
    url: 'https://www.exfil-zone-assistant.app',
    siteName: 'ExfilZone Assistant',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ExfilZone Assistant - VR Tactical Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExfilZone Assistant - VR Tactical Companion',
    description: 'Your complete guide to the best VR extraction shooter',
    creator: '@pogapwnz',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      // Google search results (larger, circle-friendly)
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/logo-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/favicon-google-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-google-512x512.png', sizes: '512x512', type: 'image/png' },
      // Browser tab icons (small)
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#0A0E12',
      },
    ],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'msapplication-TileColor': '#0A0E12',
    'msapplication-TileImage': '/mstile-144x144.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sairaCondensed.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
      >
          <AuthProvider>
            {children}
            <SpeedInsights />
            <Analytics />
            <CookieConsentBanner />
          </AuthProvider>
      </body>
    </html>
  );
}

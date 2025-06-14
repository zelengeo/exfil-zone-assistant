import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.exfil-zone-assistant.app/'),
  title: {
    default: 'Exfil Zone Assistant',
    template: '%s | Exfil Zone Assistant'
  },
  description: 'Combat simulations, weapon database, and guides for Contractors Showdown ExfilZone. Your ultimate tactical companion.',
  keywords: ['Contractors guides', 'ExfilZone guides'],
  authors: [{ name: 'pogapwnz' }],
  creator: 'pogapwnz',
  publisher: 'Exfil Zone Assistant',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Exfil Zone Assistant - companion app for Contractors Showdown ExfilZone',
    description: 'Your complete guide to the best VR extraction shooter',
    url: 'https://www.exfil-zone-assistant.app',
    siteName: 'Exfil Zone Assistant',
    images: [
      {
        url: 'https://www.exfil-zone-assistant.app/og-image.jpg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

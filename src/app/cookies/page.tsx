import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Cookie, Shield, BarChart3, ExternalLink } from 'lucide-react';
import { SiDiscord, SiGoogle, SiYoutube } from '@icons-pack/react-simple-icons';

export default function CookiePolicyPage() {
    const lastUpdated = "July 2025";

    const cookieCategories = [
        {
            name: "Essential Cookies",
            description: "Required for the website to function properly. Cannot be disabled.",
            icon: Shield,
            required: true,
            cookies: [
                {
                    name: "next-auth.session-token",
                    purpose: "Maintains your login session",
                    duration: "30 days",
                    provider: "ExfilZone Assistant"
                },
                {
                    name: "next-auth.csrf-token",
                    purpose: "Security token to prevent cross-site request forgery",
                    duration: "Session",
                    provider: "ExfilZone Assistant"
                },
                {
                    name: "next-auth.callback-url",
                    purpose: "Stores the URL to redirect after login",
                    duration: "Session",
                    provider: "ExfilZone Assistant"
                },
                {
                    name: "__Host-next-auth.csrf-token",
                    purpose: "Secure version of CSRF token",
                    duration: "Session",
                    provider: "ExfilZone Assistant"
                }
            ]
        },
        {
            name: "Analytics Cookies",
            description: "Help us understand how visitors interact with our website. All data is anonymized.",
            icon: BarChart3,
            required: false,
            cookies: [
                {
                    name: "_vercel_analytics",
                    purpose: "Anonymized visitor analytics and performance metrics",
                    duration: "1 year",
                    provider: "Vercel Analytics"
                }
            ]
        },
        {
            name: "Authentication Provider Cookies",
            description: "Set by third-party authentication services when you sign in.",
            icon: ExternalLink,
            required: false,
            cookies: [
                {
                    name: "Various Google cookies",
                    purpose: "Google authentication and security",
                    duration: "Varies",
                    provider: "Google OAuth"
                },
                {
                    name: "Various Discord cookies",
                    purpose: "Discord authentication and security",
                    duration: "Varies",
                    provider: "Discord OAuth"
                }
            ]
        },
        {
            name: "Third-Party Embedded Content",
            description: "Cookies from external content providers embedded in our pages.",
            icon: SiYoutube,
            required: false,
            cookies: [
                {
                    name: "VISITOR_INFO1_LIVE, YSC, etc.",
                    purpose: "YouTube video player functionality and preferences",
                    duration: "Varies",
                    provider: "YouTube (Google)"
                }
            ]
        }
    ];

    return (
        <Layout>
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-olive-600/20 rounded-full flex items-center justify-center">
                                <Cookie className="w-8 h-8 text-olive-500" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-tan-100 military-stencil">COOKIE POLICY</h1>
                        <p className="text-tan-400">Last updated: {lastUpdated}</p>
                    </div>

                    {/* Introduction */}
                    <Card className="bg-military-800/50 border-olive-700">
                        <CardContent className="pt-6">
                            <p className="text-tan-300 leading-relaxed">
                                ExfilZone Assistant (&#34;we&#34;, &#34;our&#34;, or &#34;us&#34;) uses cookies and similar technologies to provide and improve our service.
                                This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.
                            </p>
                        </CardContent>
                    </Card>

                    {/* What are cookies */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-tan-100">What Are Cookies?</h2>
                        <Card className="bg-military-800/30 border-military-700">
                            <CardContent className="pt-6">
                                <p className="text-tan-400 leading-relaxed">
                                    Cookies are small text files that are placed on your device when you visit a website.
                                    They help the website remember information about your visit, such as your preferred language
                                    and other settings, which can make your next visit easier and the site more useful to you.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* How we use cookies */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-tan-100">How We Use Cookies</h2>
                        <div className="grid gap-4">
                            {cookieCategories.map((category) => (
                                <Card key={category.name} className="bg-military-800/30 border-military-700">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-lg">
                                            <category.icon className="w-5 h-5 text-olive-500" />
                                            {category.name}
                                            {category.required && (
                                                <Badge variant="secondary" className="ml-auto">
                                                    Required
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="text-tan-400">
                                            {category.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-military-700">
                                                        <TableHead className="text-tan-300">Cookie Name</TableHead>
                                                        <TableHead className="text-tan-300">Purpose</TableHead>
                                                        <TableHead className="text-tan-300">Duration</TableHead>
                                                        <TableHead className="text-tan-300">Provider</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {category.cookies.map((cookie, index) => (
                                                        <TableRow key={index} className="border-military-700">
                                                            <TableCell className="font-mono text-sm text-tan-400">
                                                                {cookie.name}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-tan-400">
                                                                {cookie.purpose}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-tan-400">
                                                                {cookie.duration}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-tan-400">
                                                                {cookie.provider}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Vercel Analytics Note */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-tan-100">About Vercel Analytics</h2>
                        <Card className="bg-military-800/30 border-military-700">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-tan-400 leading-relaxed">
                                    We use Vercel Analytics to understand how visitors use our website. Vercel Analytics is privacy-focused and:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-tan-400">
                                    <li>Does not collect any personal data or personally identifiable information (PII)</li>
                                    <li>Does not use any cross-site or cross-device tracking</li>
                                    <li>Anonymizes all data collected</li>
                                    <li>Is GDPR, CCPA, and PECR compliant</li>
                                </ul>
                                <p className="text-tan-400 leading-relaxed">
                                    While Vercel Analytics is privacy-compliant by design, we still list it here for full transparency
                                    and to comply with GDPR requirements about informing users of all cookies and tracking technologies used.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Third-party services */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-tan-100">Third-Party Services</h2>
                        <Card className="bg-military-800/30 border-military-700">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-tan-400 leading-relaxed">
                                    When you use third-party services through our website, they may set their own cookies:
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <SiGoogle className="w-5 h-5 text-olive-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-tan-300">Google OAuth & YouTube</p>
                                            <p className="text-sm text-tan-500">
                                                Used for authentication and embedded video content.
                                                <a href="https://policies.google.com/technologies/cookies"
                                                   target="_blank"
                                                   rel="noopener noreferrer"
                                                   className="text-olive-500 hover:text-olive-400 ml-1">
                                                    Learn more →
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <SiDiscord className="w-5 h-5 text-olive-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-tan-300">Discord OAuth</p>
                                            <p className="text-sm text-tan-500">
                                                Used for authentication.
                                                <a href="https://discord.com/privacy"
                                                   target="_blank"
                                                   rel="noopener noreferrer"
                                                   className="text-olive-500 hover:text-olive-400 ml-1">
                                                    Learn more →
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Your choices */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-tan-100">Your Cookie Choices</h2>
                        <Card className="bg-military-800/30 border-military-700">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-tan-400 leading-relaxed">
                                    You have several options for managing cookies:
                                </p>
                                <ul className="space-y-3 text-tan-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-olive-500 mt-1">•</span>
                                        <div>
                                            <strong className="text-tan-300">Browser Settings:</strong> Most browsers allow you to refuse cookies or delete cookies.
                                            The methods for doing so vary from browser to browser. Visit your browser&#39;s help pages for guidance.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-olive-500 mt-1">•</span>
                                        <div>
                                            <strong className="text-tan-300">Essential Cookies:</strong> You cannot opt out of essential cookies as they are
                                            necessary for the website to function. Disabling these will prevent you from using our service.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-olive-500 mt-1">•</span>
                                        <div>
                                            <strong className="text-tan-300">Analytics Cookies:</strong> You can opt out of Vercel Analytics by using
                                            browser extensions that block analytics scripts.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-olive-500 mt-1">•</span>
                                        <div>
                                            <strong className="text-tan-300">Third-Party Cookies:</strong> You can manage third-party cookies through
                                            the respective service providers&#39; privacy settings.
                                        </div>
                                    </li>
                                </ul>
                                <div className="mt-4 p-4 bg-military-900/50 rounded-lg border border-olive-800">
                                    <p className="text-sm text-tan-400">
                                        <strong className="text-tan-300">Note:</strong> Disabling cookies may affect the functionality of our website.
                                        Some features may not work properly without cookies.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Contact */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-tan-100">Questions or Concerns?</h2>
                        <Card className="bg-military-800/30 border-military-700">
                            <CardContent className="pt-6">
                                <p className="text-tan-400 leading-relaxed">
                                    If you have any questions about our use of cookies or this Cookie Policy,
                                    please contact us through our{' '}
                                    <a href="/feedback" className="text-olive-500 hover:text-olive-400">
                                        feedback form
                                    </a>{' '}
                                    or visit our{' '}
                                    <a href="/privacy" className="text-olive-500 hover:text-olive-400">
                                        Privacy Policy
                                    </a>{' '}
                                    for more information about how we handle your data.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Footer note */}
                    <div className="text-center pt-8">
                        <p className="text-sm text-tan-500">
                            This cookie policy is effective as of {lastUpdated}
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
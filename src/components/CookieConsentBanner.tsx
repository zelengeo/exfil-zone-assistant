'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Cookie, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CookiePreferences {
    essential: boolean;
    analytics: boolean;
    thirdParty: boolean;
}

export default function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true, // Always true, cannot be changed
        analytics: false,
        thirdParty: false,
    });

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Small delay to ensure smooth page load
            setTimeout(() => setIsVisible(true), 1000);
        } else {
            // Apply saved preferences
            const savedPreferences = JSON.parse(consent);
            applyPreferences(savedPreferences);
        }
    }, []);

    const applyPreferences = (prefs: CookiePreferences) => {
        // Here you would actually enable/disable the respective services
        if (prefs.analytics) {
            // Enable Vercel Analytics
            console.log('Analytics enabled');
        } else {
            // Disable Vercel Analytics if possible
            console.log('Analytics disabled');
        }

        if (prefs.thirdParty) {
            // Enable third-party services
            console.log('Third-party cookies enabled');
        } else {
            // Restrict third-party services
            console.log('Third-party cookies disabled');
        }
    };

    const handleAcceptAll = () => {
        const allEnabled: CookiePreferences = {
            essential: true,
            analytics: true,
            thirdParty: true,
        };

        localStorage.setItem('cookie-consent', JSON.stringify(allEnabled));
        localStorage.setItem('cookie-consent-date', new Date().toISOString());
        applyPreferences(allEnabled);
        setIsVisible(false);
    };

    const handleAcceptSelected = () => {
        localStorage.setItem('cookie-consent', JSON.stringify(preferences));
        localStorage.setItem('cookie-consent-date', new Date().toISOString());
        applyPreferences(preferences);
        setIsVisible(false);
    };

    const handleRejectNonEssential = () => {
        const essentialOnly: CookiePreferences = {
            essential: true,
            analytics: false,
            thirdParty: false,
        };

        localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly));
        localStorage.setItem('cookie-consent-date', new Date().toISOString());
        applyPreferences(essentialOnly);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Main Banner */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6",
                "animate-in slide-in-from-bottom duration-500"
            )}>
                <Card className="max-w-5xl mx-auto bg-military-900/95 backdrop-blur-md border-olive-700 shadow-2xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-olive-600/20 rounded-full">
                                    <Cookie className="h-6 w-6 text-olive-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Cookie Preferences</CardTitle>
                                    <CardDescription className="text-tan-400">
                                        We use cookies to enhance your experience
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mt-2 -mr-2"
                                onClick={() => setIsVisible(false)}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <p className="text-sm text-tan-300 leading-relaxed">
                            We use cookies and similar technologies to provide you with the best experience on our website.
                            Some cookies are essential for the site to function, while others help us understand how you use
                            the site so we can improve it. You can customize your preferences below.
                        </p>

                        {!showDetails ? (
                            <Button
                                variant="link"
                                onClick={() => setShowDetails(true)}
                                className="p-0 h-auto text-olive-500 hover:text-olive-400"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Manage preferences
                            </Button>
                        ) : (
                            <div className="space-y-3 py-2">
                                <Separator className="bg-military-700" />

                                <div className="space-y-3">
                                    {/* Essential Cookies */}
                                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-military-800/50">
                                        <Checkbox
                                            id="essential"
                                            checked={true}
                                            disabled
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <Label
                                                htmlFor="essential"
                                                className="text-sm font-medium text-tan-200 cursor-not-allowed"
                                            >
                                                Essential Cookies
                                            </Label>
                                            <p className="text-xs text-tan-400">
                                                Required for the website to function. These include session cookies
                                                for authentication and security features.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Analytics Cookies */}
                                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-military-800/50">
                                        <Checkbox
                                            id="analytics"
                                            checked={preferences.analytics}
                                            onCheckedChange={(checked) =>
                                                setPreferences(prev => ({ ...prev, analytics: checked as boolean }))
                                            }
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <Label
                                                htmlFor="analytics"
                                                className="text-sm font-medium text-tan-200 cursor-pointer"
                                            >
                                                Analytics Cookies
                                            </Label>
                                            <p className="text-xs text-tan-400">
                                                Help us understand how visitors use our site. All data collected by
                                                Vercel Analytics is anonymized and privacy-focused.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Third-Party Cookies */}
                                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-military-800/50">
                                        <Checkbox
                                            id="thirdParty"
                                            checked={preferences.thirdParty}
                                            onCheckedChange={(checked) =>
                                                setPreferences(prev => ({ ...prev, thirdParty: checked as boolean }))
                                            }
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <Label
                                                htmlFor="thirdParty"
                                                className="text-sm font-medium text-tan-200 cursor-pointer"
                                            >
                                                Third-Party Cookies
                                            </Label>
                                            <p className="text-xs text-tan-400">
                                                Set by Google OAuth, Discord OAuth, and YouTube when you use these services.
                                                Required for login and video playback features.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row gap-3 pt-3">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <Button
                                onClick={handleRejectNonEssential}
                                variant="outline"
                                className="flex-1 sm:flex-initial border-military-700 hover:bg-military-800"
                            >
                                Essential only
                            </Button>
                            {showDetails && (
                                <Button
                                    onClick={handleAcceptSelected}
                                    variant="outline"
                                    className="flex-1 sm:flex-initial border-olive-700 hover:bg-olive-900/20"
                                >
                                    Save preferences
                                </Button>
                            )}
                            <Button
                                onClick={handleAcceptAll}
                                className="flex-1 sm:flex-initial bg-olive-600 hover:bg-olive-500"
                            >
                                Accept all
                            </Button>
                        </div>

                        <Link
                            href="/cookies"
                            className="text-xs text-tan-500 hover:text-tan-400 text-center sm:text-right"
                        >
                            Cookie Policy →
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            {/* Settings Dialog (for reopening preferences) */}
            <Dialog open={false} onOpenChange={() => {}}>
                <DialogContent className="bg-military-900 border-olive-700">
                    <DialogHeader>
                        <DialogTitle>Cookie Preferences</DialogTitle>
                        <DialogDescription className="text-tan-400">
                            Manage your cookie preferences. You can change these settings at any time.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Content would go here for a full settings dialog */}
                </DialogContent>
            </Dialog>
        </>
    );
}

// Optional: Export a hook to programmatically show the banner again
export function useShowCookieSettings() {
    const showSettings = () => {
        localStorage.removeItem('cookie-consent');
        window.location.reload();
    };

    return { showSettings };
}
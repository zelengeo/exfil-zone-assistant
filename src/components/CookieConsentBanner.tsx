'use client';

import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import {Cookie, Settings, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import {DEFAULT_COOKIE_PREFERENCES, type CookiePreferences} from '@/services/StorageService';
import {cookiePreferencesStore, useCookiePreferences} from '@/hooks/useCookiePreferences';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';

export default function CookieConsentBanner() {
    const {preferences: savedPreferences, hydrated, savePreferences} = useCookiePreferences();
    const [isVisible, setIsVisible] = useState(false);
    const [isManaging, setIsManaging] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [draft, setDraft] = useState<CookiePreferences | null>(null);
    const preferences = draft ?? savedPreferences ?? DEFAULT_COOKIE_PREFERENCES;

    useEffect(() => {
        if (hydrated && savedPreferences === null) {
            const timeout = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timeout);
        }
    }, [hydrated, savedPreferences]);

    useEffect(() => {
        const open = () => {
            setDraft(cookiePreferencesStore.getSnapshot().preferences);
            setShowDetails(true);
            setIsManaging(true);
            setIsVisible(true);
        };
        window.addEventListener('open-cookie-preferences', open);
        return () => window.removeEventListener('open-cookie-preferences', open);
    }, []);

    const save = (next: CookiePreferences) => {
        savePreferences(next);
        setIsVisible(false);
        setIsManaging(false);
        setDraft(null);
    };
    const handleAcceptAll = () => save({essential: true, analytics: true, thirdParty: true});
    const handleAcceptSelected = () => save(preferences);
    const handleRejectNonEssential = () => save(DEFAULT_COOKIE_PREFERENCES);

    if (!hydrated || !isVisible || (savedPreferences !== null && !isManaging)) return null;

    return (
        <>
            {/* Main Banner */}
            <div className={cn(
                "fixed bottom-bottomnav shell:bottom-0 left-0 right-0 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto p-4 md:p-6",
                "animate-in slide-in-from-bottom duration-500"
            )}>
                <Card className="max-w-5xl mx-auto bg-steel-900/95 backdrop-blur-md border-line-700 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 border border-line-600">
                                    <Cookie className="h-6 w-6 text-info" strokeWidth={1.6}/>
                                </div>
                                <div>
                                    <CardTitle className="font-display font-bold uppercase tracking-tight text-lg text-ink-100">Cookie Preferences</CardTitle>
                                    <CardDescription className="text-ink-400">
                                        We use cookies to enhance your experience
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 shrink-0 -mt-2 -mr-2"
                                onClick={() => setIsVisible(false)}
                            >
                                <X className="h-4 w-4"/>
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <p className="text-sm text-ink-300 leading-relaxed">
                            We use cookies and similar technologies to provide you with the best experience on our
                            website.
                            Some cookies are essential for the site to function, while others help us understand how you
                            use
                            the site so we can improve it. You can customize your preferences below.
                        </p>

                        {!showDetails ? (
                            <Button
                                variant="link"
                                onClick={() => setShowDetails(true)}
                                className="min-h-11 p-0 h-auto text-info hover:text-info-light"
                            >
                                <Settings className="h-4 w-4 mr-2"/>
                                Manage preferences
                            </Button>
                        ) : (
                            <div className="space-y-3 py-2">
                                <Separator className="bg-line-800"/>

                                <div className="space-y-3">
                                    {/* Essential Cookies */}
                                    <div className="flex items-start space-x-3 p-3 bg-steel-800 border border-line-800">
                                        <Checkbox
                                            id="essential"
                                            checked={true}
                                            disabled
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <Label
                                                htmlFor="essential"
                                                className="text-sm font-medium text-ink-200 cursor-not-allowed"
                                            >
                                                Essential Cookies
                                            </Label>
                                            <p className="text-xs text-ink-400">
                                                Required for the website to function. These include session cookies
                                                for authentication and security features.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Analytics Cookies */}
                                    <div className="flex items-start space-x-3 p-3 bg-steel-800 border border-line-800">
                                        <Checkbox
                                            id="analytics"
                                            checked={preferences.analytics}
                                            onCheckedChange={(checked) =>
                                                setDraft({...preferences, analytics: checked === true})
                                            }
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <Label
                                                htmlFor="analytics"
                                                className="text-sm font-medium text-ink-200 cursor-pointer"
                                            >
                                                Analytics Cookies
                                            </Label>
                                            <p className="text-xs text-ink-400">
                                                Help us understand how visitors use our site. All data collected by
                                                Vercel Analytics is anonymized and privacy-focused.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Third-Party Cookies */}
                                    <div className="flex items-start space-x-3 p-3 bg-steel-800 border border-line-800">
                                        <Checkbox
                                            id="thirdParty"
                                            checked={preferences.thirdParty}
                                            onCheckedChange={(checked) =>
                                                setDraft({...preferences, thirdParty: checked === true})
                                            }
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <Label
                                                htmlFor="thirdParty"
                                                className="text-sm font-medium text-ink-200 cursor-pointer"
                                            >
                                                Third-Party Cookies
                                            </Label>
                                            <p className="text-xs text-ink-400">
                                                Set by Google OAuth, Discord OAuth, and YouTube when you use these
                                                services.
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
                                variant="quiet"
                                className="min-h-11 flex-1 sm:flex-initial"
                            >
                                Essential only
                            </Button>
                            {showDetails && (
                                <Button
                                    onClick={handleAcceptSelected}
                                    variant="quiet"
                                    className="min-h-11 flex-1 sm:flex-initial"
                                >
                                    Save preferences
                                </Button>
                            )}
                            <Button
                                onClick={handleAcceptAll}
                                variant="ember"
                                className="min-h-11 flex-1 sm:flex-initial"
                            >
                                Accept all
                            </Button>
                        </div>

                        <Link
                            href="/cookies"
                            prefetch={false}
                            className="text-xs text-ink-500 hover:text-ink-300 text-center sm:text-right"
                        >
                            Cookie Policy →
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

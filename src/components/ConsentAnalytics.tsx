'use client';

import {Suspense, useEffect, useRef} from 'react';
import {useParams, usePathname} from 'next/navigation';
import {computeRoute, inject, pageview} from '@vercel/analytics';
import {SpeedInsights} from '@vercel/speed-insights/next';
import {filterProductEvent} from '@/lib/analytics';
import {filterAnalyticsEvent, isAnalyticsEnabled, useCookiePreferences} from '@/hooks/useCookiePreferences';

function AnalyticsCollection() {
    const {preferences, analyticsInitialized} = useCookiePreferences();
    const pathname = usePathname();
    const params = useParams();
    const route = computeRoute(pathname, Object.fromEntries(Object.entries(params)
        .filter((entry): entry is [string, string | string[]] => entry[1] !== undefined)));
    const lastPath = useRef<string | null>(null);
    const enabled = preferences?.analytics === true;

    useEffect(() => {
        if (!enabled || !isAnalyticsEnabled()) {
            lastPath.current = null;
            return;
        }
        inject({
            framework: 'next',
            disableAutoTrack: true,
            beforeSend: filterProductEvent,
            basePath: process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH,
        });
        // The Next SDK replays its pageview effect in Strict Mode. Own this small effect so
        // a replay does not send a second view, while returning to a route still sends one.
        if (pathname && lastPath.current !== pathname) {
            lastPath.current = pathname;
            pageview({path: pathname, route});
        }
    }, [enabled, pathname, route]);

    // Revocation is enforced by the live beforeSend filter, not by unmounting injected scripts.
    return analyticsInitialized ? <SpeedInsights beforeSend={filterAnalyticsEvent}/> : null;
}

export default function ConsentAnalytics() {
    return <Suspense fallback={null}><AnalyticsCollection/></Suspense>;
}

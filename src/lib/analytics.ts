'use client';

import {track} from '@vercel/analytics';
import {isAnalyticsEnabled} from '@/hooks/useCookiePreferences';

/** Product events must check consent before entering the SDK's deferred queue. */
export function trackAnalyticsEvent(...args: Parameters<typeof track>): void {
    if (isAnalyticsEnabled()) track(...args);
}

'use client';

import {track, type BeforeSendEvent} from '@vercel/analytics';
import {z} from 'zod';
import {filterAnalyticsEvent, isAnalyticsEnabled} from '@/hooks/useCookiePreferences';

/** Bounded values only: never add names, ids, URLs or player-authored content here. */
export const analyticsEventSchema = z.discriminatedUnion('name', [
    z.strictObject({
        name: z.literal('build_saved'),
        properties: z.strictObject({operation: z.enum(['create', 'update'])}),
    }),
    z.strictObject({
        name: z.literal('comparison_shared'),
        properties: z.strictObject({loadout_count: z.number().int().min(1).max(4)}),
    }),
    z.strictObject({
        name: z.literal('task_completed'),
        properties: z.strictObject({kind: z.enum(['standard', 'daily', 'research'])}),
    }),
    z.strictObject({
        name: z.literal('hideout_upgrade_built'),
        // categoryId values in the published hideout data; None is the main floor.
        properties: z.strictObject({room: z.enum(['None', 'Lounge', 'MedicalArea', 'KitchenArea', 'HQPAD'])}),
    }),
]);
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;

/** The SDK attaches the current URL, which can contain an encoded build and its name. */
export function filterProductEvent(event: BeforeSendEvent): BeforeSendEvent | null {
    const allowed = filterAnalyticsEvent(event);
    if (!allowed || allowed.type !== 'event') return allowed;
    try {
        const url = new URL(allowed.url);
        url.search = '';
        url.hash = '';
        return {...allowed, url: url.toString()};
    } catch {
        return null;
    }
}

/** Product events must check consent before entering the SDK's deferred queue. */
export function trackAnalyticsEvent(event: AnalyticsEvent): void {
    if (!isAnalyticsEnabled()) return;
    const parsed = analyticsEventSchema.safeParse(event);
    if (!parsed.success) return;
    try {
        track(parsed.data.name, parsed.data.properties);
    } catch {
        // Telemetry must never turn a successful player action into a failed one.
    }
}

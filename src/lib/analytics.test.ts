import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ROOM_IDS} from '@/app/hideout-upgrades/utils/hideout';
import {MAX_LOADOUTS} from '@/app/combat-sim/utils/loadout';
import {analyticsEventSchema, filterProductEvent, trackAnalyticsEvent, type AnalyticsEvent} from './analytics';

const {track, enabled} = vi.hoisted(() => ({track: vi.fn(), enabled: vi.fn(() => true)}));
vi.mock('@vercel/analytics', () => ({track}));
vi.mock('@/hooks/useCookiePreferences', () => ({
    isAnalyticsEnabled: enabled,
    filterAnalyticsEvent: (event: unknown) => enabled() ? event : null,
}));

beforeEach(() => {track.mockReset(); enabled.mockReturnValue(true);});
afterEach(() => vi.restoreAllMocks());

const events: AnalyticsEvent[] = [
    {name: 'build_saved', properties: {operation: 'create'}},
    {name: 'build_saved', properties: {operation: 'update'}},
    {name: 'comparison_shared', properties: {loadout_count: 2}},
    {name: 'task_completed', properties: {kind: 'standard'}},
    {name: 'task_completed', properties: {kind: 'daily'}},
    {name: 'task_completed', properties: {kind: 'research'}},
    {name: 'hideout_upgrade_built', properties: {room: 'None'}},
];

describe('product event contract', () => {
    it.each(events)('sends only the declared payload: $name $properties', event => {
        trackAnalyticsEvent(event);
        expect(track).toHaveBeenCalledExactlyOnceWith(event.name, event.properties);
    });

    it.each(events)('gates every event at send time: $name $properties', event => {
        enabled.mockReturnValue(false);
        trackAnalyticsEvent(event);
        expect(track).not.toHaveBeenCalled();
        enabled.mockReturnValue(true);
        trackAnalyticsEvent(event);
        enabled.mockReturnValue(false);
        trackAnalyticsEvent(event);
        expect(track).toHaveBeenCalledTimes(1);
    });

    it.each([
        {name: 'unknown', properties: {}},
        {name: 'build_saved', properties: {operation: 'create', name: 'Private build'}},
        {name: 'build_saved', properties: {operation: 'private text'}},
        {name: 'build_saved', properties: {operation: 'create'}, userId: 'persistent-id'},
        {name: 'comparison_shared', properties: {loadout_count: 2, url: 'encoded-build'}},
        ...[0, 5, 1.5, NaN, '2'].map(loadout_count => ({name: 'comparison_shared', properties: {loadout_count}})),
        {name: 'task_completed', properties: {kind: 'user text'}},
        {name: 'hideout_upgrade_built', properties: {room: 'user text'}},
    ])('drops unexpected names, values and properties: %j', event => {
        // Bypass static typing to exercise the runtime boundary.
        trackAnalyticsEvent(event as AnalyticsEvent);
        expect(track).not.toHaveBeenCalled();
    });

    it('keeps room values and the loadout limit aligned with the published domain', () => {
        const rooms = analyticsEventSchema.options[3].shape.properties.shape.room.options;
        expect([...rooms].sort()).toEqual([...ROOM_IDS].sort());
        expect(analyticsEventSchema.safeParse({name: 'comparison_shared', properties: {loadout_count: MAX_LOADOUTS}}).success).toBe(true);
        expect(analyticsEventSchema.safeParse({name: 'comparison_shared', properties: {loadout_count: MAX_LOADOUTS + 1}}).success).toBe(false);
    });

    it('never lets SDK failures break an action', () => {
        track.mockImplementation(() => {throw new Error('unavailable');});
        expect(() => trackAnalyticsEvent(events[0])).not.toThrow();
    });

    it('removes build contents and names from SDK URL metadata without mutating the original', () => {
        const event = {type: 'event' as const, url: 'https://example.test/combat-sim?a0b=encoded&a0n=private#private'};
        expect(filterProductEvent(event)).toEqual({type: 'event', url: 'https://example.test/combat-sim'});
        expect(event.url).toContain('private');
        expect(filterProductEvent({type: 'event', url: 'invalid'})).toBeNull();
        enabled.mockReturnValue(false);
        expect(filterProductEvent(event)).toBeNull();
    });

    it('preserves page views and still filters them after revocation', () => {
        const event = {type: 'pageview' as const, url: 'https://example.test/tasks'};
        expect(filterProductEvent(event)).toBe(event);
        enabled.mockReturnValue(false);
        expect(filterProductEvent(event)).toBeNull();
    });
});

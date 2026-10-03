import type {ReactElement} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {trackAnalyticsEvent} from '@/lib/analytics';
import ShareButton from './ShareButton';

const {track, enabled} = vi.hoisted(() => ({track: vi.fn(), enabled: vi.fn(() => true)}));
vi.mock('@vercel/analytics', () => ({track}));
vi.mock('@/hooks/useCookiePreferences', () => ({isAnalyticsEnabled: enabled}));

// Exercise the actual click handler without mounting a DOM or running its feedback timer.
vi.mock('react', async importOriginal => ({
    ...await importOriginal<typeof import('react')>(),
    useState: () => [false, vi.fn()],
}));

beforeEach(() => {
    vi.useFakeTimers();
    track.mockReset();
    enabled.mockReturnValue(true);
    vi.stubGlobal('alert', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

function click(getShareLink: () => string, onShared = vi.fn()) {
    const button: ReactElement<{onClick: () => Promise<void>}> = ShareButton({
        getShareLink, onShared, title: 'Share setup',
    });
    return button.props.onClick();
}

describe('share success callback', () => {
    it('fires once only after the clipboard accepts the link, with no link argument', async () => {
        const onShared = vi.fn();
        let finish!: () => void;
        const writeText = vi.fn(() => new Promise<void>(resolve => {finish = resolve;}));
        vi.stubGlobal('navigator', {clipboard: {writeText}});
        const result = click(() => 'https://example.test/?private-build', onShared);
        expect(onShared).not.toHaveBeenCalled();
        finish();
        await result;
        expect(onShared).toHaveBeenCalledExactlyOnceWith();
        expect(writeText).toHaveBeenCalledTimes(1);
    });

    it('honors consent revoked while the clipboard write is pending', async () => {
        let finish!: () => void;
        vi.stubGlobal('navigator', {clipboard: {
            writeText: () => new Promise<void>(resolve => {finish = resolve;}),
        }});
        const onShared = vi.fn(() => trackAnalyticsEvent({
            name: 'comparison_shared', properties: {loadout_count: 2},
        }));
        const result = click(() => 'link', onShared);
        enabled.mockReturnValue(false);
        finish();
        await result;
        expect(onShared).toHaveBeenCalledTimes(1);
        expect(track).not.toHaveBeenCalled();
    });

    it.each(['NotAllowedError', 'AbortError'])('does not report rejected/cancelled copies: %s', async name => {
        const onShared = vi.fn();
        vi.stubGlobal('navigator', {clipboard: {writeText: vi.fn().mockRejectedValue(new DOMException('', name))}});
        await click(() => 'link', onShared);
        expect(onShared).not.toHaveBeenCalled();
    });

    it('does not report URL construction failures or an unavailable clipboard', async () => {
        const onShared = vi.fn();
        vi.stubGlobal('navigator', {});
        await click(() => {throw new Error('unavailable');}, onShared);
        await click(() => 'link', onShared);
        expect(onShared).not.toHaveBeenCalled();
    });
});

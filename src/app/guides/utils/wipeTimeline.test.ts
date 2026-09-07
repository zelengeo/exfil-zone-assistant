import { describe, expect, it } from 'vitest';
import {
    differenceInUtcCalendarDays,
    getWipeDurationState,
    LONGEST_COMPLETED_WIPE_DAYS,
    WIPE_PERIODS,
} from './wipeTimeline';

describe('wipe timeline', () => {
    it('calculates every completed period from UTC calendar dates', () => {
        const completedDurations = WIPE_PERIODS
            .filter((period) => period.endDate)
            .map((period) => differenceInUtcCalendarDays(period.startDate, period.endDate!));

        expect(completedDurations).toEqual([126, 154, 88, 120]);
        expect(LONGEST_COMPLETED_WIPE_DAYS).toBe(154);
    });

    it('stays within the reference duration before the historical maximum', () => {
        const duration = getWipeDurationState('2025-04-24', '2025-09-24');

        expect(duration).toEqual({
            days: 153,
            overflowDays: 0,
            progressPercentage: (153 / 154) * 100,
            referenceDays: 154,
            status: 'within-reference',
        });
    });

    it('marks the exact historical maximum without overflow', () => {
        const duration = getWipeDurationState('2025-04-24', '2025-09-25');

        expect(duration.status).toBe('at-reference');
        expect(duration.progressPercentage).toBe(100);
        expect(duration.overflowDays).toBe(0);
    });

    it('clamps the bar and exposes elapsed days after the maximum', () => {
        const duration = getWipeDurationState('2025-04-24', '2025-09-26');

        expect(duration.status).toBe('past-reference');
        expect(duration.days).toBe(155);
        expect(duration.progressPercentage).toBe(100);
        expect(duration.overflowDays).toBe(1);
    });

    it('keeps the real duration for a far-overdue period', () => {
        const duration = getWipeDurationState('2025-04-24', '2026-04-24');

        expect(duration.days).toBe(365);
        expect(duration.overflowDays).toBe(211);
        expect(duration.progressPercentage).toBe(100);
    });
});

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type WipePeriodKind = 'launch' | 'wipe';
export type WipeDurationStatus = 'within-reference' | 'at-reference' | 'past-reference';

export interface WipeSource {
    label: string;
    url: string;
}

interface WipePeriodBase {
    id: string;
    title: string;
    startDate: string;
    additions: readonly string[];
    sources: readonly WipeSource[];
}

export interface LaunchPeriod extends WipePeriodBase {
    kind: 'launch';
    endDate: string;
}

export interface NumberedWipePeriod extends WipePeriodBase {
    kind: 'wipe';
    ordinal: 1 | 2 | 3 | 4;
    endDate?: string;
}

export type WipePeriod = LaunchPeriod | NumberedWipePeriod;

export interface WipeDurationState {
    days: number;
    overflowDays: number;
    progressPercentage: number;
    referenceDays: number;
    status: WipeDurationStatus;
}

export const WIPE_PERIODS: readonly WipePeriod[] = [
    {
        id: 'alpha-launch',
        kind: 'launch',
        title: 'Alpha launch',
        startDate: '2024-12-19',
        endDate: '2025-04-24',
        additions: ['Initial ExfilZone Alpha availability'],
        sources: [
            {
                label: 'Official Steam announcement',
                url: 'https://steamcommunity.com/ogg/2719160/announcements/detail/524204130710847498',
            },
        ],
    },
    {
        id: 'first-wipe',
        kind: 'wipe',
        ordinal: 1,
        title: 'Resort',
        startDate: '2025-04-24',
        endDate: '2025-09-25',
        additions: [
            'Resort deployment zone',
            'Safe Containers',
            'Hideout overhaul',
            'Expanded Tasks and medical system',
        ],
        sources: [
            {
                label: 'First wipe announcement',
                url: 'https://www.contractorsvr.com/single-post/situation-report-exfilzone-wipe-update',
            },
        ],
    },
    {
        id: 'second-wipe',
        kind: 'wipe',
        ordinal: 2,
        title: 'Gunsmith',
        startDate: '2025-09-25',
        endDate: '2025-12-22',
        additions: [
            'Gunsmith system',
            'Smuggling Tunnel',
            'Hideout workshop',
            'Unreal Engine 5 upgrade',
        ],
        sources: [
            {
                label: 'Second wipe target and numbering',
                url: 'https://www.contractorsvr.com/single-post/sitrep-exfilzone-wipe-date-battle-royale-update',
            },
            {
                label: 'Second wipe release',
                url: 'https://www.contractorsvr.com/single-post/sitrep-showdown-massive-update',
            },
        ],
    },
    {
        id: 'third-wipe',
        kind: 'wipe',
        ordinal: 3,
        title: 'Balance and weapons',
        startDate: '2025-12-22',
        endDate: '2026-04-21',
        additions: [
            'SVD, VSS, AS Val, SR-3M and M1928',
            'Physical gunstock calibration',
            'Task and map UI changes',
            'Vendor offer and Task line balancing',
        ],
        sources: [
            {
                label: 'Third wipe announcement',
                url: 'https://www.contractorsvr.com/single-post/sitrep-exfilzone-3rd-wipe-update',
            },
        ],
    },
    {
        id: 'fourth-wipe',
        kind: 'wipe',
        ordinal: 4,
        title: 'PvE and economy',
        startDate: '2026-04-21',
        additions: [
            'Separate PvE progression',
            'Upgraded Scav and PMC AI',
            'Economy overhaul and dynamic weather',
            'Dog tags and new protective gear',
        ],
        sources: [
            {
                label: 'Fourth wipe announcement',
                url: 'https://www.contractorsvr.com/single-post/sitrep-exfilzone-4th-wipe-update-live',
            },
        ],
    },
];

function parseIsoCalendarDate(value: string): number {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        throw new Error(`Expected an ISO calendar date, received "${value}"`);
    }

    const [, year, month, day] = match;
    const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day));

    if (new Date(timestamp).toISOString().slice(0, 10) !== value) {
        throw new Error(`Invalid ISO calendar date "${value}"`);
    }

    return timestamp;
}

export function differenceInUtcCalendarDays(startDate: string, endDate: string): number {
    const days = (parseIsoCalendarDate(endDate) - parseIsoCalendarDate(startDate)) / DAY_IN_MS;

    if (days < 0) {
        throw new Error(`End date ${endDate} precedes start date ${startDate}`);
    }

    return days;
}

export const LONGEST_COMPLETED_WIPE_DAYS = Math.max(
    ...WIPE_PERIODS.flatMap((period) =>
        period.kind === 'wipe' && period.endDate
            ? [differenceInUtcCalendarDays(period.startDate, period.endDate)]
            : [],
    ),
);

export function getWipeDurationState(
    startDate: string,
    endDate: string,
    referenceDays: number = LONGEST_COMPLETED_WIPE_DAYS,
): WipeDurationState {
    if (referenceDays <= 0) {
        throw new Error('Reference duration must be greater than zero');
    }

    const days = differenceInUtcCalendarDays(startDate, endDate);
    const overflowDays = Math.max(days - referenceDays, 0);
    const status: WipeDurationStatus = days < referenceDays
        ? 'within-reference'
        : days === referenceDays
            ? 'at-reference'
            : 'past-reference';

    return {
        days,
        overflowDays,
        progressPercentage: Math.min((days / referenceDays) * 100, 100),
        referenceDays,
        status,
    };
}

export function toUtcIsoCalendarDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

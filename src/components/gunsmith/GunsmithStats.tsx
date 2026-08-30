'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { AssembledDisplay } from '@/lib/gunsmith/assembly';
import { bandFor, type BandedStat, type BandIndex } from '@/lib/gunsmith/bands';
import StatReadout from './StatReadout';

interface GunsmithStatsProps {
    display: AssembledDisplay;
    /** The build these numbers are measured against — the preset, usually. */
    baseline?: AssembledDisplay | null;
    bands: BandIndex;
    weaponClass: string | null;
    className?: string;
}

interface StatSpec {
    key: BandedStat | 'RPM';
    label: string;
    precision: number;
    unit?: string;
    higherIsBetter: boolean;
}

/**
 * The six numbers the in-game gunsmith screen shows, and only those. Nothing here is a wiki
 * invention: muzzle velocity and sound level are not published per build, so they are not shown.
 */
const STATS: StatSpec[] = [
    { key: 'RPM', label: 'Rate of fire', precision: 0, unit: 'rpm', higherIsBetter: true },
    { key: 'ergonomics', label: 'Ergonomics', precision: 0, higherIsBetter: true },
    { key: 'verticalRecoil', label: 'Vertical recoil', precision: 0, higherIsBetter: false },
    { key: 'horizontalRecoil', label: 'Horizontal recoil', precision: 0, higherIsBetter: false },
    { key: 'firingPower', label: 'Firing power', precision: 0, higherIsBetter: true },
    { key: 'spreadMOA', label: 'Spread', precision: 2, unit: 'moa', higherIsBetter: false },
];

export default function GunsmithStats({ display, baseline, bands, weaponClass, className }: GunsmithStatsProps) {
    const peers = weaponClass ? bands.get(weaponClass) : undefined;

    return (
        <div className={cn('grid grid-cols-2 lg:grid-cols-3 gap-2', className)}>
            {STATS.map((stat) => {
                const value = display[stat.key];
                const before = baseline ? baseline[stat.key] : null;
                const delta = typeof value === 'number' && typeof before === 'number' ? value - before : null;
                // RPM describes a gun rather than grading it, so it is deliberately never banded.
                const band = stat.key === 'RPM'
                    ? null
                    : bandFor(bands, weaponClass, stat.key, typeof value === 'number' ? value : null);

                return (
                    <StatReadout
                        key={stat.key}
                        label={stat.label}
                        value={typeof value === 'number' ? value : null}
                        precision={stat.precision}
                        unit={stat.unit}
                        delta={delta}
                        higherIsBetter={stat.higherIsBetter}
                        band={band}
                        note={stat.key === 'RPM' ? 'Descriptive · not ranked' : undefined}
                    />
                );
            })}
            {peers && (
                <p className="col-span-2 lg:col-span-3 micro-label text-ink-700">
                    {`Bands rank each number against the ${peers.ergonomics.length} shipped ${weaponClass?.toLowerCase()} presets.`}
                </p>
            )}
        </div>
    );
}

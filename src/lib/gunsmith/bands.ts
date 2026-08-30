/**
 * Quality bands: is this number good, for this kind of gun?
 *
 * A stat on its own says nothing — 44 ergonomics is poor for a rifle and excellent for an LMG — so
 * every figure is ranked against the guns it competes with. The peer set is the shipped presets of
 * the same class, and the class is the game's own: a receiver's tags carry `GunType.<Class>.<Model>`
 * (Rifle, SMG, DMR, Shotgun, BoltAction, Pistol, LMG), and each preset's `gunsmithDisplay` block is
 * the number the game itself bakes for it. Nothing here is invented or hand-tuned.
 *
 * RPM deliberately has no band. It describes a gun rather than grading it: 600 RPM is not worse
 * than 900, and colouring it would say otherwise.
 */

import type { GunsmithDisplay, Weapon } from '@/types/items';
import type { GunsmithPart } from '@/types/gunsmith';
import { findPart, type PartIndex } from './compatibility';

export type BandedStat = 'ergonomics' | 'verticalRecoil' | 'horizontalRecoil' | 'firingPower' | 'spreadMOA';

/** +1 where more is better, -1 where less is (recoil and spread). */
export const BAND_DIRECTION: Record<BandedStat, 1 | -1> = {
    ergonomics: 1,
    firingPower: 1,
    verticalRecoil: -1,
    horizontalRecoil: -1,
    spreadMOA: -1,
};

export const BAND_TIERS = ['bottom', 'lower', 'upper', 'top'] as const;
export type BandTier = typeof BAND_TIERS[number];

export const BAND_LABELS: Record<BandTier, string> = {
    bottom: 'Bottom 25%',
    lower: 'Lower half',
    upper: 'Upper half',
    top: 'Top 25%',
};

/** Ember for the worst quartile, then warn, info, good — the Cold Steel semantic ramp. */
export const BAND_COLORS: Record<BandTier, string> = {
    bottom: '#FF4A24',
    lower: '#FFB020',
    upper: '#5B8CA8',
    top: '#4ADE80',
};

export interface Band {
    tier: BandTier;
    /** 0-3, matching `BAND_TIERS` — the number of segments to light. */
    index: number;
    label: string;
    color: string;
    /** Where the value sits in its class, 0-1. */
    percentile: number;
    /** How many presets it was ranked against. */
    peers: number;
}

/** `class -> stat -> every shipped value`. */
export type BandIndex = Map<string, Record<BandedStat, number[]>>;

const GUN_TYPE_PREFIX = 'guntype.';

/** The class tag on a receiver, e.g. `GunType.Rifle.AK` -> `Rifle`. */
export function weaponClassOf(receiver: GunsmithPart | undefined): string | null {
    for (const tag of receiver?.compatibility?.tags ?? []) {
        const lowered = tag.toLowerCase();
        if (!lowered.startsWith(GUN_TYPE_PREFIX)) continue;
        const segment = tag.split('.')[1];
        if (segment) return segment;
    }
    return null;
}

const emptyDistribution = (): Record<BandedStat, number[]> => ({
    ergonomics: [],
    firingPower: [],
    verticalRecoil: [],
    horizontalRecoil: [],
    spreadMOA: [],
});

/**
 * Collect the class distributions once, from the presets' own baked stats.
 *
 * A preset with no `gunsmithDisplay`, or whose receiver carries no class tag, contributes nothing —
 * it cannot be ranked and it cannot rank anything else.
 */
export function buildBandIndex(weapons: Weapon[], index: PartIndex): BandIndex {
    const bands: BandIndex = new Map();
    for (const weapon of weapons) {
        const display: GunsmithDisplay | undefined = weapon.gunsmithDisplay;
        if (!display) continue;
        const weaponClass = weaponClassOf(findPart(index, weapon.receiverId));
        if (!weaponClass) continue;
        let distribution = bands.get(weaponClass);
        if (!distribution) {
            distribution = emptyDistribution();
            bands.set(weaponClass, distribution);
        }
        for (const stat of Object.keys(BAND_DIRECTION) as BandedStat[]) {
            const value = display[stat];
            if (typeof value === 'number' && Number.isFinite(value)) distribution[stat].push(value);
        }
    }
    return bands;
}

/** Fewer peers than this and a quartile means nothing, so no band is shown at all. */
const MIN_PEERS = 6;

export function bandFor(
    bands: BandIndex,
    weaponClass: string | null,
    stat: BandedStat,
    value: number | null,
): Band | null {
    if (value === null || !Number.isFinite(value) || !weaponClass) return null;
    const distribution = bands.get(weaponClass)?.[stat];
    if (!distribution || distribution.length < MIN_PEERS) return null;

    const direction = BAND_DIRECTION[stat];
    let beaten = 0;
    let ties = 0;
    for (const peer of distribution) {
        if (peer === value) ties += 1;
        else if (direction < 0 ? peer > value : peer < value) beaten += 1;
    }
    const percentile = (beaten + ties / 2) / distribution.length;
    const index = percentile >= 0.75 ? 3 : percentile >= 0.5 ? 2 : percentile >= 0.25 ? 1 : 0;
    const tier = BAND_TIERS[index];
    return {
        tier,
        index,
        label: BAND_LABELS[tier],
        color: BAND_COLORS[tier],
        percentile,
        peers: distribution.length,
    };
}

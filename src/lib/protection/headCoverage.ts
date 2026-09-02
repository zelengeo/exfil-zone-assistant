import type { FaceShield, Helmet } from '@/types/items';
import type { BodyModel } from './bodyModel';
import {
    GEOMETRY_OVERRIDE_IDS,
    HEAD_ZONE_NAMES,
    headCapsuleOf,
    headPoints,
    prepareRegions,
    protectionAt,
    zoneOfDirection,
    type HeadCapsule,
    type HeadZoneName,
    type PreparedRegion,
    type WornGear,
    type WornSet,
} from './headModel';

/**
 * What a helmet — and the shield clipped to it — actually protects, measured rather than asserted.
 *
 * The head counterpart of `coverage.ts`. This is the one place the decompiled head rule is run: the
 * viewers draw its result and the tables print it, and neither re-derives anything.
 *
 * Route-neutral on purpose. The items route passes one helmet and optionally one shield; the combat
 * simulator can pass a defender's `helmet` + `faceShield` for the same picture without this module
 * learning about either.
 */

/**
 * How thoroughly the head surface is sampled.
 *
 * Area-weighted over the capsule, so a figure is a share of real skin. 16k settles a zone to about
 * ±1%, which is well inside the honesty of the zone boundaries themselves; the extraction repo's
 * probe uses 40k because it is not redrawing on a picker change.
 */
const SAMPLES = 16000;

export interface HeadZoneCoverage {
    zone: HeadZoneName;
    /** Share of that zone's surface a hit on which would be stopped, 0–1. */
    fraction: number;
    /** Samples that landed in the zone — 0 means the zone is not on this head at all. */
    samples: number;
}

/** One authored region and what it means, for the viewer's key. */
export interface WornRegion {
    region: PreparedRegion;
    owner: 'helmet' | 'mask';
    ownerName: string;
    /**
     * What the region *means*: a helmet's regions are holes in its shell, a shield's are the shell,
     * and a shield's reverse regions are holes cut in that. It is a property of the class, never of
     * the struct (docs/HEAD_PROTECTION.md §14.2).
     */
    role: 'hole' | 'armour';
}

export interface HeadCoverage {
    head: HeadCapsule;
    gear: WornSet;
    /** Share of the whole head that is protected, 0–1. */
    total: number;
    zones: HeadZoneCoverage[];
    regions: WornRegion[];
    /** Nothing worn authors any geometry — a night-vision device, or a picker left empty. */
    empty: boolean;
    /** The helmet ignores its own regions and covers the head uniformly (§14.4). */
    overridden: boolean;
    /** A shield with no helmet under it: the owner cast fails and it protects nothing (§14.3). */
    shieldWithoutHelmet: boolean;
}

/** One item as the hit test needs it. Regions are numbered across the worn set, not per item. */
function toWorn(
    item: Helmet | FaceShield | null,
    offset: number,
): WornGear | null {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        regions: prepareRegions(item.stats.coneRegions ?? [], offset),
        overridesGeometry: GEOMETRY_OVERRIDE_IDS.has(item.id),
        armorClass: item.stats.armorClass ?? null,
        bluntDamageScalar: item.stats.bluntDamageScalar ?? null,
    };
}

/**
 * Run the head protection rule for a worn helmet and, optionally, the shield attached to it.
 *
 * Returns null only where the body model carries no head capsule, which would mean the shipped
 * `body-model.json` had changed shape underneath us.
 */
export function headCoverage(
    model: BodyModel,
    helmet: Helmet | null,
    mask: FaceShield | null,
): HeadCoverage | null {
    const head = headCapsuleOf(model);
    if (!head) return null;

    const wornHelmet = toWorn(helmet, 0);
    const wornMask = toWorn(mask, helmet?.stats.coneRegions?.length ?? 0);
    const gear: WornSet = { helmet: wornHelmet, mask: wornMask };

    const points = headPoints(head, SAMPLES);
    const zones = points.map((p) => zoneOfDirection(p.dir));

    const zoneTotals = new Map<string, number>();
    for (const zone of zones) zoneTotals.set(zone, (zoneTotals.get(zone) ?? 0) + 1);

    const worn = [wornHelmet, wornMask].filter((g): g is WornGear => g !== null);
    const regionList = worn.flatMap((g): WornRegion[] =>
        g.regions.map((region) => ({
            region,
            owner: g === wornHelmet ? 'helmet' : 'mask',
            ownerName: g.name,
            role: g === wornHelmet || region.reverse ? 'hole' : 'armour',
        })),
    );

    const zoneHits = new Map<string, number>();
    let protectedCount = 0;

    for (let i = 0; i < points.length; i++) {
        if (!protectionAt(points[i].point, gear).protected) continue;
        protectedCount += 1;
        zoneHits.set(zones[i], (zoneHits.get(zones[i]) ?? 0) + 1);
    }

    return {
        head,
        gear,
        total: protectedCount / points.length,
        zones: HEAD_ZONE_NAMES.map((name): HeadZoneCoverage => {
            const total = zoneTotals.get(name) ?? 0;
            return {
                zone: name,
                fraction: total ? (zoneHits.get(name) ?? 0) / total : 0,
                samples: total,
            };
        }),
        regions: regionList,
        empty: worn.length === 0,
        overridden: Boolean(wornHelmet?.overridesGeometry),
        shieldWithoutHelmet: Boolean(wornMask && !wornHelmet),
    };
}

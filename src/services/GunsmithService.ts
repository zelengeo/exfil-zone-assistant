/**
 * Loading the gunsmith's data: the part graph, the shipped presets, and the class distributions
 * the quality bands are ranked against.
 *
 * Two files, because the game splits one pool across them. `gunsmith-parts.json` holds the 651
 * parts of the gunsmith proper, with their compatibility tags. The rail attachments — optics,
 * magnifiers, foregrips, lasers, flip-up irons — live in `attachments.json` instead and carry no
 * compatibility block at all, so they are adapted into the same shape here with an empty graph,
 * which is what makes them universal (see `compatibility.ts`).
 *
 * Cached at module scope like `ItemService`: the data is static per deployment, and both the
 * gunsmith route and the weapon detail page read it. The files come through `loadDataFile`, which
 * keeps them static assets rather than letting the bundler inline them into a client chunk.
 */

import type { GunsmithPart, PartCompatibility } from '@/types/gunsmith';
import type { Weapon } from '@/types/items';
import { loadDataFile } from '@/services/dataFiles';
import { indexParts, type PartIndex } from '@/lib/gunsmith/compatibility';
import { buildBandIndex, type BandIndex } from '@/lib/gunsmith/bands';

export interface GunsmithData {
    index: PartIndex;
    /** The shipped presets, receiver-first — a build always starts from one of these. */
    presets: Weapon[];
    bands: BandIndex;
}

let cache: GunsmithData | null = null;
let inFlight: Promise<GunsmithData> | null = null;

const EMPTY_COMPATIBILITY: PartCompatibility = {
    installsOn: [],
    provides: [],
    requiresPartTypes: [],
    tags: [],
};

/** `gunsmith.20rail.sight.ocp7` -> `sight`. The third segment is the slot family. */
function slotFromGameId(gameId: string): string {
    const segments = gameId.split('.');
    return (segments[2] || '').toLowerCase();
}

interface RawAttachment {
    id: string;
    gameId?: string;
    name: string;
    description?: string;
    category?: string;
    subcategory?: string;
    images?: { icon?: string; thumbnail?: string; fullsize?: string };
    stats?: Record<string, unknown>;
}

/**
 * Adapt one `attachments.json` row into a gun part.
 *
 * Only rows carrying a gunsmith id are gun parts; the other 45 are the legacy attachment entries
 * that predate the gunsmith system and have no place in a build.
 */
function adaptAttachment(raw: RawAttachment): GunsmithPart | null {
    if (!raw.gameId) return null;
    const stats = raw.stats ?? {};
    return {
        id: raw.id,
        gameId: raw.gameId,
        name: raw.name,
        description: raw.description,
        category: raw.category ?? 'attachments',
        subcategory: raw.subcategory ?? 'Attachments',
        slot: slotFromGameId(raw.gameId),
        partType: null,
        images: {
            icon: raw.images?.icon ?? '/images/items/placeholder.webp',
            thumbnail: raw.images?.thumbnail,
            fullsize: raw.images?.fullsize,
        },
        stats: {
            weight: typeof stats.weight === 'number' ? stats.weight : 0,
            rarity: typeof stats.rarity === 'string' ? stats.rarity : 'Common',
            attachmentModifier: (stats.attachmentModifier as GunsmithPart['stats']['attachmentModifier']) ?? {},
            partMOA: typeof stats.partMOA === 'number' ? stats.partMOA : null,
            basePrice: typeof stats.basePrice === 'number' ? stats.basePrice : undefined,
            buyOffers: (stats.buyOffers as GunsmithPart['stats']['buyOffers']) ?? [],
        },
        compatibility: EMPTY_COMPATIBILITY,
    };
}

async function load(): Promise<GunsmithData> {
    const [rawParts, rawAttachments, rawWeapons] = await Promise.all([
        loadDataFile<GunsmithPart[]>('gunsmith-parts.json'),
        loadDataFile<RawAttachment[]>('attachments.json'),
        loadDataFile<Weapon[]>('weapons.json'),
    ]);

    const parts = rawParts ?? [];
    const attachments = (rawAttachments ?? [])
        .map(adaptAttachment)
        .filter((part): part is GunsmithPart => part !== null);

    // Gun parts first: the 26 shared muzzles and mounts exist in both files with different
    // numbers, and a preset is assembled from the gun-part copy.
    const index = indexParts(parts, attachments);

    const presets = (rawWeapons ?? [])
        .filter((weapon) => Boolean(weapon.receiverId && weapon.parts?.length));

    return { index, presets, bands: buildBandIndex(presets, index) };
}

export async function getGunsmithData(): Promise<GunsmithData> {
    if (cache) return cache;
    if (!inFlight) {
        inFlight = load().then((data) => {
            cache = data;
            inFlight = null;
            return data;
        }).catch((error) => {
            inFlight = null;
            throw error;
        });
    }
    return inFlight;
}

/** For tests and for the one place that needs to force a reload. */
export function clearGunsmithCache(): void {
    cache = null;
    inFlight = null;
}

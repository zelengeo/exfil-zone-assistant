/**
 * What the attacker brings: a build and a round.
 *
 * The simulator used to take a `Weapon` off the shelf. A gun in this game is not an item, it is a
 * *build* — one receiver plus a list of parts — and `src/lib/gunsmith` already assembles one. So
 * this module owns nothing about assembly; it turns the three things a reader can arrive with (a
 * shipped preset, one of their own saved builds, a shared link) into the same shape, and says
 * plainly which of the assembled figures the damage model actually reads.
 *
 * **Two of six reach the sim.** `firingPower` scales damage, once, as `0.9 + 0.2 × fp`; `fireRate`
 * turns shots into seconds. Ergonomics and ADS speed reach nothing at all. Spread and the two
 * recoil axes reach only the spray estimate in `spray.ts` — which is the first time a compensator
 * has moved a number on this page.
 *
 * Ammunition sits beside the build rather than in it: a build carries a magazine, never a round.
 */

import type { Ammunition, Weapon } from '@/types/items';
import type { GunsmithPart, SavedBuild } from '@/types/gunsmith';
import type { PartIndex } from '@/lib/gunsmith/compatibility';
import {
    assembleBuild,
    decodeBuild,
    encodeBuild,
    presetToFitted,
    savedToFitted,
    type AssembledBuild,
    type FittedMap,
} from '@/lib/gunsmith/build';
import { findPart } from '@/lib/gunsmith/compatibility';

/** Where a loadout came from, which is what the share link has to be able to rebuild. */
export type LoadoutSource =
    | { kind: 'preset'; presetId: string }
    | { kind: 'build'; savedId?: string };

export interface Loadout {
    /** Slot, `0` to `3`. Stable while the reader swaps guns in it. */
    id: string;
    name: string;
    source: LoadoutSource;
    receiver: GunsmithPart;
    fitted: FittedMap;
    build: AssembledBuild;
    ammo: Ammunition | null;
}

/** The four slots, and the order they are offered in. */
export const MAX_LOADOUTS = 4;

/** Opened on nothing in particular, the route starts here — the gunsmith's own default. */
export const DEFAULT_PRESET_ID = 'weapon-ak74n-factory';

/** A build and a round agree when their calibres do. An empty slot is not a disagreement. */
export function ammoFits(loadout: Loadout): boolean {
    if (!loadout.ammo) return false;
    const caliber = loadout.build.sim.caliber;
    if (!caliber) return true;
    return caliber === loadout.ammo.stats.caliber;
}

/** A loadout the engine can run: it has a round, and the round fits. */
export function isReady(loadout: Loadout): boolean {
    return ammoFits(loadout);
}

export function loadoutFromPreset(
    id: string,
    preset: Weapon,
    index: PartIndex,
    ammo: Ammunition | null,
): Loadout | null {
    const receiver = findPart(index, preset.receiverId);
    if (!receiver) return null;
    const fitted = presetToFitted(preset, index);
    return {
        id,
        name: preset.name,
        source: { kind: 'preset', presetId: preset.id },
        receiver,
        fitted,
        build: assembleBuild(receiver, fitted, index),
        ammo,
    };
}

export function loadoutFromSaved(
    id: string,
    saved: SavedBuild,
    index: PartIndex,
    ammo: Ammunition | null,
): Loadout | null {
    const receiver = findPart(index, saved.receiverId);
    if (!receiver) return null;
    const fitted = savedToFitted(saved, index);
    return {
        id,
        name: saved.name,
        source: { kind: 'build', savedId: saved.id },
        receiver,
        fitted,
        build: assembleBuild(receiver, fitted, index),
        ammo,
    };
}

/** A shared link's `b` parameter, restored. Null when the receiver no longer exists. */
export function loadoutFromEncoded(
    id: string,
    encoded: string,
    name: string | null,
    index: PartIndex,
    ammo: Ammunition | null,
): Loadout | null {
    const decoded = decodeBuild(encoded, index);
    if (!decoded) return null;
    return {
        id,
        name: name || `${decoded.receiver.name} (shared)`,
        source: { kind: 'build' },
        receiver: decoded.receiver,
        fitted: decoded.fitted,
        build: assembleBuild(decoded.receiver, decoded.fitted, index),
        ammo,
    };
}

/** The `b` parameter for a loadout that is not a shipped preset. */
export function encodeLoadout(loadout: Loadout): string {
    return encodeBuild(loadout.receiver, loadout.fitted);
}

/** The bench, opened on this exact gun. The simulator never edits a build itself. */
export function gunsmithLink(loadout: Loadout): string {
    const params = new URLSearchParams({ b: encodeLoadout(loadout), n: loadout.name });
    return `/gunsmith?${params.toString()}`;
}

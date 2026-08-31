/**
 * A build, and the four things you can do to one: fit a part, clear a slot, load a preset, and
 * assemble the result.
 *
 * A build is stored flat — `slotId -> gameId` — rather than as a tree, because the tree is
 * derived (see `compatibility.ts`) and re-derived on every change. Storing the tree would mean
 * storing a shape that the data, not the build, owns.
 *
 * Everything here is pure: no React, no storage, no fetching. The route's hook and the weapon
 * page's read-only view both drive the same functions.
 */

import type { GunsmithPart, SavedBuild } from '@/types/gunsmith';
import type { Weapon } from '@/types/items';
import {
    findPart,
    parseUniversalSlotId,
    universalKindOf,
    universalSlotId,
    walkBuild,
    type BuildSlot,
    type PartIndex,
    type UniversalSlotKind,
} from './compatibility';
import { assembleGun, type AssembledGun, type BuildEntry } from './assembly';

/** `slotId -> gameId`. Immutable by convention: every operation returns a new map. */
export type FittedMap = Map<string, string>;

const lower = (value: string | null | undefined): string => String(value ?? '').toLowerCase();

/** A rail attachment sits outside the tree, so its slot id is checked by shape, not by lookup. */
function isUniversalSlot(slotId: string): boolean {
    return parseUniversalSlotId(slotId) !== null;
}

/**
 * Drop anything that no longer has a home.
 *
 * Swapping a rail-integrated dust cover for a plain one takes its top mount slot away with it, and
 * the optic that was in that mount has to go too — otherwise it would keep contributing its
 * modifiers to a gun that cannot carry it.
 */
export function pruneOrphans(receiver: GunsmithPart, fitted: FittedMap, index: PartIndex): FittedMap {
    const live = new Set(walkBuild(receiver, fitted, index).map((slot) => slot.id));
    const next: FittedMap = new Map();
    for (const [slotId, gameId] of fitted) {
        if (isUniversalSlot(slotId) || live.has(slotId)) next.set(slotId, gameId);
    }
    return next;
}

/** Fit `part` into `slotId`, replacing whatever was there. */
export function fitPart(
    receiver: GunsmithPart,
    fitted: FittedMap,
    slotId: string,
    part: GunsmithPart,
    index: PartIndex,
): FittedMap {
    const next = new Map(fitted);
    next.set(slotId, lower(part.gameId));
    return pruneOrphans(receiver, next, index);
}

/** Empty `slotId`. */
export function clearSlot(receiver: GunsmithPart, fitted: FittedMap, slotId: string, index: PartIndex): FittedMap {
    const next = new Map(fitted);
    next.delete(slotId);
    return pruneOrphans(receiver, next, index);
}

/** Every rail attachment on the build, in kind order, with its slot id. */
export interface UniversalEntry {
    slotId: string;
    kind: UniversalSlotKind;
    ordinal: number;
    part: GunsmithPart;
}

export function universalEntries(fitted: FittedMap, index: PartIndex): UniversalEntry[] {
    const entries: UniversalEntry[] = [];
    for (const [slotId, gameId] of fitted) {
        const parsed = parseUniversalSlotId(slotId);
        if (!parsed) continue;
        const part = findPart(index, gameId);
        if (!part) continue;
        entries.push({ slotId, kind: parsed.kind, ordinal: parsed.ordinal, part });
    }
    return entries.sort((a, b) => a.kind.localeCompare(b.kind) || a.ordinal - b.ordinal);
}

/** The next free slot id for a kind of rail attachment — a build may carry several of each. */
export function nextUniversalSlotId(fitted: FittedMap, kind: UniversalSlotKind): string {
    let ordinal = 0;
    while (fitted.has(universalSlotId(kind, ordinal))) ordinal += 1;
    return universalSlotId(kind, ordinal);
}

/** The build as `assembleGun` wants it: the receiver first, then every fitted part. */
export function buildEntries(receiver: GunsmithPart, fitted: FittedMap, index: PartIndex): BuildEntry[] {
    const entries: BuildEntry[] = [{ part: receiver }];
    for (const gameId of fitted.values()) {
        const part = findPart(index, gameId);
        if (part) entries.push({ part });
    }
    return entries;
}

export interface AssembledBuild extends AssembledGun {
    receiver: GunsmithPart;
    slots: BuildSlot[];
    universal: UniversalEntry[];
    parts: GunsmithPart[];
}

export function assembleBuild(receiver: GunsmithPart, fitted: FittedMap, index: PartIndex): AssembledBuild {
    const entries = buildEntries(receiver, fitted, index);
    const assembled = assembleGun(receiver.stats.gunData ?? null, entries);
    return {
        ...assembled,
        receiver,
        slots: walkBuild(receiver, fitted, index),
        universal: universalEntries(fitted, index),
        parts: entries.map((entry) => entry.part),
    };
}

/**
 * Place a bare list of parts onto a receiver.
 *
 * Neither a preset nor a shared link says which slot a part sits in — both are just a list of
 * gunsmith ids — so each one is placed by walking the tree and taking the first slot it is a
 * candidate for. Placing is iterative because fitting one part can open the slot the next one
 * needs: a muzzle adapter has to be on before its suppressor has anywhere to go.
 *
 * Rail attachments are not in the tree and go to the open-ended list instead, in the order given,
 * so a link carrying two optics restores both.
 */
export function placeParts(receiver: GunsmithPart, gameIds: string[], index: PartIndex): FittedMap {
    const fitted: FittedMap = new Map();
    const wanted = new Set(
        gameIds
            .map(lower)
            .filter((id) => id && !id.startsWith('bullet.') && id !== lower(receiver.gameId)),
    );

    let progressed = true;
    while (progressed) {
        progressed = false;
        for (const slot of walkBuild(receiver, fitted, index)) {
            if (fitted.has(slot.id)) continue;
            const match = slot.candidates.find((candidate) => wanted.has(lower(candidate.gameId)));
            if (!match) continue;
            fitted.set(slot.id, lower(match.gameId));
            wanted.delete(lower(match.gameId));
            progressed = true;
        }
    }

    // Whatever is left is a rail attachment — or a part whose mounting the game does not publish.
    for (const gameId of gameIds.map(lower)) {
        if (!wanted.has(gameId)) continue;
        const part = findPart(index, gameId);
        const kind = part ? universalKindOf(part) : null;
        if (!kind) continue;
        fitted.set(nextUniversalSlotId(fitted, kind), gameId);
        wanted.delete(gameId);
    }

    return fitted;
}

/** Turn a shipped preset into a build. Its ammunition line is not a gun part and is skipped. */
export function presetToFitted(weapon: Weapon, index: PartIndex): FittedMap {
    const receiver = findPart(index, weapon.receiverId);
    if (!receiver) return new Map();
    return placeParts(receiver, (weapon.parts ?? []).map((entry) => entry.sellId), index);
}

/** A saved build, restored. Unknown parts are dropped rather than failing the whole build. */
export function savedToFitted(saved: SavedBuild, index: PartIndex): FittedMap {
    const fitted: FittedMap = new Map();
    for (const entry of saved.parts) {
        if (findPart(index, entry.gameId)) fitted.set(entry.slotId, lower(entry.gameId));
    }
    return fitted;
}

export function fittedToSavedParts(fitted: FittedMap): SavedBuild['parts'] {
    return [...fitted.entries()].map(([slotId, gameId]) => ({ slotId, gameId }));
}

/* -------------------------------------------------------------------------
 * Sharing a build as a link
 *
 * A wiki lives on links, so a build has to survive being pasted into Discord. The URL carries the
 * receiver and the parts as gunsmith ids with their common `gunsmith.` prefix dropped, and nothing
 * else: no slot ids, because those are derived and would go stale the moment the part graph
 * changes, and no saved-build id, because the recipient does not have your localStorage.
 * ---------------------------------------------------------------------- */

const SHARE_PREFIX = 'gunsmith.';
const SHARE_SEPARATOR = '~';

const shortId = (gameId: string): string =>
    (gameId.startsWith(SHARE_PREFIX) ? gameId.slice(SHARE_PREFIX.length) : gameId);

const longId = (short: string): string =>
    (short.includes('.') && !short.startsWith(SHARE_PREFIX) ? `${SHARE_PREFIX}${short}` : short);

/** The `b` query parameter: receiver first, then every fitted part in bench order. */
export function encodeBuild(receiver: GunsmithPart, fitted: FittedMap): string {
    return [lower(receiver.gameId), ...fitted.values()]
        .map(shortId)
        .join(SHARE_SEPARATOR);
}

export interface DecodedBuild {
    receiver: GunsmithPart;
    fitted: FittedMap;
    /** Ids in the link that no longer exist in the data — worth telling the reader about. */
    unknown: string[];
}

/** Read a `b` parameter back. Returns null when the receiver itself cannot be resolved. */
export function decodeBuild(value: string, index: PartIndex): DecodedBuild | null {
    const ids = value.split(SHARE_SEPARATOR).map((part) => longId(lower(part.trim()))).filter(Boolean);
    if (!ids.length) return null;

    const receiver = findPart(index, ids[0]);
    if (!receiver || !receiver.stats.gunData) return null;

    const rest = ids.slice(1);
    const unknown = rest.filter((id) => !findPart(index, id));
    return { receiver, fitted: placeParts(receiver, rest, index), unknown };
}

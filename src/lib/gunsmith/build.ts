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
 * Turn a shipped preset into a build.
 *
 * The preset lists its parts by gunsmith id and says nothing about slots, so each one is placed by
 * walking the tree and taking the slot it is a candidate for. Rail attachments are not in the tree
 * and go to the open-ended list instead; the preset's ammunition line (`bullet.*`) is not a gun
 * part and is skipped.
 */
export function presetToFitted(weapon: Weapon, index: PartIndex): FittedMap {
    const receiver = findPart(index, weapon.receiverId);
    const fitted: FittedMap = new Map();
    if (!receiver) return fitted;

    const wanted = new Set(
        (weapon.parts ?? [])
            .map((entry) => lower(entry.sellId))
            .filter((id) => id && !id.startsWith('bullet.') && id !== lower(weapon.receiverId)),
    );

    // Structural parts, breadth-first: placing one can open the slot the next one needs.
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
    for (const gameId of wanted) {
        const part = findPart(index, gameId);
        if (!part) continue;
        const kind = universalKindOf(part);
        if (!kind) continue;
        fitted.set(nextUniversalSlotId(fitted, kind), gameId);
    }

    return fitted;
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

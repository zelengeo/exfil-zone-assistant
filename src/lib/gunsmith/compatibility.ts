/**
 * The gunsmith's compatibility graph: which part goes where.
 *
 * The game publishes the graph as two tag lists per part and no slot table at all, so the slots a
 * build shows are **derived**, not enumerated:
 *
 *   - `installsOn` names the parents a part bolts onto, matched as a **prefix** — the tag
 *     `GunSmith.AK.LowerReceiver` covers every `gunsmith.ak.lowerreceiver.*`. That edge, inverted,
 *     is what gives a fitted part its child slots: a slot exists because something can fill it.
 *   - `provides` names the slot tags a part can occupy, spelled `GunSmithSlot.<Host>.<Slot>`. The
 *     last segment is the slot's identity and is what candidates are grouped by, because the host
 *     segment varies for one physical slot (an AK muzzle is `Barrel.AK100Muzzle` on one parent and
 *     `Adapter.AK100Muzzle` on another).
 *
 * Checked against the shipped presets: every structural part of 134/134 presets lands in exactly
 * one derived slot, with no two parts competing for the same one.
 *
 * The exception is the **universal rail attachments** — optics, magnifiers, foregrips, lasers,
 * flip-up irons — which publish an empty `installsOn`. Nothing in the extracted data says which
 * rail on which gun accepts them, so they are not part of the tree: they hang off the build as an
 * open-ended list (`universalSlots`), which is also what the game allows, since a long-range and a
 * close-range optic can be mounted at once. There is therefore no fixed slot count for a build.
 */

import type { GunsmithPart } from '@/types/gunsmith';

const lower = (value: string | null | undefined): string => String(value ?? '').toLowerCase();

/** The tail of a `GunSmithSlot.<Host>.<Slot>` tag — the slot's identity. */
const slotLeaf = (tag: string): string => lower(tag.split('.').pop());

/** The host of a `GunSmithSlot.<Host>.<Slot>` tag — the part role that carries the slot. */
const slotHost = (tag: string): string => lower(tag.split('.')[1]);

export interface PartIndex {
    all: GunsmithPart[];
    byGameId: Map<string, GunsmithPart>;
    /** The 61 parts that carry `stats.gunData` — a build's root is always one of these. */
    receivers: GunsmithPart[];
    /** Rail attachments: everything that names no parent. See the note at the top of the file. */
    universal: GunsmithPart[];
}

export function isReceiver(part: GunsmithPart): boolean {
    return Boolean(part.stats?.gunData);
}

export function isUniversalAttachment(part: GunsmithPart): boolean {
    return !isReceiver(part) && (part.compatibility?.installsOn?.length ?? 0) === 0;
}

/**
 * Index a mixed pool of parts by their gunsmith id.
 *
 * Earlier lists win a collision, so pass `gunsmith-parts.json` first: the 26 shared muzzles and
 * mounts exist in both files with different numbers, and a preset is assembled from the gun-part
 * copy.
 */
export function indexParts(...lists: GunsmithPart[][]): PartIndex {
    const byGameId = new Map<string, GunsmithPart>();
    const all: GunsmithPart[] = [];
    for (const list of lists) {
        for (const part of list) {
            const key = lower(part.gameId);
            if (!key || byGameId.has(key)) continue;
            byGameId.set(key, part);
            all.push(part);
        }
    }
    return {
        all,
        byGameId,
        receivers: all.filter(isReceiver),
        universal: all.filter(isUniversalAttachment),
    };
}

export function findPart(index: PartIndex, gameId: string | null | undefined): GunsmithPart | undefined {
    return index.byGameId.get(lower(gameId));
}

/** Does `child` bolt onto `parent`? `installsOn` tags are prefixes, not exact ids. */
export function installsOn(child: GunsmithPart, parent: GunsmithPart): boolean {
    const parentId = lower(parent.gameId);
    const tags = child.compatibility?.installsOn ?? [];
    return tags.some((tag) => {
        const t = lower(tag);
        return parentId === t || parentId.startsWith(`${t}.`);
    });
}

/**
 * The roles a part plays as a slot host, used to pick which of a child's `provides` tags applies
 * here. A pistol grip that can sit on a lower receiver *or* on a gas block publishes both tags;
 * only the one whose host matches this parent is the slot it fills on this gun.
 */
function hostRoles(part: GunsmithPart): Set<string> {
    const roles = new Set<string>();
    if (part.partType) roles.add(lower(part.partType));
    if (part.slot) roles.add(lower(part.slot));
    for (const tag of part.compatibility?.tags ?? []) {
        for (const segment of tag.split('.')) roles.add(lower(segment));
    }
    return roles;
}

/** Which slot on `parent` does `child` fill? */
export function resolveSlotKey(parent: GunsmithPart, child: GunsmithPart): string {
    const provides = child.compatibility?.provides ?? [];
    if (provides.length === 0) return lower(child.slot || child.partType || 'part');
    if (provides.length === 1) return slotLeaf(provides[0]);
    const roles = hostRoles(parent);
    const matched = provides.find((tag) => roles.has(slotHost(tag)));
    return slotLeaf(matched ?? provides[0]);
}

/**
 * Slot display names. The keys are the game's own slot-tag tails, several of which are physical
 * measurements (a gas block is named by its length in millimetres) or platform-specific spellings
 * of one common slot (`ak100muzzle`, `akmmuzzle`, `mp5muzzle` are all the muzzle).
 */
const SLOT_LABELS: Record<string, string> = {
    upperreceiver: 'Dust cover / upper',
    handguard: 'Handguard',
    handguardrail: 'Handguard rail',
    barrel: 'Barrel',
    stock: 'Stock',
    arstock: 'Stock',
    picstock: 'Stock adapter',
    arbuffer: 'Buffer tube',
    pistolgrip: 'Pistol grip',
    foregrip: 'Foregrip',
    clip: 'Magazine',
    muzzle: 'Muzzle',
    ak100muzzle: 'Muzzle',
    akmmuzzle: 'Muzzle',
    malyukmuzzle: 'Muzzle',
    mp5muzzle: 'Muzzle',
    sksmuzzle: 'Muzzle',
    akmadapter: 'Muzzle adapter',
    suppressor: 'Suppressor',
    mount: 'Mount',
    upmount: 'Top mount',
    upmiddlemount: 'Middle mount',
    aksiderail: 'Side rail mount',
    sksmount: 'Side rail mount',
    frontrail: 'Front rail',
    rail: 'Rail',
    deepslot: 'Rail slot',
    middleslot: 'Rail slot',
    rearsight: 'Rear sight',
    frontsight: 'Front sight',
    sight: 'Optic',
    tactical: 'Tactical',
    sling: 'Sling',
    '180': 'Gas block',
    '255': 'Gas block',
    '368': 'Gas block',
    '508': 'Gas block',
    '180sight': 'Gas block sight',
    '255sight': 'Gas block sight',
    '368sight': 'Gas block sight',
    '508sight': 'Gas block sight',
};

export function slotLabel(key: string): string {
    const known = SLOT_LABELS[key];
    if (known) return known;
    return key.charAt(0).toUpperCase() + key.slice(1);
}

/** One slot on one parent, with everything that could fill it. */
export interface DerivedSlot {
    /** `<parentGameId>/<slotKey>` — stable, and what a fitted part records. */
    id: string;
    key: string;
    label: string;
    parentGameId: string;
    /** 0 for a slot on the receiver, 1 for a slot on a part fitted into one, and so on. */
    depth: number;
    /**
     * The receiver declares an `EGunSmithPartType` bit set of the parts it cannot work without.
     * Everything else — optics, lasers, foregrips, muzzle devices — is optional.
     */
    required: boolean;
    candidates: GunsmithPart[];
}

/** Every slot `parent` opens, in a stable order. */
export function slotsOn(parent: GunsmithPart, index: PartIndex, receiver: GunsmithPart, depth: number): DerivedSlot[] {
    const required = new Set((receiver.compatibility?.requiresPartTypes ?? []).map(lower));
    const groups = new Map<string, GunsmithPart[]>();
    for (const candidate of index.all) {
        if (!installsOn(candidate, parent)) continue;
        const key = resolveSlotKey(parent, candidate);
        const bucket = groups.get(key);
        if (bucket) bucket.push(candidate);
        else groups.set(key, [candidate]);
    }
    return [...groups.entries()]
        .map(([key, candidates]) => ({
            id: `${lower(parent.gameId)}/${key}`,
            key,
            label: slotLabel(key),
            parentGameId: lower(parent.gameId),
            depth,
            required: candidates.some((c) => required.has(lower(c.partType))),
            candidates: [...candidates].sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => Number(b.required) - Number(a.required) || a.label.localeCompare(b.label));
}

/** A slot plus whatever is currently in it. */
export interface BuildSlot extends DerivedSlot {
    fitted: GunsmithPart | null;
}

/**
 * Walk the whole build depth-first: a slot, then the slots the part in it opens, then the next
 * slot. A build's slot count is therefore a property of the parts fitted, not a fixed number —
 * a rail-integrated dust cover adds a top mount that a plain one does not.
 */
export function walkBuild(
    receiver: GunsmithPart,
    fitted: Map<string, string>,
    index: PartIndex,
): BuildSlot[] {
    const out: BuildSlot[] = [];
    const visited = new Set<string>([lower(receiver.gameId)]);

    const descend = (parent: GunsmithPart, depth: number): void => {
        for (const slot of slotsOn(parent, index, receiver, depth)) {
            const fittedId = fitted.get(slot.id);
            const part = fittedId ? findPart(index, fittedId) ?? null : null;
            out.push({ ...slot, fitted: part });
            if (part && !visited.has(lower(part.gameId))) {
                visited.add(lower(part.gameId));
                descend(part, depth + 1);
            }
        }
    };

    descend(receiver, 0);
    return out;
}

/**
 * The kinds of universal rail attachment, in the order a build shows them. The key is the part's
 * own slot family, which the gunsmith id spells out (`gunsmith.20rail.sight.ocp7`).
 */
export const UNIVERSAL_SLOT_KINDS = ['sight', 'mount', 'foregrip', 'tactical', 'rearsight', 'frontsight'] as const;
export type UniversalSlotKind = typeof UNIVERSAL_SLOT_KINDS[number];

export const UNIVERSAL_SLOT_LABELS: Record<UniversalSlotKind, string> = {
    sight: 'Optic',
    mount: 'Riser / rail mount',
    foregrip: 'Foregrip',
    tactical: 'Laser / light',
    rearsight: 'Rear sight (flip-up)',
    frontsight: 'Front sight (flip-up)',
};

export function universalKindOf(part: GunsmithPart): UniversalSlotKind | null {
    const slot = lower(part.slot) as UniversalSlotKind;
    return (UNIVERSAL_SLOT_KINDS as readonly string[]).includes(slot) ? slot : null;
}

/** Candidates for one kind of rail attachment. */
export function universalCandidates(index: PartIndex, kind: UniversalSlotKind): GunsmithPart[] {
    return index.universal
        .filter((part) => universalKindOf(part) === kind)
        .sort((a, b) => a.name.localeCompare(b.name));
}

/** A rail attachment's slot id. The trailing index is what lets a build carry two optics. */
export function universalSlotId(kind: UniversalSlotKind, ordinal: number): string {
    return `rail/${kind}/${ordinal}`;
}

export function parseUniversalSlotId(slotId: string): { kind: UniversalSlotKind; ordinal: number } | null {
    const match = /^rail\/([a-z]+)\/(\d+)$/.exec(slotId);
    if (!match) return null;
    const kind = match[1] as UniversalSlotKind;
    if (!(UNIVERSAL_SLOT_KINDS as readonly string[]).includes(kind)) return null;
    return { kind, ordinal: Number(match[2]) };
}

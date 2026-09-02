import { tasksData } from '@/data/tasks';
import { getVendor, type Vendor } from '@/lib/vendors';
import { VENDOR_ORDER, type VendorKey } from '@/types/trade';
import type { Task } from '@/types/tasks';

/**
 * Who owns a chain.
 *
 * Almost always a vendor, and `@/lib/vendors` already describes those — this module exists for the
 * one case it cannot: the eight daily contracts carry an empty `corpId`, belong to nobody, and were
 * silently dropped by the old route because it iterated `corps` and they matched no entry. Rather
 * than special-case them at every call site, they get a synthetic owner and travel with the rest.
 *
 * Dailies are not a vendor in any other sense: no reputation, no loyalty levels, no portrait, and —
 * having no prerequisites at all — no chain. `hasReputation` and `hasChain` are how a caller asks,
 * instead of testing the key.
 */

export const DAILY_OWNER = 'daily';

export type ChainOwner = VendorKey | typeof DAILY_OWNER;

/** Rail order: the six shop fronts as `sellPrices` writes them, then the dailies. */
export const OWNER_ORDER: readonly ChainOwner[] = [...VENDOR_ORDER, DAILY_OWNER];

/** What the rail and the chain header need to print. A face, not a data record. */
export interface OwnerFace {
    key: ChainOwner;
    /** The organisation, in its own casing. Cold Steel uppercases in CSS, never in data. */
    org: string;
    /** The chip form, short enough to sit in a 78px phone tile. */
    short: string;
    /** The person behind the counter. Null for the dailies. */
    merchant: string | null;
    icon: string | null;
    portrait: string | null;
    /** Reputation needed for loyalty levels 2, 3 and 4. Empty where there are no tiers. */
    levelCap: number[];
    /** Whether reputation means anything here. False for Trupik's, which publishes no tiers. */
    hasReputation: boolean;
    /** Whether the tasks form a prerequisite graph worth drawing a spine for. */
    hasChain: boolean;
}

const DAILY_FACE: OwnerFace = {
    key: DAILY_OWNER,
    org: 'Dailies',
    short: 'DAILY',
    merchant: null,
    icon: null,
    portrait: null,
    levelCap: [],
    hasReputation: false,
    hasChain: false,
};

function face(vendor: Vendor): OwnerFace {
    return {
        key: vendor.key,
        org: vendor.org,
        short: vendor.short,
        merchant: vendor.merchant,
        icon: vendor.icon,
        portrait: vendor.portrait,
        levelCap: vendor.levelCap,
        hasReputation: vendor.levelCap.length > 0,
        hasChain: true,
    };
}

export function ownerFace(owner: ChainOwner): OwnerFace {
    if (owner === DAILY_OWNER) return DAILY_FACE;
    const vendor = getVendor(owner);
    return vendor ? face(vendor) : { ...DAILY_FACE, key: owner, org: owner.toUpperCase(), short: owner.toUpperCase() };
}

/** Every owner's face, in rail order. */
export const OWNER_FACES: OwnerFace[] = OWNER_ORDER.map(ownerFace);

/**
 * The owner of a task.
 *
 * Read from `corpId` and never from the id: three tasks are filed under a corp their id does not
 * name — `ntg_10` belongs to Boulder Forge, `ark_4` to N.T.G, `ntg_13` to Trupik's — so parsing the
 * id would put them in the wrong chain.
 */
export function ownerOf(task: Task): ChainOwner {
    return (task.corpId || DAILY_OWNER) as ChainOwner;
}

/* One pass over the task database, built on first use and kept — the data is static. */
let index: Map<ChainOwner, Task[]> | null = null;

function ownerIndex(): Map<ChainOwner, Task[]> {
    if (!index) {
        index = new Map<ChainOwner, Task[]>(OWNER_ORDER.map((owner) => [owner, []]));
        for (const task of Object.values(tasksData)) {
            const bucket = index.get(ownerOf(task));
            // An owner the rail does not know about would otherwise vanish. Give it a bucket, so a
            // future corp shows up as a rail entry rather than as missing tasks.
            if (bucket) bucket.push(task);
            else index.set(ownerOf(task), [task]);
        }
    }
    return index;
}

export function tasksForOwner(owner: ChainOwner): Task[] {
    return ownerIndex().get(owner) ?? [];
}

/** Every owner that actually has tasks, in rail order. */
export function populatedOwners(): ChainOwner[] {
    return [...ownerIndex().keys()]
        .filter((owner) => tasksForOwner(owner).length > 0)
        .sort((a, b) => OWNER_ORDER.indexOf(a) - OWNER_ORDER.indexOf(b));
}

/**
 * Prerequisites that belong to a different owner — 16 of them across the database, such as Boulder
 * Forge's `forge_34` needing ARK's `ark_64`.
 *
 * They are kept off the spine on purpose: an edge leaving the column has nowhere to land, and a
 * chain that silently omitted them would read as though the task were reachable. The detail pane
 * lists them under "Unlocked by", where the corp mark on each row says whose they are.
 */
export function externalPrereqsOf(task: Task): string[] {
    const owner = ownerOf(task);
    return task.requiredTasks.filter((id) => {
        const prereq = tasksData[id];
        return prereq !== undefined && ownerOf(prereq) !== owner;
    });
}

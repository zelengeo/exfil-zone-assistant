import { corps } from '@/data/tasks';
import { VENDOR_ORDER, type VendorKey } from '@/types/trade';

/**
 * Who the six shop fronts are — one description, read by every route.
 *
 * Before this module the answer was scattered: the tasks route read `corps` directly for the
 * organisation icon and the merchant portrait, `lib/trade.ts` read `corps[key].name` for a label
 * and special-cased the gunsmith by hand, and the gunsmith — which carries 264 of the catalogue's
 * 1 332 buy offers — had no row at all. Three call sites, three vocabularies, one of them missing
 * a vendor. `corps` has since gained its sixth row, so all six are now described in one place and
 * drawn from one record.
 *
 * `corps` stays the raw extraction record and stays the tasks route's source for reputation. What
 * lives here is the presentation vocabulary layered over it.
 */

export interface Vendor {
    key: VendorKey;
    /**
     * The organisation, in its own casing. Cold Steel uppercases in CSS, never in data — the
     * `micro-label` and `eyebrow` utilities do it — so this is the name as it is written.
     */
    org: string;
    /** The chip form: short enough to sit beside a loyalty level without wrapping. */
    short: string;
    /** The person behind the counter. Null only for a vendor `corps` has no row for. */
    merchant: string | null;
    /** The organisation's mark. Square, transparent ground. */
    icon: string | null;
    /** The merchant's portrait. Taller than wide. */
    portrait: string | null;
    /**
     * Reputation needed for loyalty levels 2, 3 and 4. Empty where the vendor has no tiers —
     * Trupik's is the only one, and its ten offers are all level 1, so that is a fact and not a gap.
     */
    levelCap: number[];
    /**
     * Whether `corps` describes this vendor. True for all six today; it stays as the test a call
     * site needs when the extraction adds a shop front the task data has not caught up with.
     */
    isTrader: boolean;
}

/** Presentation over `corps`, keyed the way `sellPrices` and `buyOffers` are keyed. */
const PRESENTATION: Record<VendorKey, Pick<Vendor, 'org' | 'short'>> = {
    ark: { org: 'ARK', short: 'ARK' },
    regiment: { org: 'Regiment', short: 'REGIMENT' },
    forge: { org: 'Boulder Forge', short: 'FORGE' },
    ntg: { org: 'N.T.G', short: 'N.T.G' },
    trupiks: { org: "Trupik's", short: "TRUPIK'S" },
    gunsmith: { org: 'Neumann', short: 'NEUMANN' },
};

function build(key: VendorKey): Vendor {
    const corp = corps[key];
    return {
        key,
        ...PRESENTATION[key],
        merchant: corp?.merchant ?? null,
        icon: corp?.icon ?? null,
        portrait: corp?.merchantIcon ?? null,
        levelCap: corp?.levelCap ?? [],
        isTrader: Boolean(corp),
    };
}

export const VENDORS: Record<VendorKey, Vendor> = Object.fromEntries(
    VENDOR_ORDER.map((key) => [key, build(key)]),
) as Record<VendorKey, Vendor>;

/** Every vendor, in the order `sellPrices` is written. */
export const VENDOR_LIST: Vendor[] = VENDOR_ORDER.map((key) => VENDORS[key]);

/**
 * The vendor a key names.
 *
 * Offers carry `vendor` as a bare string, so this takes one and returns null rather than throwing:
 * an unrecognised key means the extraction added a shop front, which should render as an unknown
 * name and not as a blank page.
 */
export function getVendor(vendor: string): Vendor | null {
    return (VENDORS as Record<string, Vendor | undefined>)[vendor] ?? null;
}

/** The organisation's name, falling back to the raw key so an unknown vendor is still legible. */
export function vendorOrg(vendor: string): string {
    return getVendor(vendor)?.org ?? vendor.toUpperCase();
}

/** The chip form — what a `VendorTag` prints beside the loyalty level. */
export function vendorShort(vendor: string): string {
    return getVendor(vendor)?.short ?? vendor.toUpperCase();
}

/**
 * The reputation a loyalty level costs, or null where the vendor publishes no tiers.
 *
 * `levelCap` is written as the thresholds for levels 2, 3 and 4 — the tasks route reads it the
 * same way in `taskHelpers.reputationFor`. Level 1 is free, which is why it returns 0.
 */
export function reputationForLevel(vendor: string, level: number): number | null {
    if (level <= 1) return 0;
    const caps = getVendor(vendor)?.levelCap ?? [];
    return caps[level - 2] ?? null;
}

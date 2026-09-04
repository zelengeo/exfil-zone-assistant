import { VENDOR_ORDER, type VendorKey } from '@/types/trade';

/**
 * Who the six shop fronts are — one description, read by every route.
 *
 * Before this module the answer was scattered: the tasks route read `corps` directly for the
 * organisation icon and the merchant portrait, `lib/trade.ts` read `corps[key].name` for a label
 * and special-cased the gunsmith by hand, and the gunsmith — which carries 264 of the catalogue's
 * 1 332 buy offers — had no row at all. Three call sites, three vocabularies, one of them missing
 * a vendor.
 *
 * The record is written out here rather than read from `corps` in `@/data/tasks`, and that is the
 * load-bearing part: `corps` is six rows inside a 431 KB module, so importing it for a merchant's
 * name pulled all 227 tasks into the client bundle of every route that names a vendor — the items
 * catalogue, the gunsmith bench and the combat simulator among them. Six rows of presentation are
 * cheaper to keep here than a bundler edge is to explain. `corps` remains the extraction's own
 * record and nothing in the app reads it.
 *
 * See `CONTEXT.md` for the vocabulary — org, merchant, vendor — and ADR 0003 for why a vendor has
 * two names rather than one.
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
    /** The person behind the counter. */
    merchant: string;
    /** The organisation's mark. Square, transparent ground. */
    icon: string;
    /** The merchant's portrait. Taller than wide. */
    portrait: string;
    /** The share card a task page opens with. */
    ogImage: string;
    /**
     * Reputation needed for loyalty levels 2, 3 and 4. Empty where the vendor has no tiers —
     * Trupik's is the only one, and its ten offers are all level 1, so that is a fact and not a gap.
     */
    levelCap: number[];
}

/** Keyed the way `sellPrices` and `buyOffers` are keyed, and ordered the way the rail reads. */
const RECORD: Record<VendorKey, Omit<Vendor, 'key'>> = {
    ark: {
        org: 'ARK',
        short: 'ARK',
        merchant: 'Tommy',
        icon: '/images/tasks/icon_Arkshop1_nobg.webp',
        portrait: '/images/tasks/img_ark1Merchant.webp',
        ogImage: '/og/og-image-ark-task.jpg',
        levelCap: [100, 300, 800],
    },
    regiment: {
        org: 'Regiment',
        short: 'REGIMENT',
        merchant: 'Igor',
        icon: '/images/tasks/icon_Regishop_nobg.webp',
        portrait: '/images/tasks/img_RegiMerchant.webp',
        ogImage: '/og/og-image-regiment-task.jpg',
        levelCap: [100, 300, 800],
    },
    forge: {
        org: 'Boulder Forge',
        short: 'FORGE',
        merchant: 'Maximilian',
        icon: '/images/tasks/icon_Arkshop2_nobg.webp',
        portrait: '/images/tasks/img_ar2Merchant.webp',
        ogImage: '/og/og-image-forge-task.jpg',
        levelCap: [100, 300, 800],
    },
    ntg: {
        org: 'N.T.G',
        short: 'N.T.G',
        merchant: 'Maggie',
        icon: '/images/tasks/icon_NTGshop_nobg.webp',
        portrait: '/images/tasks/img_DocMerchant.webp',
        ogImage: '/og/og-image-ntg-task.jpg',
        levelCap: [100, 300, 800],
    },
    trupiks: {
        org: "Trupik's",
        short: "TRUPIK'S",
        merchant: 'Johnny',
        icon: '/images/tasks/icon_TPshop_nobg.webp',
        portrait: '/images/tasks/img_TPMerchant.webp',
        ogImage: '/og/og-image-trupik-task.jpg',
        levelCap: [],
    },
    gunsmith: {
        org: 'Neumann',
        short: 'NEUMANN',
        merchant: 'Anna',
        icon: '/images/tasks/Icon_GunsmithShop_nobg.webp',
        portrait: '/images/tasks/img_GunsmithMerchant.webp',
        ogImage: '/og/og-image-gunsmith-task.jpg',
        levelCap: [100, 300, 800],
    },
};

export const VENDORS: Record<VendorKey, Vendor> = Object.fromEntries(
    VENDOR_ORDER.map((key) => [key, { key, ...RECORD[key] }]),
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
 * same way. Level 1 is free, which is why it returns 0.
 */
export function reputationForLevel(vendor: string, level: number): number | null {
    if (level <= 1) return 0;
    const caps = getVendor(vendor)?.levelCap ?? [];
    return caps[level - 2] ?? null;
}

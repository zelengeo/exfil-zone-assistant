import { getVendor, vendorOrg } from '@/lib/vendors';
import {
    VENDOR_ORDER,
    type BarterUse,
    type BuyOffer,
    type TradeStats,
    type VendorKey,
    type VendorPayout,
} from '@/types/trade';

/**
 * Selectors over the trade data. Pure, and deliberately free of React and of any item type — both
 * the items route and the gunsmith bench call these, and they carry the same price block.
 *
 * The wiki does not track a player's trader levels, so nothing here locks anything: an unlock
 * requirement is information, not a gate.
 */

/**
 * Who a vendor is now lives in `lib/vendors.ts`, which describes all six — including the gunsmith
 * bench, which `corps` has no row for and which carries 264 of the catalogue's buy offers. These
 * two are kept as the names the trade call sites already use.
 */
export function vendorLabel(vendor: string): string {
    return vendorOrg(vendor);
}

/** The trader's name, where there is one. The gunsmith bench has no merchant. */
export function vendorMerchant(vendor: string): string | null {
    return getVendor(vendor)?.merchant ?? null;
}

/**
 * Money, as the game writes it.
 *
 * Unlike the `formatPrice` it replaces, this makes no judgement about zero: whether an unpriced
 * item reads "not traded" or renders nothing at all is a decision for the call site, not a magic
 * string buried in a formatter.
 */
export function formatEZD(value: number): string {
    return `${value.toLocaleString('en-US')} EZD`;
}

/** The bare number, for table cells and axis labels that carry the unit in the header. */
export function formatAmount(value: number): string {
    return value.toLocaleString('en-US');
}

/** Whether the item carries a price block at all. 48 of the route's 852 items do not. */
export function isPriced(stats: TradeStats): boolean {
    return typeof stats.basePrice === 'number';
}

/**
 * What the item is worth — `basePrice`, which is the best of the six sell columns.
 *
 * Returns 0 for the unpriced, which callers should test with `isPriced` rather than by comparing
 * against 0: two items genuinely price at zero.
 */
export function baseValue(stats: TradeStats): number {
    return stats.basePrice ?? 0;
}

/**
 * The six vendors ordered by what they pay, best first, ties in `VENDOR_ORDER` order.
 *
 * Vendors paying nothing are dropped: a row reading zero says only that the array is six wide,
 * which is a fact about the format rather than about the item.
 */
export function payersByAmount(stats: TradeStats): VendorPayout[] {
    const prices = stats.sellPrices;
    if (!prices) return [];

    return VENDOR_ORDER
        .map((vendor, i): VendorPayout => ({ vendor, amount: prices[i] ?? 0 }))
        .filter((payout) => payout.amount > 0)
        .sort((a, b) => b.amount - a.amount);
}

/**
 * Every vendor paying the top price. Usually more than one — 86% of priced items are matched by
 * two or more vendors, which is why a card shows the number without a name.
 */
export function topPayers(stats: TradeStats): VendorPayout[] {
    const payouts = payersByAmount(stats);
    if (!payouts.length) return [];
    const best = payouts[0].amount;
    return payouts.filter((payout) => payout.amount === best);
}

/** The offer a player reaches first: lowest loyalty level, then cheapest. */
export function cheapestOffer(stats: TradeStats): BuyOffer | null {
    const offers = stats.buyOffers ?? [];
    if (!offers.length) return null;
    return [...offers].sort((a, b) => a.level - b.level || a.price - b.price)[0];
}

/** Buy offers in the order a player unlocks them. */
export function offersByLevel(stats: TradeStats): BuyOffer[] {
    return [...(stats.buyOffers ?? [])].sort(
        (a, b) => a.level - b.level || a.price - b.price,
    );
}

/** Whether any offer for this item is a barter. */
export function hasBarter(stats: TradeStats): boolean {
    return (stats.buyOffers ?? []).some((offer) => (offer.exchange?.length ?? 0) > 0);
}

/** Whether any vendor sells it at all. 315 of the route's priced items can only be sold. */
export function isBuyable(stats: TradeStats): boolean {
    return (stats.buyOffers?.length ?? 0) > 0;
}

/** Whether any offer is gated behind a task. Information, not a lock. */
export function isTaskGated(stats: TradeStats): boolean {
    return (stats.buyOffers ?? []).some((offer) => (offer.requiresTasks?.length ?? 0) > 0);
}

/**
 * The reverse barter index: for each item demanded as a cost, every offer demanding it.
 *
 * This is the one genuinely new answer the exchange data unlocks — it turns a junk valuable into a
 * shopping list. Built in one pass over the catalogue rather than precomputed into the JSON: 106
 * offers is small enough that there is nothing to gain by doing it upstream.
 */
export function buildBarterIndex<T extends { id: string; stats: TradeStats }>(
    items: T[],
): Map<string, BarterUse[]> {
    const index = new Map<string, BarterUse[]>();

    for (const item of items) {
        for (const offer of item.stats.buyOffers ?? []) {
            for (const cost of offer.exchange ?? []) {
                const uses = index.get(cost.itemId);
                const use: BarterUse = { itemId: item.id, offer, count: cost.count };
                if (uses) uses.push(use);
                else index.set(cost.itemId, [use]);
            }
        }
    }

    return index;
}

/** Vendor keys as a set, for filter membership tests. */
export const VENDOR_KEYS: ReadonlySet<string> = new Set<string>(VENDOR_ORDER);

export function isVendorKey(value: string): value is VendorKey {
    return VENDOR_KEYS.has(value);
}

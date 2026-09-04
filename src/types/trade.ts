/**
 * What an item is worth, and where it comes from.
 *
 * The backend answers three separate questions that the old `stats.price` scalar blurred into one:
 * what the item is worth, what each vendor pays for it, and what it costs to buy. This module is
 * the shared vocabulary for all three, used by both the items route and the gunsmith bench — the
 * two carry byte-identical price blocks in `public/data`, so one type is the honest description.
 *
 * See `src/lib/trade.ts` for the selectors, and `config/shopPrices.js` in the extraction repo for
 * how these fields are produced.
 */

/**
 * The six shop fronts, in the order `sellPrices` is written.
 *
 * Must stay in step with `VENDORS` in the extraction repo's `config/shopPrices.js`. All six are
 * described in `src/lib/vendors.ts`; `gunsmith` is Neumann, whose counter is the weapon bench.
 */
export const VENDOR_ORDER = ['ark', 'regiment', 'forge', 'ntg', 'trupiks', 'gunsmith'] as const;

export type VendorKey = typeof VENDOR_ORDER[number];

/**
 * What each vendor pays you, one entry per `VENDOR_ORDER` slot.
 *
 * Fixed six-wide rather than keyed, zeros included, so a ledger renders without testing for absent
 * keys — an item every vendor ignores still has six zeros.
 */
export type SellPrices = [number, number, number, number, number, number];

/**
 * The barter half of an offer's price: items the vendor demands on top of the money.
 *
 * `itemId` is the published wiki id and is what the app joins on. `sellId` is the backend's own
 * name for the same thing, carried for provenance only — never join on it, since most items do not
 * publish one.
 */
export interface ExchangeCost {
    itemId: string;
    sellId?: string;
    count: number;
}

/**
 * A task an offer is gated on, as the goods data publishes it.
 *
 * `gameId` is the id the goods data itself names and is the only field guaranteed present. The
 * other three are the join against the task database, and the extraction resolves them at publish
 * time - see `docs/EXTRACTION_CHANGE_REQUEST.md` for why the join moved upstream. All 215 published
 * gates carry the full set today; a gate naming a task the extraction cannot resolve arrives with
 * `gameId` alone rather than with a guessed name, which is why the three are optional.
 */
export interface TaskGate {
    /** The in-game id, e.g. `task.marc.part2.01`. Always present, and always printable. */
    gameId: string;
    /** The wiki id, i.e. the `/tasks/<id>` route. */
    id?: string;
    name?: string;
    corpId?: string;
}

/** One shop listing: a vendor selling an item at a loyalty level. */
export interface BuyOffer {
    vendor: string;
    goodsId?: string;
    level: number;
    price: number;
    bundle?: number;
    bundlePrice?: number;
    stock?: number;
    resetType?: string;
    requiresTasks?: TaskGate[];
    requiresDlc?: string[];
    /** Present and non-empty only on barter listings — 106 of the items route's 678 offers. */
    exchange?: ExchangeCost[];
}

/**
 * The price block every priced item carries. All three fields are absent together: an item either
 * has the whole block or none of it, which is what lets `isPriced` be a single test.
 */
export interface TradeStats {
    /**
     * The item's value: the maximum of the six sell columns, verified identical to
     * `Math.max(...sellPrices)` on every priced item. This is the one number a card shows.
     */
    basePrice?: number;
    sellPrices?: SellPrices;
    buyOffers?: BuyOffer[];
}

/** One vendor's payout, as the ledger orders them. */
export interface VendorPayout {
    vendor: VendorKey;
    amount: number;
}

/** A place some item is demanded as barter, for the reverse index. */
export interface BarterUse {
    /** The item the offer sells. */
    itemId: string;
    offer: BuyOffer;
    /** How many of the indexed item this one offer costs. */
    count: number;
}

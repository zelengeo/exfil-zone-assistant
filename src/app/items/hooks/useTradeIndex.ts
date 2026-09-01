'use client';

import { useEffect, useState } from 'react';
import { fetchItemsData } from '@/services/ItemService';
import { buildBarterIndex } from '@/lib/trade';
import type { Item } from '@/types/items';
import type { BarterUse } from '@/types/trade';

/**
 * Everything the detail page needs to talk about barter.
 *
 * Two things fall out of one pass over the catalogue: the item behind any id (so a barter cost can
 * draw an `ItemChip` — icon, name and link — rather than a bare string), and the reverse index:
 * every offer that demands a given item.
 * That reverse view is the one genuinely new answer the exchange data unlocks: it turns a junk
 * valuable into a shopping list.
 *
 * The catalogue is already cached by `ItemService`, so this costs one pass over 852 items on the
 * first detail page and nothing after.
 */
export interface TradeIndex {
    /** The item an id names, for anything that draws one. Undefined for ids not in the catalogue. */
    itemOf: (itemId: string) => Item | undefined;
    nameOf: (itemId: string) => string | undefined;
    /** Offers that demand this item as barter. Empty for all but 70 items. */
    wantedIn: (itemId: string) => BarterUse[];
    ready: boolean;
}

const NOT_READY: TradeIndex = {
    itemOf: () => undefined,
    nameOf: () => undefined,
    wantedIn: () => [],
    ready: false,
};

export function useTradeIndex(): TradeIndex {
    const [index, setIndex] = useState<TradeIndex>(NOT_READY);

    useEffect(() => {
        let cancelled = false;

        fetchItemsData()
            .then(({ items, itemMap }) => {
                if (cancelled) return;
                const barter = buildBarterIndex(items);
                setIndex({
                    itemOf: (itemId) => itemMap.get(itemId),
                    nameOf: (itemId) => itemMap.get(itemId)?.name,
                    wantedIn: (itemId) => barter.get(itemId) ?? [],
                    ready: true,
                });
            })
            .catch((error) => {
                console.error('Failed to build the trade index:', error);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return index;
}

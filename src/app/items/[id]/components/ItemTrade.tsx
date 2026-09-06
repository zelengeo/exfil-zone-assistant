'use client';

import type { TradeStats, BarterUse } from '@/types/trade';
import type { ItemRef } from '@/components/items/ItemChip';
import VendorLedger from '@/components/trade/VendorLedger';
import WantedInBarter from '@/components/trade/WantedInBarter';

interface ItemTradeProps {
    stats: TradeStats;
    uses: BarterUse[];
    references: ItemRef[];
}

export default function ItemTrade({ stats, uses, references }: ItemTradeProps) {
    const resolve = (id: string) => references.find(item => item.id === id);
    return <>
        <VendorLedger stats={stats} resolve={resolve} />
        <WantedInBarter uses={uses} resolve={resolve} />
    </>;
}

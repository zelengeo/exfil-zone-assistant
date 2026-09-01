import React from "react";
import { Holster } from "@/types/items";
import ItemLinkIcon from "@/components/ItemLinkIcon";
import { useFetchItems } from "@/hooks/useFetchItems";
import { Layers } from "lucide-react";
import { StatEmpty, StatPanel } from "./StatLine";

export default function HolsterSpecificStats({ item }: { item: Holster }) {
    const { getItemById } = useFetchItems();

    const attachableHolsters = item.stats.canAttach && item.stats.canAttach.length > 0
        ? item.stats.canAttach.map(id => getItemById(id)).filter(Boolean) as Holster[]
        : [];

    return (
        <StatPanel title="Can attach" icon={<Layers size={14} />}>
            {attachableHolsters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {attachableHolsters.map(holster => (
                        <ItemLinkIcon key={holster.id} item={holster} />
                    ))}
                </div>
            ) : (
                <StatEmpty>No attachable holsters.</StatEmpty>
            )}
        </StatPanel>
    );
}

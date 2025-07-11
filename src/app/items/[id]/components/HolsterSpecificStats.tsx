
import React from "react";
import { Holster } from "@/types/items";
import ItemLinkIcon from "@/components/ItemLinkIcon";
import { useFetchItems } from "@/hooks/useFetchItems";
import { Layers, X } from "lucide-react";

export default function HolsterSpecificStats({ item }: { item: Holster }) {
    const { getItemById } = useFetchItems();

    const attachableHolsters = item.stats.canAttach && item.stats.canAttach.length > 0 
        ? item.stats.canAttach.map(id => getItemById(id)).filter(Boolean) as Holster[] 
        : [];

    return (
        <div className="military-card p-4 rounded-sm mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Layers size={18} className="text-olive-400" />
                <h4 className="text-lg font-bold text-olive-400">Can Attach</h4>
            </div>
            <div className="flex flex-wrap gap-2">
                {attachableHolsters.length > 0 ? (
                    attachableHolsters.map(holster => (
                        <ItemLinkIcon key={holster.id} item={holster} />
                    ))
                ) : (
                    <div className="flex items-center gap-2 text-tan-400 text-sm">
                        <X size={16} className="text-red-400" />
                        <span>No attachable holsters.</span>
                    </div>
                )}
            </div>
        </div>
    );
}

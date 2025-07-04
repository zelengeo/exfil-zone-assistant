import React from "react";
import {
    Container,
    Droplets,
    Gauge,
    Utensils,
} from "lucide-react";
import {Provisions} from "@/types/items";

export default function ProvisionsSpecificStats({item}: { item: Provisions }) {
    return (
        <>
            {/* Basic Provisions Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Container size={18} className="text-olive-400"/>
                    <span className="text-tan-400">Capacity:</span>
                    <span className="text-tan-100">{item.stats.capacity/item.stats.threshold}x{item.stats.threshold}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Gauge size={18} className="text-olive-400"/>
                    <span className="text-tan-400">Consumption Speed:</span>
                    <span className="text-tan-100">{item.stats.consumptionSpeed}/s</span>
                </div>
            </div>

            {/* Energy and Hydration Effects */}
            <div className="military-card p-4 rounded-sm mb-6">
                <h4 className="text-olive-400 font-medium mb-3">Restoration Effects</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Utensils size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Energy:</span>
                        <span className={`${item.stats.energyFactor > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                            {item.stats.energyFactor > 0 ? `+${item.stats.energyFactor*item.stats.capacity}` : 'None'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Droplets size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Hydration:</span>
                        <span className={`${item.stats.hydraFactor > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                            {item.stats.hydraFactor > 0 ? `+${item.stats.hydraFactor*item.stats.capacity}` : 'None'}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
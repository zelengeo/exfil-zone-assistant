import React from "react";
import {
    Container,
    Droplets,
    Gauge,
    Utensils,
} from "lucide-react";
import {Provisions} from "@/types/items";
import StatLine, {StatGrid, StatPanel} from "./StatLine";

export default function ProvisionsSpecificStats({item}: { item: Provisions }) {
    const energy = item.stats.energyFactor * item.stats.capacity;
    const hydration = item.stats.hydraFactor * item.stats.capacity;

    return (
        <div className="space-y-5">
            <StatGrid>
                <StatLine
                    icon={<Container size={14}/>}
                    label="Capacity"
                    value={`${item.stats.threshold}×${item.stats.capacity / item.stats.threshold}`}
                />
                <StatLine
                    icon={<Gauge size={14}/>}
                    label="Consumption speed"
                    value={`${item.stats.consumptionSpeed}/s`}
                />
            </StatGrid>

            <StatPanel title="Restoration effects">
                <StatGrid>
                    <StatLine
                        icon={<Utensils size={14}/>}
                        label="Energy"
                        value={
                            <span className={item.stats.energyFactor > 0 ? 'text-good' : 'text-ink-700'}>
                                {item.stats.energyFactor > 0 ? `+${energy}` : 'None'}
                            </span>
                        }
                    />
                    <StatLine
                        icon={<Droplets size={14}/>}
                        label="Hydration"
                        value={
                            <span className={item.stats.hydraFactor > 0 ? 'text-info' : 'text-ink-700'}>
                                {item.stats.hydraFactor > 0 ? `+${hydration}` : 'None'}
                            </span>
                        }
                    />
                </StatGrid>
            </StatPanel>
        </div>
    );
}

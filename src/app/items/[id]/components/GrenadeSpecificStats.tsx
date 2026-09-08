import React from "react";
import {Grenade} from "@/types/items";
import BallisticCurveChart from "@/app/items/components/BallisticCurveChart";
import {Radius, Timer, TimerReset} from "lucide-react";
import StatLine, {StatGrid, StatPanel} from "./StatLine";

const pct = (value: number): string => `${(value * 100).toFixed(1)}%`;

export default function GrenadeSpecificStats({item}: { item: Grenade }) {
    return <div className="space-y-5">
        <StatGrid>
            <StatLine
                icon={<Timer size={14}/>}
                label="Fuse time"
                value={item.stats.fuseTime === null ? 'Impact' : `${item.stats.fuseTime}s`}
            />
            <StatLine
                icon={<Radius size={14}/>}
                label="Effective range"
                value={item.stats.radius}
            />
            {item.subcategory === "Utility" && (
                <StatLine
                    icon={<TimerReset size={14}/>}
                    label="Effect time"
                    value={`${item.stats.effectTime}s`}
                />
            )}
        </StatGrid>

        {item.subcategory === "Fragmentation" && (
            <StatPanel title="Damage modifiers">
                <StatGrid>
                    <StatLine label="Bleeding chance" value={pct(item.stats.bleedingChance)}/>
                    <StatLine label="Blunt damage scale" value={pct(item.stats.bluntDamageScale)}/>
                    <StatLine
                        label="Penetration damage"
                        value={pct(item.stats.protectionGearPenetratedDurabilityDamageScale)}
                    />
                    <StatLine
                        label="Blunt damage"
                        value={pct(item.stats.protectionGearBluntDurabilityDamageScale)}
                    />
                </StatGrid>
            </StatPanel>
        )}


        {item.subcategory === "Fragmentation" && (<div className="space-y-6">
            {/* Apply Chance Curve */}
            <BallisticCurveChart
                title="Effect Application Chance"
                curves={[
                    {
                        name: "Apply Chance",
                        data: item.stats.applyChanceCurve,
                        role: 'chance'
                    }
                ]}
                xLabel="Distance (m)"
                xLabelModifier={0.01}
                yLabel="Application Chance"
                height={250}
            />

            {/* Damage Over Distance */}
            <BallisticCurveChart
                title="Damage Over Distance"
                curves={[
                    {
                        name: "Damage",
                        data: item.stats.damageOverDistance,
                        role: 'damage'
                    }
                ]}
                xLabel="Distance (m)"
                xLabelModifier={0.01}
                yLabel="Damage"
                height={250}
            />


            {/* Penetration Power Over Distance */}
            <BallisticCurveChart
                title="Penetration Power Over Distance"
                curves={[
                    {
                        name: "Penetration Power",
                        data: item.stats.penetrationPowerOverDistance,
                        role: 'penetration'
                    }
                ]}
                xLabel="Distance (m)"
                xLabelModifier={0.01}
                yLabel="Penetration Power"
                height={250}
            />

        </div>)}

    </div>
}

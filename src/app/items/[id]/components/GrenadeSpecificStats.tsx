import React from "react";
import {Grenade} from "@/types/items";
import BallisticCurveChart from "@/app/items/components/BallisticCurveChart";
import {Radius, Timer, TimerReset} from "lucide-react";


export default function GrenadeSpecificStats({item}: { item: Grenade }) {
    return <>
        <div className="grid grid-cols-2 gap-4 mb-6">

            {/* Basic Properties */}
            <div className="flex items-center gap-2">
                <Timer size={18} className="text-olive-400"/>
                <span className="text-tan-400">Fuse Time:</span>
                <span
                    className="text-tan-100 font-mono">{item.stats.fuseTime === null ? 'Impact Detonation' : `${item.stats.fuseTime}s`}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Radius size={18} className="text-olive-400"/>
                <span className="text-tan-400">Effective Range:</span>
                <span className="text-tan-100 font-mono">
                    {item.stats.radius}
                </span>
            </div>

            {item.subcategory === "Utility" && (<div className="flex items-center gap-2">
                <TimerReset size={18} className="text-olive-400"/>
                <span className="text-tan-400">Effect Time:</span>
                <span className="text-tan-100">{item.stats.effectTime}s</span>
            </div>)}
        </div>

        {/* Damage modifiers */}
        {item.subcategory === "Fragmentation" && (<div className="military-card p-4 rounded-sm mb-6">
            <h4 className="text-lg font-bold text-olive-400 mb-3">Damage Modifiers</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-tan-400">Bleeding Chance:</span>
                    <span className="text-tan-100">{(item.stats.bleedingChance * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-tan-400">Blunt Damage Scale:</span>
                    <span className="text-tan-100">{(item.stats.bluntDamageScale * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-tan-400">Penetration Damage:</span>
                    <span
                        className="text-tan-100">{(item.stats.protectionGearPenetratedDurabilityDamageScale * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-tan-400">Blunt Damage:</span>
                    <span
                        className="text-tan-100">{(item.stats.protectionGearBluntDurabilityDamageScale * 100).toFixed(1)}%</span>
                </div>
            </div>
        </div>)
        }


        {item.subcategory === "Fragmentation" && (<div className="space-y-6">
            {/* Apply Chance Curve */}
            <BallisticCurveChart
                title="Effect Application Chance"
                curves={[
                    {
                        name: "Apply Chance",
                        data: item.stats.applyChanceCurve,
                        color: "#ef4444"
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
                        color: "#f59e0b"
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
                        color: "#10b981"
                    }
                ]}
                xLabel="Distance (m)"
                xLabelModifier={0.01}
                yLabel="Penetration Power"
                height={250}
            />

        </div>)}

        {/* Grenade Usage Tips */}
        {/*<div className="mt-6 p-4 bg-military-800 rounded-sm border-l-4 border-olive-600">
            <h4 className="text-olive-400 font-medium mb-2">Tactical Usage</h4>
            <div className="text-sm text-tan-300 space-y-1">
                <p>• Effect application decreases significantly with distance</p>
                <p>• Consider terrain and obstacles when calculating effective range</p>
                <p>• Fragmentation patterns vary based on surface type and angle</p>
            </div>
        </div>*/}
    </>
}
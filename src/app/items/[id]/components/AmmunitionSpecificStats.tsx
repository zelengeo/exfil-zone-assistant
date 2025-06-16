import React from "react";
import {
    Crosshair,
    Info,
    ShieldX,
} from "lucide-react";
import {Ammunition} from "@/types/items";
import BallisticCurveChart from "@/components/items/BallisticCurveChart";


export default function AmmunitionSpecificStats({item}: { item: Ammunition }) {
    return <>
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
                <Crosshair size={18} className="text-olive-400"/>
                <span className="text-tan-300">Damage:</span>
                <span className="text-tan-100">{item.stats.damage}</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldX size={18} className="text-olive-400"/>
                <span className="text-tan-300">Penetration:</span>
                <span className="text-tan-100">{item.stats.penetration}</span>
            </div>
            <div className="flex items-center gap-2">
                <Info size={18} className="text-olive-400"/>
                <span className="text-tan-300">Velocity:</span>
                <span className="text-tan-100">{item.stats.muzzleVelocity / 100} m/s</span>
            </div>
            <div className="flex items-center gap-2">
                <Info size={18} className="text-olive-400"/>
                <span className="text-tan-300">Caliber:</span>
                <span className="text-tan-100">{item.stats.caliber}</span>
            </div>
        </div>

        {/* Damage modifiers */}
        <div className="military-card p-4 rounded-sm mb-6">
            <h4 className="text-lg font-bold text-olive-400 mb-3">Damage Modifiers</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-tan-400">Blunt Damage Scale:</span>
                    <span
                        className="text-tan-100">{(item.stats.bluntDamageScale * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-tan-400">Bleeding Chance:</span>
                    <span
                        className="text-tan-100">{(item.stats.bleedingChance * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-tan-400">Armor Pen Damage:</span>
                    <span
                        className="text-tan-100">{(item.stats.protectionGearPenetratedDamageScale * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-tan-400">Armor Blunt Damage:</span>
                    <span
                        className="text-tan-100">{(item.stats.protectionGearBluntDamageScale * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>

        {/* Ballistic curves */}
        <BallisticCurveChart
            title="Damage Over Distance"
            curves={[{
                name: 'Damage',
                data: item.stats.ballisticCurves.damageOverDistance,
                color: '#ef4444'
            }]}
            xLabel="Distance (m)"
            xLabelModifier={0.01}
            yLabel="Damage"
            height={250}
        />
        <div className="mt-4">
            <BallisticCurveChart
                title="Penetration Over Distance"
                curves={[{
                    name: 'Penetration',
                    data: item.stats.ballisticCurves.penetrationPowerOverDistance,
                    color: '#9ba85e'
                }]}
                xLabel="Distance (m)"
                xLabelModifier={0.01}
                yLabel="Penetration Power"
                height={250}
            />
        </div>

    </>

}
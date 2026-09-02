import React from "react";
import {
    Crosshair,
    Info,
    ShieldX,
} from "lucide-react";
import {Ammunition} from "@/types/items";
import BallisticCurveChart, {CURVE_COLOR} from "@/app/items/components/BallisticCurveChart";
import StatLine, {StatGrid, StatPanel} from "./StatLine";

const pct = (value: number): string => `${(value * 100).toFixed(0)}%`;

export default function AmmunitionSpecificStats({item}: { item: Ammunition }) {
    return <div className="space-y-5">
        <StatGrid>
            <StatLine icon={<Crosshair size={14}/>} label="Damage" value={item.stats.damage}/>
            <StatLine icon={<ShieldX size={14}/>} label="Penetration" value={item.stats.penetration}/>
            <StatLine
                icon={<Info size={14}/>}
                label="Velocity"
                value={`${item.stats.muzzleVelocity / 100} m/s`}
            />
            <StatLine icon={<Info size={14}/>} label="Caliber" value={item.stats.caliber} text/>
        </StatGrid>

        <StatPanel title="Damage modifiers">
            <StatGrid>
                <StatLine label="Blunt damage scale" value={pct(item.stats.bluntDamageScale)}/>
                <StatLine label="Bleeding chance" value={pct(item.stats.bleedingChance)}/>
                <StatLine
                    label="Armor pen damage"
                    value={pct(item.stats.protectionGearPenetratedDamageScale)}
                />
                <StatLine
                    label="Armor blunt damage"
                    value={pct(item.stats.protectionGearBluntDamageScale)}
                />
            </StatGrid>
        </StatPanel>

        {/* Ballistic curves */}
        <BallisticCurveChart
            title="Damage Over Distance"
            curves={[{
                name: 'Damage',
                data: item.stats.ballisticCurves.damageOverDistance,
                color: CURVE_COLOR.damage
            }]}
            xLabel="Distance (m)"
            xLabelModifier={0.01}
            yLabel="Damage"
            height={250}
        />
        <BallisticCurveChart
            title="Penetration Over Distance"
            curves={[{
                name: 'Penetration',
                data: item.stats.ballisticCurves.penetrationPowerOverDistance,
                color: CURVE_COLOR.penetration
            }]}
            xLabel="Distance (m)"
            xLabelModifier={0.01}
            yLabel="Penetration Power"
            height={250}
        />
    </div>
}

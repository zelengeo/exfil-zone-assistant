import React from "react";
import {
    Crosshair,
    Info,
    ShieldX,
} from "lucide-react";
import {Ammunition, Item} from "@/types/items";
import {ammoRankings} from "@/lib/quality/itemGrades";
import BallisticCurveChart from "@/app/items/components/BallisticCurveChart";
import StatLine, {StatGrid, StatPanel} from "./StatLine";

const pct = (value: number): string => `${(value * 100).toFixed(0)}%`;

export default function AmmunitionSpecificStats({item, peers = []}: { item: Ammunition; peers?: Item[] }) {
    // Ranked against its own calibre, never against every round in the game: a 9x19 that outranked
    // a .338 LM on paper would be answering a question nobody asks.
    const rank = ammoRankings(item, peers);

    return <div className="space-y-5">
        <StatGrid>
            <StatLine
                icon={<Crosshair size={14}/>}
                label="Damage"
                value={item.stats.damage}
                ranking={rank.damage}
            />
            <StatLine
                icon={<ShieldX size={14}/>}
                label="Penetration"
                value={item.stats.penetration}
                ranking={rank.penetration}
            />
            <StatLine
                icon={<Info size={14}/>}
                label="Velocity"
                value={`${item.stats.muzzleVelocity / 100} m/s`}
                ranking={rank.muzzleVelocity}
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
                role: 'damage'
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
                role: 'penetration'
            }]}
            xLabel="Distance (m)"
            xLabelModifier={0.01}
            yLabel="Penetration Power"
            height={250}
        />
    </div>
}

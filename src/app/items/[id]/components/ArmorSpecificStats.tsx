import React from "react";
import {
    BowArrow,
    Gavel,
    Shield, ShieldMinus,
    Volume2,
} from "lucide-react";
import {Armor} from "@/types/items";
import BallisticCurveChart from "@/app/items/components/BallisticCurveChart";
import {isHeadProtection, isHelmet} from "@/app/combat-sim/utils/types";
import ArmorZonesDisplay from "@/app/items/components/ArmorZonesDisplay";


/** Percentages read as a hard "0%" when the underlying number is simply absent. */
function percent(value: number | undefined | null, scale: number): string {
    return typeof value === 'number' ? `${(value * scale).toFixed(0)}%` : 'Unknown';
}

/** Curated on the items that were on the published wiki, absent on the rest. */
function soundDampening(soundMix: string | undefined): string {
    if (!soundMix) return 'Unknown';
    if (soundMix === 'default') return 'None';
    return (soundMix === 'OPSWAT' || soundMix === 'Delta') ? 'Weak' : 'Strong';
}

export default function ArmorSpecificStats({item}: { item: Armor }) {
    const hasZones = Boolean(item.stats.protectiveData && item.stats.protectiveData.length > 0);

    return                     <>
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
                <BowArrow size={18} className="text-olive-400"/>
                <span className="text-tan-300">Penetration Damage</span>
                <span
                    className="text-tan-100">{((item.stats.penetrationDamageScalarCurve?.[1]?.value || 1) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
                <Shield size={18} className="text-olive-400"/>
                <span className="text-tan-300">Max Durability:</span>
                <span className="text-tan-100">{item.stats.maxDurability ?? 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Gavel size={18} className="text-olive-400"/>
                <span className="text-tan-300">Blunt Damage:</span>
                <span className="text-tan-100">{percent(item.stats.bluntDamageScalar, 100)}</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldMinus size={18} className="text-olive-400"/>
                <span className="text-tan-300">Durability Damage:</span>
                <span
                    className="text-tan-100">{percent(item.stats.durabilityDamageScalar, 300)}</span>
            </div>
            {isHelmet(item) && (
                <div className="flex items-center gap-2">
                    <Volume2 size={18} className="text-olive-400"/>
                    <span className="text-tan-300">Sound Dampening:</span>
                    <span className="text-tan-100">{soundDampening(item.stats.soundMix)}</span>
                </div>
            )}
        </div>

        {/* Protection zones */}
        {hasZones && (
            <ArmorZonesDisplay
                protectiveData={item.stats.protectiveData!}
                className="mb-6"
            />
        )}

        {/*
          * Head gear protects through cone regions in the current game, and the per-bone zones
          * above only exist where someone curated them. Say so rather than rendering an empty gap
          * that reads as "protects nothing" - interpreting the regions is still to come.
          */}
        {!hasZones && isHeadProtection(item) && (
            <div className="mb-6 text-sm text-tan-400">
                Coverage for this item is defined by the game as
                {' '}{item.stats.coneRegions?.length ?? 0} protection region(s) rather than per-body-part
                zones. Zone-by-zone figures are not available yet.
            </div>
        )}

        {/* Penetration curves */}
        {item.stats.penetrationChanceCurve && (
            <BallisticCurveChart
                title="Penetration Chance Curve"
                curves={[{
                    name: 'Penetration Chance',
                    data: item.stats.penetrationChanceCurve,
                    color: '#ef4444'
                }]}
                xLabel="Penetration - Armor Class"
                yLabel="Chance"
                height={250}
            />
        )}

        {item.stats.penetrationDamageScalarCurve && (
            <div className="mt-4">
                <BallisticCurveChart
                    title="Penetration Damage Scalar"
                    curves={[{
                        name: 'Damage Multiplier',
                        data: item.stats.penetrationDamageScalarCurve,
                        color: '#9ba85e'
                    }]}
                    xLabel="Armor Class - Penetration"
                    yLabel="Damage Scalar"
                    height={250}
                />
            </div>
        )}

        {item.stats.antiPenetrationDurabilityScalarCurve && (
            <div className="mt-4">
                <BallisticCurveChart
                    title="Durability Effectiveness"
                    curves={[{
                        name: 'Armor Effectiveness',
                        data: item.stats.antiPenetrationDurabilityScalarCurve,
                        color: '#60a5fa'
                    }]}
                    xLabel="Missing Durability %"
                    yLabel="Effectiveness"
                    height={250}
                />
            </div>
        )}
    </>

}
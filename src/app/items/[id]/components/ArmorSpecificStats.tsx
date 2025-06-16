import React from "react";
import {
    BowArrow,
    Gavel,
    Shield, ShieldMinus,
    Volume2,
} from "lucide-react";
import {Armor} from "@/types/items";
import BallisticCurveChart from "@/components/items/BallisticCurveChart";
import {isHelmet} from "@/app/combat-sim/utils/types";
import ArmorZonesDisplay from "@/components/items/ArmorZonesDisplay";


export default function ArmorSpecificStats({item}: { item: Armor }) {
    return                     <>
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
                <BowArrow size={18} className="text-olive-400"/>
                <span className="text-tan-300">Penetration Damage</span>
                <span
                    className="text-tan-100">{(item.stats.penetrationDamageScalarCurve[1].value * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
                <Shield size={18} className="text-olive-400"/>
                <span className="text-tan-300">Max Durability:</span>
                <span className="text-tan-100">{item.stats.maxDurability}</span>
            </div>
            <div className="flex items-center gap-2">
                <Gavel size={18} className="text-olive-400"/>
                <span className="text-tan-300">Blunt Damage:</span>
                <span className="text-tan-100">{(item.stats.bluntDamageScalar * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldMinus size={18} className="text-olive-400"/>
                <span className="text-tan-300">Durability Damage:</span>
                <span
                    className="text-tan-100">{(item.stats.durabilityDamageScalar * 300).toFixed(0)}%</span>
            </div>
            {isHelmet(item) && (
                <div className="flex items-center gap-2">
                    <Volume2 size={18} className="text-olive-400"/>
                    <span className="text-tan-300">Sound Dampening:</span>
                    <span
                        className="text-tan-100">{item.stats.soundMix === "default" ? "None" : (item.stats.soundMix === "OPSWAT" || item.stats.soundMix === "Delta") ? "Weak" : "Strong"}</span>
                </div>
            )}
        </div>

        {/* Protection zones */}
        {item.stats.protectiveData && item.stats.protectiveData.length > 0 && (
            <ArmorZonesDisplay
                protectiveData={item.stats.protectiveData}
                className="mb-6"
            />
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
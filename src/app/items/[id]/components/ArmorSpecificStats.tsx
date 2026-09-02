import React from "react";
import {
    BowArrow,
    Gavel,
    Shield, ShieldMinus,
    Volume2,
} from "lucide-react";
import {Armor} from "@/types/items";
import BallisticCurveChart, {CURVE_COLOR} from "@/app/items/components/BallisticCurveChart";
import {isBodyArmor, isHeadProtection, isHelmet} from "@/app/combat-sim/utils/types";
import BodyCoveragePanel from "@/components/protection/BodyCoveragePanel";
import StatLine, {StatGrid, StatPanel} from "./StatLine";


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

    return <>
        <StatGrid className="mb-6">
            <StatLine
                icon={<BowArrow size={14}/>}
                label="Penetration damage"
                value={`${((item.stats.penetrationDamageScalarCurve?.[1]?.value || 1) * 100).toFixed(0)}%`}
            />
            <StatLine
                icon={<Shield size={14}/>}
                label="Max durability"
                value={item.stats.maxDurability ?? 'Unknown'}
            />
            <StatLine
                icon={<Gavel size={14}/>}
                label="Blunt damage"
                value={percent(item.stats.bluntDamageScalar, 100)}
            />
            <StatLine
                icon={<ShieldMinus size={14}/>}
                label="Durability damage"
                value={percent(item.stats.durabilityDamageScalar, 300)}
            />
            {isHelmet(item) && (
                <StatLine
                    icon={<Volume2 size={14}/>}
                    label="Sound dampening"
                    value={soundDampening(item.stats.soundMix)}
                    text
                />
            )}
        </StatGrid>

        {/*
          * Coverage, drawn from the real geometry rather than from percentages placed by hand on a
          * flat image. Body armour only: head gear is tested by cone regions, not by the per-bone
          * wedge this draws.
          */}
        {hasZones && isBodyArmor(item) && (
            <StatPanel title="Coverage" className="mb-6">
                <BodyCoveragePanel armor={item}/>
            </StatPanel>
        )}

        {/*
          * Head gear protects through cone regions in the current game, and the per-bone zones
          * above only exist where someone curated them. Say so rather than rendering an empty gap
          * that reads as "protects nothing" - interpreting the regions is still to come.
          */}
        {isHeadProtection(item) && (
            <div className="mb-6 text-sm text-ink-500">
                Coverage for head gear is defined by the game as
                {' '}{item.stats.coneRegions?.length ?? 0} cone region(s) around the head rather than
                as per-bone wedges, so the body viewer does not describe it. Drawing those regions is
                still to come.
            </div>
        )}

        {/* Penetration curves */}
        {item.stats.penetrationChanceCurve && (
            <BallisticCurveChart
                title="Penetration Chance Curve"
                curves={[{
                    name: 'Penetration Chance',
                    data: item.stats.penetrationChanceCurve,
                    color: CURVE_COLOR.chance
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
                        color: CURVE_COLOR.damage
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
                        color: CURVE_COLOR.effectiveness
                    }]}
                    xLabel="Missing Durability %"
                    yLabel="Effectiveness"
                    height={250}
                />
            </div>
        )}
    </>

}
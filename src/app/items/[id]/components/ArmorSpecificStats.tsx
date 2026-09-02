import React from "react";
import {
    BowArrow,
    Gavel,
    Shield, ShieldMinus,
    Volume2,
} from "lucide-react";
import {Armor, CurvePoint} from "@/types/items";
import BallisticCurveChart, {CURVE_COLOR} from "@/app/items/components/BallisticCurveChart";
import {isBodyArmor, isHeadProtection, isHelmet} from "@/app/combat-sim/utils/types";
import BodyCoveragePanel from "@/components/protection/BodyCoveragePanel";
import HeadCoveragePanel from "@/components/protection/HeadCoveragePanel";
import StatLine, {StatGrid, StatPanel} from "./StatLine";


/** Percentages read as a hard "0%" when the underlying number is simply absent. */
function percent(value: number | undefined | null, scale: number): string {
    return typeof value === 'number' ? `${(value * scale).toFixed(0)}%` : 'Unknown';
}

/**
 * How much damage a penetrating shot keeps when the round's penetration exactly equals the armour's
 * class - the key at x = 0 on `penetrationDamageScalarCurve`.
 *
 * Looked up by value rather than by position: the curves do not all carry the same number of keys
 * (cosmetic hats author a single point), so an index was only ever right by coincidence. This is one
 * reading off the curve, not a headline figure - the game samples it at `armorClass - penetration`
 * clamped at -2, so a round that beats the armour by a full class keeps 100 % while one that barely
 * scrapes through keeps much less. The chart lower down is the whole story.
 */
function damageAtEqualClass(curve: CurvePoint[] | undefined): string {
    const key = curve?.find(point => point.time === 0);
    return key ? `${(key.value * 100).toFixed(0)}%` : '—';
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
                label="Damage at equal class"
                value={damageAtEqualClass(item.stats.penetrationDamageScalarCurve)}
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
            {/*
              * Durability is spent as `damage x DurabilityDamageScalar x the round's
              * ProtectionGear*DurabilityDamageScale`. The x3 this line used to carry was fitted
              * against measurements before the function was decompiled, and has no counterpart in
              * it - see DAMAGE_MODEL.md §7.
              */}
            <StatLine
                icon={<ShieldMinus size={14}/>}
                label="Durability damage"
                value={percent(item.stats.durabilityDamageScalar, 100)}
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
          * Head gear is tested by cone regions rather than by the per-bone wedge above, so it gets
          * its own viewer. Any per-bone `protectiveData` a helmet carries was hand-approximated for
          * the old wiki and has no counterpart in the current build - the regions are the model.
          */}
        {isHeadProtection(item) && (
            <StatPanel title="Coverage" className="mb-6">
                <HeadCoveragePanel item={item}/>
            </StatPanel>
        )}

        {/*
          * Penetration curves. Both are sampled at the SAME x - `effective armor class minus the
          * round's penetration` - so the two axes read the same way: left of zero the round is
          * winning. A single-point curve is an item with no real protection model, and an empty one
          * would draw an axis with no data, so both are gated on length rather than on truthiness.
          */}
        {!!item.stats.penetrationChanceCurve?.length && (
            <>
                <BallisticCurveChart
                    title="Penetration Chance Curve"
                    curves={[{
                        name: 'Penetration Chance',
                        data: item.stats.penetrationChanceCurve,
                        color: CURVE_COLOR.chance
                    }]}
                    xLabel="Armor Class - Penetration"
                    yLabel="Chance"
                    height={250}
                />
                <p className="mt-2 text-xs text-ink-500">
                    Rolled per shot, not a threshold: the game draws a number and the shot goes
                    through when this chance beats it. Two shots with identical stats can land
                    differently.
                </p>
            </>
        )}

        {!!item.stats.penetrationDamageScalarCurve?.length && (
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
                <p className="mt-2 text-xs text-ink-500">
                    Applies only to shots that got through. The curve is sampled down to −2, so
                    beating the armour by a full class already means full damage — there is no
                    further reward past that, and no penalty either.
                </p>
            </div>
        )}

        {!!item.stats.antiPenetrationDurabilityScalarCurve?.length && (
            <div className="mt-4">
                <BallisticCurveChart
                    title="Durability Effectiveness"
                    curves={[{
                        name: 'Armor Effectiveness',
                        data: item.stats.antiPenetrationDurabilityScalarCurve,
                        color: CURVE_COLOR.effectiveness
                    }]}
                    xLabel="Missing Durability %"
                    xLabelModifier={100}
                    yLabel="Effectiveness"
                    height={250}
                />
                <p className="mt-2 text-xs text-ink-500">
                    Multiplies the armour class as the plate wears. Broken armour is a special case
                    the curve does not cover: at zero durability every shot penetrates outright.
                </p>
            </div>
        )}
    </>

}
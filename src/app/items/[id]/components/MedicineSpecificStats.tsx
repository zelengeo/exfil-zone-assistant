import React from "react";
import {
    Bandage, Bone, Cross,
    Gauge, Hash,
    Sparkles,
    Timer,
} from "lucide-react";
import {Medicine} from "@/types/items";
import {isBandage, isLimbRestore, isPainkiller, isStim, isSyringe} from "@/app/combat-sim/utils/types";
import {type MedicinePerk, medicinePerkOf, perkEarnsPanel} from "@/lib/medical/perks";
import SourceNote from "@/components/ui/confidence";
import StatLine, {StatGrid, StatPanel} from "./StatLine";

/** A yes/no that carries a judgement — green for the answer you want. */
function YesNo({value}: { value: boolean }) {
    return <span className={value ? 'text-good' : 'text-ink-600'}>{value ? 'Yes' : 'No'}</span>;
}

export default function MedicineSpecificStats({item}: { item: Medicine }) {
    const perk = medicinePerkOf(item.stats);
    // A perk that only repeats the item's own name is not worth a panel - see `perkEarnsPanel`.
    const showPerk = perk !== null && perkEarnsPanel(perk, item.name);

    return <div className="space-y-5">
        {/* What it does to you, before what it costs to use. */}
        {perk && showPerk && <PerkPanel perk={perk}/>}

        {/* Bandages */}
        {isBandage(item) && (
            <StatGrid>
                <StatLine
                    icon={<Bandage size={14}/>}
                    label="Heals deep wound"
                    value={<YesNo value={Boolean(item.stats.canHealDeepWound)}/>}
                />
            </StatGrid>
        )}

        {/* Limb Restorers */}
        {isLimbRestore(item) && (
            <StatGrid>
                <StatLine
                    icon={<Cross size={14}/>}
                    label="Max HP penalty"
                    value={`${(item.stats.hpPercentage * 100).toFixed(0)}%`}
                />
                <StatLine icon={<Timer size={14}/>} label="Use time" value={`${item.stats.useTime}s`}/>
                <StatLine icon={<Hash size={14}/>} label="Uses count" value={item.stats.usesCount}/>
                <StatLine icon={<Bone size={14}/>} label="HP after restore" value={item.stats.brokenHP}/>
            </StatGrid>
        )}

        {/* Painkillers */}
        {isPainkiller(item) && (
            <>
                <StatGrid>
                    <StatLine icon={<Timer size={14}/>} label="Duration" value={`${item.stats.effectTime}s`}/>
                    <StatLine icon={<Hash size={14}/>} label="Uses count" value={item.stats.usesCount}/>
                </StatGrid>
                <StatPanel title="Side effects">
                    <div className="space-y-2">
                        <StatLine
                            label="Energy cost"
                            value={<span className="text-warn">{item.stats.energyFactor}/s</span>}
                        />
                        <StatLine
                            label="Hydration effect"
                            value={<span className="text-warn">{item.stats.hydraFactor}/s</span>}
                        />
                        <StatLine label="Side effect duration" value={`${item.stats.sideEffectTime}s`}/>
                    </div>
                </StatPanel>
            </>
        )}

        {/* Syringes */}
        {isSyringe(item) && (
            <>
                <StatGrid>
                    <StatLine icon={<Cross size={14}/>} label="Total healing" value={`${item.stats.capacity} HP`}/>
                    <StatLine icon={<Gauge size={14}/>} label="Healing speed" value={`${item.stats.cureSpeed} HP/s`}/>
                </StatGrid>
                <StatPanel title="Additional effects">
                    <StatLine
                        label="Reduce bleeding"
                        value={<YesNo value={Boolean(item.stats.canReduceBleeding)}/>}
                    />
                </StatPanel>
            </>
        )}

        {/* Stims */}
        {isStim(item) && (
            <>
                <StatGrid>
                    <StatLine icon={<Gauge size={14}/>} label="Use time" value={`${item.stats.useTime}s`}/>
                    <StatLine icon={<Timer size={14}/>} label="Effect duration" value={`${item.stats.effectTime}s`}/>
                </StatGrid>
                {/*
                  * The panel that used to close here said "some stimulants have side effects, such
                  * as increased hunger and thirst consumption". The perk panel above now prints
                  * those as figures per item, so the sentence was restating visible data - the
                  * disclosure ladder's first question is whether the text needs to exist at all.
                  * A stim with no perk effects keeps the general note, since nothing replaced it.
                  */}
                {!(showPerk && perk.effects.length > 0) && (
                    <StatPanel title="Usage notes">
                        <p className="text-xs text-ink-400 leading-relaxed">
                            High-performance combat stimulants with specialized effects. Use
                            strategically before combat or specific activities.
                        </p>
                    </StatPanel>
                )}
            </>
        )}
    </div>
}

/**
 * What the item does to you while its perk is up.
 *
 * This is the question a player actually arrives with — the KB-22 and the P4 cost about the same
 * and do entirely different things — and until the perk data landed the page could not answer it.
 * So it goes above the use-cost figures rather than below them.
 *
 * Three shapes, all in the data:
 *
 * - **Effects, some of which are costs.** Two of the six targets are drains, so `+0.3/s` on energy
 *   is a price and `+30%` on carry weight is the point. `cost` on each row decides the colour;
 *   nothing here reads the sign.
 * - **A perk with no effects.** Every painkiller, and morphine. The panel still earns its place —
 *   that morphine applies the painkiller perk is not otherwise on the page — but it is one line.
 * - **A comedown.** Only the P4 has one, and it is a second window rather than a modifier on the
 *   first, so it is drawn as its own group with its own duration.
 *
 * The `Unverified` tag is the app's standing word for a figure read out of the game's files that
 * nobody has confirmed in play, and it applies doubly here: the item-to-perk link is Blueprint
 * graph code rather than data, so it was curated by hand. `components/ui/confidence.tsx` owns the
 * vocabulary. Tier 3 by the disclosure ladder — the effects are data the reader came for, where
 * they came from is provenance.
 */
function PerkPanel({perk}: { perk: MedicinePerk }) {
    return (
        <StatPanel
            title={perk.name}
            icon={<Sparkles size={14}/>}
            note={perk.duration === null ? undefined : `${perk.duration}s`}
            action={
                <SourceNote
                    level="unverified"
                    heading="Perk"
                    rows={[
                        {label: 'Perk class', value: perk.key},
                        ...(perk.duration === null
                            ? []
                            : [{label: 'Duration', value: `${perk.duration}s`}]),
                    ]}
                    side="left"
                    align="start"
                >
                    Read out of the game files, never timed in a raid. The item-to-perk link is
                    curated by hand, because the game holds it in code rather than in data.
                </SourceNote>
            }
        >
            {perk.effects.length === 0 ? (
                <p className="text-xs text-ink-600">
                    No modifiers listed &mdash; the perk is a state rather than a set of numbers.
                </p>
            ) : (
                <div className="space-y-2">
                    {perk.effects.map(effect => (
                        <StatLine
                            key={effect.attribute}
                            label={effect.label}
                            value={<span className={effect.cost ? 'text-warn' : 'text-good'}>{effect.value}</span>}
                        />
                    ))}
                </div>
            )}

            {perk.after && (
                <div className="mt-4 border-t border-line-800 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                        <h5 className="eyebrow text-warn">Afterwards</h5>
                        {perk.after.duration !== null && (
                            <span className="micro-label text-ink-700">{perk.after.duration}s</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        {perk.after.effects.map(effect => (
                            <StatLine
                                key={effect.attribute}
                                label={effect.label}
                                value={<span className={effect.cost ? 'text-warn' : 'text-good'}>{effect.value}</span>}
                            />
                        ))}
                    </div>
                </div>
            )}
        </StatPanel>
    );
}

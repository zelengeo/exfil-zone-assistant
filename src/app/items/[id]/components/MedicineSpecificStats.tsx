import React from "react";
import {
    Bandage, Bone, Cross,
    Gauge, Hash,
    Timer,
} from "lucide-react";
import {Medicine} from "@/types/items";
import {isBandage, isLimbRestore, isPainkiller, isStim, isSyringe} from "@/app/combat-sim/utils/types";
import StatLine, {StatGrid, StatPanel} from "./StatLine";

/** A yes/no that carries a judgement — green for the answer you want. */
function YesNo({value}: { value: boolean }) {
    return <span className={value ? 'text-good' : 'text-ink-600'}>{value ? 'Yes' : 'No'}</span>;
}

export default function MedicineSpecificStats({item}: { item: Medicine }) {
    return <div className="space-y-5">
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
                <StatPanel title="Usage notes">
                    <p className="text-xs text-ink-400 leading-relaxed">
                        High-performance combat stimulants with specialized effects. Use strategically
                        before combat or specific activities.
                    </p>
                    <p className="text-xs text-warn leading-relaxed mt-2 border-l border-warn/50 pl-3">
                        Some stimulants have side effects, such as increased hunger and thirst
                        consumption.
                    </p>
                </StatPanel>
            </>
        )}
    </div>
}

import React from "react";
import {
    Bandage, Bone, Cross,
    Gauge, Hash,
    Timer,
} from "lucide-react";
import {Medicine} from "@/types/items";
import {isBandage, isLimbRestore, isPainkiller, isStim, isSyringe} from "@/app/combat-sim/utils/types";


export default function MedicineSpecificStats({item}: { item: Medicine }) {
    return <>
        {/* Bandages */}
        {isBandage(item) && (
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Bandage size={18} className="text-olive-400"/>
                    <span className="text-tan-400">Heals Deep Wound:</span>
                    <span className={`${item.stats.canHealDeepWound ? 'text-green-400' : 'text-red-400'}`}>
                                    {item.stats.canHealDeepWound ? 'Yes' : 'No'}</span>
                </div>
            </div>
        )}

        {/* Limb Restorers */}
        {isLimbRestore(item) && (
            <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Cross size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Max HP Penalty:</span>
                        <span
                            className="text-tan-100">{(item.stats.hpPercentage * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Timer size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Use Time:</span>
                        <span className="text-tan-100">{item.stats.useTime}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Hash size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Uses Count:</span>
                        <span className="text-tan-100">{item.stats.usesCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bone size={18} className="text-olive-400"/>
                        <span className="text-tan-400">HP after restore:</span>
                        <span className="text-tan-100">{item.stats.brokenHP}</span>
                    </div>
                </div>
            </>
        )}

        {/* Painkillers */}
        {isPainkiller(item) && (
            <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Timer size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Duration:</span>
                        <span className="text-tan-100">{item.stats.effectTime}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Hash size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Uses Count:</span>
                        <span className="text-tan-100">{item.stats.usesCount}</span>
                    </div>
                </div>
                <div className="military-card p-4 rounded-sm">
                    <h4 className="text-olive-400 font-medium mb-3">Side Effects</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-tan-400">Energy Cost:</span>
                            <span className="text-red-400">{(item.stats.energyFactor)}/s</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-tan-400">Hydration Effect:</span>
                            <span className="text-red-400">{(item.stats.hydraFactor)}/s</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-tan-400">Side Effect Duration:</span>
                            <span className="text-yellow-400">{item.stats.sideEffectTime}s</span>
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* Syringes */}
        {isSyringe(item) && (
            <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Cross size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Total Healing:</span>
                        <span className="text-tan-100">{item.stats.capacity} HP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Gauge size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Healing Speed:</span>
                        <span className="text-tan-100">{item.stats.cureSpeed} HP/s</span>
                    </div>
                </div>
                <div className="military-card p-4 rounded-sm">
                    <h4 className="text-olive-400 font-medium mb-3">Additional Effects</h4>
                    <div className="flex p-4 justify-between">
                        <span className="text-tan-400">Reduce Bleeding:</span>
                        <span
                            className={`${item.stats.canReduceBleeding ? 'text-green-400' : 'text-red-400'}`}>
                                    {item.stats.canReduceBleeding ? 'Yes' : 'No'}
                                </span>
                    </div>
                </div>
            </>
        )}

        {/* Stims */}
        {isStim(item) && (
            <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Gauge size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Use Time:</span>
                        <span className="text-tan-100">{item.stats.useTime}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Timer size={18} className="text-olive-400"/>
                        <span className="text-tan-400">Effect Duration:</span>
                        <span className="text-tan-100">{item.stats.effectTime}s</span>
                    </div>
                </div>

                <div className="military-card p-4 rounded-sm">
                    <h4 className="text-olive-400 font-medium mb-3">Usage Notes</h4>
                    <div className="space-y-2 text-sm">
                        <p className="text-tan-300">
                            High-performance combat stimulants with specialized effects. Use strategically
                            before combat or specific activities.
                        </p>
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-2 mt-2">
                            <p className="text-yellow-200 text-xs">
                                <strong>Warning:</strong> Some stimulants may have side effects like
                                increased hunger/thirst consumption.
                            </p>
                        </div>
                    </div>
                </div>
            </>
        )}
    </>

}
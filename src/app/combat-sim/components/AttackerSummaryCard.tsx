import React from 'react';
import {ATTACKER_COLORS, AttackerSetup, DisplayMode, ZoneCalculation} from '../utils/types';
import {formatTTK, formatSTK, formatCTK} from '../utils/combat-calculations';

interface AttackerSummaryCardProps {
    attacker: AttackerSetup;
    index: number;
    isSelected: boolean;
    displayMode: DisplayMode;
    zoneCalculations?: ZoneCalculation[];
    onSelect: () => void;
}

export default function AttackerSummaryCard({
                                                attacker,
                                                isSelected,
                                                displayMode,
                                                zoneCalculations = [],
                                                onSelect
                                            }: AttackerSummaryCardProps) {

    // Find best values for each body region
    const getHeadValue = () => {
        // Head zones: head_top, head_eyes, head_chin
        const headZones = ['head_top', 'head_eyes', 'head_chin'];
        const headCalcs = zoneCalculations.filter(c => headZones.includes(c.zoneId));

        if (headCalcs.length === 0) return '--';

        // Find best (lowest) value among head zones
        const bestCalc = headCalcs.reduce((best, current) => {
            const currentValue = displayMode === 'ttk' ? current.ttk :
                displayMode === 'stk' ? current.shotsToKill :
                    current.costToKill;
            const bestValue = displayMode === 'ttk' ? best.ttk :
                displayMode === 'stk' ? best.shotsToKill :
                    best.costToKill;
            return currentValue < bestValue ? current : best;
        });

        switch (displayMode) {
            case 'ttk':
                return formatTTK(bestCalc.ttk);
            case 'stk':
                return formatSTK(bestCalc.shotsToKill);
            case 'ctk':
                return formatCTK(bestCalc.costToKill);
        }
    };

    const getChestValue = () => {
        // Chest zones: spine_01, spine_02
        const chestZones = ['spine_01', 'spine_02'];
        const chestCalcs = zoneCalculations.filter(c => chestZones.includes(c.zoneId));

        if (chestCalcs.length === 0) return '--';

        // Use average for chest (both zones are equally likely to hit)
        const avgValue = chestCalcs.reduce((sum, calc) => {
            const value = displayMode === 'ttk' ? calc.ttk :
                displayMode === 'stk' ? calc.shotsToKill :
                    calc.costToKill;
            return sum + value;
        }, 0) / chestCalcs.length;

        switch (displayMode) {
            case 'ttk':
                return formatTTK(avgValue);
            case 'stk':
                return formatSTK(Math.round(avgValue));
            case 'ctk':
                return formatCTK(avgValue);
        }
    };

    const getLimbValue = () => {
        // Limb zones - typically unarmored
        const limbZones = ['arm_lower_l', 'arm_lower_r', 'leg_lower_l', 'leg_lower_r'];
        const limbCalc = zoneCalculations.find(c => limbZones.includes(c.zoneId));

        if (!limbCalc) return '--';

        // All limbs typically have same values when unarmored, so just use first
        const calc = limbCalc;

        switch (displayMode) {
            case 'ttk':
                return formatTTK(calc.ttk);
            case 'stk':
                return formatSTK(calc.shotsToKill);
            case 'ctk':
                return formatCTK(calc.costToKill);
        }
    };

    const hasValidSetup = attacker.weapon && attacker.ammo;

    return (
        <button
            onClick={onSelect}
            className={`
                w-full p-3 rounded-sm transition-all
                ${isSelected
                ? `military-box-highlight border-2 ${ATTACKER_COLORS[attacker.id].class} bg-military-800/60`
                : 'military-box hover:bg-military-800/40 border-2 border-transparent'
            }
            `}
        >
            <div className="flex flex-col gap-2">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/*Color indicator badge*/}
                        <div
                            className="w-1 h-8 rounded-full"
                            style={{backgroundColor: ATTACKER_COLORS[attacker.id].hex}}
                        />
                        {hasValidSetup && (
                            <span className="text-xs text-tan-400">
                {attacker.weapon?.name.split(' ').slice(-1)[0]} • {attacker.ammo?.name}
            </span>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                {hasValidSetup ? (
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                            <div className="text-xs text-tan-400">Head</div>
                            <div className="font-mono font-bold text-tan-100">{getHeadValue()}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-tan-400">Chest</div>
                            <div className="font-mono font-bold text-tan-100">{getChestValue()}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-tan-400">Limbs</div>
                            <div className="font-mono font-bold text-tan-100">{getLimbValue()}</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-tan-400 text-sm py-2">
                        No weapon configured
                    </div>
                )}
            </div>
        </button>
    );
}
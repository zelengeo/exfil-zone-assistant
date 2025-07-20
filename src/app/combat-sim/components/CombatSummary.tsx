import React from 'react';
import {Shield, Heart, Calculator, PanelLeftOpen, PanelLeftClose} from 'lucide-react';
import {
    ARMOR_ZONES,
    getArmorClassColor,
    getBodyPartForArmorZone,
    getZoneArmorClass
} from "@/app/combat-sim/utils/body-zones";
import {ATTACKER_COLORS, AttackerSetup, CombatSimulation, ZoneCalculation} from "@/app/combat-sim/utils/types";
import {formatCTK, formatSTK, formatTTK} from "@/app/combat-sim/utils/combat-calculations";

interface CombatSummaryProps {
    simulation: CombatSimulation;
    zoneCalculations: Record<string, ZoneCalculation[]>;
    validAttackers: AttackerSetup[]
}

export default function CombatSummary({zoneCalculations, simulation, validAttackers}: CombatSummaryProps) {

    const [showDetailedAnalysis, setShowDetailedAnalysis] = React.useState(false);

    // Group zones by protection characteristics
    const zoneGroups: Record<string, {
        zones: string[],
        armorClass: number,
        label: string
    }> = {};

    // Helper to get zone calculation for a specific attacker and zone
    const getZoneCalc = (attackerId: string, zoneId: string) => {
        return zoneCalculations[attackerId]?.find(calc => calc.zoneId === zoneId);
    };

    // Head protection group
    const headClass = getZoneArmorClass('head_top', simulation.defender);
    zoneGroups['head'] = {
        zones: ['head_top', 'head_eyes', 'head_chin'],
        armorClass: headClass,
        label: 'Head'
    };

    // Chest protection group
    const chestClass = getZoneArmorClass('spine_01', simulation.defender);
    zoneGroups['chest'] = {
        zones: ['spine_01', /*'spine_02'*/],
        armorClass: chestClass,
        label: 'Chest'
    };

    // Stomach/Pelvis protection groups
    const stomachClass = getZoneArmorClass('spine_03', simulation.defender);
    const pelvisClass = getZoneArmorClass('pelvis', simulation.defender);

    if (stomachClass === pelvisClass) {
        zoneGroups['stomach'] = {
            zones: ['spine_03', /*'pelvis'*/],
            armorClass: stomachClass,
            label: 'Stomach'
        };
    } else {
        zoneGroups['stomach'] = {
            zones: ['spine_03'],
            armorClass: stomachClass,
            label: 'Stomach'
        };
        if (pelvisClass > 0) {
            zoneGroups['pelvis'] = {
                zones: ['pelvis'],
                armorClass: pelvisClass,
                label: 'Pelvis'
            };
        }
    }

    zoneGroups['upper_arms'] = {
        zones: ["UpperArm_L", /*"UpperArm_R"*/],
        armorClass: getZoneArmorClass('UpperArm_L', simulation.defender),
        label: 'Upper Arms'
    };

    zoneGroups['lower_arms'] = {
        zones: ["arm_lower_l", /*"arm_lower_r"*/],
        armorClass: 0,
        label: 'Forearms'
    };

    zoneGroups['hands'] = {
        zones: ["hand_l", /*"hand_r"*/],
        armorClass: 0,
        label: 'Hands'
    };

    zoneGroups['thighs'] = {
        zones: ["Thigh_L", /*"Thigh_R"*/],
        armorClass: getZoneArmorClass('Thigh_L', simulation.defender),
        label: 'Thighs'
    };

    zoneGroups['lower_legs'] = {
        zones: ["leg_lower_l", /*"leg_lower_r"*/],
        armorClass: 0,
        label: 'Lower Legs'
    };

    zoneGroups['foots'] = {
        zones: ["foot_l", /*"foot_r"*/],
        armorClass: 0,
        label: 'Foots'
    };

    return <div className="mt-8">
        <button
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className="text-xl font-bold px-3 py-1 border border-olive-500 bg-military-800/80 mb-3 text-olive-400 military-stencil flex items-center gap-2"
        >
            <Calculator size={20}/>
            STATS FOR NERDS
            {showDetailedAnalysis ? <PanelLeftClose size={20}/> : <PanelLeftOpen size={20}/>}
        </button>
        { showDetailedAnalysis &&
        <div className="military-box p-6 rounded-sm">
            {/* Zone Groups */}
            <div className="space-y-6">
                {Object.entries(zoneGroups).map(([groupId, group]) => {
                    // Check if any attacker has valid data for this group
                    const hasData = validAttackers.some(attacker =>
                        group.zones.some(zoneId => getZoneCalc(attacker.id, zoneId))
                    );

                    if (!hasData) return null;

                    return (
                        <div key={groupId} className="space-y-3">
                            {/* Group Header */}
                            <div className="flex items-center gap-3">
                                <h4 className="text-lg font-semibold text-tan-200">
                                    {group.label}
                                </h4>
                                {group.armorClass > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Shield size={16}/>
                                        <span
                                            className={`text-sm ${getArmorClassColor(group.armorClass).text}`}>
                                                Class {group.armorClass}
                                            </span>
                                    </div>
                                )}
                            </div>

                            {/* Zone Details */}
                            <div className="space-y-4">
                                {group.zones.map(zoneId => {
                                    const zone = ARMOR_ZONES[zoneId];
                                    const bodyPart = getBodyPartForArmorZone(zoneId);
                                    if (!zone || !bodyPart) return null;

                                    return (
                                        <div key={zoneId} className="military-card p-4 rounded-sm">
                                            {/* Zone Info */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                        <span className="text-tan-300 font-medium">
                                                            {zone.name}
                                                        </span>
                                                    <div
                                                        className="flex items-center gap-2 text-sm text-tan-400">
                                                        <Heart size={14}/>
                                                        <span>{bodyPart.hp} HP</span>
                                                        {bodyPart.isVital && (
                                                            <span
                                                                className="text-red-400 text-xs font-semibold">
                                                                    VITAL
                                                                </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Attacker Results */}
                                            <div className="space-y-3">
                                                {validAttackers.map((attacker) => {
                                                    const calc = getZoneCalc(attacker.id, zoneId);
                                                    if (!calc) return null;


                                                    return (
                                                        <div key={attacker.id}
                                                             className="space-y-2">
                                                            {/* Attacker Header */}
                                                            <div
                                                                className="flex items-center gap-3">
                                                                <div
                                                                    className={`w-3 h-3 rounded-sm ${ATTACKER_COLORS[attacker.id].class.replace('text-', 'bg-')}`}/>
                                                                <span
                                                                    className={`font-medium ${ATTACKER_COLORS[attacker.id].class}`}>
                                                                        {ATTACKER_COLORS[attacker.id].name}
                                                                    </span>
                                                                <div
                                                                    className="flex items-center gap-4 text-sm text-tan-400">
                                                                    <span>STK: {formatSTK(calc.shotsToKill)}</span>
                                                                    <span>TTK: {formatTTK(calc.ttk)}</span>
                                                                    <span>Cost: {formatCTK(calc.costToKill)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Shot Details */}
                                                            <div
                                                                className="flex flex-wrap gap-1 pl-6">
                                                                {calc.shots.map((shot, shotIndex) => (
                                                                        <div
                                                                            key={shotIndex}
                                                                            className="inline-flex items-center gap-1 text-xs military-card px-2 py-1 rounded-sm"
                                                                            title={`Shot #${shotIndex + 1}|${shot.isPenetrating ? "" : "No"} Penetration|HP damage ${shot.damageToBodyPart.toFixed(2)}|Armor Damage ${shot.damageToArmor.toFixed(2)}|Penetration chance ${(shot.penetrationChance * 100).toFixed(2)}% `}
                                                                        >
                                                                            {/* Shot number */}
                                                                            <span
                                                                                className="text-tan-600 font-mono">
                    {shotIndex + 1}.
                </span>

                                                                            {/* Penetration indicator */}
                                                                            <span
                                                                                className={`font-bold ${shot.isPenetrating ? 'text-green-400' : 'text-yellow-400'}`}>
                    {shot.isPenetrating ? '✓' : '○'}
                </span>

                                                                            {/* Damage */}
                                                                            <span
                                                                                className="text-red-400">
                    {shot.damageToBodyPart.toFixed(1)}❤
                </span>

                                                                            {/* Armor damage (if any) */}
                                                                            {shot.damageToArmor > 0 && (
                                                                                <span
                                                                                    className="text-blue-400">
                        {shot.damageToArmor.toFixed(1)}🛡
                    </span>
                                                                            )}

                                                                            {/* Penetration chance */}
                                                                            <span
                                                                                className="text-tan-500">
                    {(shot.penetrationChance * 100).toFixed(1)}%
                </span>

                                                                            {/* Remaining stats separator */}
                                                                            <span
                                                                                className="text-military-600">|</span>

                                                                            {/* Remaining HP */}
                                                                            <span
                                                                                className={`${shot.remainingHp >= 0 ? 'text-red-400' : 'text-tan-400'}`}>
                    {shot.remainingHp.toFixed(1)}❤
                </span>

                                                                            {/* Remaining Armor (if protected) */}
                                                                            {calc.isProtected && (
                                                                                <span
                                                                                    className={`${shot.remainingArmorDurability === 0 ? 'text-gray-500' : 'text-blue-400'}`}>
                        {shot.remainingArmorDurability.toFixed(1)}🛡
                    </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }).filter(Boolean)
                }
            </div>
        </div>}
    </div>


}
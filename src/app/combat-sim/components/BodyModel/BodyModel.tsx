import React, {useState} from 'react';
import Image from 'next/image';
import {Shield, Heart, Info} from 'lucide-react';
import {
    ARMOR_ZONES,
    getArmorClassColor,
    getBodyPartForArmorZone, getZoneArmorClass
} from '../../utils/body-zones';
import {
    ATTACKER_COLORS, AttackerSetup,
    CombatSimulation,
    ZoneCalculation
} from '../../utils/types';
import {formatCTK, formatSTK, formatTTK} from "@/app/combat-sim/utils/combat-calculations";

interface BodyModelProps {
    simulation: CombatSimulation,
    validAttackers: AttackerSetup[],
    zoneCalculations?: Record<string, ZoneCalculation[]>;
    selectedAttackerId?: string;
}

export default function BodyModel({
                                      simulation,
                                      validAttackers,
                                      zoneCalculations = {},
                                      selectedAttackerId
                                  }: BodyModelProps) {
    const {defender, displayMode} = simulation;

    const [hoveredZone, setHoveredZone] = useState<string | null>(null);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    // Get armor class for a specific zone

    const getZonePenetrationDamageReduction = (zoneId: string): string => {
        const zone = ARMOR_ZONES[zoneId];
        if (!zone) return "0%";

        if (zone.defaultProtection === 'helmet' && defender.helmet) {
            const protectiveZone = defender.helmet.stats.protectiveData?.find(
                pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
            );

            if (protectiveZone || defender.faceShield) {
                //Currently, it seems, FaceShield acts as extension to the helmet so, else we would'we get faceShield class
                return ((1 - defender.helmet.stats.penetrationDamageScalarCurve[1].value) * 100).toFixed(0) + "%"
            }
        }

        if (zone.defaultProtection === 'armor' && defender.bodyArmor) {
            const protectiveZone = defender.bodyArmor.stats.protectiveData?.find(
                pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
            );

            if (protectiveZone) {
                return ((1 - defender.bodyArmor.stats.penetrationDamageScalarCurve[1].value) * 100).toFixed(0) + "%"
            }
        }

        return "0%"
    }

    const getZoneBluntDamageReduction = (zoneId: string): string => {
        const zone = ARMOR_ZONES[zoneId];
        if (!zone) return "0%";

        if (zone.defaultProtection === 'helmet' && defender.helmet) {
            const protectiveZone = defender.helmet.stats.protectiveData?.find(
                pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
            );

            if (protectiveZone) {
                //Currently, it seems, FaceShield acts as extension to the helmet so, else we would'we get faceShield class
                return ((1 - protectiveZone.bluntDamageScalar) * 100).toFixed(0) + "%"
            }

            if (defender.faceShield) return ((1 - defender.helmet.stats.bluntDamageScalar) * 100).toFixed(0) + "%"
        }

        if (zone.defaultProtection === 'armor' && defender.bodyArmor) {
            const protectiveZone = defender.bodyArmor.stats.protectiveData?.find(
                pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
            );

            if (protectiveZone) {
                return ((1 - protectiveZone.bluntDamageScalar) * 100).toFixed(0) + "%"
            }
        }

        return "0%";
    };

    // Get display value for a zone
    const getZoneDisplayValue = (zoneId: string): string => {
        if (!selectedAttackerId || !zoneCalculations[selectedAttackerId]) {
            return '--';
        }

        const calc = zoneCalculations[selectedAttackerId].find(c => c.zoneId === zoneId);
        if (!calc) return '--';

        switch (displayMode) {
            case 'ttk':
                return formatTTK(calc.ttk);
            case 'stk':
                return formatSTK(calc.shotsToKill);
            case 'ctk':
                return formatCTK(calc.costToKill);
            default:
                return '--';
        }
    };

    // Get color based on value (better = green, worse = red)
    const getValueColor = (zoneId: string): string => {
        if (!selectedAttackerId || !zoneCalculations[selectedAttackerId]) {
            return 'text-tan-400';
        }

        const calc = zoneCalculations[selectedAttackerId].find(c => c.zoneId === zoneId);
        if (!calc) return 'text-tan-400';

        let value: number;
        switch (displayMode) {
            case 'ttk':
                value = calc.ttk;
                if (value === Infinity) return 'text-red-500';
                if (value < 0.5) return 'text-green-400';
                if (value < 1) return 'text-lime-400';
                if (value < 2) return 'text-yellow-400';
                if (value < 3) return 'text-orange-400';
                return 'text-red-400';
            case 'stk':
                value = calc.shotsToKill;
                if (value === Infinity) return 'text-red-500';
                if (value <= 1) return 'text-green-400';
                if (value <= 3) return 'text-lime-400';
                if (value <= 7) return 'text-yellow-400';
                if (value <= 11) return 'text-orange-400';
                return 'text-red-400';
            case 'ctk':
                value = calc.costToKill;
                if (value === Infinity) return 'text-red-500';
                if (value < 100) return 'text-green-400';
                if (value < 300) return 'text-lime-400';
                if (value < 1000) return 'text-yellow-400';
                if (value < 2000) return 'text-orange-400';
                return 'text-red-400';
        }
    };

    // Get tooltip content
    const getTooltipContent = (zoneId: string) => {
        const zone = ARMOR_ZONES[zoneId];
        const bodyPart = getBodyPartForArmorZone(zoneId);
        const armorClass = getZoneArmorClass(zoneId, defender);
        // TODO there is a second part of tooltip which data is computed on the go - move it here

        return {
            zoneName: zone?.name || 'Unknown',
            bodyPartName: bodyPart?.name || 'Unknown',
            hp: bodyPart?.hp || 0,
            isVital: bodyPart?.isVital || false,
            armorClass
        };
    };

    return (
        <div className="relative">
            {/* Body Image Container */}
            <div className="relative mx-auto" style={{maxWidth: '300px', aspectRatio: '300/650'}}>
                {/* Background Image */}
                <Image
                    src="/images/Img_BodyPartsMain.webp"
                    alt="Body Parts"
                    className="absolute inset-0 size-150 object-contain"
                    width={300}
                    height={650}
                />

                {/* Interactive Zones Overlay */}
                <div className="absolute inset-0">
                    {Object.entries(ARMOR_ZONES).map(([zoneId, zone]) => {
                        const armorClass = getZoneArmorClass(zoneId, defender);
                        const armorColor = getArmorClassColor(armorClass);
                        const isHovered = hoveredZone === zoneId;
                        const isSelected = selectedZone === zoneId;
                        const displayValue = getZoneDisplayValue(zoneId);
                        const valueColor = getValueColor(zoneId);

                        return (
                            <div
                                key={zoneId}
                                className={`absolute cursor-pointer transition-all ${
                                    isHovered || isSelected ? 'z-20' : 'z-10'
                                }`}
                                style={{
                                    left: `${zone.displayPosition.x}%`,
                                    top: `${zone.displayPosition.y}%`,
                                    width: `${zone.displayPosition.width}%`,
                                    height: `${zone.displayPosition.height}%`
                                }}
                                onMouseEnter={() => setHoveredZone(zoneId)}
                                onMouseLeave={() => setHoveredZone(null)}
                                onClick={() => setSelectedZone(zoneId === selectedZone ? null : zoneId)}
                            >
                                {/* Zone Background with Armor Indication */}
                                <div
                                    className={`absolute inset-0 rounded-sm transition-all ${
                                        armorClass > 0
                                            ? `${armorColor.bg} ${isHovered || isSelected ? 'opacity-50' : 'opacity-25'}`
                                            : `bg-transparent ${isHovered || isSelected ? 'bg-red-500 opacity-20' : ''}`
                                    } ${
                                        isHovered || isSelected
                                            ? `ring-2 ${armorClass > 0 ? armorColor.border : 'ring-red-500'}`
                                            : ''
                                    }`}
                                />

                                {/* Display Value Badge */}
                                {selectedAttackerId && displayValue !== '--' && (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span
                                            className={`font-bold text-sm ${valueColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
                                            {displayValue}
                                        </span>
                                    </div>
                                )}

                                {/* Armor Class Indicator (when no attacker selected) */}
                                {!selectedAttackerId && armorClass > 0 && (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span
                                            className={`text-sm font-bold ${armorColor.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
                                            AC {armorClass}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Hover Tooltip */}
                {hoveredZone && (
                    <div className="absolute top-2 left-1 right-1 z-30 pointer-events-none">
                        <div className="military-card p-3 rounded-sm bg-military-900/95 border border-olive-600">
                            {(() => {
                                const tooltip = getTooltipContent(hoveredZone);
                                return (
                                    <>
                                        <h4 className="text-olive-400 font-bold mb-2">{tooltip.zoneName}</h4>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-tan-400">Body Part:</span>
                                                <span className="text-tan-100">
                                                    {tooltip.bodyPartName} ({tooltip.hp} HP)
                                                    {tooltip.isVital && (
                                                        <span className="text-red-400 ml-1">• Vital</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-tan-400">Armor Class:</span>
                                                <span className={getArmorClassColor(tooltip.armorClass).text}>
                                                    {tooltip.armorClass > 0 ? `Class ${tooltip.armorClass}` : 'None'}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                            {/* Attacker Performance Comparison */}
                            {validAttackers.length > 1 && Object.keys(zoneCalculations).length > 0 && (
                                <div className="border-t border-military-700 pt-3">
                                    <div className="text-tan-400 text-xs mb-2">
                                        {displayMode === 'ttk' ? 'Time to Kill' :
                                            displayMode === 'stk' ? 'Shots to Kill' :
                                                'Cost to Kill'} Comparison:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {validAttackers.map((attacker) => {
                                            const calculations = zoneCalculations[attacker.id];
                                            if (!calculations || !attacker.weapon || !attacker.ammo) return null;

                                            const calc = calculations.find(c => c.zoneId === hoveredZone);
                                            if (!calc) return null;

                                            let value = '--';
                                            switch (displayMode) {
                                                case 'ttk':
                                                    value = formatTTK(calc.ttk);
                                                    break;
                                                case 'stk':
                                                    value = formatSTK(calc.shotsToKill);
                                                    break;
                                                case 'ctk':
                                                    value = formatCTK(calc.costToKill);
                                                    break;
                                            }

                                            return (
                                                <div key={attacker.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{backgroundColor: ATTACKER_COLORS[attacker.id].hex}}
                                                        />
                                                        <span className="text-xs text-tan-300">
                                        {attacker.weapon.name.split(' ').slice(-1)[0]}
                                    </span>
                                                    </div>
                                                    <span className={`text-sm font-mono font-bold ${
                                                        attacker.id === selectedAttackerId
                                                            ? 'text-tan-100'
                                                            : 'text-tan-400'
                                                    }`}>
                                    {value}
                                </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
                {/* Armor Classes */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                    <span className="text-tan-400 font-medium">Protection:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500/30 rounded-sm border border-red-600"></div>
                        <span className="text-tan-400">None</span>
                    </div>
                    {[2, 3, 4, 5, 6].map(armorClass => {
                        const color = getArmorClassColor(armorClass);
                        return (
                            <div key={armorClass} className="flex items-center gap-2">
                                <div
                                    className={`w-4 h-4 rounded-sm border ${color.bg} ${color.border}`}
                                ></div>
                                <span className={color.text}>Class {armorClass}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Value Scale */}
                {selectedAttackerId && (
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                        <span className="text-tan-400 font-medium">
                            {displayMode === 'ttk' && 'Time to Kill:'}
                            {displayMode === 'stk' && 'Shots to Kill:'}
                            {displayMode === 'ctk' && 'Cost to Kill:'}
                        </span>
                        <span className="text-green-400">Excellent</span>
                        <span className="text-lime-400">Good</span>
                        <span className="text-yellow-400">Average</span>
                        <span className="text-orange-400">Poor</span>
                        <span className="text-red-400">Bad</span>
                    </div>
                )}
            </div>

            {/* Selected Zone Details */}
            {selectedZone && (
                <div className="mt-4 military-card p-4 rounded-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-olive-400 font-bold flex items-center gap-2">
                            <Shield size={16}/>
                            {ARMOR_ZONES[selectedZone]?.name}
                        </h4>
                        {getBodyPartForArmorZone(selectedZone)?.isVital && (
                            <span className="text-red-400 text-xs font-medium flex items-center gap-1">
                    <Heart size={12}/>
                    VITAL
                </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                            <span className="text-tan-400">Body Part:</span>
                            <p className="text-tan-100 font-medium">
                                {getBodyPartForArmorZone(selectedZone)?.name}
                            </p>
                        </div>
                        <div>
                            <span className="text-tan-400">Penetration Damage Reduction:</span>
                            <p className="text-tan-100 font-medium">
                                {getZonePenetrationDamageReduction(selectedZone)}
                            </p>
                        </div>

                        <div>
                            <span className="text-tan-400">Protection:</span>
                            <p className={`font-medium ${getArmorClassColor(getZoneArmorClass(selectedZone, defender)).text}`}>
                                {getZoneArmorClass(selectedZone, defender) > 0
                                    ? `Class ${getZoneArmorClass(selectedZone, defender)}`
                                    : 'Unarmored'}
                            </p>
                        </div>
                        <div>
                            <span className="text-tan-400">Blunt Damage Reduction:</span>
                            <p className="text-tan-100 font-medium">
                                {getZoneBluntDamageReduction(selectedZone)}
                            </p>
                        </div>
                    </div>
                    {/* Penetration chance comparison*/}
                    {validAttackers.length > 0 && Object.keys(zoneCalculations).length > 0 && (
                        <div className="border-t border-military-700 pt-3">
                            <div className="text-tan-400 text-xs mb-2">
                                First Shot Penetration Chance Comparison
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {validAttackers.map((attacker) => {
                                    const calculations = zoneCalculations[attacker.id];
                                    if (!calculations || !attacker.weapon || !attacker.ammo) return null;

                                    const calc = calculations.find(c => c.zoneId === selectedZone);
                                    if (!calc) return null;

                                    return (
                                        <div key={attacker.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{backgroundColor: ATTACKER_COLORS[attacker.id].hex}}
                                                />
                                                <span className="text-xs text-tan-300">
                                        {attacker.weapon.name.split(' ').slice(-1)[0]}
                                    </span>
                                            </div>
                                            <span className={`text-sm font-mono font-bold ${
                                                attacker.id === selectedAttackerId
                                                    ? 'text-tan-100'
                                                    : 'text-tan-400'
                                            }`}>
                                    {(calc.shots[0].penetrationChance * 100).toFixed(2)}%
                                </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>
            )}


            {/* Zone Summary by Protection Level */}
            {validAttackers.length > 0 && (
                <div className="mt-4 military-card p-4 rounded-sm">
                    <h4 className="text-olive-400 font-bold flex items-center gap-2">
                        <Info size={16}/>
                        Zone Summary:
                    </h4>
                    <div className="pt-3 mt-3">
                        {/* Column Headers */}
                        <div className="grid grid-cols-5 gap-1 mb-2 text-xs">
                            <div className="text-tan-400">Zone</div>
                            {validAttackers.map((attacker) => (
                                <div key={attacker.id} className="text-center">
                                    <div
                                        className="w-2 h-2 rounded-full mx-auto mb-1"
                                        style={{backgroundColor: ATTACKER_COLORS[attacker.id].hex}}
                                    />
                                    <div className={`text-tan-300 truncate ${
                                        attacker.id === selectedAttackerId ? 'font-bold' : ''
                                    }`}>
                                        {attacker.weapon ? attacker.weapon.name.split(' ').slice(-1)[0] : '--'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Zone Rows */}
                        <div className="space-y-1">
                            {(() => {
                                // Group zones by protection level
                                const zoneGroups: Record<string, { zones: string[], armorClass: number }> = {};

                                // Add head (always show)
                                const headClass = getZoneArmorClass('head_top', defender);
                                zoneGroups['Head'] = {zones: ['head_top'], armorClass: headClass};

                                // Add chest zones
                                const chestClass = getZoneArmorClass('spine_01', defender);
                                zoneGroups['Chest'] = {zones: ['spine_01', 'spine_02'], armorClass: chestClass};

                                // Add stomach zones
                                const stomachClass = getZoneArmorClass('spine_03', defender);
                                const pelvisClass = getZoneArmorClass('pelvis', defender);
                                if (stomachClass === pelvisClass) {
                                    zoneGroups['Stomach'] = {zones: ['spine_03', 'pelvis'], armorClass: stomachClass};
                                } else {
                                    zoneGroups['Stomach'] = {zones: ['spine_03'], armorClass: stomachClass};
                                    if (pelvisClass > 0) {
                                        zoneGroups['Pelvis'] = {zones: ['pelvis'], armorClass: pelvisClass};
                                    }
                                }

                                // Add thigh protection if exists
                                const upperArmsClass = getZoneArmorClass('UpperArm_L', defender);
                                if (upperArmsClass > 0) {
                                    zoneGroups['UpperArms'] = {
                                        zones: ['UpperArm_L', 'UpperArm_R'],
                                        armorClass: upperArmsClass
                                    };
                                }

                                // Add thigh protection if exists
                                const thighClass = getZoneArmorClass('Thigh_L', defender);
                                if (thighClass > 0) {
                                    zoneGroups['Thighs'] = {zones: ['Thigh_L', 'Thigh_R'], armorClass: thighClass};
                                }

                                // Add limbs (unprotected)
                                zoneGroups['Limbs'] = {zones: ['arm_lower_l', 'leg_lower_l'], armorClass: 0};

                                return Object.entries(zoneGroups).map(([groupName, group]) => (
                                    <div key={groupName}
                                         className="grid grid-cols-5 gap-1 items-center py-1 hover:bg-military-800/30 rounded-sm">
                                        <div className="text-xs text-tan-400">
                                            {groupName}
                                            {group.armorClass > 0 && (
                                                <span className={`ml-1 ${getArmorClassColor(group.armorClass).text}`}>
                                AC{group.armorClass}
                            </span>
                                            )}
                                        </div>
                                        {validAttackers.map((attacker) => {
                                            const calculations = zoneCalculations[attacker.id];
                                            if (!calculations || !attacker.weapon || !attacker.ammo) {
                                                return <div key={attacker.id}
                                                            className="text-center text-xs text-tan-500">--</div>;
                                            }

                                            const calc = calculations.find(c => group.zones.includes(c.zoneId));
                                            let value = '--';
                                            if (calc) {
                                                switch (displayMode) {
                                                    case 'ttk':
                                                        value = formatTTK(calc.ttk);
                                                        break;
                                                    case 'stk':
                                                        value = formatSTK(calc.shotsToKill);
                                                        break;
                                                    case 'ctk':
                                                        value = formatCTK(calc.costToKill);
                                                        break;
                                                }
                                            }

                                            return (
                                                <div key={attacker.id}
                                                     className={`text-center text-xs font-mono font-bold ${
                                                         attacker.id === selectedAttackerId
                                                             ? 'text-tan-100'
                                                             : 'text-tan-400'
                                                     }`}>
                                                    {value}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
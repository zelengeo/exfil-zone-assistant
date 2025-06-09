import React, { useState } from 'react';
import Image from 'next/image';
import { Shield, Heart } from 'lucide-react';
import {
    ARMOR_ZONES,
    getArmorClassColor,
    getBodyPartForArmorZone
} from '../../utils/body-zones';
import {
    DefenderSetup,
    DisplayMode,
    ZoneCalculation
} from '../../utils/types';

interface BodyModelProps {
    defender: DefenderSetup;
    displayMode: DisplayMode;
    zoneCalculations?: Record<string, ZoneCalculation[]>;
    selectedAttackerId?: string;
}

export default function BodyModel({
                                      defender,
                                      displayMode,
                                      zoneCalculations = {},
                                      selectedAttackerId
                                  }: BodyModelProps) {
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    // Get armor class for a specific zone
    const getZoneArmorClass = (zoneId: string): number => {
        const zone = ARMOR_ZONES[zoneId];
        if (!zone) return 0;

        //TODO probably rework head display - or it might be useful when they rework mask logic
        if (zone.defaultProtection === 'helmet' && defender.helmet) {
            const protectiveZone = defender.helmet.stats.protectiveData?.find(
                pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
            );

            if (!protectiveZone && defender.faceShield) {
                //Currently, it seems, FaceShield acts as extension to the helmet so, else we would'we get faceShield class
                return defender.helmet.stats.armorClass
            }

            return protectiveZone?.armorClass || 0
        }

        if (zone.defaultProtection === 'armor' && defender.bodyArmor) {
            const protectiveZone = defender.bodyArmor.stats.protectiveData?.find(
                pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
            );
            return protectiveZone?.armorClass || 0;
        }

        return 0;
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
                return calc.ttk === Infinity ? '∞' : `${calc.ttk.toFixed(1)}s`;
            case 'stk':
                return calc.shotsToKill === Infinity ? '∞' : calc.shotsToKill.toString();
            case 'ctk':
                return calc.costToKill === Infinity ? '∞' : `$${calc.costToKill}`;
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
                if (value <= 2) return 'text-lime-400';
                if (value <= 6) return 'text-yellow-400';
                if (value <= 10) return 'text-orange-400';
                return 'text-red-400';
            case 'ctk':
                value = calc.costToKill;
                if (value === Infinity) return 'text-red-500';
                if (value < 100) return 'text-green-400';
                if (value < 300) return 'text-lime-400';
                if (value < 500) return 'text-yellow-400';
                if (value < 1000) return 'text-orange-400';
                return 'text-red-400';
        }
    };

    // Get tooltip content
    const getTooltipContent = (zoneId: string) => {
        const zone = ARMOR_ZONES[zoneId];
        const bodyPart = getBodyPartForArmorZone(zoneId);
        const armorClass = getZoneArmorClass(zoneId);

        let calc = null;
        if (selectedAttackerId && zoneCalculations[selectedAttackerId]) {
            calc = zoneCalculations[selectedAttackerId].find(c => c.zoneId === zoneId);
        }

        return {
            zoneName: zone?.name || 'Unknown',
            bodyPartName: bodyPart?.name || 'Unknown',
            hp: bodyPart?.hp || 0,
            isVital: bodyPart?.isVital || false,
            armorClass,
            penetrationChance: calc?.penetrationChance || 0,
            effectiveDamage: calc?.effectiveDamage || 0,
            bluntDamage: calc?.bluntDamage || 0
        };
    };

    return (
        <div className="relative">
            {/* Body Image Container */}
            <div className="relative mx-auto" style={{ maxWidth: '300px', aspectRatio: '300/650' }}>
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
                        const armorClass = getZoneArmorClass(zoneId);
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
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className={`font-bold text-sm ${valueColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
                                            {displayValue}
                                        </span>
                                    </div>
                                )}

                                {/* Armor Class Indicator (when no attacker selected) */}
                                {!selectedAttackerId && armorClass > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className={`text-sm font-bold ${armorColor.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
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
                    <div className="absolute top-2 left-2 right-2 z-30 pointer-events-none">
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
                                            {selectedAttackerId && tooltip.penetrationChance > 0 && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span className="text-tan-400">Pen Chance:</span>
                                                        <span className="text-tan-100">
                                                            {(tooltip.penetrationChance * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-tan-400">Avg Damage:</span>
                                                        <span className="text-tan-100">
                                                            {tooltip.effectiveDamage.toFixed(1)}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
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
                            <Shield size={16} />
                            {ARMOR_ZONES[selectedZone]?.name}
                        </h4>
                        {getBodyPartForArmorZone(selectedZone)?.isVital && (
                            <span className="text-red-400 text-xs font-medium flex items-center gap-1">
                                <Heart size={12} />
                                VITAL
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-tan-400">Body Part:</span>
                            <p className="text-tan-100 font-medium">
                                {getBodyPartForArmorZone(selectedZone)?.name}
                            </p>
                        </div>
                        <div>
                            <span className="text-tan-400">HP:</span>
                            <p className="text-tan-100 font-medium">
                                {getBodyPartForArmorZone(selectedZone)?.hp}
                            </p>
                        </div>
                        <div>
                            <span className="text-tan-400">Protection:</span>
                            <p className={`font-medium ${getArmorClassColor(getZoneArmorClass(selectedZone)).text}`}>
                                {getZoneArmorClass(selectedZone) > 0
                                    ? `Class ${getZoneArmorClass(selectedZone)}`
                                    : 'Unarmored'}
                            </p>
                        </div>
                        {selectedAttackerId && zoneCalculations[selectedAttackerId] && (
                            <>
                                <div>
                                    <span className="text-tan-400">Pen Chance:</span>
                                    <p className="text-tan-100 font-medium">
                                        {(() => {
                                            const calc = zoneCalculations[selectedAttackerId].find(c => c.zoneId === selectedZone);
                                            return calc ? `${(calc.penetrationChance * 100).toFixed(0)}%` : '--';
                                        })()}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState } from 'react';
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

        if (zone.defaultProtection === 'helmet' && defender.helmet) {
            return defender.helmet.stats.armorClass;
        }

        if (zone.defaultProtection === 'armor' && defender.bodyArmor) {
            const protectiveZone = defender.bodyArmor.stats.protectiveData?.find(
                pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
            );
            return protectiveZone?.armorClass || defender.bodyArmor.stats.armorClass;
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
                if (value < 1) return 'text-green-400';
                if (value < 2) return 'text-lime-400';
                if (value < 3) return 'text-yellow-400';
                if (value < 5) return 'text-orange-400';
                return 'text-red-400';
            case 'stk':
                value = calc.shotsToKill;
                if (value === Infinity) return 'text-red-500';
                if (value <= 3) return 'text-green-400';
                if (value <= 5) return 'text-lime-400';
                if (value <= 8) return 'text-yellow-400';
                if (value <= 12) return 'text-orange-400';
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
            {/* Human Body SVG */}
            <svg
                viewBox="0 0 300 500"
                className="w-full h-full"
                style={{ maxHeight: '600px' }}
            >
                {/* Background gradient */}
                <defs>
                    <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#2a2f1f" />
                        <stop offset="100%" stopColor="#1a1c18" />
                    </radialGradient>

                    {/* Armor patterns */}
                    <pattern id="armorPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <rect width="4" height="4" fill="none" stroke="#454d28" strokeWidth="0.5" opacity="0.3" />
                    </pattern>
                </defs>

                <rect width="300" height="500" fill="url(#bgGradient)" />

                {/* Grid overlay for tactical feel */}
                <g opacity="0.1">
                    {[...Array(30)].map((_, i) => (
                        <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="500" stroke="#454d28" strokeWidth="0.5" />
                    ))}
                    {[...Array(50)].map((_, i) => (
                        <line key={`h${i}`} x1="0" y1={i * 10} x2="300" y2={i * 10} stroke="#454d28" strokeWidth="0.5" />
                    ))}
                </g>

                {/* Body outline - more detailed */}
                <g className="body-outline" stroke="#5c6534" strokeWidth="2" fill="none" opacity="0.8">
                    {/* Head */}
                    <ellipse cx="150" cy="50" rx="35" ry="40" />

                    {/* Neck */}
                    <path d="M 150 90 L 150 110" strokeWidth="3" />

                    {/* Shoulders */}
                    <path d="M 100 115 Q 150 110 200 115" />

                    {/* Torso */}
                    <path d="M 100 115 L 95 200 L 100 280 L 150 290 L 200 280 L 205 200 L 200 115"
                          fill="#2a2f1f" fillOpacity="0.3" />

                    {/* Arms */}
                    <path d="M 100 115 L 70 140 L 50 200 L 45 260" strokeWidth="3" />
                    <path d="M 200 115 L 230 140 L 250 200 L 255 260" strokeWidth="3" />

                    {/* Hands */}
                    <circle cx="45" cy="270" r="8" fill="#2a2f1f" fillOpacity="0.5" />
                    <circle cx="255" cy="270" r="8" fill="#2a2f1f" fillOpacity="0.5" />

                    {/* Legs */}
                    <path d="M 120 280 L 110 350 L 105 450" strokeWidth="3" />
                    <path d="M 180 280 L 190 350 L 195 450" strokeWidth="3" />

                    {/* Feet */}
                    <ellipse cx="105" cy="465" rx="15" ry="8" fill="#2a2f1f" fillOpacity="0.5" />
                    <ellipse cx="195" cy="465" rx="15" ry="8" fill="#2a2f1f" fillOpacity="0.5" />
                </g>

                {/* Armor Zones with values */}
                {Object.entries(ARMOR_ZONES).map(([zoneId, zone]) => {
                    const armorClass = getZoneArmorClass(zoneId);
                    const armorColor = getArmorClassColor(armorClass);
                    const isHovered = hoveredZone === zoneId;
                    const isSelected = selectedZone === zoneId;
                    const displayValue = getZoneDisplayValue(zoneId);
                    const valueColor = getValueColor(zoneId);

                    // Convert percentage positions to SVG coordinates
                    const x = (zone.displayPosition.x / 100) * 300;
                    const y = (zone.displayPosition.y / 100) * 500;
                    const width = (zone.displayPosition.width / 100) * 300;
                    const height = (zone.displayPosition.height / 100) * 500;

                    return (
                        <g key={zoneId}>
                            {/* Zone background */}
                            <rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                fill={armorClass > 0 ? armorColor.hex : '#e7d1a9'}
                                fillOpacity={isHovered || isSelected ? 0.4 : 0.2}
                                stroke={isHovered || isSelected ? '#9ba85e' : armorColor.hex}
                                strokeWidth={isHovered || isSelected ? 2 : 1}
                                strokeOpacity={0.8}
                                rx="2"
                                className="cursor-pointer transition-all"
                                onMouseEnter={() => setHoveredZone(zoneId)}
                                onMouseLeave={() => setHoveredZone(null)}
                                onClick={() => setSelectedZone(zoneId === selectedZone ? null : zoneId)}
                            />

                            {/* Armor pattern overlay */}
                            {armorClass > 0 && (
                                <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    fill="url(#armorPattern)"
                                    opacity={0.5}
                                    pointerEvents="none"
                                />
                            )}

                            {/* Display value badge */}
                            {selectedAttackerId && displayValue !== '--' && (
                                <g pointerEvents="none">
                                    {/* Badge background */}
                                    <rect
                                        x={x + width / 2 - 20}
                                        y={y + height / 2 - 10}
                                        width="40"
                                        height="20"
                                        fill="#1a1c18"
                                        fillOpacity="0.9"
                                        stroke={valueColor.replace('text-', '#').replace('-400', '').replace('-500', '')}
                                        strokeWidth="1"
                                        rx="2"
                                    />
                                    {/* Value text */}
                                    <text
                                        x={x + width / 2}
                                        y={y + height / 2 + 4}
                                        textAnchor="middle"
                                        className={`font-bold text-sm ${valueColor}`}
                                        fill="currentColor"
                                    >
                                        {displayValue}
                                    </text>
                                </g>
                            )}

                            {/* Armor class indicator */}
                            {armorClass > 0 && !selectedAttackerId && (
                                <text
                                    x={x + width / 2}
                                    y={y + height / 2 + 4}
                                    textAnchor="middle"
                                    className="text-xs font-medium"
                                    fill="#9ba85e"
                                    opacity="0.8"
                                    pointerEvents="none"
                                >
                                    C{armorClass}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Hover tooltip */}
                {hoveredZone && (
                    <g className="pointer-events-none">
                        <rect
                            x="10"
                            y="10"
                            width="280"
                            height="120"
                            fill="#1a1c18"
                            fillOpacity="0.95"
                            stroke="#9ba85e"
                            strokeWidth="1"
                            rx="4"
                        />

                        {(() => {
                            const tooltip = getTooltipContent(hoveredZone);
                            return (
                                <>
                                    <text x="20" y="30" fill="#9ba85e" fontSize="14" fontWeight="bold">
                                        {tooltip.zoneName}
                                    </text>
                                    <text x="20" y="50" fill="#e7d1a9" fontSize="12">
                                        Body Part: {tooltip.bodyPartName} ({tooltip.hp} HP)
                                    </text>
                                    <text x="20" y="68" fill="#e7d1a9" fontSize="12">
                                        {tooltip.isVital && (
                                            <tspan fill="#ef4444">Vital • </tspan>
                                        )}
                                        Armor Class: {tooltip.armorClass}
                                    </text>
                                    {selectedAttackerId && (
                                        <>
                                            <text x="20" y="90" fill="#e7d1a9" fontSize="12">
                                                Pen Chance: {(tooltip.penetrationChance * 100).toFixed(0)}%
                                            </text>
                                            <text x="20" y="108" fill="#e7d1a9" fontSize="12">
                                                Avg Damage: {tooltip.effectiveDamage.toFixed(1)}
                                            </text>
                                        </>
                                    )}
                                </>
                            );
                        })()}
                    </g>
                )}
            </svg>

            {/* Legend */}
            <div className="mt-4 space-y-2">
                {/* Armor Classes */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                    <span className="text-tan-400 font-medium">Protection:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-tan-200 rounded-sm border border-tan-400"></div>
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
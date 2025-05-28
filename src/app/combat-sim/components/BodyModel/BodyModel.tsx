import React, { useState } from 'react';
import {
    ARMOR_ZONES,
    BODY_PARTS,
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
    zoneCalculations?: Record<string, ZoneCalculation[]>; // Keyed by attacker ID
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

        // Check if zone is protected by helmet
        if (zone.defaultProtection === 'helmet' && defender.helmet) {
            // For now, assume helmet protects all head zones equally
            // In reality, you might check specific protective zones
            return defender.helmet.stats.armorClass;
        }

        // Check if zone is protected by body armor
        if (zone.defaultProtection === 'armor' && defender.bodyArmor) {
            // Check if this specific zone is in the armor's protective data
            const protectiveZone = defender.bodyArmor.protectiveData?.find(
                pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
            );
            return protectiveZone?.armorClass || defender.bodyArmor.stats.armorClass;
        }

        return 0; // Unarmored
    };

    // Get display value for a zone based on selected mode
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

    // Get heat color based on value (lower is better for all modes)
    const getHeatColor = (zoneId: string): string => {
        if (!selectedAttackerId || !zoneCalculations[selectedAttackerId]) {
            return 'rgba(255, 255, 255, 0.1)';
        }

        const calc = zoneCalculations[selectedAttackerId].find(c => c.zoneId === zoneId);
        if (!calc) return 'rgba(255, 255, 255, 0.1)';

        let value: number;
        switch (displayMode) {
            case 'ttk':
                value = calc.ttk;
                break;
            case 'stk':
                value = calc.shotsToKill;
                break;
            case 'ctk':
                value = calc.costToKill;
                break;
        }

        if (value === Infinity) return 'rgba(220, 38, 38, 0.3)'; // Red for impossible

        // Normalize value (adjust these based on typical ranges)
        const maxValue = displayMode === 'ttk' ? 10 : displayMode === 'stk' ? 30 : 500;
        const normalized = Math.min(value / maxValue, 1);

        // Green -> Yellow -> Red gradient
        if (normalized < 0.5) {
            // Green to Yellow
            const r = Math.floor(255 * (normalized * 2));
            const g = 255;
            return `rgba(${r}, ${g}, 0, 0.3)`;
        } else {
            // Yellow to Red
            const r = 255;
            const g = Math.floor(255 * (2 - normalized * 2));
            return `rgba(${r}, ${g}, 0, 0.3)`;
        }
    };

    return (
        <div className="relative">
            {/* SVG Body Model */}
            <svg
                viewBox="0 0 200 400"
                className="w-full h-full"
                style={{ maxHeight: '600px' }}
            >
                {/* Background */}
                <rect width="200" height="400" fill="#1a1c18" />

                {/* Body outline */}
                <g className="body-outline" stroke="#454d28" strokeWidth="2" fill="none">
                    {/* Head */}
                    <ellipse cx="100" cy="40" rx="25" ry="30" />

                    {/* Neck */}
                    <line x1="100" y1="70" x2="100" y2="85" />

                    {/* Torso */}
                    <rect x="70" y="85" width="60" height="110" rx="5" />

                    {/* Arms */}
                    <line x1="70" y1="95" x2="45" y2="120" /> {/* Left upper arm */}
                    <line x1="45" y1="120" x2="40" y2="170" /> {/* Left lower arm */}
                    <line x1="130" y1="95" x2="155" y2="120" /> {/* Right upper arm */}
                    <line x1="155" y1="120" x2="160" y2="170" /> {/* Right lower arm */}

                    {/* Legs */}
                    <line x1="85" y1="195" x2="80" y2="250" /> {/* Left thigh */}
                    <line x1="80" y1="250" x2="75" y2="320" /> {/* Left lower leg */}
                    <line x1="115" y1="195" x2="120" y2="250" /> {/* Right thigh */}
                    <line x1="120" y1="250" x2="125" y2="320" /> {/* Right lower leg */}
                </g>

                {/* Armor Zones */}
                {Object.entries(ARMOR_ZONES).map(([zoneId, zone]) => {
                    const armorClass = getZoneArmorClass(zoneId);
                    const armorColor = getArmorClassColor(armorClass);
                    const bodyPart = getBodyPartForArmorZone(zoneId);
                    const isHovered = hoveredZone === zoneId;
                    const isSelected = selectedZone === zoneId;

                    // Convert percentage positions to SVG coordinates
                    const x = (zone.displayPosition.x / 100) * 200;
                    const y = (zone.displayPosition.y / 100) * 400;
                    const width = (zone.displayPosition.width / 100) * 200;
                    const height = (zone.displayPosition.height / 100) * 400;

                    return (
                        <g key={zoneId}>
                            {/* Zone background with armor color */}
                            <rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                fill={armorClass > 0 ? armorColor.hex : '#e7d1a9'}
                                fillOpacity={0.3}
                                stroke={isHovered || isSelected ? '#9ba85e' : armorColor.hex}
                                strokeWidth={isHovered || isSelected ? 2 : 1}
                                strokeOpacity={0.6}
                                className="cursor-pointer transition-all"
                                onMouseEnter={() => setHoveredZone(zoneId)}
                                onMouseLeave={() => setHoveredZone(null)}
                                onClick={() => setSelectedZone(zoneId === selectedZone ? null : zoneId)}
                            />

                            {/* Heat overlay when calculations available */}
                            {selectedAttackerId && zoneCalculations[selectedAttackerId] && (
                                <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    fill={getHeatColor(zoneId)}
                                    pointerEvents="none"
                                />
                            )}

                            {/* Display value */}
                            {selectedAttackerId && (
                                <text
                                    x={x + width / 2}
                                    y={y + height / 2}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="#ffffff"
                                    fontSize="10"
                                    fontWeight="bold"
                                    className="pointer-events-none"
                                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                                >
                                    {getZoneDisplayValue(zoneId)}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Zone labels on hover */}
                {hoveredZone && (
                    <g className="pointer-events-none">
                        <rect
                            x="5"
                            y="5"
                            width="190"
                            height="60"
                            fill="#1a1c18"
                            fillOpacity="0.95"
                            stroke="#9ba85e"
                            strokeWidth="1"
                            rx="2"
                        />
                        <text x="10" y="20" fill="#9ba85e" fontSize="12" fontWeight="bold">
                            {ARMOR_ZONES[hoveredZone]?.name || 'Unknown Zone'}
                        </text>
                        <text x="10" y="35" fill="#e7d1a9" fontSize="10">
                            Body Part: {getBodyPartForArmorZone(hoveredZone)?.name || 'Unknown'}
                        </text>
                        <text x="10" y="48" fill="#e7d1a9" fontSize="10">
                            HP: {getBodyPartForArmorZone(hoveredZone)?.hp || 0}
                        </text>
                        <text x="10" y="61" fill="#e7d1a9" fontSize="10">
                            Armor Class: {getZoneArmorClass(hoveredZone)}
                        </text>
                    </g>
                )}
            </svg>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-tan-200 rounded-sm border border-tan-400"></div>
                    <span className="text-tan-400">Unarmored</span>
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

            {/* Selected Zone Info */}
            {selectedZone && (
                <div className="mt-4 p-4 military-card rounded-sm">
                    <h4 className="text-olive-400 font-bold mb-2">
                        {ARMOR_ZONES[selectedZone]?.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-tan-400">Body Part:</span>
                            <span className="text-tan-100 ml-2">
                {getBodyPartForArmorZone(selectedZone)?.name}
              </span>
                        </div>
                        <div>
                            <span className="text-tan-400">HP:</span>
                            <span className="text-tan-100 ml-2">
                {getBodyPartForArmorZone(selectedZone)?.hp}
              </span>
                        </div>
                        <div>
                            <span className="text-tan-400">Armor:</span>
                            <span className="text-tan-100 ml-2">
                Class {getZoneArmorClass(selectedZone)}
              </span>
                        </div>
                        <div>
                            <span className="text-tan-400">Vital:</span>
                            <span className="text-tan-100 ml-2">
                {getBodyPartForArmorZone(selectedZone)?.isVital ? 'Yes' : 'No'}
              </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
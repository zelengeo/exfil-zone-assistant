import React from 'react';
import { Shield, Target } from 'lucide-react';
import { ProtectiveZone } from '@/app/combat-sim/utils/types';
import { getArmorClassColor } from '@/app/combat-sim/utils/body-zones';

interface ArmorZonesDisplayProps {
    protectiveData: ProtectiveZone[];
    className?: string;
}

export default function ArmorZonesDisplay({ protectiveData, className = '' }: ArmorZonesDisplayProps) {
    // Group zones by body part type
    const groupedZones = protectiveData.reduce((acc, zone) => {
        let category = 'Other';
        if (zone.bodyPart.includes('spine') || zone.bodyPart === 'pelvis') {
            category = 'Torso';
        } else if (zone.bodyPart.includes('Arm')) {
            category = 'Arms';
        } else if (zone.bodyPart.includes('Thigh')) {
            category = 'Legs';
        }

        if (!acc[category]) acc[category] = [];
        acc[category].push(zone);
        return acc;
    }, {} as Record<string, ProtectiveZone[]>);

    // Human-readable zone names
    const getZoneName = (bodyPart: string) => {
        const names: Record<string, string> = {
            'spine_01': 'Upper Chest',
            'spine_02': 'Lower Chest',
            'spine_03': 'Upper Stomach',
            'pelvis': 'Pelvis',
            'UpperArm_L': 'Left Upper Arm',
            'UpperArm_R': 'Right Upper Arm',
            'Thigh_L': 'Left Thigh',
            'Thigh_R': 'Right Thigh'
        };
        return names[bodyPart] || bodyPart;
    };

    return (
        <div className={`military-box p-6 rounded-sm ${className}`}>
            <h3 className="text-xl font-bold text-olive-400 mb-4 flex items-center gap-2">
                <Shield size={20} />
                Protection Zones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual representation */}
                <div className="military-card p-4 rounded-sm">
                    <h4 className="text-tan-300 font-medium mb-3 text-center">Coverage Map</h4>
                    <div className="relative h-96 bg-military-900 rounded-sm">
                        {/* Simple body outline SVG */}
                        <svg viewBox="0 0 200 400" className="w-full h-full">
                            {/* Body outline */}
                            <g stroke="#5c6534" strokeWidth="1.5" fill="none" opacity="0.5">
                                {/* Head */}
                                <ellipse cx="100" cy="40" rx="25" ry="30" />
                                {/* Neck */}
                                <line x1="100" y1="70" x2="100" y2="85" />
                                {/* Torso */}
                                <path d="M 70 85 L 65 150 L 70 210 L 100 220 L 130 210 L 135 150 L 130 85 Z" />
                                {/* Arms */}
                                <path d="M 70 85 L 45 110 L 30 160 L 25 200" />
                                <path d="M 130 85 L 155 110 L 170 160 L 175 200" />
                                {/* Legs */}
                                <path d="M 80 210 L 75 280 L 70 360" />
                                <path d="M 120 210 L 125 280 L 130 360" />
                            </g>

                            {/* Protected zones */}
                            {protectiveData.map((zone, i) => {
                                const color = getArmorClassColor(zone.armorClass);
                                let zoneElement = null;

                                switch (zone.bodyPart) {
                                    case 'spine_01':
                                        zoneElement = <rect x="65" y="85" width="70" height="30" />;
                                        break;
                                    case 'spine_02':
                                        zoneElement = <rect x="65" y="115" width="70" height="35" />;
                                        break;
                                    case 'spine_03':
                                        zoneElement = <rect x="65" y="150" width="70" height="30" />;
                                        break;
                                    case 'pelvis':
                                        zoneElement = <rect x="65" y="180" width="70" height="30" />;
                                        break;
                                    case 'UpperArm_L':
                                        zoneElement = <rect x="35" y="85" width="30" height="40" />;
                                        break;
                                    case 'UpperArm_R':
                                        zoneElement = <rect x="135" y="85" width="30" height="40" />;
                                        break;
                                    case 'Thigh_L':
                                        zoneElement = <rect x="70" y="210" width="25" height="50" />;
                                        break;
                                    case 'Thigh_R':
                                        zoneElement = <rect x="105" y="210" width="25" height="50" />;
                                        break;
                                }

                                if (zoneElement) {
                                    return React.cloneElement(zoneElement, {
                                        key: i,
                                        fill: color.hex,
                                        fillOpacity: 0.6,
                                        stroke: color.hex,
                                        strokeWidth: 1
                                    });
                                }
                                return null;
                            })}
                        </svg>
                    </div>
                </div>

                {/* Zone details */}
                <div className="space-y-4">
                    <h4 className="text-tan-300 font-medium mb-3">Zone Details</h4>
                    {Object.entries(groupedZones).map(([category, zones]) => (
                        <div key={category}>
                            <h5 className="text-olive-400 font-medium mb-2">{category}</h5>
                            <div className="space-y-2">
                                {zones.map((zone, i) => {
                                    const color = getArmorClassColor(zone.armorClass);
                                    return (
                                        <div key={i} className="military-card p-3 rounded-sm">
                                            <div className="flex items-center justify-between mb-2">
                        <span className="text-tan-100 font-medium">
                          {getZoneName(zone.bodyPart)}
                        </span>
                                                <span className={`${color.text} font-medium`}>
                          Class {zone.armorClass}
                        </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-tan-400">Blunt Damage:</span>
                                                    <span className="text-tan-100 ml-2">
                            {(zone.bluntDamageScalar * 100).toFixed(0)}%
                          </span>
                                                </div>
                                                <div>
                                                    <span className="text-tan-400">Angle:</span>
                                                    <span className="text-tan-100 ml-2">
                            {zone.protectionAngle}°
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="military-card p-3 rounded-sm text-center">
                    <div className="text-tan-400 text-sm">Total Zones</div>
                    <div className="text-2xl font-bold text-tan-100">{protectiveData.length}</div>
                </div>
                <div className="military-card p-3 rounded-sm text-center">
                    <div className="text-tan-400 text-sm">Max Class</div>
                    <div className="text-2xl font-bold text-olive-400">
                        {Math.max(...protectiveData.map(z => z.armorClass))}
                    </div>
                </div>
                <div className="military-card p-3 rounded-sm text-center">
                    <div className="text-tan-400 text-sm">Avg Blunt</div>
                    <div className="text-2xl font-bold text-tan-100">
                        {(protectiveData.reduce((sum, z) => sum + z.bluntDamageScalar, 0) / protectiveData.length * 100).toFixed(0)}%
                    </div>
                </div>
                <div className="military-card p-3 rounded-sm text-center">
                    <div className="text-tan-400 text-sm">Coverage</div>
                    <div className="text-2xl font-bold text-olive-400">
                        {protectiveData.some(z => z.bodyPart.includes('Arm') || z.bodyPart.includes('Thigh')) ? 'Extended' : 'Standard'}
                    </div>
                </div>
            </div>
        </div>
    );
}
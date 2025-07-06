import React, {useState} from 'react';
import Image from 'next/image';
import {Shield} from 'lucide-react';
import {ARMOR_ZONES, getArmorClassColor} from '@/app/combat-sim/utils/body-zones';
import {ProtectiveZone} from "@/types/items";

interface ArmorZonesDisplayProps {
    protectiveData: ProtectiveZone[];
    className?: string;
}

export default function ArmorZonesDisplay({protectiveData, className = ''}: ArmorZonesDisplayProps) {
    const [selectedZone, setSelectedZone] = useState<string | null>(null);
    
    // Get protection data for a specific zone
    const getZoneProtection = (zoneId: string): ProtectiveZone | null => {
        const zone = ARMOR_ZONES[zoneId];
        if (!zone) return null;

        return protectiveData.find(
            pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
        ) || null;
    };

    // Group zones by body part type for the details section
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

    return (
        <div className={`military-box p-6 rounded-sm ${className}`}>
            <h3 className="text-xl font-bold text-olive-400 mb-4 flex items-center gap-2">
                <Shield size={20}/>
                Protection Zones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual representation using Img_BodyPartsMain */}
                <div className="military-card p-4 rounded-sm">
                    <h4 className="text-tan-300 font-medium mb-3 text-center">Coverage Map</h4>
                    <div className="relative mx-auto" style={{maxWidth: '300px', aspectRatio: '300/650'}}>
                        {/* Background Image */}
                        <Image
                            src="/images/Img_BodyPartsMain.webp"
                            alt="Body Parts"
                            className="absolute inset-0 size-full object-contain"
                            width={300}
                            height={650}
                        />

                        {/* Interactive Zones Overlay */}
                        <div className="absolute inset-0">
                            {Object.entries(ARMOR_ZONES).map(([zoneId, zone]) => {
                                const protection = getZoneProtection(zoneId);
                                if (!protection) return null;

                                const armorColor = getArmorClassColor(protection.armorClass);
                                const isSelected = selectedZone === zoneId;

                                return (
                                    <div
                                        key={zoneId}
                                        className={`absolute cursor-pointer transition-all ${
                                            isSelected ? 'z-20' : 'z-10'
                                        }`}
                                        style={{
                                            left: `${zone.displayPosition.x}%`,
                                            top: `${zone.displayPosition.y+5}%`,
                                            width: `${zone.displayPosition.width}%`,
                                            height: `${zone.displayPosition.height}%`
                                        }}
                                        onClick={() => setSelectedZone(zoneId === selectedZone ? null : zoneId)}
                                    >
                                        {/* Zone Background with Armor Indication */}
                                        <div
                                            className={`absolute inset-0 rounded-sm transition-all ${
                                                `${armorColor.bg} ${ isSelected ? 'opacity-50' : 'opacity-35'}`
                                            } ${
                                                isSelected
                                                    ? `ring-2 ${armorColor.border} ring-opacity-75`
                                                    : ''
                                            }`}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className={`text-sm font-bold ${armorColor.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
                                            AC {protection.armorClass}
                                        </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Zone details */}
                <div className="military-card p-4 rounded-sm">
                    <h4 className="text-tan-300 font-medium mb-3">Zone Details</h4>
                    {Object.entries(groupedZones).map(([category, zones]) => (
                        <div key={category}>
                            <h5 className="text-olive-400 font-medium mb-2">{category}</h5>
                            <div className="space-y-2">
                                {zones.map((zone, i) => {
                                    const color = getArmorClassColor(zone.armorClass);
                                    const armorZone = Object.values(ARMOR_ZONES).find(
                                        az => az.bodyPart === zone.bodyPart || az.id === zone.bodyPart
                                    );
                                    const isSelectedZone = selectedZone && armorZone?.id === selectedZone;

                                    return (
                                        <div
                                            key={i}
                                            className={`military-card p-3 rounded-sm transition-all cursor-pointer
                                                ${isSelectedZone ? 'ring-2 ring-olive-500' : ''}
                                            `}
                                            onClick={() => {
                                                if (armorZone) {
                                                    setSelectedZone(armorZone.id === selectedZone ? null : armorZone.id);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-tan-100 font-medium">
                                                    {ARMOR_ZONES[zone.bodyPart].name}
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
        </div>
    );
}
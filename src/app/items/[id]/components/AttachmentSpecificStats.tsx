import React from 'react';
import {Attachment} from '@/types/items';
import {isMagazine, isSight, isTactical} from "@/app/combat-sim/utils/types";
import {Eye, Settings, Shield, Snail, Tally5, Timer, TrendingDown, TrendingUp, Zap} from "lucide-react";

interface AttachmentSpecificStatsProps {
    item: Attachment;
}

// Helper function to format modifier values
const formatModifier = (value: number | undefined): string => {
    if (value === undefined || value === 0) return "0";
    return value > 0 ? `+${value}` : `${value}`;
};

// Helper function to get modifier color class
const getModifierColorClass = (value: number | undefined, isPositive = true): string => {
    if (value === undefined || value === 0) return "text-tan-300";
    return (isPositive ? value > 0 : value < 0) ? "text-red-400" : "text-green-400";
};

// Helper function to get modifier icon
const getModifierIcon = (value: number | undefined) => {
    if (value === undefined || value === 0) return null;
    return value > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
};

const AttachmentSpecificStats: React.FC<AttachmentSpecificStatsProps> = ({ item }) => {
    if (isMagazine(item)) return (<div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
                <Shield size={18} className="text-olive-400"/>
                <span className="text-tan-300">Caliber:</span>
                <span className="text-tan-100">{item.stats.caliber}</span>
            </div>
            <div className="flex items-center gap-2">
                <Tally5 size={18} className="text-olive-400"/>
                <span className="text-tan-300">Capacity:</span>
                <span className="text-tan-100">{item.stats.capacity} rounds</span>
            </div>
            {item.stats.ADSSpeedModifier !== undefined && (
                <div className="flex items-center gap-2">
                    <Snail size={18} className="text-olive-400"/>
                    <span className="text-tan-300">ADS Speed Modifier:</span>
                    <span className="text-tan-100">
                        {item.stats.ADSSpeedModifier > 0 ? `+${item.stats.ADSSpeedModifier}` : item.stats.ADSSpeedModifier}
                    </span>
                </div>
            )}
            {item.stats.ergonomicsModifier !== undefined && (
                <div className="flex items-center gap-2">
                    <Timer size={18} className="text-olive-400"/>
                    <span className="text-tan-300">Ergonomics Modifier:</span>
                    <span className="text-tan-100">
                        {item.stats.ergonomicsModifier > 0 ? `+${item.stats.ergonomicsModifier}` : item.stats.ergonomicsModifier}
                    </span>
                </div>
            )}
        </div>
    )
    return <>
        {isSight(item) && (
            <div className="military-card p-4 rounded-sm mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Eye size={18} className="text-olive-400" />
                    <h4 className="text-lg font-bold text-olive-400">Optic Properties</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {item.stats.magnification && (
                        <div className="flex justify-between">
                            <span className="text-tan-400">Magnification:</span>
                            <span className="text-tan-100">{item.stats.magnification}x</span>
                        </div>
                    )}
                    {item.stats.zeroedDistanceValue && (
                        <div className="flex justify-between">
                            <span className="text-tan-400">Zero Distance:</span>
                            <span className="text-tan-100">{item.stats.zeroedDistanceValue/100}m</span>
                        </div>
                    )}
                </div>
            </div>
        )
        }

        {/* Tactical equipment specific stats */}
        {isTactical(item) && (
            <div className="military-card p-4 rounded-sm mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={18} className="text-olive-400" />
                    <h4 className="text-lg font-bold text-olive-400">Tactical Properties</h4>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-tan-400">Range:</span>
                    <span className="text-tan-100">{item.stats.traceDistance/100}m</span>
                </div>
            </div>
        )}

        {/* Attachment modifiers */}
        {item.stats.attachmentModifier && (
            <div className="military-card p-4 rounded-sm mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Settings size={18} className="text-olive-400" />
                    <h4 className="text-lg font-bold text-olive-400">Performance Modifiers</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">

                    {/* Recoil Control */}
                    {(item.stats.attachmentModifier.verticalRecoilModifier !== undefined || item.stats.attachmentModifier.horizontalRecoilModifier !== undefined) && (
                        <>
                            {item.stats.attachmentModifier.verticalRecoilModifier !== undefined && (
                                <div className="flex justify-between items-center">
                                    <span className="text-tan-400">Vertical Recoil:</span>
                                    <div className={`flex items-center gap-1 ${getModifierColorClass(item.stats.attachmentModifier.verticalRecoilModifier)}`}>
                                        {getModifierIcon(item.stats.attachmentModifier.verticalRecoilModifier)}
                                        <span>{formatModifier(item.stats.attachmentModifier.verticalRecoilModifier)}</span>
                                    </div>
                                </div>
                            )}
                            {item.stats.attachmentModifier.horizontalRecoilModifier !== undefined && (
                                <div className="flex justify-between items-center">
                                    <span className="text-tan-400">Horizontal Recoil:</span>
                                    <div className={`flex items-center gap-1 ${getModifierColorClass(item.stats.attachmentModifier.horizontalRecoilModifier)}`}>
                                        {getModifierIcon(item.stats.attachmentModifier.horizontalRecoilModifier)}
                                        <span>{formatModifier(item.stats.attachmentModifier.horizontalRecoilModifier)}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Ergonomics and ADS */}
                    {item.stats.attachmentModifier.ergonomicsModifier !== undefined && (
                        <div className="flex justify-between items-center">
                            <span className="text-tan-400">Ergonomics:</span>
                            <div className={`flex items-center gap-1 ${getModifierColorClass(item.stats.attachmentModifier.ergonomicsModifier, false)}`}>
                                {getModifierIcon(item.stats.attachmentModifier.ergonomicsModifier)}
                                <span>{formatModifier(item.stats.attachmentModifier.ergonomicsModifier)}</span>
                            </div>
                        </div>
                    )}

                    {/*{item.stats.attachmentModifier.ADSSpeedModifier !== undefined && (
                        <div className="flex justify-between items-center">
                            <span className="text-tan-400">ADS Speed:</span>
                            <div className={`flex items-center gap-1 ${getModifierColorClass(item.stats.attachmentModifier.ADSSpeedModifier, false)}`}>
                                {getModifierIcon(item.stats.attachmentModifier.ADSSpeedModifier)}
                                <span>{formatModifier(item.stats.attachmentModifier.ADSSpeedModifier)}</span>
                            </div>
                        </div>
                    )}*/}

                    {/* Damage modifiers */}
                    {/*{item.stats.attachmentModifier.headDamageScaleModifier !== undefined && (
                        <div className="flex justify-between items-center">
                            <span className="text-tan-400">Head Damage:</span>
                            <div className={`flex items-center gap-1 ${getModifierColorClass(item.stats.attachmentModifier.headDamageScaleModifier)}`}>
                                {getModifierIcon(item.stats.attachmentModifier.headDamageScaleModifier)}
                                <span>{formatModifier(item.stats.attachmentModifier.headDamageScaleModifier)}</span>
                            </div>
                        </div>
                    )}*/}

                    {/*{attachmentModifier.bulletVelocityModifier !== undefined && (
                        <div className="flex justify-between items-center">
                            <span className="text-tan-400">Bullet Velocity:</span>
                            <div className={`flex items-center gap-1 ${getModifierColorClass(attachmentModifier.bulletVelocityModifier)}`}>
                                {getModifierIcon(attachmentModifier.bulletVelocityModifier)}
                                <span>{formatModifier(attachmentModifier.bulletVelocityModifier)}</span>
                            </div>
                        </div>
                    )}*/}

                    {/* Advanced modifiers - only show if they have values */}
                    {/*{Object.entries(attachmentModifier).filter(([key, value]) =>
                        value !== undefined && value !== 0 &&
                        !['verticalRecoilModifier', 'horizontalRecoilModifier', 'ergonomicsModifier', 'ADSSpeedModifier', 'headDamageScaleModifier', 'bulletVelocityModifier'].includes(key)
                    ).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                                <span className="text-tan-400 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/Modifier$/, '').trim()}:
                                </span>
                            <div className={`flex items-center gap-1 ${getModifierColorClass(value as number)}`}>
                                {getModifierIcon(value as number)}
                                <span>{formatModifier(value as number)}</span>
                            </div>
                        </div>
                    ))}*/}
                </div>
            </div>
        )}

    </>





};

export default AttachmentSpecificStats;
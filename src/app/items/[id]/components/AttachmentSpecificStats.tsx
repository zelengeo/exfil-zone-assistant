import React from 'react';
import {Attachment} from '@/types/items';
import {isMagazine} from "@/app/combat-sim/utils/types";
import {Shield, Snail, Tally5, Timer} from "lucide-react";

interface AttachmentSpecificStatsProps {
    item: Attachment;
}

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
};

export default AttachmentSpecificStats;
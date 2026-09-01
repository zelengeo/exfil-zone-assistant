import React from 'react';
import {Attachment} from '@/types/items';
import {isMagazine, isSight, isTactical} from "@/app/combat-sim/utils/types";
import {Eye, Settings, Shield, Snail, Tally5, Timer, TrendingDown, TrendingUp, Zap} from "lucide-react";
import {cn} from '@/lib/utils';
import StatLine, {StatGrid, StatPanel} from './StatLine';

interface AttachmentSpecificStatsProps {
    item: Attachment;
}

const formatModifier = (value: number | undefined): string => {
    if (value === undefined || value === 0) return "0";
    return value > 0 ? `+${value}` : `${value}`;
};

/**
 * A modifier with its direction read as good or bad.
 *
 * `higherIsBetter` because the sign alone does not say which way is up: more ergonomics is good,
 * more recoil is not.
 */
function Modifier({value, higherIsBetter = false}: { value: number | undefined; higherIsBetter?: boolean }) {
    if (value === undefined || value === 0) {
        return <span className="font-mono tabular text-ink-600">0</span>;
    }

    const good = higherIsBetter ? value > 0 : value < 0;

    return (
        <span className={cn('inline-flex items-center gap-1 font-mono tabular', good ? 'text-good' : 'text-ember')}>
            {value > 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
            {formatModifier(value)}
        </span>
    );
}

const AttachmentSpecificStats: React.FC<AttachmentSpecificStatsProps> = ({item}) => {
    if (isMagazine(item)) {
        return (
            <StatGrid>
                <StatLine icon={<Shield size={14}/>} label="Caliber" value={item.stats.caliber} text/>
                <StatLine icon={<Tally5 size={14}/>} label="Capacity" value={`${item.stats.capacity} rounds`}/>
                {item.stats.ADSSpeedModifier !== undefined && (
                    <StatLine
                        icon={<Snail size={14}/>}
                        label="ADS speed modifier"
                        value={formatModifier(item.stats.ADSSpeedModifier)}
                    />
                )}
                {item.stats.ergonomicsModifier !== undefined && (
                    <StatLine
                        icon={<Timer size={14}/>}
                        label="Ergonomics modifier"
                        value={formatModifier(item.stats.ergonomicsModifier)}
                    />
                )}
            </StatGrid>
        );
    }

    const modifier = item.stats.attachmentModifier;

    return (
        <div className="space-y-5">
            {isSight(item) && (
                <StatPanel title="Optic properties" icon={<Eye size={14}/>}>
                    <StatGrid>
                        {item.stats.magnification && (
                            <StatLine label="Magnification" value={`${item.stats.magnification}×`}/>
                        )}
                        {item.stats.zeroedDistanceValue && (
                            <StatLine label="Zero distance" value={`${item.stats.zeroedDistanceValue / 100} m`}/>
                        )}
                    </StatGrid>
                </StatPanel>
            )}

            {isTactical(item) && (
                <StatPanel title="Tactical properties" icon={<Zap size={14}/>}>
                    <StatLine label="Range" value={`${item.stats.traceDistance / 100} m`}/>
                </StatPanel>
            )}

            {modifier && (
                <StatPanel title="Performance modifiers" icon={<Settings size={14}/>}>
                    <StatGrid>
                        {modifier.verticalRecoilModifier !== undefined && (
                            <StatLine
                                label="Vertical recoil"
                                value={<Modifier value={modifier.verticalRecoilModifier}/>}
                            />
                        )}
                        {modifier.horizontalRecoilModifier !== undefined && (
                            <StatLine
                                label="Horizontal recoil"
                                value={<Modifier value={modifier.horizontalRecoilModifier}/>}
                            />
                        )}
                        {modifier.ergonomicsModifier !== undefined && (
                            <StatLine
                                label="Ergonomics"
                                value={<Modifier value={modifier.ergonomicsModifier} higherIsBetter/>}
                            />
                        )}
                    </StatGrid>
                </StatPanel>
            )}
        </div>
    );
};

export default AttachmentSpecificStats;

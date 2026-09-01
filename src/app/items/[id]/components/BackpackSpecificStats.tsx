import React from 'react';
import {Backpack} from '@/types/items';
import {Package, Layers} from 'lucide-react';
import StatLine, {StatEmpty, StatGrid, StatPanel} from './StatLine';

interface BackpackSpecificStatsProps {
    item: Backpack;
}

export default function BackpackSpecificStats({item}: BackpackSpecificStatsProps) {
    const points = item.stats.attachmentPoints ?? [];

    // A "sides" point is two slots, one per side, which is why it counts twice.
    const slotCount = points.length
        ? points.length + (points.some(point => point.tag === 'sides') ? 1 : 0)
        : 0;

    return (
        <div className="space-y-5">
            <StatPanel title="Backpack properties" icon={<Package size={14} />}>
                <StatGrid>
                    <StatLine label="Dimensions" value={item.stats.sizes} />
                    <StatLine label="Attachment points" value={slotCount} />
                </StatGrid>
            </StatPanel>

            <StatPanel title="Attachment points" icon={<Layers size={14} />}>
                {points.length > 0 ? (
                    <div className="space-y-3">
                        {points.map((point, index) => (
                            <div key={index} className="border-l border-line-600 pl-3">
                                <div className="text-sm text-ink-200 capitalize mb-1">{point.tag}</div>
                                <div className="flex flex-wrap gap-1">
                                    {point.types.map((type, typeIndex) => (
                                        <span
                                            key={typeIndex}
                                            className="micro-label px-1.5 py-0.5 bg-steel-800 border border-line-700 text-ink-500"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <StatEmpty>No attachment points available.</StatEmpty>
                )}
            </StatPanel>
        </div>
    );
}

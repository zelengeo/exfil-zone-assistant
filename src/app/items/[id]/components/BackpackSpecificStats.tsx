import React from 'react';
import {Backpack} from '@/types/items';
import {Package, Layers, X} from 'lucide-react';

interface BackpackSpecificStatsProps {
    item: Backpack;
}

export default function BackpackSpecificStats({item}: BackpackSpecificStatsProps) {
    return (
        <>
            {/* Backpack Properties */}
            <div className="military-card p-4 rounded-sm mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Package size={18} className="text-olive-400" />
                    <h4 className="text-lg font-bold text-olive-400">Backpack Properties</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-tan-400">Dimensions:</span>
                        <span className="text-tan-100 font-mono">{item.stats.sizes}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-tan-400">Attachment Points:</span>
                        <span className="text-tan-100">
                            {item.stats.attachmentPoints.length ? item.stats.attachmentPoints.length + (item.stats.attachmentPoints.find(item => item.tag ==="sides") ? 1 : 0) : 0 }
                        </span>
                    </div>
                </div>
            </div>

            {/* Attachment Points */}
            <div className="military-card p-4 rounded-sm mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Layers size={18} className="text-olive-400" />
                    <h4 className="text-lg font-bold text-olive-400">Attachment Points</h4>
                </div>

                {item.stats.attachmentPoints && item.stats.attachmentPoints.length > 0 ? (
                    <div className="space-y-3">
                        {item.stats.attachmentPoints.map((point, index) => (
                            <div key={index} className="border-l-2 border-olive-600 pl-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-tan-100 font-medium capitalize">{point.tag}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {point.types.map((type, typeIndex) => (
                                        <span
                                            key={typeIndex}
                                            className="px-2 py-1 bg-military-700 text-tan-300 text-xs rounded-sm border border-olive-800"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-tan-400 text-sm">
                        <X size={16} className="text-red-400" />
                        <span>No attachment points available</span>
                    </div>
                )}
            </div>
        </>
    );
}
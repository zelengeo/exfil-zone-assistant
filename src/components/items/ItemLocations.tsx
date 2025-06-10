import React from 'react';
import Link from 'next/link';
import { MapPin, ChevronRight } from 'lucide-react';
import { Item } from '@/types/items';

interface ItemLocationsProps {
    item: Item;
    className?: string;
}

//TODO will be reworked
interface ItemLocation {
    map: string;
    spots: {
        x: number;
        y: number;
        description: string;
    }[]
}

/**
 * Placeholder component for displaying item spawn locations
 * Will be expanded when Map route is implemented
 */
const ItemLocations: React.FC<ItemLocationsProps> = ({ item, className = '' }) => {
    // Check if the item has locations data
    // const hasLocations = item.locations && item.locations.length > 0;
    const locations: ItemLocation[] = [];
    const hasLocations = false

    return (
        <div className={`military-box p-6 rounded-sm ${className}`}>
            <h2 className="text-2xl font-bold text-olive-400 mb-4">Spawn Locations</h2>

            {hasLocations ? (
                <div className="space-y-6">
                    {locations.map((location, index) => (
                        <div key={index} className="military-card p-4 rounded-sm">
                            <h3 className="text-xl font-bold text-tan-100 mb-3 flex items-center gap-2">
                                <MapPin size={20} className="text-olive-400" />
                                {location.map.charAt(0).toUpperCase() + location.map.slice(1)}
                            </h3>
                            <ul className="space-y-3 mb-4">
                                {location.spots.map((spot, spotIndex) => (
                                    <li key={spotIndex} className="flex items-start gap-3">
                                        <div className="w-6 h-6 flex-shrink-0 rounded-full bg-olive-600 text-military-900 flex items-center justify-center mt-0.5">
                                            {spotIndex + 1}
                                        </div>
                                        <div>
                                            <p className="text-tan-200">{spot.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* Placeholder for future map integration */}
                            <div className="mt-3 military-card bg-military-800 p-4 rounded-sm text-center border border-dashed border-olive-700">
                                <p className="text-tan-300 mb-2">Map view will be available when Maps route is implemented</p>
                                <Link
                                    href={`/maps/${location.map}?highlight=${item.id}`}
                                    className="text-olive-400 hover:text-olive-300 inline-flex items-center gap-1 font-medium"
                                >
                                    View on Map <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="military-card p-6 text-center rounded-sm">
                    <p className="text-tan-300">No known spawn locations for this item.</p>
                    <p className="text-tan-400 mt-2 text-sm">Locations will be added as they are discovered.</p>
                </div>
            )}

            {/* Note for future development */}
            <div className="mt-6 p-3 bg-military-800 rounded-sm border-l-4 border-olive-600">
                <p className="text-tan-300 text-sm">
                    <strong>Developer Note:</strong> This component will be expanded with interactive maps when the Map route is implemented.
                </p>
            </div>
        </div>
    );
};

export default ItemLocations;
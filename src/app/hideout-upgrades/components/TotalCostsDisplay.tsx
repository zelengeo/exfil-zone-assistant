import {useMemo} from 'react';
import {hideoutUpgrades} from '@/data/hideout-upgrades';
import {DollarSign, Package, ExternalLink} from 'lucide-react';
import {Item} from '@/types/items';
import Image from 'next/image';
import Link from 'next/link';

interface TotalCostsDisplayProps {
    upgradedAreas: Set<keyof typeof hideoutUpgrades>;
    getItemById: (id: string) => Item | undefined;
}

interface ItemWithQuantity {
    quantity: number;
    item: Item;
}

export default function TotalCostsDisplay({upgradedAreas, getItemById}: TotalCostsDisplayProps) {
    // Calculate total exchange costs
    const totalCosts = useMemo(() => {
        const costs: { [key: string]: number } = {};
        let totalPrice = 0;

        Object.entries(hideoutUpgrades).forEach(([key, upgrade]) => {
            if (!upgradedAreas.has(key as keyof typeof hideoutUpgrades)) {
                totalPrice += upgrade.price;

                Object.entries(upgrade.exchange).forEach(([itemId, quantity]) => {
                    costs[itemId] = (costs[itemId] || 0) + quantity;
                });
            }
        });

        return {items: costs, price: totalPrice};
    }, [upgradedAreas]);

    // Sort and prepare items with quantity //TODO decide how to sort
    const sortedItems = Object.entries(totalCosts.items).map(([itemId, quantity]) => ({
        quantity,
        item: getItemById(itemId)
    })).filter(e => !!e.item) as ItemWithQuantity[];


    return (
        <>
            <h2 className="text-2xl font-bold text-tan-100 mb-6 flex items-center gap-2">
                <Package className="text-olive-400" size={24}/>
                Total Upgrade Costs
            </h2>


            {/* Price Section */}
            <div className="military-box rounded-sm p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DollarSign className="text-olive-400" size={20}/>
                        <h3 className="text-sm font-medium text-tan-300 uppercase tracking-wider">
                            Total Funds Required
                        </h3>
                    </div>
                    <p className="text-2xl font-bold text-olive-400">
                        ${totalCosts.price.toLocaleString()}
                    </p>
                </div>
            </div>

                    {/* Items Section */}
            <div className="military-box rounded-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-tan-200">Required Items</h3>
                    <span className="text-sm text-tan-400 font-medium">{sortedItems.length} Types</span>
                </div>

                {sortedItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {sortedItems.map(({item, quantity,}) => (
                            <div
                                key={item.id}
                                className="bg-black/30 border border-military-600 rounded-sm p-3
                             hover:border-olive-600 hover:bg-black/50 transition-all duration-200
                             flex items-center gap-3 group"
                            >
                                {/* Item Icon */}
                                <Link
                                    href={`/items/${item.id}`}
                                    target='_blank'
                                    className="relative w-12 h-12 flex-shrink-0 bg-black/50 rounded-sm
                               border border-military-700 hover:border-olive-600 transition-all
                               overflow-hidden group/icon"
                                >
                                    <Image
                                        src={item?.images.icon || '/images/missing-item.png'}
                                        alt={item?.name || item.id}
                                        fill
                                        sizes="full"
                                        className="object-contain p-1 group-hover/icon:scale-110 transition-transform"
                                    />
                                    <div
                                        className="absolute inset-0 bg-olive-400/0 group-hover/icon:bg-olive-400/10 transition-colors"/>
                                    <ExternalLink
                                        size={12}
                                        className="absolute top-1 right-1 text-tan-400 opacity-0 group-hover/icon:opacity-100 transition-opacity"
                                    />
                                </Link>

                                {/* Item Name */}
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm text-tan-300 group-hover:text-tan-100 truncate">
                                        {item?.name || item.id}
                                    </p>
                                    {item?.subcategory && (
                                        <p className="text-xs text-tan-500">{item?.subcategory}</p>
                                    )}
                                </div>

                                {/* Quantity */}
                                <span className="text-sm font-bold text-olive-400 min-w-[3rem] text-right
                                   bg-black/50 px-2 py-1 rounded-sm border border-olive-600/50">
                      ×{quantity}
                    </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-black/30 border border-olive-600/50 rounded-sm">
                        <div className="text-olive-400 mb-3">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <p className="text-xl font-bold text-tan-100">All Upgrades Complete!</p>
                        <p className="text-sm mt-2 text-tan-400">Your hideout is fully upgraded</p>
                    </div>
                )}
            </div>
        </>
    );
}
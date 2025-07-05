import {useMemo, useState} from 'react';
import {hideoutUpgrades} from '@/data/hideout-upgrades';
import {DollarSign, Package, X} from 'lucide-react';
import {Item} from '@/types/items';
import Image from 'next/image';
import ItemLinkIcon from "@/components/ItemLinkIcon";

interface TotalCostsDisplayProps {
    upgradedAreas: Set<keyof typeof hideoutUpgrades>;
    getItemById: (id: string) => Item | undefined;
}

interface ItemWithQuantity {
    quantity: number;
    item: Item;
}

function getItemDiv({item, quantity}: ItemWithQuantity, setSelectedItem: (id: string) => void) {
    return (
        <div
            key={item.id}
            className="bg-black/30 border border-military-600 rounded-sm p-3
                             hover:border-olive-600 hover:bg-black/50 transition-all duration-200
                             flex items-center gap-3 group cursor-pointer"
            onClick={() => setSelectedItem(item.id)}
        >
            {/* Item Icon */}
            <div
                className={"relative w-12 h-12 flex-shrink-0 bg-black/50 rounded-sm border border-military-700 hover:border-olive-600 transition-all overflow-hidden"}>
                <Image
                    src={item?.images.icon || '/images/missing-item.png'}
                    alt={item?.name || item.id}
                    unoptimized={true}
                    fill
                    sizes="full"
                    className="object-contain p-1 hover:scale-110 transition-transform"
                />
            </div>

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
    )
}

export default function TotalCostsDisplay({upgradedAreas, getItemById}: TotalCostsDisplayProps) {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
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


    const groupedItems = useMemo(() => {
        const sortedItems = Object.entries(totalCosts.items).map(([itemId, quantity]) => ({
            quantity,
            item: getItemById(itemId)
        })).filter(e => !!e.item && (e.quantity > 0)).sort((a, b) => b.quantity - a.quantity) as ItemWithQuantity[];

        const groups = {
            high: [] as ItemWithQuantity[],
            medium: [] as ItemWithQuantity[],
            low: [] as ItemWithQuantity[],
            totalLength: sortedItems.length,
        };

        sortedItems.forEach(item => {
            if (item.quantity >= 10) {
                groups.high.push(item);
            } else if (item.quantity >= 5) {
                groups.medium.push(item);
            } else {
                groups.low.push(item);
            }
        })
        return groups;
    }, [getItemById, totalCosts]);


    const mapItemWithQuantity = (item: ItemWithQuantity) => getItemDiv(item, setSelectedItem);


    const getSelectedItemPopover = () => {
        if (!selectedItem) return null;
        const item = getItemById(selectedItem);
        if (!item) return null;
        const upgradesUsingItem = Object.keys(hideoutUpgrades).reduce((acc, key) => {
            const typedKey = key as keyof typeof hideoutUpgrades;
            if (upgradedAreas.has(typedKey)) return acc;

            const upgrade = hideoutUpgrades[typedKey];

            if (selectedItem in upgrade.exchange) {
                const quantity = (upgrade.exchange as Record<string, number>)[selectedItem];
                acc.push({
                    key: typedKey,
                    quantity
                });
            }

            return acc;
        }, [] as Array<{
            key: keyof typeof hideoutUpgrades;
            quantity: number;
        }>);


        return (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                     onClick={() => setSelectedItem(null)}>
                <div
                    className="bg-military-gradient border-2 border-olive-600 rounded-sm p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-black/80"
                    onClick={(e) => e.stopPropagation()}>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <ItemLinkIcon item={item} />
                            <div>
                                <h3 className="text-xl font-bold text-tan-100">
                                    {item.name || selectedItem}
                                </h3>
                                <p className="text-sm text-tan-400">
                                    Used in {upgradesUsingItem.length} upgrades
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="text-tan-400 hover:text-tan-100"
                        >
                            <X size={24}/>
                        </button>
                    </div>

                    {/* Upgrades List */}
                    <div className="space-y-3">
                        {upgradesUsingItem.map(({key, quantity}) => (
                            <div
                                key={key}
                                className={`p-4 rounded-sm border bg-green-900/20 border-green-600/50`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-tan-100">
                                            {hideoutUpgrades[key].upgradeName} - Level {hideoutUpgrades[key].level}
                                        </h4>
                                        <p className="text-sm text-tan-400">{hideoutUpgrades[key].areaId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-olive-400">×{quantity}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }


    return (
        <>
            <h2 className="text-2xl font-bold text-tan-100 mb-6 flex items-center gap-2">
                <Package className="text-olive-400" size={24}/>
                Remaining Upgrade Costs
            </h2>


            {/* Price Section */}
            <div className="military-box rounded-sm p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DollarSign className="text-olive-400" size={20}/>
                        <h3 className="text-sm font-medium text-tan-300 uppercase tracking-wider">
                            Money Still Needed
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
                    <span className="text-sm text-tan-400 font-medium">{groupedItems.totalLength} Types</span>
                </div>

                {groupedItems.totalLength > 0 ? (
                    <div className="space-y-4">
                        {groupedItems.high.length > 0 && (
                            <div>
                                <p className="text-xs text-red-400 font-medium mb-2 uppercase">High Quantity (10+)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {groupedItems.high.map(mapItemWithQuantity)}
                                </div>
                            </div>
                        )}

                        {groupedItems.medium.length > 0 && (
                            <div>
                                <p className="text-xs text-yellow-400 font-medium mb-2 uppercase">Medium Quantity
                                    (5-9)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {groupedItems.medium.map(mapItemWithQuantity)}
                                </div>
                            </div>
                        )}

                        {groupedItems.low.length > 0 && (
                            <div>
                                <p className="text-xs text-olive-400 font-medium mb-2 uppercase">Low Quantity (1-4)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {groupedItems.low.map(mapItemWithQuantity)}
                                </div>
                            </div>
                        )}
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
            {selectedItem && getSelectedItemPopover()}
        </>
    );
}
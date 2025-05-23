import React, { useState } from 'react';
import Link from 'next/link';
import { Hammer, FileText, Home, ChevronRight } from 'lucide-react';
import { Item } from '@/types/items';

interface RelatedItemsProps {
    item: Item;
    className?: string;
}

/**
 * Placeholder component for displaying related items, quests, and hideout upgrades
 * Will be expanded when Quest and Hideout routes are implemented
 */
const RelatedItems: React.FC<RelatedItemsProps> = ({ item, className = '' }) => {
    const [activeTab, setActiveTab] = useState('crafting');

    // Check if the item has related data and get counts
    const craftingCount = item.craftingRecipes ? item.craftingRecipes.length : 0;
    const questsCount = item.relatedQuests ? item.relatedQuests.length : 0;
    // We'll assume hideout upgrades will be added later
    const hideoutCount = 0;

    return (
        <div className={`military-box p-6 rounded-sm ${className}`}>
            {/* Tab navigation */}
            <div className="flex border-b border-military-700 mb-6">
                <button
                    className={`px-4 py-3 font-medium text-lg ${
                        activeTab === 'crafting'
                            ? 'text-olive-400 border-b-2 border-olive-500'
                            : 'text-tan-300 hover:text-tan-100 transition-colors'
                    }`}
                    onClick={() => setActiveTab('crafting')}
                >
                    Crafting ({craftingCount})
                </button>
                <button
                    className={`px-4 py-3 font-medium text-lg ${
                        activeTab === 'quests'
                            ? 'text-olive-400 border-b-2 border-olive-500'
                            : 'text-tan-300 hover:text-tan-100 transition-colors'
                    }`}
                    onClick={() => setActiveTab('quests')}
                >
                    Quests ({questsCount})
                </button>
                <button
                    className={`px-4 py-3 font-medium text-lg ${
                        activeTab === 'hideout'
                            ? 'text-olive-400 border-b-2 border-olive-500'
                            : 'text-tan-300 hover:text-tan-100 transition-colors'
                    }`}
                    onClick={() => setActiveTab('hideout')}
                >
                    Hideout ({hideoutCount})
                </button>
            </div>

            {/* Crafting tab */}
            {activeTab === 'crafting' && (
                <div>
                    <h2 className="text-2xl font-bold text-olive-400 mb-4">Crafting Recipes</h2>

                    {craftingCount > 0 ? (
                        <div className="space-y-6">
                            {item.craftingRecipes!.map((recipe, index) => (
                                <div key={index} className="military-card p-4 rounded-sm">
                                    <h3 className="text-xl font-bold text-tan-100 mb-3 flex items-center gap-2">
                                        <Hammer size={20} className="text-olive-400" />
                                        Recipe {index + 1}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                        {/* Inputs */}
                                        <div className="md:col-span-2">
                                            <h4 className="text-tan-300 mb-2">Required Items:</h4>
                                            <ul className="space-y-2">
                                                {recipe.inputs.map((input, inputIndex) => (
                                                    <li key={inputIndex} className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-military-800 rounded-sm"></div>
                                                        <span className="text-tan-200">
                              {input.quantity}x {input.itemId.replace('junk-', '')}
                            </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 text-olive-500">→</div>
                                        </div>

                                        {/* Output */}
                                        <div className="md:col-span-2">
                                            <h4 className="text-tan-300 mb-2">Output:</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-12 bg-military-800 rounded-sm border border-olive-700"></div>
                                                <span className="text-tan-200">{recipe.output.quantity}x {item.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="military-card p-6 text-center rounded-sm">
                            <p className="text-tan-300">This item cannot be crafted.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Quests tab */}
            {activeTab === 'quests' && (
                <div>
                    <h2 className="text-2xl font-bold text-olive-400 mb-4">Related Quests</h2>

                    {questsCount > 0 ? (
                        <div className="space-y-4">
                            {item.relatedQuests!.map((questId, index) => (
                                <div key={index} className="military-card p-4 rounded-sm flex items-center">
                                    <div className="w-10 h-10 bg-military-800 rounded-sm flex items-center justify-center mr-4">
                                        <FileText size={20} className="text-olive-400" />
                                    </div>
                                    <div>
                                        <Link
                                            href={`/quests/${questId}`}
                                            className="text-tan-100 hover:text-olive-400 transition-colors font-medium"
                                        >
                                            {questId.replace('quest-', 'Quest #')}
                                        </Link>
                                        <p className="text-tan-300 text-sm">Required for quest objective</p>
                                    </div>
                                    <ChevronRight size={20} className="ml-auto text-olive-500" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="military-card p-6 text-center rounded-sm">
                            <p className="text-tan-300">No known quests require this item.</p>
                            <p className="text-tan-400 mt-2 text-sm">Quest connections will be added when discovered.</p>
                        </div>
                    )}

                    {/* Note for future development */}
                    <div className="mt-6 p-3 bg-military-800 rounded-sm border-l-4 border-olive-600">
                        <p className="text-tan-300 text-sm">
                            <strong>Developer Note:</strong> This section will be expanded with detailed quest information when the Quests route is implemented.
                        </p>
                    </div>
                </div>
            )}

            {/* Hideout tab */}
            {activeTab === 'hideout' && (
                <div>
                    <h2 className="text-2xl font-bold text-olive-400 mb-4">Hideout Upgrades</h2>

                    {hideoutCount > 0 ? (
                        <div className="space-y-4">
                            {/* This will be populated when hideout data is available */}
                        </div>
                    ) : (
                        <div className="military-card p-6 text-center rounded-sm">
                            <p className="text-tan-300">This item is not used in any hideout upgrades.</p>
                        </div>
                    )}

                    {/* Note for future development */}
                    <div className="mt-6 p-3 bg-military-800 rounded-sm border-l-4 border-olive-600">
                        <p className="text-tan-300 text-sm">
                            <strong>Developer Note:</strong> This section will display hideout upgrades that require this item when the Hideout route is implemented.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RelatedItems;
import React from 'react';
import {
    X,
    ChevronRight,
    ChevronDown,
    Swords,
    Fence,
    Shield,
    BriefcaseMedical,
    Bomb,
    Apple,
    Drill, ChevronsUp
} from 'lucide-react';
import {ItemCategory} from '@/types/items';
import {useRouter} from "next/navigation";

// Icon mapper for categories
const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
        case 'weapons':
            return (
                <Swords size={20}/>
            );
        case 'ammo':
            return (
                <Fence size={20}/>
            );
        case 'medicine':
            return (
                <BriefcaseMedical size={20}/>
            );
        case 'grenades':
            return (
                <Bomb size={20}/>
            );
        case 'provisions':
            return (
                <Apple size={20}/>
            );
        case 'gear':
            return (
                <Shield size={20}/>
            );
        case 'misc':
            return (
                <Drill size={20}/>
            );
        case 'keys':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path
                        d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
            );
        case 'attachments':
            return (
                <ChevronsUp size={20}/>
            );
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            );
    }
};

interface FilterSidebarProps {
    categories: Record<string, ItemCategory>;
    selectedCategory: string;
    selectedSubcategory: string;
    isOpen: boolean;
    onClose: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
                                                         categories,
                                                         selectedCategory,
                                                         selectedSubcategory,
                                                         isOpen,
                                                         onClose,
                                                     }) => {
    const router = useRouter();
    // Track which categories have their subcategories expanded
    const [expandedCategories, setExpandedCategories] = React.useState<{ [key: string]: boolean }>({});

    // Toggle expanded state for a category
    const toggleCategoryExpanded = (categoryId: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // When a category is selected, expand it automatically
    React.useEffect(() => {
        if (selectedCategory) {
            setExpandedCategories(prev => ({
                ...prev,
                [selectedCategory]: true
            }));
        }
    }, [selectedCategory]);

    const handleCategoryClick = (categoryId: string) => {
        if (categoryId === selectedCategory && !selectedSubcategory) {
            // Clear filter if clicking the same category
            router.push('/items');
        } else {
            router.push(`/items?category=${categoryId}`);
        }
    };

    const handleSubcategoryClick = (categoryId: string, subcategory: string) => {
        router.push(`/items?category=${categoryId}&subcategory=${encodeURIComponent(subcategory)}`);
    };

    const clearFilters = () => {
        router.push('/items');
    };

    // Mobile sidebar
    const mobileSidebar = (
        <div
            className={`
        fixed inset-0 z-50 md:hidden transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-military-950/80"
                onClick={onClose}
            ></div>

            {/* Sidebar content */}
            <div className="relative w-4/5 max-w-sm h-full bg-military-800 border-r border-olive-800 overflow-y-auto">
                <div className="p-4 flex items-center justify-between border-b border-military-700">
                    <h2 className="text-xl font-bold text-tan-100">Filters</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-sm bg-military-700 hover:bg-military-600 text-tan-300"
                    >
                        <X size={18}/>
                    </button>
                </div>

                {/* Categories - same as desktop */}
                <div className="p-4">
                    <div className="mb-6">
                        <button
                            onClick={() => {
                                clearFilters()
                                onClose();
                            }}
                            className={`
                w-full py-3 px-4 rounded-sm text-left mb-2 font-medium text-lg
                ${!selectedCategory
                                ? 'bg-olive-600 text-tan-100 shadow-md'
                                : 'bg-military-700 text-tan-300 hover:bg-military-600 hover:text-tan-100'}
              `}
                        >
                            All Items
                        </button>

                        {Object.values(categories).map(category => (
                            <div key={category.id} className="mb-2">
                                <button
                                    onClick={() => {
                                        handleCategoryClick(category.id);
                                        if (!category.subcategories || category.subcategories.length === 0) {
                                            onClose();
                                        }
                                        toggleCategoryExpanded(category.id);
                                    }}
                                    className={`
                    w-full py-3 px-4 rounded-sm text-left font-medium text-lg flex items-center justify-between
                    ${selectedCategory === category.id && !selectedSubcategory
                                        ? 'bg-olive-600 text-tan-100 shadow-md'
                                        : 'bg-military-700 text-tan-300 hover:bg-military-600 hover:text-tan-100'}
                  `}
                                >
                                    <div className="flex items-center gap-3">
                    <span className="text-olive-400">
                      {getCategoryIcon(category.id)}
                    </span>
                                        {category.name}
                                    </div>

                                    {category.subcategories && category.subcategories.length > 0 && (
                                        <span>
                      {expandedCategories[category.id] ? (
                          <ChevronDown size={18} className="text-olive-400"/>
                      ) : (
                          <ChevronRight size={18} className="text-olive-400"/>
                      )}
                    </span>
                                    )}
                                </button>

                                {/* Subcategories - conditionally rendered */}
                                {category.subcategories &&
                                    category.subcategories.length > 0 &&
                                    expandedCategories[category.id] && (
                                        <div className="pl-4 mt-1 space-y-1">
                                            {category.subcategories.map(subcategory => (
                                                <button
                                                    key={subcategory}
                                                    onClick={() => {
                                                        handleSubcategoryClick(category.id, subcategory);
                                                        onClose();
                                                    }}
                                                    className={`
                          w-full py-2 px-4 rounded-sm text-left flex items-center gap-3
                          ${selectedCategory === category.id && selectedSubcategory === subcategory
                                                        ? 'bg-olive-700 text-tan-100'
                                                        : 'hover:bg-military-700 text-tan-300 hover:text-tan-100'}
                        `}
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-olive-500"></span>
                                                    {subcategory}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>

                    {/* Reset filters button */}
                    {/*<button
                        onClick={() => {
                            clearFilters()
                            onClose();
                        }}
                        className="w-full py-3 border border-olive-700 rounded-sm text-tan-300 hover:bg-military-700 hover:text-tan-100"
                    >
                        Reset Filters
                    </button>*/}
                </div>
            </div>
        </div>
    );

    // Desktop sidebar (always visible)
    const desktopSidebar = (
        <div className="hidden md:block w-64 flex-shrink-0">
            <div className="military-box p-4 rounded-sm mb-6">
                <h2 className="text-xl font-bold text-tan-100 mb-4 border-b border-military-700 pb-2">Categories</h2>

                <button
                    onClick={() => {
                        clearFilters()
                    }}
                    className={`
            w-full py-2 px-3 rounded-sm text-left mb-2 font-medium
            ${!selectedCategory
                        ? 'bg-olive-600 text-tan-100 shadow-md'
                        : 'bg-military-700 text-tan-300 hover:bg-military-600 hover:text-tan-100'}
          `}
                >
                    All Items
                </button>

                {Object.values(categories).map(category => (
                    <div key={category.id} className="mb-2">
                        <button
                            onClick={() => {
                                handleCategoryClick(category.id);
                                toggleCategoryExpanded(category.id);
                            }}
                            className={`
                w-full py-2 px-3 rounded-sm text-left font-medium flex items-center justify-between
                ${selectedCategory === category.id && !selectedSubcategory
                                ? 'bg-olive-600 text-tan-100 shadow-md'
                                : 'bg-military-700 text-tan-300 hover:bg-military-600 hover:text-tan-100'}
              `}
                        >
                            <div className="flex items-center gap-2">
                <span className="text-olive-400">
                  {getCategoryIcon(category.id)}
                </span>
                                {category.name}
                            </div>

                            {category.subcategories && category.subcategories.length > 0 && (
                                <span>
                  {expandedCategories[category.id] ? (
                      <ChevronDown size={16} className="text-olive-400"/>
                  ) : (
                      <ChevronRight size={16} className="text-olive-400"/>
                  )}
                </span>
                            )}
                        </button>

                        {/* Subcategories - conditionally rendered */}
                        {category.subcategories &&
                            category.subcategories.length > 0 &&
                            expandedCategories[category.id] && (
                                <div className="pl-4 mt-1 space-y-1">
                                    {category.subcategories.map(subcategory => (
                                        <button
                                            key={subcategory}
                                            onClick={() => {
                                                handleSubcategoryClick(category.id, subcategory);
                                            }}
                                            className={`
                      w-full py-1.5 px-3 rounded-sm text-left flex items-center gap-2 text-sm
                      ${selectedCategory === category.id && selectedSubcategory === subcategory
                                                ? 'bg-olive-700 text-tan-100'
                                                : 'hover:bg-military-700 text-tan-300 hover:text-tan-100'}
                    `}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-olive-500"></span>
                                            {subcategory}
                                        </button>
                                    ))}
                                </div>
                            )}
                    </div>
                ))}
            </div>

            {/* Additional filter options could go here */}
            {/*<div className="military-box p-4 rounded-sm">
                <h2 className="text-xl font-bold text-tan-100 mb-4 border-b border-military-700 pb-2">Options</h2>

                 {//Reset filters button}
                <button
                    onClick={() => {
                        clearFilters()
                    }}
                    className="w-full py-2 border border-olive-700 rounded-sm text-tan-300 hover:bg-military-700 hover:text-tan-100"
                >
                    Reset Filters
                </button>
            </div>*/}
        </div>
    );

    return (
        <>
            {/* Render both mobile and desktop sidebars */}
            {mobileSidebar}
            {desktopSidebar}
        </>
    );
};

export default FilterSidebar;
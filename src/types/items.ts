export interface Item {
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    images: {
        icon: string;
        thumbnail: string;
        fullsize: string;
    };
    stats: {
        // Common stats for all items
        rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
        price: number;
        weight: number;
        size: string;
        safeSlots: number;

        // Category-specific stats
        damage?: number;
        penetration?: number;
        fireRate?: number;
        recoil?: number;
        accuracy?: number;
        effectiveRange?: number;

        healAmount?: number;
        useTime?: number;
        duration?: number;

        energyValue?: number;
        hydrationValue?: number;

        // Armor-specific stats
        armorClass?: number;
        durability?: number;
        repairability?: string;
        ergoPenalty?: number;
        turnPenalty?: number;

        // Key-specific stats
        uses?: number;

        // Other potential stats based on item type
        [key: string]: any;
    };
    locations?: {
        map: string;
        spots: {
            x: number;
            y: number;
            description: string;
        }[];
    }[];
    relatedQuests?: string[]; // Quest IDs
    craftingRecipes?: {
        inputs: {
            itemId: string;
            quantity: number;
        }[];
        output: {
            quantity: number;
        };
    }[];
    notes?: string;
    tips?: string;
}

export interface ItemCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    subcategories?: string[];
}

// Define item categories
export const itemCategories: ItemCategory[] = [
    {
        id: 'weapons',
        name: 'Weapons',
        description: 'Firearms and melee weapons for combat',
        icon: 'gun',
        subcategories: [
            '5.56mm',
            '7.62mm',
            '9mm',
            '.45 ACP',
            '12 Gauge',
            'Melee'
        ]
    },
    {
        id: 'ammo',
        name: 'Ammunition',
        description: 'Various ammunition types for firearms',
        icon: 'bullet',
        subcategories: [
            '5.56mm',
            '7.62mm',
            '9mm',
            '.45 ACP',
            '12 Gauge'
        ]
    },
    {
        id: 'medicine',
        name: 'Medicine',
        description: 'Medical supplies for healing and enhancing performance',
        icon: 'medicine',
        subcategories: [
            'Bandages',
            'Medkits',
            'Stims',
            'Painkillers'
        ]
    },
    {
        id: 'food',
        name: 'Food & Drink',
        description: 'Consumables for sustenance and hydration',
        icon: 'food'
    },
    {
        id: 'junk',
        name: 'Junk',
        description: 'Miscellaneous items that can be used for crafting or trading',
        icon: 'box',
        subcategories: [
            'High Value',
            'Buildables',
            'Combustibles',
            'Intel',
            'Electronic',
            'Tools',
            'Household',
            'Power',
            'Misc'
        ]
    },
    {
        id: 'gear',
        name: 'Gear',
        description: 'Armor, backpacks, and tactical equipment',
        icon: 'shield',
        subcategories: [
            'Helmets',
            'Body Armor',
            'Tactical Rigs',
            'Backpacks'
        ]
    },
    {
        id: 'attachments',
        name: 'Attachments',
        description: 'Weapon modifications and attachments',
        icon: 'scope',
        subcategories: [
            'Sights',
            'Barrels',
            'Magazines',
            'Muzzle Devices',
            'Grips'
        ]
    },
    {
        id: 'keys',
        name: 'Keys & Access Cards',
        description: 'Items used to open locked doors and containers',
        icon: 'key'
    }
];

// Helper function to get category by ID
export function getCategoryById(id: string): ItemCategory | undefined {
    return itemCategories.find(category => category.id === id);
}

// Helper function to get subcategories for a category
export function getSubcategoriesForCategory(categoryId: string): string[] {
    const category = getCategoryById(categoryId);
    return category?.subcategories || [];
}

// Helper to get icon for a specific item category
export function getCategoryIcon(categoryId: string): string {
    const category = getCategoryById(categoryId);
    return category ? category.icon : 'box';
}

// Helper to format price with currency
export function formatPrice(price: number): string {
    return price.toLocaleString() + ' ₽';
}

// Helper to format weight with unit
export function formatWeight(weight: number): string {
    return weight.toFixed(2) + ' kg';
}

// Helper to get color class for item rarity
export function getRarityColorClass(rarity: string): string {
    switch (rarity) {
        case 'Common':
            return 'text-gray-200';
        case 'Uncommon':
            return 'text-olive-400';
        case 'Rare':
            return 'text-blue-400';
        case 'Epic':
            return 'text-purple-400';
        case 'Legendary':
            return 'text-yellow-400';
        default:
            return 'text-gray-200';
    }
}

// Helper to get background color class for item rarity
export function getRarityBgClass(rarity: string): string {
    switch (rarity) {
        case 'Common':
            return 'bg-gray-800';
        case 'Uncommon':
            return 'bg-olive-900';
        case 'Rare':
            return 'bg-blue-900';
        case 'Epic':
            return 'bg-purple-900';
        case 'Legendary':
            return 'bg-yellow-900';
        default:
            return 'bg-gray-800';
    }
}

// Helper to get border color class for item rarity
export function getRarityBorderClass(rarity: string): string {
    switch (rarity) {
        case 'Common':
            return 'border-gray-600';
        case 'Uncommon':
            return 'border-olive-600';
        case 'Rare':
            return 'border-blue-600';
        case 'Epic':
            return 'border-purple-600';
        case 'Legendary':
            return 'border-yellow-600';
        default:
            return 'border-gray-600';
    }
}
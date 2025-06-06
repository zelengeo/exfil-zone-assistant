
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
        rarity: ItemRarity;
        price: number;
        weight: number;
    };

    notes?: string;
    tips?: string;
}

// Interpolation modes for curves
export type InterpolationMode = 'cubic' | 'linear';
export type TangentMode = 'user' | 'auto';

// Ballistic curve point with all properties from game data
export interface CurvePoint {
    interpMode: InterpolationMode;
    tangentMode: TangentMode;
    time: number;
    value: number;
    arriveTangent: number;
    leaveTangent: number;
}

export interface RecoilParameters {
    shiftMomentum: number;
    pitchBaseMomentum: number;
    yawBaseMomentum: number;
    rollBaseMomentum?: number;
    shiftStiffness: number;
    pitchStiffness: number;
    yawStiffness: number;
    rollStiffness: number;
    shiftDamping?: number;
    pitchDamping: number;
    yawDamping: number;
    rollDamping: number;
    shiftMass?: number;
    pitchMass: number;
    yawMass: number;
    rollMass: number;
    oneHandedADSMultiplier?: number;
    verticalRecoilControl: number;
    horizontalRecoilControl: number;
}

// Weapon type with complete stats from game data
export interface Weapon extends Item {
    category: 'weapons';
    stats: Item['stats'] & {
        // Required weapon stats
        fireRate: number;
        caliber: string;

        // Recoil parameters
        recoilParameters?: RecoilParameters;

        // Other weapon properties
        MOA?: number;
        ADSSpeed?: number;
        ergonomics?: number;
        //Needs investigation - In game UI shows some power values, but not sure what they are
        firingPower?: number;
        //PROBABLY LEFTOVER DATA FROM OTHER MODE/GAME cuz these values are AMMO-related
        damageRangeCurve?: string;
        bulletDropFactor?: number;
        muzzleVelocity?: number;
        hitDamage?: number;
        headDamageScale?: number;
    };
}

// Complete ammunition type with ballistic curves
export interface Ammunition extends Item {
    category: 'ammo';
    stats: Item['stats'] & AmmoProperties;
}

// Complete armor type with all curves
export interface Armor extends Item {
    category: 'gear';
    subcategory: 'Body Armor' | 'Helmets';
    stats: Item['stats'] & ArmorProperties;
}

export interface BodyArmor extends Armor {
    subcategory: 'Body Armor';
}

export interface Helmet extends Armor {
    subcategory: 'Helmets';
    stats: Item['stats'] & HelmetProperties;
}

export type AnyItem = Weapon | Armor | Ammunition | BodyArmor | Helmet;

// Protective zone from armor data
export interface ProtectiveZone {
    bodyPart: string; // bodypart.id e.g., "spine_03", "pelvis", "UpperArm_L"
    armorClass: number;
    bluntDamageScalar: number;
    protectionAngle: number; // not used in simulation yet
}

export interface AmmoProperties {
    // Required ammo stats
    damage: number;
    penetration: number;
    caliber: string;

    // Damage modifiers
    bluntDamageScale: number;
    bleedingChance: number;
    protectionGearPenetratedDamageScale: number;
    protectionGearBluntDamageScale: number;

    // Ballistics
    muzzleVelocity?: number;
    bulletDropFactor?: number;

    //precalculated values (cache)
    damageAtRange: {
        '60m': number;
        '120m': number;
        '240m': number;
        '480m': number;
    };
    penetrationAtRange: {
        '60m': number;
        '120m': number;
        '240m': number;
        '480m': number;
    };

    // Full ballistic curves from game data
    ballisticCurves: {
        damageOverDistance: CurvePoint[];
        penetrationPowerOverDistance: CurvePoint[];
    };
}

export interface ArmorProperties {
    // Required armor stats
    armorClass: number;
    maxDurability: number;

    // Value for correct simulation of a damaged armor
    currentDurability: number;

    // Damage scalars
    durabilityDamageScalar: number;
    bluntDamageScalar: number;

    // Protection zones
    protectiveData: ProtectiveZone[];

    // Penetration curves from game data
    penetrationChanceCurve: CurvePoint[];
    penetrationDamageScalarCurve: CurvePoint[];
    antiPenetrationDurabilityScalarCurve: CurvePoint[];
}

export type helmetSoundMix = 'default' | 'Delta' | "OPSWAT" | "MuffledGeneral";
export interface HelmetProperties extends ArmorProperties {
    soundMix: helmetSoundMix;

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
            '5.56x45mm',
            '7.62x39mm',
            '7.62x51mm',
            '7.62x54mmR',
            '9x19mm',
            '.45 ACP',
            '12 Gauge',
            '6.8x51mm'
        ]
    },
    {
        id: 'ammo',
        name: 'Ammunition',
        description: 'Various ammunition types for firearms',
        icon: 'bullet',
        subcategories: [
            '5.56x45mm',
            '7.62x39mm',
            '7.62x51mm',
            '7.62x54mmR',
            '9x19mm',
            '.45 ACP',
            '12 Gauge',
            '6.8x51mm'
        ]
    },
    {
        id: 'armor',
        name: 'Body Armor',
        description: 'Body armor for combat',
        icon: 'shield',
        subcategories: [
            "Armor class 2",
            "Armor class 3",
            "Armor class 4",
            "Armor class 5",
            "Armor class 6",
        ]
    },
    //TODO - update config after data extraction
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
    return price.toLocaleString() + ' EZD';
}

// Helper to format weight with unit
export function formatWeight(weight: number): string {
    return weight.toFixed(2) + ' kg';
}

// Rarity system for items
export type ItemRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | "Ultimate";

// Rarity configuration with colors and display properties
export interface RarityConfig {
    name: ItemRarity;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;  // For Tailwind classes
    bgClass: string;    // For Tailwind classes
    borderClass: string; // For Tailwind classes
    // dropChance?: number; // Optional: for future loot system
    description?: string;
}

// Rarity configuration object
export const RARITY_CONFIG: Record<ItemRarity, RarityConfig> = {
    Common: {
        name: 'Common',
        color: '#9CA3AF', // gray-400
        bgColor: '#374151', // gray-700
        borderColor: '#4B5563', // gray-600
        textColor: 'text-gray-200',
        bgClass: 'bg-gray-800',
        borderClass: 'border-gray-600',
        description: 'Frequently found items'
    },
    Uncommon: {
        name: 'Uncommon',
        color: '#9BA85E', // olive-400
        bgColor: '#2E331B', // olive-800
        borderColor: '#454D28', // olive-700
        textColor: 'text-olive-400',
        bgClass: 'bg-olive-900',
        borderClass: 'border-olive-600',
        description: 'Less common but reliable items'
    },
    Rare: {
        name: 'Rare',
        color: '#60A5FA', // blue-400
        bgColor: '#1E3A8A', // blue-800
        borderColor: '#2563EB', // blue-600
        textColor: 'text-blue-400',
        bgClass: 'bg-blue-900',
        borderClass: 'border-blue-600',
        description: 'High-quality specialized equipment'
    },
    Epic: {
        name: 'Epic',
        color: '#A855F7', // purple-500
        bgColor: '#581C87', // purple-800
        borderColor: '#7C3AED', // purple-600
        textColor: 'text-purple-400',
        bgClass: 'bg-purple-900',
        borderClass: 'border-purple-600',
        description: 'Exceptional military-grade gear'
    },
    Legendary: {
        name: 'Legendary',
        color: '#F59E0B', // amber-500
        bgColor: '#92400E', // amber-800
        borderColor: '#D97706', // amber-600
        textColor: 'text-yellow-400',
        bgClass: 'bg-yellow-900',
        borderClass: 'border-yellow-600',
        description: 'Elite tactical equipment'
    },
    Ultimate: {
        name: 'Ultimate',
        color: '#DC2626', // red-600
        bgColor: '#7F1D1D', // red-900
        borderColor: '#991B1B', // red-800
        textColor: 'text-red-400',
        bgClass: 'bg-red-900',
        borderClass: 'border-red-600',
        description: 'Prototype and experimental gear'
    }
};

// Helper functions for rarity
export function getRarityConfig(rarity: ItemRarity): RarityConfig {
    return RARITY_CONFIG[rarity];
}

export function getRarityColorClass(rarity: ItemRarity): string {
    return RARITY_CONFIG[rarity].textColor;
}

export function getRarityBgClass(rarity: ItemRarity): string {
    return RARITY_CONFIG[rarity].bgClass;
}

export function getRarityBorderClass(rarity: ItemRarity): string {
    return RARITY_CONFIG[rarity].borderClass;
}

export function isValidRarity(rarity: string): rarity is ItemRarity {
    return rarity in RARITY_CONFIG;
}

// Get all rarities in order (Common to Legendary)
export function getAllRarities(): ItemRarity[] {
    return ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', "Ultimate"];
}
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

export type FireMode = "semiAuto" | "fullAuto" | "pumpAction" | "boltAction" | "burstFire"
export const CALIBERS = [
    '.45 ACP',
    '12GA',
    '5.45x39',
    '5.56x45',
    '6.8x51',
    '7.62x39',
    '7.62x51',
    '7.62x54R',
    '9x19'
] as const;
export type Caliber = typeof CALIBERS[number];

// Weapon type with complete stats from game data
export interface Weapon extends Item {
    category: 'weapons';
    stats: Item['stats'] & {
        // Required weapon stats
        fireRate: number;
        caliber: Caliber

        // Recoil parameters
        recoilParameters: RecoilParameters;

        // Other weapon properties
        MOA?: number;
        ADSSpeed: number;
        ergonomics: number;
        fireMode: FireMode;
        firingPower: number;
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

export interface Grenade extends Item {
    category: 'grenades';
    stats: Item['stats'] & GrenadeProperties;
}

export interface Attachment extends Item {
    category: 'attachments';
    subcategory: 'Magazines' | "Sights" | "Suppressors" | "Grips" | "Compensators" | "Tactical" | "Rails";
    stats: Item['stats'] & AttachmentProperties;
}

// Complete attachment type with all curves
export interface TacticalAttachment extends Attachment {
    subcategory: 'Tactical';
    stats: Item['stats'] & TacticalAttachmentProperties;
}

export interface Sight extends Attachment {
    subcategory: 'Sights';
    stats: Item['stats'] & SightProperties;
}

export interface Suppressor extends Attachment {
    subcategory: 'Suppressors';
}

export interface Grip extends Attachment {
    subcategory: 'Grips';
}

export interface Compensator extends Attachment {
    subcategory: 'Compensators';
}

export interface Rail extends Attachment {
    subcategory: 'Rails';
}

export interface Magazine extends Attachment {
    category: 'attachments';
    subcategory: 'Magazines';
    stats: Item['stats'] & MagazineProperties;
}

// Complete armor type with all curves
export interface Armor extends Item {
    category: 'gear';
    subcategory: 'Body Armor' | 'Helmets' | "Face Shields";
    stats: Item['stats'] & ArmorProperties;
}

export interface BodyArmor extends Armor {
    subcategory: 'Body Armor';
}

export interface Helmet extends Armor {
    subcategory: 'Helmets';
    stats: Item['stats'] & HelmetProperties;
}

export interface FaceShield extends Armor {
    subcategory: 'Face Shields';
}

export interface Medicine extends Item {
    category: 'medicine';
    subcategory: 'Bandages' | 'Suturing Tools' | "Painkillers" | "Syringes" | "Stims";
    stats: Item['stats'];
}

export interface Bandage extends Medicine {
    subcategory: 'Bandages';
    stats: Item['stats'] & {
        canHealDeepWound: boolean
    }
}

export interface LimbRestore extends Medicine {
    subcategory: 'Suturing Tools';
    stats: Item['stats'] & {
        hpPercentage: number,
        useTime: number,
        usesCount: number,
        brokenHP: number
    }
}

export interface Painkiller extends Medicine {
    subcategory: 'Painkillers';
    stats: Item['stats'] & {
        usesCount: number,
        effectTime: number,
        energyFactor: number,
        hydraFactor: number,
        sideEffectTime: number,
    }
}

export interface Stim extends Medicine {
    subcategory: 'Stims';
    stats: Item['stats'] & {
        useTime: number,
        effectTime: number,
    }
}

export interface Syringe extends Medicine {
    subcategory: 'Syringes';
    stats: Item['stats'] & {
        capacity: number,
        cureSpeed: number,
        canReduceBleeding: boolean,
    }
}

// Properties specific to provisions items
export interface ProvisionsProperties {
    capacity: number;           // Maximum volume/amount
    threshold: number;          // When it's considered "empty"
    consumptionSpeed: number;   // How fast it's consumed
    energyFactor: number;       // Energy restoration value
    hydraFactor: number;        // Hydration restoration value
}

// Base provisions interface
export interface Provisions extends Item {
    category: 'provisions';
    subcategory: 'Food' | 'Drinks';
    stats: Item['stats'] & ProvisionsProperties;
}

// Specific drink interface
export interface Drink extends Provisions {
    subcategory: 'Drinks';
}

// Specific food interface
export interface Food extends Provisions {
    subcategory: 'Food';
}

export interface TaskItemProperties {
    taskIds: string[];
}

export type TaskItemSubcategory = 'Tommy' | 'Maximillian' | 'Maggie' | 'Johnny' | 'Igor' | 'Universal';

export interface TaskItem extends Item {
    category: 'task-items';
    subcategory: TaskItemSubcategory;
    stats: Item['stats'] & TaskItemProperties;
}

export interface Misc extends Item {
    category: 'misc';
    subcategory: 'Household' | 'Intel' | 'Electric' | 'Power' | 'Tools' | 'Combustible' | 'Building' | 'HighValue' | 'Medicine';
    stats: Item['stats'];
}

export type AnyItem =
    Weapon
    | Armor
    | Ammunition
    | BodyArmor
    | Helmet
    | FaceShield
    | Medicine
    | Provisions
    | Grenade
    | Attachment
    | TaskItem
    | Misc;

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
    pellets?: number;
    caliber: Caliber

    // Damage modifiers
    bluntDamageScale: number;
    bleedingChance: number;
    protectionGearPenetratedDamageScale: number;
    protectionGearBluntDamageScale: number;

    // Ballistics
    muzzleVelocity: number;
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

export interface AttachmentProperties {
    attachmentModifier?: AttachmentModifier;
    attachmentData?: AttachmentData;
}

export interface TacticalAttachmentProperties extends AttachmentProperties {
    traceDistance: number;
}

export interface SightProperties extends AttachmentProperties {
    magnification?: number;
    zeroedDistanceValue?: number;
}

// Add attachment modifier interface
export interface AttachmentModifier {
    // Damage and ballistics
    headDamageScaleModifier?: number;
    bulletVelocityModifier?: number;
    gunHitDamageModifier?: number;
    damageDropModifer?: number;

    // Aiming and handling
    ADSSpeedModifier?: number;
    ergonomicsModifier?: number;

    // Shotgun specific
    shotGunBulletSpreadModifer?: number;

    // Recoil control
    verticalRecoilModifier?: number;
    horizontalRecoilModifier?: number;

    // Movement and stability
    shiftMomentumModifer?: number;
    shiftStiffnessModifer?: number;
    yawMomentumModifer?: number;
    yawStiffnessModifer?: number;
    rollMomentumModifer?: number;
    rollStiffnessModifer?: number;
    pitchMomentumModifer?: number;
    pitchStiffnessModifer?: number;
}

export interface AttachmentData {
    recoilPitchInfluent?: number;
    recoilYawInfluent?: number;
}

export interface MagazineProperties {
    // Magazine properties
    capacity: number;
    caliber: Caliber;
    ADSSpeedModifier?: number;
    ergonomicsModifier?: number;
    compatibleWeapons: string[];
}

export interface GrenadeProperties {
    "fuseTime": number | null;
    "radius": number;
    "bluntDamageScale": number;
    "bleedingChance": number;
    "effectTime": number;
    "protectionGearPenetratedDurabilityDamageScale": number;
    "protectionGearBluntDurabilityDamageScale": number;
    applyChanceCurve: CurvePoint[];
    damageOverDistance: CurvePoint[];
    penetrationPowerOverDistance: CurvePoint[];
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
    "canAttach"?: string[],
}

export interface ItemCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    subcategories: string[];
}

// Define item categories
export const itemCategories: Record<string, ItemCategory> = {

    'weapons': {
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
    'ammo': {
        id: 'ammo',
        name:
            'Ammunition',
        description:
            'Various ammunition types for firearms',
        icon:
            'bullet',
        subcategories:
            [
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
    attachments: {
        id: 'attachments',
        name: 'Attachments',
        description: 'Weapon attachments',
        icon: 'scope',
        subcategories: [
            'Magazines',
            'Sights',
            'Compensators',
            'Suppressors',
            'Grips',
            'Tactical',
            'Rails',
        ]
    },

    grenades: {
        id: 'grenades',
        name: 'Grenades',
        description: 'Grenades and explosive devices',
        icon: 'bomb',
        subcategories: [
            'Fragmentation',
            'Utility',
        ]
    }
    ,
    gear: {
        id: 'gear',
        name:
            'Gear',
        description:
            'Armor, backpacks, and tactical equipment',
        icon:
            'shield',
        subcategories:
            [
                'Helmets',
                'Body Armor',
                'Face Shields',
            ]
    },
    medicine: {
        id: 'medicine',
        name: 'Medicine',
        description: 'Medical supplies for healing and enhancing performance',
        icon: 'medicine',
        subcategories: [
            'Bandages',
            'Suturing Tools',
            'Syringes',
            'Stims',
            'Painkillers'
        ]
    },
    provisions: {
        id: 'provisions',
        name: 'Provisions',
        description: 'Food and drinks for sustenance and hydration',
        icon: 'food',
        subcategories: [
            'Food',
            'Drinks',
        ]
    },
    'task-items': {
        id: 'task-items',
        name: 'Task Items',
        description: 'Special task-related items for various NPCs',
        icon: 'package',
        subcategories: [
            'Tommy',
            'Maximillian',
            'Maggie',
            'Johnny',
            'Igor',
            'Universal'
        ]
    },
    'misc': {
        id: 'misc',
        name: 'Miscellaneous',
        description: 'Various utility items and materials',
        icon: 'box',
        subcategories: [
            'Household',
            'Intel',
            'Electric',
            'Power',
            'Tools',
            'Combustible',
            'Building',
            'HighValue',
            'Medicine'
        ]
    }
// {
//     id: 'keys',
//     name: 'Keys & Access Cards',
//     description: 'Items used to open locked doors and containers',
//     icon: 'key'
// }

};

// Helper function to get category by ID
export function getCategoryById(id: string): ItemCategory | undefined {
    return itemCategories[id];
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

export const FIRE_MODE_CONFIG: Record<FireMode, string> = {
    fullAuto: "Full Auto",
    semiAuto: "Semi Auto",
    burstFire: "Burst Fire",
    pumpAction: "Pump Action",
    boltAction: "Bolt Action",
}

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
import type { TradeStats } from '@/types/trade';

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
        weight: number;
    } & TradeStats;

    notes?: string;
    tips?: string;

    /**
     * Set by the extraction pipeline's merge step on items the published wiki has but the game
     * files no longer do (`"missing-from-game-data"`). Kept so these stay visible for manual
     * review instead of disappearing silently - see the extraction repo's mergeWithWiki.js.
     */
    extractionStatus?: string;
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
    '.338 LM',
    '.45 ACP',
    '12GA',
    '12.7x55',
    '5.45x39',
    '5.56x45',
    '6.8x51',
    '7.62x39',
    '7.62x51',
    '7.62x54R',
    '9x19',
    '9x39'
] as const;
export type Caliber = typeof CALIBERS[number];

/**
 * One part of a weapon's gunsmith build. A weapon ships as a *preset*: a parts list whose single
 * receiver (`isReceiver`) carries the simulation model, and whose other parts contribute weight
 * and handling modifiers.
 */
export interface WeaponPart {
    sellId: string;
    count: number;
    name: string;
    weight: number;
    isReceiver: boolean;
}

/** The numbers the in-game gunsmith screen shows for a preset, baked by the game itself. */
export interface GunsmithDisplay {
    RPM: number;
    caliber: string;
    ergonomics: number;
    verticalRecoil: number;
    horizontalRecoil: number;
    firingPower: number;
    spreadMOA: number;
}

// Weapon type with complete stats from game data
export interface Weapon extends Item {
    category: 'weapons';

    // Gunsmith model - a weapon is a preset built from parts, one of which is the receiver.
    gunsmithDisplay?: GunsmithDisplay;
    parts?: WeaponPart[];
    receiverId?: string;
    defaultClip?: string;
    compatibleMagazines?: string[];
    /**
     * Weapons sharing a base platform, e.g. every AK74 variant. Used to group the weapons page -
     * see `getWeaponFamilyLabel` for the display spelling.
     */
    family?: string;
    gameClass?: string;
    gameId?: string;

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
        /**
         * The single mode the old data carried. `fireModes` is the game's full bit set and is
         * authoritative where it is non-empty; this stays for the receivers that author none,
         * where it is curated.
         */
        fireMode: FireMode;
        /** Every mode the receiver supports. Empty when the receiver authors no bit set. */
        fireModes?: FireMode[];
        /** Base penetration power of the receiver, before ammo. */
        penetration?: number;
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
    /** Gunsmith id, e.g. `gunsmith.flame12.clip.10`. */
    gameId?: string;
    /** The weapon platform this magazine belongs to, e.g. `Flame12`. */
    family?: string;
    stats: Item['stats'] & MagazineProperties;
}

// Complete armor type with all curves
export interface Gear extends Item {
    category: 'gear';
    subcategory: 'Body Armor' | 'Helmets' | "Face Shields" | "Eye Protection" | "Night Vision"
        | "Backpacks" | "Holsters";
    stats: Item['stats'];
}

export interface Armor extends Gear {
    subcategory: 'Body Armor' | 'Helmets' | "Face Shields" | "Eye Protection";
    stats: Item['stats'] & ArmorProperties;
}

export interface BodyArmor extends Armor {
    subcategory: 'Body Armor';
}

export interface Helmet extends Armor {
    subcategory: 'Helmets';
    stats: Item['stats'] & HelmetProperties;
}

/**
 * Face shields and goggles. The game files put both under `Warfare/Helmet/Mask`; the wiki keeps
 * "Eye Protection" as a separate shelf for goggles, which is a curated distinction (see the
 * extraction repo's mergeWithWiki.js). They share one protection model, so they share one type.
 */
export interface FaceShield extends Armor {
    subcategory: 'Face Shields' | 'Eye Protection';
    stats: Item['stats'] & FaceShieldProperties;
}

/**
 * Night-vision devices ship in the same data file as face shields but carry **no protection model
 * at all** - no armour class, durability, cones or curves. They are gear, not armour, by design.
 */
export interface NightVision extends Gear {
    subcategory: 'Night Vision';
    stats: Item['stats'] & { sellId?: string };
}

export interface AttachmentPoint {
    tag: string;
    types: string[];
}

export interface BackpackProperties {
    /** Human-readable "WxDxH" in cm, derived from `storageGrid`. */
    sizes: string;
    /** The game's own storage volume, in grid cells plus the cell size. */
    storageGrid?: { x: number; y: number; z: number; unit: number };
    sellId?: string;
    attachmentPoints: AttachmentPoint[];
}

// Backpack interface
export interface Backpack extends Gear {
    subcategory: 'Backpacks';
    stats: Item['stats'] & BackpackProperties;
}

export interface HolsterProperties {
    canAttach: string[];
}

// Backpack interface
export interface Holster extends Gear {
    subcategory: 'Holsters';
    stats: Item['stats'] & HolsterProperties;
}

export interface Medicine extends Item {
    category: 'medicine';
    subcategory: 'Bandages' | 'Suturing Tools' | "Painkillers" | "Syringes" | "Stims";
    stats: Item['stats'];
}

export interface Bandage extends Medicine {
    subcategory: 'Bandages';
    stats: Item['stats'] & {
        /** Curated - the game files do not record it. */
        canHealDeepWound: boolean,
        healPerSecond?: number,
        healDuration?: number,
        /** Deep-wound severity this bandage can close. */
        operationRequirement?: number,
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
        /**
         * Painkillers derive from the consumables base class, so they carry the provisions
         * consumption model too.
         */
        threshold?: number,
        consumptionSpeed?: number,
    }
}

export interface Stim extends Medicine {
    subcategory: 'Stims';
    stats: Item['stats'] & {
        useTime: number,
        effectTime: number,
        sellId?: string,
        /** Curated: the item -> perk link is Blueprint graph code, not data. */
        perk?: string,
    }
}

export interface Syringe extends Medicine {
    subcategory: 'Syringes';
    stats: Item['stats'] & {
        capacity: number,
        cureSpeed: number,
        /** Curated - the game files do not record it. */
        canReduceBleeding: boolean,
        healPerSecond?: number,
        healDuration?: number,
        useTime?: number,
    }
}

// Properties specific to provisions items
export interface ProvisionsProperties {
    capacity: number;           // Maximum volume/amount
    threshold: number;          // When it's considered "empty"
    thresholdTime?: number;     // How long consumption must continue before the threshold applies
    consumptionSpeed: number;   // How fast it's consumed
    energyFactor: number;       // Energy restoration value
    hydraFactor: number;        // Hydration restoration value
    stackSize?: number;         // How many fit in one inventory slot
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

/**
 * Which trader's tasks an item belongs to. Curated - nothing in the client data links a quest item
 * to a trader, so items the extraction found but nobody has classified land in `Unassigned`.
 */
export type TaskItemSubcategory =
    'Tommy' | 'Maximillian' | 'Maggie' | 'Johnny' | 'Igor' | 'Universal' | 'Unassigned';

export const TASK_ITEM_SUBCATEGORIES: TaskItemSubcategory[] =
    ['Tommy', 'Maximillian', 'Maggie', 'Johnny', 'Igor', 'Universal', 'Unassigned'];

export function isTaskItemSubcategory(value: string): value is TaskItemSubcategory {
    return (TASK_ITEM_SUBCATEGORIES as string[]).includes(value);
}

export interface TaskItem extends Item {
    category: 'task-items';
    subcategory: TaskItemSubcategory;
    stats: Item['stats'] & TaskItemProperties;
}

/**
 * A door key. The subcategory is the map it belongs to, which the game states directly - the old
 * building-type union here never matched the shipped data.
 */
export interface Keys extends Item {
    category: 'keys';
    subcategory: 'Suburb' | 'Dam' | 'Metro' | 'Resort' | 'Smuggling Tunnel' | 'Smuggling Tunnel (Infection)';
    /** Shop id, e.g. `card.map1.beartown_h1`. */
    gameId?: string;
    stats: Item['stats'] & {
        /** How many times the key can be used before it breaks. */
        uses?: number;
        /** Where in the map the door is. */
        location?: string;
    };
}

export interface Misc extends Item {
    category: 'misc';
    subcategory: 'Household' | 'Intel' | 'Electric' | 'Power' | 'Tools' | 'Combustible' | 'Building' | 'HighValue' | 'Medicine';
    stats: Item['stats'] & {
        /** How much the item shrinks when carried in a backpack. */
        backpackDimensionMultiplier?: number;
        /** How much it shrinks in a secure container. */
        safeContainerBoundScale?: number;
    };
}

export type AnyItem =
    Weapon
    | Gear
    | Armor
    | Ammunition
    | BodyArmor
    | Helmet
    | FaceShield
    | NightVision
    | Backpack
    | Holster
    | Medicine
    | Provisions
    | Grenade
    | Attachment
    | TaskItem
    | Keys
    | Misc;

/**
 * One protection point on a piece of armour: a bone, and the wedge around it the plate covers.
 *
 * A hit counts as protected when it arrives inside `protectionAngle` degrees of the bone's forward
 * axis, measured two-sided — front and back both — which is why a 90 degree wedge covers the chest
 * from ahead and behind but not from the flank. `forwardAxis` and `upAxis` select which of the
 * bone's own axes to measure against, as indices into its basis. See
 * `ProtectiveGearBlueprintFunctionLibrary.Is Protected` in the decompiled game, ported to
 * `src/lib/protection/coverage.ts`.
 */
export interface ProtectiveZone {
    bodyPart: string; // bodypart.id e.g., "spine_03", "pelvis", "UpperArm_L"
    armorClass: number;
    bluntDamageScalar: number;
    /** Half-angle of the covered wedge, in degrees. Not uniform: 25 to 90 across the catalogue. */
    protectionAngle: number;
    /** Index of the bone axis the wedge points along. 1 on every published protection point. */
    forwardAxis?: number;
    /** Index of the bone axis taken as up when building the measuring basis. */
    upAxis?: number;
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
    /** Scalars the game applies on top of the curves. */
    damageFalloffFactor?: number;
    penetrationFalloffFactor?: number;
    /** The `BulletProfiles` asset this round's ballistics come from. */
    bulletProfileId?: string;

    /**
     * Precalculated values (cache). Optional: only rounds that were on the published wiki carry
     * these - the rest are interpolated from `ballisticCurves` on demand, which is where the cache
     * came from in the first place.
     */
    damageAtRange?: {
        '60m': number;
        '120m': number;
        '240m': number;
        '480m': number;
    };
    penetrationAtRange?: {
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
    /** The gunsmith id this part installs as, e.g. `gunsmith.20rail.foregrip.afg`. */
    gunsmithId?: string;
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
    /** The caliber as the ammo/weapon pages spell it, e.g. `12 Gauge` for `12GA`. */
    ammoSubcategory?: string;
    ADSSpeedModifier?: number;
    ergonomicsModifier?: number;
    compatibleWeapons: string[];
}

export interface GrenadeProperties {
    "fuseTime": number | null;
    /** Inner blast radius - full effect. */
    "radius": number;
    /** Outer blast radius, where the effect has fallen off to nothing. */
    "radiusMax"?: number | null;
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

    /** Shop id the game sells this under. */
    sellId?: string;

    /**
     * Protection zones. Optional now: head gear protects through `coneRegions` in the current
     * game model, and only the items that were on the published wiki carry curated per-bone data.
     * Body armour still has it on every item.
     */
    protectiveData?: ProtectiveZone[];

    // Penetration curves from game data
    penetrationChanceCurve: CurvePoint[];
    penetrationDamageScalarCurve: CurvePoint[];
    antiPenetrationDurabilityScalarCurve: CurvePoint[];
}

/**
 * A rectangular frustum of head coverage - the model helmets and face shields actually use.
 *
 * `widthAngle` / `heightAngle` are **half-angles** in degrees, measured from the region's own axis
 * after `rotation`, with the apex displaced from the head origin by `offset` (cm).
 *
 * Nothing here is interpreted into coverage percentages yet: the region polarity question is still
 * open upstream. See the extraction repo's docs/HEAD_PROTECTION.md.
 */
export interface ConeRegion {
    region: string;
    widthAngle: number;
    heightAngle: number;
    offset: { x: number; y: number; z: number };
    rotation: { pitch: number; yaw: number; roll: number };
}

/** Head gear coverage, shared by helmets and face shields. */
export interface HeadProtectionProperties {
    coneRegions: ConeRegion[];
}

export type helmetSoundMix = 'default' | 'Delta' | "OPSWAT" | "MuffledGeneral";

export interface HelmetProperties extends ArmorProperties, HeadProtectionProperties {
    /** Curated: only the items that were on the published wiki carry it. */
    soundMix?: helmetSoundMix;
    "canAttach"?: string[],
    /** Half-angles of the helmet's face opening, in degrees. */
    faceWidthAngle?: number;
    faceHeightAngle?: number;
}

export interface FaceShieldProperties extends ArmorProperties, HeadProtectionProperties {
    /** Half-angles of the area the shield covers, in degrees. */
    maskWidthAngle?: number;
    maskHeightAngle?: number;
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
            '7.62x51mm',
            '6.8x51mm',
            '7.62x54mmR',
            '7.62x39mm',
            '5.45x39mm',
            '9x39mm',
            '9x19mm',
            '.45 ACP',
            '12 Gauge',
            '12.7x55mm',
            '.338 Lapua Magnum',
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
                '7.62x51mm',
                '6.8x51mm',
                '7.62x54mmR',
                '7.62x39mm',
                '5.45x39mm',
                '9x39mm',
                '9x19mm',
                '.45 ACP',
                '12 Gauge',
                '12.7x55mm',
                '.338 Lapua Magnum',
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
                'Eye Protection',
                'Night Vision',
                'Backpacks',
                'Holsters'
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
        subcategories: [...TASK_ITEM_SUBCATEGORIES]
    },
    'keys': {
        id: 'keys',
        name: 'Keys',
        description: 'Items used to open locked',
        icon: 'key',
        subcategories: [
            'Suburb',
            'Dam',
            'Metro',
            'Resort',
            'Smuggling Tunnel',
            'Smuggling Tunnel (Infection)',
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
//
// The values are the Cold Steel `rarity` scale from tailwind.config.js, where the reasoning
// behind the six steps lives. Render these through <RarityBadge> rather than by hand: pairing a
// text colour with `.micro-label` does not work, because that utility hard-sets `text-ink-600`
// and, being declared after Tailwind's utilities, wins — which is why rarity used to render grey
// everywhere it was shown.
export const RARITY_CONFIG: Record<ItemRarity, RarityConfig> = {
    Common: {
        name: 'Common',
        color: '#8DA0AE',
        bgColor: '#161D24',
        borderColor: '#2C363E',
        textColor: 'text-rarity-common',
        bgClass: 'bg-rarity-common-fill',
        borderClass: 'border-rarity-common-edge',
        description: 'Frequently found items'
    },
    Uncommon: {
        name: 'Uncommon',
        color: '#5FD18F',
        bgColor: '#12211A',
        borderColor: '#234436',
        textColor: 'text-rarity-uncommon',
        bgClass: 'bg-rarity-uncommon-fill',
        borderClass: 'border-rarity-uncommon-edge',
        description: 'Less common but reliable items'
    },
    Rare: {
        name: 'Rare',
        color: '#3E8FC7',
        bgColor: '#0F1B25',
        borderColor: '#1E3D54',
        textColor: 'text-rarity-rare',
        bgClass: 'bg-rarity-rare-fill',
        borderClass: 'border-rarity-rare-edge',
        description: 'High-quality specialized equipment'
    },
    Epic: {
        name: 'Epic',
        color: '#CFA2FF',
        bgColor: '#191428',
        borderColor: '#3B2E55',
        textColor: 'text-rarity-epic',
        bgClass: 'bg-rarity-epic-fill',
        borderClass: 'border-rarity-epic-edge',
        description: 'Exceptional military-grade gear'
    },
    Legendary: {
        name: 'Legendary',
        color: '#F5B23A',
        bgColor: '#1F180B',
        borderColor: '#4A3714',
        textColor: 'text-rarity-legendary',
        bgClass: 'bg-rarity-legendary-fill',
        borderClass: 'border-rarity-legendary-edge',
        description: 'Elite tactical equipment'
    },
    Ultimate: {
        name: 'Ultimate',
        color: '#FF5F5F',
        bgColor: '#211011',
        borderColor: '#4E2222',
        textColor: 'text-rarity-ultimate',
        bgClass: 'bg-rarity-ultimate-fill',
        borderClass: 'border-rarity-ultimate-edge',
        description: 'Prototype and experimental gear'
    },
};

/**
 * Display spelling for the weapon families the game data spells its own way.
 *
 * The raw value is the gun folder's name (`Mp5`, `SR3M_VSS_ASVAL`), which is an asset path element
 * rather than something to show a player. Only the ones that read wrong are listed; anything not
 * here is already correct as written (`AR15`, `AKM`, `M40A5`, `XM5`, ...).
 */
export const WEAPON_FAMILY_LABELS: Record<string, string> = {
    AKalpha: 'AK Alpha',
    Bx4: 'BX4',
    Evo3: 'EVO 3',
    Flame12: 'Flame 12',
    Mp5: 'MP5',
    ScarLH: 'SCAR-LH',
    SR3M_VSS_ASVAL: 'SR-3M / VSS / AS VAL',
    Svt40: 'SVT-40',
    UMP45: 'UMP-45',
};

export function getWeaponFamilyLabel(family: string): string {
    return WEAPON_FAMILY_LABELS[family] ?? family;
}

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
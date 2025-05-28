/**
 * Body Zones Configuration for Combat Simulator
 * Defines body parts (with HP) and armor zones (protection areas)
 */

export interface BodyPart {
    id: string;
    name: string;
    hp: number;
    isVital: boolean;
    armorZones: string[]; // References to armor zones that protect this part
}

export interface ArmorZone {
    id: string;
    name: string;
    bodyPart: string; // Which body part this zone belongs to
    defaultProtection: 'armor' | 'helmet' | 'none';
    displayPosition: {
        x: number; // Percentage from left
        y: number; // Percentage from top
        width: number; // Percentage width
        height: number; // Percentage height
    };
}

/**
 * Body parts with their HP values
 * These are the actual damage zones that take damage
 */
export const BODY_PARTS: Record<string, BodyPart> = {
    head: {
        id: 'head',
        name: 'Head',
        hp: 35,
        isVital: true,
        armorZones: ['head_top', 'head_eyes', 'head_chin']
    },
    chest: {
        id: 'chest',
        name: 'Chest',
        hp: 85,
        isVital: true,
        armorZones: ['chest']
    },
    stomach: {
        id: 'stomach',
        name: 'Stomach',
        hp: 70,
        isVital: false,
        armorZones: ['stomach']
    },
    left_arm: {
        id: 'left_arm',
        name: 'Left Arm',
        hp: 60,
        isVital: false,
        armorZones: ['arm_upper_l', 'arm_lower_l']
    },
    right_arm: {
        id: 'right_arm',
        name: 'Right Arm',
        hp: 60,
        isVital: false,
        armorZones: ['arm_upper_r', 'arm_lower_r']
    },
    left_leg: {
        id: 'left_leg',
        name: 'Left Leg',
        hp: 65,
        isVital: false,
        armorZones: ['leg_thigh_l', 'leg_lower_l']
    },
    right_leg: {
        id: 'right_leg',
        name: 'Right Leg',
        hp: 65,
        isVital: false,
        armorZones: ['leg_thigh_r', 'leg_lower_r']
    }
};

/**
 * Armor zones that can be protected by equipment
 * These map to visual areas on the body model
 */
export const ARMOR_ZONES: Record<string, ArmorZone> = {
    // Head zones (protected by helmet)
    head_top: {
        id: 'head_top',
        name: 'Head (Top)',
        bodyPart: 'head',
        defaultProtection: 'helmet',
        displayPosition: { x: 42, y: 5, width: 16, height: 8 }
    },
    head_eyes: {
        id: 'head_eyes',
        name: 'Head (Eyes)',
        bodyPart: 'head',
        defaultProtection: 'helmet', // face shield
        displayPosition: { x: 42, y: 10, width: 16, height: 4 }
    },
    head_chin: {
        id: 'head_chin',
        name: 'Head (Chin)',
        bodyPart: 'head',
        defaultProtection: 'helmet', // face armor
        displayPosition: { x: 42, y: 14, width: 16, height: 4 }
    },

    // Torso zones (protected by body armor)
    chest: {
        id: 'chest',
        name: 'Chest',
        bodyPart: 'chest',
        defaultProtection: 'armor',
        displayPosition: { x: 35, y: 25, width: 30, height: 20 }
    },
    stomach: {
        id: 'stomach',
        name: 'Stomach',
        bodyPart: 'stomach',
        defaultProtection: 'armor',
        displayPosition: { x: 35, y: 45, width: 30, height: 15 }
    },

    // Arm zones
    arm_upper_l: {
        id: 'arm_upper_l',
        name: 'Left Upper Arm',
        bodyPart: 'left_arm',
        defaultProtection: 'armor', // some armors protect upper arms
        displayPosition: { x: 20, y: 25, width: 12, height: 15 }
    },
    arm_upper_r: {
        id: 'arm_upper_r',
        name: 'Right Upper Arm',
        bodyPart: 'right_arm',
        defaultProtection: 'armor', // some armors protect upper arms
        displayPosition: { x: 68, y: 25, width: 12, height: 15 }
    },
    arm_lower_l: {
        id: 'arm_lower_l',
        name: 'Left Lower Arm',
        bodyPart: 'left_arm',
        defaultProtection: 'none',
        displayPosition: { x: 15, y: 40, width: 10, height: 20 }
    },
    arm_lower_r: {
        id: 'arm_lower_r',
        name: 'Right Lower Arm',
        bodyPart: 'right_arm',
        defaultProtection: 'none',
        displayPosition: { x: 75, y: 40, width: 10, height: 20 }
    },

    // Leg zones
    leg_thigh_l: {
        id: 'leg_thigh_l',
        name: 'Left Thigh',
        bodyPart: 'left_leg',
        defaultProtection: 'armor', // some armors protect thighs
        displayPosition: { x: 35, y: 60, width: 12, height: 15 }
    },
    leg_thigh_r: {
        id: 'leg_thigh_r',
        name: 'Right Thigh',
        bodyPart: 'right_leg',
        defaultProtection: 'armor', // some armors protect thighs
        displayPosition: { x: 53, y: 60, width: 12, height: 15 }
    },
    leg_lower_l: {
        id: 'leg_lower_l',
        name: 'Left Lower Leg',
        bodyPart: 'left_leg',
        defaultProtection: 'none',
        displayPosition: { x: 35, y: 75, width: 10, height: 20 }
    },
    leg_lower_r: {
        id: 'leg_lower_r',
        name: 'Right Lower Leg',
        bodyPart: 'right_leg',
        defaultProtection: 'none',
        displayPosition: { x: 55, y: 75, width: 10, height: 20 }
    }
};

/**
 * Get all armor zones for a specific body part
 */
export function getArmorZonesForBodyPart(bodyPartId: string): ArmorZone[] {
    return Object.values(ARMOR_ZONES).filter(zone => zone.bodyPart === bodyPartId);
}

/**
 * Get the body part that an armor zone belongs to
 */
export function getBodyPartForArmorZone(armorZoneId: string): BodyPart | null {
    const zone = ARMOR_ZONES[armorZoneId];
    if (!zone) return null;
    return BODY_PARTS[zone.bodyPart] || null;
}

/**
 * Check if an armor zone is protected by a specific equipment type
 */
export function isZoneProtectedBy(armorZoneId: string, protectionType: 'armor' | 'helmet'): boolean {
    const zone = ARMOR_ZONES[armorZoneId];
    if (!zone) return false;
    return zone.defaultProtection === protectionType;
}

/**
 * Calculate total body HP (sum of all parts)
 */
export function getTotalBodyHP(): number {
    return Object.values(BODY_PARTS).reduce((total, part) => total + part.hp, 0);
}

/**
 * Get vital body parts (death on 0 HP)
 */
export function getVitalBodyParts(): BodyPart[] {
    return Object.values(BODY_PARTS).filter(part => part.isVital);
}

/**
 * Colors for armor classes (following rarity scheme)
 */
export const ARMOR_CLASS_COLORS = {
    0: { // Unarmored
        bg: 'bg-tan-200',
        border: 'border-tan-400',
        text: 'text-tan-600',
        hex: '#E7D1A9'
    },
    2: { // Common
        bg: 'bg-gray-700',
        border: 'border-gray-600',
        text: 'text-gray-400',
        hex: '#374151'
    },
    3: { // Uncommon
        bg: 'bg-olive-800',
        border: 'border-olive-600',
        text: 'text-olive-400',
        hex: '#2E331B'
    },
    4: { // Rare
        bg: 'bg-blue-900',
        border: 'border-blue-600',
        text: 'text-blue-400',
        hex: '#1E3A8A'
    },
    5: { // Epic
        bg: 'bg-purple-900',
        border: 'border-purple-600',
        text: 'text-purple-400',
        hex: '#581C87'
    },
    6: { // Legendary
        bg: 'bg-yellow-900',
        border: 'border-yellow-600',
        text: 'text-yellow-400',
        hex: '#92400E'
    }
};

/**
 * Get color classes for a specific armor class
 */
export function getArmorClassColor(armorClass: number) {
    return ARMOR_CLASS_COLORS[armorClass as keyof typeof ARMOR_CLASS_COLORS] || ARMOR_CLASS_COLORS[0];
}
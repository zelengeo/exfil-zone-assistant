/**
 * Body Zones Configuration for Combat Simulator
 * Defines body parts (with HP) and armor zones (protection areas)
 */
import {DefenderSetup} from "@/app/combat-sim/utils/types";

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
    damageModifier: number;
    destroyedDamageModifier: number,
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
        armorZones: ['stomach', 'pelvis']
    },
    left_arm: {
        id: 'left_arm',
        name: 'Left Arm',
        hp: 60,
        isVital: false,
        armorZones: ['arm_upper_l', 'arm_lower_l', 'hand_l']
    },
    right_arm: {
        id: 'right_arm',
        name: 'Right Arm',
        hp: 60,
        isVital: false,
        armorZones: ['arm_upper_r', 'arm_lower_r', 'hand_r']
    },
    left_leg: {
        id: 'left_leg',
        name: 'Left Leg',
        hp: 65,
        isVital: false,
        armorZones: ['leg_thigh_l', 'leg_lower_l', 'foot_l']
    },
    right_leg: {
        id: 'right_leg',
        name: 'Right Leg',
        hp: 65,
        isVital: false,
        armorZones: ['leg_thigh_r', 'leg_lower_r', 'foot_r']
    }
} as const;

export const BODY_HP: number = Object.values(BODY_PARTS).reduce((total, part) => total + part.hp, 0);

/**
 * Armor zones that can be protected by equipment
 * These map to visual areas on the body model and match armor protectiveData
 */
export const ARMOR_ZONES: Record<string, ArmorZone> = {
    // Head zones (protected by helmet)
    head_top: {
        id: 'head_top',
        name: 'Head (Top)',
        bodyPart: 'head',
        damageModifier: 1,
        destroyedDamageModifier: 1,
        defaultProtection: 'helmet',
        displayPosition: { x: 40, y: 0, width: 20, height: 5 }
    },
    head_eyes: {
        id: 'head_eyes',
        name: 'Head (Eyes)',
        bodyPart: 'head',
        damageModifier: 1,
        destroyedDamageModifier: 1,
        defaultProtection: 'helmet', // face shield
        displayPosition: { x: 40, y: 5, width: 20, height: 2 }
    },
    head_chin: {
        id: 'head_chin',
        name: 'Head (Chin)',
        bodyPart: 'head',
        damageModifier: 1,
        destroyedDamageModifier: 1,
        defaultProtection: 'helmet', // face shield, OP helmet
        displayPosition: { x: 40, y: 7, width: 20, height: 6 }
    },

    // Chest zones (spine_01, spine_02 protect chest)
    spine_01: {
        id: 'spine_01',
        name: 'Upper Chest',
        bodyPart: 'chest',
        damageModifier: 1,
        destroyedDamageModifier: 1,
        defaultProtection: 'armor',
        displayPosition: { x: 33, y: 14, width: 34, height: 9 }
    },
    spine_02: {
        id: 'spine_02',
        name: 'Lower Chest',
        bodyPart: 'chest',
        damageModifier: 1,
        destroyedDamageModifier: 1,
        defaultProtection: 'armor',
        displayPosition: { x: 33, y: 23, width: 34, height: 9 }
    },

    // Stomach zones (spine_03, pelvis protect stomach)
    spine_03: {
        id: 'spine_03',
        name: 'Upper Stomach',
        bodyPart: 'stomach',
        damageModifier: 1,
        destroyedDamageModifier: 1,
        defaultProtection: 'armor',
        displayPosition: { x: 33, y: 32, width: 34, height: 11 }
    },
    pelvis: {
        id: 'pelvis',
        name: 'Pelvis',
        bodyPart: 'stomach',
        damageModifier: 1,
        destroyedDamageModifier: 1,
        defaultProtection: 'armor',
        displayPosition: { x: 33, y: 43, width: 34, height: 8 }
    },

    // Arm zones
    UpperArm_L: {
        id: 'UpperArm_L',
        name: 'Left Upper Arm',
        bodyPart: 'left_arm',
        damageModifier: 1,
        destroyedDamageModifier: 0.5,
        defaultProtection: 'armor', // some armors protect upper arms
        displayPosition: { x: 18, y: 15, width: 14, height: 13 }
    },
    UpperArm_R: {
        id: 'UpperArm_R',
        name: 'Right Upper Arm',
        bodyPart: 'right_arm',
        damageModifier: 1,
        destroyedDamageModifier: 0.5,
        defaultProtection: 'armor', // some armors protect upper arms
        displayPosition: { x: 68, y: 15, width: 14, height: 13 }
    },
    arm_lower_l: {
        id: 'arm_lower_l',
        name: 'Left Lower Arm',
        bodyPart: 'left_arm',
        damageModifier: 0.5,
        destroyedDamageModifier: 0.25,
        defaultProtection: 'none',
        displayPosition: { x: 18, y: 28, width: 10, height: 21 }
    },
    arm_lower_r: {
        id: 'arm_lower_r',
        name: 'Right Lower Arm',
        bodyPart: 'right_arm',
        damageModifier: 0.5,
        destroyedDamageModifier: 0.25,
        defaultProtection: 'none',
        displayPosition: { x: 72, y: 28, width: 10, height: 21 }
    },
    hand_l: {
        id: 'hand_l',
        name: 'Left Hand',
        bodyPart: 'left_arm',
        damageModifier: 1,
        destroyedDamageModifier: 1,
        defaultProtection: 'none',
        displayPosition: { x: 19, y: 49, width: 11, height: 7 }
    },
    hand_r: {
        id: 'hand_r',
        name: 'Right Hand',
        bodyPart: 'right_arm',
        damageModifier: 1,
        destroyedDamageModifier: 1,
        defaultProtection: 'none',
        displayPosition: { x: 71, y: 49, width: 11, height: 7 }
    },

    // Leg zones
    Thigh_L: {
        id: 'Thigh_L',
        name: 'Left Thigh',
        bodyPart: 'left_leg',
        damageModifier: 1,
        destroyedDamageModifier: 0.7,
        defaultProtection: 'armor', // some armors protect thighs
        displayPosition: { x: 33, y: 51, width: 15, height: 14 }
    },
    Thigh_R: {
        id: 'Thigh_R',
        name: 'Right Thigh',
        bodyPart: 'right_leg',
        damageModifier: 1,
        destroyedDamageModifier: 0.7,
        defaultProtection: 'armor', // some armors protect thighs
        displayPosition: { x: 52, y: 51, width: 15, height: 14 }
    },
    leg_lower_l: {
        id: 'leg_lower_l',
        name: 'Left Lower Leg',
        bodyPart: 'left_leg',
        damageModifier: 1,
        destroyedDamageModifier: 0.7,
        defaultProtection: 'none',
        displayPosition: { x: 34, y: 65, width: 13, height: 21 }
    },
    leg_lower_r: {
        id: 'leg_lower_r',
        name: 'Right Lower Leg',
        bodyPart: 'right_leg',
        damageModifier: 1,
        destroyedDamageModifier: 0.7,
        defaultProtection: 'none',
        displayPosition: { x: 53, y: 65, width: 13, height: 21 }
    },
    foot_l: {
        id: 'foot_l',
        name: 'Left Foot',
        bodyPart: 'left_leg',
        damageModifier: 0.5,
        destroyedDamageModifier: 0.7,
        defaultProtection: 'none',
        displayPosition: { x: 34, y: 86, width: 13, height: 6 }
    },
    foot_r: {
        id: 'foot_r',
        name: 'Right Foot',
        bodyPart: 'right_leg',
        damageModifier: 0.5,
        destroyedDamageModifier: 0.7,
        defaultProtection: 'none',
        displayPosition: { x: 53, y: 86, width: 13, height: 6 }
    },
} as const;
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

export function getZoneArmorClass (zoneId: string, defender: DefenderSetup): number {
    const zone = ARMOR_ZONES[zoneId];
    if (!zone) return 0;

    //TODO probably rework head display - or it might be useful when they rework mask logic
    if (zone.defaultProtection === 'helmet' && defender.helmet) {
        const protectiveZone = defender.helmet.stats.protectiveData?.find(
            pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
        );

        if (!protectiveZone && defender.faceShield) {
            //Currently, it seems, FaceShield acts as extension to the helmet so, else we would'we get faceShield class
            return defender.helmet.stats.armorClass
        }

        return protectiveZone?.armorClass || 0
    }

    if (zone.defaultProtection === 'armor' && defender.bodyArmor) {
        const protectiveZone = defender.bodyArmor.stats.protectiveData?.find(
            pz => pz.bodyPart === zone.bodyPart || pz.bodyPart === zone.id
        );
        return protectiveZone?.armorClass || 0;
    }

    return 0;
}


/**
 * Get color classes for a specific armor class
 */
export function getArmorClassColor(armorClass: number) {
    return ARMOR_CLASS_COLORS[armorClass as keyof typeof ARMOR_CLASS_COLORS] || ARMOR_CLASS_COLORS[0];
}
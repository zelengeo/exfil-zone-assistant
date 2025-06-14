/**
 * Test Types for Combat Simulator Debug/Testing
 */
import {Ammunition, Armor, Weapon} from "@/types/items";

export interface SingleShotTestCase {
    id: string;
    description?: string;
    weapon: string; // weapon ID
    ammo: string; // ammo ID
    armor?: {
        id: string;
        currentDurability?: number; // percentage 0-100
    };
    range: number; // distance in meters
    isPenetration: boolean;
    gameResults: {
        armorDamage?: number;
        bodyDamage: number;
    };
    simulatedResults?: {
        armorDamage: number;
        bodyDamage: number;
    };
    deviation?: {
        armorDamage: {
            absolute: number;
            percentage: number;
        };
        bodyDamage: {
            absolute: number;
            percentage: number;
        };
    };
}

export interface TestDataFile {
    singleShotTestCases: SingleShotTestCase[];
    metadata: {
        lastUpdated: string;
        gameVersion: string;
        notes?: string;
    };
}

export interface TestRunResult {
    testCase: SingleShotTestCase;
    ammo?: Ammunition;
    armor?: Armor;
    weapon?: Weapon
    passed: boolean;
    simulatedResults: {
        armorDamage: number;
        bodyDamage: number;
    };
    deviation: {
        armorDamage: {
            absolute: number;
            percentage: number;
        };
        bodyDamage: {
            absolute: number;
            percentage: number;
        };
    };
    accuracy: number; // Overall accuracy percentage
}

export interface DeviationValue {
    averageArmorDamageDeviation: number;
    averageBodyDamageDeviation: number;
    testCount: number;
}

export interface TestSummary {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageAccuracy: number;
    deviationByArmor: Record<string, DeviationValue>;
    deviationByAmmo: Record<string, DeviationValue>;
}
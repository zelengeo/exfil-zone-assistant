/**
 * Combat Statistics Calculator
 * Calculates probability distributions for shots to kill
 */

import { AmmoProperties, ArmorProperties, ShotResult } from './types';
import { calculateShotDamage } from './damage-calculations';

export interface ShotDistribution {
    shots: number;
    probability: number;
}

export interface CombatStatistics {
    expectedSTK: number;
    minSTK: number;
    maxSTK: number;
    distribution: ShotDistribution[];
    averagePenetrationChance: number;
}

/**
 * Calculate probability distribution for shots to kill
 * This provides a more accurate representation of combat outcomes
 */
export function calculateShotDistribution(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    targetHP: number,
    range: number,
    maxShots: number = 30
): CombatStatistics {
    // First, get a sample shot to determine damage values
    const sampleShot = calculateShotDamage(ammo, armor, armor?.currentDurability || 0, range);

    if (!armor || sampleShot.penetrationChance >= 0.99) {
        // No armor or guaranteed penetration - deterministic outcome
        const shotsNeeded = Math.ceil(targetHP / sampleShot.damageToBodyPart);
        return {
            expectedSTK: shotsNeeded,
            minSTK: shotsNeeded,
            maxSTK: shotsNeeded,
            distribution: [{ shots: shotsNeeded, probability: 1.0 }],
            averagePenetrationChance: sampleShot.penetrationChance
        };
    }

    // Calculate damage possibilities
    const penetratingDamage = sampleShot.damageToBodyPart /
        (sampleShot.penetrationChance > 0 ? sampleShot.penetrationChance : 1);
    const nonPenetratingDamage = sampleShot.damageToBodyPart /
        (sampleShot.penetrationChance < 1 ? (1 - sampleShot.penetrationChance) : 1);

    // Dynamic programming approach to calculate probability distribution
    // dp[shot][damage] = probability of dealing exactly 'damage' HP in 'shot' shots
    const dp: number[][] = Array(maxShots + 1).fill(null).map(() =>
        Array(Math.ceil(targetHP) + 1).fill(0)
    );

    // Base case: 0 shots = 0 damage with probability 1
    dp[0][0] = 1;

    // Track armor degradation probabilities
    let currentArmorDurability = armor?.currentDurability || 0;
    let avgPenChance = 0;
    let shotCount = 0;

    // Fill the DP table
    for (let shot = 1; shot <= maxShots; shot++) {
        // Recalculate shot with degraded armor
        const shotResult = calculateShotDamage(ammo, armor, currentArmorDurability, range);
        avgPenChance += shotResult.penetrationChance;
        shotCount++;

        // Update armor durability for next shot
        if (armor && currentArmorDurability > 0) {
            currentArmorDurability = Math.max(0, currentArmorDurability - shotResult.damageToArmor);
        }

        const penDmg = Math.round(penetratingDamage);
        const nonPenDmg = Math.round(nonPenetratingDamage);
        const penChance = shotResult.penetrationChance;

        for (let damage = 0; damage <= targetHP; damage++) {
            if (dp[shot - 1][damage] > 0) {
                // Non-penetrating shot
                const newDamageNonPen = Math.min(damage + nonPenDmg, targetHP);
                dp[shot][newDamageNonPen] += dp[shot - 1][damage] * (1 - penChance);

                // Penetrating shot
                const newDamagePen = Math.min(damage + penDmg, targetHP);
                dp[shot][newDamagePen] += dp[shot - 1][damage] * penChance;
            }
        }
    }

    // Extract probability distribution
    const distribution: ShotDistribution[] = [];
    let expectedSTK = 0;
    let minSTK = maxShots;
    let maxSTK = 1;

    for (let shot = 1; shot <= maxShots; shot++) {
        const killProbability = dp[shot][targetHP];
        if (killProbability > 0.001) { // Threshold for significance
            distribution.push({ shots: shot, probability: killProbability });
            expectedSTK += shot * killProbability;
            minSTK = Math.min(minSTK, shot);
            maxSTK = Math.max(maxSTK, shot);
        }
    }

    // Normalize probabilities
    const totalProb = distribution.reduce((sum, d) => sum + d.probability, 0);
    distribution.forEach(d => d.probability /= totalProb);

    return {
        expectedSTK: Math.round(expectedSTK / totalProb),
        minSTK,
        maxSTK,
        distribution,
        averagePenetrationChance: avgPenChance / shotCount
    };
}

/**
 * Format probability for display
 */
export function formatProbability(probability: number): string {
    return `${(probability * 100).toFixed(1)}%`;
}

/**
 * Get confidence interval for STK
 */
export function getConfidenceInterval(
    distribution: ShotDistribution[],
    confidence: number = 0.9
): { lower: number; upper: number } {
    const sorted = [...distribution].sort((a, b) => a.shots - b.shots);
    let cumulative = 0;
    let lower = sorted[0].shots;
    let upper = sorted[sorted.length - 1].shots;

    const lowerBound = (1 - confidence) / 2;
    const upperBound = 1 - lowerBound;

    for (const item of sorted) {
        cumulative += item.probability;
        if (cumulative >= lowerBound && lower === sorted[0].shots) {
            lower = item.shots;
        }
        if (cumulative >= upperBound) {
            upper = item.shots;
            break;
        }
    }

    return { lower, upper };
}
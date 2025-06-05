/**
 * Combat Test Helper for Console Testing
 * Add this to your combat-sim utils folder
 */

import { fetchItemsData } from '@/services/ItemService';
import { calculateShotDamage } from './damage-calculations';
import { isArmor, isAmmunition } from './types';



/**
 * Test single shot damage calculation
 * Usage from console: testShotDamage('armor-6b17', 'spine_01', 'ammo-556x45-m995')
 */
export async function testShotDamage(
    armorId: string,
    armorZoneId: string,
    ammoId: string,
    armorDurability: number,
    range: number = 0,
    overridePenentrationChance: boolean | null,
) {
    console.log('=== SHOT DAMAGE TEST ===');
    console.log(`Armor: ${armorId} (${armorDurability??"full"})`);
    console.log(`Zone: ${armorZoneId}`);
    console.log(`Ammo: ${ammoId}`);
    console.log('Range: 0m (CQB)');
    console.log('========================\n');

    try {
        // Load items data
        const items = await fetchItemsData();

        // Find armor
        const armor = items.find(item => item.id === armorId && isArmor(item));
        if (!armor) {
            console.error(`Armor not found: ${armorId}`);
            return;
        }

        // Find ammo
        const ammo = items.find(item => item.id === ammoId && isAmmunition(item));
        if (!ammo) {
            console.error(`Ammo not found: ${ammoId}`);
            return;
        }

        console.log(`Armor: ${armor.name} (Class ${armor.stats.armorClass})`);
        console.log(`Ammo: ${ammo.name} (Damage: ${ammo.stats.damage}, Pen: ${ammo.stats.penetration})`);

        // Get zone-specific armor data
        const zoneProtection = armor.stats.protectiveData?.find(pd => pd.bodyPart === armorZoneId);
        const zoneArmorClass = zoneProtection?.armorClass || armor.stats.armorClass;
        const zoneBluntScalar = zoneProtection?.bluntDamageScalar || armor.stats.bluntDamageScalar;

        console.log(`\nZone Protection:`);
        console.log(`- Armor Class: ${zoneArmorClass}`);
        console.log(`- Blunt Scalar: ${zoneBluntScalar}`);

        // Convert to required formats
        const ammoProps: AmmoProperties = {
            damage: ammo.stats.damage,
            penetration: ammo.stats.penetration,
            caliber: ammo.stats.caliber,
            bleedingChance: ammo.stats.bleedingChance || 0,
            bluntDamageScale: ammo.stats.bluntDamageScale || 0.1,
            protectionGearPenetratedDamageScale: ammo.stats.protectionGearPenetratedDamageScale || 0.5,
            protectionGearBluntDamageScale: ammo.stats.protectionGearBluntDamageScale || 0.9,
            damageAtRange: ammo.stats.damageAtRange,
            penetrationAtRange: ammo.stats.penetrationAtRange,
            ballisticCurves: ammo.stats.ballisticCurves,
        };

        const armorProps: ArmorProperties = {
            armorClass: zoneArmorClass,
            maxDurability: armor.stats.maxDurability,
            currentDurability: armorDurability ?? armor.stats.maxDurability, // Full durability for first shot
            durabilityDamageScalar: armor.stats.durabilityDamageScalar,
            bluntDamageScalar: zoneBluntScalar,
            protectiveData: armor.stats.protectiveData || [],
            penetrationChanceCurve: armor.stats.penetrationChanceCurve,
            penetrationDamageScalarCurve: armor.stats.penetrationDamageScalarCurve,
            antiPenetrationDurabilityScalarCurve: armor.stats.antiPenetrationDurabilityScalarCurve
        };

        console.log('\nAmmo Properties:');
        console.log(`- bluntDamageScale: ${ammoProps.bluntDamageScale}`);
        console.log(`- protectionGearPenetratedDamageScale: ${ammoProps.protectionGearPenetratedDamageScale}`);
        console.log(`- protectionGearBluntDamageScale: ${ammoProps.protectionGearBluntDamageScale}`);

        console.log('\nArmor Properties:');
        console.log(`- durabilityDamageScalar: ${armorProps.durabilityDamageScalar}`);
        console.log(`- Has penetrationChanceCurve: ${!!armor.stats.penetrationChanceCurve}`);
        console.log(`- Has penetrationDamageScalarCurve: ${!!armor.stats.penetrationDamageScalarCurve}`);

        // Run multiple shots to get average
        const numTests = 1;
        let penetratingCount = 0;
        let totalPenDamage = 0;
        let totalNonPenDamage = 0;
        let totalPenArmorDamage = 0;
        let totalNonPenArmorDamage = 0;

        console.log(`\nRunning ${numTests} shots...`);

        for (let i = 0; i < numTests; i++) {
            const result = calculateShotDamage(
                ammoProps,
                armorProps,
                armorDurability ?? armor.stats.maxDurability, // Full durability
                range,
                overridePenentrationChance,
            );

            if (result.isPenetrating) {
                penetratingCount++;
                totalPenDamage += result.damageToBodyPart;
                totalPenArmorDamage += result.damageToArmor;
            } else {
                totalNonPenDamage += result.damageToBodyPart;
                totalNonPenArmorDamage += result.damageToArmor;
            }
        }

        const nonPenCount = numTests - penetratingCount;

        console.log('\n=== RESULTS ===');
        console.log(`Penetration Rate: ${penetratingCount}/${numTests} (${(penetratingCount/numTests*100).toFixed(1)}%)`);

        if (penetratingCount > 0) {
            console.log('\nPenetrating Shots:');
            console.log(`- Avg Damage to Body: ${(totalPenDamage / penetratingCount).toFixed(1)}`);
            console.log(`- Avg Damage to Armor: ${(totalPenArmorDamage / penetratingCount).toFixed(1)}`);
        }

        if (nonPenCount > 0) {
            console.log('\nNon-Penetrating Shots:');
            console.log(`- Avg Damage to Body: ${(totalNonPenDamage / nonPenCount).toFixed(1)}`);
            console.log(`- Avg Damage to Armor: ${(totalNonPenArmorDamage / nonPenCount).toFixed(1)}`);
        }

        // Debug curve values
        if (armor.stats.penetrationChanceCurve) {
            console.log('\n=== DEBUG: Penetration Chance Curve ===');
            const ratio = ammoProps.penetration / zoneArmorClass;
            console.log(`Pen/Armor Ratio: ${ratio.toFixed(2)}`);
            console.log('Curve points:');
            armor.stats.penetrationChanceCurve.forEach(point => {
                console.log(`  time: ${point.time}, value: ${point.value}`);
            });
        }

        if (armor.stats.penetrationDamageScalarCurve) {
            console.log('\n=== DEBUG: Penetration Damage Scalar Curve ===');
            console.log('Curve points:');
            armor.stats.penetrationDamageScalarCurve.forEach(point => {
                console.log(`  time: ${point.time}, value: ${point.value}`);
            });
        }

        return {
            bodyPenDamage: penetratingCount > 0 ? totalPenDamage / penetratingCount : 0,
            armorPenDamage: penetratingCount > 0 ? totalPenArmorDamage / penetratingCount : 0,
            bodyNopenDamage: nonPenCount > 0 ? totalNonPenDamage / penetratingCount : 0,
            armorNopenDamage: nonPenCount > 0 ? totalNonPenArmorDamage / penetratingCount : 0,
            armor: armorProps,
            ammo: ammoProps,
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
    (window as any).testShotDamage = testShotDamage;
}
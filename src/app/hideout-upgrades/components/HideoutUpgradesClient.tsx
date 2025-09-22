'use client';

import React, {useState, useMemo, useEffect} from 'react';
import {hideoutUpgrades} from '@/data/hideout-upgrades';
import TotalCostsDisplay from "@/app/hideout-upgrades/components/TotalCostsDisplay";
import Layout from "@/components/layout/Layout";
import {useFetchItems} from "@/hooks/useFetchItems";
import HideoutOverview from "@/app/hideout-upgrades/components/HideoutOverview";
import {StorageService} from "@/services/StorageService";

type HideoutUpgradeKey = keyof typeof hideoutUpgrades;
const isValidHideoutUpgradeKey = (key: string): key is HideoutUpgradeKey => {
    return key in hideoutUpgrades;
};


const categories = Array.from(Object.values(hideoutUpgrades).reduce((acc, upgrade) => {
    acc.add(upgrade.categoryId);
    return acc;
}, new Set<string>()))

// Save upgrades
const saveUpgrades = (upgradedAreas: Set<string>) => {
    StorageService.setHideout([...upgradedAreas]);
};

// Load upgrades
const loadUpgrades = (): Set<HideoutUpgradeKey> => {
    if (typeof window === 'undefined') return new Set<HideoutUpgradeKey>(); // Server-side safety


    const saved = StorageService.getHideout();
    if (!saved || !saved.length) return new Set<HideoutUpgradeKey>();

    try {
        // Filter out any invalid keys to ensure type safety
        const validKeys = saved.filter(isValidHideoutUpgradeKey);
        return new Set<HideoutUpgradeKey>(validKeys);
    } catch (error) {
        console.error('Failed to parse saved hideout upgrades:', error);
        return new Set<HideoutUpgradeKey>();
    }
};


export default function HideoutUpgradesClient() {
    const {getItemById} = useFetchItems();
    const [upgradedAreas, setUpgradedAreas] = useState<Set<HideoutUpgradeKey>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setUpgradedAreas(loadUpgrades());
        setIsLoaded(true);
    }, []);

    const onAreaUpgrade = (upgradeKey: HideoutUpgradeKey, isLevelUp: boolean = true ) => {
        setUpgradedAreas(prev => {
            let newState;
            if (isLevelUp) {
                newState = new Set([...prev, upgradeKey]);
            } else {
                newState = new Set([...prev]);
                newState.delete(upgradeKey);
            }
            saveUpgrades(newState);
            return newState;
        })
    }

    const resetUpgrades = () => {
        const newState = new Set<HideoutUpgradeKey>();
        saveUpgrades(newState)
        setUpgradedAreas(newState)
    }

    // Track current level for each area
    const areaLevels = useMemo(() => {
        const levels: Record<string, number> = {
            Player: 10
        };
        categories.forEach(categoryId => {
            levels[categoryId] = 1;
        })
        levels['KitchenArea'] = 0;
        levels['MedicalArea'] = 0;

        // Initialize all areas at level 0
        Object.values(hideoutUpgrades).forEach(upgrade => {
            if (!levels[upgrade.areaId]) {
                levels[upgrade.areaId] = 0;
            }
        });

        // Update levels based on upgrades
        upgradedAreas.forEach(upgradeKey => {
            const upgrade = hideoutUpgrades[upgradeKey as HideoutUpgradeKey];
            if (upgrade) {
                levels[upgrade.areaId] = Math.max(levels[upgrade.areaId] || 0, upgrade.level);
            }
        });

        return levels;
    }, [upgradedAreas]);

    return <Layout>
        <div className="container mx-auto px-4 py-8">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2 military-stencil">
                    HIDEOUT UPGRADES
                </h1>
                <p className="text-tan-300 max-w-3xl">
                    Manage and track your hideout improvements
                </p>
            </div>


            {/* Hideout Overview Section */}
            <section className="mb-12">
                <HideoutOverview upgradedAreas={upgradedAreas}
                                 areaLevels={areaLevels}
                                 onAreaUpgrade={onAreaUpgrade}
                                 resetUpgrades={resetUpgrades}
                                 getItemById={getItemById}
                                 isLoaded={isLoaded}/>
            </section>

            {/* Divider */}
            <div className="border-t border-military-600 my-8"></div>

            {/* Exchange Cost Summary Section */}
            <section>
                {isLoaded && <TotalCostsDisplay upgradedAreas={upgradedAreas} getItemById={getItemById}/>}
            </section>
        </div>
    </Layout>
}
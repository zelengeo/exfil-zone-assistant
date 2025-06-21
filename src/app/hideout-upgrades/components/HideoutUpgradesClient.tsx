'use client';

import React, {useState, useMemo} from 'react';
import {hideoutUpgrades} from '@/data/hideout-upgrades';
import TotalCostsDisplay from "@/app/hideout-upgrades/components/TotalCostsDisplay";
import Layout from "@/components/layout/Layout";
import {useFetchItems} from "@/hooks/useFetchItems";
import HideoutOverview from "@/app/hideout-upgrades/components/HideoutOverview";

const categories = Array.from(Object.values(hideoutUpgrades).reduce((acc, upgrade) => {
    acc.add(upgrade.categoryId);
    return acc;
}, new Set<string>()))


export default function HideoutUpgradesClient() {
    const {getItemById} = useFetchItems();
    const [upgradedAreas, setUpgradedAreas] = useState<Set<string>>(new Set());

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
            const upgrade = hideoutUpgrades[upgradeKey as keyof typeof hideoutUpgrades];
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
                <HideoutOverview areaLevels={areaLevels}
                                 onAreaUpgrade={(areaKey) => setUpgradedAreas(prev => new Set([...prev, areaKey]))}
                                 getItemById={getItemById}/>
            </section>

            {/* Divider */}
            <div className="border-t border-military-600 my-8"></div>

            {/* Exchange Cost Summary Section */}
            <section>
                <TotalCostsDisplay upgradedAreas={upgradedAreas} getItemById={getItemById}/>
            </section>
        </div>
    </Layout>
}
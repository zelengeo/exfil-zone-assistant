'use client';

import React, { useState, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import {
    CombatSimulation,
    AttackerSetup as AttackerSetupType,
    DefenderSetup as DefenderSetupType,
    DisplayMode,
    SortBy,
    ATTACKER_COLORS,
    DISPLAY_MODE_LABELS,
    SORT_BY_LABELS,
    RANGE_PRESETS,
    areWeaponAmmoCompatible
} from './utils/types';
import { Plus, Calculator, Target, DollarSign, Clock } from 'lucide-react';

// Component imports
import AttackerSetup from './components/AttackerSetup';
import DefenderSetup from './components/DefenderSetup';
import BodyModel from './components/BodyModel/BodyModel';

export default function CombatSimulatorPage() {
    // Initialize combat simulation state
    const [simulation, setSimulation] = useState<CombatSimulation>({
        attackers: [
            {
                id: '1',
                weapon: null,
                ammo: null,
                color: ATTACKER_COLORS[0]
            }
        ],
        defender: {
            bodyArmor: null,
            bodyArmorDurability: 100,
            helmet: null,
            helmetDurability: 100
        },
        range: 50,
        displayMode: 'ttk',
        sortBy: 'ttk'
    });

    // Add new attacker (max 4)
    const addAttacker = useCallback(() => {
        if (simulation.attackers.length >= 4) return;

        const newAttacker: AttackerSetupType = {
            id: Date.now().toString(),
            weapon: null,
            ammo: null,
            color: ATTACKER_COLORS[simulation.attackers.length]
        };

        setSimulation(prev => ({
            ...prev,
            attackers: [...prev.attackers, newAttacker]
        }));
    }, [simulation.attackers.length]);

    // Remove attacker
    const removeAttacker = useCallback((attackerId: string) => {
        setSimulation(prev => ({
            ...prev,
            attackers: prev.attackers.filter(a => a.id !== attackerId)
        }));
    }, []);

    // Update attacker setup
    const updateAttacker = useCallback((attackerId: string, updates: Partial<AttackerSetupType>) => {
        setSimulation(prev => ({
            ...prev,
            attackers: prev.attackers.map(a =>
                a.id === attackerId ? { ...a, ...updates } : a
            )
        }));
    }, []);

    // Update defender setup
    const updateDefender = useCallback((updates: Partial<DefenderSetupType>) => {
        setSimulation(prev => ({
            ...prev,
            defender: { ...prev.defender, ...updates }
        }));
    }, []);

    // Update simulation settings
    const updateSettings = useCallback((updates: Partial<CombatSimulation>) => {
        setSimulation(prev => ({ ...prev, ...updates }));
    }, []);

    // Get display mode icon
    const getDisplayModeIcon = (mode: DisplayMode) => {
        switch (mode) {
            case 'ttk': return <Clock size={16} />;
            case 'stk': return <Target size={16} />;
            case 'ctk': return <DollarSign size={16} />;
        }
    };

    // Check if we have valid setups to show results
    const hasValidSetups = simulation.attackers.some(attacker =>
        attacker.weapon && attacker.ammo && areWeaponAmmoCompatible(attacker.weapon, attacker.ammo)
    );

    return (
        <Layout title="Combat Simulator | Exfil Zone Assistant">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="inline-block px-3 py-1 border border-olive-500 bg-military-800/80 mb-3">
                        <h2 className="text-olive-400 military-stencil flex items-center gap-2">
                            <Calculator size={20} />
                            COMBAT LAB
                        </h2>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2 military-stencil">
                        COMBAT SIMULATOR
                    </h1>
                    <p className="text-tan-300 max-w-3xl">
                        Analyze weapon effectiveness against armored targets. Compare multiple loadouts and find optimal engagement strategies.
                    </p>
                </div>

                {/* Control Panel */}
                <div className="military-box p-4 rounded-sm mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Display Mode Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-tan-300 text-sm font-medium">Display:</span>
                            <div className="flex gap-1 bg-military-800 p-1 rounded-sm">
                                {(Object.keys(DISPLAY_MODE_LABELS) as DisplayMode[]).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => updateSettings({ displayMode: mode })}
                                        className={`
                      px-3 py-2 rounded-sm transition-all flex items-center gap-2
                      ${simulation.displayMode === mode
                                            ? 'bg-olive-600 text-tan-100'
                                            : 'text-tan-400 hover:text-tan-200 hover:bg-military-700'}
                    `}
                                        title={DISPLAY_MODE_LABELS[mode]}
                                    >
                                        {getDisplayModeIcon(mode)}
                                        <span className="hidden sm:inline text-sm">{DISPLAY_MODE_LABELS[mode]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Range Slider */}
                        <div className="flex items-center gap-3 flex-grow">
                            <span className="text-tan-300 text-sm font-medium">Range:</span>
                            <input
                                type="range"
                                min={0}
                                max={500}
                                step={10}
                                value={simulation.range}
                                onChange={(e) => updateSettings({ range: parseInt(e.target.value) })}
                                className="flex-grow h-2 bg-military-700 rounded-sm appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-olive-500 [&::-webkit-slider-thumb]:rounded-sm
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:bg-olive-500 [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:border-0"
                            />
                            <span className="text-tan-100 font-mono min-w-[60px]">{simulation.range}m</span>
                        </div>

                        {/* Range Presets */}
                        <div className="flex gap-1">
                            {RANGE_PRESETS.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => updateSettings({ range: preset.value })}
                                    className={`
                    px-2 py-1 text-xs rounded-sm transition-colors
                    ${simulation.range === preset.value
                                        ? 'bg-olive-600 text-tan-100'
                                        : 'bg-military-700 text-tan-400 hover:text-tan-200 hover:bg-military-600'}
                  `}
                                    title={preset.description}
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                            <span className="text-tan-300 text-sm font-medium">Sort:</span>
                            <select
                                value={simulation.sortBy}
                                onChange={(e) => updateSettings({ sortBy: e.target.value as SortBy })}
                                className="bg-military-800 text-tan-100 px-3 py-2 rounded-sm border border-military-700
                  focus:border-olive-500 focus:outline-none"
                            >
                                {(Object.keys(SORT_BY_LABELS) as SortBy[]).map(sort => (
                                    <option key={sort} value={sort}>{SORT_BY_LABELS[sort]}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Attacker Panel (Left) */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-olive-400">ATTACKERS</h3>
                            {simulation.attackers.length < 4 && (
                                <button
                                    onClick={addAttacker}
                                    className="flex items-center gap-1 px-3 py-2 bg-olive-600 hover:bg-olive-500
                    text-tan-100 rounded-sm transition-colors border border-olive-700"
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
                            )}
                        </div>

                        {/* AttackerSetup components */}
                        {simulation.attackers.map((attacker, index) => (
                            <AttackerSetup
                                key={attacker.id}
                                attacker={attacker}
                                index={index}
                                onUpdate={(updates) => updateAttacker(attacker.id, updates)}
                                onRemove={() => removeAttacker(attacker.id)}
                                canRemove={simulation.attackers.length > 1}
                            />
                        ))}
                    </div>

                    <div className="lg:col-span-6">
                        <div className="military-box p-6 rounded-sm">
                            <h3 className="text-xl font-bold text-olive-400 mb-4 text-center">TARGET ANALYSIS</h3>
                            <BodyModel
                                defender={simulation.defender}
                                displayMode={simulation.displayMode}
                                // TODO: Add zone calculations when calculation engine is implemented
                                // zoneCalculations={zoneCalculations}
                                // selectedAttackerId={selectedAttackerId}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <h3 className="text-xl font-bold text-olive-400 mb-4">DEFENDER</h3>
                        <DefenderSetup
                            defender={simulation.defender}
                            onUpdate={updateDefender}
                        />
                    </div>
                </div>

                {/* Results Section */}
                {hasValidSetups && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-olive-400 mb-4">ANALYSIS RESULTS</h3>
                        {/* Placeholder for ResultsPanel component */}
                        <div className="military-box p-6 rounded-sm">
                            <div className="text-center">
                                <p className="text-tan-400 mb-4">
                                    Combat calculations will appear here once implemented
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    {simulation.attackers.map((attacker, index) => {
                                        const isValid = attacker.weapon && attacker.ammo &&
                                            areWeaponAmmoCompatible(attacker.weapon, attacker.ammo);

                                        if (!isValid) return null;

                                        return (
                                            <div key={attacker.id} className="military-card p-4 rounded-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-3 h-3 rounded-sm ${attacker.color.class.replace('text-', 'bg-')}`} />
                                                    <span className="font-medium text-sm">Attacker {index + 1}</span>
                                                </div>
                                                <div className="text-xs text-tan-400">
                                                    <p>{attacker.weapon!.name}</p>
                                                    <p>{attacker.ammo!.name}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
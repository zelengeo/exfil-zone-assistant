'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import {
    DisplayMode,
    DISPLAY_MODE_LABELS,
    areWeaponAmmoCompatible
} from '../utils/types';
import {useCombatSimulation} from "@/app/combat-sim/hooks/useCombatSimulation";
import {Plus, Target, DollarSign, Clock, Loader2,} from 'lucide-react';

// Component imports
import AttackerSetup from './AttackerSetup';
import DefenderSetup from './DefenderSetup';
import BodyModel from './BodyModel/BodyModel';

// Import test helper for console access
import '../utils/combat-test-helper';
import AttackerSummaryCard from "@/app/combat-sim/components/AttackerSummaryCard";
import CombatSummary from "@/app/combat-sim/components/CombatSummary";
import {useCombatSimUrlParams} from "@/app/combat-sim/hooks/useCombatSimParams";
import ShareButton from "@/app/combat-sim/components/ShareButton";

export default function CombatSimulatorContent() {
    const {
        simulation,
        updateSimulation,
        addAttacker,
        updateAttacker,
        removeAttacker,
        validAttackers,
        selectAttacker,
        selectedAttackerId,
        isCalculating,
        updateDefender,
        zoneCalculations,
    } = useCombatSimulation();

    const { getShareableLink } = useCombatSimUrlParams();


    // Check if we have valid setups to show results
    const hasValidSetups = simulation.attackers.some(attacker =>
        attacker.weapon && attacker.ammo && areWeaponAmmoCompatible(attacker.weapon, attacker.ammo)
    );

    return (
        <Layout title="Combat Simulator">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-2 military-stencil">
                        COMBAT SIMULATOR
                    </h1>
                    <p className="text-tan-300 max-w-3xl">
                        Analyze weapon effectiveness against armored targets. Compare multiple loadouts and find optimal
                        engagement strategies.
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
                                        onClick={() => updateSimulation({displayMode: mode})}
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
                                max={600}
                                step={10}
                                value={simulation.range}
                                onChange={(e) => updateSimulation({range: parseInt(e.target.value)})}
                                className="flex-grow h-2 bg-military-700 rounded-sm appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-8
                  [&::-webkit-slider-thumb]:bg-olive-500 [&::-webkit-slider-thumb]:rounded-sm
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-8
                  [&::-moz-range-thumb]:bg-olive-500 [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:border-0"
                            />
                            <span className="text-tan-100 font-mono min-w-[60px]">{simulation.range}m</span>
                        </div>

                        {/* Share Button - aligned to the right */}
                        <ShareButton getShareLink={()=>getShareableLink(simulation)}/>


                        {/* Range Presets */}
                        {/*<div className="flex gap-1">
                            {RANGE_PRESETS.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => updateSimulation({range: preset.value})}
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
                        </div>*/}

                        {/* FIXME Sort Options */}
                        {/*<div className="flex items-center gap-2">
                            <span className="text-tan-300 text-sm font-medium">Sort:</span>
                            <select
                                value={simulation.sortBy}
                                onChange={(e) => updateSimulation({sortBy: e.target.value as sortBy})}
                                className="bg-military-800 text-tan-100 px-3 py-2 rounded-sm border border-military-700
                  focus:border-olive-500 focus:outline-none"
                            >
                                {(Object.keys(SORT_BY_LABELS) as SortBy[]).map(sort => (
                                    <option key={sort} value={sort}>{SORT_BY_LABELS[sort]}</option>
                                ))}
                            </select>
                        </div>*/}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Attacker Panel (Left) */}
                    <div className="lg:col-span-3 space-y-4">
                        <h3 className="text-xl font-bold text-olive-400">ATTACKERS</h3>


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

                        {/* Add attacker button */}
                        {simulation.attackers.length < 4 && (
                            <button
                                onClick={addAttacker}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3
                       bg-olive-600 hover:bg-olive-500 text-tan-100 rounded-sm
                       transition-colors border border-olive-700 font-bold "
                                title="Add a new attacker setup"
                            >
                                <Plus size={20}/>
                                <span>Add New Attacker</span>
                            </button>
                        )}

                    </div>

                    <div className="lg:col-span-6">
                        <div className="military-box p-6 rounded-sm">
                            <h3 className="text-xl font-bold text-olive-400 mb-4 text-center">TARGET ANALYSIS</h3>

                            {/* Attacker selector tabs */}
                            {hasValidSetups && (
                                <div className="flex flex-col sm:flex-row sm:justify-center gap-2 mb-4">
                                    {validAttackers.map((attacker, index) => (
                                        <AttackerSummaryCard
                                            key={attacker.id}
                                            attacker={attacker}
                                            index={index}
                                            isSelected={selectedAttackerId === attacker.id}
                                            displayMode={simulation.displayMode}
                                            zoneCalculations={zoneCalculations[attacker.id]}
                                            onSelect={() => selectAttacker(attacker.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            <BodyModel
                                simulation={simulation}
                                validAttackers={validAttackers}
                                zoneCalculations={zoneCalculations}
                                selectedAttackerId={selectedAttackerId || undefined}
                            />

                            {/* Calculation indicator */}
                            {isCalculating && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-tan-400">
                                    <Loader2 size={16} className="animate-spin"/>
                                    <span className="text-sm">Calculating...</span>
                                </div>
                            )}
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
                    <CombatSummary simulation={simulation} zoneCalculations={zoneCalculations}
                                   validAttackers={validAttackers}/>
                )}
            </div>
        </Layout>
    );
}

const getDisplayModeIcon = (mode: DisplayMode) => {
    switch (mode) {
        case 'ttk':
            return <Clock size={16}/>;
        case 'stk':
            return <Target size={16}/>;
        case 'ctk':
            return <DollarSign size={16}/>;
    }
};
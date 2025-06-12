/**
 * useCombatSimulation Hook
 * Manages combat simulation state and calculations
 */

import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {
    CombatSimulation,
    AttackerSetup,
    DefenderSetup,
    ZoneCalculation,
    AttackerSummary,
    areWeaponAmmoCompatible, ATTACKER_COLORS
} from '../utils/types';
import {
    calculateCombatResults,
    calculateAttackerSummary,
    sortZoneCalculations
} from '../utils/combat-calculations';
import {useCombatSimUrlParams} from './useCombatSimParams';

interface UseCombatSimulationReturn {
    // State
    simulation: CombatSimulation;
    zoneCalculations: Record<string, ZoneCalculation[]>;
    attackerSummaries: AttackerSummary[];
    selectedAttackerId: string | null;
    isCalculating: boolean;

    // Actions
    updateSimulation: (updates: Partial<CombatSimulation>) => void;
    addAttacker: () => void;
    removeAttacker: (attackerId: string) => void;
    updateAttacker: (attackerId: string, updates: Partial<AttackerSetup>) => void;
    updateDefender: (updates: Partial<DefenderSetup>) => void;
    selectAttacker: (attackerId: string | null) => void;

    // Computed values
    hasValidSetups: boolean;
    validAttackers: AttackerSetup[];
}

export function useCombatSimulation(): UseCombatSimulationReturn {
    // Add URL params hook
    const {parseUrlParams, updateUrlParams} = useCombatSimUrlParams();
    const isInitialMount = useRef(true);
    const isUpdatingFromUrl = useRef(false);
    // Initialize simulation state
    const [simulation, setSimulation] = useState<CombatSimulation>(() => {
        const defaultState: CombatSimulation = {
            attackers: [
                {
                    id: '0',
                    weapon: null,
                    ammo: null,
                }
            ],
            defender: {
                bodyArmor: null,
                bodyArmorDurability: 100,
                helmet: null,
                helmetDurability: 100,
                faceShield: null
            },
            range: 0,
            displayMode: 'stk',
            sortBy: "ttk"
        }

        const parsedParams = parseUrlParams();
        return {
            ...defaultState,
            ...parsedParams,
            attackers: parsedParams.attackers?.length ? parsedParams.attackers : defaultState.attackers,
            defender: { ...defaultState.defender, ...parsedParams.defender }
        };
    });

    // Calculation results
    const [zoneCalculations, setZoneCalculations] = useState<Record<string, ZoneCalculation[]>>({});
    const [attackerSummaries, setAttackerSummaries] = useState<AttackerSummary[]>([]);
    const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Get valid attackers (with weapon and compatible ammo)
    const validAttackers = useMemo(() =>
            simulation.attackers.filter(attacker =>
                attacker.weapon &&
                attacker.ammo &&
                areWeaponAmmoCompatible(attacker.weapon, attacker.ammo)
            ),
        [simulation.attackers]
    );

    const hasValidSetups = validAttackers.length > 0;

    // Sync URL when simulation changes (but not on initial mount or when updating from URL)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (isUpdatingFromUrl.current) {
            isUpdatingFromUrl.current = false;
            return;
        }

        // Debounce URL updates to avoid too many history entries
        const timeoutId = setTimeout(() => {
            updateUrlParams(simulation);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [simulation, updateUrlParams]);

    // Listen for browser back/forward navigation
    useEffect(() => {
        const handlePopState = () => {
            isUpdatingFromUrl.current = true;
            const urlParams = parseUrlParams();

            setSimulation(prev => ({
                ...prev,
                ...urlParams,
                attackers: urlParams.attackers?.length ? urlParams.attackers : prev.attackers,
                defender: { ...prev.defender, ...urlParams.defender }
            }));
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [parseUrlParams]);

    // Auto-select first valid attacker if none selected
    useEffect(() => {
        if (validAttackers.length > 0 && !selectedAttackerId) {
            setSelectedAttackerId(validAttackers[0].id);
        } else if (validAttackers.length === 0) {
            setSelectedAttackerId(null);
        } else if (selectedAttackerId && !validAttackers.find(a => a.id === selectedAttackerId)) {
            // Selected attacker became invalid, select first valid
            setSelectedAttackerId(validAttackers[0]?.id || null);
        }
    }, [validAttackers, selectedAttackerId]);

    // Perform calculations when inputs change
    useEffect(() => {
        if (!hasValidSetups) {
            setZoneCalculations({});
            setAttackerSummaries([]);
            return;
        }

        // Debounce calculations
        const timeoutId = setTimeout(() => {
            setIsCalculating(true);

            try {
                // Calculate results for all valid attackers
                const results = calculateCombatResults(
                    validAttackers,
                    simulation.defender,
                    simulation.range
                );

                // Sort results based on current sort preference
                const sortedResults: Record<string, ZoneCalculation[]> = {};
                Object.entries(results).forEach(([attackerId, calcs]) => {
                    sortedResults[attackerId] = sortZoneCalculations(calcs, simulation.sortBy);
                });

                setZoneCalculations(sortedResults);

                // Calculate summaries
                const summaries = Object.entries(sortedResults).map(([attackerId, calcs]) =>
                    calculateAttackerSummary(attackerId, calcs)
                );
                setAttackerSummaries(summaries);

            } catch (error) {
                console.error('Error calculating combat results:', error);
            } finally {
                setIsCalculating(false);
            }
        }, 100); // 100ms debounce

        return () => clearTimeout(timeoutId);
    }, [validAttackers, simulation.defender, simulation.range, simulation.sortBy, hasValidSetups]);

    // Action handlers
    const updateSimulation = useCallback((updates: Partial<CombatSimulation>) => {
        setSimulation(prev => ({...prev, ...updates}));
    }, []);

    const addAttacker = useCallback(() => {
        if (simulation.attackers.length >= 4) return;

        const colorIndex = Object.keys(ATTACKER_COLORS).find((index) => simulation.attackers.every(attacker => attacker.id !== index))

        const newAttacker: AttackerSetup = {
            // @ts-expect-error colorIndex is never undefined because of if (simulation.attackers.length >= 4) return;
            id: colorIndex,
            weapon: null,
            ammo: null
        };

        setSimulation(prev => ({
            ...prev,
            attackers: [...prev.attackers, newAttacker]
        }));
    }, [simulation.attackers]);

    const removeAttacker = useCallback((attackerId: string) => {
        setSimulation(prev => ({
            ...prev,
            attackers: prev.attackers.filter(a => a.id !== attackerId)
        }));
    }, []);

    const updateAttacker = useCallback((attackerId: string, updates: Partial<AttackerSetup>) => {
        setSimulation(prev => ({
            ...prev,
            attackers: prev.attackers.map(a =>
                a.id === attackerId ? {...a, ...updates} : a
            )
        }));
    }, []);

    const updateDefender = useCallback((updates: Partial<DefenderSetup>) => {
        setSimulation(prev => ({
            ...prev,
            defender: {...prev.defender, ...updates}
        }));
    }, []);

    const selectAttacker = useCallback((attackerId: string | null) => {
        setSelectedAttackerId(attackerId);
    }, []);

    return {
        // State
        simulation,
        zoneCalculations,
        attackerSummaries,
        selectedAttackerId,
        isCalculating,

        // Actions
        updateSimulation,
        addAttacker,
        removeAttacker,
        updateAttacker,
        updateDefender,
        selectAttacker,

        // Computed values
        hasValidSetups,
        validAttackers
    };
}
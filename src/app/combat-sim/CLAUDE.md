# Combat Simulator Documentation

## Documentation Hierarchy

**Parent:** [App Router](../CLAUDE.md) - Next.js pages & routing
**Root:** [Root CLAUDE.md](../../../CLAUDE.md) - Project overview
**Index:** [CLAUDE-INDEX.md](../../../CLAUDE-INDEX.md) - Complete navigation

**Related Documentation:**
- [Types](../../types/CLAUDE.md) - Item and combat types
- [Components](../../components/CLAUDE.md) - Component patterns
- [App Router](../CLAUDE.md) - Next.js patterns

**See Also:**
- For weapon/armor data, see [Public Data CLAUDE.md](../../../public/data/CLAUDE.md)
- For item types, see [Types CLAUDE.md](../../types/CLAUDE.md) - Items Types
- For URL state patterns, see [App CLAUDE.md](../CLAUDE.md)

---

## Overview

The **Combat Simulator** is an advanced ballistics calculator that simulates weapon effectiveness against armored targets. Users can:

- Configure up to 4 attackers with different weapon/ammo loadouts
- Configure a defender with body armor, helmet, and face shield
- Adjust combat range (0-600m)
- View time-to-kill (TTK), shots-to-kill (STK), and cost-to-kill (CTK)
- Visualize damage on an interactive body model
- Compare multiple loadouts side-by-side
- Share configurations via URL params
- Test complex armor penetration mechanics

**Route:** `/combat-sim`

**Key Features:**
- **Multi-attacker comparison:** Up to 4 loadouts simultaneously
- **Body zone visualization:** Interactive SVG body model
- **Advanced ballistics:** Penetration curves, armor degradation, blunt damage
- **Real-time calculations:** Debounced for performance
- **URL state:** Shareable configurations
- **Display modes:** TTK, STK, CTK toggle
- **Range adjustments:** 0-600m slider

---

## Directory Structure

```
app/combat-sim/
├── components/                     # React components
│   ├── AttackerSetup.tsx          # Attacker config panel
│   ├── AttackerSummaryCard.tsx    # Attacker selector card
│   ├── BodyModel/                  # Body visualization
│   │   └── BodyModel.tsx          # SVG body model
│   ├── CombatSimulatorContent.tsx # Main client component
│   ├── CombatSummary.tsx          # Results summary table
│   └── DefenderSetup.tsx          # Defender config panel
├── debug/                          # Debug tools
├── hooks/                          # Custom hooks
│   ├── useCombatSimulation.ts     # Main simulation logic
│   └── useCombatSimParams.ts      # URL param management
├── utils/                          # Calculation logic
│   ├── body-zones.ts              # Body zone definitions
│   ├── combat-calculations.ts     # Combat simulation
│   ├── combat-test-helper.ts      # Testing utilities
│   ├── damage-calculations.ts     # Damage formulas
│   ├── test-types.ts              # Test data types
│   └── types.ts                   # TypeScript types
├── combat-simulator-spec.md        # Feature specification
└── page.tsx                        # Server component wrapper
```

---

## Combat Simulator Page

### Route: `/combat-sim`

**File:** `app/combat-sim/page.tsx`

**Pattern:** Server Component with Suspense

```typescript
import { Suspense } from 'react';
import { Metadata } from 'next';
import CombatSimulatorContent from './components/CombatSimulatorContent';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
    title: 'Combat Simulator',
    description: 'Test weapon damage, TTK calculations, and combat scenarios...',
    keywords: ['combat simulator', 'weapon damage', 'TTK calculator'],
    openGraph: {
        title: 'Combat Simulator | ExfilZone Assistant',
        description: 'Test weapon damage, TTK calculations, and combat scenarios.',
        type: 'website',
        images: [
            {
                url: '/og/og-image-combat-sim.jpg',
                width: 1200,
                height: 630,
            },
        ]
    },
};

// Loading component
function ItemsLoading() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="military-box p-8 rounded-sm text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Combat Simulator</h2>
                        <p className="text-tan-300">Retrieving tactical knowledge data...</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Main page component
export default function CombatSimulatorPage() {
    return (
        <Suspense fallback={<ItemsLoading />}>
            <CombatSimulatorContent />
        </Suspense>
    );
}
```

---

## Combat Simulator Content Component

### Component: `CombatSimulatorContent`

**File:** `app/combat-sim/components/CombatSimulatorContent.tsx`

**Pattern:** Client Component with custom hook

```typescript
'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import {DisplayMode, DISPLAY_MODE_LABELS, areWeaponAmmoCompatible} from '../utils/types';
import {useCombatSimulation} from "@/app/combat-sim/hooks/useCombatSimulation";
import {Plus, Target, DollarSign, Clock, Loader2} from 'lucide-react';

// Component imports
import AttackerSetup from './AttackerSetup';
import DefenderSetup from './DefenderSetup';
import BodyModel from './BodyModel/BodyModel';
import AttackerSummaryCard from "@/app/combat-sim/components/AttackerSummaryCard";
import CombatSummary from "@/app/combat-sim/components/CombatSummary";
import {useCombatSimUrlParams} from "@/app/combat-sim/hooks/useCombatSimParams";
import ShareButton from "@/components/ShareButton";

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
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8 relative">
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
                        {/* Display Mode Toggle (TTK/STK/CTK) */}
                        {/* Range Slider (0-600m) */}
                        {/* Share Button */}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Attacker Panel (Left - lg:col-span-3) */}
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

                        {/* Add attacker button (max 4) */}
                        {simulation.attackers.length < 4 && (
                            <button onClick={addAttacker}>
                                <Plus size={20}/>
                                <span>Add New Attacker</span>
                            </button>
                        )}
                    </div>

                    {/* Body Model (Center - lg:col-span-6) */}
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

                    {/* Defender Panel (Right - lg:col-span-3) */}
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
                    <CombatSummary
                        simulation={simulation}
                        zoneCalculations={zoneCalculations}
                        validAttackers={validAttackers}
                    />
                )}
            </div>
        </Layout>
    );
}
```

**Key Features:**
- **Three-panel layout:** Attackers (left), body model (center), defender (right)
- **Display mode toggle:** TTK, STK, CTK with icons
- **Range slider:** 0-600m with visual feedback
- **Share button:** Generate shareable URL
- **Add attacker:** Up to 4 attackers (Alpha, Bravo, Charlie, Delta)
- **Calculation indicator:** Loading spinner during calculations

**Page Structure:**
1. **Control Panel:** Display mode, range, share button
2. **Attackers Column:** Up to 4 attacker configs
3. **Body Model Column:** Interactive visualization + attacker tabs
4. **Defender Column:** Armor, helmet, durability
5. **Results Section:** Combat summary table

---

## useCombatSimulation Hook

### Hook: `useCombatSimulation`

**File:** `app/combat-sim/hooks/useCombatSimulation.ts`

**Pattern:** Complex state management with calculations

```typescript
export function useCombatSimulation(): UseCombatSimulationReturn {
    const {parseUrlParams, updateUrlParams} = useCombatSimUrlParams();
    const isInitialMount = useRef(true);
    const isUpdatingFromUrl = useRef(false);

    // Initialize simulation state (from URL or defaults)
    const [simulation, setSimulation] = useState<CombatSimulation>(() => {
        const defaultState: CombatSimulation = {
            attackers: [{ id: '0', weapon: null, ammo: null }],
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
        };

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

    // Sync URL when simulation changes (debounced)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (isUpdatingFromUrl.current) {
            isUpdatingFromUrl.current = false;
            return;
        }

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
            setSelectedAttackerId(validAttackers[0]?.id || null);
        }
    }, [validAttackers, selectedAttackerId]);

    // Perform calculations when inputs change (debounced)
    useEffect(() => {
        if (!hasValidSetups) {
            setZoneCalculations({});
            setAttackerSummaries([]);
            return;
        }

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

        const colorIndex = Object.keys(ATTACKER_COLORS).find((index) =>
            simulation.attackers.every(attacker => attacker.id !== index)
        );

        const newAttacker: AttackerSetup = {
            id: colorIndex!,
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
        simulation,
        zoneCalculations,
        attackerSummaries,
        selectedAttackerId,
        isCalculating,
        updateSimulation,
        addAttacker,
        removeAttacker,
        updateAttacker,
        updateDefender,
        selectAttacker,
        hasValidSetups,
        validAttackers
    };
}
```

**Key Features:**
- **URL param integration:** Parse on mount, sync on changes
- **Debounced calculations:** 100ms delay to prevent excessive recalculation
- **Debounced URL updates:** 500ms delay to prevent history spam
- **Browser history support:** Back/forward navigation
- **Auto-selection:** First valid attacker auto-selected
- **Validation:** Weapon/ammo compatibility checking
- **Memoized valid attackers:** Efficient filtering

**State Management:**
- `simulation` - Main simulation config
- `zoneCalculations` - Results per attacker per zone
- `attackerSummaries` - Summary stats per attacker
- `selectedAttackerId` - Currently selected attacker for visualization
- `isCalculating` - Loading indicator

---

## Combat Calculations

### File: `app/combat-sim/utils/combat-calculations.ts`

**Core Functions:**

#### calculateCombatResults
```typescript
export function calculateCombatResults(
    attackers: AttackerSetup[],
    defender: DefenderSetup,
    range: number
): Record<string, ZoneCalculation[]> {
    const results: Record<string, ZoneCalculation[]> = {};

    attackers.forEach(attacker => {
        if (!attacker.weapon || !attacker.ammo) return;

        results[attacker.id] = calculateAttackerZones(
            attacker.weapon,
            attacker.ammo,
            defender,
            range
        );
    });

    return results;
}
```

Calculates results for all attackers against all body zones.

#### calculateAttackerZones
```typescript
function calculateAttackerZones(
    weapon: Weapon,
    ammo: Ammunition,
    defender: DefenderSetup,
    range: number
): ZoneCalculation[] {
    const calculations: ZoneCalculation[] = [];

    Object.keys(ARMOR_ZONES).forEach((zoneId) => {
        const bodyPart = getBodyPartForArmorZone(zoneId);
        if (!bodyPart) return;

        // Determine armor protecting this zone
        const armor = getZoneArmor(zoneId, defender);

        // Convert ammo to required format
        const ammoProps: AmmoProperties = {
            damage: ammo.stats.damage,
            penetration: ammo.stats.penetration,
            caliber: ammo.stats.caliber,
            pellets: ammo.stats.pellets,
            muzzleVelocity: ammo.stats.muzzleVelocity,
            bleedingChance: ammo.stats.bleedingChance || 0,
            bluntDamageScale: ammo.stats.bluntDamageScale || 0.1,
            // ... penetration curves, etc.
        };

        // Convert armor to required format if present
        const armorProps: ArmorProperties | null = armor ? {
            armorClass: armor.stats.armorClass,
            maxDurability: armor.stats.maxDurability,
            currentDurability: getArmorDurability(zoneId, defender),
            durabilityDamageScalar: armor.stats.durabilityDamageScalar,
            protectiveData: armor.stats.protectiveData,
            penetrationChanceCurve: armor.stats.penetrationChanceCurve,
            // ... other armor properties
        } : null;

        // Calculate shots to kill
        const combatResult = simulateCombat(
            ammoProps,
            armorProps,
            weapon.stats.firingPower,
            zoneId,
            bodyPart,
            range
        );

        const shotsToKill = combatResult.shotsToKill;

        // Calculate time to kill
        const fireRate = weapon.stats.fireRate || 600;
        const ttk = calculateTimeToKill(shotsToKill, fireRate);

        // Calculate cost to kill
        const costToKill = shotsToKill * ammo.stats.price;

        calculations.push({
            zoneId,
            bodyPartId: bodyPart.id,
            ttk,
            costToKill,
            isProtected: armorProps !== null,
            armorClass: armorProps?.armorClass || 0,
            ...combatResult,
        });
    });

    return calculations;
}
```

Calculates results for one attacker against all body zones.

**Key Logic:**
1. Loop through all armor zones
2. Get body part HP for each zone
3. Determine armor protecting zone (helmet vs body armor)
4. Convert item stats to calculation format
5. Simulate combat (damage calculations)
6. Calculate TTK from fire rate
7. Calculate CTK from ammo price

#### getZoneArmor
```typescript
function getZoneArmor(zoneId: string, defender: DefenderSetup): Armor | null {
    const zone = ARMOR_ZONES[zoneId];
    if (!zone) return null;

    // Check if zone is protected by helmet
    if (isZoneProtectedBy(zoneId, 'helmet')) {
        if (defender.helmet) {
            // Check if helmet actually protects this specific zone
            if (defender.helmet.stats.protectiveData) {
                const protectsZone = defender.helmet.stats.protectiveData.some((pd: ProtectiveZone) =>
                    pd.bodyPart === zoneId
                ) || (defender.faceShield && defender.helmet.stats.canAttach?.includes(defender.faceShield.id));

                if (protectsZone) return defender.helmet;
            }
        }
        return null;
    }

    // Check if zone is protected by body armor
    if (isZoneProtectedBy(zoneId, 'armor')) {
        if (defender.bodyArmor) {
            if (defender.bodyArmor.stats.protectiveData) {
                const protectsZone = defender.bodyArmor.stats.protectiveData.some((pd: ProtectiveZone) =>
                    pd.bodyPart === zoneId
                );
                if (protectsZone) return defender.bodyArmor;
            } else {
                return defender.bodyArmor;
            }
        }
    }

    return null;
}
```

Determines which armor protects a specific body zone.

#### calculateTimeToKill
```typescript
function calculateTimeToKill(shotsToKill: number, fireRate: number): number {
    if (shotsToKill === Infinity) return Infinity;

    const timeBetweenShots = 60 / fireRate;
    return (shotsToKill - 1) * timeBetweenShots;
}
```

Converts shots to time based on fire rate (RPM).

**Formula:** `TTK = (STK - 1) × (60 / fireRate)`

**Example:** 3 shots @ 600 RPM = (3-1) × (60/600) = 0.2s

---

## Damage Calculations

### File: `app/combat-sim/utils/damage-calculations.ts`

**Core Function:**

```typescript
export function simulateCombat(
    ammo: AmmoProperties,
    armor: ArmorProperties | null,
    firingPower: number,
    zoneId: string,
    bodyPart: BodyPart,
    range: number
): CombatSimulationResult {
    let currentHp = bodyPart.hp;
    let currentArmorDurability = armor?.currentDurability || 0;
    const shots: ShotResultWithLeftovers[] = [];
    let shotsToKill = 0;

    // Fire shots until target HP reaches 0
    while (currentHp > 0 && shotsToKill < 100) { // Max 100 shots to prevent infinite loops
        shotsToKill++;

        const shotResult = calculateShotDamage(
            ammo,
            armor,
            currentArmorDurability,
            firingPower,
            range
        );

        // Apply damage to HP
        currentHp -= shotResult.damageToBodyPart;

        // Apply damage to armor
        if (armor && currentArmorDurability > 0) {
            currentArmorDurability -= shotResult.damageToArmor;
            if (currentArmorDurability < 0) currentArmorDurability = 0;
        }

        shots.push({
            ...shotResult,
            remainingArmorDurability: currentArmorDurability,
            remainingHp: currentHp < 0 ? 0 : currentHp
        });
    }

    return {
        shotsToKill,
        finalArmorDurability: currentArmorDurability,
        totalDamageDealt: bodyPart.hp - currentHp,
        shots
    };
}
```

**Simulation Logic:**
1. Initialize HP and armor durability
2. Loop until HP reaches 0 (or max 100 shots)
3. Calculate damage for each shot
4. Reduce HP and armor durability
5. Record shot results
6. Return total stats

**Key Mechanics:**
- **Armor degradation:** Durability decreases with each hit
- **Penetration chance:** Based on ammo pen vs armor class
- **Blunt damage:** Non-penetrating hits still do damage
- **Range falloff:** Damage/penetration decrease with distance
- **Ballistic curves:** Complex pen chance based on armor durability

---

## Body Zones

### File: `app/combat-sim/utils/body-zones.ts`

**Body Zone Definitions:**

```typescript
export const ARMOR_ZONES: Record<string, ArmorZone> = {
    'head_top': { id: 'head_top', name: 'Head (Top)', protectedBy: 'helmet' },
    'head_nape': { id: 'head_nape', name: 'Head (Nape)', protectedBy: 'helmet' },
    'head_ears': { id: 'head_ears', name: 'Head (Ears)', protectedBy: 'helmet' },
    'head_face': { id: 'head_face', name: 'Face', protectedBy: 'helmet' }, // Face shield
    'spine_01': { id: 'spine_01', name: 'Upper Thorax', protectedBy: 'armor' },
    'spine_02': { id: 'spine_02', name: 'Thorax', protectedBy: 'armor' },
    'spine_03': { id: 'spine_03', name: 'Stomach', protectedBy: 'armor' },
    'clavicle_l': { id: 'clavicle_l', name: 'Left Arm', protectedBy: 'armor' },
    'clavicle_r': { id: 'clavicle_r', name: 'Right Arm', protectedBy: 'armor' },
    // ... more zones
};

export const BODY_PARTS: Record<string, BodyPart> = {
    'head': { id: 'head', name: 'Head', hp: 35 },
    'thorax': { id: 'thorax', name: 'Thorax', hp: 85 },
    'stomach': { id: 'stomach', name: 'Stomach', hp: 70 },
    'leftArm': { id: 'leftArm', name: 'Left Arm', hp: 60 },
    'rightArm': { id: 'rightArm', name: 'Right Arm', hp: 60 },
    'leftLeg': { id: 'leftLeg', name: 'Left Leg', hp: 65 },
    'rightLeg': { id: 'rightLeg', name: 'Right Leg', hp: 65 },
};
```

**Zone Mapping:**
- **Armor zones:** Specific hit locations (head_top, spine_01, etc.)
- **Body parts:** HP pools (head, thorax, stomach, arms, legs)
- **Protection:** Which armor type protects each zone

**Helper Functions:**
```typescript
export function getBodyPartForArmorZone(zoneId: string): BodyPart | null {
    if (zoneId.includes('head')) return BODY_PARTS.head;
    if (zoneId.includes('spine_01')) return BODY_PARTS.thorax;
    if (zoneId.includes('spine_02')) return BODY_PARTS.thorax;
    if (zoneId.includes('spine_03')) return BODY_PARTS.stomach;
    if (zoneId.includes('clavicle_l')) return BODY_PARTS.leftArm;
    if (zoneId.includes('clavicle_r')) return BODY_PARTS.rightArm;
    // ... etc
    return null;
}

export function isZoneProtectedBy(zoneId: string, armorType: 'helmet' | 'armor'): boolean {
    const zone = ARMOR_ZONES[zoneId];
    return zone?.protectedBy === armorType;
}
```

---

## Type Definitions

### File: `app/combat-sim/utils/types.ts`

**Display Modes:**
```typescript
export type DisplayMode = 'ttk' | 'stk' | 'ctk';

export const DISPLAY_MODE_LABELS = {
    ttk: 'Time to Kill',    // Seconds
    stk: 'Shots to Kill',   // Number of shots
    ctk: 'Cost to Kill'     // Dollar cost
} as const;
```

**Attacker Colors:**
```typescript
export const ATTACKER_COLORS: {
    [key: string]: {
        name: string;
        hex: string;
        class: string;
    };
} = {
    "0": {name: 'Alpha', hex: '#00D9FF', class: 'text-cyan-400'},
    "1": {name: 'Bravo', hex: '#FF6B6B', class: 'text-rose-400'},
    "2": {name: 'Charlie', hex: '#4ECDC4', class: 'text-teal-400'},
    "3": {name: 'Delta', hex: '#FFE66D', class: 'text-amber-300'}
} as const;
```

**Simulation State:**
```typescript
export interface CombatSimulation {
    attackers: AttackerSetup[];
    defender: DefenderSetup;
    range: number; // in meters
    displayMode: DisplayMode;
    sortBy: SortBy;
}

export interface AttackerSetup {
    id: string; // '0', '1', '2', '3'
    weapon: Weapon | null;
    ammo: Ammunition | null;
}

export interface DefenderSetup {
    bodyArmor: BodyArmor | null;
    bodyArmorDurability: number; // 0-100%
    helmet: Helmet | null;
    helmetDurability: number; // 0-100%
    faceShield: FaceShield | null;
}
```

**Calculation Results:**
```typescript
export interface ZoneCalculation extends CombatSimulationResult {
    zoneId: string;
    bodyPartId: string;
    ttk: number; // Time to kill (seconds)
    costToKill: number; // Cost in dollars
    isProtected: boolean; // Has armor
    armorClass: number; // Armor class (0-6)
    fragmentationDamage?: number;
    bleedDamagePerSecond?: number;
    averagePenetrationChance?: number;
    stkDistribution?: { shots: number; probability: number }[];
}

export interface CombatSimulationResult {
    shotsToKill: number;
    finalArmorDurability: number;
    totalDamageDealt: number;
    shots: ShotResultWithLeftovers[];
}

export interface ShotResultWithLeftovers extends ShotResult{
    remainingArmorDurability: number;
    remainingHp: number;
}

export interface ShotResult {
    isPenetrating: boolean;
    damageToBodyPart: number;
    damageToArmor: number;
    penetrationChance: number;
}
```

---

## URL Parameter Management

### Hook: `useCombatSimUrlParams`

**File:** `app/combat-sim/hooks/useCombatSimParams.ts`

**Pattern:** Parse and serialize combat config to URL params

```typescript
export function useCombatSimUrlParams() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const parseUrlParams = useCallback((): Partial<CombatSimulation> => {
        const params: Partial<CombatSimulation> = {};

        // Parse display mode
        const mode = searchParams.get('mode');
        if (mode && isDisplayMode(mode)) {
            params.displayMode = mode;
        }

        // Parse range
        const range = searchParams.get('range');
        if (range) {
            params.range = parseInt(range);
        }

        // Parse attackers (weapon/ammo IDs)
        const attackersParam = searchParams.get('attackers');
        if (attackersParam) {
            params.attackers = parseAttackersFromUrl(attackersParam);
        }

        // Parse defender (armor IDs and durability)
        const defenderParam = searchParams.get('defender');
        if (defenderParam) {
            params.defender = parseDefenderFromUrl(defenderParam);
        }

        return params;
    }, [searchParams]);

    const updateUrlParams = useCallback((simulation: CombatSimulation) => {
        const params = new URLSearchParams();

        // Add display mode
        params.set('mode', simulation.displayMode);

        // Add range
        params.set('range', simulation.range.toString());

        // Add attackers
        const attackersStr = serializeAttackers(simulation.attackers);
        if (attackersStr) params.set('attackers', attackersStr);

        // Add defender
        const defenderStr = serializeDefender(simulation.defender);
        if (defenderStr) params.set('defender', defenderStr);

        // Update URL without reload
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router]);

    const getShareableLink = useCallback((simulation: CombatSimulation): string => {
        const params = new URLSearchParams();
        params.set('mode', simulation.displayMode);
        params.set('range', simulation.range.toString());

        const attackersStr = serializeAttackers(simulation.attackers);
        if (attackersStr) params.set('attackers', attackersStr);

        const defenderStr = serializeDefender(simulation.defender);
        if (defenderStr) params.set('defender', defenderStr);

        return `${window.location.origin}/combat-sim?${params.toString()}`;
    }, []);

    return { parseUrlParams, updateUrlParams, getShareableLink };
}
```

**URL Format:**
```
/combat-sim?mode=ttk&range=60&attackers=weapon1,ammo1;weapon2,ammo2&defender=armor1,100,helmet1,100
```

**Parameters:**
- `mode` - Display mode (ttk, stk, ctk)
- `range` - Combat range (0-600)
- `attackers` - Semicolon-separated attacker configs
  - Each: `weaponId,ammoId`
- `defender` - Comma-separated defender config
  - Format: `armorId,armorDur,helmetId,helmetDur,faceShieldId`

---

## Component: AttackerSetup

**File:** `app/combat-sim/components/AttackerSetup.tsx`

Displays:
- Attacker label with color (Alpha/Bravo/Charlie/Delta)
- Weapon selector (dropdown)
- Ammo selector (filtered by weapon caliber)
- Remove button (if more than 1 attacker)

**Features:**
- Ammo auto-filtered by weapon caliber
- Color-coded borders
- Compatibility validation

---

## Component: DefenderSetup

**File:** `app/combat-sim/components/DefenderSetup.tsx`

Displays:
- Body armor selector
- Body armor durability slider (0-100%)
- Helmet selector
- Helmet durability slider (0-100%)
- Face shield selector (if helmet supports it)

**Features:**
- Durability percentage display
- Disabled sliders when no armor selected
- Face shield only shown if helmet compatible

---

## Component: BodyModel

**File:** `app/combat-sim/components/BodyModel/BodyModel.tsx`

**Pattern:** SVG visualization with color mapping

Displays:
- Interactive SVG body model
- Color-coded zones based on TTK/STK/CTK
- Tooltips on hover with detailed stats
- Selected attacker's results

**Features:**
- Heat map colors (green=fast, red=slow/impossible)
- Zone highlighting on hover
- Display mode switching (TTK/STK/CTK)
- Multi-attacker support

**Color Mapping:**
- **Green (#10b981):** Very fast (TTK < 1s)
- **Light green (#84cc16):** Fast (TTK 1-2s)
- **Yellow (#facc15):** Moderate (TTK 2-3s)
- **Orange (#fb923c):** Slow (TTK 3-5s)
- **Red (#ef4444):** Very slow (TTK 5s+)
- **Dark red (#dc2626):** Impossible (TTK = ∞)

---

## Component: CombatSummary

**File:** `app/combat-sim/components/CombatSummary.tsx`

Displays:
- Summary table for all attackers
- Best zone, worst zone, average TTK
- Total cost estimate
- Viable zones count
- Detailed zone breakdown table

**Table Columns:**
- Zone name
- STK (shots to kill)
- TTK (time to kill)
- CTK (cost to kill)
- Armor class
- Protection status

---

## Common Patterns

### DO's ✅

```typescript
// ✅ Use type guards for weapon/ammo compatibility
if (areWeaponAmmoCompatible(weapon, ammo)) {
    // Proceed with calculations
}

// ✅ Debounce expensive calculations
const timeoutId = setTimeout(() => {
    const results = calculateCombatResults(...);
}, 100);

// ✅ Handle infinity values
if (ttk === Infinity) {
    return '∞';
}

// ✅ Use memoized values for filtering
const validAttackers = useMemo(() =>
    attackers.filter(a => a.weapon && a.ammo),
    [attackers]
);

// ✅ Validate zone armor protection
const armor = getZoneArmor(zoneId, defender);
if (armor?.stats.protectiveData.some(pd => pd.bodyPart === zoneId)) {
    // Zone is protected
}

// ✅ Format display values
const formatted = formatTTK(ttk); // "1.25s" or "∞"
```

### DON'Ts ❌

```typescript
// ❌ Don't calculate without debouncing
onChange={() => calculateCombatResults(...)}

// ❌ Don't assume weapon/ammo compatibility
const results = calculateCombatResults(attackers, ...); // Check first!

// ❌ Don't update URL on every change
onChange={() => router.replace(`?range=${range}`)} // Debounce!

// ❌ Don't hardcode body part HP
const hp = 35; // Use BODY_PARTS.head.hp

// ❌ Don't forget to handle armor degradation
const damage = calculateDamage(ammo, armor); // Armor durability changes!
```

---

## Performance Optimizations

### Implemented Optimizations

1. **Debounced calculations:** 100ms delay prevents excessive recalculation
2. **Debounced URL updates:** 500ms delay prevents history spam
3. **Memoized valid attackers:** Filter only when attackers array changes
4. **Calculation batching:** All zones calculated together
5. **useCallback for handlers:** Prevent unnecessary re-renders
6. **Conditional rendering:** Only show body model when valid setups exist

---

## Testing Considerations

### Unit Tests

**calculateTimeToKill:**
```typescript
describe('calculateTimeToKill', () => {
    it('calculates TTK correctly', () => {
        expect(calculateTimeToKill(3, 600)).toBe(0.2); // (3-1) * (60/600)
    });

    it('handles infinity', () => {
        expect(calculateTimeToKill(Infinity, 600)).toBe(Infinity);
    });
});
```

**areWeaponAmmoCompatible:**
```typescript
describe('areWeaponAmmoCompatible', () => {
    it('returns true for matching calibers', () => {
        const weapon = { stats: { caliber: '5.56x45' } };
        const ammo = { stats: { caliber: '5.56x45' } };
        expect(areWeaponAmmoCompatible(weapon, ammo)).toBe(true);
    });

    it('returns false for mismatched calibers', () => {
        const weapon = { stats: { caliber: '5.56x45' } };
        const ammo = { stats: { caliber: '7.62x39' } };
        expect(areWeaponAmmoCompatible(weapon, ammo)).toBe(false);
    });
});
```

---

## External Resources

### Ballistics & Game Mechanics
- **Armor Penetration:** Game-specific formulas for pen chance curves
- **Damage Falloff:** Range-based damage/penetration reduction
- **Blunt Damage:** Non-penetrating damage calculations

### Next.js & React
- **useSearchParams**: [nextjs.org/docs/app/api-reference/functions/use-search-params](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- **useMemo**: [react.dev/reference/react/useMemo](https://react.dev/reference/react/useMemo)
- **useCallback**: [react.dev/reference/react/useCallback](https://react.dev/reference/react/useCallback)

---

## Summary

The Combat Simulator is the most complex feature with:
- **Advanced ballistics:** Penetration curves, armor degradation, blunt damage
- **Multi-attacker comparison:** Up to 4 loadouts simultaneously
- **Interactive visualization:** SVG body model with heat mapping
- **URL state:** Shareable configurations
- **Real-time calculations:** Debounced for performance
- **Comprehensive metrics:** TTK, STK, CTK analysis

All patterns follow project standards: No `any` types, Tailwind 4+ syntax, type-safe implementations, and debounced performance optimizations.

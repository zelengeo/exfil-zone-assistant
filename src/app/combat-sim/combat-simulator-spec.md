# Combat Simulator Specification

## Overview
The Combat Simulator is an interactive tool that allows players to analyze weapon effectiveness against armored opponents in various combat scenarios. Users can compare multiple weapon/ammo combinations and visualize damage output across different body zones.

## Route
`/combat-simulator`

## Core Features

### 1. Multi-Attacker Comparison
- Support up to 4 different weapon + ammo combinations
- Each setup has unique color coding (Blue, Red, Green, Yellow)
- Real-time comparison of effectiveness

### 2. Interactive Body Model
- 2D standing figure (front view)
- Clickable/hoverable zones
- Visual armor representation with rarity-based colors
- Dynamic value overlays based on selected display mode

### 3. Range-Based Calculations
- Adjustable engagement distance (0-500m)
- Real-time damage falloff calculations
- Penetration power adjustments

### 4. Multiple Display Modes
- **TTK (Time to Kill)**: Shows time in seconds
- **STK (Shots to Kill)**: Shows number of shots required
- **CTK (Cost to Kill)**: Shows ammunition cost

## Data Structure

### Body Part System
```typescript
// Actual body parts with HP (damage zones)
interface BodyPart {
  id: string;
  name: string;
  hp: number;
  isVital: boolean;
  armorZones: string[]; // References to armor zones that protect this part
}

// Armor protection zones (what armor pieces cover)
interface ArmorZone {
  id: string;
  name: string;
  bodyPart: string; // Which body part this zone belongs to
  defaultProtection: 'armor' | 'helmet' | 'none';
}
```

### Body Parts Configuration
```typescript
const BODY_PARTS = {
  head: { 
    hp: 35, 
    vital: true,
    armorZones: ['head_top', 'head_eyes', 'head_chin']
  },
  chest: { 
    hp: 85, 
    vital: true,
    armorZones: ['chest']
  },
  stomach: { 
    hp: 70, 
    vital: false,
    armorZones: ['stomach']
  },
  left_arm: { 
    hp: 60, 
    vital: false,
    armorZones: ['arm_upper_l', 'arm_lower_l']
  },
  right_arm: { 
    hp: 60, 
    vital: false,
    armorZones: ['arm_upper_r', 'arm_lower_r']
  },
  left_leg: { 
    hp: 65, 
    vital: false,
    armorZones: ['leg_thigh_l', 'leg_lower_l']
  },
  right_leg: { 
    hp: 65, 
    vital: false,
    armorZones: ['leg_thigh_r', 'leg_lower_r']
  }
};

const ARMOR_ZONES = {
  // Head zones (protected by helmet)
  head_top: { bodyPart: 'head', defaultProtection: 'helmet' },
  head_eyes: { bodyPart: 'head', defaultProtection: 'helmet' }, // face shield
  head_chin: { bodyPart: 'head', defaultProtection: 'helmet' }, // face armor
  
  // Torso zones (protected by body armor)
  chest: { bodyPart: 'chest', defaultProtection: 'armor' },
  stomach: { bodyPart: 'stomach', defaultProtection: 'armor' },
  
  // Arm zones
  arm_upper_l: { bodyPart: 'left_arm', defaultProtection: 'armor' }, // some armors
  arm_upper_r: { bodyPart: 'right_arm', defaultProtection: 'armor' }, // some armors
  arm_lower_l: { bodyPart: 'left_arm', defaultProtection: 'none' },
  arm_lower_r: { bodyPart: 'right_arm', defaultProtection: 'none' },
  
  // Leg zones
  leg_thigh_l: { bodyPart: 'left_leg', defaultProtection: 'armor' }, // some armors
  leg_thigh_r: { bodyPart: 'right_leg', defaultProtection: 'armor' }, // some armors
  leg_lower_l: { bodyPart: 'left_leg', defaultProtection: 'none' },
  leg_lower_r: { bodyPart: 'right_leg', defaultProtection: 'none' }
};
```

### Combat Simulation Interfaces
```typescript
interface CombatSimulation {
  attackers: AttackerSetup[];
  defender: DefenderSetup;
  range: number;
  displayMode: 'ttk' | 'stk' | 'ctk';
  sortBy: 'ttk' | 'damage' | 'cost';
}

interface AttackerSetup {
  id: string;
  weapon: Weapon;
  ammo: Ammunition;
  color: string; // For UI display
}

interface DefenderSetup {
  bodyArmor: Armor | null;
  bodyArmorDurability: number; // 0-100%
  helmet: Armor | null;
  helmetDurability: number; // 0-100%
}

interface ZoneCalculation {
  zoneId: string;
  ttk: number;
  shotsToKill: number;
  costToKill: number;
  penetrationChance: number;
  effectiveDamage: number;
}
```

## UI Layout

### Component Structure
```
[Combat Simulator Page]
├── Control Panel (Top)
│   ├── Display Mode Toggle
│   ├── Range Slider
│   ├── Sort Options
│   └── Add Attacker Button
│
├── Main Content Area
│   ├── Attacker Panel (Left)
│   │   └── AttackerSetup × 4
│   │
│   ├── Body Model (Center)
│   │   ├── 2D Figure
│   │   └── Zone Overlays
│   │
│   └── Defender Panel (Right)
│       ├── Armor Selection
│       └── Durability Sliders
│
└── Results Section (Bottom)
    ├── Summary Cards
    └── Detailed Graphs
```

### Visual Design

#### Armor Class Color Scheme
- **Unarmored**: Base tan (`bg-tan-200`)
- **Class 2 (Common)**: Gray (`bg-gray-700`, `text-gray-400`)
- **Class 3 (Uncommon)**: Green (`bg-olive-800`, `text-olive-400`)
- **Class 4 (Rare)**: Blue (`bg-blue-900`, `text-blue-400`)
- **Class 5 (Epic)**: Purple (`bg-purple-900`, `text-purple-400`)
- **Class 6 (Legendary)**: Yellow (`bg-yellow-900`, `text-yellow-400`)

#### Body Model Zones
- Clear zone boundaries with hover effects
- Armor class color fills with opacity
- Value overlays (TTK/STK/CTK) displayed on hover
- Hit probability indicators

## Core Calculations

### Damage Calculation
```typescript
function calculateEffectiveDamage(
  baseDamage: number,
  penetrationPower: number,
  armorClass: number,
  armorDurability: number,
  range: number
): {
  damage: number;
  penetrationChance: number;
} {
  // Apply range modifier
  const rangeDamage = applyRangeFalloff(baseDamage, range);
  
  // Calculate penetration chance based on armor
  const penetrationChance = calculatePenetrationChance(
    penetrationPower, 
    armorClass, 
    armorDurability
  );
  
  // Calculate damage reduction
  const damageReduction = calculateArmorReduction(
    armorClass, 
    penetrationChance
  );
  
  return {
    damage: rangeDamage * (1 - damageReduction),
    penetrationChance
  };
}
```

### Time to Kill (TTK)
```typescript
function calculateTTK(
  stk: number, //ShotsToKill
  fireRate: number
): number {
  return (stk - 1) * 60 / fireRate; //Ads is not applicable in VR, range - probably redundant too
}
```

### Damage Overflow
When a non-vital body part reaches 0 HP, excess damage is distributed:
```typescript
function calculateOverflowDamage(
  targetPart: BodyPart,
  damage: number,
  currentHP: number
): DamageDistribution {
  if (currentHP <= 0 && !targetPart.isVital) {
    // Distribute excess damage to all other parts
    const overflow = damage;
    const remainingParts = 6; // All parts except the destroyed one
    
    return {
      distributed: overflow / remainingParts,
      perPart: overflow / remainingParts
    };
  }
  
  return { distributed: 0, perPart: 0 };
}
```

## Implementation Plan

### Phase 1: Foundation (Days 1-3)
1. Create route structure `/combat-simulator`
2. Implement basic layout components
3. Create 2D body model with armor zones
4. Set up state management for simulation

### Phase 2: Core Features (Days 4-7)
1. Weapon/Ammo/Armor selectors with data integration
2. Damage calculation engine
3. TTK/STK/CTK calculators
4. Range-based modifications

### Phase 3: Visualization (Days 8-10)
1. Body model zone coloring and interactions
2. Display mode overlays
3. Multi-attacker comparison views
4. Summary statistics cards

### Phase 4: Polish & Optimization (Days 11-14)
1. Performance optimizations
2. Responsive design adjustments
3. Loading states and error handling
4. User experience refinements

## File Structure
```
src/app/combat-simulator/
├── page.tsx
├── components/
│   ├── ControlPanel.tsx
│   ├── AttackerSetup.tsx
│   ├── DefenderSetup.tsx
│   ├── BodyModel/
│   │   ├── BodyModel.tsx
│   │   ├── BodyZone.tsx
│   │   └── ZoneOverlay.tsx
│   ├── ResultsPanel/
│   │   ├── SummaryCards.tsx
│   │   └── DamageGraphs.tsx
│   └── Selectors/
│       ├── WeaponSelector.tsx
│       ├── AmmoSelector.tsx
│       └── ArmorSelector.tsx
├── utils/
│   ├── combat-calculations.ts
│   ├── body-zones.ts
│   ├── damage-formulas.ts
│   └── constants.ts
├── hooks/
│   ├── useCombatSimulation.ts
│   └── useBodyZones.ts
└── types/
    └── combat-simulator.ts
```

## Future Enhancements

### Post-MVP Features
1. **TTK Approximations**
   - Skill-based shooting patterns
   - Statistical hit distribution
   - Engagement range presets

2. **Advanced Mechanics**
   - Bleeding damage over time
   - Fragmentation calculations
   - Ricochet probability

3. **Additional Visualizations**
   - Recoil pattern comparison
   - Bullet trajectory paths
   - Armor degradation curves

4. **Export/Share Features**
   - Save loadout comparisons
   - Share simulation results
   - Generate comparison images

## Performance Considerations
- Debounce range slider updates
- Memoize expensive calculations
- Lazy load graph components
- Optimize body model rendering

## Accessibility
- Keyboard navigation for all controls
- Screen reader support for zone values
- High contrast mode support
- Clear visual indicators beyond color

## VR Browser Optimization
- Large touch targets (minimum 48px)
- Clear visual feedback
- Simplified interactions
- Performance-first rendering
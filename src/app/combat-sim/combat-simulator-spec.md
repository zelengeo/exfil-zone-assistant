# Combat Simulator Specification v2

## Overview
The Combat Simulator analyzes weapon effectiveness against armored targets using datamined game parameters. The system models penetration mechanics, armor degradation, and damage calculations based on real game data.

## Current Implementation Status

### Working Features
- Multi-attacker comparison (up to 4 loadouts)
- Interactive body model with armor zones
- Range-based damage/penetration falloff
- Basic TTK/STK/CTK calculations
- Armor degradation simulation

### Known Issues
1. **Penetration Damage Scalar Curve Interpretation**
   - X-axis interpretation unclear (ratio vs armor class)
   - Current implementation uses normalized armor class mapping
   - In-game results don't match calculations

2. **Armor Damage Calculations**
   - `protectionGearPenetratedDamageScale` values seem incorrect
   - High-pen ammo does more armor damage than expected, however in context of STK computing it is neglectable
   - Durability damage scalar application inconsistent

3. **Deterministic vs Probabilistic**
   - Currently using deterministic average damage
   - Missing probability distribution for STK

## Data Structure

### Ammunition Parameters
```typescript
interface AmmoProperties {
   // Core stats
   damage: number;                    // Base damage to health
   penetration: number;               // Armor penetration power (1-7 range)
   caliber: string;                   // Weapon compatibility

   // Damage modifiers
   bluntDamageScale: number;          // 0.08-0.15 typical
   bleedingChance: number;            // 0-1 probability

   // Armor interaction scalars
   protectionGearPenetratedDamageScale: number;  // Issue: should be ~1.9 for high-pen?
   protectionGearBluntDamageScale: number;       // 0.8-0.9 typical

   // Range data
   damageAtRange: {
      '60m': number,
      '120m': number,
      '240m': number,
      '480m': number
   };
   // Penetration data
   penetrationAtRange: {
      '60m': number,
      '120m': number,
      '240m': number,
      '480m': number
   };

   // Ballistic curves (x-axis in cm, y-axis damage/pen)
   ballisticCurves: {
      damageOverDistance: BallisticCurvePoint[];
      penetrationPowerOverDistance: BallisticCurvePoint[];
   };
}
```

### Armor Parameters
```typescript
interface ArmorProperties {
   // Core stats
   armorClass: number;               // 2-6 protection level
   maxDurability: number;            // Maximum durability points
   currentDurability: number;        // Current state

   // Damage modifiers
   durabilityDamageScalar: number;   // 0.25-0.7 (lower = lasts longer)
   bluntDamageScalar: number;        // 0.6-0.9 (lower = better protection)

   // Zone-specific protection
   protectiveData: Array<{
      bodyPart: string;              // "spine_01", "pelvis", etc.
      armorClass: number;            // Can differ from base
      bluntDamageScalar: number;     // Zone-specific
      protectionAngle: number;       // Not implemented yet
   }>;

   // Penetration curves
   penetrationChanceCurve: BallisticCurvePoint[];         // X: pen/armor ratio, Y: chance
   penetrationDamageScalarCurve: BallisticCurvePoint[];   // X: unclear, Y: damage mult
   antiPenetrationDurabilityScalarCurve: BallisticCurvePoint[]; // X: durability %, Y: effectiveness
}
```

## Damage Calculation Algorithm

### Current Implementation
```typescript
// 1. Apply range modifiers
rangeDamage = interpolate(ammo.ballisticCurves.damageOverDistance, range)
rangePenetration = interpolate(ammo.ballisticCurves.penetrationPowerOverDistance, range)

// 2. Calculate armor effectiveness
durabilityPercent = currentDurability / maxDurability
armorEffectiveness = interpolate(armor.antiPenetrationDurabilityScalarCurve, durabilityPercent)
effectiveArmorClass = armor.armorClass * armorEffectiveness

// 3. Penetration chance
penetrationChance = interpolate(armor.penetrationChanceCurve, rangePenetration / effectiveArmorClass)

// 4. Damage calculation
if (penetrating) {
   // Issue: How to interpret penetrationDamageScalarCurve x-axis?
   damageScalar = interpolate(armor.penetrationDamageScalarCurve, ???)
   bodyDamage = rangeDamage * damageScalar
   armorDamage = rangeDamage * ammo.protectionGearPenetratedDamageScale * armor.durabilityDamageScalar
} else {
   bodyDamage = rangeDamage * ammo.bluntDamageScale * armor.bluntDamageScalar
   armorDamage = rangeDamage * ammo.protectionGearBluntDamageScale * armor.durabilityDamageScalar
}
```

### Proposed Fixes

#### 1. Penetration Damage Scalar Curve
```typescript
// Option A: Use penetration difference, in game data does not agree - overpen still falls under second element of curve value. 
const penDifference = rangePenetration - effectiveArmorClass;
damageScalar = interpolate(curve, penDifference);

// Option B: Use armor class directly, but can't see how it can work - curve distribution is from -1 to 2
const normalizedValue = (armorClass - 3) / 2; // Maps AC 0-6 to -1.5 to 1.5
damageScalar = interpolate(curve, normalizedValue);

// Option C: Use raw armor class - -1 armor class - what is it
damageScalar = interpolate(curve, armorClass);
```

#### 2. Armor Damage Formula
```typescript
// Current observation from testing:
// Penetrating shots: ~10x less armor damage than expected
// Non-penetrating: ~30% less than expected

// Proposed adjustment factors:
const PEN_ARMOR_DAMAGE_MULT = 10;    // Multiply penetrating armor damage
const NONPEN_ARMOR_DAMAGE_MULT = 1.3; // Multiply non-pen armor damage

if (penetrating) {
   armorDamage = rangeDamage * ammo.protectionGearPenetratedDamageScale *
           armor.durabilityDamageScalar * PEN_ARMOR_DAMAGE_MULT;
} else {
   armorDamage = rangeDamage * ammo.protectionGearBluntDamageScale *
           armor.durabilityDamageScalar * NONPEN_ARMOR_DAMAGE_MULT;
}
```

## Body Zone System

### Zone Mapping
```typescript
// Game data uses these zone IDs in armor.protectiveData:
const ARMOR_ZONE_MAPPING = {
   // Chest protection
   "spine_01": "Upper Chest",     // Upper chest area
   "spine_02": "Lower Chest",     // Lower chest area

   // Stomach protection  
   "spine_03": "Upper Stomach",   // Upper stomach area
   "pelvis": "Pelvis",           // Lower stomach/pelvis

   // Limb protection (some armors)
   "UpperArm_L": "Left Upper Arm",
   "UpperArm_R": "Right Upper Arm",
   "Thigh_L": "Left Thigh",
   "Thigh_R": "Right Thigh"
};

// Body parts (actual HP pools)
const BODY_PARTS = {
   head: { hp: 35, vital: true },
   chest: { hp: 85, vital: true },    // Protected by spine_01, spine_02
   stomach: { hp: 70, vital: false },  // Protected by spine_03, pelvis
   left_arm: { hp: 60, vital: false },
   right_arm: { hp: 60, vital: false },
   left_leg: { hp: 65, vital: false },
   right_leg: { hp: 65, vital: false }
};
```

## Testing & Validation

### Test Helper Usage
```javascript
// Console command for testing single shot damage
testShotDamage('armor-6b17', 'spine_01', 'ammo-556x45-m995')

// Expected output format:
// - Penetration rate
// - Average damage to body (pen/non-pen)
// - Average damage to armor (pen/non-pen)
// - Debug curve values
```

### Validation Checklist
1. [ ] M995 vs Class 4 armor penetration rate matches in-game
2. [ ] Armor durability loss per shot matches in-game
3. [ ] TTK calculations align with game experience
4. [ ] Range falloff curves produce expected results
5. [ ] Zone-specific armor class is properly applied

## Implementation Priorities

### Phase 1: Fix Core Calculations
1. Determine correct `penetrationDamageScalarCurve` interpretation
2. Adjust armor damage multipliers to match game
3. Implement probabilistic shot distribution

### Phase 2: Add Missing Features
1. Protection angle implementation
2. Fragmentation chance calculations
3. Bleed damage over time
4. Ricochet probability

### Phase 3: UI Improvements
1. Probability distribution visualization
2. Armor degradation timeline
3. Shot-by-shot breakdown view
4. Confidence intervals for STK

## Data Collection Needs

### Priority Testing
1. **Penetration Damage Scalar**: Test multiple ammo/armor combinations to determine x-axis
2. **Armor Damage Values**: Verify actual durability loss per shot in-game
3. **Edge Cases**: Test 0% durability behavior, overpenetration scenarios

### Recording Template
```
Test: [Ammo] vs [Armor] at [Range]m
- Shots to kill: X
- Armor durability after shot 1: Y%
- Damage dealt (if visible): Z
- Penetration indicator: Yes/No
```

## Known Limitations

1. **Bolt Action/Pump Weapons**: Fire rate calculation needs adjustment
2. **Burst Fire**: Not modeled in current system
3. **Damage Overflow**: Simplified distribution model
4. **Environmental Factors**: No cover/angle calculations

## Future Enhancements

### Statistical Modeling
- Monte Carlo simulation for STK distribution
- Confidence intervals
- Hit probability based on weapon accuracy

### Advanced Mechanics
- Armor coverage gaps
- Plate hitboxes
- Ricochet angles
- Material penetration
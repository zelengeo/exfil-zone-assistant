# Public Data Documentation

## Documentation Hierarchy

**Parent:** This is a top-level documentation file (no parent)
**Root:** [Root CLAUDE.md](../../CLAUDE.md) - Project overview
**Index:** [CLAUDE-INDEX.md](../../CLAUDE-INDEX.md) - Complete navigation

**Related Documentation:**
- [Services](../../src/services/CLAUDE.md) - Data access layer for JSON files
- [Types](../../src/types/CLAUDE.md) - Type definitions for data structures
- [App Router](../../src/app/CLAUDE.md) - Pages consuming this data
- [Components](../../src/components/CLAUDE.md) - Components displaying data

**See Also:**
- For data fetching patterns, see [Services CLAUDE.md](../../src/services/CLAUDE.md)
- For item type definitions, see [Types CLAUDE.md](../../src/types/CLAUDE.md) - Items Types
- For using data in pages, see [App CLAUDE.md](../../src/app/CLAUDE.md) - Data Fetching

---

## Overview

This directory contains all game data for the ExfilZone Assistant application in JSON format. Data includes weapons, ammunition, armor, equipment, tasks, and other game content served statically to the client.

---

## Directory Structure

```
data/
├── weapons.json                   # All weapons with stats
├── ammunition.json                # Ammunition types and ballistics
├── armor.json                     # Body armor with protection data
├── helmets.json                   # Helmets with armor ratings
├── face-shields.json              # Face shield attachments
├── attachments.json               # Weapon attachments/mods
├── magazines.json                 # Magazines and loaders
├── backpacks.json                 # Storage containers
├── holsters.json                  # Holster equipment
├── medical.json                   # Medical items and consumables
├── provisions.json                # Food and drink items
├── grenades.json                  # Throwable items
├── keys.json                      # Keys and key cards
├── misc.json                      # Miscellaneous items
├── task-items.json                # Quest-specific items
├── combat-sim-test-data.json     # Combat simulator test scenarios
├── extracted_*.json               # Source data (for conversion)
└── *_convert_script.js            # Data conversion utilities
```

---

## Data Categories

### 1. Weapons (`weapons.json`)

**Count:** ~40-60 weapons
**Schema:**

```typescript
interface Weapon {
    id: string;                    // Unique identifier (e.g., "weapon-ak74")
    name: string;                  // Display name
    description: string;           // Item description
    category: "weapons";
    subcategory: string;           // Caliber (e.g., "5.45x39mm", "9x19mm")

    images: {
        icon: string;              // Icon path (webp)
        thumbnail: string;         // Thumbnail path
        fullsize: string;          // Full-size image path
    };

    stats: {
        rarity: Rarity;            // "Common" | "Rare" | "Epic" | "Legendary" | "Ultimate"
        price: number;             // In-game currency value
        weight: number;            // Weight in kg
        penetration: number;       // Armor penetration modifier
        fireRate: number;          // Rounds per minute
        fireMode: string;          // "fullAuto" | "semiAuto" | "burst"
        MOA: number;               // Accuracy (minutes of angle)
        ADSSpeed: number;          // Aim down sights speed
        ergonomics: number;        // Handling stat (0-1)

        recoilParameters: {
            shiftMomentum: number;
            pitchBaseMomentum: number;
            yawBaseMomentum: number;
            shiftStiffness: number;
            pitchStiffness: number;
            yawStiffness: number;
            rollStiffness: number;
            pitchDamping: number;
            yawDamping: number;
            rollDamping: number;
            pitchMass: number;
            yawMass: number;
            rollMass: number;
            oneHandedADSMultiplier: number;
            verticalRecoilControl: number;
            horizontalRecoilControl: number;
        };

        firingPower: number;       // Weapon power stat
        damageRangeCurve: string;  // "RifleDOD" | "PistolDOD" | etc.
        caliber: string;           // Ammunition caliber
    };

    locations?: Array<{            // Spawn locations (optional)
        map: string;
        spots: Array<{ x: number; y: number }>;
    }>;
}

type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Ultimate";
```

**Key Relationships:**
- `stats.caliber` links to ammunition subcategory
- `id` used for weapon selection in combat simulator
- Images reference `/images/items/weapons/` directory

---

### 2. Ammunition (`ammunition.json`)

**Count:** ~80-100 ammo types
**Schema:**

```typescript
interface Ammunition {
    id: string;                    // Unique identifier (e.g., "ammo-556x45-apv2")
    name: string;                  // Display name
    description: string;           // Ammo characteristics
    category: "ammo";
    subcategory: string;           // Caliber (e.g., "5.56x45mm")

    images: {
        icon: string;
        thumbnail: string;
        fullsize: string;
    };

    stats: {
        rarity: Rarity;
        price: number;
        weight: number;            // Per round weight (kg)
        damage: number;            // Base damage
        penetration: number;       // Armor penetration value
        muzzleVelocity: number;    // cm/s (multiply by 0.01 for m/s)
        bleedingChance: number;    // 0-1 probability
        bluntDamageScale: number;  // Damage through armor multiplier
        protectionGearPenetratedDamageScale: number;  // Damage after pen
        protectionGearBluntDamageScale: number;       // Blunt damage scale
        caliber: string;           // Caliber type

        damageAtRange: {           // Damage falloff by distance
            "60m": number;
            "120m": number;
            "240m": number;
            "480m": number;
        };
    };
}
```

**Key Relationships:**
- `stats.caliber` matches weapon `stats.caliber`
- Used in combat simulator for damage calculations
- Penetration value compared against armor class

---

### 3. Armor (`armor.json`)

**Count:** ~30-50 vests
**Schema:**

```typescript
interface Armor {
    id: string;                    // Unique identifier (e.g., "armor-6b17")
    name: string;
    description: string;
    category: "gear";
    subcategory: "Body Armor";

    images: {
        icon: string;
        thumbnail: string;
        fullsize: string;
    };

    stats: {
        rarity: Rarity;
        price: number;
        weight: number;
        armorClass: number;        // 1-6 (6 is highest protection)
        maxDurability: number;     // Hit points
        durabilityDamageScalar: number;  // Damage to durability multiplier
        bluntDamageScalar: number;       // Blunt damage multiplier

        protectiveData: Array<{    // Per-body-part protection
            bodyPart: string;      // "spine_03", "spine_02", etc.
            armorClass: number;    // Class for this body part
            bluntDamageScalar: number;
            protectionAngle: number;  // Coverage angle (degrees)
        }>;

        containedPockets?: number; // Storage slots (optional)
        storageGridSize?: {        // Inventory grid (optional)
            x: number;
            y: number;
        };
    };

    locations?: Array<{            // Spawn locations
        map: string;
        spots: Array<{ x: number; y: number }>;
    }>;
}
```

**Key Relationships:**
- `armorClass` compared against ammo `penetration`
- Body parts map to hitbox system
- Used in combat simulator for damage mitigation

---

### 4. Helmets (`helmets.json`)

**Count:** ~20-30 helmets
**Schema:**

```typescript
interface Helmet {
    id: string;
    name: string;
    description: string;
    category: "gear";
    subcategory: "Helmets";

    images: {
        icon: string;
        thumbnail: string;
        fullsize: string;
    };

    stats: {
        rarity: Rarity;
        price: number;
        weight: number;
        armorClass: number;
        maxDurability: number;
        durabilityDamageScalar: number;
        bluntDamageScalar: number;

        protectiveData: Array<{
            bodyPart: string;      // "head", "neck", etc.
            armorClass: number;
            bluntDamageScalar: number;
            protectionAngle: number;
            ricochetChance: number;  // Helmet-specific stat
        }>;

        faceShieldCompatibility?: string[];  // Compatible face shields
        headsetCompatibility?: boolean;      // Can wear with headset
    };
}
```

**Key Relationships:**
- `faceShieldCompatibility` links to face-shields.json IDs
- Protects head hitbox
- `ricochetChance` unique to helmets

---

### 5. Attachments (`attachments.json`)

**Count:** ~150-250 mods
**Schema:**

```typescript
interface Attachment {
    id: string;
    name: string;
    description: string;
    category: "attachments";
    subcategory: string;           // "Scopes", "Grips", "Muzzle", "Magazines"

    images: {
        icon: string;
        thumbnail: string;
        fullsize: string;
    };

    stats: {
        rarity: Rarity;
        price: number;
        weight: number;

        // Modifiers (all optional)
        ergonomicsModifier?: number;
        recoilModifier?: number;
        accuracyModifier?: number;
        muzzleVelocityModifier?: number;
        rangeModifier?: number;

        // Scope-specific
        magnification?: number;
        zoomLevels?: number[];

        // Magazine-specific
        capacity?: number;
        caliber?: string;
    };

    compatibility: {
        weaponTypes?: string[];    // Compatible weapon types
        calibers?: string[];       // Compatible calibers
        attachmentSlots?: string[]; // Mount types
    };
}
```

**Key Relationships:**
- `compatibility.calibers` matches weapon/magazine calibers
- Modifiers affect weapon stats
- Magazines link to ammunition by caliber

---

### 6. Medical Items (`medical.json`)

**Count:** ~15-25 items
**Schema:**

```typescript
interface Medical {
    id: string;
    name: string;
    description: string;
    category: "medical";
    subcategory: string;           // "Healing", "Surgery", "Stimulants"

    images: {
        icon: string;
        thumbnail: string;
        fullsize: string;
    };

    stats: {
        rarity: Rarity;
        price: number;
        weight: number;

        healingAmount?: number;
        usageTime: number;         // Seconds
        uses: number;              // Number of applications

        effects: {
            healsBleeding?: boolean;
            healsFractures?: boolean;
            healsLightBleeding?: boolean;
            healsHeavyBleeding?: boolean;
            restoresHp?: number;
            buffDuration?: number;  // Seconds
            buffEffects?: {
                damageResistance?: number;
                painKiller?: boolean;
                energyBoost?: number;
                hydrationBoost?: number;
            };
        };
    };
}
```

---

### 7. Provisions (`provisions.json`)

**Count:** ~20-30 items
**Schema:**

```typescript
interface Provision {
    id: string;
    name: string;
    description: string;
    category: "provisions";
    subcategory: "Food" | "Drink";

    images: {
        icon: string;
        thumbnail: string;
        fullsize: string;
    };

    stats: {
        rarity: Rarity;
        price: number;
        weight: number;

        energyRestoration: number;     // Food stat
        hydrationRestoration: number;  // Drink stat
        usageTime: number;            // Consumption time (seconds)

        effects?: {
            healthRegeneration?: number;
            staminaBoost?: number;
            debuffs?: string[];       // Negative effects
        };
    };
}
```

---

### 8. Task Items (`task-items.json`)

**Count:** ~30-50 items
**Schema:**

```typescript
interface TaskItem {
    id: string;
    name: string;
    description: string;
    category: "quest";
    subcategory: "Task Items";

    images: {
        icon: string;
        thumbnail: string;
        fullsize: string;
    };

    stats: {
        rarity: Rarity;
        price: number;             // Usually 0 or low
        weight: number;
    };

    relatedTasks: string[];        // Task IDs that require this item

    locations?: Array<{
        map: string;
        area: string;
        description: string;
    }>;
}
```

**Key Relationships:**
- `relatedTasks` links to task system
- Quest objectives reference these IDs
- Locations guide players to spawns

---

## Common Data Patterns

### Universal Item Structure
All items share these base fields:

```typescript
interface BaseItem {
    id: string;                    // Always prefixed: "weapon-", "ammo-", "armor-"
    name: string;                  // Human-readable name
    description: string;           // 1-2 sentence description
    category: string;              // Top-level category
    subcategory: string;           // Secondary classification

    images: {
        icon: string;              // Always webp format
        thumbnail: string;         // Usually same as icon
        fullsize: string;          // Higher resolution version
    };

    stats: {
        rarity: Rarity;            // Always present
        price: number;             // In-game value
        weight: number;            // Physical weight (kg)
        // ... category-specific stats
    };
}
```

### Image Path Convention
```
/images/items/{category}/{filename}.webp

Examples:
/images/items/weapons/Icon_gun_ak74.webp
/images/items/ammo/556X45_AP.webp
/images/items/armor/Icon_SKM_Vest_013_02_Ck.webp
```

### ID Naming Convention
```
{category}-{name-slug}

Examples:
weapon-ak74
ammo-556x45-apv2
armor-6b17
helmet-fast-mt
attachment-kobra-sight
```

---

## Data Relationships

### Weapon → Ammunition → Armor Chain

```
Weapon
  ├─ stats.caliber: "5.56x45"
  └─ Used with →

Ammunition
  ├─ stats.caliber: "5.56x45"     (matches weapon)
  ├─ stats.damage: 39
  ├─ stats.penetration: 5.8
  └─ Attacks →

Armor
  ├─ stats.armorClass: 4          (compared with penetration)
  ├─ stats.bluntDamageScalar: 0.7
  └─ If pen > class → full damage
     If pen ≤ class → blunt damage only
```

### Attachment Compatibility

```
Weapon
  └─ stats.caliber: "5.56x45"

Magazine Attachment
  ├─ stats.caliber: "5.56x45"     (must match)
  └─ stats.capacity: 30

Optic Attachment
  └─ compatibility.weaponTypes: ["rifle"]  (must include weapon type)
```

---

## Data Update Workflow

### 1. Source Data Extraction
```javascript
// Extract from game files (if available)
// Output to: extracted_*_data.json
{
    "rawData": [...],
    "extractionDate": "2025-10-08",
    "gameVersion": "1.2.3"
}
```

### 2. Data Conversion
```javascript
// Use: *_convert_script.js
// Input: extracted_*_data.json
// Output: {category}.json (production format)

node public/data/extracted_food_data_convert_script.js
```

### 3. Schema Validation
Before committing updates:

```typescript
// Validate against Zod schema
import { WeaponSchema } from '@/types/items';

const data = require('./weapons.json');
data.forEach(item => WeaponSchema.parse(item));
```

### 4. Service Layer Integration
```typescript
// Services automatically load updated data
import ItemService from '@/services/ItemService';

// No code changes needed - JSON reloaded on next request
const weapons = await ItemService.getWeapons();
```

---

## Data Maintenance Best Practices

### Adding New Items

1. **Determine Category**
   - Weapons, ammo, armor, etc.

2. **Create Unique ID**
   ```typescript
   const id = `${category}-${slugify(itemName)}`;
   // Example: "weapon-m4a1" or "ammo-762x51-m80"
   ```

3. **Prepare Images**
   - Convert to webp format
   - Place in `/images/items/{category}/`
   - 256x256px for icons
   - Higher res for fullsize

4. **Fill Required Fields**
   - All base fields (id, name, description, category, subcategory)
   - All images paths
   - All stats.rarity, price, weight
   - Category-specific stats

5. **Set Relationships**
   - Caliber matches (weapons ↔ ammo ↔ magazines)
   - Compatibility lists
   - Related tasks (if applicable)

6. **Validate**
   ```bash
   # Check JSON syntax
   cat weapons.json | jq . > /dev/null

   # Test in development
   npm run dev
   # Navigate to items list
   ```

### Updating Existing Items

```javascript
// ✅ DO: Edit specific fields
{
    "id": "weapon-ak74",
    "stats": {
        "price": 60000,  // Updated value
        // ... other unchanged fields
    }
}

// ❌ DON'T: Change IDs of existing items
// This breaks references and user data
{
    "id": "weapon-ak74-new",  // ❌ Breaking change
}

// ❌ DON'T: Remove required fields
{
    "stats": {
        // "price": 60000,  // ❌ Missing required field
    }
}
```

### Balancing Updates

When updating game balance:

```javascript
// Document changes in git commit
// Example commit message:
// "Update weapon balance: AK-74 price 58k→60k, reduced recoil"

// Consider:
// 1. Price adjustments (±10-20%)
// 2. Stat tweaks (ergonomics, recoil)
// 3. Armor class changes (major impact!)
// 4. Penetration values (major impact!)
// 5. Damage falloff curves
```

---

## Data Loading Patterns

### Static Import (Build Time)
```typescript
// In Server Components
import weaponsData from '@/data/weapons.json';

export default async function WeaponsPage() {
    const weapons = weaponsData;
    // Data bundled at build time
}
```

### Service Layer (Recommended)
```typescript
// Use service abstraction
import ItemService from '@/services/ItemService';

const weapons = await ItemService.getWeapons();
const ammo = await ItemService.getAmmoForCaliber('5.56x45');
```

### Dynamic Import (Client)
```typescript
'use client';
import { useEffect, useState } from 'react';

export function ItemsList() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch('/data/weapons.json')
            .then(res => res.json())
            .then(setItems);
    }, []);
}
```

---

## Performance Considerations

### File Sizes
- **Small:** < 20 KB (keys, holsters, backpacks)
- **Medium:** 20-100 KB (armor, medical, provisions)
- **Large:** > 100 KB (weapons, ammunition, attachments)

### Optimization Strategies

1. **Image Optimization**
   ```bash
   # Convert PNG to WebP
   cwebp -q 80 input.png -o output.webp
   ```

2. **JSON Minification**
   ```bash
   # Production build auto-minifies
   # For manual: jq -c . input.json > output.json
   ```

3. **Lazy Loading**
   ```typescript
   // Load large datasets on-demand
   const combatData = await import('@/data/combat-sim-test-data.json');
   ```

4. **Data Splitting**
   ```typescript
   // Split large files by subcategory if needed
   // weapons.json → rifles.json + pistols.json + etc.
   ```

---

## Testing Data Changes

### 1. JSON Validation
```bash
# Syntax check
jq . public/data/weapons.json

# Schema validation (if using ajv or similar)
npm run validate-data
```

### 2. Visual Verification
```typescript
// Check in development
npm run dev
// Navigate to:
// /items - View all items
// /items/[category] - Filter by category
// /items/[id] - View single item
```

### 3. Combat Simulator Testing
```typescript
// Load in combat sim
// /combat-sim
// Select weapon + ammo + armor
// Verify calculations use new data
```

### 4. Search Testing
```typescript
// Test search indexes updated
// Search for new item name
// Filter by new categories
```

---

## Common Issues & Solutions

### Issue: Item Not Appearing

**Causes:**
- JSON syntax error
- Missing required field
- Incorrect ID format
- Image path broken

**Debug:**
```bash
# 1. Validate JSON
jq . public/data/weapons.json

# 2. Check server logs
npm run dev
# Look for parsing errors

# 3. Verify image exists
ls public/images/items/weapons/Icon_gun_*.webp
```

### Issue: Incorrect Stats in Combat Sim

**Causes:**
- Typo in caliber field (breaks weapon-ammo link)
- Missing stat field (uses default value)
- Wrong data type (string instead of number)

**Fix:**
```typescript
// Check caliber consistency
weapons.json: "caliber": "5.56x45"
ammunition.json: "caliber": "5.56x45"  // Must match exactly

// Check data types
"damage": 39,        // ✅ number
"damage": "39",      // ❌ string (breaks calculations)
```

### Issue: Slow Page Load

**Causes:**
- Loading all data at once
- Unoptimized images
- No data caching

**Fix:**
```typescript
// 1. Use service layer (has caching)
import ItemService from '@/services/ItemService';

// 2. Lazy load categories
const weapons = await ItemService.getItemsByCategory('weapons');

// 3. Optimize images
// Convert to webp, reduce resolution
```

---

## Data Files Reference

| File | Items | Size | Update Freq | Dependencies |
|------|-------|------|-------------|--------------|
| `weapons.json` | ~50 | ~118KB | Weekly | ammunition (caliber) |
| `ammunition.json` | ~100 | ~113KB | Weekly | weapons (caliber) |
| `armor.json` | ~40 | ~93KB | Bi-weekly | None |
| `helmets.json` | ~25 | ~95KB | Bi-weekly | face-shields (compat) |
| `attachments.json` | ~200 | ~104KB | Monthly | weapons (compat) |
| `magazines.json` | ~60 | ~51KB | Monthly | ammo (caliber) |
| `medical.json` | ~20 | ~13KB | Monthly | None |
| `provisions.json` | ~25 | ~10KB | Monthly | None |
| `task-items.json` | ~40 | ~23KB | As needed | tasks (external) |
| `grenades.json` | ~15 | ~35KB | Monthly | None |
| `keys.json` | ~30 | ~17KB | As needed | None |
| `misc.json` | ~100 | ~88KB | As needed | None |
| `backpacks.json` | ~10 | ~8KB | Rarely | None |
| `holsters.json` | ~5 | ~4KB | Rarely | None |
| `face-shields.json` | ~15 | ~21KB | Rarely | helmets (parent) |

---

## DO's and DON'Ts

### DO's ✅
- Validate JSON syntax before committing
- Use consistent ID naming (`category-slug`)
- Optimize images to webp format
- Document major balance changes
- Test in combat simulator after updates
- Use service layer for data access
- Maintain caliber consistency across files
- Include all required fields
- Add descriptive commit messages

### DON'Ts ❌
- Don't change IDs of existing items
- Don't use different caliber spelling (5.56 vs 5.56x45)
- Don't commit syntax errors
- Don't skip image optimization
- Don't update data without testing
- Don't remove required fields
- Don't use inconsistent rarity values
- Don't forget to update related files (weapon ↔ ammo)
- Don't commit extraction source files to production
- Don't hardcode data in components (use services)

---

**Last Updated:** 2025-10-08
**Data Version:** Compatible with game version 1.2.x
**Next Review:** When game receives major content update

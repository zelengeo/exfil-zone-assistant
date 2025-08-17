# TypeScript Type Definitions Guidelines

## Directory Structure
```
types/
├── items.ts           # Game items (weapons, armor, etc.)
├── tasks.ts           # Quest/task system types
├── guides.ts          # Guide content types
├── next-auth.d.ts     # NextAuth session augmentation
├── global.d.ts        # Global type declarations
└── [feature].ts       # Feature-specific types
```

## Core Type Files

### Items Types (`items.ts`)
The most complex type system - defines all game items with proper inheritance hierarchy.

```typescript
// Base item interface - all items inherit from this
export interface Item {
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    images: {
        icon: string;
        thumbnail: string;
        fullsize: string;
    };
    stats: {
        rarity: ItemRarity;
        price: number;
        weight: number;
    };
    notes?: string;
    tips?: string;
}

// Category-specific interfaces extend base
export interface Weapon extends Item {
    category: 'weapons';
    subcategory: WeaponSubcategory;
    stats: Item['stats'] & WeaponProperties;
}

export interface Ammunition extends Item {
    category: 'ammo';
    stats: Item['stats'] & AmmoProperties;
}

// Properties interfaces for complex stats
export interface AmmoProperties {
    damage: number;
    penetration: number;
    caliber: Caliber;
    // Ballistic curves for damage calculations
    ballisticCurves: {
        damageOverDistance: CurvePoint[];
        penetrationPowerOverDistance: CurvePoint[];
    };
}
```

**Type Hierarchy:**
```
Item
├── Weapon (rifles, pistols, etc.)
├── Gear
│   ├── Armor
│   │   ├── BodyArmor
│   │   ├── Helmet
│   │   └── FaceShield
│   └── Backpack
├── Ammunition
├── Attachment
│   ├── Magazine
│   ├── Sight
│   ├── Suppressor
│   └── [other attachments]
├── Medicine
│   ├── Bandage
│   ├── Painkiller
│   └── [other meds]
├── Provisions
│   ├── Food
│   └── Drink
├── TaskItem
├── Keys
└── Misc
```

### Task Types (`tasks.ts`)
Quest and progression system types.

```typescript
export interface Task {
    id: string;
    name: string;
    gameId: string;
    description: string;
    objectives: string[];
    corpId: string;
    type: TaskType[];
    map: TaskMap[];
    reward: TaskReward[];
    requiredTasks: string[];
    requiredLevel: number;
    tips: string;
    videoGuides: TaskVideoGuide[];
}

export interface TaskReward {
    type: 'money' | 'reputation' | 'experience' | 'item';
    quantity: number;
    corpId?: string;        // For reputation
    item_id?: string;       // For items
}

export type TaskType = 
    | 'reach' 
    | 'extract' 
    | 'retrieve' 
    | 'eliminate' 
    | 'submit' 
    | 'mark' 
    | 'place' 
    | 'photo';

export type TaskStatus = 'completed' | 'active' | 'locked';
```

### Guide Types (`guides.ts`)
Content management types for guides.

```typescript
export interface GuideMetadata {
    slug: string;
    title: string;
    description: string;
    tags: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    readTime?: string;
    author?: string;
    publishedAt: string;
    updatedAt?: string;
    featured?: boolean;
    contentType: 'component' | 'markdown';
}

export interface GuideTag {
    id: string;
    name: string;
    description: string;
    color: string;      // For UI styling
    icon: string;       // Lucide icon name
}
```

## Type Patterns and Best Practices

### Union Types for Categories
```typescript
// Use string literal unions for fixed sets
export type ItemCategory = 
    | 'weapons'
    | 'gear'
    | 'ammo'
    | 'medicine'
    | 'provisions'
    | 'attachments'
    | 'grenades'
    | 'task-items'
    | 'keys'
    | 'misc';

// Avoid enums - use const objects with as const
export const TASK_TYPES = {
    REACH: 'reach',
    EXTRACT: 'extract',
    RETRIEVE: 'retrieve',
} as const;

export type TaskType = typeof TASK_TYPES[keyof typeof TASK_TYPES];
```

### Discriminated Unions
```typescript
// Use discriminated unions for type safety
export type AnyItem =
    | Weapon        // category: 'weapons'
    | Armor         // category: 'gear', subcategory: armor types
    | Ammunition    // category: 'ammo'
    | Medicine      // category: 'medicine'
    // ... etc

// Type guards for runtime checks
export function isWeapon(item: Item): item is Weapon {
    return item.category === 'weapons';
}

export function isAmmunition(item: Item): item is Ammunition {
    return item.category === 'ammo';
}
```

### Extending Base Interfaces
```typescript
// Base interface with common properties
interface BaseStats {
    weight: number;
    price: number;
    rarity: Rarity;
}

// Extend with intersection types
export interface WeaponProperties extends BaseStats {
    damage: number;
    fireRate: number;
    caliber: Caliber;
    // weapon-specific properties
}

// Use intersection for combining
export interface Weapon extends Item {
    stats: Item['stats'] & WeaponProperties;
}
```

### Optional vs Required Properties
```typescript
// Mark optional properties explicitly
export interface ItemFilters {
    category?: ItemCategory;      // Optional filter
    subcategory?: string;         // Optional filter
    search: string;               // Required
    minPrice?: number;            // Optional
    maxPrice?: number;            // Optional
}

// Use Partial for all-optional versions
export type ItemFiltersUpdate = Partial<ItemFilters>;

// Use Required for all-required versions
export type ItemFiltersComplete = Required<ItemFilters>;
```

### Type Utilities
```typescript
// Extract specific types from unions
export type WeaponSubcategories = Extract<AnyItem, { category: 'weapons' }>['subcategory'];

// Omit properties for DTOs
export type ItemDTO = Omit<Item, 'search' | 'internal'>;

// Pick specific properties
export type ItemPreview = Pick<Item, 'id' | 'name' | 'images'>;

// Readonly for immutable data
export type ReadonlyItem = Readonly<Item>;
```

## NextAuth Type Augmentation

### Session Types (`next-auth.d.ts`)
```typescript
import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
            username?: string;
            roles?: string[];
            isBanned?: boolean;
        };
    }
    
    interface User {
        id: string;
        username?: string;
        roles?: string[];
        isBanned?: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        username?: string;
        roles?: string[];
        isBanned?: boolean;
    }
}
```

## Global Type Declarations

### Environment Variables (`global.d.ts`)
```typescript
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Auth
            NEXTAUTH_URL: string;
            NEXTAUTH_SECRET: string;
            
            // OAuth Providers
            DISCORD_CLIENT_ID: string;
            DISCORD_CLIENT_SECRET: string;
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            
            // Database
            MONGODB_URI: string;
            
            // Features
            NODE_ENV: 'development' | 'production' | 'test';
        }
    }
}

export {};
```

## Type Safety Guidelines

### DO's ✅
- Use TypeScript strict mode
- Define explicit return types for functions
- Use type guards for runtime validation
- Prefer interfaces over type aliases for objects
- Use discriminated unions for variants
- Export type guards alongside types
- Document complex types with JSDoc

### DON'ts ❌
- Don't use `any` - use `unknown` if type is truly unknown
- Don't use `Function` type - define specific signatures
- Don't use `object` - be specific about shape
- Don't use `Number`, `String`, `Boolean` - use primitives
- Don't forget to handle `null` and `undefined`
- Don't create unnecessary type assertions
- Don't duplicate type definitions

## Common Type Patterns

### API Response Types
```typescript
// Success response
export interface ApiResponse<T> {
    success: true;
    data: T;
    message?: string;
}

// Error response
export interface ApiError {
    success: false;
    error: string;
    code?: string;
    details?: unknown;
}

// Combined response type
export type ApiResult<T> = ApiResponse<T> | ApiError;
```

### Form/Input Types
```typescript
// Form data types
export interface ItemFormData {
    name: string;
    category: ItemCategory;
    price: number;
    description?: string;
}

// Validation types
export interface ValidationError {
    field: string;
    message: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
```

### State Management Types
```typescript
// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Data state
export interface DataState<T> {
    data: T | null;
    loading: LoadingState;
    error: string | null;
}

// Filter state
export interface FilterState {
    activeFilters: Map<string, unknown>;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
```

## Type Testing Utilities
```typescript
// Type assertion helpers
export function assertNever(value: never): never {
    throw new Error(`Unexpected value: ${value}`);
}

// Exhaustive switch checking
function handleTaskType(type: TaskType) {
    switch (type) {
        case 'reach':
            return handleReach();
        case 'extract':
            return handleExtract();
        // ... handle all cases
        default:
            return assertNever(type); // Compile error if cases missed
    }
}
```

## Future Improvements to Consider

### 🎯 Type Safety Enhancements
- [ ] Add branded types for IDs (UserId, ItemId, etc.)
- [ ] Implement stricter validation types with Zod integration
- [ ] Add template literal types for API routes
- [ ] Create mapped types for form states
- [ ] Add conditional types for feature flags
- [ ] Implement phantom types for units (damage, distance)

### 📦 Organization Improvements
- [ ] Split large type files into domain modules
- [ ] Create index files with barrel exports
- [ ] Add type-only imports/exports optimization
- [ ] Separate DTOs from domain models
- [ ] Create shared type utilities module

### 🔧 Developer Experience
- [ ] Add type generation from JSON schemas
- [ ] Create type factories for testing
- [ ] Add runtime type validation helpers
- [ ] Generate types from API responses
- [ ] Add type documentation generator
- [ ] Create visual type hierarchy diagram

### 🎮 Game-Specific Types
- [ ] Add combat simulation types
- [ ] Create damage calculation types
- [ ] Add player progression types
- [ ] Implement inventory management types
- [ ] Add matchmaking/lobby types
- [ ] Create achievement/stats types

### 🔄 Integration Types
- [ ] Add WebSocket event types
- [ ] Create API client types
- [ ] Add cache strategy types
- [ ] Implement notification types
- [ ] Add analytics event types
- [ ] Create error tracking types

## Type Import Guidelines
```typescript
// ✅ CORRECT: Import types separately
import type { Item, Weapon } from '@/types/items';
import { isWeapon } from '@/types/items';

// ✅ CORRECT: Use type-only imports when possible
import type { FC, ReactNode } from 'react';

// ❌ WRONG: Mixed imports without type keyword
import { Item, isWeapon } from '@/types/items';
```

## Naming Conventions
- **Interfaces**: PascalCase, noun (`Item`, `User`, `TaskReward`)
- **Type Aliases**: PascalCase (`ItemCategory`, `ApiResponse`)
- **Type Guards**: camelCase with `is` prefix (`isWeapon`, `isArmor`)
- **Generic Types**: Single capital letter or descriptive (`T`, `TData`, `TError`)
- **Utility Types**: PascalCase with suffix (`ItemDTO`, `UserUpdate`)
- **Enums**: Avoid - use const objects with `as const`
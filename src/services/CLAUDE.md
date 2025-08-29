# Data Service Layer Guidelines

## Service Architecture

Services act as the data access layer between components and data sources. They handle:
- Data fetching and caching
- Data transformation and normalization
- Business logic and calculations
- Error handling and validation

## Service Structure Pattern

```typescript
// services/ItemService.ts
import { Item, ItemCategory, RARITY_CONFIG } from '@/types/items';
import { logger } from '@/lib/logger';

class ItemService {
  // Cache management
  private static cache: Map<string, Item> = new Map();
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
  
  // Data fetching
  static async getAllItems(): Promise<Item[]> {
    try {
      if (this.isCacheValid()) {
        return Array.from(this.cache.values());
      }
      
      const items = await this.fetchItemsFromSource();
      this.updateCache(items);
      return items;
    } catch (error) {
      logger.error('Failed to fetch items', error);
      throw new Error('Unable to load items data');
    }
  }
  
  // Specific queries
  static async getItemById(id: string): Promise<Item | null> {
    const items = await this.getAllItems();
    return items.find(item => item.id === id) || null;
  }
  
  static async getItemsByCategory(
    category: ItemCategory
  ): Promise<Item[]> {
    const items = await this.getAllItems();
    return items.filter(item => item.category === category);
  }
  
  // Data transformation
  private static transformRawItem(raw: any): Item {
    return {
      ...raw,
      rarity: this.normalizeRarity(raw.rarity),
      value: this.calculateValue(raw),
      // Additional transformations
    };
  }
  
  // Business logic
  static calculateItemValue(item: Item): number {
    const rarityMultiplier = RARITY_CONFIG[item.rarity].valueMultiplier;
    return item.baseValue * rarityMultiplier;
  }
  
  // Cache management
  private static isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }
  
  private static updateCache(items: Item[]): void {
    this.cache.clear();
    items.forEach(item => this.cache.set(item.id, item));
    this.cacheTimestamp = Date.now();
  }
}

export default ItemService;
```

## Service Categories

### Data Services
Handle CRUD operations and data fetching.

```typescript
// services/WeaponService.ts
export class WeaponService {
  static async getWeapons(): Promise<Weapon[]> {
    const weapons = await import('@/public/data/weapons.json');
    return weapons.default.map(w => this.transformWeapon(w));
  }
  
  static async getWeaponsByCaliberId(
    caliberId: string
  ): Promise<Weapon[]> {
    const weapons = await this.getWeapons();
    return weapons.filter(w => w.caliberId === caliberId);
  }
  
  private static transformWeapon(raw: any): Weapon {
    return {
      ...raw,
      // Type-safe transformation
      damage: Number(raw.damage),
      fireRate: Number(raw.fireRate),
      recoilPattern: this.parseRecoilPattern(raw.recoil),
    };
  }
}
```

### Calculation Services
Handle game mechanics and formulas.

```typescript
// services/CombatCalculator.ts
export class CombatCalculator {
  static calculateDamage(
    weapon: Weapon,
    ammo: Ammunition,
    armor?: Armor,
    distance?: number
  ): DamageResult {
    let damage = weapon.baseDamage * ammo.damageMultiplier;
    
    // Apply armor reduction
    if (armor) {
      damage = this.applyArmorReduction(damage, ammo, armor);
    }
    
    // Apply distance falloff
    if (distance) {
      damage = this.applyDistanceFalloff(damage, distance, weapon);
    }
    
    return {
      damage: Math.round(damage),
      penetrated: this.checkPenetration(ammo, armor),
      timeToKill: this.calculateTTK(damage, weapon.fireRate),
    };
  }
  
  private static applyArmorReduction(
    damage: number,
    ammo: Ammunition,
    armor: Armor
  ): number {
    const penetration = ammo.penetration;
    const armorClass = armor.armorClass;
    
    if (penetration >= armorClass) {
      return damage * 0.9; // 10% reduction on penetration
    }
    
    const reductionFactor = 1 - (armorClass - penetration) * 0.1;
    return damage * Math.max(0.1, reductionFactor);
  }
}
```

### Storage Services
Handle local storage and user data.

```typescript
// services/ProgressService.ts
export class ProgressService {
  private static readonly STORAGE_KEY = 'exfilzone_progress';
  
  static getProgress(): UserProgress {
    if (typeof window === 'undefined') {
      return this.getDefaultProgress();
    }
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultProgress();
    } catch (error) {
      logger.error('Failed to load progress', error);
      return this.getDefaultProgress();
    }
  }
  
  static saveProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(progress)
      );
    } catch (error) {
      logger.error('Failed to save progress', error);
    }
  }
  
  static updateTaskProgress(
    taskId: string,
    status: TaskStatus
  ): void {
    const progress = this.getProgress();
    progress.tasks[taskId] = status;
    progress.lastUpdated = new Date().toISOString();
    this.saveProgress(progress);
  }
  
  private static getDefaultProgress(): UserProgress {
    return {
      tasks: {},
      hideout: {},
      unlockedItems: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}
```

## Data Source Patterns

### Static JSON Files
```typescript
// For build-time data
const dataImports = {
  'weapons.json': () => import('@/public/data/weapons.json'),
  'armor.json': () => import('@/public/data/armor.json'),
};

async function loadStaticData(fileName: string) {
  const importer = dataImports[fileName];
  if (!importer) {
    throw new Error(`Unknown data file: ${fileName}`);
  }
  
  const module = await importer();
  return module.default;
}
```

### API Integration (Future)
```typescript
// services/ApiService.ts
class ApiService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
  static async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      logger.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }
}
```

## Error Handling

### Service Error Class
```typescript
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Usage
throw new ServiceError(
  'Item not found',
  'ITEM_NOT_FOUND',
  { itemId: id }
);
```

### Error Recovery
```typescript
class ResilientService {
  static async fetchWithRetry<T>(
    fetcher: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fetcher();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${i + 1} failed`, error);
        
        if (i < maxRetries - 1) {
          await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Caching Strategies

### Memory Cache
```typescript
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  
  set(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

### Request Deduplication
```typescript
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();
  
  async dedupe<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Return existing promise if request is in flight
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }
    
    // Create new promise and store it
    const promise = fetcher().finally(() => {
      this.pending.delete(key);
    });
    
    this.pending.set(key, promise);
    return promise;
  }
}
```

## Testing Services

### Mock Service Pattern
```typescript
// services/__mocks__/ItemService.ts
export const ItemService = {
  getAllItems: jest.fn().mockResolvedValue(mockItems),
  getItemById: jest.fn().mockImplementation((id) => 
    Promise.resolve(mockItems.find(i => i.id === id))
  ),
  getItemsByCategory: jest.fn().mockImplementation((category) =>
    Promise.resolve(mockItems.filter(i => i.category === category))
  ),
};
```

### Service Tests
```typescript
describe('ItemService', () => {
  beforeEach(() => {
    ItemService.clearCache();
  });
  
  it('fetches and caches items', async () => {
    const items = await ItemService.getAllItems();
    expect(items).toHaveLength(mockItems.length);
    
    // Second call should use cache
    const spy = jest.spyOn(ItemService, 'fetchItemsFromSource');
    await ItemService.getAllItems();
    expect(spy).not.toHaveBeenCalled();
  });
  
  it('handles errors gracefully', async () => {
    jest.spyOn(ItemService, 'fetchItemsFromSource')
      .mockRejectedValue(new Error('Network error'));
    
    await expect(ItemService.getAllItems())
      .rejects.toThrow('Unable to load items data');
  });
});
```

## Best Practices

### DO's ✅
- Keep services stateless (use class with static methods)
- Implement proper error handling
- Add logging for debugging
- Cache expensive operations
- Validate data at service boundaries
- Use TypeScript for type safety
- Write unit tests for business logic

### DON'ts ❌
- Don't put UI logic in services
- Don't use services for simple data access
- Don't ignore error cases
- Don't cache sensitive user data
- Don't make services dependent on each other
- Don't skip data validation
# Items Feature Documentation

## Documentation Hierarchy

**Parent:** [App Router](../CLAUDE.md) - Next.js pages & routing
**Root:** [Root CLAUDE.md](../../../CLAUDE.md) - Project overview
**Index:** [CLAUDE-INDEX.md](../../../CLAUDE-INDEX.md) - Complete navigation

**Related Documentation:**
- [Services](../../services/CLAUDE.md) - ItemService for data fetching
- [Types](../../types/CLAUDE.md) - Item types and categories
- [Components](../../components/CLAUDE.md) - Reusable component patterns
- [Public Data](../../../public/data/CLAUDE.md) - JSON data schemas

**See Also:**
- For data fetching patterns, see [Services CLAUDE.md](../../services/CLAUDE.md)
- For item type definitions, see [Types CLAUDE.md](../../types/CLAUDE.md) - Items Types
- For component styling, see [Components CLAUDE.md](../../components/CLAUDE.md)

---

## Overview

The **Items feature** provides a comprehensive database of all in-game items from Contractors Showdown: ExfilZone, including weapons, armor, ammunition, medical supplies, provisions, attachments, grenades, and task items. This feature allows users to:

- Browse all items with filtering and search
- View detailed item specifications
- See category-specific stats (weapons, armor, ammunition, etc.)
- Submit data corrections for items
- Filter by category and subcategory
- Search by name or description

**Routes:**
- `/items` - Items list page with filters
- `/items/[id]` - Item detail page with full specifications

---

## Directory Structure

```
app/items/
├── [id]/                          # Dynamic route for item details
│   ├── components/                # Item detail components
│   │   ├── AmmunitionSpecificStats.tsx
│   │   ├── ArmorSpecificStats.tsx
│   │   ├── AttachmentSpecificStats.tsx
│   │   ├── BackpackSpecificStats.tsx
│   │   ├── GrenadeSpecificStats.tsx
│   │   ├── HolsterSpecificStats.tsx
│   │   ├── MedicineSpecificStats.tsx
│   │   ├── ProvisionsSpecificStats.tsx
│   │   ├── TaskItemsSpecificStats.tsx
│   │   └── WeaponSpecificStats.tsx
│   └── page.tsx                   # Item detail page
├── components/                     # Items list components
│   ├── ArmorZonesDisplay.tsx      # Armor coverage visualization
│   ├── BallisticCurveChart.tsx    # Ammo penetration chart
│   ├── FilterSidebar.tsx          # Category filter sidebar
│   ├── ItemCard.tsx               # Item grid card
│   ├── ItemImage.tsx              # Item image component
│   ├── ItemLocations.tsx          # Item spawn locations
│   ├── ItemsPageContent.tsx       # Main list page content
│   ├── RelatedItems.tsx           # Related items display
│   └── WeaponRecoilDisplay.tsx    # Weapon recoil visualization
└── page.tsx                        # Items list page (server component)
```

---

## Items List Page

### Route: `/items`

**File:** `app/items/page.tsx`

**Pattern:** Server Component with Suspense

```typescript
import { Suspense } from 'react';
import ItemsPageContent from './components/ItemsPageContent';
import Layout from '@/components/layout/Layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Item Database',
    description: 'Complete weapon and equipment database...',
    keywords: ['item wiki', 'weapon database', 'equipment guide'],
    openGraph: {
        title: 'Item Database - ExfilZone Assistant',
        description: 'Complete weapon and equipment database...',
        type: 'website',
    },
};

// Loading component for Suspense fallback
function ItemsLoading() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="military-box p-8 rounded-sm text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-olive-400 mb-2">Loading Items Database</h2>
                        <p className="text-tan-300">Retrieving tactical equipment data...</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Main page component - server component
export default function ItemsPage() {
    return (
        <Suspense fallback={<ItemsLoading />}>
            <ItemsPageContent />
        </Suspense>
    );
}
```

**Key Features:**
- Server component wrapper
- Suspense boundary for loading state
- SEO metadata with Open Graph
- Custom loading spinner with military theme

---

## Items List Content Component

### Component: `ItemsPageContent`

**File:** `app/items/components/ItemsPageContent.tsx`

**Pattern:** Client Component for interactivity

```typescript
'use client';

import React, {useState, useEffect} from 'react';
import {Search} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ItemCard from '@/app/items/components/ItemCard';
import FilterSidebar from '@/app/items/components/FilterSidebar';
import {itemCategories, Item, getCategoryById} from '@/types/items';
import {useSearchParams} from "next/navigation";
import {useFetchItems} from "@/hooks/useFetchItems";

export default function ItemsPageContent() {
    const {items} = useFetchItems();
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category') || '';
    const subcategoryId = searchParams.get('subcategory') || '';
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Apply filters whenever search or category selection changes
    useEffect(() => {
        let result = [...items];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (categoryId) {
            result = result.filter(item => item.category === categoryId);

            // Apply subcategory filter if applicable
            if (subcategoryId) {
                result = result.filter(item => item.subcategory === subcategoryId);
            }
        }

        setFilteredItems(result);
    }, [items, searchQuery, categoryId, subcategoryId]);

    // Component JSX...
}
```

**Key Features:**
- **Client-side filtering:** Search and category filtering with local state
- **URL state sync:** Reads category/subcategory from URL params
- **Responsive sidebar:** Mobile toggle, desktop always visible
- **Search functionality:** Filters by name and description
- **Results count:** Shows number of filtered items

**State Management:**
- `items` - All items from `useFetchItems()` hook
- `filteredItems` - Computed filtered items based on search/category
- `searchQuery` - Search input value
- `isSidebarOpen` - Mobile sidebar toggle state
- `categoryId` / `subcategoryId` - URL query params

**Filtering Logic:**
1. Start with all items
2. Apply search filter (name or description match)
3. Apply category filter (if selected)
4. Apply subcategory filter (if selected)
5. Update `filteredItems` state

---

## Item Detail Page

### Route: `/items/[id]`

**File:** `app/items/[id]/page.tsx`

**Pattern:** Client Component with dynamic data fetching

```typescript
'use client';

import React, {useState, useEffect} from 'react';
import {getItemById} from "@/services/ItemService";
import {Item} from '@/types/items';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ItemDetail({params}: PageProps) {
    const {id} = React.use(params);
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadItem = async () => {
            try {
                const itemData = await getItemById(id);
                setItem(itemData || null);
            } catch (error) {
                console.error('Failed to load item:', error);
            } finally {
                setLoading(false);
            }
        };

        loadItem();
    }, [id]);

    // Loading state
    if (loading) {
        return <LoadingState />;
    }

    // Error state
    if (!item) {
        return <ErrorState />;
    }

    // Render item details...
}
```

**Key Features:**
- **Dynamic params:** Uses `React.use()` for async params (Next.js 15+)
- **Client-side data fetching:** Loads item by ID from ItemService
- **Loading state:** Shows spinner while fetching
- **Error state:** Shows error message if item not found
- **Breadcrumb navigation:** Back to items list → category → subcategory
- **Rarity styling:** Border color based on rarity
- **Image zoom:** Hover scale effect on item image
- **Category-specific stats:** Renders stats based on item type
- **Correction submission:** Users can submit data corrections

**Page Sections:**
1. **Breadcrumb navigation** - Items → Category → Subcategory
2. **Item header** - Name, rarity, category
3. **Left column** - Item image, price, weight
4. **Right column** - Description, specifications, tactical tips

---

## Category-Specific Stats Components

Each item category has its own stats component for category-specific fields.

### Pattern: Type Guards + Conditional Rendering

```typescript
// Helper to render stats based on item category
const renderCategorySpecificStats = (item: AnyItem) => {
    switch (item.category) {
        case 'weapons':
            if (isWeapon(item)) return <WeaponSpecificStats item={item}/>;
            break;
        case 'ammo':
            if (isAmmunition(item)) return <AmmunitionSpecificStats item={item}/>;
            break;
        case "attachments":
            if (isAttachment(item)) return <AttachmentSpecificStats item={item}/>;
            break;
        case "grenades":
            if (isGrenade(item)) return <GrenadeSpecificStats item={item}/>;
            break;
        case 'gear':
            if (isArmor(item)) return <ArmorSpecificStats item={item}/>
            if (isBackpack(item)) return <BackpackSpecificStats item={item}/>
            if (isHolster(item)) return <HolsterSpecificStats item={item}/>
            break;
        case 'medicine':
            if (isMedicine(item)) return <MedicineSpecificStats item={item}/>
            break;
        case 'provisions':
            if (isProvisions(item)) return <ProvisionsSpecificStats item={item}/>
            break;
        case 'task-items':
            if (isTaskItem(item)) return <TaskItemsSpecificStats item={item}/>
            break;
        default:
            return null;
    }
};
```

### Stats Components Breakdown

#### WeaponSpecificStats
**File:** `app/items/[id]/components/WeaponSpecificStats.tsx`

Displays:
- Caliber, fire mode, fire rate
- Damage, penetration, effective range
- Magazine capacity, reload time
- Recoil (horizontal/vertical)
- Ergonomics, accuracy

#### AmmunitionSpecificStats
**File:** `app/items/[id]/components/AmmunitionSpecificStats.tsx`

Displays:
- Caliber compatibility
- Damage, penetration
- Armor damage percentage
- Fragmentation chance
- Projectile speed
- Ballistic curve chart (if data available)

#### ArmorSpecificStats
**File:** `app/items/[id]/components/ArmorSpecificStats.tsx`

Displays:
- Armor class, durability
- Movement speed penalty
- Turn speed penalty
- Ergonomics penalty
- Coverage zones (chest, stomach, arms)
- Armor zones visualization

#### AttachmentSpecificStats
**File:** `app/items/[id]/components/AttachmentSpecificStats.tsx`

Displays:
- Compatible weapons/slots
- Stat modifiers (recoil, ergonomics, accuracy)
- Special features

#### GrenadeSpecificStats
**File:** `app/items/[id]/components/GrenadeSpecificStats.tsx`

Displays:
- Damage, blast radius
- Fuse time, throwing distance
- Fragmentation count

#### MedicineSpecificStats
**File:** `app/items/[id]/components/MedicineSpecificStats.tsx`

Displays:
- HP restored, use time
- Effects (painkiller, bleeding stop, fracture heal)
- Negative effects
- Max uses

#### ProvisionsSpecificStats
**File:** `app/items/[id]/components/ProvisionsSpecificStats.tsx`

Displays:
- Hydration/energy restored
- Use time
- Positive/negative effects

#### BackpackSpecificStats
**File:** `app/items/[id]/components/BackpackSpecificStats.tsx`

Displays:
- Capacity (slots)
- Movement speed penalty
- Turn speed penalty

#### HolsterSpecificStats
**File:** `app/items/[id]/components/HolsterSpecificStats.tsx`

Displays:
- Holster slots
- Compatible weapon sizes

#### TaskItemsSpecificStats
**File:** `app/items/[id]/components/TaskItemsSpecificStats.tsx`

Displays:
- Related tasks
- Quest requirements
- Found-in-raid status

---

## Filter Sidebar Component

### Component: `FilterSidebar`

**File:** `app/items/components/FilterSidebar.tsx`

**Pattern:** Client Component with URL navigation

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { itemCategories, ItemCategory } from '@/types/items';

interface FilterSidebarProps {
    categories: ItemCategory[];
    selectedCategory: string;
    selectedSubcategory: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function FilterSidebar({
    categories,
    selectedCategory,
    selectedSubcategory,
    isOpen,
    onClose,
}: FilterSidebarProps) {
    const router = useRouter();

    const handleCategoryChange = (categoryId: string) => {
        if (categoryId === '') {
            router.push('/items');
        } else {
            router.push(`/items?category=${categoryId}`);
        }
        onClose();
    };

    const handleSubcategoryChange = (subcategory: string) => {
        router.push(`/items?category=${selectedCategory}&subcategory=${subcategory}`);
        onClose();
    };

    // Render sidebar...
}
```

**Key Features:**
- **URL-based filtering:** Uses router.push to update URL params
- **Mobile responsive:** Toggleable on mobile, always visible on desktop
- **Category tree:** Shows categories with expandable subcategories
- **Clear filters:** Reset button to clear all filters
- **Active state:** Highlights selected category/subcategory

**URL State Pattern:**
- `/items` - All items
- `/items?category=weapons` - Weapons category
- `/items?category=weapons&subcategory=rifles` - Rifles subcategory

---

## Item Card Component

### Component: `ItemCard`

**File:** `app/items/components/ItemCard.tsx`

**Pattern:** Presentational Component

```typescript
interface ItemCardProps {
    item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
    return (
        <Link href={`/items/${item.id}`}>
            <div className="military-card hover:border-olive-500 transition-colors cursor-pointer">
                {/* Item image */}
                <div className="aspect-square relative bg-military-950 rounded-sm overflow-hidden">
                    <ItemImage
                        src={item.images.thumbnail}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                    />
                </div>

                {/* Item info */}
                <div className="p-3">
                    <h3 className="text-tan-100 font-semibold mb-1 truncate">
                        {item.name}
                    </h3>
                    <div className="flex justify-between items-center text-sm">
                        <span className={getRarityColorClass(item.stats.rarity)}>
                            {item.stats.rarity}
                        </span>
                        <span className="text-olive-400 font-mono">
                            {formatPrice(item.stats.price)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
```

**Key Features:**
- **Link wrapper:** Entire card is clickable
- **Square image:** Maintains aspect ratio
- **Truncated name:** Prevents layout overflow
- **Rarity color:** Dynamic color based on rarity
- **Price display:** Formatted with currency symbol
- **Hover effect:** Border color change on hover

---

## Item Image Component

### Component: `ItemImageDisplay`

**File:** `app/items/[id]/page.tsx` (inline component)

**Pattern:** Error handling with fallback

```typescript
const ItemImageDisplay: React.FC<{
    src: string;
    alt: string;
    className?: string;
}> = ({src, alt, className = ''}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    if (imageError) {
        return (
            <div className={`flex items-center justify-center bg-military-800 ${className}`}>
                <div className="text-center p-4">
                    <div className="text-olive-500 mb-2 font-medium military-stencil">{alt}</div>
                    <div className="text-tan-400 text-sm">Image not available</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className} group`}>
            {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-military-800 z-10">
                    <div className="animate-spin w-8 h-8 border-2 border-olive-600 border-t-transparent rounded-full"></div>
                </div>
            )}
            <div className="relative w-full h-full cursor-pointer transition-transform duration-200 hover:scale-105">
                <Image
                    src={src}
                    alt={alt}
                    unoptimized={true}
                    fill
                    className="object-contain p-4"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageLoading(false)}
                    sizes="(max-width: 768px) 400px, 600px"
                    priority
                />
            </div>
        </div>
    );
};
```

**Key Features:**
- **Loading spinner:** Shows while image loads
- **Error fallback:** Shows placeholder if image fails
- **Hover zoom:** Scale effect on hover
- **Next.js Image:** Optimized image loading
- **Responsive sizes:** Different sizes for mobile/desktop

---

## Data Fetching

### Service: ItemService

**File:** `src/services/ItemService.ts`

```typescript
import { Item } from '@/types/items';
import weaponsData from '@/public/data/weapons.json';
import ammoData from '@/public/data/ammunition.json';
// ... other imports

export class ItemService {
    static getAllItems(): Item[] {
        return [
            ...weaponsData,
            ...ammoData,
            ...armorData,
            // ... other categories
        ];
    }

    static getItemById(id: string): Item | undefined {
        return this.getAllItems().find(item => item.id === id);
    }

    static getItemsByCategory(category: string): Item[] {
        return this.getAllItems().filter(item => item.category === category);
    }
}
```

**See:** [Services CLAUDE.md](../../services/CLAUDE.md) for complete data fetching patterns

---

## Item Types

### Item Type Hierarchy

**File:** `src/types/items.ts`

```typescript
// Base item interface
export interface Item {
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    images: {
        thumbnail: string;
        fullsize: string;
    };
    stats: {
        rarity: RarityLevel;
        price: number;
        weight: number;
    };
    tips?: string;
}

// Category-specific interfaces extend Item
export interface Weapon extends Item {
    category: 'weapons';
    weaponStats: {
        caliber: string;
        fireMode: string[];
        fireRate: number;
        damage: number;
        penetration: number;
        effectiveRange: number;
        magazineCapacity: number;
        reloadTime: number;
        recoilHorizontal: number;
        recoilVertical: number;
        ergonomics: number;
        accuracy: number;
    };
}

export interface Ammunition extends Item {
    category: 'ammo';
    ammoStats: {
        caliber: string;
        damage: number;
        penetration: number;
        armorDamage: number;
        fragmentationChance: number;
        projectileSpeed: number;
    };
}

// ... other category interfaces
```

**See:** [Types CLAUDE.md](../../types/CLAUDE.md) - Items Types for complete type definitions

---

## URL State Management

### Pattern: URL Query Params

The items feature uses URL query parameters for filter state:

```
/items                                    # All items
/items?category=weapons                   # Filter by category
/items?category=weapons&subcategory=rifles # Filter by subcategory
```

**Benefits:**
- Shareable URLs - Users can bookmark filtered views
- Browser history - Back/forward navigation works
- SEO friendly - Search engines can index filtered pages
- Stateless - No need to manage filter state in context

**Implementation:**
```typescript
// Read params
const searchParams = useSearchParams();
const categoryId = searchParams.get('category') || '';

// Update params
const router = useRouter();
router.push(`/items?category=${categoryId}`);
```

---

## Styling Patterns

### Military Theme

All item components follow the military aesthetic:

```tsx
// Military card
<div className="military-card p-4 rounded-sm">

// Military box (darker)
<div className="military-box border-l-4 border-olive-600">

// Rarity colors
<span className={getRarityColorClass(item.stats.rarity)}>
  {/* Common: gray, Uncommon: green, Rare: blue, Epic: purple, Legendary: orange */}
</span>

// Border accent
<div className={`border-l-4 ${getRarityBorderClass(item.stats.rarity)}`}>
```

**See:** [Root CLAUDE.md](../../../CLAUDE.md) - UI/UX Principles for complete design system

---

## Performance Optimizations

### Implemented Optimizations

1. **Image optimization:**
   - Next.js Image component with lazy loading
   - WebP format for all item images
   - Responsive sizes for mobile/desktop
   - Unoptimized flag for static exports

2. **Code splitting:**
   - Client component boundary at ItemsPageContent
   - Lazy import for heavy stat components
   - Dynamic imports for category-specific components

3. **Filtering performance:**
   - Client-side filtering with memoization
   - Efficient array methods (filter, includes)
   - Debounced search input (could be added)

4. **Data loading:**
   - All items loaded once with `useFetchItems()` hook
   - Cached in component state
   - No re-fetching on filter changes

---

## Common Patterns

### DO's ✅

```typescript
// ✅ Use type guards before rendering category-specific stats
if (isWeapon(item)) {
    return <WeaponSpecificStats item={item} />;
}

// ✅ Handle loading and error states
if (loading) return <LoadingState />;
if (!item) return <ErrorState />;

// ✅ Use URL params for filter state
const categoryId = searchParams.get('category') || '';

// ✅ Filter client-side for better UX
const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
);

// ✅ Use ItemService for data fetching
const item = await getItemById(id);

// ✅ Show image fallback on error
<Image onError={handleImageError} />
```

### DON'Ts ❌

```typescript
// ❌ Don't render stats without type checking
<WeaponSpecificStats item={item as Weapon} />

// ❌ Don't ignore loading/error states
const item = await getItemById(id);
return <ItemDetail item={item} />; // What if item is null?

// ❌ Don't use local state for filters (use URL params)
const [category, setCategory] = useState('');

// ❌ Don't fetch data for every filter change
useEffect(() => {
    fetchItems(category); // Re-fetch on every change
}, [category]);

// ❌ Don't break images without fallback
<Image src={item.image} alt={item.name} />
```

---

## Testing Considerations

### Unit Tests

**ItemCard Component:**
```typescript
describe('ItemCard', () => {
    it('displays item name and rarity', () => {
        render(<ItemCard item={mockItem} />);
        expect(screen.getByText(mockItem.name)).toBeInTheDocument();
        expect(screen.getByText(mockItem.stats.rarity)).toBeInTheDocument();
    });

    it('links to item detail page', () => {
        render(<ItemCard item={mockItem} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', `/items/${mockItem.id}`);
    });
});
```

**FilterSidebar:**
```typescript
describe('FilterSidebar', () => {
    it('updates URL when category is selected', () => {
        const mockRouter = { push: jest.fn() };
        render(<FilterSidebar {...props} />);

        fireEvent.click(screen.getByText('Weapons'));
        expect(mockRouter.push).toHaveBeenCalledWith('/items?category=weapons');
    });
});
```

**ItemDetail Page:**
```typescript
describe('ItemDetail', () => {
    it('shows loading state initially', () => {
        render(<ItemDetail params={Promise.resolve({ id: '123' })} />);
        expect(screen.getByText('Loading Item')).toBeInTheDocument();
    });

    it('shows error state when item not found', async () => {
        getItemById.mockResolvedValue(null);
        render(<ItemDetail params={Promise.resolve({ id: 'invalid' })} />);

        await waitFor(() => {
            expect(screen.getByText('Item Not Found')).toBeInTheDocument();
        });
    });

    it('renders item details when loaded', async () => {
        getItemById.mockResolvedValue(mockItem);
        render(<ItemDetail params={Promise.resolve({ id: '123' })} />);

        await waitFor(() => {
            expect(screen.getByText(mockItem.name)).toBeInTheDocument();
        });
    });
});
```

---

## Accessibility

### VR-Optimized Design

- **Large touch targets:** Filter buttons are 44x44px minimum
- **High contrast:** Text meets WCAG AA standards
- **Clear focus states:** Keyboard navigation visible
- **Readable fonts:** Minimum 16px for body text
- **Spacious layout:** Large padding for VR headset viewing

### ARIA Labels

```tsx
<input
    type="text"
    placeholder="Search items..."
    aria-label="Search items by name or description"
/>

<button
    onClick={toggleSidebar}
    aria-label={isSidebarOpen ? 'Close filters' : 'Open filters'}
    aria-expanded={isSidebarOpen}
>
    Filters
</button>
```

---

## Future Enhancements

### Potential Improvements

1. **Advanced filtering:**
   - Multi-select categories
   - Stat range filters (price, weight, damage)
   - Sort options (name, price, rarity)

2. **Comparison feature:**
   - Compare 2-3 items side-by-side
   - Highlight stat differences
   - Save comparisons

3. **Favorites/Wishlist:**
   - Mark favorite items
   - Create loadout wishlists
   - Share loadouts with friends

4. **Search improvements:**
   - Debounced search
   - Search highlighting
   - Search suggestions

5. **Performance:**
   - Virtual scrolling for large lists
   - Intersection observer for lazy image loading
   - Service worker caching

---

## External Resources

### Next.js & React
- **App Router**: [nextjs.org/docs/app](https://nextjs.org/docs/app)
- **Dynamic Routes**: [nextjs.org/docs/app/building-your-application/routing/dynamic-routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- **useSearchParams**: [nextjs.org/docs/app/api-reference/functions/use-search-params](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- **Image Optimization**: [nextjs.org/docs/app/building-your-application/optimizing/images](https://nextjs.org/docs/app/building-your-application/optimizing/images)

### TypeScript
- **Type Guards**: [typescriptlang.org/docs/handbook/2/narrowing.html](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- **Discriminated Unions**: [typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

---

## Summary

The Items feature is a comprehensive database browser with:
- **List view** with search and filtering
- **Detail view** with category-specific stats
- **URL-based state** for shareable links
- **Client-side filtering** for instant results
- **VR-optimized design** with large touch targets
- **Type-safe** implementation with TypeScript
- **Military theme** throughout

All patterns follow the project's critical rules: No `any` types, Tailwind 4+ syntax, shadcn UI components, and edit-first modification approach.

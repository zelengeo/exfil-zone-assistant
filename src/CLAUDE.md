# Frontend Architecture Guidelines

## Documentation Hierarchy

**Parent:** [Root CLAUDE.md](../CLAUDE.md) - Project overview & critical rules
**Index:** [CLAUDE-INDEX.md](../CLAUDE-INDEX.md) - Complete documentation navigation

**Related Documentation:**
- [App Router](app/CLAUDE.md) - Next.js pages & routing patterns
- [Components](components/CLAUDE.md) - React component development
- [Types](types/CLAUDE.md) - TypeScript type definitions
- [Services](services/CLAUDE.md) - Data access layer
- [Content](content/CLAUDE.md) - Content creation patterns

**See Also:**
- For backend patterns, see [Lib CLAUDE.md](lib/CLAUDE.md)
- For API routes, see [API CLAUDE.md](app/api/CLAUDE.md)
- For styling conventions, see [Components CLAUDE.md](components/CLAUDE.md)

---

## Directory Structure
```
src/
├── app/            # Next.js App Router pages and layouts
├── components/     # Reusable React components
├── content/        # Static content (guides, data)
├── lib/           # Utilities and helpers
├── services/      # API and data services
└── types/         # TypeScript type definitions
```

## Component Architecture

### Component Categories
1. **Layout Components** (`/components/layout/`)
    - Header, Footer, Navigation
    - Consistent across all pages
    - Handle responsive design

2. **UI Components** (`/components/ui/`)
    - Buttons, Cards, Modals
    - Follow shadcn patterns
    - Highly reusable

3. **Feature Components** (`/components/[feature]/`)
    - ItemCard, CombatSimulator, TaskTracker
    - Domain-specific logic
    - Compose UI components

### Component Rules
```typescript
// ✅ CORRECT: Typed props with interface
interface ComponentProps {
  title: string;
  items: Item[];
  onSelect?: (item: Item) => void;
}

export function Component({ title, items, onSelect }: ComponentProps) {
  // Implementation
}

// ❌ WRONG: Inline types or any
export function Component({ title, items }: any) {
  // Don't do this
}
```

## State Management Patterns

### Local State
```javascript
// Simple state for UI controls
const [isOpen, setIsOpen] = useState(false);
const [filter, setFilter] = useState('all');
```

### Complex State
```javascript
// Use reducer for complex state logic
const [state, dispatch] = useReducer(reducer, initialState);
```

### Global State
```javascript
// Use Context API for cross-component state
const ProgressContext = createContext();
export const useProgress = () => useContext(ProgressContext);
```

## Data Fetching Patterns

### Static Data
```javascript
// Import JSON data directly
import weaponsData from '@/public/data/weapons.json';

// Transform in service layer
import { ItemService } from '@/services/ItemService';
const items = await ItemService.getAllItems();
```

### Dynamic Data
```javascript
// Use React hooks for client-side fetching
const { data, loading, error } = useItemData(itemId);
```

## Styling Conventions

### Tailwind Classes
```jsx
// ✅ CORRECT: Use cn() utility for conditional classes
<div className={cn(
  "military-box p-4",
  isActive && "border-olive-400",
  isDisabled && "opacity-50"
)}>

// ❌ WRONG: String concatenation
<div className={`military-box p-4 ${isActive ? 'border-olive-400' : ''}`}>
```

### Custom Styles
```css
/* Only in globals.css */
@layer components {
  .military-box {
    @apply bg-military-800 border border-military-600 rounded-sm;
  }
}
```

## Performance Optimizations

### Code Splitting
```javascript
// Dynamic imports for heavy components
const CombatSimulator = dynamic(
  () => import('@/components/combat-sim/CombatSimulator'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);
```

### Memoization
```javascript
// Memoize expensive calculations
const sortedItems = useMemo(
  () => items.sort((a, b) => b.value - a.value),
  [items]
);

// Memoize callbacks
const handleSelect = useCallback(
  (item) => {
    dispatch({ type: 'SELECT_ITEM', payload: item });
  },
  [dispatch]
);
```

### Image Optimization
```jsx
// Always use Next.js Image component
import Image from 'next/image';

<Image 
  src="/images/item.webp"
  alt="Item name"
  width={64}
  height={64}
  loading="lazy"
/>
```

## Error Handling

### Component Error Boundaries
```javascript
// Wrap features in error boundaries
<ErrorBoundary fallback={<ErrorMessage />}>
  <FeatureComponent />
</ErrorBoundary>
```

### Data Validation
```javascript
// Validate data at service layer
if (!isValidItem(data)) {
  console.error('Invalid item data:', data);
  return null;
}
```

## Accessibility

### VR Optimizations
- Minimum touch target: 44x44px
- Focus visible indicators
- Keyboard navigation support
- High contrast ratios (WCAG AA)

### ARIA Labels
```jsx
<button
  aria-label="Filter weapons by caliber"
  aria-pressed={isFiltered}
  className="vr-button"
>
  Filter
</button>
```

## File Naming Conventions
- Components: PascalCase (`ItemCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase with `.types.ts` (`Item.types.ts`)
- Hooks: camelCase with `use` prefix (`useItemFilter.ts`)
- Constants: UPPER_SNAKE_CASE in files (`RARITY_CONFIG`)

## Import Order
1. React and core libraries
2. Third-party libraries
3. Internal aliases (@/)
4. Relative imports
5. Static assets
6. Types

## Testing Patterns
```javascript
// Component test example
describe('ItemCard', () => {
  it('displays item information correctly', () => {
    render(<ItemCard item={mockItem} />);
    expect(screen.getByText(mockItem.name)).toBeInTheDocument();
  });
});
```

## Common Utilities Location
- `/lib/utils.ts` - General utilities (cn, formatters)
- `/lib/calculations.ts` - Game calculations
- `/lib/constants.ts` - App-wide constants
- `/services/` - Data fetching and transformation
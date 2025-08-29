# Component Development Guidelines

## Component Structure

### Basic Component Template
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Required props first
  title: string;
  data: DataType[];
  
  // Optional props with defaults
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  onAction?: (item: DataType) => void;
}

export function ComponentName({ 
  title,
  data,
  variant = 'default',
  className,
  onAction 
}: ComponentNameProps) {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Derived state
  const processedData = useMemo(() => {
    // Process data
  }, [data]);
  
  // Handlers
  const handleClick = useCallback((item: DataType) => {
    onAction?.(item);
  }, [onAction]);
  
  // Early returns for edge cases
  if (!data.length) {
    return <EmptyState />;
  }
  
  // Main render
  return (
    <div className={cn('base-styles', className)}>
      {/* Component content */}
    </div>
  );
}
```

## Component Categories

### Layout Components (`/layout`)
Responsible for page structure and navigation.

```typescript
// Header.tsx
export function Header() {
  return (
    <header className="military-header">
      <Navigation />
      <MobileMenu />
    </header>
  );
}
```

**Conventions:**
- Handle responsive design
- Manage navigation state
- Include accessibility features
- VR-optimized touch targets

### UI Components (`/ui`)
Reusable interface elements following shadcn patterns.

```typescript
// Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary',
  size = 'md',
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'military-button',
        buttonVariants({ variant, size }),
        className
      )}
      {...props}
    />
  );
}
```

**Conventions:**
- Extend native HTML elements
- Provide variant and size props
- Use forwardRef when needed
- Maintain shadcn compatibility

### Feature Components
Domain-specific components with business logic.

```typescript
// ItemCard.tsx
export function ItemCard({ item, showDetails = false }: ItemCardProps) {
  const rarity = getRarityConfig(item.rarity);
  
  return (
    <article className="military-card">
      <ItemImage item={item} />
      <ItemStats item={item} />
      {showDetails && <ItemDetails item={item} />}
    </article>
  );
}
```

**Conventions:**
- Compose UI components
- Handle feature-specific logic
- Connect to data services
- Implement error states

## Styling Patterns

### Class Organization
```jsx
<div 
  className={cn(
    // Base styles
    "relative flex flex-col",
    
    // Spacing
    "p-4 gap-3",
    
    // Colors & borders
    "bg-military-800 border border-military-600",
    
    // Interactive states
    "hover:border-olive-400 transition-colors",
    
    // Responsive
    "md:flex-row md:gap-6",
    
    // Conditional
    isActive && "ring-2 ring-olive-400",
    
    // Custom className prop
    className
  )}
>
```

### Military Theme Classes
```css
/* Commonly used military theme classes */
.military-box     /* Standard container */
.military-card    /* Card component */
.military-button  /* Button styling */
.military-header  /* Header styling */
.vr-text         /* VR-optimized text */
.vr-button       /* VR-optimized button */
```

## State Management

### Loading States
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner className="text-olive-400" />
      <span className="ml-2 text-tan-300">Loading...</span>
    </div>
  );
}
```

### Error States
```typescript
if (error) {
  return (
    <div className="military-box p-6 border-red-600">
      <AlertCircle className="text-red-400 mb-2" />
      <p className="text-tan-200">{error.message}</p>
      <Button onClick={retry} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
```

### Empty States
```typescript
if (!items.length) {
  return (
    <div className="text-center py-12">
      <Package className="mx-auto text-military-500 mb-4" size={48} />
      <p className="text-tan-300">No items found</p>
      <p className="text-tan-400 text-sm mt-2">
        Try adjusting your filters
      </p>
    </div>
  );
}
```

## Performance Guidelines

### Memo Usage
```typescript
// Memoize expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.data.id === nextProps.data.id;
});
```

### Lazy Loading
```typescript
// Lazy load heavy components
const HeavyFeature = lazy(() => import('./HeavyFeature'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HeavyFeature />
</Suspense>
```

## Accessibility Checklist

### VR Optimizations
- [ ] Touch targets minimum 44x44px
- [ ] Text size minimum 16px (1rem)
- [ ] Contrast ratio 4.5:1 minimum
- [ ] Focus indicators visible
- [ ] Reduced motion options

### ARIA Implementation
```jsx
<div 
  role="region"
  aria-label="Item statistics"
  aria-live="polite"
  aria-busy={loading}
>
  {/* Content */}
</div>
```

## Testing Patterns

### Component Test Structure
```typescript
describe('ComponentName', () => {
  const defaultProps = {
    title: 'Test Title',
    data: mockData,
  };
  
  it('renders correctly with required props', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const handleClick = jest.fn();
    render(<ComponentName {...defaultProps} onAction={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
  
  it('displays loading state', () => {
    render(<ComponentName {...defaultProps} loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

## Common Patterns

### List Rendering
```typescript
{items.map((item) => (
  <ItemCard
    key={item.id}  // Always use stable, unique keys
    item={item}
    onSelect={() => handleSelect(item.id)}
  />
))}
```

### Conditional Rendering
```typescript
// Short circuit for single condition
{showDetails && <Details />}

// Ternary for either/or
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// Multiple conditions
{(() => {
  if (loading) return <Spinner />;
  if (error) return <Error />;
  if (!data) return <Empty />;
  return <DataDisplay data={data} />;
})()}
```

### Event Handlers
```typescript
// Inline for simple actions
onClick={() => setOpen(!open)}

// Extracted for complex logic
const handleSubmit = useCallback((e: FormEvent) => {
  e.preventDefault();
  // Complex logic
}, [dependencies]);
```

## Do's and Don'ts

### DO's ✅
- Use TypeScript interfaces for props
- Implement loading and error states
- Follow VR accessibility guidelines
- Memoize expensive operations
- Use semantic HTML elements
- Test user interactions

### DON'Ts ❌
- Use `any` type
- Ignore error boundaries
- Create components over 200 lines
- Mix business logic with UI
- Use inline styles
- Skip accessibility attributes
# CLAUDE.md Documentation Audit - Phase 2, Step 7 Results

## Template Recommendations

**Audit Date:** 2025-10-07
**Project:** ExfilZone Assistant
**Phase:** Phase 2 - Improvement Recommendations
**Step:** 7 - Standardized Templates

---

## Overview

This step provides standardized templates for different types of CLAUDE.md documentation files to ensure consistency across the project. Each template includes:
- Required sections
- Optional sections
- Code example formats
- Cross-reference patterns
- AI-optimization structures

---

## Template 1: Root-Level CLAUDE.md

**Use For:** Project-wide overview, critical rules, global standards

**File:** `/CLAUDE.md`

**Template:**

```markdown
# [Project Name] Project Context

## Documentation Navigation

📋 **Complete Documentation Index:** See [CLAUDE-INDEX.md](CLAUDE-INDEX.md)

**Quick Links:**
- [Frontend Architecture](src/CLAUDE.md)
- [App Router](src/app/CLAUDE.md)
- [Components](src/components/CLAUDE.md)
- [API Routes](src/app/api/CLAUDE.md)
- [Types](src/types/CLAUDE.md)

See index for complete list of documentation files.

---

## Project Overview

**[Project Name]** - [One-sentence description]

**Purpose:** [2-3 sentence project purpose and target users]

---

## Critical Rules

1. **[Technology 1]** - [Rule with version]
2. **[Technology 2]** - [Rule with version]
3. **TypeScript 'any'** - NEVER use TypeScript 'any' - ESLint forbids it
4. **Zod Schemas** - Define schemas first, derive types with `z.infer`
5. **Code Modification** - Prefer EDITING existing code over rewrites
6. **Incremental Development** - Create components ONE AT A TIME, not in bulk

**Why these rules?**
- [Explain rationale for each critical rule]

---

## Complete Project Structure

```
[project-root]/
├── public/                 # Static assets
│   ├── data/              # Data files
│   └── images/            # Image assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API routes
│   │   └── [features]/   # Feature routes
│   ├── components/        # React components
│   ├── lib/              # Backend utilities
│   ├── models/           # Database models
│   ├── services/         # Data services
│   ├── types/            # TypeScript types
│   └── content/          # Content/guides
├── CLAUDE.md files        # Documentation
└── Configuration files
```

---

## Project Artifacts

**Tech Stack:**
- **Framework:** [Framework] [Version]
- **Language:** TypeScript
- **Styling:** [Tailwind/etc] [Version]
- **Database:** [Database] [Version]
- **Deployment:** [Platform]

**Key Libraries:**
- [Library 1]: [Version] - [Purpose]
- [Library 2]: [Version] - [Purpose]

---

## Environment Variables

Required environment variables (see `.env.example`):

### [Category 1]
```bash
VAR_NAME=value
```

### [Category 2]
```bash
VAR_NAME=value
```

**See Also:** [lib/CLAUDE.md](src/lib/CLAUDE.md) for environment variable type safety

---

## Code Standards

### TypeScript Rules
```typescript
// ❌ NEVER
const data: any = fetchData();

// ✅ PREFERRED
const data: Item[] = fetchData();
const data: unknown = fetchData(); // if type truly unknown
```

### Component Patterns
[Component structure example]

### File Organization
```
component-name/
├── ComponentName.tsx       # Main component
├── ComponentName.types.ts  # Type definitions
└── index.ts               # Barrel export
```

---

## Code Modification Best Practices

When working with existing code:

### 1. Prefer Editing Over Rewriting
- ✅ Modify existing files rather than creating new ones
- ✅ Make the minimal necessary changes to achieve the goal
- ✅ Preserve existing patterns and structure
- ❌ Don't rewrite entire files to add one feature
- ❌ Don't refactor unrelated code while adding features

### 2. Incremental Changes
- ✅ Make small, focused changes
- ✅ Test after each change
- ✅ Iterate and refine individual components
- ❌ Don't generate scaffolding for entire features at once

### 3. Respect Existing Code
- ✅ Follow established patterns in the file
- ✅ Maintain consistency with surrounding code
- ✅ Only deviate when there's a clear improvement

---

## Component Creation Strategy

Follow an incremental approach:

1. **One Component at a Time**
   - Create and complete one component before starting the next
   - Don't generate bulk scaffolding for entire features
   - Focus on quality over quantity

2. **Test and Iterate**
   - Test each component individually
   - Refine based on testing
   - Ensure it works before moving to next component

3. **Build Progressively**
   - Start with simplest component
   - Add complexity incrementally
   - Compose larger features from tested smaller components

---

## [Project-Specific Sections]

### UI/UX Principles
[Project-specific design principles]

### Data Structures
[Overview of main data structures]

### Performance Guidelines
[Performance best practices]

---

## Deployment

### Hosting
- **Platform:** [Platform Name]
- **Database:** [Database Host]
- **Auto-deploy:** [Branch name]

### Build Process
```bash
npm run build        # Production build
npm run start        # Start production server
```

### Pre-deployment Checks
1. Run tests: `npm test`
2. Run linter: `npm run lint`
3. Type check: `npm run type-check`
4. Build succeeds: `npm run build`

---

## Development Workflow

1. Check existing patterns before implementing new solutions
2. Reference design system in [path to design system]
3. Use existing utility functions from `/lib`
4. Follow established naming conventions
5. Test on multiple viewport sizes

---

## Quick Reference: Critical Patterns

| Category | Rule | Example |
|----------|------|---------|
| Types | Never use `any` | `const data: Item[]` not `const data: any` |
| Styling | [Tech] [Version] | [Example] |
| Components | [Library] | [Example] |
| Routing | [Framework] [Version] | [Example] |
| Validation | Zod schemas | `z.object()` then `z.infer<typeof>` |
| Modification | Edit, don't rewrite | Minimal necessary changes only |
| Creation | Incremental | One component at a time |

**Action Keywords for AI Agents:**
- **MUST**: [List of must-follow rules]
- **PREFER**: [List of preferred approaches]
- **AVOID**: [List of things to avoid]
- **NEVER**: [List of forbidden practices]

---

## Questions to Ask Before Implementation

### Before Writing Code
1. **Pattern Check:** Does this follow existing component patterns?
   - Search codebase for similar components
   - Review relevant CLAUDE.md file
   - Check design system

2. **Type Safety:** Have I used proper TypeScript types?
   - No `any` types used?
   - Interfaces/types defined in `/types`?
   - Zod schema if validating data?

3. **Minimal Change:** Is this the smallest necessary change?
   - Am I editing existing code vs rewriting?
   - Can I reuse existing components?
   - Am I modifying only what's needed?

4. **[Project-Specific Check]:** [Question]
   - [Sub-question]
   - [Sub-question]

---

## External Documentation

- [Framework Documentation](URL)
- [Library Documentation](URL)
- [Project-Specific Documentation](URL)

---

**Last Updated:** [Date]
**Version:** [Version]
```

---

## Template 2: Component-Level CLAUDE.md

**Use For:** Component development patterns, UI guidelines

**File:** `/src/components/CLAUDE.md`

**Template:**

```markdown
# Component Development Guidelines

## Documentation Hierarchy

**Parent:** [src/CLAUDE.md](../CLAUDE.md) - Frontend Architecture
**Siblings:**
- [app/CLAUDE.md](../app/CLAUDE.md) - Next.js routing
- [content/CLAUDE.md](../content/CLAUDE.md) - Content components

**Dependencies:**
- [types/CLAUDE.md](../types/CLAUDE.md) - Component prop types
- [lib/CLAUDE.md](../lib/CLAUDE.md) - Utility functions (cn, etc.)

**See Also:** [Root CLAUDE.md](../../CLAUDE.md) for global standards

---

## Overview

This document covers React component development patterns for [Project Name].

**Scope:**
- ✅ Component structure and organization
- ✅ Prop types and interfaces
- ✅ Styling patterns
- ✅ Performance optimization
- ✅ Accessibility
- ❌ Page-level components (see app/CLAUDE.md)
- ❌ API integration (see services/CLAUDE.md)

---

## Components Directory Structure

```
components/
├── ui/                     # Reusable UI primitives
│   ├── button.tsx
│   ├── input.tsx
│   └── ... (more)
├── layout/                 # Page structure components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Layout.tsx
├── [feature]/              # Feature-specific components
│   └── FeatureComponent.tsx
└── [shared components]     # Shared across features
```

**Organization Principles:**
- `/ui/` - Reusable UI primitives ([Component Library] components)
- `/layout/` - Page structure components
- `/[feature]/` - Feature-specific components
- Root level - Shared feature components

**See Also:**
- [Root CLAUDE.md](../../CLAUDE.md) - Component file organization
- [src/CLAUDE.md](../CLAUDE.md) - Component architecture

---

## Component Structure Template

```typescript
// [ComponentName].tsx

// 1. External imports
import React from 'react';
import { type ReactNode } from 'react';

// 2. Internal imports
import { type [TypeName] } from '@/types/[domain]';
import { cn } from '@/lib/utils';

// 3. Component imports
import { Button } from '@/components/ui/button';

// 4. Type definitions
interface [ComponentName]Props {
  // Required props
  title: string;
  items: [TypeName][];

  // Optional props
  className?: string;
  onAction?: (id: string) => void;

  // Children
  children?: ReactNode;
}

// 5. Component definition
export function [ComponentName]({
  title,
  items,
  className,
  onAction,
  children
}: [ComponentName]Props) {
  // 6. Hooks (useState, useEffect, etc.)
  const [isLoading, setIsLoading] = React.useState(false);

  // 7. Handlers
  const handleAction = (id: string) => {
    setIsLoading(true);
    onAction?.(id);
    setIsLoading(false);
  };

  // 8. Early returns (loading, error, empty states)
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (items.length === 0) {
    return <div>No items found</div>;
  }

  // 9. Main render
  return (
    <div className={cn(
      // Base classes
      'flex flex-col gap-4',
      // Conditional classes
      className
    )}>
      <h2>{title}</h2>

      {items.map((item) => (
        <div key={item.id}>
          {/* Item content */}
        </div>
      ))}

      {children}
    </div>
  );
}

// 10. Display name (for debugging)
[ComponentName].displayName = '[ComponentName]';
```

---

## Component Categories

### 1. UI Components (ui/)
**Purpose:** Reusable UI primitives
**Examples:** Button, Input, Dialog, Card
**Characteristics:**
- No business logic
- Highly reusable
- Variant-based styling
- Exported from component library

**Example:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'base-button-classes',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 2. Layout Components (layout/)
**Purpose:** Page structure and navigation
**Examples:** Header, Footer, Sidebar
**Characteristics:**
- Consistent across pages
- May include navigation state
- Usually wrap page content

### 3. Feature Components ([feature]/)
**Purpose:** Feature-specific UI
**Examples:** ItemCard, TaskCard
**Characteristics:**
- Domain-specific logic
- Use services for data
- Compose UI components

---

## Styling Patterns

**For cn() utility usage, see [src/CLAUDE.md](../CLAUDE.md).**

### Component-Specific Styling

**Class Organization:**
```typescript
<div
  className={cn(
    // 1. Base layout classes
    'flex flex-col',
    // 2. Spacing classes
    'gap-4 p-4',
    // 3. Colors/borders
    'bg-[color] border border-[color]',
    // 4. Responsive classes
    'md:flex-row md:gap-6',
    // 5. States
    'hover:bg-[color]',
    // 6. Props/conditional classes
    className
  )}
/>
```

**[Project-Specific Styling Guidelines]**
- [Custom classes]
- [Color system]
- [Spacing system]

---

## State Management

### Local State (useState)
```typescript
const [value, setValue] = useState<string>('');
```

### Complex State (useReducer)
```typescript
type Action =
  | { type: 'SET_VALUE'; value: string }
  | { type: 'RESET' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_VALUE':
      return { ...state, value: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, initialState);
```

### Global State
**See:** [src/CLAUDE.md](../CLAUDE.md) for Context API patterns

---

## State Patterns (Loading, Error, Empty)

### Loading State
```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner />
      <span>Loading...</span>
    </div>
  );
}
```

### Error State
```typescript
if (error) {
  return (
    <div className="error-container">
      <ErrorIcon />
      <p>{error.message}</p>
      <Button onClick={retry}>Retry</Button>
    </div>
  );
}
```

### Empty State
```typescript
if (items.length === 0) {
  return (
    <div className="empty-state">
      <EmptyIcon />
      <p>No items found</p>
    </div>
  );
}
```

---

## Performance Optimization

### React.memo
```typescript
export const ExpensiveComponent = React.memo(
  function ExpensiveComponent({ data }: Props) {
    // Component logic
  },
  // Custom comparison (optional)
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### useMemo
```typescript
const expensiveValue = useMemo(
  () => computeExpensiveValue(data),
  [data] // Dependencies
);
```

### useCallback
```typescript
const handleClick = useCallback(
  (id: string) => {
    // Handler logic
  },
  [/* dependencies */]
);
```

### Lazy Loading
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function Parent() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

## Accessibility

### [Project-Specific Accessibility Requirements]
- [Requirement 1]
- [Requirement 2]

### Basic Accessibility
- ✅ Semantic HTML elements
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Alt text for images

**Example:**
```typescript
<button
  aria-label="Close modal"
  aria-pressed={isOpen}
  onClick={handleClose}
>
  <CloseIcon aria-hidden="true" />
</button>
```

---

## Testing Patterns

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('danger-variant-class');
  });
});
```

---

## Common Patterns

### List Rendering with Keys
```typescript
{items.map((item) => (
  <ItemCard
    key={item.id} // Stable, unique key
    item={item}
  />
))}
```

### Conditional Rendering
```typescript
{isLoggedIn && <UserMenu />}
{isLoggedIn ? <UserMenu /> : <LoginButton />}
```

### Forwarding Refs
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, className, ...props }, ref) {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} className={cn('input-classes', className)} {...props} />
      </div>
    );
  }
);
```

---

## Do's and Don'ts

### DO's ✅
- Use explicit prop types (interfaces)
- Extract reusable components
- Handle loading/error/empty states
- Use semantic HTML
- Test user interactions
- Use React.memo for expensive renders
- Forward refs when needed
- Use TypeScript generics for reusable components

### DON'Ts ❌
- Don't use `any` type → See Root CLAUDE.md Critical Rule #3
- Don't create components over 200 lines
  - **When exceeded:** Extract sub-components, move logic to hooks
- Don't mix business logic with UI
- Don't forget key props in lists
- Don't inline complex calculations (use useMemo)
- Don't create new handlers on every render (use useCallback)

---

## Quick Reference: Component Patterns

| Pattern | When to Use | Example | File Location |
|---------|-------------|---------|---------------|
| UI Component | Reusable primitive | Button, Input | components/ui/ |
| Feature Component | Feature-specific | ItemCard | components/ or app/[feature]/ |
| Layout Component | Page structure | Header, Footer | components/layout/ |
| Client Component | Needs interactivity | Form, Modal | Any (with 'use client') |
| Server Component | Static/data-fetching | List, Detail | app/ (default) |

**Action Keywords:**
- **MUST**: Explicit prop types, forwardRef when needed
- **USE**: cn() for conditional classes, React.memo for expensive renders
- **AVOID**: Components >200 lines, business logic in render
- **PREFER**: Functional components, explicit return types

---

**See Also:**
- [Root CLAUDE.md](../../CLAUDE.md) - Global component standards
- [src/CLAUDE.md](../CLAUDE.md) - Frontend architecture
- [app/CLAUDE.md](../app/CLAUDE.md) - Server/Client component usage
- [types/CLAUDE.md](../types/CLAUDE.md) - Prop type definitions

**Last Updated:** [Date]
```

---

## Template 3: Feature-Level CLAUDE.md

**Use For:** Feature-specific implementation patterns

**File:** `/src/app/[feature]/CLAUDE.md`

**Template:**

```markdown
# [Feature Name] Feature Guidelines

## Documentation Hierarchy

**Parent:** [app/CLAUDE.md](../CLAUDE.md) - Next.js App Router
**Siblings:** [List other feature docs]

**Dependencies:**
- [components/CLAUDE.md](../../components/CLAUDE.md) - UI components
- [services/CLAUDE.md](../../services/CLAUDE.md) - Data services
- [types/CLAUDE.md](../../types/CLAUDE.md) - Feature types

**See Also:** [Root CLAUDE.md](../../../CLAUDE.md) for global standards

---

## Overview

**Feature:** [Feature Name]
**Purpose:** [1-2 sentence feature description]
**Routes:** [List routes in this feature]

**Scope:**
- ✅ [What this feature covers]
- ✅ [What this feature covers]
- ❌ [What this feature doesn't cover]

---

## Route Structure

```
[feature]/
├── page.tsx                 # Feature list/main page
├── [id]/
│   └── page.tsx            # Feature detail page
├── loading.tsx             # Loading state
├── error.tsx               # Error boundary
└── [other routes]
```

---

## Feature Architecture

### Data Flow
```
[Data Source (JSON/API)]
        ↓
    [Service Layer]
        ↓
    [Server Component (page.tsx)]
        ↓ (props)
    [Client Components]
        ↓
    User Interface
```

**Example:**
```typescript
// 1. Service ([FeatureService].ts)
export class [Feature]Service {
  static getAll(): [Type][] {
    return data;
  }

  static getById(id: string): [Type] | undefined {
    return data.find(item => item.id === id);
  }
}

// 2. Server Component (page.tsx)
export default async function [Feature]Page() {
  const items = [Feature]Service.getAll();
  return <[Feature]List items={items} />;
}

// 3. Client Component ([Feature]List.tsx)
'use client';
export function [Feature]List({ items }: { items: [Type][] }) {
  // Client-side interactivity
}
```

---

## Pages

### Main Page (page.tsx)

**Purpose:** [Description]
**Type:** Server Component
**Data Fetching:** [Static/Dynamic]

```typescript
import { [Feature]Service } from '@/services/[Feature]Service';
import { [Feature]List } from '@/components/[Feature]List';

export default async function [Feature]Page() {
  const items = [Feature]Service.getAll();

  return (
    <div>
      <h1>[Feature] List</h1>
      <[Feature]List items={items} />
    </div>
  );
}
```

### Detail Page ([id]/page.tsx)

**Purpose:** [Description]
**Type:** Server Component
**Data Fetching:** [Static/Dynamic with dynamic params]

```typescript
import { notFound } from 'next/navigation';
import { [Feature]Service } from '@/services/[Feature]Service';

export async function generateStaticParams() {
  const items = [Feature]Service.getAll();
  return items.map(item => ({ id: item.id }));
}

export default async function [Feature]DetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const item = [Feature]Service.getById(id);

  if (!item) {
    notFound();
  }

  return (
    <div>
      <h1>{item.name}</h1>
      {/* Detail content */}
    </div>
  );
}
```

---

## Feature-Specific Logic

### [Logic Area 1]
[Description]

```typescript
// Code example
```

### [Logic Area 2]
[Description]

```typescript
// Code example
```

---

## Components

### [Component 1]
**Location:** `components/[feature]/[Component].tsx`
**Purpose:** [Description]
**Type:** Client/Server Component

```typescript
// Component example
```

### [Component 2]
**Location:** `components/[feature]/[Component].tsx`
**Purpose:** [Description]
**Type:** Client/Server Component

---

## State Management

### [State Area 1]
[Description and patterns]

```typescript
// State management example
```

---

## User Interactions

### [Interaction 1]
**Trigger:** [User action]
**Flow:** [Step-by-step flow]

```typescript
// Interaction handling code
```

---

## Edge Cases

### Case 1: [Description]
**Scenario:** [When this happens]
**Handling:** [How to handle]

```typescript
// Edge case handling
```

### Case 2: [Description]
**Scenario:** [When this happens]
**Handling:** [How to handle]

---

## Performance Considerations

- [Consideration 1]
- [Consideration 2]
- [Consideration 3]

---

## Testing

```typescript
// Test examples for feature
```

---

## Common Patterns

### Pattern 1: [Name]
```typescript
// Pattern example
```

### Pattern 2: [Name]
```typescript
// Pattern example
```

---

## Do's and Don'ts

### DO's ✅
- [Feature-specific do]
- [Feature-specific do]

### DON'Ts ❌
- [Feature-specific don't]
- [Feature-specific don't]

---

**See Also:**
- [app/CLAUDE.md](../CLAUDE.md) - General routing patterns
- [components/CLAUDE.md](../../components/CLAUDE.md) - Component development
- [services/CLAUDE.md](../../services/CLAUDE.md) - Data access patterns

**Last Updated:** [Date]
```

---

## Template 4: Navigation Index (CLAUDE-INDEX.md)

**Use For:** Documentation discovery and navigation

**File:** `/CLAUDE-INDEX.md`

**Template:**

```markdown
# CLAUDE.md Documentation Index

**Project:** [Project Name]
**Total Documentation Files:** [Number]
**Last Updated:** [Date]

---

## Quick Navigation

### By Level
- [Level 1: Project Overview](#level-1-project-overview)
- [Level 2: Architecture](#level-2-architecture)
- [Level 3: Domain](#level-3-domain)
- [Level 4: Features](#level-4-features)

### By Topic
- [Frontend](#frontend-documentation)
- [Backend](#backend-documentation)
- [Data & Types](#data--types-documentation)
- [Features](#feature-documentation)

---

## Documentation Hierarchy

```
Level 1: PROJECT OVERVIEW
├── CLAUDE.md (Root) - Project-wide context, critical rules
└── CLAUDE-INDEX.md (This file) - Navigation hub

Level 2: ARCHITECTURE
├── src/CLAUDE.md - Frontend architecture
└── public/data/CLAUDE.md - Data architecture

Level 3: DOMAIN
├── src/app/CLAUDE.md - Next.js routing
│   ├── src/app/api/CLAUDE.md - API routes
│   └── src/app/admin/CLAUDE.md - Admin feature
├── src/components/CLAUDE.md - Component patterns
├── src/content/CLAUDE.md - Content management
├── src/lib/CLAUDE.md - Backend utilities
├── src/types/CLAUDE.md - Type definitions
├── src/services/CLAUDE.md - Data services
└── src/models/CLAUDE.md - MongoDB models

Level 4: FEATURES
├── src/app/items/CLAUDE.md - Items feature
├── src/app/tasks/CLAUDE.md - Tasks feature
├── src/app/guides/CLAUDE.md - Guides feature
├── src/app/combat-sim/CLAUDE.md - Combat simulator
└── src/app/hideout-upgrades/CLAUDE.md - Hideout planner
```

---

## Level 1: Project Overview

### CLAUDE.md (Root)
**Path:** `/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Project-wide context, critical rules, global standards

**Covers:**
- Critical Rules (TypeScript, Tailwind, Zod, etc.)
- Complete Project Structure
- Environment Variables
- Code Modification Philosophy
- Component Creation Strategy
- Development Workflow
- Deployment Process

**Start Here If:** You're new to the project or need global context

---

### CLAUDE-INDEX.md (This File)
**Path:** `/CLAUDE-INDEX.md`
**Lines:** ~[Number]
**Purpose:** Documentation navigation and discovery

**Covers:**
- Complete file listing
- Documentation hierarchy
- Dependency map
- Quick reference guides

**Start Here If:** You're looking for specific documentation

---

## Level 2: Architecture

### src/CLAUDE.md
**Path:** `/src/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Frontend architecture and organization

**Covers:**
- Directory structure
- Component architecture
- State management patterns
- Data fetching patterns
- Styling conventions (cn() utility)
- Performance optimizations
- Error handling

**Dependencies:** Root CLAUDE.md
**Children:** All domain-level docs (app/, components/, etc.)

**Start Here If:** You need to understand overall frontend structure

---

### public/data/CLAUDE.md
**Path:** `/public/data/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Static data architecture

**Covers:**
- JSON data file structure
- Data schemas
- Data relationships
- Update procedures
- Data loading & caching

**Dependencies:** types/CLAUDE.md, services/CLAUDE.md

**Start Here If:** You're working with game data files

---

## Level 3: Domain

### src/app/CLAUDE.md
**Path:** `/src/app/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Next.js App Router patterns

**Covers:**
- App Router structure
- Page component patterns (async params)
- Layout patterns
- Route organization
- Data fetching (Server/Client)
- Loading & error states
- SEO & metadata
- Middleware patterns

**Dependencies:** Root, src/, components/, services/, types/
**Children:** api/, admin/, [feature]/

**Start Here If:** You're creating new routes or pages

---

### src/app/api/CLAUDE.md
**Path:** `/src/app/api/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** API route patterns

**Covers:**
- Route handler patterns
- Authentication & authorization
- Request/Response patterns
- Middleware integration
- Existing routes overview
- Error handling

**Dependencies:** lib/, models/, types/

**Start Here If:** You're building API endpoints

---

### src/app/admin/CLAUDE.md
**Path:** `/src/app/admin/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Admin feature patterns

**Covers:**
- Admin dashboard
- User management
- Content management
- Admin-only patterns
- Health monitoring

**Dependencies:** app/, components/, lib/

**Start Here If:** You're working on admin features

---

### src/components/CLAUDE.md
**Path:** `/src/components/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Component development patterns

**Covers:**
- Component structure template
- Component categories (UI, Layout, Feature)
- Styling patterns
- State management
- Performance (memo, lazy)
- Accessibility
- Testing patterns

**Dependencies:** src/, types/, lib/

**Start Here If:** You're creating React components

---

### src/content/CLAUDE.md
**Path:** `/src/content/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Content/guide creation

**Covers:**
- Guide creation process
- Component vs Markdown guides
- Content standards
- Visual elements
- Interactive components
- SEO optimization
- Quality checklist

**Dependencies:** components/, types/

**Start Here If:** You're creating guides or tutorials

---

### src/lib/CLAUDE.md
**Path:** `/src/lib/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Backend utilities

**Covers:**
- Auth utilities (requireAuth, requireAdmin)
- Database management (MongoDB)
- Validation schemas (Zod)
- Error handling
- Middleware
- Utility functions
- Logging

**Dependencies:** models/, types/

**Start Here If:** You're working with auth, validation, or DB

---

### src/types/CLAUDE.md
**Path:** `/src/types/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** TypeScript type system

**Covers:**
- Core type files
- Type hierarchy
- Type patterns
- NextAuth type augmentation
- Global type declarations
- Type safety guidelines

**Dependencies:** None (foundational)
**Used By:** All other files

**Start Here If:** You're defining or using TypeScript types

---

### src/services/CLAUDE.md
**Path:** `/src/services/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Data service layer

**Covers:**
- Service structure pattern
- Service categories
- Data source patterns
- Error handling
- Caching strategies
- Testing services

**Dependencies:** types/, lib/

**Start Here If:** You're working with data access

---

### src/models/CLAUDE.md
**Path:** `/src/models/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** MongoDB models & schemas

**Covers:**
- Core models
- Schema design patterns
- Index strategies
- Population strategies
- Transaction patterns
- Aggregation pipelines
- Migration strategies

**Dependencies:** lib/, types/

**Start Here If:** You're working with database models

---

## Level 4: Features

### src/app/items/CLAUDE.md
**Path:** `/src/app/items/CLAUDE.md`
**Lines:** ~[Number]
**Purpose:** Items feature implementation

**Covers:**
- Items list/detail pages
- Item filtering & search
- Static generation
- ItemService integration

**Dependencies:** app/, components/, services/

**Start Here If:** You're working on items feature

---

[Repeat for other features: tasks, guides, combat-sim, hideout-upgrades]

---

## Documentation Dependency Map

```
Root CLAUDE.md (Global Standards)
    ↓ (sets standards for all)
    ├─→ src/CLAUDE.md (Frontend Architecture)
    │       ↓ (organizes)
    │       ├─→ app/CLAUDE.md
    │       │       ↓ (uses)
    │       │       ├─→ components/, services/, types/, lib/
    │       │       └─→ Children: api/, admin/, features/
    │       │
    │       ├─→ components/CLAUDE.md
    │       │       ↓ (uses)
    │       │       ├─→ types/, services/, lib/
    │       │
    │       ├─→ content/CLAUDE.md
    │       │       ↓ (uses)
    │       │       ├─→ components/, types/
    │       │
    │       ├─→ services/CLAUDE.md
    │       │       ↓ (uses)
    │       │       ├─→ types/, lib/
    │       │
    │       ├─→ lib/CLAUDE.md
    │       │       ↓ (uses)
    │       │       ├─→ types/, models/
    │       │
    │       ├─→ types/CLAUDE.md (Foundational)
    │       │
    │       └─→ models/CLAUDE.md
    │               ↓ (uses)
    │               ├─→ types/, lib/
    │
    └─→ public/data/CLAUDE.md
            ↓ (uses)
            ├─→ types/, services/
```

---

## Quick Reference Guides

### For New Developers
1. Start with [Root CLAUDE.md](CLAUDE.md)
2. Read [src/CLAUDE.md](src/CLAUDE.md) for architecture
3. Jump to relevant domain doc (components/, app/, etc.)

### For Adding Features
1. Review [app/CLAUDE.md](src/app/CLAUDE.md)
2. Check existing [feature CLAUDE.md](src/app/items/CLAUDE.md) for patterns
3. Reference [components/](src/components/CLAUDE.md) and [services/](src/services/CLAUDE.md)

### For API Development
1. Read [api/CLAUDE.md](src/app/api/CLAUDE.md)
2. Review [lib/CLAUDE.md](src/lib/CLAUDE.md) for auth/validation
3. Check [models/CLAUDE.md](src/models/CLAUDE.md) for DB

### For UI Development
1. Start with [components/CLAUDE.md](src/components/CLAUDE.md)
2. Check [src/CLAUDE.md](src/CLAUDE.md) for styling (cn())
3. Reference [types/CLAUDE.md](src/types/CLAUDE.md) for prop types

---

## Documentation Statistics

- **Total Files:** [Number]
- **Total Lines:** ~[Number]
- **Coverage:** [Percentage]%
- **Last Major Update:** [Date]

---

## Contributing to Documentation

### When to Update
- ✅ Adding new features (create feature CLAUDE.md)
- ✅ Changing patterns (update relevant domain doc)
- ✅ New libraries/versions (update Root)
- ✅ Discovering gaps (create issue or update)

### How to Update
1. Find relevant CLAUDE.md file using this index
2. Follow template structure for that file type
3. Add cross-references (See Also sections)
4. Update this index if adding new file
5. Update "Last Updated" date in modified file

---

**Last Updated:** [Date]
```

---

## Summary: Template Usage Guide

| Template | Use For | Typical Length | Key Sections |
|----------|---------|----------------|--------------|
| Root-Level | Project overview | 200-400 lines | Critical Rules, Project Structure, Standards, Workflow |
| Component-Level | UI patterns | 350-500 lines | Component Structure, Categories, Styling, Performance |
| Feature-Level | Feature implementation | 150-300 lines | Routes, Data Flow, Pages, Logic, Components |
| Navigation Index | Documentation hub | 400-600 lines | Hierarchy, File List, Dependency Map, Quick Refs |

**Template Customization:**
- Replace `[Project Name]`, `[Feature Name]`, etc. with actual values
- Add project-specific sections as needed
- Remove sections not applicable
- Keep consistent formatting across all files

**Cross-Reference Pattern:**
Always include at top:
```markdown
## Documentation Hierarchy
**Parent:** [Link]
**Siblings:** [Links]
**Dependencies:** [Links]
**See Also:** [Links]
```

**Action Keywords to Include:**
- **MUST**: Non-negotiable requirements
- **USE**: Preferred approaches
- **AVOID**: Discouraged practices
- **NEVER**: Forbidden practices

---

*End of Phase 2, Step 7 Report*

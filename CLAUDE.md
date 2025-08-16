# ExfilZone Assistant Project Context

## Project Overview
**ExfilZone Assistant** - A companion app for Contractors Showdown: ExfilZone videogame, providing comprehensive game information, tools, and guides optimized for VR gameplay.

## Critical Rules
1. **Use Tailwind 4.1.7 syntax** - No outdated v3 classes
2. **Use shadcn UI components** - Follow established component library patterns
3. **NEVER use TypeScript 'any'** - ESLint rule forbids it, use proper types

## Project Artifacts
- **Central specification**: artifact `exfilzone-assistant-spec`
- **Tech stack**: React 18, Next.js 15+, Tailwind CSS 4.1.7, shadcn UI
- **Primary language**: JavaScript (developer preference)
- **Deployment**: Vercel

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
- Functional components with hooks
- Explicit prop types with interfaces
- Separate types into `/types` directory
- Use `cn()` utility for className composition

### File Organization
```
component-name/
├── ComponentName.tsx       # Main component
├── ComponentName.types.ts  # Type definitions
└── index.ts               # Barrel export
```

## Data Structure
- **Items**: Weapons, ammo, armor, medical supplies, provisions, misc
- **Tasks**: Quests with objectives, rewards, prerequisites
- **Hideout**: Upgrade zones with requirements and benefits
- **Combat Sim**: Damage calculations, TTK analysis
- **Guides**: Markdown and component-based tutorials

## UI/UX Principles
1. **VR-First Design**
    - Large touch targets (min 44x44px)
    - High contrast military theme
    - Minimal animations to prevent motion sickness
    - Clear typography at VR viewing distances

2. **Military Aesthetic**
    - Olive greens, tactical browns, muted grays
    - Stencil fonts for headers
    - Angular, utilitarian design language
    - Tactical HUD-inspired displays

## Import Conventions
```javascript
// External imports first
import React from 'react';
import { useState, useEffect } from 'react';
import { ArrowRight, Search } from 'lucide-react';

// Internal imports
import { Item } from '@/types/items';
import { cn } from '@/lib/utils';

// Component imports
import Layout from '@/components/layout/Layout';

// Static imports last
import itemsData from '@/data/items.json';
```

## State Management
- React hooks for local state
- Context API for global state (user progress, preferences)
- No external state management libraries in current implementation

## Performance Guidelines
- Use Next.js Image component for all images
- Implement lazy loading for heavy components
- Static generation for data pages
- Dynamic imports for large components

## Testing Approach
- Component testing with React Testing Library
- Focus on user interactions
- Test data transformations and calculations
- Ensure VR compatibility checks

## Common Pitfalls to Avoid
1. Don't use `localStorage` in initial render (SSR compatibility)
2. Always handle loading and error states
3. Validate data from JSON imports
4. Use proper TypeScript discriminated unions for item types
5. Remember mobile responsiveness alongside VR optimization

## Development Workflow
1. Check existing patterns before implementing new solutions
2. Reference design system in `/src/app/globals.css`
3. Use existing utility functions from `/lib`
4. Follow established naming conventions
5. Test on multiple viewport sizes

## External Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn UI](https://ui.shadcn.com)
- [Contractors Showdown: ExfilZone](https://exfilzone.com)

## Questions to Ask Before Implementation
1. Does this follow existing component patterns?
2. Is the solution VR-friendly?
3. Have I used proper TypeScript types?
4. Is this the minimal necessary change?
5. Does it maintain the military aesthetic?

## Current Development Focus
- Completing item database categories
- Enhancing combat simulator accuracy
- Adding more interactive guides
- Improving task tracking system
- Optimizing hideout upgrade planner
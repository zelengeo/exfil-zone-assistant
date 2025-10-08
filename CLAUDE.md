# ExfilZone Assistant Project Context

## Documentation Navigation

📋 **Complete Documentation Index:** [CLAUDE-INDEX.md](CLAUDE-INDEX.md)

**Quick Links:**
- [Frontend Architecture](src/CLAUDE.md) - Component patterns, state management
- [App Router](src/app/CLAUDE.md) - Next.js pages & routing
- [API Routes](src/app/api/CLAUDE.md) - Backend endpoints & authentication
- [Components](src/components/CLAUDE.md) - React component development
- [Game Data](public/data/CLAUDE.md) - JSON schemas & data updates
- [Backend Utilities](src/lib/CLAUDE.md) - Auth, validation, middleware
- [Database Models](src/models/CLAUDE.md) - Mongoose schemas
- [Types](src/types/CLAUDE.md) - TypeScript definitions
- [Services](src/services/CLAUDE.md) - Data access layer
- [Content](src/content/CLAUDE.md) - Guide writing

**See Also:**
- For complete navigation and search capabilities, see [CLAUDE-INDEX.md](CLAUDE-INDEX.md)
- For API endpoint reference, see [API CLAUDE.md](src/app/api/CLAUDE.md)
- For data schemas, see [Data CLAUDE.md](public/data/CLAUDE.md)

---

## Project Overview
**ExfilZone Assistant** - A companion app for Contractors Showdown: ExfilZone videogame, providing comprehensive game information, tools, and guides optimized for VR gameplay.

## Critical Rules
1. **Use Tailwind 4+ syntax** - No outdated v3 classes
2. **Use shadcn UI components** - Follow established component library patterns
3. **NEVER use TypeScript 'any'** - ESLint rule forbids it, use proper types
4. **zod schemas are higher priority source of types** - the new types should not be created if they can be inferred from zod schemas
5. **Prefer EDITING existing code** - Make minimal necessary changes, don't rewrite entire files
6. **Create components INCREMENTALLY** - One component at a time, test and iterate

## Project Artifacts
- **Tech stack**: React 19, Next.js 15+, Tailwind CSS 4+, shadcn UI
- **Primary language**: TypeScript
- **Deployment**: Vercel, Mongodb Atlas

## Environment Variables

Required environment variables for local development and production:

### Authentication (NextAuth)
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000              # App URL (production: https://yourdomain.com)
NEXTAUTH_SECRET=your-secret-key-here           # Generate: openssl rand -base64 32

# OAuth Providers
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Admin Emails (for auto-admin promotion)
ADMIN_EMAIL_1=admin1@example.com
ADMIN_EMAIL_2=admin2@example.com               # Optional
ADMIN_EMAIL_3=admin3@example.com               # Optional
```

### Database
```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

### Rate Limiting (Vercel KV / Upstash Redis)
```bash
# Optional: For production rate limiting
KV_REST_API_URL=https://your-kv-instance.upstash.io
KV_REST_API_TOKEN=your-kv-token
```

### Development
```bash
# Environment mode (auto-detected)
NODE_ENV=development                           # Or 'production'
```

**Setup Instructions:**
1. Copy `.env.example` to `.env.local`
2. Fill in your actual values
3. Never commit `.env.local` to version control
4. See [lib/CLAUDE.md](src/lib/CLAUDE.md) for environment variable type safety

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

## Complete Project Structure

```
exfil-zone-assistant/
├── public/                          # Static assets
│   ├── data/                       # Game data JSON files (~20 files)
│   │   ├── weapons.json           # Weapons database
│   │   ├── ammunition.json        # Ammo types
│   │   ├── armor.json             # Body armor
│   │   ├── helmets.json           # Helmets
│   │   ├── attachments.json       # Weapon mods
│   │   ├── medical.json           # Medical items
│   │   ├── provisions.json        # Food & drink
│   │   ├── task-items.json        # Quest items
│   │   └── CLAUDE.md              # 📋 Data documentation
│   └── images/                     # Image assets
│       └── items/                  # Item images (webp)
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                   # API routes
│   │   │   ├── auth/              # NextAuth handlers
│   │   │   ├── admin/             # Admin endpoints (~7 routes)
│   │   │   ├── corrections/       # Data corrections
│   │   │   ├── feedback/          # User feedback
│   │   │   ├── user/              # User profile (~7 routes)
│   │   │   └── CLAUDE.md          # 📋 API documentation
│   │   ├── admin/                 # Admin dashboard (~7 pages)
│   │   ├── items/                 # Items browser
│   │   ├── tasks/                 # Tasks tracker
│   │   ├── hideout-upgrades/      # Hideout planner
│   │   ├── combat-sim/            # Combat simulator
│   │   ├── guides/                # Guides section
│   │   ├── auth/                  # Auth pages
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   ├── globals.css            # Global styles
│   │   └── CLAUDE.md              # 📋 App Router documentation
│   ├── components/                 # React components (~50+ files)
│   │   ├── ui/                    # shadcn UI components
│   │   ├── layout/                # Layout components
│   │   ├── corrections/           # Correction submission
│   │   └── CLAUDE.md              # 📋 Components documentation
│   ├── content/                    # Static content
│   │   ├── guides/                # Guide markdown files
│   │   └── CLAUDE.md              # 📋 Content documentation
│   ├── lib/                        # Backend utilities
│   │   ├── auth/                  # Auth helpers
│   │   ├── rate-limit/            # Rate limiting
│   │   ├── schemas/               # Zod schemas
│   │   ├── mongodb.ts             # Database connection
│   │   ├── middleware.ts          # API middleware
│   │   ├── errors.ts              # Error classes
│   │   ├── logger.ts              # Logging utility
│   │   └── CLAUDE.md              # 📋 Backend utilities documentation
│   ├── models/                     # Mongoose models
│   │   ├── User.ts                # User model
│   │   ├── Account.ts             # OAuth accounts
│   │   ├── DataCorrection.ts      # Corrections model
│   │   ├── Feedback.ts            # Feedback model
│   │   └── CLAUDE.md              # 📋 Models documentation
│   ├── services/                   # Data services
│   │   ├── ItemService.ts         # Item data access
│   │   └── CLAUDE.md              # 📋 Services documentation
│   ├── types/                      # TypeScript definitions
│   │   ├── items.ts               # Item types
│   │   └── CLAUDE.md              # 📋 Types documentation
│   └── CLAUDE.md                   # 📋 Frontend architecture documentation
├── CLAUDE.md                       # 📋 Root project documentation
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── next.config.js                  # Next.js config
├── tailwind.config.ts              # Tailwind config
└── .env.local                      # Environment variables
```

**Documentation Files (9 total):**
- Root: Project overview, critical rules, code standards
- src/: Frontend architecture patterns
- app/: Next.js App Router conventions
- api/: API route handlers, authentication, validation
- components/: Component patterns, styling
- content/: Guide creation, markdown patterns
- lib/: Backend utilities, auth, middleware
- models/: Database schemas, Mongoose patterns
- services/: Data access layer
- types/: TypeScript type definitions
- public/data/: JSON data schemas, update procedures

## Data Structure
- **Items**: Weapons, ammo, armor, medical supplies, provisions, misc, etc.
- **Tasks**: Quests with objectives, rewards, prerequisites, etc.
- **Hideout**: Upgrade zones with requirements and benefits
- **Combat Sim**: Damage calculations, TTK analysis
- **Guides**: Markdown and component-based tutorials

## UI/UX Principles
1. **VR-First Design**
    - Large touch targets (min 44x44px)
    - High contrast military theme
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

**Examples:**

```typescript
// ✅ DO: Edit existing component to add feature
export function ItemCard({ item, onClick }: ItemCardProps) {
  // Existing code...

  // Add new feature here
  const handleFavorite = () => {
    // New functionality
  };

  return (
    <div>
      {/* Existing JSX... */}
      <button onClick={handleFavorite}>Favorite</button>
    </div>
  );
}

// ❌ DON'T: Rewrite entire component
// (Don't regenerate the whole component just to add one button)
```

## Component Creation Strategy

Follow an incremental approach:

### 1. One Component at a Time
- Create and complete one component before starting the next
- Don't generate bulk scaffolding for entire features
- Focus on quality over quantity

### 2. Test and Iterate
- Test each component individually
- Refine based on testing
- Ensure it works before moving to next component

### 3. Build Progressively
- Start with simplest component
- Add complexity incrementally
- Compose larger features from tested smaller components

**Examples:**

```typescript
// ✅ DO: Create one focused component
export function WeaponCard({ weapon }: WeaponCardProps) {
  return (
    <Card>
      <CardHeader>{weapon.name}</CardHeader>
      <CardContent>{weapon.caliber}</CardContent>
    </Card>
  );
}
// Test this component, then move to next one

// ❌ DON'T: Generate multiple incomplete components at once
// WeaponCard.tsx (empty stub)
// AmmoCard.tsx (empty stub)
// ArmorCard.tsx (empty stub)
// etc...
```

## Quick Reference: Critical Patterns

| Category | Rule | Example |
|----------|------|---------|
| **Types** | Never use `any` | `const data: Item[]` not `const data: any` |
| **Styling** | Tailwind 4+ syntax | Use `cn()` utility for conditional classes |
| **Components** | shadcn UI | Follow established component library patterns |
| **Routing** | Next.js 15+ App Router | Server components by default, client as needed |
| **Validation** | Zod schemas first | `z.object()` then `z.infer<typeof schema>` |
| **Modification** | Edit, don't rewrite | Minimal necessary changes only |
| **Creation** | Incremental | One component at a time, test and iterate |

### Action Keywords for AI Agents

**MUST:**
- Use Tailwind 4+ syntax (no v3 classes)
- Use shadcn UI components
- Avoid TypeScript `any` type
- Infer types from Zod schemas
- Edit existing code (don't rewrite)
- Create components incrementally

**PREFER:**
- Server components over client components
- Static generation for data pages
- Existing utility functions from `/lib`
- TypeScript discriminated unions for complex types

**AVOID:**
- String concatenation for className
- Inline prop types without interfaces
- Using `localStorage` in initial render
- Rewriting entire files for small changes
- Generating bulk scaffolding

**NEVER:**
- Use TypeScript `any` type
- Use Tailwind v3 syntax
- Refactor unrelated code while adding features
- Create multiple incomplete components at once

## Deployment

### Hosting Platform
- **Frontend & API**: Vercel (automatic deployments)
- **Database**: MongoDB Atlas
- **Rate Limiting**: Vercel KV (Upstash Redis)
- **OAuth**: Discord & Google OAuth 2.0

### Build Process
```bash
# Development
npm run dev                  # Start dev server (localhost:3000)

# Production Build
npm run build               # Next.js production build
npm run start               # Start production server

# Linting & Type Checking
npm run lint                # ESLint check
npm run type-check          # TypeScript compilation check
```

### Pre-deployment Checklist
1. ✅ All tests passing: `npm test`
2. ✅ No linting errors: `npm run lint`
3. ✅ Type check passes: `npm run type-check`
4. ✅ Production build succeeds: `npm run build`
5. ✅ Environment variables set in Vercel
6. ✅ MongoDB Atlas connection string updated
7. ✅ OAuth redirect URIs configured
8. ✅ Rate limiting configured (if using KV)

### Deployment Workflow
```bash
# Automatic deployment via Git
git add .
git commit -m "Description of changes"
git push origin main        # Triggers Vercel deployment

# Vercel will:
# 1. Run build process
# 2. Run type checking
# 3. Deploy to production (main branch)
# 4. Deploy to preview (other branches)
```

### Environment-Specific Behavior
- **Development** (`NODE_ENV=development`):
  - Detailed error messages
  - Source maps enabled
  - Hot module reloading
  - Debug logging

- **Production** (`NODE_ENV=production`):
  - Minified bundles
  - Error details hidden
  - Performance optimizations
  - Rate limiting enforced

### Vercel Configuration
Create `vercel.json` for custom settings:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

## External Documentation

### Official Framework Documentation
- **Next.js 15+**: [nextjs.org/docs](https://nextjs.org/docs) - App Router, Server Components, API Routes
- **React 19**: [react.dev](https://react.dev) - Hooks, Components, Concurrent Features
- **TypeScript**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs) - Type System, Advanced Types
- **Tailwind CSS 4+**: [tailwindcss.com/docs](https://tailwindcss.com/docs) - Utility Classes, Configuration
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com) - Component Library, Installation

### Database & Authentication
- **MongoDB**: [docs.mongodb.com](https://docs.mongodb.com) - Query Language, Aggregation
- **Mongoose**: [mongoosejs.com/docs](https://mongoosejs.com/docs) - Schema Definition, Models
- **NextAuth.js**: [next-auth.js.org](https://next-auth.js.org) - OAuth Providers, Session Management
- **Zod**: [zod.dev](https://zod.dev) - Schema Validation, Type Inference

### Deployment & Infrastructure
- **Vercel**: [vercel.com/docs](https://vercel.com/docs) - Deployment, Edge Functions, Environment Variables
- **Vercel KV**: [vercel.com/docs/storage/vercel-kv](https://vercel.com/docs/storage/vercel-kv) - Redis, Rate Limiting

### Game-Specific Resources
- **Contractors Showdown: ExfilZone**: [exfilzone.com](https://exfilzone.com) - Official Game Website
- **Game Wiki** (if available): Community-maintained game documentation
- **Discord Community**: Player guides and discussions

### UI/UX Resources
- **Radix UI**: [radix-ui.com](https://radix-ui.com) - Unstyled component primitives (used by shadcn)
- **Lucide Icons**: [lucide.dev](https://lucide.dev) - Icon library
- **VR Design Guidelines**: Best practices for VR readability and interaction

### Monitoring & Logs
- **Vercel Dashboard**: Deployment logs, runtime logs
- **MongoDB Atlas**: Database metrics, query performance
- **Application Logs**: Custom logger outputs (see lib/logger.ts)

## External Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn UI](https://ui.shadcn.com)
- [Contractors Showdown: ExfilZone](https://exfilzone.com)
- [Vercel Deployment](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

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
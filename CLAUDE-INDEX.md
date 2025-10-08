# CLAUDE.md Documentation Index

## Overview

Complete navigation hub for all ExfilZone Assistant documentation files. This index provides quick access to all CLAUDE.md files, their purposes, and key topics covered.

**Total Documentation Files:** 11
**Total Documentation Lines:** ~7,000+ lines
**Last Updated:** 2025-10-08

---

## Quick Navigation by Use Case

### 🚀 Getting Started
1. Start here: [Root CLAUDE.md](#1-root-claudemd) - Project overview & critical rules
2. Setup: [Environment Variables](#environment-setup) in Root
3. Architecture: [Frontend Architecture](#3-src-claudemd) - How the app is structured

### 💻 Frontend Development
- [Components](#6-components-claudemd) - React component patterns
- [App Router](#4-app-claudemd) - Next.js page development
- [Styling](#styling-references) - Tailwind & shadcn UI patterns

### 🔧 Backend Development
- [API Routes](#5-api-claudemd) - Creating API endpoints
- [Authentication](#authentication-references) - Auth patterns & middleware
- [Database](#backend-utilities) - MongoDB & Mongoose

### 📊 Data Management
- [Game Data](#2-data-claudemd) - JSON data schemas & updates
- [Types](#9-types-claudemd) - TypeScript definitions
- [Services](#8-services-claudemd) - Data access layer

### 📝 Content Creation
- [Guides](#7-content-claudemd) - Writing markdown guides
- [Components](#interactive-components) - Interactive guide components

---

## Documentation Hierarchy

```
CLAUDE.md (Root)                    ⭐ START HERE
├── src/CLAUDE.md                   Frontend Architecture
│   ├── app/CLAUDE.md              App Router & Pages
│   │   └── api/CLAUDE.md          API Routes
│   ├── components/CLAUDE.md       React Components
│   ├── content/CLAUDE.md          Content & Guides
│   ├── lib/CLAUDE.md              Backend Utilities
│   ├── models/CLAUDE.md           Database Models
│   ├── services/CLAUDE.md         Data Services
│   └── types/CLAUDE.md            TypeScript Types
└── public/data/CLAUDE.md          Game Data JSON
```

---

## Documentation Files

### 1. Root CLAUDE.md

**Path:** `/CLAUDE.md`
**Purpose:** Project overview, critical rules, code standards
**Lines:** ~470 lines
**Priority:** ⭐⭐⭐⭐⭐ Critical - Read First

**Key Topics:**
- Critical Rules (6 rules)
  - Tailwind 4+ syntax
  - shadcn UI components
  - Never use TypeScript `any`
  - Zod schemas first
  - Prefer editing over rewriting
  - Incremental component creation
- Complete Project Structure
- Environment Variables
- Code Standards
- Code Modification Best Practices
- Component Creation Strategy
- Quick Reference Tables
- Deployment Guide
- VR-First Design Principles
- Military Aesthetic Guidelines

**Quick Links:**
```typescript
// Import conventions
import { Item } from '@/types/items';
import { cn } from '@/lib/utils';

// Code modification examples
// Component creation patterns
```

**When to Use:**
- Starting new work on the project
- Understanding project philosophy
- Reference for critical rules
- Environment setup
- Deployment procedures

---

### 2. Data CLAUDE.md

**Path:** `/public/data/CLAUDE.md`
**Purpose:** Game data JSON schemas & update procedures
**Lines:** ~850 lines
**Priority:** ⭐⭐⭐⭐⭐ Critical for Data Updates

**Key Topics:**
- Directory structure (20+ JSON files)
- Data schemas for:
  - Weapons (50+ items)
  - Ammunition (100+ types)
  - Armor (40+ items)
  - Helmets, attachments, medical, provisions, etc.
- Data relationships (weapons ↔ calibers ↔ ammo)
- Update procedures
- Validation requirements
- Performance optimization
- Common issues & solutions

**File Schemas Documented:**
- `weapons.json` - Weapons with stats, recoil, calibers
- `ammunition.json` - Ammo with damage, penetration, ballistics
- `armor.json` - Body armor with protection values
- `helmets.json` - Helmets with ricochet, compatibility
- `attachments.json` - Weapon mods with stat modifiers
- `medical.json` - Healing items with effects
- `provisions.json` - Food/drink with buffs
- `task-items.json` - Quest items with locations

**When to Use:**
- Adding new game items
- Updating item stats/balance
- Understanding data relationships
- Data validation
- Troubleshooting data issues

---

### 3. src/ CLAUDE.md

**Path:** `/src/CLAUDE.md`
**Purpose:** Frontend architecture patterns
**Lines:** ~230 lines
**Priority:** ⭐⭐⭐⭐ High

**Key Topics:**
- Directory structure overview
- Component architecture (3 categories)
- State management patterns (local, complex, global)
- Data fetching patterns (static, dynamic, mixed)
- Styling conventions (cn() utility)
- Performance optimizations
- Error handling
- Accessibility & VR optimization
- File naming conventions
- Import order
- Testing patterns

**Component Categories:**
1. Layout Components (Header, Footer, Layout)
2. UI Components (shadcn - 25+ components)
3. Feature Components (domain-specific logic)

**When to Use:**
- Understanding frontend architecture
- Component organization questions
- State management decisions
- Performance optimization
- Styling approach

---

### 4. App CLAUDE.md

**Path:** `/src/app/CLAUDE.md`
**Purpose:** Next.js App Router conventions
**Lines:** ~400 lines
**Priority:** ⭐⭐⭐⭐ High

**Key Topics:**
- Directory structure (routes, API, layouts)
- Page component patterns
- Metadata generation (SEO)
- Static params generation
- Layout patterns (root, nested)
- Route organization (groups, dynamic routes)
- Data fetching (server vs client components)
- Loading & error states
- File conventions
- Common patterns (search, infinite scroll)

**Route Types:**
- Static routes
- Dynamic routes `[id]`
- Catch-all routes `[...slug]`
- Route groups `(group)`

**When to Use:**
- Creating new pages
- Understanding routing
- SEO/metadata setup
- Loading states
- Error boundaries

---

### 5. API CLAUDE.md

**Path:** `/src/app/api/CLAUDE.md`
**Purpose:** API route handlers, authentication, validation
**Lines:** ~1050 lines
**Priority:** ⭐⭐⭐⭐⭐ Critical for Backend

**Key Topics:**
- Directory structure (17 API routes)
- Route handler patterns (GET, POST, PATCH, DELETE)
- Authentication patterns
  - `requireAuth()` - Basic auth
  - `requireAdmin()` - Admin only
  - `requireAuthWithUserCheck()` - With DB verification
- Request validation (Zod schemas)
- Rate limiting (withRateLimit middleware)
- Error handling & responses
- Response typing
- Database operations
- Dynamic routes
- NextAuth integration

**All API Routes Documented:**
- `/api/auth/[...nextauth]` - OAuth authentication
- `/api/user/*` - User profile (7 routes)
- `/api/corrections/*` - Data corrections
- `/api/feedback` - User feedback
- `/api/admin/*` - Admin endpoints (7 routes)
- `/api/rate-limit/status` - Rate limit check

**When to Use:**
- Creating API endpoints
- Authentication implementation
- Request validation
- Error handling
- Rate limiting setup

---

### 6. Components CLAUDE.md

**Path:** `/src/components/CLAUDE.md`
**Purpose:** React component development patterns
**Lines:** ~425 lines
**Priority:** ⭐⭐⭐⭐ High

**Key Topics:**
- Components directory structure (35+ files)
- Component categories:
  - UI components (shadcn - 25 files)
  - Layout components (3 files)
  - Feature components (7+ files)
- Basic component template
- Component rules (props, hooks, handlers)
- Pattern catalog:
  - Server/client components
  - Form components
  - Data display components
  - Interactive components
- Styling patterns (cn() utility)
- State management
- Error boundaries
- VR accessibility
- Testing approach
- Best practices (DO's & DON'Ts)

**shadcn UI Components Available:**
- Form: button, input, textarea, select, checkbox, switch, form
- Display: card, badge, avatar, separator, table, tabs
- Overlay: dialog, alert-dialog, sheet, tooltip
- Navigation: navigation-menu, dropdown-menu
- Feedback: alert, progress, skeleton, sonner (toast)
- Utility: scroll-area

**When to Use:**
- Creating new components
- Component organization
- Styling components
- State management in components
- Form handling

---

### 7. Content CLAUDE.md

**Path:** `/src/content/CLAUDE.md`
**Purpose:** Content creation & guide writing
**Lines:** ~525 lines
**Priority:** ⭐⭐⭐ Medium

**Key Topics:**
- Directory structure (guides, markdown files)
- Guide types (walkthrough, reference, tutorial)
- File structure & metadata
- Writing guidelines (tone, style, VR-friendly)
- Markdown best practices
- Component-based guides
- Common patterns:
  - Embedding images
  - Info boxes (success, warning, info, danger)
  - Interactive components (calculators, collapsible)
  - Video embedding
  - Tables & lists
- Related guides component
- Table of contents
- Best practices

**Guide Categories:**
- Gameplay guides
- Mechanics explanations
- Item comparisons
- Map guides
- Strategy guides

**When to Use:**
- Writing new guides
- Embedding interactive elements
- Markdown formatting
- Guide structure decisions

---

### 8. Services CLAUDE.md

**Path:** `/src/services/CLAUDE.md`
**Purpose:** Data service layer patterns
**Lines:** ~200 lines
**Priority:** ⭐⭐⭐ Medium

**Key Topics:**
- Service layer purpose
- ItemService patterns
- Data loading from JSON
- Data transformation
- Caching strategies
- Service organization
- Error handling in services
- Service best practices

**Services:**
- ItemService - Game items data access
- (Other services can be added following pattern)

**When to Use:**
- Accessing game data
- Creating new data services
- Data transformation logic
- Caching implementation

---

### 9. Types CLAUDE.md

**Path:** `/src/types/CLAUDE.md`
**Purpose:** TypeScript type definitions
**Lines:** ~350 lines
**Priority:** ⭐⭐⭐⭐ High

**Key Topics:**
- Type organization
- Zod schema first approach
- Type inference patterns
- Common types:
  - Item types (weapons, armor, ammo)
  - User types
  - API types
  - Component prop types
- Type utilities
- Discriminated unions
- Type guards
- Best practices

**Type Categories:**
- Domain types (items, tasks, users)
- API types (requests, responses)
- Component types (props, state)
- Utility types (helpers, generics)

**When to Use:**
- Creating new types
- Type inference from Zod
- Understanding existing types
- Type organization decisions

---

### 10. Lib CLAUDE.md

**Path:** `/src/lib/CLAUDE.md`
**Purpose:** Backend utilities, auth, middleware
**Lines:** ~750 lines
**Priority:** ⭐⭐⭐⭐⭐ Critical for Backend

**Key Topics:**
- Directory structure (auth, schemas, utilities)
- Authentication utilities:
  - `requireAuth()` - Basic authentication
  - `requireAuthWithUserCheck()` - With DB check
  - `requireAdmin()` - Admin access
  - `requireAdminOrModerator()` - Role-based
- Database management (MongoDB connection)
- Schemas directory structure (6 schema files)
- Validation schemas (Zod patterns)
- Standard API error response format
  - HTTP status codes (400, 401, 403, 404, 409, 429, 500)
  - Error response examples
  - Success response examples
- Error handling (custom error classes)
- Middleware (rate limiting)
- Utility functions (cn, sanitization)
- Logger configuration
- Best practices

**Schema Files:**
- `core.ts` - Shared schemas (pagination, success, error)
- `user.ts` - User schemas (~500 lines)
- `dataCorrection.ts` - Correction schemas (~350 lines)
- `feedback.ts` - Feedback schemas (~250 lines)
- `task.ts` - Task schemas (~100 lines)
- `guards.ts` - Type guards (~15 lines)

**When to Use:**
- Authentication implementation
- Creating schemas/types
- Error handling setup
- Middleware configuration
- Utility function reference

---

### 11. Models CLAUDE.md

**Path:** `/src/models/CLAUDE.md`
**Purpose:** Mongoose database models
**Lines:** ~300 lines
**Priority:** ⭐⭐⭐⭐ High

**Key Topics:**
- Model directory structure
- Schema patterns (Mongoose)
- Model definitions:
  - User model
  - Account model (OAuth)
  - DataCorrection model
  - Feedback model
- Schema validation
- Timestamps & versioning
- Indexes & performance
- Model methods & statics
- Population & references
- Best practices

**Models:**
- User - User accounts, profiles, roles
- Account - OAuth provider connections
- DataCorrection - User-submitted corrections
- Feedback - User feedback & bug reports

**When to Use:**
- Creating database models
- Understanding schema structure
- Model relationships
- Database queries
- Index optimization

---

## Topic Index

### Authentication & Authorization
- Root: Critical Rules
- API: Authentication Patterns (requireAuth, requireAdmin)
- Lib: Authentication Utilities (detailed implementation)
- Models: User model, roles

### Data Management
- Data: JSON schemas, update procedures
- Types: Type definitions
- Services: Data access layer
- Models: Database models

### Frontend Development
- src/: Frontend architecture
- App: Page routing & layouts
- Components: Component patterns
- Content: Guide writing

### Backend Development
- API: Route handlers
- Lib: Utilities, middleware, auth
- Models: Database schemas

### Validation & Types
- Lib: Zod schemas
- Types: TypeScript types
- API: Request/response validation

### Error Handling
- Lib: Error classes, standard formats
- API: Error responses
- Root: Best practices

### Styling & Design
- Root: VR-First design, military aesthetic
- Components: Styling patterns (cn utility)
- src/: Tailwind conventions

### Environment & Deployment
- Root: Environment variables, deployment guide
- API: Environment-specific behavior

---

## Reference Tables

### Documentation Priority Matrix

| Priority | Files | When to Read |
|----------|-------|--------------|
| ⭐⭐⭐⭐⭐ | Root, API, Lib, Data | First time, critical reference |
| ⭐⭐⭐⭐ | App, Components, Types, Models | Regular development |
| ⭐⭐⭐ | src/, Content, Services | Specific tasks |

### File Size Reference

| File | Lines | Content Density |
|------|-------|-----------------|
| API | ~1050 | High (17 routes documented) |
| Data | ~850 | High (20+ schemas) |
| Lib | ~750 | High (auth, schemas, errors) |
| Content | ~525 | Medium (guide patterns) |
| Root | ~470 | High (critical rules, setup) |
| Components | ~425 | Medium (35+ components) |
| App | ~400 | Medium (routing patterns) |
| Types | ~350 | Medium (type patterns) |
| Models | ~300 | Medium (4 models) |
| src/ | ~230 | Medium (architecture) |
| Services | ~200 | Low (1 service) |

### Documentation Coverage

| Area | Coverage | Files |
|------|----------|-------|
| API Routes | 100% | API |
| Game Data | 100% | Data |
| Authentication | 100% | API, Lib |
| Components | 95% | Components |
| Pages/Routing | 90% | App |
| Database | 90% | Models, Lib |
| Types | 85% | Types, Lib |
| Services | 60% | Services |
| Testing | 40% | Mentioned in multiple files |

---

## Search Guide

### By Technology

**React/Next.js:**
- Root: Project artifacts, critical rules
- src/: Frontend architecture
- App: Next.js App Router
- Components: React patterns

**TypeScript:**
- Root: Critical Rule #3 (no `any`)
- Types: Type definitions
- Lib: Zod schemas, type inference

**Tailwind CSS:**
- Root: Critical Rule #1, styling conventions
- Components: cn() utility, styling patterns
- src/: Custom styles

**MongoDB/Mongoose:**
- Lib: Database connection
- Models: Schema definitions
- API: Database operations

**Authentication (NextAuth):**
- Root: Environment variables
- API: NextAuth integration, route protection
- Lib: Auth utilities (requireAuth, requireAdmin)

**Validation (Zod):**
- Root: Critical Rule #4
- Lib: Schema patterns
- API: Request validation
- Types: Type inference

### By Action

**Creating new...**
- Page: App → Page component pattern
- API route: API → Route handler pattern
- Component: Components → Component template
- Database model: Models → Schema pattern
- Type: Types → Type organization
- Guide: Content → Guide structure

**Understanding...**
- Project structure: Root → Complete project structure
- Data flow: src/ → Data fetching patterns
- Error handling: Lib → Error classes, API → Error responses
- Authentication: API → Auth patterns, Lib → Auth utilities

**Troubleshooting...**
- Data issues: Data → Common issues & solutions
- API errors: API → Error handling, Lib → Error format
- Type errors: Types → Type utilities, Root → Critical rules

---

## Contributing to Documentation

### When to Update CLAUDE.md Files

1. **Adding new features** - Document in relevant file
2. **Changing patterns** - Update pattern documentation
3. **New best practices** - Add to appropriate file
4. **Bug fixes** - Update if pattern was wrong
5. **New tools/libraries** - Update Root artifacts

### Documentation Standards

- Use consistent formatting (see Root for examples)
- Include code examples
- Provide DO/DON'T examples
- Cross-reference related files
- Keep TOC updated
- Update this index when adding files

### File Naming Convention

- Main docs: `CLAUDE.md`
- This index: `CLAUDE-INDEX.md`
- All caps for discoverability
- Place in relevant directory

---

## Quick Commands

### Find Documentation
```bash
# Find all CLAUDE.md files
find . -name "CLAUDE.md" -type f

# Search for topic across all docs
grep -r "authentication" --include="CLAUDE.md"

# Count documentation lines
find . -name "CLAUDE.md" -exec wc -l {} +
```

### Navigate to Docs
```bash
# Root
cat CLAUDE.md

# API
cat src/app/api/CLAUDE.md

# Data schemas
cat public/data/CLAUDE.md
```

---

## Version History

**v1.0.0 - 2025-10-08**
- Initial comprehensive index
- 11 documentation files indexed
- ~7,000+ total documentation lines
- Complete navigation structure
- Topic and search guides added

---

## Need Help?

1. **Start with Root CLAUDE.md** - Critical rules and overview
2. **Check this index** - Find relevant documentation file
3. **Use topic index** - Find by subject
4. **Use search guide** - Find by technology or action
5. **Check examples** - All files have code examples

**Most Common Starting Points:**
- New to project? → Root CLAUDE.md
- Creating page? → App CLAUDE.md
- Creating API? → API CLAUDE.md
- Working with data? → Data CLAUDE.md
- Styling question? → Components CLAUDE.md

---

**Last Updated:** 2025-10-08
**Maintained by:** ExfilZone Assistant Team
**Total Documentation:** 11 files, ~7,000+ lines, 100% of critical areas covered

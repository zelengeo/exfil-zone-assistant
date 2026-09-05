# Frontend Architecture

How the client half is arranged, and the few conventions that are not obvious from reading a file.

## Layers

- `app/` — routes. A route owns its components in `app/<route>/components/` and its logic in
  `app/<route>/utils/`; both stay there until a second route needs them.
- `components/` — shared across routes. `ui/` is shadcn; the rest are grouped by domain
  (`items/`, `tasks/`, `trade/`, `protection/`, `gunsmith/`, `corrections/`, `profile/`, `layout/`).
- `lib/` — request plumbing and pure game logic. See [lib/AGENTS.md](lib/AGENTS.md).
- `services/` — how data is reached. See [services/AGENTS.md](services/AGENTS.md).
- `data/`, `types/`, `hooks/`, `config/`, `content/`.

## Reading game data

```typescript
import { loadDataFile } from '@/services/dataFiles';
const weapons = await loadDataFile<Weapon[]>('weapons.json');
```

Never `import` a file from `public/data`. The bundler inlines the same bytes into a client chunk,
which is how the database once shipped twice across 16 chunks. `dataFiles.ts` explains the whole
trap in its header; `ItemService` already goes through it.

## Client state

There is no state library, and no React Context outside shadcn internals. Progress and preferences
are localStorage, reached through two layers:

- `services/StorageService.ts` owns every key, the game-version check, and wipe semantics. Storage
  is a text file a user can edit, so everything read back out of it is validated.
- Per-route hooks — `useTaskProgress`, `useSavedBuilds`, `useDensity` — wrap it in
  `useSyncExternalStore` over a module-level store, and expose `hydrated`.

Render the pre-hydration state and swap once `hydrated` is true. Reading `localStorage` during the
first render breaks SSR.

## Styling

Compose with `cn()`, never string concatenation, so later classes can override earlier ones:

```tsx
<div className={cn('military-box p-4', isActive && 'border-olive-400')}>
```

Shared component classes live in `@layer components` in `app/globals.css`. Casing is a CSS concern:
the `micro-label` and `eyebrow` utilities uppercase, so data keeps its own casing.

## VR and touch

- Touch targets at least 44x44px, and the phone row height exists for this reason
- Contrast for a dim headset panel, not a calibrated monitor
- Keyboard focus stays visible
- Mobile matters as much as VR

## Conventions

- **Components** are `PascalCase.tsx`, hooks are `useThing.ts`, utilities are `camelCase.ts`.
- **Types** go in `src/types/`, or are inferred from a zod schema. There is no
  `ComponentName.types.ts` convention — nothing in the repo uses one.
- **Imports** in order: external packages, internal aliases (`@/`), relative, then types.
- Prefer server components; add `'use client'` only when the component needs it.
- Data pages are statically generated. Keep them that way.

## Tests

`npm test` runs Vitest over `src/**/*.test.ts`, in a node environment — the suites cover pure
modules, route handlers over mocked persistence, and the published data, not components. Put a spec
beside the module it checks.

A `*.integration.test.ts` needs a database and skips itself unless `MONGODB_URI` is the loopback
replica set, so `npm test` stays offline. `npm run verify:local` is what runs them.

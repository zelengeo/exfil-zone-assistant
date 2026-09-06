# Frontend Architecture

How the client half is arranged, and the few conventions that are not obvious from reading a file.

## Layers

- `app/` — routes. A route owns its components in `app/<route>/components/` and its logic in
  `app/<route>/utils/`; both stay there until a second route needs them.
- `components/` — shared across routes. `ui/` is shadcn, with one hand-rolled exception
  (`ui/slider.tsx`, whose header says why); the rest are grouped by domain
  (`items/`, `tasks/`, `trade/`, `protection/`, `gunsmith/`, `layout/`).
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

For UI work, read the [Cold Steel guide](../docs/design/README.md) before choosing tokens,
layout or interaction patterns. It owns the shared styling, VR/touch rules and verification steps.
For explanatory copy, follow the [disclosure ladder](components/ui/AGENTS.md).

## Conventions

- **Components** are `PascalCase.tsx`, hooks are `useThing.ts`, utilities are `camelCase.ts`.
- **Types** go in `src/types/`, or are inferred from a zod schema. There is no
  `ComponentName.types.ts` convention — nothing in the repo uses one.
- **Imports** in order: external packages, internal aliases (`@/`), relative, then types.
- Prefer server components; add `'use client'` only when the component needs it.
- Data pages are statically generated. Keep them that way.

## Tests

`npm test` runs the suites selected by `vitest.config.ts` in a Node environment: game data, backend
contracts, operational scripts and server-rendered profile checks. Put a spec beside its module.

A `*.integration.test.ts` needs a database and skips itself unless `MONGODB_URI` is the loopback
replica set, so `npm test` stays offline. `npm run verify:local` is what runs them.

# ExfilZone Assistant

Companion web app for *Contractors Showdown: ExfilZone*, a VR extraction shooter. Item database,
task chains, hideout planner, combat simulator, guides. Read mostly by players on a phone beside a
headset, or in the headset's own browser.

Stack, scripts and dependencies live in `package.json`; the layout is the directory tree. This file
carries only what neither of those can tell you.

## Documentation map

Every route and layer keeps its own `CLAUDE.md` next to the code it describes. Read the one covering
what you are touching. `src/app/tasks/CLAUDE.md` is the house style: cache the reasoning and the
gotchas, point at the script rather than restating it.

Non-obvious ones worth reaching for by name:

- `public/data/CLAUDE.md` — item JSON schemas, and the procedure for a game-version data update
- `src/app/combat-sim/CLAUDE.md` — damage, penetration and TTK model
- `src/app/tasks/CLAUDE.md` — the chain DAG, and why there are no status tabs
- `src/lib/CLAUDE.md` — auth, middleware, rate limiting, zod schemas
- `src/models/CLAUDE.md` — Mongoose schemas

## Critical rules

1. **Tailwind 4+ syntax.** No v3 classes. Compose conditionals with `cn()`.
2. **shadcn/ui components** from `src/components/ui/` before hand-rolling one.
3. **Type everything.** ESLint forbids `any`; reach for `unknown` when a type is genuinely unknown.
4. **Zod schemas are the source of truth for types.** Infer with `z.infer<typeof schema>` rather
   than declaring a parallel type by hand.
5. **Edit the existing file.** Make the smallest change that does the job, keep the surrounding
   patterns, and leave unrelated code alone.
6. **One component at a time.** Build it, check it, then start the next.

## Where game data lives

Split, for historical reasons that surprise everyone who meets it:

- **`public/data/*.json`** — every item category (weapons, ammunition, armor, helmets, attachments,
  medical, provisions, task-items). Every reader goes through `loadDataFile` in
  `src/services/dataFiles.ts`. Never `import` these files: the bundler inlines the same bytes into
  client chunks, which once shipped the database twice over 16 chunks for no gain. That
  file has a header comment explaining the whole trap.
- **`src/data/tasks.ts`** — 227 tasks as a hand-maintained TypeScript module, not JSON, not
  generated. 12 files import `tasksData` directly.
- **`src/data/hideout-upgrades.ts`**, `community.ts`, `taskInconsistencies.json` — same treatment.

`npm run validate-data` checks the JSON; `npm run verify-chains` checks the task DAG's invariants.
Run the matching one after touching either.

## Client state and persistence

There is no state library, and no React Context outside shadcn internals. Player progress is
localStorage, reached through two layers:

- **`src/services/StorageService.ts`** owns every storage key, the game-version check, and wipe
  semantics (progress keys clear on a wipe; builds and preferences survive). Storage is a text file
  a user can edit, so everything read back out of it is validated before use.
- **Per-route hooks** — `useTaskProgress`, `useSavedBuilds`, `useDensity` — wrap it in
  `useSyncExternalStore` over a module-level store, and expose a `hydrated` flag that stays false
  until storage has been read on the client.

Render the pre-hydration state first and swap once `hydrated` is true. Reading `localStorage` during
the initial render breaks SSR.

## VR-first design

Players read this through a headset or one-handed on a phone mid-raid.

- Touch targets at least 44x44px
- High contrast; assume a dim, low-fidelity panel rather than a calibrated monitor
- Type large enough to read at VR viewing distance — err a step bigger than a desktop app would
- Mobile responsiveness matters as much as VR; both, not one

## Military aesthetic

Olive greens, tactical browns, muted greys. Stencil faces for headers. Angular and utilitarian, a
tactical HUD rather than a consumer dashboard. The design tokens are in `src/app/globals.css`.

## Conventions

- **Imports** in order: external packages, then internal (`@/types`, `@/lib`), then components, then
  static data.
- **Components** live flat in `src/app/<route>/components/` when a route owns them, and in
  `src/components/<domain>/` once a second route needs them. Types go in `src/types/`.
- **Images** go through `next/image`.
- **Data pages** are statically generated; keep them that way.
- Prefer server components; reach for `'use client'` when the component actually needs it.

## Gotchas

- Item types are discriminated unions — narrow on the discriminant, don't cast.
- `next.config.ts` and `tailwind.config.js` — the extensions are not the pair you would guess.
- `eslint.config.mjs` spreads `eslint-config-next` flat configs directly; wrapping them in
  `FlatCompat` crashes ESLint. The file says so at the top.
- Handle loading and error states on every data path; JSON from `public/data` is validated, not
  trusted.

## Environment

`.env.local` for development. Required: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, the Discord and Google
OAuth client id/secret pairs, and `MONGODB_URI`.

Rate limiting picks its backend in `src/lib/rate-limit/rate-limit-factory.ts`: Vercel KV only when
`NODE_ENV` is production and both `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set, otherwise an
in-memory limiter. Development is always in-memory, so a limit that holds locally proves nothing
about production.

`ADMIN_EMAIL_1` through `ADMIN_EMAIL_3` promote those accounts to admin on sign-in, checked in
`src/app/api/auth/[...nextauth]/route.ts`. That is how the first admin is created; after that, an
existing admin can grant roles through the admin users API.

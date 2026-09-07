# ExfilZone Assistant

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-2EA44F)](LICENSE)

A companion web app for *Contractors Showdown: ExfilZone*. It combines the game's item catalogue,
task chains, hideout planning, weapon assembly, combat modelling, and field guides in an interface
designed for phones and VR browsers.

[Live app](https://www.exfil-zone-assistant.app) ·
[Issues](https://github.com/zelengeo/exfil-zone-assistant/issues) ·
[Discord](https://discord.gg/2FCDZK6C25)

## What is included

| Area | What it does |
|---|---|
| [Items](https://www.exfil-zone-assistant.app/items) | Browse weapons, ammunition, protection, attachments, consumables, carried gear, and task items with category-specific stats and trade data. |
| [Tasks](https://www.exfil-zone-assistant.app/tasks) | Explore all 227 tasks as vendor chains, inspect prerequisites and objectives, and record progress locally. |
| [Hideout](https://www.exfil-zone-assistant.app/hideout-upgrades) | Plan 70 upgrades across the hideout's rooms and zones, inspect material requirements, and record what is built. |
| [Gunsmith](https://www.exfil-zone-assistant.app/gunsmith) | Assemble weapons from compatible parts and see how each choice changes the build. |
| [Combat Simulator](https://www.exfil-zone-assistant.app/combat-sim) | Compare up to four loadouts against protection, range, facing, wear, and target-zone scenarios. |
| [Guides](https://www.exfil-zone-assistant.app/guides) | Read focused explanations of ammunition, penetration, damage, wipes, survival mechanics, and the simulator. |

Task and hideout progress, saved builds, and display preferences stay in the reader's browser. A
game-version wipe clears progress while preserving player-authored builds and preferences. The app
does not read or synchronize a player's in-game account.

## Tech stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4 and shadcn/ui primitives
- Zod schemas for runtime validation and inferred types
- Static, CDN-served JSON for game data
- NextAuth, MongoDB, and Mongoose for web accounts and reader submissions
- Vitest and ESLint for automated checks
- Vercel Analytics and Speed Insights, with optional KV-backed production rate limiting

## Local development

### Prerequisites

- Node.js 20.9 or newer
- npm, using the committed `package-lock.json`
- Docker Desktop for the local MongoDB replica set

### Quick start

```bash
git clone https://github.com/zelengeo/exfil-zone-assistant.git
cd exfil-zone-assistant
npm install
```

Copy `.env.example` to `.env.local`, then fill in the secrets and provider credentials needed for
the flows you are testing.

```powershell
Copy-Item .env.example .env.local
```

Start MongoDB, create its indexes, verify transactions, and run the development server:

```bash
npm run dev:local
```

Open [http://localhost:3000](http://localhost:3000). The command overrides `MONGODB_URI` only for
its child processes, so an Atlas URI in `.env.local` is not modified.

Real Google or Discord sign-in also requires a localhost callback configured with that provider.
The public data tools can be developed without completing an OAuth flow.

### Environment

`.env.example` is the authoritative template. The main variables are:

| Variable | Purpose |
|---|---|
| `NEXTAUTH_URL` | App origin; normally `http://localhost:3000` in development. |
| `NEXTAUTH_SECRET` | Signs sessions. Rotating it revokes active sessions in that environment. |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Discord OAuth credentials. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials. |
| `MONGODB_URI` | MongoDB connection string. The template targets the local replica set on port 27018. |
| `ADMIN_EMAIL_1`–`ADMIN_EMAIL_3` | Optional verified emails used to bootstrap the first admins. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Optional shared production rate-limit backend. |
| `RATE_LIMIT_TRUSTED_IP_HEADER` | Optional client-address header trusted from the deployment ingress. |

Development always uses the in-memory rate limiter. Production uses Vercel KV only when both KV
variables are present; otherwise it falls back to a per-instance in-memory limiter and reports the
misconfiguration in the admin health view.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Run Next.js without preparing the local database. |
| `npm run dev:local` | Prepare the loopback MongoDB replica set and run Next.js against it. |
| `npm run lint` | Run ESLint. |
| `npm run type-check` | Type-check without emitting files. |
| `npm test` | Run the Vitest suite; database integration tests skip without the loopback replica set. |
| `npm run validate-data` | Validate published JSON, cross-references, IDs, and item images. |
| `npm run build` | Create the production build. |
| `npm run verify` | Run lint, type checking, tests, data validation, and the production build. |
| `npm run verify:local` | Prepare local MongoDB and run the complete repository gate, including integration tests. |
| `npm run verify:seo` | Verify generated SEO assets and route metadata. |
| `npm run db:ui` | Start the optional loopback-only mongo-express UI on port 8081. |
| `npm run db:down` | Stop the local Compose stack without deleting its volume. |

`npm run db:ui` uses `local` / `exfilzone-local` by default. Override
`MONGO_EXPRESS_USERNAME` and `MONGO_EXPRESS_PASSWORD` in the shell when needed.

## Architecture

```text
src/
├── app/           Next.js routes and route-owned components
├── components/    Shared UI and domain components
├── config/        Guide metadata and game-version configuration
├── content/       Guide bodies
├── data/          Small committed application datasets
├── hooks/         Shared React hooks
├── lib/           Request plumbing and pure domain logic
├── models/        Mongoose schemas
├── services/      Data and browser-persistence access
└── types/         Shared schemas and TypeScript types
public/
├── data/          Published, runtime-validated game data
└── images/        Item, brand, and UI art
scripts/           Validation, database, migration, and asset utilities
docs/              Architecture decisions, design guidance, audits, and operations
```

Game catalogue files and `tasks.json` live in `public/data`. Readers must go through
`loadDataFile` in `src/services/dataFiles.ts`; importing those JSON files directly duplicates them
into client bundles. `TaskService` loads the task database once before serving synchronous reads.

Browser persistence is owned by `StorageService` and exposed through route hooks built on
`useSyncExternalStore`. Persisted values are validated before use, and components render a
pre-hydration state before reading `localStorage`.

MongoDB stores web-account, session, and submission data. It is not the source for the public game
catalogue or a player's local progress.

## Contributing

Start with these repository-owned sources before changing code:

1. [`AGENTS.md`](AGENTS.md) for project-wide rules and the documentation map.
2. [`CONTEXT.md`](CONTEXT.md) for canonical game and UI terminology.
3. The nearest scoped `AGENTS.md` for the route or layer being changed.
4. [`docs/design/README.md`](docs/design/README.md) for UI, responsive, accessibility, and Cold
   Steel design requirements.

Keep changes narrow, add or update tests for changed behaviour, and run the smallest relevant gate.
Use `npm run validate-data` after editing published game data and `npm test` after changing tasks or
vendor keys. Use `npm run verify:local` when the change depends on the database.

Issues and feature requests are tracked in
[GitHub Issues](https://github.com/zelengeo/exfil-zone-assistant/issues).

## Deployment and operations

Build and run the production server with:

```bash
npm run build
npm start
```

Before a backend deployment, index rollout, data cleanup, session-secret rotation, or incident
recovery, follow [`docs/BACKEND_OPERATIONS.md`](docs/BACKEND_OPERATIONS.md). Database index changes
use a reviewed preview/apply flow: `npm run db:sync` previews the target, while
`npm run db:sync -- --apply` applies and verifies the identity constraints.

## Data and project status

Published game data is extracted from game assets and supplemented by community testing and
analysis. Known inconsistencies are tracked explicitly rather than silently normalized. Validate
all data changes with the repository scripts before publishing them.

Current work and planned changes live in
[GitHub Issues](https://github.com/zelengeo/exfil-zone-assistant/issues); completed plans and visual
rewrites under `docs/` are historical context, not an active backlog.

## License

Licensed under the [MIT License](LICENSE).

# App Router

Next.js 16 App Router. Server components by default; `'use client'` is a decision, not a default.

## The routes

| Route | What it is | Doc |
|---|---|---|
| `/items` | the catalogue and its filters | [items](items/AGENTS.md) |
| `/tasks` | 227 contracts as vendor chains | [tasks](tasks/AGENTS.md) |
| `/combat-sim` | damage, penetration, TTK | [combat-sim](combat-sim/AGENTS.md) |
| `/hideout-upgrades` | upgrade planner | [hideout-upgrades](hideout-upgrades/AGENTS.md) |
| `/guides` | written and component guides | [guides](guides/AGENTS.md) |
| `/gunsmith` | weapon build tool | — |
| `/admin` | moderation and health | [admin](admin/AGENTS.md) |
| `/api` | route handlers | [api](api/AGENTS.md) |
| `/dashboard`, `/user`, `/auth` | account | — |
| `/privacy`, `/terms`, `/cookies`, `/feedback`, `/goodbye`, `/unauthorized` | static pages | — |

`app/components/` holds the home page's own sections plus `providers/`. Everything else a route owns
sits under `app/<route>/components/`.

## Route layout

```
app/<route>/
├── page.tsx          # server component: data, metadata
├── components/       # this route's components
├── hooks/            # this route's hooks
└── utils/            # this route's pure logic — the part worth testing
```

Logic in `utils/` stays free of React so a spec can reach it. That is where `chains.test.ts` and
`damage-calculations.test.ts` point.

## Static generation

Data pages are static and must stay that way. `/tasks/[id]` and `/guides/[slug]` both declare
`generateStaticParams`, which is what makes 227 task pages a build-time cost rather than a
per-request one. Adding a dynamic function — cookies, headers, a request-time read — to one of these
silently opts the whole route out.

Game data is read through `loadDataFile`, never imported. See
[services](../services/AGENTS.md).

## Metadata

Each page exports `metadata` or `generateMetadata`. Task and guide pages resolve their own og:image
from the data; everything else falls back to the route default in `/og/`. Titles are set per page,
never composed in a layout.

## Client boundaries

A page stays a server component and hands data to a client child. Push `'use client'` down to the
component that actually needs state or an event handler — a client boundary at the page level pulls
the whole tree into the bundle.

# Tasks Route

## Documentation Hierarchy

**Parent:** [App Router](../AGENTS.md) — Next.js pages & routing
**Root:** [Root AGENTS.md](../../../AGENTS.md) — project overview
**Glossary:** [CONTEXT.md](../../../CONTEXT.md) — canonical domain terms

**Related:**
- [Types](../../types/AGENTS.md) — `Task`, `TaskProgress`, `TaskState`
- [Public Data](../../../public/data/AGENTS.md) — where task data comes from
- [Components](../../components/AGENTS.md) — shared component patterns

---

## What this route is

227 contracts across seven owners, read as **chains** rather than as a list. A vendor's tasks form a
prerequisite DAG; the route draws that graph, so position in the sequence is the information and
status is how a row is painted. There are no available/locked/completed tabs — where a row sits
already says which it is.

Three columns, each answering one question:

| Column | Question | Component |
|---|---|---|
| Rail | who am I working for | `VendorRail` |
| Chain | what is this vendor's sequence, and where am I in it | `ChainColumn` |
| Pane | what does this one task ask of me | `TaskDetailPane` |

Two views replace the chain column when the question is not about one vendor: **search** and the
rail's **Open now**, both rendered by `SearchResults` (grouped by vendor, each row keeping its
position in its own chain).

**Routes:** `/tasks` (static) and `/tasks/[id]` (227 statically generated pages, which is what makes
a task shareable and indexable). The standalone page renders the *same* `TaskDetailPane` — there is
no second rendering of a task to keep in step.

---

## File map

```
app/tasks/
├── page.tsx                      # static shell; Layout fullWidth, max-w-[1600px]
├── [id]/
│   ├── page.tsx                  # generateMetadata + generateStaticParams (227 paths)
│   └── components/TaskPageContent.tsx   # breadcrumb + shared pane + "open in the chain" link
├── components/
│   ├── TasksPageContent.tsx      # the route's state: URL filters, selection, layout
│   ├── VendorRail.tsx            # the rail, and `VendorStrip` — its phone form
│   ├── ChainColumn.tsx           # one owner: sticky header, a group per chain, collapse
│   ├── ChainRow.tsx              # one task row; exports `TaskMarker`
│   ├── ChainSpine.tsx            # the SVG connectors, drawn over the rows
│   ├── NextUpCard.tsx            # phone only: the next contract, with its two actions
│   ├── SearchResults.tsx         # both gathered views
│   └── TaskDetailPane.tsx        # the briefing; `variant="pane" | "page"`
├── hooks/
│   ├── useTaskProgress.ts        # the progress store (see below)
│   └── useRowHeight.ts           # 38px / 44px, for the spine's arithmetic
└── utils/
    ├── chain.ts                  # graph → rows, lanes and geometry
    ├── progress.ts               # state, counts, standing, gates
    ├── vendors.ts                # owners, including the synthetic `daily`
    ├── filters.ts                # the URL spelling of the view
    └── taskText.tsx              # icons, highlighting, tips, video links
```

`src/app/tasks/utils/chains.test.ts` (`npm test`) asserts the layout and data invariants below.
Run it after touching `chain.ts`, the geometry constants, or task data.

---

## Where the tasks come from

`public/data/tasks.json`, through `src/services/TaskService.ts` — not an import. The route reads the
database synchronously in a dozen places per render (`chain.ts`, `progress.ts`, `vendors.ts` and
three components all index it), so the load happens once at the top instead:

- `TasksPageContent` and `TaskPageContent` each call `useFetchTasks()` as their first hook, which
  suspends until the file lands. Both pages already have a `<Suspense>` boundary.
- Everything below them calls `loadedTasks()` / `taskById()`, which **throw** if that has not
  happened. If you add a component that reads tasks outside those two trees, it needs its own
  `useFetchTasks()` above it.
- Server code — `[id]/page.tsx`, `sitemap.ts` — awaits `fetchTasks()` instead.

It was `src/data/tasks.ts` until 2026-09-04, and the move is
[ADR 0004](../../../docs/adr/0004-task-data-is-json-in-public-data.md). The short version: the
module put 431 KB in the bundle of every route that named a task, and bought synchronous access that
was not reaching the prerendered HTML anyway.

---

## Chains

`buildChains(owner)` in `utils/chain.ts`:

1. **Components.** Union-find over internal prerequisites splits an owner's tasks into weakly
   connected chains. Four owners run more than one (the gunsmith runs two).
2. **Layering.** Longest-path depth, so a task sits below every prerequisite. `order` is only a
   tiebreak between equal depths.
3. **Lanes.** Lane 0 is the spine, lane 1 the branch beside it (`MAX_LANE`). A parent keeps its
   **tallest remaining subtree** on the spine; other successors step out one lane and rejoin.
   Ranking by anything else put 23 of the gunsmith's 25 rows on the branch beside an empty spine.
4. **Cross-owner prerequisites are excluded** from the graph (`externalPrereqsOf`) — an edge leaving
   the column has nowhere to land. They appear in the pane under "Unlocked by".

Geometry lives in `chain.ts` and nowhere else, so rows, markers and SVG cannot drift:
`ROW_H` / `ROW_H_COMPACT`, `laneX`, `rowTextX`, `NODE_GAP`, `ELBOW_RISE`.

A chain folds its locked tail (`visibleRows`, `LOCKED_TAIL = 12`) — but never under a filter, where
every surviving row has to stay put, and never the selected task.

---

## Progress

`useTaskProgress` is a module-level `useSyncExternalStore` over `localStorage`, so every pane, both
routes and the rail read one value and re-render together. `hydrated` is false until storage has
been read; controls are inert rather than wrong until then.

- `stateOf(task, progress)` → `completed | open | locked`. Locked means an unmet prerequisite;
  nothing is stored for it.
- Objectives tick individually; ticking the last one does **not** auto-complete the task.
- `canComplete` refuses to record a locked task and refuses to un-complete one something completed
  depends on. The rule lives in `progress.ts`, so components only disable the affordance.
- `standingFor(owner)` sums reputation from the owner's own tasks. Trupik's pays none and publishes
  no tiers: `hasReputation` is false and the UI prints "no rep", not `0/0`.

---

## URL state

Everything except progress is in the query string (`utils/filters.ts`): `vendor`, `task`, `q`,
`map`, `type`, `done`. A chain someone is looking at is a link they can send.

> **Write filters with `window.history.replaceState`, not `router.replace`.** The App Router treats
> a replace to a bare pathname as a no-op, so clearing the *last* filter left both URL and view
> where they were. `replaceState` is router-integrated in Next 15+, drives `useSearchParams`, and
> skips an RSC round trip per keystroke on a static page.

`?task=` also decides the phone's screen: with a task named, the phone shows the briefing instead of
the chain, so a shared link lands on the same task on either device.

---

## Phone

Split at the `shell:` breakpoint (900px), by CSS wherever possible:

- The rail becomes `VendorStrip` — 78px tiles, horizontally scrolled, the active tile scrolled into
  view. Standing moves to the chain header, which has room to print it.
- `NextUpCard` carries the chain's next contract. Its "Mark complete" calls `setDone` **directly**,
  bypassing the pin used elsewhere: the card follows the chain, and watching it advance is the
  confirmation.
- Rows are 44px. This is the one measurement CSS cannot deliver, because the spine's path data is
  arithmetic on it — hence `useRowHeight`, a `matchMedia` store whose server snapshot is the desktop
  height.
- The pane's action bar sticks to `bottom-bottomnav`, clearing the fixed 66px bottom nav.

---

## Design rules for this route

Use the [Cold Steel guide](../../../docs/design/README.md) for tokens and shared CSS traps.
The rail/chain/pane behaviour and phone geometry above are this route's design constraints.

---

## Known data quirks

- **Cross-vendor gates are correct, not bugs.** Regiment opens with nothing available (its root
  needs ARK's `ark_63`) and ARK stalls at 21 of 37 (`ark_59` needs `regiment_16`). The suite
  proves all 227 tasks fall out of a cross-vendor fixpoint. The rail opens on a vendor
  that *has* open work, so this is never mistaken for a broken page.
- **`order` collides** for 19 gunsmith tasks (the `research_*` family reuses 1..25) and 6 of
  Trupik's. Harmless — the layout is topological — but it means `order` cannot be trusted as an id.
- **Three tasks are filed under a corp their id does not name** (`ntg_10` → forge, `ark_4` → ntg,
  `ntg_13` → trupiks). Always read `corpId`, never parse the id.
- **The eight dailies** have no `corpId` and no prerequisites. They get the synthetic `daily` owner
  (`utils/vendors.ts`); the old route dropped them entirely by iterating `corps`. They are a list,
  not a sequence, so they get no positions and no "next up".
- Six of the dailies share three names; the search result's second line (the matched objective) is
  what tells them apart.

---

## Corrections

The task correction form was removed with the rebuild: it fed a queue nobody read. `/tasks` carries
one line pointing at Discord instead. Item corrections went the same way on 2026-09-05 (audit B12),
so the form, `/api/corrections`, the admin queue and the `DataCorrection` model are all gone.

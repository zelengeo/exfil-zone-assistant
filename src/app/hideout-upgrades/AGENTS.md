# Hideout Upgrades

## Documentation Hierarchy

**Parent:** [App Router](../AGENTS.md) — Next.js pages & routing
**Root:** [Root AGENTS.md](../../../AGENTS.md) — project overview
**Glossary:** [CONTEXT.md](../../../CONTEXT.md) — canonical domain terms

---

## What this route is

70 upgrades across 29 zones and 5 rooms, drawn on the floor plate they sit on. Pick a zone, see what
its next level costs and what stands in the way; below the plate, what every unbuilt level still
adds up to.

The map answers a question without being clicked. Every pin carries one of four states — **ready**
(warn edge), **built** (good corner), **locked** (dashed), **room** (info chevron) — plus ember for
the selection, which is the route's one action colour. A small info square on a pin means the next
level is gated on a task, the one gate no amount of looting clears.

| Piece | Question it answers | Component |
|---|---|---|
| Plate | where is everything, and what can I build now | `FloorPlate` |
| Rail | which room am I in, and how far through it am I | `RoomRail` |
| List | *(phone)* the same zones as tap targets | `ZoneList` |
| Pane | what does this zone want | `ZonePane` |
| Materials | what does all of it still cost | `MaterialsPanel` |

---

## File map

```
app/hideout-upgrades/
├── page.tsx                    # server shell; builds `questNames`
├── components/
│   ├── HideoutUpgradesClient.tsx  # open room, selected zone, layout
│   ├── FloorPlate.tsx             # the plate, the pins, AREA_POSITIONS
│   ├── RoomRail.tsx               # the five rooms
│   ├── ZoneList.tsx               # phone only
│   ├── ZonePane.tsx               # pane on desktop, sheet on phone; exports `Rule`
│   └── MaterialsPanel.tsx         # the aggregation and the "wanted by" dialog
├── hooks/
│   └── useHideoutProgress.ts   # the progress store
└── utils/
    ├── hideout.ts              # every rule
    └── hideout.test.ts         # `npm test`
```

`utils/hideout.ts` holds all the logic and no React. The three rules that used to live inline in a
500-line component — `canBuild`, `canUndo`, `upgradeId` (was `checkLevelConditions`, `checkCanUndo`,
`getAreaUpgradeId`) — are there with specs against the real 70 upgrades. Run `npm test` after
touching them or the data.

**`upgradeId` must stay total.** Returning null is how the pane knows there is no next or previous
level, so it drives button state directly. A throw there is a broken pane, not an error.

---

## The data is generated

`src/data/hideout-upgrades.ts` comes straight out of the game's `FunctionalAreaUpgradeDataTable_S5`.
Its header carries the regeneration commands. Two things follow:

- **Do not hand-edit it.** The next extraction overwrites the file.
- **Two fields are curated and preserved across regeneration:** `relatedQuests` and the
  `hideoutUpgradesTasks` map. Both describe task gating, which exists nowhere in the client data, so
  they cannot be re-derived. A regeneration that drops them loses work no extraction can replace.

Keys are `<areaId>Lv<level>`. `levelUpIcon` holds the upgrade id rather than a path, because icons
are exported keyed by id to `/images/hideout/<id>.webp`.

This is the one dataset here whose prices come from the game rather than from a vendor's offers.

It is still a committed TypeScript module — about 46 KB, reaching a 44 KB client chunk. Moving it to
`public/data` the way the task database moved ([ADR 0004](../../../docs/adr/0004-task-data-is-json-in-public-data.md))
was considered with the rewrite and deliberately not done: 44 KB is not 431 KB, and the move needs a
schema, a service, a loading state and a change to `tools/publishHideout.js` in the extraction repo.
Worth revisiting if this route ever grows a second reader.

### Two derived shapes worth knowing

- **`Upgrade` is the data widened.** The module is `as const`, so `exchange` has a different type per
  upgrade and nothing can iterate the database without fighting it. `utils/hideout.ts` widens once,
  and the assignment to `UPGRADES` is what keeps that honest.
- **`Player` is a pseudo-area** in `levelConditions`, and this wiki tracks no player level. It is
  treated as always met (`PLAYER_LEVEL = 10`); the highest requirement in the database is 5.

---

## Rooms and zones

A **room** is a `categoryId` — one screen of the map. A **zone** is an `areaId` — one pin with its
own levels. Both are derived from the data, so a season that adds either needs no edit here.

Three shapes make this less obvious than it sounds, and all three are in the spec:

- **Two rooms are also zones.** Medical Area and Kitchen Area appear as a doorway on the main floor
  *and* as an upgradable area on their own screen — Kitchen Area has four levels behind that pin.
  `isRoomPin` is what decides which; keying it off `level === 1` used to strand every level past the
  first.
- **Two rooms are not zones.** Lounge and HQ Pad hold no upgrades of their own, so their pin always
  navigates. `categoriesWithoutArea` in the data names them.
- **Every room screen carries a `None` pin** back to the main floor.

`AREA_POSITIONS` in `FloorPlate.tsx` is hand-placed against the background image — the game files
hold no coordinates for any of this — which is why it lives beside the plate rather than in `utils/`.
An area with no entry lands on a fallback row along the bottom edge rather than stacking in the
centre, so a season that adds zones stays usable and it is obvious which still need measuring. HQ Pad
was on that row until the rewrite placed it.

---

## Materials: three orders, and bands that follow them

| Sort | Answers | Bands |
|---|---|---|
| Quantity | what am I most short of | 10 or more · 5 to 9 · 1 to 4 |
| Unit value | what is worth picking up when I see one | 100k or more · 25k to 100k · under 25k |
| Total value | what is this line costing me overall | 1M or more · 250k to 1M · under 250k |

They disagree sharply, which is the point: the digital sensor is 25th by quantity and first by both
value measures.

**Bands measure whatever the list is ordered by.** A band that always counted quantity while the
order counted money would be two questions stacked on one screen — you would sort by value and still
be told "10 or more". `bandScaleOf(sort)` carries the thresholds, the labels, and the name of the
axis, which the filter row prints ("By total value") so the chips are never ambiguous.

Thresholds are round numbers chosen against the real spread, not percentiles: a boundary a player
cannot repeat from memory is not worth having. On a fresh save they split 49/26/14 by quantity,
10/23/55 by unit value and 9/29/50 by total value — the value scales lead with a short list on
purpose, since "what is actually worth money" is only useful while it stays short.

The leading band's bar tracks whichever number is being sorted on and the tile's sub-line prints it,
so the order is never a mystery.

### Density

Each band renders as **full tiles** or **compact chips**, toggled from its own header. The default
is the leading band full and the tail compact: the first band is the one you act on, the rest is a
list of names you scan. A band shown as tiles caps at 20 with its own "show all".

The toggle is a command button — labelled with what it will do, not with the state it is in — which
is the only way one control reads unambiguously at that size.

Value is the item's **base sell price** — `baseValue`/`isPriced` from `@/lib/trade`, which is the
best of the six vendor sell columns. Rarity would be the more natural axis and is not yet reliable
in the data, so price stands in for it.

`rankMaterials` takes the price as a `unitValueOf` callback rather than reading the catalogue
itself: `utils/hideout.ts` knows the hideout database and nothing else, and this keeps the ordering
testable without loading 1,500 items.

**One of the 89 materials has no price** (Household Cleaner). Unpriced sorts *last* under a value
order and prints "No price" — never zero, because the catalogue genuinely prices some things at
zero and "unknown" is not "worthless".

---

## Task names arrive as a prop

`relatedQuests` holds the game's own dotted ids (`task.mall.4`), and naming them means joining on the
task database's `gameId`. That join happens in `page.tsx` and travels down as `questNames`, which
looks like ceremony and is not: this route wants 227 names and nothing else, but importing the task
data anywhere inside the client tree put the whole module in the hideout bundle. **A module boundary
is not a server boundary**; the page is one, so the join runs at build time and about 7 KB of names
travel instead. Anything else you need from the task data comes the same way — the page can
`await fetchTasks()` from `@/services/TaskService`.

S5 gates eight upgrades on tasks this wiki has not published, so neither `questNames` nor the curated
`hideoutUpgradesTasks` prose knows them and the raw id is shown. That is deliberate: an id is
searchable, and it never crashes. `questName` keeps the three-step fallback.

The rules never read task *progress*, for the same bundle reason.

---

## Progress

One localStorage key, `hideout`, through `StorageService`, reached by `useHideoutProgress` — a
module-level `useSyncExternalStore`, the same shape as `useTaskProgress`. The plate, the rail, the
pane and the materials list all read one store and re-render together.

`hydrated` is false until storage has been read on the client. Pins are withheld and every count
prints `—` until then; the route is statically generated, so rendering a level from storage during
the first render breaks SSR. The route this replaced read storage in a `useEffect` and called
`setState` from it, which was both the wrong shape and the only lint error it had.

Storage is a text file a player can edit, so ids that are not live upgrade ids are dropped on read.

There was a second key, `hideout_focus`. Nothing ever read or wrote it and the redesign has no
focused-target concept, so it is gone from `StorageService`.

---

## Design rules for this route

Cold Steel only: `steel-*`, `line-*`, `ink-*`, `ember`, `info`, `warn`, `good`, `bad`, `track`. No
`military-*` / `olive-*` / `tan-*` — this route has none left.

Ember is the one action: the selected zone, the open room, and Level Up. Nothing else on the screen
is ember.

Traps, all of which cost time here:

- `globals.css` centres every `button`. A left-aligned button needs an explicit `justify-start` —
  the zone list rows are buttons.
- Colours in `tailwind.config.js` are **not** emitted as `--color-*` variables, so
  `shadow-[inset_2px_0_0_var(--color-ember)]` renders nothing. The rail's open-room edge is a real
  border for this reason.
- `hidden` and `flex` are the same layer: write `cond ? 'hidden' : 'flex'`, not `flex ... hidden`.
  `shell:flex` after `hidden` is fine — a variant is a different layer.

Money is `formatEZD` from `@/lib/trade`, the app's one way of writing it.

---

## Phone

Split at the `shell:` breakpoint (900px), by CSS wherever possible — one DOM tree, not two.

- The rail is the top chrome (78px tiles, scrolled) rather than cards under the plate; the plate and
  rail swap with `order`.
- The plate is 195px tall and its pins are 26px, which is under the touch-target floor. That is why
  `ZoneList` exists: the same zones as 56px rows, ready-first, each carrying its next level's price.
  The pins stay tappable as a bonus, not as the path.
- The pane becomes a full-height sheet (`fixed inset-0`), with a handle and a back row instead of the
  artwork's close button.

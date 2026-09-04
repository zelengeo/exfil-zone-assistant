# Hideout route rewrite — brief

**Status:** requested, not started
**Written:** 2026-09-04
**Design:** https://claude.ai/code/artifact/f7f02f61-a355-4c1b-8ccd-cb0e38994d87
**Route:** `src/app/hideout-upgrades/` — 1,000 lines across four files
**Read first:** [the route's own doc](../src/app/hideout-upgrades/CLAUDE.md), then
[`CONTEXT.md`](../CONTEXT.md) for the vocabulary

The job is a UI rewrite against a design that already exists. This brief is the other half: the
things wrong with the route underneath the UI, gathered while working on neighbouring code, so they
get fixed by the rewrite rather than carefully preserved by it.

None of them are why the redesign is happening. All of them are cheaper to fix while the files are
open than in a pass of their own.

---

## 1. The rewrite

Reapply the design in the artboard above. What lives here now:

| File | Lines | What it holds |
|---|---:|---|
| `components/HideoutOverview.tsx` | 524 | the map, the modal, and the three upgrade rules |
| `components/TotalCostsDisplay.tsx` | 263 | what the selected plan costs |
| `components/HideoutUpgradesClient.tsx` | 142 | the state between them |
| `page.tsx` | 71 | server shell; builds `questNames` |

The three rules in `HideoutOverview.tsx` — `checkLevelConditions`, `checkCanUndo`,
`getAreaUpgradeId` — are the part with real logic in it and the part a rewrite is most likely to
break quietly. They have **no tests**. Consider pulling them into `utils/` and specing them before
moving the markup, which is what `app/tasks/utils/` exists for and what made that rewrite safe.

`getAreaUpgradeId` returning null is how the modal knows there is no next or previous level, so it
drives button state directly. Keep it total — a throw there is a broken modal, not an error.

### The palette

The route is still on the holding skin: 13 uses of `olive-400`, 12 of `tan-100`, 7 of
`military-600`, and so on down. If the design is Cold Steel — `steel-*`, `line-*`, `ink-*`, plus
`ember` / `info` / `warn` / `good` / `bad` — then this is a full repaint, not a touch-up, and the
tasks route is the worked example of what that looks like finished. Two traps that cost time there,
both in `src/app/tasks/CLAUDE.md`: `globals.css` centres every `button`, and colours defined in
`tailwind.config.js` are not emitted as `--color-*` variables, so `shadow-[inset_2px_0_0_var(--color-ember)]`
renders nothing.

---

## 2. Fix while you are in there

### 2a. The state layer does not follow the repo's own rule

`HideoutUpgradesClient` reads storage with `useState` + `useEffect` calling `StorageService`
directly. Every other route goes through a per-route hook wrapping `useSyncExternalStore` over a
module-level store, exposing a `hydrated` flag — `useTaskProgress`, `useSavedBuilds`, `useDensity`.
The root `CLAUDE.md` says to do it that way and this route is the one that does not.

It is also the only lint error on the route:

```
HideoutUpgradesClient.tsx:57  react-hooks/set-state-in-effect
    setUpgradedAreas(loadUpgrades());
```

That is the pattern the hook exists to replace, so writing `useHideoutProgress` fixes the
convention and the lint error in one move. `useTaskProgress` is the shape to copy.

Render the pre-hydration state and swap once `hydrated` is true — reading `localStorage` during the
first render breaks SSR, and this page is statically generated.

### 2b. `hideout_focus` is a key nothing uses

`StorageService.STORAGE_KEYS` declares `hideout_focus: 'exfilzone-hideout-focus'`. Nothing reads or
writes it. The route's `CLAUDE.md` says it holds "the current target", so the doc describes a
feature that is not there.

Either wire it up, if the new design has a focused-target concept, or delete the key and fix the
doc. Do not leave it: a declared storage key is a claim that something is stored, and the wipe
semantics in `StorageService` are read as the list of what a wipe clears.

### 2c. The data is still a committed TypeScript module

`src/data/hideout-upgrades.ts` is 46 KB and reaches a 44 KB client chunk on this route. It is the
same shape of problem the task database had, at a tenth the size — and the task side is now solved,
so there is a worked pattern to copy rather than a decision to make:
`public/data/tasks.json` + `src/services/TaskService.ts` + `useFetchTasks`, and
[ADR 0004](adr/0004-task-data-is-json-in-public-data.md) for why.

**This is a judgement call, not a defect.** 44 KB is not 431 KB, the route is one page rather than
four, and moving it means a schema, a service, a loading state and an extraction change
(`tools/publishHideout.js` writes this file). Worth doing if the rewrite touches how the data is
read anyway; not worth doing on its own.

Two things make it more than a straight copy of the tasks move:

- **`relatedQuests` and the `hideoutUpgradesTasks` map are curated**, preserved by hand across
  regeneration because quest gating exists nowhere in the client data. A move must carry them.
- **Keys are `<areaId>Lv<level>`** and `levelUpIcon` holds an upgrade id rather than a path, because
  icons are exported keyed by id to `/images/hideout/<id>.webp`.

### 2d. Three files nothing imports

`extracted_hideout_upgrade_data.json`, `extracted_hideout_levelup_button_data.json` and
`hideout-config.json` sit in the route directory as extraction leftovers. Confirmed unreferenced by
any `.ts` or `.tsx` in the repo. Delete them with the rewrite.

---

## 3. Do not undo these

Both are recent, both look like indirection worth removing, and both are load-bearing.

**`questNames` arrives as a prop from `page.tsx`.** The names behind an upgrade's `relatedQuests`
ids come from joining the task database on `gameId`. That join runs in the server component and
about 7 KB of names travel down. It looks like ceremony; it is not. Importing task data anywhere
inside the client tree put the whole task module in this route's bundle — a module boundary is not a
server boundary. If the rewrite needs something else from the task data, get it the same way. The
page can `await fetchTasks()` from `@/services/TaskService`.

**S5 gates eight upgrades on quests this wiki has not published**, so neither `questNames` nor the
curated prose knows them and the raw id is shown. That is deliberate: an id is searchable, and it
never crashes. Keep the three-step fallback.

---

## Done when

- The design is applied and the route is off `military-*` / `olive-*` / `tan-*`
- The three upgrade rules live in `utils/` with specs, and `npm test` covers them
- Progress goes through a `useHideoutProgress` hook with a `hydrated` flag
- `npx eslint src/app/hideout-upgrades` is clean
- `hideout_focus` is either used or gone, and the route's `CLAUDE.md` matches what is there
- The three loose JSON files are deleted
- No client chunk on this route carries task data — check the built output, not the imports
- The route's `CLAUDE.md` is updated in the same change, not after

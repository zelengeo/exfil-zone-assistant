# Extraction change request — get the task database out of the browser bundle

**Status:** fulfilled 2026-09-04 — both changes landed and the app side is done. Kept as the record
of what was asked for and why; §4 is still live guidance for the publisher.
**Written:** 2026-09-04
**Target repo:** `D:\rep_path\exfil-zone-assistant-extraction`
**Consumer:** this repo — `public/data/`, `src/lib/gates.ts`, `src/data/tasks.ts`
**Related:** [ADR 0001](adr/0001-task-data-as-a-committed-typescript-module.md),
[DOCS_REBUILD_PLAN.md](DOCS_REBUILD_PLAN.md) stage 8

Two changes to what the extraction publishes, plus one thing that already changed on this side and
the publisher does not know about yet. Both changes exist for the same reason, so they are written
in one document, but they are independent and can land separately.

---

## 1. Why

`src/data/tasks.ts` is 431 KB and reaches the browser. Measured against a production build on
2026-09-04, after `lib/vendors.ts` stopped reading `corps`:

| Chunk | Size | Loaded by |
|---|---:|---|
| `32q4om9j4o692.js` | 228 KB | `/tasks`, `/tasks/[id]`, `/items` |
| `1o195za_ytcyp.js` | 228 KB | `/gunsmith` |

`/hideout-upgrades` and `/combat-sim` are clean as of `1ea0ef1`.

`/items` and `/gunsmith` do not want the task database. They want a name for a gate: an offer says
`requiresTasks: ["task.marc.part2.01"]` and the chip beside it should read *Seaside Pursuit* rather
than the raw id. Resolving that name costs the whole 431 KB module, because `tasksData` is one
object literal and nothing tree-shakes out of it.

The audience makes this worse than the number suggests. This app is read on a phone beside a
headset, or in the headset's own browser, often on whatever connection the room has.

A second measurement, which decides §3: **the task pages do not prerender their content today.**

```
.next/server/app/tasks/ark_36.html — 111 KB of HTML, 1,686 characters of visible text:

  "Seaside Pursuit - Task Guide | ExfilZone Assistant … Loading  Reading the task…"
```

`TaskDetailPane` suspends on `useFetchItems`, so all 227 task pages ship a spinner and the task name
survives only in `<title>`. The synchronous access ADR 0001 pays 431 KB for is buying compile-time
typing, not rendered HTML.

---

## 2. Change A — a buy offer carries the task it is gated on

**Where:** `config/shopPrices.js`, around the offer builder at line ~188
(`requiresTasks: splitList(row.pre_task)`).

### The shape

Today an offer names a gate by the game's own id and nothing more:

```jsonc
"requiresTasks": ["task.marc.part2.01"]
```

Requested — the same id, plus the three fields the rendering path actually reads:

```jsonc
"requiresTasks": [
  {
    "gameId": "task.marc.part2.01",  // unchanged: the id the goods data names
    "id": "ark_36",                  // the wiki id, i.e. the /tasks/<id> route
    "name": "Seaside Pursuit",
    "corpId": "ark"
  }
]
```

`requiresDlc` does not change. Its four ids are named in `src/lib/gates.ts` on this side and there
is nothing upstream to read.

### Why an object and not a parallel array

A second array (`requiresTaskNames`) drifts in length against the first, and the failure is silent —
a gate renders with another gate's name. One object per gate cannot get out of step with itself.

### Why `gameId` stays

`gates.ts` is deliberate that a gate always carries the raw id the goods data names, so a gate the
task database does not know still prints as an id rather than vanishing. All 128 gates resolve
today, which makes an unresolved one hypothetical — but the whole reason the join is documented as a
gotcha is that it has been dead before, silently, for a whole season. Keep the id.

If a gate cannot be resolved, emit the entry with `gameId` alone and the other three fields absent.
Do not guess a name, and do not drop the entry.

### What it costs

Measured across all 18 files in `public/data` on 2026-09-04:

- **128** distinct task-gate ids
- **215** occurrences of them across offers
- **4** DLC ids, in 14 occurrences

So the denormalisation duplicates ~87 entries and adds roughly **10 KB** across files that are
already static assets — out of the JavaScript, CDN-cached, compressed. A separate 128-row lookup
file would save about 2 KB and cost a second fetch plus a join on this side. Not worth it.

### The sequencing problem

This is the one part that needs a decision rather than an edit.

`tools/publishQuests.js` is where a quest's wiki id is settled — inherited from the published file
for a matched quest, minted as the next free `<corp>_<n>` for a new one. Nothing else in the
pipeline knows the `gameId → {id, name, corpId}` mapping.

But the handoff order printed by `tools/updateGameData.js` publishes goods first:

```
node tools/publishToWiki.js --all --images --dry-run
node tools/publishHideout.js --images
node tools/publishQuests.js --dry-run
```

So at the moment `shopPrices.js` writes an offer, the wiki ids for this season do not exist yet.
Two ways out, and this repo has no stake in which:

1. **Run the quest publisher first** and have it write the id map (`merged/quest-id-map.json` or
   similar) for `shopPrices.js` to read. Cleanest data flow; changes the review order, and the
   review order is deliberate — the diff is the product.
2. **Back-fill after quests publish**, as a third pass over the already-written `public/data` files.
   Leaves the review order alone; means the goods files are briefly published in a state where the
   gate objects are incomplete.

Either is fine downstream. What matters is that a published `public/data` never carries a gate
resolved against *last* season's ids — that is the failure mode the `gameId` fallback exists for,
and it renders as a plausible wrong name rather than an obvious blank.

### Done when

- Every `requiresTasks` entry in `public/data/*.json` is an object with `gameId`
- Entries that resolve also carry `id`, `name` and `corpId`
- `tools/verify.js` fails if a gate resolves to a wiki id that no published task has

---

## 3. Change B — tasks publish as `public/data/tasks.json`

**Where:** `tools/publishQuests.js`.

Publish the task database as JSON into `wikiDataDirectory` (already
`D:/rep_path/exfil-zone-assistant/public/data`) instead of writing `<wiki>/src/data/tasks.ts`.

### The shape

The same objects, unchanged. `TasksDatabase` is already a plain id-keyed map, so `tasks.json` is
the current `tasksData` block on its own:

```jsonc
{
  "ark_36": { "id": "ark_36", "name": "Seaside Pursuit", "gameId": "task.marc.part2.01", … },
  …226 more
}
```

`corps` does **not** belong in it — see §4. The six helper functions at the foot of `tasks.ts`
(`getTaskById`, `getTasksRequiring`, and four others) are app code that the extraction happens to
have been writing; they move to `src/app/tasks/utils/` on this side and are not the extraction's
concern.

### What this simplifies upstream

`readPublished()` currently locates the `tasksData` block inside the TS source by text range and
`JSON.parse`s the slice, then `render()` writes a TypeScript file back around it. Both go away: the
baseline is `JSON.parse` of a whole file, and the output is `JSON.stringify`.

Id inheritance is unaffected in substance but the **baseline path moves**. `publishQuests.js` reads
the previously published file to inherit ids, and that coupling is load-bearing — `UserProgress.tasks`
in players' localStorage is keyed by these ids, so minting `ark_1` afresh for a different quest marks
the wrong thing complete for everyone. Point it at `public/data/tasks.json` and keep the
"file not found" hard failure: publishing without a baseline is exactly the accident that guard
exists to stop.

### What it costs — read this before agreeing to it

The `needsWidening` guard changes meaning. Today a quest carrying a `type` or `map` value the wiki's
TS unions do not have is refused, because writing it would break `npm run build` for the whole app.
With JSON there is no compile step to break: an unknown enum value sails through and fails later, at
a zod parse in the browser or not at all.

That is a real regression in failure mode, and the mitigation is this side's job — a zod schema over
`tasks.json` and `npm run validate-data` covering it, in the pre-publish checklist. But the guard
upstream should be **retargeted, not deleted**: keep refusing to write new `type`/`map` values, and
point the message at `src/lib/schemas/` instead of `src/types/tasks.ts`.

In exchange, the data stops being able to break the build at all, which is the normal state for
every other dataset in `public/data`.

### Done when

- `public/data/tasks.json` is written by `publishQuests.js`
- `src/data/tasks.ts` is deleted on this side, in the same change
- The widening guard names the zod schema
- `npm run validate-data` covers `tasks.json`

---

## 4. Change C — `corps` is no longer this repo's vendor record

Already true, as of `1ea0ef1`. Recorded here because a publisher warning points at the wrong file.

`src/lib/vendors.ts` now carries all six shop fronts — org, short name, merchant, icon, portrait,
`ogImage` and `levelCap` — written out rather than read from `corps`, because `corps` is six rows
inside a 431 KB module and importing it for a merchant's name pulled all 227 tasks into the client
bundle of every route that named a vendor. Nothing in the app reads `corps` any more. A spec compares
the copy against `corps` field by field, so the two cannot drift while both exist.

The consequence upstream is in `publishQuests.js`, around line 598:

```
⚠ no `corps` entry in src/data/tasks.ts for: <corpId>
  those quests publish with a corpId nothing lists - add the entry by hand (name, icon,
  merchant, merchantIcon, ogImage, levelCap) before the corp pages are correct
```

The warning is still right and the file is now wrong. A new shop front needs a row in
**`src/lib/vendors.ts`**, plus its key in `VENDOR_ORDER` in `src/types/trade.ts` — which must stay
in step with `VENDORS` in `config/shopPrices.js`, as it already did.

Note the field names differ: `corps.merchantIcon` is `portrait` in the vendor record, and
`corps.name` is not `org` — the extraction writes `"BOULDER FORGE"` and `"GUNSMITH"`, while the
record carries `Boulder Forge` and `Neumann`, the shop front's actual name rather than its role.
See [ADR 0003](adr/0003-a-vendor-has-an-org-and-a-merchant.md) and `CONTEXT.md`.

If §3 lands, retarget this warning at `src/lib/vendors.ts` too.

---

## 5. What this repo does when the data lands

Change A:

- `src/types/trade.ts` — `BuyOffer.requiresTasks` becomes the object array
- `src/lib/gates.ts` — delete the `tasksData` import, the `gameId` index and the memo; `offerGates`
  reads what the offer carries. `Gate.task` narrows from `Task` to the three published fields
- `src/lib/gates.test.ts` — most of it goes with the join it was the alarm for
- `src/lib/schemas/` and `npm run validate-data` — the new offer shape
- `src/lib/AGENTS.md` — retire the "dead join" gotcha
- **Expected:** the 228 KB chunk leaves `/items` and `/gunsmith` outright

Change B:

- `public/data/tasks.json` read through `loadDataFile`, with a zod schema
- The six helpers move to `src/app/tasks/utils/`, which becomes the only door to task data — the
  interface half of stage 8, which is worth doing regardless
- `/tasks/[id]` awaits the file in the server component and passes one task down as a prop. That is
  a straight win over today: 227 shareable, indexable pages currently render as a spinner
- `/tasks` loads it client-side the way `/items` already does
- ADR 0001 can then move off `proposed`

Neither change is worth starting before the data exists — the app side is small, and the shape is
the part that needs agreeing.

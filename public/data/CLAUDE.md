# Game Data

The published catalogue. Static JSON, served from the CDN, extracted from the game's PAK files
rather than typed by hand.

## The files

| File | Holds |
|---|---|
| `weapons.json`, `ammunition.json`, `grenades.json` | what shoots and what it fires |
| `armor.json`, `helmets.json`, `face-shields.json` | protection |
| `attachments.json`, `magazines.json`, `gunsmith-parts.json` | what bolts onto a weapon |
| `backpacks.json`, `holsters.json`, `keys.json`, `misc.json` | carried gear |
| `medical.json`, `provisions.json` | consumables |
| `task-items.json` | items a contract asks for |
| `body-model.json` | the physics asset the head and body hit tests read |
| `combat-sim-test-data.json` | fixtures for the simulator's debug page |

Shapes live in [`src/types/items.ts`](../../src/types/items.ts), which is the authority — this file
does not restate them, because a copy would drift.

## Reading them

Through `loadDataFile` only. Never `import` one: the bundler inlines the same bytes into a client
chunk, which is how the database once shipped twice over 16 chunks. See
[services](../../src/services/CLAUDE.md).

## Changing them

`npm run validate-data` is the gate. It fails on anything that breaks the app at runtime —
duplicate ids, enum drift, missing required fields, dangling cross-references, missing images, head
gear with no protection model — and reports without failing on things that are known and deliberate,
like the curation backlog. Its header explains the split and the `--data <dir>` dry-run against a
candidate set before it is published.

Run it after any edit here. Run `npm test` too when the change touches tasks or vendor keys: the
task DAG is asserted against this data, not against fixtures.

## Conventions

- **Ids** are stable and are what everything else joins on. Renaming one is a breaking change to
  bookmarks, saved builds and stored progress.
- **Vendor keys** in `sellPrices` and `buyOffers` are the game's own, which is why one of them reads
  as a role rather than a name. See [`CONTEXT.md`](../../CONTEXT.md).
- **A buy offer's `requiresTasks` carries the task, not just its id.** Each entry is
  `{ gameId, id, name, corpId }` — the in-game id the goods data names, plus the join against the
  task database resolved upstream. The app reads what is there and never joins, so a gate published
  with `gameId` alone renders as a raw id; `validate-data` fails on one that names a task the task
  data contradicts. See [EXTRACTION_CHANGE_REQUEST.md](../../docs/EXTRACTION_CHANGE_REQUEST.md).
- **Images** are `.webp` under `public/images/items/`, named by item id. `validate-data` checks that
  every item has one and reports files nothing references.
- **Optional fields usually mean uneven data**, not unimportant data — only rounds that were on the
  published wiki carry `damageAtRange`, and head gear protects through `coneRegions` rather than
  per-bone `protectiveData`.

The migration this data came from is written up in
[`docs/DATA_MIGRATION_PLAN.md`](../../docs/DATA_MIGRATION_PLAN.md).

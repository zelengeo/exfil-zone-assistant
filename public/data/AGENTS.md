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
[services](../../src/services/AGENTS.md).

## Changing them

`npm run validate-data` is the gate. It fails on anything that breaks the app at runtime —
duplicate ids, enum drift, missing required fields, dangling cross-references, missing images, head
gear with no protection model — and reports without failing on things that are known and deliberate,
like the curation backlog. Its header explains the split and the `--data <dir>` dry-run against a
candidate set before it is published.

Run it after any edit here. Run `npm test` too when the change touches tasks or vendor keys: the
task DAG is asserted against this data, not against fixtures — and medical perks, which
`src/lib/medical/perks.test.ts` reads straight out of `medical.json` rather than out of a fixture.

## Medical perks

Eight of the eighteen items in `medical.json` carry `perk`, the buff the item applies. Three shapes,
and all three are load-bearing:

- `perkEffects` is a list of `{ attribute, value, target, mode }`. `mode` says how to read `value` —
  `scalar` is a fraction of the base, `perSecond` a flat rate — so **the same `0.3` means +30% on
  one row and +0.3/s on the next**. Nothing may format one without reading the other.
- **A positive value is not always good.** `energyDrain` and `hydrationDrain` count upward, so
  `+0.3/s` there is what the item costs you. `lib/medical/perks.ts` marks those rows as costs;
  colour never follows the sign.
- `perkAfterEffects` with `perkAfterDuration` is the comedown, a second window rather than a
  modifier on the first. Only the P4 injector has one.

Four items carry a perk with no effects at all — every painkiller, and morphine. That is not a gap
in the data: `PainkillerPerk` is a state rather than a set of modifiers.

The item-to-perk link is **curated**, because the game holds it in Blueprint graph code rather than
in data, and none of the numbers has been confirmed in a raid. Both are why the item page tags the
panel `Unverified` — see [the confidence vocabulary](../../src/components/ui/AGENTS.md).

## Conventions

- **Ids** are stable and are what everything else joins on. Renaming one is a breaking change to
  bookmarks, saved builds and stored progress.
- **Vendor keys** in `sellPrices` and `buyOffers` are the game's own, which is why one of them reads
  as a role rather than a name. See [`CONTEXT.md`](../../CONTEXT.md).
- **`tasks.json` is here too**, and is the whole task database — id-keyed, 227 rows, the shape
  `tasksDatabaseSchema` in `src/lib/schemas/task.ts` describes. Read it through
  `src/services/TaskService.ts`, never by importing it. It was `src/data/tasks.ts` until
  2026-09-04; the ids in it are keys to players' stored progress, so renaming one silently marks
  the wrong contract complete for everyone who had it ticked.
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

`sim compare.txt` used to sit here — 87 lines of penetration-chance counts, superseded and
**removed 2026-09-06**. It pooled long unattended series into one rate, but a vest loses durability
on every shot and durability scales its armour class, so each shot in a run had a different
probability: its headline cell fired 600 rounds into an IMTV that the same file's own ammunition
breaks in about twelve, and past that point penetration is unconditional. It was reachable on the
public site, so it is gone rather than annotated. The analysis is
`docs/ARMOR_PENETRATION_AUDIT.md` §4 in the extraction repo, the replacement protocol is
`docs/IN_GAME_TESTS.md` §10.1, and `git show 9e4de8e -- 'public/data/sim compare.txt'` still has the
file. Do not reintroduce it as an oracle.

The migration this data came from is written up in
[`docs/DATA_MIGRATION_PLAN.md`](../../docs/DATA_MIGRATION_PLAN.md).

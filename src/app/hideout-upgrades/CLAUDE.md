# Hideout Upgrades

A planner for the hideout's upgrade tree: pick a target, see what it costs and what it needs first.

## The data is generated

`src/data/hideout-upgrades.ts` comes straight out of the game's `FunctionalAreaUpgradeDataTable_S5`.
Its header carries the regeneration commands. Two things follow:

- **Do not hand-edit it.** The next extraction overwrites the file.
- **Two fields are curated and preserved across regeneration:** `relatedQuests` and the
  `hideoutUpgradesTasks` map. Both describe quest gating, which exists nowhere in the client data,
  so they cannot be re-derived. A regeneration that drops them loses work no extraction can replace.

Keys are `<areaId>Lv<level>`. `levelUpIcon` holds the upgrade id rather than a path, because icons
are exported keyed by id to `/images/hideout/<id>.webp`.

This is the one dataset here whose prices come from the game rather than from a vendor's offers.

## The route

One page, one client component. `HideoutOverview` draws the map and owns the modal;
`TotalCostsDisplay` sums what the selected plan needs; `HideoutUpgradesClient` holds the state
between them.

Three helpers in `HideoutOverview.tsx` carry the rules:

| Helper | Answers |
|---|---|
| `checkLevelConditions` | can this area go up, given the levels of the areas it depends on |
| `checkCanUndo` | can this upgrade be taken back, or does something built on top of it block that |
| `getAreaUpgradeId` | the key for an area at a level, or null where no such level exists |

`getAreaUpgradeId` returning null is how the modal knows there is no next or previous level, so it
drives button state directly. Keep it total — a throw there becomes a broken modal, not an error.

## Quest names arrive as a prop

`relatedQuests` holds the game's own dotted ids (`task.mall.4`), and naming them means joining on
the task database's `gameId`. That join happens in `page.tsx` and travels down as `questNames`,
which looks like ceremony and is not: this route wants 227 names and nothing else, but importing
`tasksData` anywhere inside the client tree put the whole 431 KB module in the hideout bundle. A
module boundary is not a server boundary; the page is one, so the join runs at build time and about
7 KB of names travel instead. Add a second thing you need from the task data the same way.

S5 gates eight upgrades on quests this wiki has not published yet, so neither `questNames` nor the
curated `hideoutUpgradesTasks` prose knows them and the raw id is shown — searchable, and never a
crash.

## Progress

Two localStorage keys through `StorageService`: `hideout` for what is built and `hideout_focus` for
the current target. Both are game progress, so both clear on a wipe. Read them through the route's
hook, not directly, and render the pre-hydration state until `hydrated`.

## Loose files

`extracted_hideout_upgrade_data.json`, `extracted_hideout_levelup_button_data.json` and
`hideout-config.json` sit in this directory as extraction leftovers. Nothing imports them. Do not
add to them, and do not treat them as a source of truth.

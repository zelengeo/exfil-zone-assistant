# Game Data Migration Plan — PAK extraction → wiki

**Status:** approved, not started — the seven open questions were decided 2026-08-17 (§10) and folded in
**Written:** 2026-08-17
**Source repo:** `D:\rep_path\exfil-zone-assistant-extraction` (branch `new-export`)
**Target:** this repo — `public/data/*.json`, `public/images/items/**`, `src/data/hideout-upgrades.ts`, `src/types/items.ts`

---

## 1. What happened upstream

The extraction repo finished a full migration off the FModel JSON export onto **direct PAK reads**. Every
item type now comes out of the shipped game archives, including types that never had an extraction path
(helmets, face shields, medical, hideout upgrades) and types the old path had silently degraded (weapons,
magazines, food, keys).

Two consequences drive everything below:

1. **The data is much bigger and much more complete.** 605 published items → **838 rows** across the same
   15 files, plus two datasets with no home in this repo yet (651 gunsmith parts, 70 hideout upgrades).
2. **Identity changed in places.** Image filenames are now keyed by item id, the gunsmith rework replaced
   the old gun assets, and a handful of published items no longer exist in the game.

This document is the plan for absorbing that into the app. It assumes the extraction repo keeps ownership
of *producing* data and this repo keeps ownership of *presenting* it.

---

## 2. The delta at a glance

Measured 2026-08-17 against `transformed/*_v3.0.0.0.json` and the current `public/data`.

| File | published now | incoming | matched | new | published-only (gone from game) |
|---|---:|---:|---:|---:|---:|
| `weapons.json` | 69 | 134 | 57 | 77 | 12 |
| `ammunition.json` | 39 | 80 | 35 | 42 | 4 |
| `magazines.json` | 57 | 93 | 54 | 39 | 3 |
| `armor.json` | 24 | 38 | 24 | 14 | 0 |
| `helmets.json` | 30 | 39 | 30 | 9 | 0 |
| `face-shields.json` | 6 | 12 | 6 | 6 | 0 |
| `backpacks.json` | 11 | 15 | 11 | 4 | 0 |
| `holsters.json` | 7 | 9 | 7 | 2 | 0 |
| `keys.json` | 33 | 42 | 33 | 9 | 0 |
| `provisions.json` | 16 | 16 | 16 | 0 | 0 |
| `medical.json` | 18 | 18 | 18 | 0 | 0 |
| `attachments.json` | 93 | 101 | 88 | 13 | 5 |
| `misc.json` | 150 | 165 | 150 | 15 | 0 |
| `task-items.json` | 43 | 67 | 43 | 24 | 0 |
| `grenades.json` | 9 | 9 | 9 | 0 | 0 |
| **total** | **605** | **838** | **581** | **254** | **24** |

New datasets with no counterpart here:

- **Gunsmith parts** — 651 items (receivers, barrels, stocks, grips, handguards, …) with weight, handling
  modifiers, compatibility tags and icons. No page, no type, no file — and deliberately none this cycle
  (§8.2); it is its own feature.
- **Hideout upgrades** — 70 upgrades / 29 areas from the season-5 DataTable. `src/data/hideout-upgrades.ts`
  is the **season-3** table (55 upgrades / 22 areas), two seasons stale.
- **Weapon presets** — a weapon is now a *preset* (what you buy) built from *parts*. Each incoming weapon
  carries `parts[]`, `receiverId`, `family`, `compatibleMagazines[]` and `gunsmithDisplay` (the gunsmith
  screen's own RPM / ergo / recoil / MOA numbers). 134 presets collapse to **38 families** and **61
  receivers**; 27 families have more than one preset (AR15 has 17, AKM 11, AK74 10).

---

## 3. Blockers in the extraction repo

The user's read was that the known leftovers — reliable `Quality` (rarity), reliable cost, and deleting
the dead FModel code — are not blockers. **That is right for those three**, with one caveat each (§3.5).
But four *other* defects were found while surveying, and those must be fixed upstream before any injection.

### 3.1 Duplicate item ids (4 collisions, 6 items) — blocking

| id | collides |
|---|---|
| `weapon-m4a1-fullattach` | `GunGenerator_M4A1_fullattach_C` and `GunGenerator_M4A1_2025Hallows_C` (same shop id) |
| `ammo-545x39-apv1` | 5.45x39mm BS (`APv1`) and 5.45x39mm 7N40 (`FMJv3`) |
| `ammo-556x45-tracer` | 5.56x45mm MK255 (`HPv1`) and 5.56x45mm M856 (`Tracer`) |
| `ammo-762x54r-apv1` | 7.62x54R SNB (`APv1`) and 7.62x54R PS (`FMJv3`) |

Distinct items with distinct ballistics collapsing onto one id. In this app the item map is keyed by id, so
one of each pair would vanish from `/items`, from search, from the sitemap and from combat-sim.
Fix belongs in `config/legacyIdMappings.js` / the id generators upstream.

### 3.2 Ammo caliber not normalised (17 items) — blocking

| items | emitted `subcategory` / `caliber` | expected |
|---|---|---|
| 9 × 12-gauge | `12Ga` / `12Ga` | `12 Gauge` / `12GA` |
| 3 × 12.7x55 | `12_7x55` / `12_7x55` | `12.7x55mm` / `12.7x55` |
| 5 × .45 ACP | `45ACP` / `45ACP` | `.45 ACP` / `.45 ACP` |

`config/gunConfigs.js` `caliberMap` is keyed case- and spelling-sensitively and the ammo path feeds it
tokens the map does not have, so they fall through unmapped. Weapons and magazines are unaffected — they
map correctly, including the two new calibers. Consequence if shipped: those 17 rounds never match a
weapon's caliber in combat-sim, and the ammo filter grows three junk subcategories.

### 3.3 `compatibleWeapons` / `compatibleMagazines` shape change — blocking

Published magazines carry `stats.compatibleWeapons: string[]` of **weapon ids** (`["weapon-m1911"]`).
The extraction now emits **objects** — `{gameId: "gunsmith.ak.lowerreceiver.ak74", name: "…"}` — and the
new `weapon.compatibleMagazines` is the same shape (`{gameId, name, capacity}`). 248 magazine references
and 503 weapon references resolve to no item id at all.

**Decided (§10.1): resolved upstream, through the gunsmith graph.** A weapon is a build, so the join
always exists — `weapon → receiver → part`. Concretely, the extraction should emit item ids:

- `magazine.compatibleWeapons`: the objects are **receiver** gunsmith ids
  (`gunsmith.ak.lowerreceiver.ak74`). Resolve each to every weapon item whose `receiverId` matches. Note
  this fans out: 61 receivers back 134 presets, so a magazine that fits the AK74 receiver lists all 10
  AK74-family presets.
- `weapon.compatibleMagazines`: the objects are **clip** gunsmith ids (`gunsmith.ak.clip.545-6l23`).
  Resolve to the magazine item carrying that gunsmith id — magazines *are* gun parts, so this is a direct
  lookup in `csv/gun_parts.csv`.

Keep the `gameId` on each item (already emitted) so the join can be re-checked, and have `validate-data`
fail on any unresolved reference. The same graph is what the gunsmith feature (§8.2) will be built on, so
resolving it once upstream pays twice.

### 3.4 `mergeWithWiki` drops helmet `canAttach` — blocking (small)

`stats.canAttach` (helmet → compatible face shields, curated, present on 6 published helmets) is not in
`CURATED_FIELDS_BY_TYPE.helmets` and the extraction produces none, so the merge silently deletes it —
merged helmets: 0/39 have it. Add it to the curated list upstream.

### 3.5 The three known leftovers — not blockers, with caveats

- **Rarity (`Quality`)** — correctly curated for matched items, so nothing published regresses. But the
  **254 new items take the disputed value**, and it is visibly wrong: 76 of 77 new weapons and all 9 new
  keys come through as Common. Ship it, flag it, fix rarity as curation (§9), not as a code blocker.
- **Price/cost** — same shape. Curated for matched items; new items get either the questionable extracted
  cost or nothing. Measured against the published values on matched items, the extracted cost **disagrees
  everywhere it exists**: weapons 57/57 differ (`weapon-m1911` 16 320 → 10 000), ammo 38/38, helmets 30/30,
  face shields 6/6. And **91 of the 254 new items get price 0** (all 39 magazines, all 13 attachments, all
  15 misc, all 24 task items).
  **Decided (§10.7): ignore for now.** Price is not crucial information; new items ship with whatever the
  extraction has, including 0. Revisit as a standalone pass later. The one thing to avoid is the UI
  presenting a 0 as a real price — render it as unknown (§5.3).
- **FModel dead-code cleanup** — pure hygiene upstream, invisible here. Not a blocker.

---

## 4. Injection mechanism

Two scripts, one on each side of the fence.

### 4.1 Upstream: `tools/publishToWiki.js` (extraction repo)

The extraction repo already knows `wikiDataDirectory` (`config/mainConfig.js`) and already has
`mergeWithWiki.js` producing wiki-ready files into `merged/`. What is missing is the last mile — currently
a manual copy, and only 11 of the 15 types have even been merged (`weapons`, `armor`, `backpacks`,
`magazines` have no `merged/` output yet).

```
node tools/publishToWiki.js <type|--all> [--images] [--dry-run] [--force]
```

Behaviour:

1. Run the merge for each requested type (or reuse `merged/` if fresh), so curated fields are preserved.
2. Refuse to write if the target working tree has uncommitted changes under `public/data` (unless
   `--force`) — the wiki repo is the one holding hand-curation, and it must never be clobbered silently.
3. Write `public/data/<file>.json` (2-space JSON, stable id sort — the merge already sorts).
4. With `--images`, copy `extracted/images/<dir>/*.webp` → `public/images/items/<dir>/`, and report
   (never auto-delete) files in the target that no incoming item references.
5. Write a run report — `merged/publish-report.json` plus a console summary: per type added / removed /
   changed ids, items with empty description, items with price 0, items whose icon file is missing.

Small enough to be a single script; the merge logic it needs already exists.

### 4.2 Here: `npm run validate-data`

Takes an optional `--data <dir>` to validate a candidate set instead of what is published —
`npm run validate-data -- --data ../exfil-zone-assistant-extraction/merged` — so a merge can be checked
before Phase 3 lands it. Images still resolve against this repo's `public/`, which is where they have to
end up regardless of where the JSON came from, so expect `image-missing` until the publisher has run
with `--images`.

A new `scripts/validate-data.ts` (tsx, same pattern as the existing `db:*` scripts), run in CI and before
every data commit. It must fail on:

- **Duplicate ids** — across all files, not just within one (§3.1).
- **Enum drift** — every `stats.rarity` ∈ `ItemRarity`; every `stats.caliber` ∈ `CALIBERS`; every
  `subcategory` ∈ the category's declared list in `itemCategories`.
- **Required fields** — the per-category required stats the UI dereferences without a guard.
- **Referential integrity**
  - `src/data/tasks.ts` item references → item ids (**8 break today**, §6.1)
  - `public/data/combat-sim-test-data.json` → item ids (**2 break today**)
  - hideout `exchange` keys → misc ids (0 break — the extraction resolves 88 of 89 shop ids)
  - `magazine.compatibleWeapons` → weapon ids, `weapon.compatibleMagazines` → magazine ids (§3.3)
  - `helmet.canAttach` → face-shield ids (§3.4)
- **Image existence** — every `images.icon` resolves to a file under `public/images`.
- **Head gear protection** — every helmet and face shield has `coneRegions` **or** `protectiveData`
  (§7.3). NVGs are exempt by `subcategory`/kind.

…and only **report** (never fail) on:

- items tagged `extractionStatus: "missing-from-game-data"` — awaiting the manual review in §10.2;
- image files under `public/images/items` that no item references — kept deliberately per §10.6;
- items with `price === 0` or an empty `description` — the curation backlog in §9, deliberately not a gate.

This is the safety net that lets the rest of the plan move fast, so it comes **first**.

---

## 5. Schema and type changes

`src/types/items.ts` and `src/services/ItemService.ts` need to move before the data lands, otherwise the
new fields are stripped at load (`transformItemData` copies field by field — anything not listed is dropped).

### 5.1 New enum members

```ts
// CALIBERS: add
'12.7x55'   // RSH-12 revolver round — 3 ammo, 1 weapon family
'9x39'      // 4 ammo, VSS/AS Val family

// itemCategories.weapons.subcategories / itemCategories.ammo.subcategories: add
'12.7x55mm', '9x39mm'

// itemCategories.keys.subcategories: add
'Smuggling Tunnel', 'Smuggling Tunnel (Infection)'   // Map5, a whole map the wiki never had

// itemCategories.gear.subcategories: add
'Night Vision'    // the 2 NVGs in face-shields.json — no protection model by design
'Eye Protection'  // already used by mask-lh250-goggle in the published data, never declared

// TaskItemSubcategory: add
'Unassigned'      // quest items nobody has assigned to a trader yet — see §5.3
```

`Keys.subcategory` is a literal union in the type as well; it currently lists `'Suburb' | 'Office
Buildings' | 'Industrial' | 'Residential' | 'Military'`, none of which the data has used for a while — the
live values are `Suburb | Dam | Metro | Resort` plus the two new ones. Fix the union to match reality.

### 5.2 New fields to carry through

| type | new `stats` fields | note |
|---|---|---|
| weapons | `fireModes: FireMode[]`, `recoilComponentParameters` | `fireMode` stays as the primary; `fireModes` is the real bit set. `recoilComponentParameters` is null on all 134 today — omit until it isn't. |
| ammo | `damageFalloffFactor`, `penetrationFalloffFactor`, `bulletProfileId` | `damageAtRange` / `penetrationAtRange` / `weight` / `pellets` remain curated upstream — keep the fields. |
| armor / helmets / face shields | `armorLevel`, `sellId` | `armorLevel` duplicates `armorClass` on most rows; confirm which the UI should trust. |
| helmets / face shields | `coneRegions[]`, `faceWidthAngle`, `faceHeightAngle` / `maskWidthAngle`, `maskHeightAngle` | the game's actual head-protection model — see §7. |
| backpacks | `storageGrid {x,y,z,unit}`, `sellId` | `sizes` string stays; the grid is the real container. |
| keys | `uses`, `location` | `uses` = `RemainingUseTimes`; `location` = where in the map the door is. Both are new player-facing information. |
| provisions | `thresholdTime`, `stackSize` | |
| medical | `healPerSecond`, `healDuration`, `operationRequirement`, `sellId` | |
| attachments | `gunsmithId` | replaces the removed `template`. |
| throwables | `radiusMax` | `radius` is now the *min* blast radius; `radiusMax` is new. Check `GrenadeSpecificStats.tsx` labels. |
| weapons (top level) | `parts[]`, `receiverId`, `family`, `defaultClip`, `compatibleMagazines[]`, `gunsmithDisplay`, `gameId`, `gameClass` | the gunsmith payload — §8. |

### 5.3 Fields that change meaning or go away

- `weapon.stats.penetration` — null on 52 of 134. Was never a real weapon stat (penetration is ammo);
  treat as optional and hide when absent.
- `weapon.stats.MOA`, `muzzleVelocity`, `hitDamage`, `headDamageScale`, `fireMode` — the game authors these
  on only some receivers (61 of 134 lack MOA and muzzle velocity, 59 lack fire mode). The merge fills them
  from the published data **where the extraction has none**, but only for the 57 matched weapons; the 77
  new ones will show gaps. Every render site needs a null guard.
- `helmet.stats.protectiveData` / `soundMix` — no longer extracted. Curated values survive for the 30
  matched helmets and 6 matched face shields; the **9 new helmets and 6 new face shields have none**. §7
  replaces this model rather than back-filling it.
- `stats.price === 0` — real for 91 new items and not a real price (§3.5). Render as "—" / unknown rather
  than as free, everywhere price is shown (`ItemCard`, item detail, hideout totals).
- `taskItem.subcategory` — the published value is the *trader* (`Tommy`, `Igor`, …), which does not exist
  anywhere in the client data. The merge preserves it for the 43 matched items; the **24 new ones carry a
  quest-folder path** (`ItemRetrieval/GunPowder`, `Placement/Igor_beer`, …). These must be curated to a
  trader before they can appear in the filter UI, or the sidebar grows 50-odd junk entries.

---

## 6. Broken references to repair

### 6.1 `src/data/tasks.ts` — 8 dead weapon ids

159 item ids are referenced from task data; 8 no longer exist in the game:

```
weapon-m4a1-agent    weapon-mp9-n       weapon-m4a1-cqbr   weapon-aug-a3-stg77
weapon-hk51-ace      weapon-ar308-lt    weapon-aks74u-zt   weapon-akmn-xm
```

They are part of the 12 published weapons the gun rework removed (the other four —
`weapon-ak74n-mod1`, `weapon-akm`, `weapon-akmn-glp`, `weapon-p250` — are unreferenced). Same for the
other removals: 4 ammo (`ammo-45acp-tracer2`, `ammo-12ga-slug-ap`, `ammo-12ga-buckshot-hp`,
`ammo-12ga-slug-hp` — the last three look like spelling variants of rounds that *do* exist under new ids,
so probably renames rather than deletions), 3 magazines, 5 attachments (`supressor_mp9_suppressor`,
`scope_mosinpu`, `scope_psgscope`, `scope_svtpu`, `scope_falconzf`).

**Decided (§10.2): manual review, item by item.** `mergeWithWiki` already keeps every published-only item
and tags it `extractionStatus: "missing-from-game-data"`, so nothing disappears silently — the 24 tagged
items get reviewed and either mapped (`config/legacyIdMappings.js` upstream, if it is the same thing
renamed — `compareWithWiki` proposes candidates) or deleted along with their task references. What this
repo needs from that decision is small and mechanical:

- `validate-data` **reports** tagged items rather than failing on them, so review can happen at leisure.
- but it **fails** on a dangling reference from `tasks.ts` / `combat-sim-test-data.json`, so a deletion
  can never land without its references being cleaned.

### 6.2 `public/data/combat-sim-test-data.json` — 2 dead ids

`weapon-m4a1-agent`, `weapon-aks74u-zt`. Fix with the same mapping decision as above.

### 6.2b ✅ Both turned out to be already resolved (verified 2026-08-18)

`npm run validate-data -- --data <extraction>/merged` reports **zero dangling references** against the
incoming 862 items, confirmed independently: all 204 distinct task item references and all 24 combat-sim
fixture references resolve. The 8 + 2 ids above survive because `mergeWithWiki` keeps published-only
items and tags them, and because `config/legacyIdMappings.js` pins the renames.

So **§6.1/§6.2 need no repair work** — what remains of Phase 5 is the editorial half: reviewing the 24
tagged items and deciding, per item, map-or-delete. A deletion still has to take its references with it,
which is what the validator's `ref-*` failure is there to enforce.

One thing this did surface: **23 task rewards carry an `item_name` display string and no `item_id`**, so
they link to nothing (`task-reward-unlinked`). Most name containers and ammo boxes that are not wiki
items at all, so this is mostly not fixable — but `forge_10` rewards "AN/PVS 31 Night Vision", which the
new data *does* ship as `nvg-anpvs31`. Same defect class as the `regiment_12` reward fixed in Phase 0.

### 6.3 Guides hard-code three image paths

`src/content/guides/survival-damage-mechanics.tsx` points at
`/images/items/medical/Icon_WarfarePainkillerLv1_cropped.webp`, `icon_suturingdevice.webp` and
`icon_Gauze_cropped.webp`. All three are old asset-named files that no item will reference after the
image swap (§6.4). Repoint them at the new id-named files.

### 6.4 Images: a full filename swap

Every incoming item points at `/images/items/<dir>/<item-id>.webp`. The published files are named after
game assets (`Icon_WarfareHelmet_6B47.webp`). So:

- **~800 new files** to copy from `extracted/images/**` (the extraction has them all; 6 items lack an icon:
  `armor-warfaretecvest`, `helmet-warfarehelmet`, `mask-warfaremask`, `nvg-nightvisiondevice`,
  `key_metro_entry_ticket`, `sight_attachmets_staticbase` — five of the six are abstract base classes).
- **680 published files become unreferenced** (weapons 73, attachments 114, misc 169, magazines 59, …).
  Exactly one published file stays referenced.
  **Decided (§10.6): keep them for now**, clean up in a later pass once the new set has proven itself.
  They cost repo size only — `next build` does not bundle unreferenced files in `public/`. Two things
  follow: `validate-data` must not fail on orphans (report them as a count), and the guide images (§6.3)
  keep working meanwhile, so repointing them becomes tidy-up rather than a release blocker.

---

## 7. Head protection — new cone logic in the simulator

**Decided (§10.3): this app grows new logic that applies the cone information directly.** The per-bone
helmet model is retired rather than back-filled.

Why it has to change anyway: post-rework head gear protects through **`coneRegions`** — rectangular
frustums with an apex offset, a rotation and half-angles — and `HelmetBase.GetProtectiveData` *synthesises*
a `ProtectiveData` on the fly from the item's single `Anti Penetration` / `Blunt Damage Scalar` pair,
gated on that geometric test. So (per upstream `docs/HEAD_PROTECTION.md` §4):

> A helmet has exactly **one** armour class and **one** blunt scalar for the whole head. The geometry
> decides *whether* they apply to a given hit, never *how much*. Any wiki model that assigns different
> armour values to different head zones is inventing data.

Which is exactly what `head_top` / `head_eyes` / `head_chin` do today — they were hand-approximated and
have no counterpart in the build. The 9 new helmets and 6 new face shields arriving with
`protectiveData: []` are not the problem; they are the symptom.

### 7.1 What the new logic needs

- **A hit direction.** This is the real design change. The current model is direction-free: a zone id
  either appears in `protectiveData` or it does not (`protectionAngle` is carried but explicitly unused).
  The cone test is `dir = normalize(hitLocation − regionOrigin)` against each region's frame, so the sim
  needs an incidence direction the user can set — at minimum front / side / back, ideally a continuous
  azimuth on the body model. That choice drives the UI, not just the maths.
- **The hit test itself** (upstream §3, pinned off the Blueprint graph — port it verbatim):
  ```
  dir      = normalize(hitLocation - regionOrigin)     // regionOrigin = component + region offset
  F, R, U  = forward/right/up of the region's frame
  yawDev   = degAcos(dot(F, normalize(project(dir, U))))
  pitchDev = degAcos(dot(F, normalize(project(dir, R))))
  inside   = yawDev < widthAngle && pitchDev < heightAngle
  ```
  Two traps: the authored angles are **half-angles**, and each region is measured **from its own apex** —
  dropping the offsets gives visibly wrong answers regardless of anything else.
- **A head model** — centre and radius in local space — to turn "protected from this direction" into the
  coverage figure the item page shows. Upstream §7.2 calls for calibration and for reporting sensitivity
  rather than picking a radius quietly.
- **Face shields flip up.** `WF_WarfareMask` carries `Active Mask` / `SetMaskRotator` / `MaxLerpYaw`, so a
  shield's coverage applies only while lowered — a state the defender setup will need.
- **NVGs are not armour.** The 2 night-vision devices in `face-shields.json` have no regions, no armour
  class and no durability by design; keep them out of the protection path entirely.

### 7.2 The upstream dependency this does *not* remove

Region **polarity** — whether a region marks an opening or a covered patch — is still unresolved
(upstream §6), and a naive "regions are openings" reading inverts the helmet ranking (an Epic AC4 helmet
comes out 8.6% covered, a cosmetic beanie 78.2%). Implementing the logic here does not settle it; the
answer comes from decompiling `HelmetBase.HitConeRegion` / `WF_WarfareMask.IsFaceHitMask`, which upstream
lists as the first thing to do and has the bytecode in hand for.

So: build the geometry and the UI against the test above with polarity as a **parameter**, validate against
the calibration anchors in upstream §8 (the CCBM's two 9.2°×7° eye frustums at yaw ±17°, the 6B47 as an
open-face bowl, the M1sch's vision slit), and flip the parameter once the decompile lands. That ordering
lets the work start now without betting on the wrong reading.

### 7.3 Guard rails meanwhile

- `validate-data` fails on a helmet or face shield with **neither** `protectiveData` **nor** `coneRegions`
  (rather than on empty `protectiveData`, which is now the expected state).
- Until the new path is live, head gear that has only `coneRegions` must be visibly marked in the sim
  rather than silently simulated as unprotected — 15 items showing plausible-looking numbers that are
  wrong is worse than 15 items showing "not yet modelled".

---

## 8. New datasets, and the pages that show them

### 8.1 Hideout upgrades — season 3 → season 5

`src/data/hideout-upgrades.ts` is a keyed object of 55 upgrades over 22 areas, plus an `areaIcons` map.
The extraction produces an **array** of 70 upgrades over 29 areas with a different shape. Concretely:

- **10 new areas** — `CrptoMining`, `WorshopZone`, `StorageExpansionStart`, `StorageZoneLock4`,
  `GunsmithArea`, `GeneratorZone`, `RestroomZone`, `BlackmarketMoreitem`, `BlackmarketQuality`,
  `AreaUpgradeArea`. None has an `areaIcons` entry, and none has a position in `AREA_POSITIONS`
  (`HideoutOverview.tsx`) — the hideout map is hand-placed, so this is manual layout work.
- **3 areas renamed** — `CryptoMining`→`CrptoMining`, `WorkshopZone`→`WorshopZone` (both misspellings are
  the game's own), `Gunsmith`→`GunsmithArea`.
- **The id convention breaks.** This app builds ids as `` `${areaId}Lv${level}` ``. The extraction uses the
  DataTable row name, which for single-level areas has no suffix — `MedicalArea`, `ShootingRange`,
  `Workshop`, `StorageZoneLock1`. 28 ids added, 13 removed, mostly from this. Either normalise ids in the
  converter (recommended — keeps `HideoutOverview` untouched) or teach the page both forms.
- **Shapes differ**: `exchange` is an array of `{tag, name, count, itemId}` (not a `{itemId: count}` map),
  `levelConditions` is an array of `{areaId, level}` (not a map), `price` moved to `stats.price`,
  `upgradeName`/`upgradeDesc` are `name`/`description`, `levelUpIcon` is now a resolved image path.
- **All 42 shared upgrades changed their exchange recipe** and 6 changed price — this is a real season
  update, not a re-encoding. The published file cannot be partially updated; it is a replacement.
- **`relatedQuests` is curated** — 7 entries carry it, the extraction produces none. Preserve on merge.
- 3 exchange entries have an unresolved `itemId` (the shop id names a valuable that is not shipped).
- **17 of 70 upgrade icons and 7 of 29 area icons are not yet exported** upstream (they need an FModel PNG
  pass over `Warfare/Store/UI/AreaLevelup/Assets`). Those come with placeholders or wait.

Deliverable: a converter (upstream, next to `publishToWiki`) emitting the keyed-object shape this app
already consumes, so the page's logic and `AREA_POSITIONS` survive; then a manual pass for the 10 new
areas' positions and icons.

### 8.2 Gunsmith parts — a separate feature, deferred

**Decided (§10.5): its own feature, not part of this migration.** 651 parts with weights, two modifier
structs, install/provide compatibility tags and icons, plus 134 presets carrying their parts lists and the
gunsmith screen's own display stats — that is a build planner, and it deserves its own plan.

What this migration owes it: nothing beyond keeping the payload intact. The `parts[]`, `receiverId`,
`family`, `defaultClip`, `compatibleMagazines[]` and `gunsmithDisplay` fields ride along on `weapons.json`
from Phase 3 (§5.2), and the compatibility ids get resolved upstream in Phase 1 (§3.3) — so when the
feature starts, the graph it needs is already published and already validated. `csv/gun_parts.csv` stays
upstream until then; do not add a `gunsmith-parts.json` to `public/data` on spec.

### 8.3 The weapons page: families within calibers

**Decided (§10.4): group by family, within the existing caliber subcategories.** Caliber stays the
top-level filter it is today; inside a caliber, the presets collapse into their `family` and the variants
sit under it. The numbers that make this necessary: 134 presets over **38 families**, 27 of which have more
than one preset — AR15 has 17, AKM 11, AK74 10 — and many variants differ only cosmetically (Titan,
Pumpkin, voucher editions). Flat, that is a worse page than today's 69.

Two wrinkles to handle in the grouping:

- **4 families span two calibers** — AUG (9x19 + 5.56x45), Malyuk (5.45x39 + 7.62x39), ScarLH (5.56x45 +
  7.62x51), Vector (.45 ACP + 9x19). So group *within* a caliber view rather than assigning a family a
  caliber: a family appears under each caliber it has presets for, showing only those presets.
- **11 families have a single preset** — they should render as a plain item, not a group of one.

A family is not the same as a receiver (AK74 has 4 receivers across 10 presets), so if variants need to be
distinguished by ballistics rather than looks, `receiverId` is the field that says so — same-receiver
presets share the entire simulation model and differ only in parts and price.

---

## 9. Curation backlog

254 new items arrive with gaps the game files genuinely do not contain. This is editorial work, not
engineering, and it is the long pole.

| gap | count | note |
|---|---:|---:|
| empty `description` | 496 | the game ships descriptions for gear/food/medical only |
| `price` 0 | 189 | all new magazines, attachments, misc, task items — **deferred** (§10.7) |
| `price` present but disputed | 163 | weapons/ammo/helmets — **deferred** (§10.7) |
| rarity almost certainly wrong | ~120 | 76 of 77 new weapons and all 9 new keys read Common |
| task-item trader subcategory | 24 | quest-folder paths, not traders (§5.3) |
| **no `name` at all** | 11 | **hard failure** — see below |
| **no `stats.weight`** | 45 | **hard failure** — all ammo; the bullet profiles carry no per-round weight |

Counts are from `npm run validate-data -- --data <extraction repo>/merged`, i.e. against the incoming
838 items rather than the 605 published ones; the description and price figures therefore include the
backlog the published data already had (259 and 98 respectively).

Two of these are **hard validator failures**, not warnings, and they are the ones to clear first:

- **11 items with no name.** `ItemService` filters out anything without one, so these do not render
  broken — they silently do not exist. Six are abstract bases that arguably should not ship at all
  (`backpack_base`, `helmet-warfarehelmet`, `mask-warfaremask`, `nvg-nightvisiondevice`,
  `rail_mlok_railattachment_45`, `supressor_qdl`); five are real quest items
  (`taskitem_black_panther_medal`, `taskitem_bug`, `taskitem_ducktoy`, `taskitem_gold_lion`,
  `taskitem_taskitemblack_panther_documents`).
- **45 ammo rounds with no weight.** Only the 39 rounds that were on the published wiki have a curated
  weight; the game's bullet profiles do not carry one. Either curate them or decide weight is not a
  thing the ammo page shows.

With price deferred, the order is: names → weights → trader subcategories → rarity → descriptions. The
first three block validation or the UI; the last is cosmetic and can trickle.

---

## 10. Decisions taken (2026-08-17)

1. **Compatibility ids** (§3.3) — **resolved upstream, through the gunsmith graph.** A weapon is a build,
   so `weapon → receiver → part` always traces; the extraction emits item ids and keeps `gameId` for
   re-checking.
2. **Removed items** (§6.1) — **manual review**, item by item, using the `extractionStatus` tag. This repo
   reports tagged items and hard-fails only on dangling references.
3. **Head protection** (§7) — **new logic here that applies the cone information.** The per-bone head model
   is retired, not back-filled. Polarity stays a parameter until the upstream decompile settles it.
4. **Weapons page** (§8.3) — **families within calibers**, variants under the family.
5. **Gunsmith parts** (§8.2) — **a separate, large feature.** Data rides along, no UI this cycle.
6. **Old images** (§6.4) — **keep for now**, clean up later. Orphans are reported, never failed on.
7. **Extracted cost** (§3.5) — **ignored for now.** Not crucial; revisit as a standalone pass. UI must show
   a 0 price as unknown rather than free.

---

## 11. Phasing

Each phase is independently shippable and leaves the app green.

**Phase 0 — safety net.** ✅ **done 2026-08-17.** `scripts/validate-data.ts` + `npm run validate-data`
(`--verbose` for full lists). Baseline against the *published* data — 605 items, 15 files:

| | count | note |
|---|---:|---|
| errors | 28 → **1** | see below |
| `ref-gunsmith` | 26 | `magazines.json` → `weapon-malyuk545`, `weapon-seca16`, `weapon-malyuk762`, … — stale weapon ids that predate this migration. Resolved wholesale when magazines regenerate in Phase 3 (§3.3). |
| `enum-drift` | 1 | `mask-lh250-goggle` has subcategory `Eye Protection`, undeclared in `itemCategories.gear`. Fixed in Phase 2 (§5.1). |
| `ref-tasks` | 1 | **fixed now** — `tasks.regiment_12` rewarded `"G3 10-Round Magazine"` (a *name*) instead of `mag_762x51_10_2`. |
| warnings | 358 | `curation-description` 259, `curation-price` 98, `image-orphan` 103 files |

Two things worth carrying forward: the 2 dead combat-sim ids and 8 dead task ids predicted in §6 do **not**
fire yet — they are dead against the *incoming* data, so they appear in Phase 3, exactly as intended. And
the curation backlog (§9) is not new: the published data already ships 259 empty descriptions and 98
zero prices, so the 254 incoming items add to a known condition rather than introducing one.

**Phase 1 — upstream fixes.** 🟡 **in progress.** The four blockers are fixed and verified in the
extraction repo; `process-all` re-runs clean (838 items, no errors):

- **§3.1 duplicate ids** — the three ammo collisions and the M4A1 one pinned in
  `config/legacyIdMappings.js` (`ammo-545x39-bs`, `ammo-556x45-m856`, `ammo-762x54r-snb`,
  `weapon-m4a1-fullattach-2025hallows`), plus a **collision guard in `core/extractionEngine.js`** so a
  future one fails the transform instead of silently dropping an item.
- **§3.2 ammo calibers** — `caliberFromEnum` now matches case- and punctuation-insensitively and warns on
  an unmapped token. All 80 rounds carry a canonical caliber; the three junk subcategories are gone.
- **§3.3 compatibility ids** — resolved to item ids in `config/csvSources.js`, with the id rules moved to
  a shared `config/idGenerators.js` so the two sides cannot drift. **The receiver-only join was wrong**:
  G3/RC51/PSG magazines install on the *upper* receiver, the MP5's on its upper, the M40A5's on a
  *stock* — so the join now traces the preset's whole parts list. That took the graph from 503 edges
  with 13 unlinked magazines and 21 unlinked guns to **592 edges, 0 unlinked, 0 unresolved, symmetric
  in both directions**.
- **§3.4 helmet `canAttach`** — added to the helmets' curated list; the 6 published lists survive the
  merge again.

✅ **Phase 1 finished.** All 15 types are merged, including the four that never had been (`weapons`,
`armor`, `backpacks`, `magazines`), and `tools/publishToWiki.js` exists:

```
node tools/publishToWiki.js <type|--all> [--images] [--dry-run] [--force] [--version X]
```

`mergeWithWiki.js` now exports `mergeType()` so both it and the publisher run the identical merge. The
publisher writes the data, copies only the icons the incoming items reference (byte-compared, so an
unchanged icon keeps its mtime and the diff stays honest), never deletes, and writes
`merged/publish-report.json`. Two guards, both proven against this repo:

- **it aborts on uncommitted changes** in the files it would overwrite (scoped to those files, so the
  untracked conversion scratch already sitting in `public/data` is correctly ignored);
- **it warns when `--images` is missing.** Learned the hard way in a trial publish: icon paths are keyed
  by item id, so a data-only publish leaves every item of that type pointing at a file that is not
  there. The trial (`grenades.json`) was validated and reverted; `npm run validate-data` caught all 27
  broken image references, which is the safety net behaving exactly as designed.

**Prerequisite this surfaced for Phase 3** — 9 referenced icons exist in neither repo. Five are abstract
base classes with no icon by design (`armor-warfaretecvest`, `helmet-warfarehelmet`, `mask-warfaremask`,
`nvg-nightvisiondevice`, `sight_attachmets_staticbase`), but **four are consequences of the §3.1 id
fixes** — `weapon-m4a1-fullattach-2025hallows`, `ammo-545x39-bs`, `ammo-556x45-m856`,
`ammo-762x54r-snb` had their icons exported under the colliding ids. They need a re-crop, which needs
the manual FModel PNG export: the atlas *JSONs* are in the export root but the PNGs are not, so
`crop_icons.py` currently writes nothing. Same manual step the 13 hideout textures are waiting on
(§8.1), so do them in one pass. Worth spot-checking while there: for each of the three collided ammo
pairs, the icon on disk under the surviving id belongs to whichever row was cropped last, so one of the
pair may be showing the other's picture.

**Phase 2 — types and service.** ✅ **done 2026-08-18.** §5, additive only. `npx tsc --noEmit` and
`npm run build` both pass, and `npm run validate-data` against the *published* data is down to the 26
pre-existing `ref-gunsmith` errors — the `Eye Protection` enum drift is gone.

What it changed, beyond the list in §5:

- **`validate-data` gained `--data <dir>`**, so a candidate set can be checked before it is published:
  `npm run validate-data -- --data ../exfil-zone-assistant-extraction/merged`. That is the check that
  makes this phase verifiable rather than hopeful, and against the incoming 838 items it reports
  **zero enum drift and zero dangling references** — every subcategory, rarity and caliber is now
  declared, and the 26 broken magazine→weapon links are fixed by the regenerated data (§3.3).
- **`Eye Protection` is now curated upstream.** It turned out not to be a missing enum member but a
  *disappearing item*: the game files put every mask under `Warfare/Helmet/Mask`, so the merge was
  quietly reclassifying the LH250 Goggle as a face shield. `subcategory` is now in
  `CURATED_FIELDS_BY_TYPE.faceShields` in the extraction repo, and `FaceShield` covers both shelves —
  one protection model, two curated names.
- **Unclassified quest items are bucketed, not scattered.** `ItemService` maps any task-item
  subcategory that is not a trader to `Unassigned` (declared in `TASK_ITEM_SUBCATEGORIES`), so the 24
  new items give the filter UI one extra entry instead of twenty. The validator reports them as
  `curation-task-trader` warnings rather than failing — the app is fine, they are a curation queue.
- **`formatPrice` renders 0 as "Unknown"** rather than "0 EZD" (§5.3), at both call sites.
- **The ammo range cache is optional now.** Only the 39 previously-published rounds carry
  `damageAtRange` / `penetrationAtRange`; the falloff functions fall through to the ballistic curve
  the cache was computed from, so the other 45 behave identically instead of throwing.
- **Cone-only head gear says so.** `ArmorSpecificStats` shows a one-line notice where per-bone zones
  are absent, instead of an empty gap that reads as "protects nothing", and `soundMix` /
  `bluntDamageScalar` / `durabilityDamageScalar` / `maxDurability` render "Unknown" when absent rather
  than "Strong" and "0%".

Two things it deliberately did **not** do. `recoilComponentParameters` is null on all 134 weapons, so it
stays out of the types until it isn't. And the head-protection *model* is untouched — that is Phase 6.

**Phase 3 — data + images.** ✅ **done 2026-08-26.** `node tools/publishToWiki.js --all --images` ran for
all 15 types: **855 items, 250 added, 0 removed** (605 → 855), with every referenced icon copied.
`npm run validate-data` reports **no errors**. Old images stay (§10.6), so the guide images keep working
and nothing 404s.

Five upstream decisions were settled to get there, all confirmed against the game (2026-08-26):

- **The ammo variant tokens shifted.** An id is `ammo-<calibre>-<variant token>`, and the game re-sorted
  which bullet asset carries which token — so five published ids named a different round than the asset
  that generates them (`ammo-545x39-apv1` was 7N40, is BS). The game's current token now owns the id and
  the three displaced rounds move to new ids (`ammo-545x39-fmjv3`, `ammo-556x45-hpv1`,
  `ammo-762x54r-fmjv3`). A sweep over all 39 published ids found **8** clashes, not the 3 first noticed;
  the other 3 are the same asset renamed in game and need nothing. `mergeWithWiki` carries a hand-written
  `REASSIGNED_IDS` list so the previous occupant's curated name and cached damage ladder are not grafted
  onto a different round — a name heuristic was tried first and cannot tell a shift from a rename.
- **Abstract base classes stop at the wiki.** Six Blueprints (five gear/backpack bases plus
  `WF_Attachmets_StaticBase`) were publishing as items with no icon and mostly no name. They stay in the
  CSVs, since variants inherit their stats, and are dropped in `csvSources.ABSTRACT_BASE_STEMS`. This
  matters more than it looks: `ItemService` filters on `item.id && item.name`, so an unnamed item
  publishes, counts, and then does not exist in the app.
- **`armorLevel` is gone.** It was never a field — it is read back out of which shared
  `AntiPenetrationDurabilityScalarCurveLv<N>` asset the gear points at, empty for the 25 pieces that
  inline their own curve and disagreeing with the authored value on 30 of 89. `armorClass`
  (`AntiPenetrationDisplay`) is the one legit value, here and in `ArmorProperties`.
- **Ammo weight has a default.** The bullet profiles author none; the parent class's 0.01 kg is the
  fallback, and `stats.weight` stays curated so the 39 published rounds keep their values.
- **Six items were named or dropped by hand** — five quest items with no string-table entry, plus
  `WF_QDL` (nameless but it authors a shop id and a full modifier block, so it is real). The MS2000
  Tracker's missing weight is curated to 0.24 kg from the paired MS1000 prototype.

The icon gap the previous phase predicted closed on its own: the atlas PNGs *were* in the first of the
two FModel export roots, so the 4 orphaned crops and the 3 collided ammo pairs were simply re-cropped.
**The only manual FModel work left is 13 hideout textures** (§8.1), which do not block anything else.

Cone-only head gear is still not modelled in the sim — that is Phase 6.

**Phase 4 — weapons page.** ✅ **done 2026-08-26.** §8.3, families within calibers.

`src/app/items/utils/weaponFamilies.ts` splits a filtered list into `(family, caliber)` groups and loose
items; `WeaponFamilyGroup.tsx` renders a group as a collapsible row — cover image, family label,
variant count, receiver count where it is more than one, and the price range. `ItemsPageContent` groups
only when the weapons category is active and leaves every other category the plain grid it was.

Both wrinkles are handled as specified. Keying on `(family, caliber)` rather than family alone is what
keeps the 9x19mm AUG off the 5.56x45mm shelf, and a group of one is not a group — it falls through to a
plain card, which covers the 16 single-preset pairs *and* the 12 wiki-only weapons that carry no family.

Verified against the published data: 146 weapons → **26 groups + 28 loose cards, 146 accounted for**.
The caliber views are the ones that matter and they read well — 5.56x45mm is 27 items as
`AR15(17) AUG(4) HK416(2)` plus 4 loose; 7.62x51mm is 28 items as `AR308(3) G3(11) M1A(2) SA58(4)
SCAR-LH(4)` plus 4.

Two details worth knowing. Searching expands every group, because a hit inside a collapsed row is
invisible; the group is remounted on that toggle so its own open state picks up the new default. And
`WEAPON_FAMILY_LABELS` in `types/items.ts` fixes the nine family names that are asset-path spellings
rather than gun names (`Mp5` → MP5, `SR3M_VSS_ASVAL` → SR-3M / VSS / AS VAL).

**Phase 5 — references.** 🟡 **worked through 2026-08-26; what is left needs the game, not the data.**
The 8 + 2 dead references never materialised (§6.2b), so this was the three review queues. Two of them
are now largely closed and the third is shown to be underivable:

| queue | before | after |
|---|---:|---:|
| `missing-from-game` (review and delete) | 24 | **16** |
| `curation-task-trader` (quest item has no trader) | 24 | **17** |
| `task-reward-unlinked` | 23 | **22** |

**Ammo — 3 of 4 recovered.** `12 Gauge Buckshot`, `12 Gauge AP-20 Slug` and `12 Gauge RIP slug` were
never gone: three of the four 12-gauge assets picked up a version suffix in the rework
(`12Ga_Bullet_SlugAP` → `SlugAPv2`) and one was renamed in game, so the ids came apart. All three are
pinned in `legacyIdMappings`, which also collapses the duplicate rows the first publish created. Only
`.45 ACP Tracer` is really deleted — the game ships one `45ACP_Bullet_Tracer` where the wiki had two.

**Attachments — none of the 5 were deleted, all 5 moved.** In the gunsmith system a scope or suppressor
that mounts to one specific gun is a **gun part**, not a free-standing attachment — the same
reclassification that turned every magazine into `GunpartType.Clip`. All five are complete in
`csv/gun_parts.csv`; `gunsmithParts` just has no wiki file yet (§8.2). They are tagged
`moved-to-gunsmith-parts` and reported as `extraction-relocated`, so the delete queue stops asking about
items that only need the gunsmith page to exist.

**Ammo names now come from the game.** Falling out of the above: `name` is the one common curated field
ammo opts out of (`CURATED_FIELDS_EXCLUDED_BY_TYPE`). A round's name *is* its identity — it is what tells
BS from 7N40 — and keeping the wiki's copy was outvoting the game on four renames, publishing "12 Gauge
Buckshot" for a round the game calls "12GA Express" and "7.62x39mm FMJ Tracer" for T-45M. The 39
published rounds move to the game's spelling, which elsewhere differs only in case (`Mk318` → `MK318`).

**Weapons — 12 investigated, 0 resolved, and the method matters.** The first approach was to match each
stale weapon's old icon filename against the icons the shipped presets use. It reported that none of the
12 has a counterpart — and then reported the same for **55 of the 57 weapons that demonstrably do still
ship**, because the rework replaced the whole icon set. The test was worthless and its confident answer
was wrong; recording that here so it is not tried again.

What is actually known: all 134 presets already carry an id, so a stale weapon is only recoverable if one
of the 77 new ids is the same gun. Searching `csv/guns.csv` finds no preset for MOD1, GLP, MX-AKM, ZT,
LT, STG77, ACE or Agent, and none for the P250 (already documented — its magazine is one of the three
genuinely-gone ones). Two are worth an in-game look and nothing more:

- `weapon-m4a1-cqbr` "M4A1 CQBR" against `GunGenerator_M4A1_CQB` "M4A1 CQB edition" — one CQB M4 before,
  one now, and the name is a plausible re-spelling.
- `weapon-mp9-n` "MP9-N" against `GunGenerator_MP9FoldStock` — three MP9s before (base, T, N), three now
  (base, T, Fold Stock), so it pairs by elimination.

Neither is applied. Stats do not settle either (every MP9 shares one MOA), and this is exactly the shape
of inference that produced the ammo mess.

**Trader shelves — 7 of 24, and the rest are not in the client data.** The link from a quest item to its
quest exists nowhere the extraction can reach, which is the same gap that makes `stats.taskIds` curated.
Seven are settled by outside evidence and are in `manualOverrides.taskItems` with the evidence on each
line — four by a task in `src/data/tasks.ts` that names the item (`trupiks_15` → Johnny, `forge_9` →
Maximillian, `regiment_12`/`regiment_14` and `regiment_28` → Igor), three by an asset path or stem that
names the trader outright (`Task/ItemRetrieval/Igor_Sake`, `taskitem_maggie_mince_photo`). The other 17
stay on their folder name until someone checks them in game. Note that org → trader is *not* a valid
inference here: ARK has two merchants, so "ARK Floppy Disk" could be Tommy or Maximillian.

**Task rewards — 1 of 23 linkable.** `forge_10`'s "AN/PVS 31 Night Vision" is now `nvg-anpvs31`. The
other 22 are secure containers, ammo boxes and shop bundles ("Pluto secure container", "Mag&attchament
box") that are not wiki items and should not become them.

One process lesson worth carrying into §12: **publishing makes the published file the curation
baseline.** Both the duplicate 12-gauge ids and the seven trader shelves had to be patched in
`public/data` as well as fixed upstream, because the merge preserves what the wiki already says and the
wiki had just been given the un-curated value by the previous publish. Re-run a type's merge before
publishing it a second time in the same session.

**Phase 6 — head protection.** §7: hit direction in the defender setup, the frustum test, the head model,
and the flip-up state for face shields. Polarity as a parameter, validated against the upstream calibration
anchors. The largest engineering item in the plan and the one with an external dependency (the upstream
decompile), so it should start early even if it lands last.

**Phase 7 — hideout S5.** 🟡 Data done, map layout outstanding.

`tools/publishHideout.js` (extraction repo) writes `src/data/hideout-upgrades.ts` and copies the
icons: **70 upgrades over 29 areas, +15 new, −0 gone**, 70/70 upgrade icons and 29/29 area icons,
`npm run validate-data` resolving 261/261 exchange references and reporting no errors.

Three predictions in §8.1 turned out cheaper than written, and the reasons are worth keeping:

- **The id churn was avoidable.** Normalising the key to `` `${areaId}Lv${level}` `` in the
  publisher and aliasing three area ids turns the predicted 28 added / 13 removed into +15 / −0.
  The deciding argument is not tidiness: `StorageService` persists these keys in players'
  `localStorage` and `isValidHideoutUpgradeKey` silently drops unrecognised ones, so a key change
  costs the reader their saved progress.
- **Only 7 areas are new**, not 10 — `CrptoMining`, `WorshopZone` and `GunsmithArea` are the alias
  cases, and they keep the positions they already had.
- **The 3 unresolved exchange ids were one item.** `valuable.batteries.carbattery` now resolves to
  `ValuableItem_B_StorageBattery` via `EXCHANGE_ITEM_ALIASES`.

Also folded in: `relatedQuests` are now read from the game (`PreTasks`, 8 rows) with the 4 curated
entries surviving where the game gates nothing; quest names resolve through `tasksData`'s `gameId`,
falling back to the curated prose and then to the raw id — 8 of the 10 ids are S5 quests this wiki
has not published yet, and previously that expression would have thrown; the `Storage` category is
gone (its areas promoted to the top level) and `HQPAD` is new, with the old
`'Lounge' || 'Storage'` special case replaced by a generated `categoriesWithoutArea`.

**What is left is the map layout, and it is bigger than "10 new pins".** The background plate is
`Image_bg_SquareBackgroundbg6_4` — a *different building layout* from the S3 plate, and **1024×512
rather than square**, so the stage moved from `aspect-square` to `aspect-[2/1]` (a square box with
`object-cover` crops half the floor plan away). Coordinates are percentages of that box, so they
are tied to the aspect ratio as much as to the image: all 32 pins need placing from scratch, not
just the 7 new areas plus `HQPAD`. It is hand work on a picture and cannot be derived — the
DataTable holds no positional data of any kind. A drag-and-drop placer was built for it, which
outputs the `AREA_POSITIONS` block. Until that is pasted in, an unplaced pin falls back to a slot
along the bottom edge with a dashed border rather than to dead centre, where the old fallback
stacked them all on one unclickable pile — that fallback stays as protection for whatever the next
season adds.

**Phase 8 — curation.** §9, in the stated order (price excluded).

**Phase 9 — deferred.** Gunsmith feature (§8.2, its own plan), old-image cleanup (§6.4), price pass
(§3.5).

---

## 12. Steady state, after this migration

Once the pipeline exists, a game update should be:

```bash
# extraction repo
python tools/pakExtract/cli.py <each type>      # regenerate CSVs from the PAK
node extractionCLI.js process-all
node tools/compareWithWiki.js <type>            # review the diff, add id renames
node tools/publishToWiki.js --all --images

# here
npm run validate-data
npm run build && npm run dev                    # spot-check /items, /combat-sim, /hideout-upgrades
```

with curation of new items being the only manual step that scales with the size of the update.

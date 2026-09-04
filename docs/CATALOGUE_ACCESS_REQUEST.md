# Item catalogue access — brief

**Status:** requested, not started
**Written:** 2026-09-04
**Measured against:** `287d889`, the build of 2026-09-04 09:33, game data 1.14.0.2
**Touches:** `src/app/items/`, `src/services/ItemService.ts`, `scripts/validate-data.ts`
**Read first:** [the route's own doc](../src/app/items/AGENTS.md), then
[services](../src/services/AGENTS.md) and [`public/data/AGENTS.md`](../public/data/AGENTS.md)

The question that started this was whether the ballistic and penetration curves should be split out
of the item data, on the grounds that they look heavy. Measured, they are not, and the measurement
found two other things that are. This brief records both, and the numbers that killed the original
idea, so nobody has to rediscover them.

Neither change is large. Both are cheaper than the split that was being considered, and one of them
closes the curve question permanently.

---

## 1. What was measured

Per file, and the share of raw bytes sitting in curve-shaped fields — `*Curve`, `ballisticCurves`,
`damageAtRange`, `protectiveData`, `coneRegions`:

| File | raw | gzip | curve-shaped |
|---|---:|---:|---:|
| `gunsmith-parts.json` | 1,243 KB | 81 KB | 0.8 KB (0%) |
| `weapons.json` | 644 KB | 55 KB | 2 KB (0%) |
| `ammunition.json` | 325 KB | 25 KB | 73 KB (22%) |
| `armor.json` | 188 KB | 11 KB | 72 KB (39%) |
| `helmets.json` | 182 KB | 13 KB | 61 KB (34%) |
| `face-shields.json` | 43 KB | 4 KB | 14 KB (33%) |

The 15 files `ItemService` reads: **864 items, 1,938 KB raw, 156 KB gzipped, 102 KB brotli.**

Three things fall out of that:

**Curves are not the weight.** They are a third of `armor.json` raw and none of `weapons.json`.
`armor.json` compresses to 11 KB in total, so lifting every curve out of armour saves something like
4 KB over the wire. Curve arrays are repetitive numbers, which is exactly what a compressor eats.

**Raw byte counts overstate the cost by an order of magnitude.** This data compresses 12–15×. Any
argument about payload made from `ls -l` is wrong by construction; measure compressed.

**The bulk is the relationships, not the physics.** `weapons.json` is `parts` (149 KB),
`recoilParameters` (57 KB) and `buyOffers` (32 KB). `gunsmith-parts.json` is `images` (142 KB),
`buyOffers` (135 KB) and `compatibility` (135 KB). Those are the joins — the part a slimmer record
cannot drop, because dropping them is what would force a second fetch.

---

## 2. What is actually wrong

### 2a. One item page downloads all 864 items

`src/app/items/[id]/page.tsx:1` is `'use client'`. It calls `getItemById`, which calls
`fetchItemsData`, which reads all fifteen files and runs `transformItemData` over every row. Viewing
one gun costs the entire database. `useTradeIndex` and `HeadCoveragePanel` sit on the same call.

It also never prerenders. The build has 252 prerendered routes — `/items`, `/gunsmith`, `/tasks` and
227 task pages — and `/items/[id]` appears in neither `routes` nor `dynamicRoutes` in
`.next/prerender-manifest.json`. There is no `generateStaticParams` on the route. That contradicts
the root `AGENTS.md`: *data pages are statically generated; keep them that way.*

The transfer is not the interesting half. 156 KB gzipped is one mid-size image. The cost is
`JSON.parse` over 1.9 MB and a per-row transform over 864 records, on a Quest browser, to render a
page about one item.

### 2b. `/items` prerenders a spinner

88 KB of HTML carrying 675 characters of visible text, all of it chrome:

```
"Item Database | ExfilZone Assistant … Skip to content … Loading  Retrieving the item database…"
```

Not one item name reaches the HTML. This is the same finding as
[EXTRACTION_CHANGE_REQUEST.md](EXTRACTION_CHANGE_REQUEST.md) §3, which is still live —
`/tasks/ark_36.html` is 109 KB and 1,686 characters, and the only real text in it is the title tag.
Same cause, different route. Fixing it here does not fix it there.

---

## 3. The changes

Each one owns a path. They are independent and can land separately.

### 3a. Publish one catalogue index — fixes the list path

A generated file holding one thin row per item: id, name, category, subcategory, icon, rarity,
weight, basePrice. Measured on the current data:

| | raw | gzip | brotli |
|---|---:|---:|---:|
| whole catalogue | 1,938 KB | 156 KB | 102 KB |
| index | 171 KB | 21 KB | 18 KB |

14% of the bytes, 9% of the parse. That serves the `/items` list, its filters and search, `ItemChip`
wherever it is drawn, task requirement rows, hideout costs, and the magazine and holster
cross-references — every case that wants an id, a name and a picture.

Constraints on it:

- **Generated, never hand-written.** From the same fifteen files, by `validate-data` or a sibling
  script, so it cannot drift from what it summarises. `validate-data` should fail on a stale index,
  the way it already fails on a dangling cross-reference.
- **Committed**, so the build has no ordering problem and the diff on a patch day still shows what
  changed.
- **Read through `loadDataFile` like everything else.** Never imported — same trap, and the header
  comment in `src/services/dataFiles.ts` explains it.
- **The field list above is a proposal, not a finding.** Confirm it against what `ItemsPageContent`,
  `parseFilters` and `ItemChip` actually read before fixing the shape. A field missed here becomes a
  second fetch, which is the whole thing this is trying to avoid.

### 3b. Prerender `/items/[id]` — fixes the detail path

`generateStaticParams` over the item ids, exactly as `src/app/tasks/[id]/page.tsx:62` already does
for 227 tasks. The server reads from disk at build time; the client downloads nothing. Keep
`'use client'` only on the parts that need interaction, not on the page.

Once this lands, curves cost nothing on the detail path and nothing on the list path, and §1 is
closed rather than merely answered.

Two things to watch: 864 pages is roughly four times the task build, so measure what it does to
build time before committing to it; and the barter reverse index in `useTradeIndex` genuinely needs
a pass over the whole catalogue, so decide whether it moves to build time with the page or stays a
client fetch behind an interaction.

### Order

**3b first.** It is the larger win, it is independent, and it changes what 3a is worth — with the
detail page prerendered, the index only has to serve the list. Re-measure between the two (§4).

---

## 4. Check this is still worth doing

Everything above is a measurement of one commit on one day. Data lands from the extraction on every
game patch, and the parallel work on data access may have moved the ground. Run this before
starting, and again between 3b and 3a. It takes under a minute.

```bash
node -e "
const fs=require('fs'),zlib=require('zlib');
const F=['weapons','ammunition','magazines','attachments','grenades','armor','helmets','face-shields',
         'backpacks','holsters','medical','provisions','task-items','keys','misc'].map(n=>n+'.json');
let all=[],raw=0,gz=0,curve=0;
const isCurve=k=>/[Cc]urve|AtRange|protectiveData|coneRegions/.test(k);
const walk=o=>{if(o&&typeof o==='object')for(const k of Object.keys(o))
  isCurve(k)?curve+=JSON.stringify(o[k]).length:walk(o[k]);};
for(const f of F){const b=fs.readFileSync('public/data/'+f);raw+=b.length;
  gz+=zlib.gzipSync(b,{level:9}).length;const d=JSON.parse(b);walk(d);all=all.concat(d);}
const idx=JSON.stringify(all.map(i=>({id:i.id,name:i.name,category:i.category,
  subcategory:i.subcategory,icon:i.images&&i.images.icon,rarity:i.stats&&i.stats.rarity,
  weight:i.stats&&i.stats.weight,basePrice:i.stats&&i.stats.basePrice})));
const igz=zlib.gzipSync(Buffer.from(idx),{level:9}).length;
console.log('items      '+all.length);
console.log('catalogue  '+(raw/1024|0)+' KB raw, '+(gz/1024|0)+' KB gz');
console.log('index      '+(idx.length/1024|0)+' KB raw, '+((igz/1024*10|0)/10)+' KB gz  ('
  +Math.round(igz/gz*100)+'% of catalogue)');
console.log('curves     '+Math.round(curve/raw*100)+'% of raw bytes');
"
```

Then build, and check the render mode has not already been fixed by the parallel work:

```bash
npm run build
node -e "const p=require('./.next/prerender-manifest.json');
  console.log('items/[id] prerendered:', !!p.dynamicRoutes['/items/[id]'] ||
    Object.keys(p.routes).some(r => r.startsWith('/items/')))"
grep -rn "fetchItemsData\|getItemById" "src/app/items/[id]/"
```

**The baseline to compare against**, from 2026-09-04:

| | then |
|---|---|
| items | 864 |
| catalogue | 1,938 KB raw, 156 KB gz |
| index | 171 KB raw, 21 KB gz — 14% of the catalogue |
| curves | ~11% of raw bytes, ~0% of `weapons.json` |
| `/items/[id]` | client-rendered, absent from the prerender manifest |

**Abandon or reopen on any of these:**

- **`/items/[id]` already prerenders** — 3b is done. Run the measurement again and decide 3a on the
  number it gives, not on the table above.
- **The index exceeds ~40% of the compressed catalogue** — either the data grew a field the index
  now has to carry, or the field list crept. A split that saves less than half is not worth a second
  request and a staleness check; drop 3a and keep 3b.
- **Curves exceed ~15% of the compressed catalogue** — the original hypothesis has become true and
  the split is back on the table. It was worth about 4 KB when this was written.
- **The whole catalogue is within ~20 KB gzipped of the index** — the data has become small enough
  that neither change pays. Close this brief.
- **`ItemService` no longer loads all fifteen files** — the parallel data-access work has already
  solved 2a by another route. Read that first; this brief is then describing a problem that is gone.

One caution about drift: the comment in `useTradeIndex.ts` says the catalogue is 852 items, and it
is 864. That is what happens to a number written into prose. Do not copy the counts above into any
`AGENTS.md` — they belong here, with a date on them.

---

## 5. Do not do these

All four were considered and rejected on the numbers in §1.

**Do not move `public/data/` to external storage.** 3.6 MB of text that changes on a game patch is
what a repo is for. Vercel already serves it from the CDN, compressed and cached. Moving it to a
bucket costs the `validate-data` commit gate, the git diff that is currently how a patch day gets
reviewed, and static prerender — which would then need network access at build — while adding a
cache invalidation story that does not exist today. Reconsider only if the data starts changing
independently of deploys, or grows into tens of MB with real churn. Note that the images are already
the larger asset by far; the JSON is not the weight here.

**Do not split per item.** 864 files, or 668 for gunsmith parts alone, means 864 requests, throws
away the cross-record redundancy that produces the 12–15× compression, and turns the cross-reference
checks in `validate-data` into a directory crawl.

**Do not normalise `buyOffers`, `compatibility` or `parts` into join tables.** They are the bulk
precisely because they are the joins. The client-side join code costs more than the bytes save, and
`transformItemData` copies by name, so every table would need a line there too.

**Do not strip the curves.** 4 KB gzipped, against a schema change, an extraction change, a second
fetch on the simulator path and a new `validate-data` rule. `BallisticCurveChart` and the simulator
read the same curves on purpose — see [the route's doc](../src/app/items/AGENTS.md) — and that
shared read is worth more than the 4 KB.

---

## Done when

- §4 has been run and its numbers recorded, either confirming this brief or replacing it
- `/items/[id]` appears in the prerender manifest, and its HTML carries the item's name and stats
  rather than a spinner
- No route downloads the whole catalogue to render one item — check the network panel, not the
  imports
- If 3a landed: the index is generated by a script, `validate-data` fails when it is stale, and
  nothing reads it by `import`
- `npx eslint src/app/items` is clean and `npm run validate-data` passes
- `src/app/items/AGENTS.md` says how the route gets its data now, updated in the same change
- This file's header is marked fulfilled with the date, the way
  [EXTRACTION_CHANGE_REQUEST.md](EXTRACTION_CHANGE_REQUEST.md) is

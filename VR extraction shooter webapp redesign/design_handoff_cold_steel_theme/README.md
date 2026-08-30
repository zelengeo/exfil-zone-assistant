# Handoff: "Cold Steel" theme + responsive shell + Gunsmith (ExfilZone Assistant)

## Overview

A full visual-language rework of the ExfilZone Assistant community wiki (Next.js 14 / App Router / Tailwind / shadcn), plus the information architecture for the not-yet-built **Gunsmith** module.

Three things change:

1. **Palette and type.** The khaki/olive "military" theme is replaced by *Cold Steel* — gunmetal surfaces, hard 90° corners, stencil condensed headings, and a single ember-orange accent reserved for the one action on screen.
2. **Navigation.** The current header becomes one destination list rendered two ways: horizontal tabs in the top chrome at ≥900px, a five-item bottom bar below it. Traffic is ~51% mobile / ~39% desktop, so neither is the "secondary" case.
3. **Layout rule.** Every module screen is the same three regions — **scope** (filters), **sequence** (the list), **subject** (the one thing being worked on). Desktop shows all three side by side; phone shows one at a time and pushes *subject* to its own route.

Recommended build order: tokens + shell first (every existing page inherits the skin), then Gunsmith directly in the new theme, then Tasks, then Damage, then Items/Hideout.

## About the Design Files

`Visual Rework.dc.html` in this bundle is a **design reference created in HTML** — a prototype showing intended look, layout, and behavior. It is not production code to copy. It is a single canvas holding all mockups side by side; it uses inline styles throughout and no Tailwind.

The task is to **recreate these designs inside the existing ExfilZone Assistant codebase**, using its established patterns: Tailwind utility classes driven by `tailwind.config.js` / `globals.css` tokens, shadcn/ui primitives, Next.js App Router route groups, and the existing `Layout` / `Header` / `Footer` composition. Do not port the inline styles.

Open the file in a browser and pan/zoom; it is organized newest-first:

- **Turn 02 (top)** — the accepted direction. Four desktop screens at 1440×900: `D1` Base/home, `D2` Tasks, `D3` Gunsmith, `D4` Damage. Plus a breakpoint diagram strip.
- **Turn 01 (below)** — the mobile end of the same system. Option `1a` (Cold Steel, **the approved palette**) at 390×800: `A1` shell, `A2` task line, `A3` damage, `A4` gunsmith. Option `1b` ("Blacksite", cyan) is a **rejected** alternative — ignore its colors and type; some of its layout ideas are noted below where they were liked.

## Fidelity

**High-fidelity.** Colors, type, spacing, and copy are final-intent. Recreate pixel-close using Tailwind tokens. Two deliberate exceptions:

- Weapon and part artwork is drawn as grey blocks in the schematic — real part icons/images from the existing item database replace them.
- Trader avatar squares show two-letter monograms; use the real `merchantIcon` / `icon` webp assets from `src/data/tasks.ts`.

## Design Tokens

### Color

Replace the khaki ramp in `tailwind.config.js` and the CSS variables in `src/app/globals.css`. Suggested names keep the existing `military-*` call sites working if you alias them, but a clean rename is preferable.

| Token | Hex | Use |
|---|---|---|
| `steel-950` | `#0A0E12` | App background, deepest surface |
| `steel-900` | `#0C1116` | Subject/detail pane background |
| `steel-880` | `#0D1318` | Top chrome, bottom nav |
| `steel-850` | `#0E141A` | Schematic / chart plot area |
| `steel-800` | `#11171D` | Resting card, list row |
| `steel-750` | `#141B22` | Raised card, input field |
| `steel-700` | `#161E26` | Hover / selected row |
| `steel-650` | `#1A222A` | Active nav item, selected filter |
| `steel-600` | `#1C242C` | Chip, avatar tile |
| `steel-550` | `#1E2830` | Part icon tile |
| `steel-500` | `#26313C` | Schematic part fill (secondary) |
| `steel-450` | `#2C3844` | Schematic part fill (primary) |
| `line-900` | `#1B242C` | Pane divider, hairline |
| `line-800` | `#212A32` | Card border (resting) |
| `line-700` | `#262F38` | Card border (raised) |
| `line-600` | `#2A343D` | Input border, chip border |
| `line-500` | `#33414D` | Secondary button border |
| `line-400` | `#37434F` | Emphasis border (selected card) |
| `line-300` | `#3E4C59` | Schematic outline |
| `line-200` | `#46525E` | Dashed empty-slot border |
| `track` | `#28323B` | Progress-bar track |
| `text-hi` | `#F6FAFC` | Display numerals, hero headings |
| `text-100` | `#ECF2F7` | Headings |
| `text-200` | `#DCE6ED` | Sub-headings, list titles |
| `text-300` | `#C6D3DC` | Body |
| `text-400` | `#A9BAC6` | Secondary body |
| `text-500` | `#8DA0AE` | Muted body |
| `text-600` | `#7E909F` | Labels, eyebrows |
| `text-700` | `#5C6E7C` | Disabled, placeholder |
| `text-800` | `#4C5A66` | Unchecked control border |
| `accent` | `#FF4A24` | **The one action.** Primary button, active nav, selected marker, "editing" state |
| `accent-tint` | `rgba(255,74,36,.06–.10)` | Active-tab wash, editing-slot fill |
| `accent-ink` | `#0A0E12` | Text on `accent` |
| `accent-soft` | `#FFB9A8` / `#FFD9CE` | Text inside accent-bordered chips |
| `accent-edge` | `#3A2A22` / `#3A2A24` | Border/fill for accent-adjacent panels |
| `info` | `#5B8CA8` | Neutral data, icons, secondary progress |
| `warn` | `#FFB020` | Currency (₡), partial progress, "ready to build" |
| `good` | `#4ADE80` | Completed, improved stat, favorable verdict |
| `bad` | `#FF3D3D` → use `accent` | Worsened stat, unfavorable verdict |

Rules:
- **One accent per screen.** If two things are orange, one of them is wrong.
- Currency is always `warn`. Stat deltas are `good` (better) / `accent` (worse) / `text-700` (unchanged, rendered as `—`).
- Max two background values per region.

### Typography

```
Saira Condensed  500,600,700,800   headings, numerals-as-display, buttons, list titles
IBM Plex Sans    400,500,600       body, descriptions, objectives
IBM Plex Mono    400,500,600,700   all numbers, labels, eyebrows, badges, prices
```

Load via `next/font/google`. Scale as used:

| Role | Family | Size / weight | Tracking | Case |
|---|---|---|---|---|
| Page hero | Saira Cond | 38–46px / 800 | `.98–1.0` lh | UPPER |
| Screen title | Saira Cond | 26–34px / 800 | `1` lh | UPPER |
| Card title | Saira Cond | 19–24px / 700 | `1–1.05` lh | UPPER |
| List row title | Saira Cond | 17–21px / 600 | `1.05` lh | UPPER |
| Nav tab | Saira Cond | 16px / 600 | `.06em` | UPPER |
| Button | Saira Cond | 15–17px / 700 | `.06em` | UPPER |
| Body | Plex Sans | 14–15px / 400 | `1.5–1.6` lh | sentence |
| Small body | Plex Sans | 12–13px / 400 | `1.45–1.55` lh | sentence |
| Row label | Plex Sans | 13–14px / 600 | — | sentence |
| Eyebrow | Plex Mono | 10px / 400 | `.22–.24em` | UPPER |
| Micro label | Plex Mono | 9px / 400 | `.16–.20em` | UPPER |
| Data / price | Plex Mono | 11–13px / 400–700 | `.06–.14em` | — |
| Stat value | Plex Mono | 19–26px / 700 | — | — |
| Verdict numeral | Saira Cond | 78–104px / 800 | `.80–.82` lh | — |

Mobile floors: body ≥13px, tap targets ≥44px (bottom-nav items are 68px tall on 1a, 66px on the desktop-derived variant — keep ≥64px).

### Geometry, spacing, effects

- **Radius: 0 everywhere.** No rounded corners, no pills. The only non-rectangular shape is a clipped shoulder on hero panels: `clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)` (14px on mobile).
- Spacing scale: `2 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 26 · 28 · 30 · 34px`. Prefer flex/grid `gap` over margins.
- Borders are always 1px except: selected/active left or top edge = 2–3px in `accent`, `good`, or `warn`; empty slot = 1px dashed `line-200`; editing slot = 2px dashed `accent`.
- Progress bars: 2px (dense), 3px (rail), 4px (card), 5–6px (hero). Track `track`, fill `accent` / `info` / `warn` / `good` by meaning.
- Elevation: no shadows inside the app. Panels separate by 1px hairline + background step. (Shadows in the reference file are only the canvas presenting the device frames.)
- Texture: `repeating-linear-gradient(135deg, rgba(255,255,255,.012–.014) 0 1px, transparent 1px 7–8px)` as a non-interactive overlay on the app background. Schematic and chart plots get a 22–28px grid: `linear-gradient(#151D24 1px, transparent 1px), linear-gradient(90deg, #151D24 1px, transparent 1px)` at 60–70% opacity.
- Icons: 1.5–1.8px stroke, no fill, currentColor-driven. lucide-react (already a dependency) at 14/15/16/18/20/22px.
- Currency renders as `₡ 24,000` (mono, `warn`). Large counts use thousands separators. Percentages are mono.

## Responsive rules

| Breakpoint | Layout | Nav |
|---|---|---|
| ≥1200px | Three panes: scope / sequence / subject, all visible. Nothing opens as a modal. | Top tabs |
| 900–1199px | Two panes: sequence + subject. Scope collapses to a chip row above the list. | Top tabs |
| <900px | Stacked, one region at a time. Subject becomes its own route. | Bottom bar (5 items) + compact top bar |

Pane widths at 1440: Tasks `236 / 1fr / 452`; Gunsmith `214 / 1fr / 396`; Damage `320 / 1fr / 400`. Top chrome is 62px, bordered `line-900`, background `steel-880`. Bottom nav is 66–68px, `steel-880`, top border `line-900`; active item gets a 2px `accent` bar flush to its top edge plus `accent` icon and label.

Bottom-nav destinations (mobile): Base · Tasks · Build · Items · Sim. Top tabs (desktop) carry the full set: Base · Tasks · Gunsmith · Items · Damage · Hideout, each with an optional mono count badge (`accent` for actionable, `warn` for ready-to-build, `text-600` for neutral).

## Screens / Views

### D1 — Base (home), desktop 1440×900

**Purpose:** answer "what do I do next" in one glance.

**Layout:** top chrome (62px) → content grid `1fr / 380px`, padding `26px 28px`, gap `24px`.

Left column (gap 22px):
1. **Continue panel.** Background `linear-gradient(110deg,#1A242E,#121A21 60%)`, border `line-400`, 3px `accent` left edge, clipped shoulder, padding `24px 26px`, flex row gap 34px. Eyebrow `CONTINUE` (mono 10px `.24em` accent) · 1px divider · `ARK · TOMMY · SUBURB`. Title Saira 46/800 UPPER. Description Plex Sans 15px `text-500`. Progress 5px + "2 of 3 left". Right side: 186px stacked buttons — primary `Open task` (accent fill, `accent-ink` text), secondary `Mark objective` (1px `line-400`).
2. **Module cards**, 3-up, gap 14px, min-height 150px, padding 18px, `steel-750` / `line-700`. Icon 22px top, then title (Saira 22/700 UPPER) + count (mono 24/700) on a baseline row, then a 13px `text-600` sub-line. The Gunsmith card uses border `accent-edge`, an `accent` icon, and a `NEW` flag flush to the top-right corner (mono 9px `.1em`, `accent` fill, `accent-ink` text, padding `3px 7px`).
3. **Hideout strip.** Eyebrow row with `VIEW ALL` link (`info`). 3-column grid, 6 cards, gap 12px. Ready cards get a 2px `warn` top border and a `READY` mono line; in-progress cards get a 3px progress bar. Below it, a materials-to-farm summary bar: label block · 1px vertical divider · wrapping chips (1px `line-600`, mono 11px) · `SHOPPING LIST` link (`info`).

Right rail (380px, gap 20px):
1. **Trader progress**, 5 rows. Each: 30px monogram tile (`steel-600`, `line-500`), name (13/600) + `18/42` mono count on a space-between row, 3px `info` progress. Use the five real corps from `src/data/tasks.ts`: ARK (Tommy), N.T.G (Maggie), TRUPIK'S (Johnny), REGIMENT (Igor), BOULDER FORGE (Maximilian).
2. **Wiki activity**, 7 rows separated by 1px `line-900` top borders, each `12px 2px` padding: mono relative time (34px column, `text-700`) + 13px `text-400` line with entity names in `text-100`. Followed by two equal secondary buttons: `Suggest a fix` · `Changelog`.

### D2 — Tasks, desktop 1440×900

**Purpose:** fix "it reads like a table, not a sequence" and cut the information overload.

**Scope rail (236px, padding `22px 18px`, right border `line-900`):** `TRADER` list (selected row = `steel-650` + 2px `accent` left edge; others plain with a mono count); `MAP` chip wrap (selected = `accent` fill); `SHOW` checkbox group (checked = 15px `accent` square with `accent-ink` tick; unchecked = 1px `line-800` square); spacer; `OVERALL` card at the bottom — mono 26/700 count, `/ 113 done`, 4px `accent` bar.

**Sequence pane (1fr, right border `line-900`):** header row — title `Task line · Suburb` (Saira 28/800 UPPER) and three mono sort links (`SEQUENCE` active in `accent`, then `BY TRADER`, `BY MAP`).

Below it the **task line**: a 2px vertical spine (`#3B4650`) at `left:31px` running from the first node to the bottom, with rows in a 10px-gap column. Each row is `flex; gap:14px`, a 20px node gutter, then the card.

Node states:
- selected/in-progress — 14px `accent` square, `box-shadow: 0 0 0 4px steel-950, 0 0 0 5px #4A2A20`
- upcoming — 9px `steel-950` square, 1px `#47535F` border, 4px `steel-950` halo
- locked — same but 1px dashed `#3B4650`
- completed — 9px `track` square, no border

Card states:
- **selected**: gradient `#18212A → #131A21`, border `line-400`, 2px `accent` left edge, padding `14px 15px`. Eyebrow `SELECTED · IN PROGRESS`, title Saira 24/700, sub-line `ARK · Tommy · 2 of 3 objectives left`, 74px progress + `62%`.
- **upcoming**: `steel-800` / `line-800`, padding `13px 15px`, title Saira 21/600, 12px `text-600` sub-line, mono `0/2`, 16px chevron.
- **locked group** (one row, not N rows): `#0D1216`, 1px dashed `#232C34`, padlock icon, "4 tasks locked behind *Warm Welcome* · *Sightline*", `SHOW` link.
- **completed**: `#0D1216` / `#1B2329`, `opacity:.55`, `good` tick, struck-through Saira 20/600 title, mono reward on the right.

**Subject pane (452px, `steel-900`):** header block (padding `20px 24px 16px`, bottom border `line-900`) — 34px trader monogram + `ARK · TOMMY · LOYALTY 2` mono line, then task name Saira 38/800 UPPER. Body (gap 20px): flavour description 14px `text-500` with `text-wrap: pretty`; `OBJECTIVES` list where done rows are `steel-800` with a `good`-bordered tick box and struck-through `#6F8391` text, the current row is `steel-750` / `line-400` with a 70px progress bar + `5/8` in `warn`, and pending rows are plain; `REWARDS` as a 2×2 grid of micro-label + mono value cards (cash `warn`, XP `text-100`, rep `info`, item `text-100`); `UNLOCKS` chips. Sticky footer: `Mark complete` (accent, flex-1) + `Wiki` (1px `line-500`).

**Mobile (A2):** same spine, 390px wide. Trader filter becomes a horizontal chip row under the title; only the selected task is expanded (objectives inline, rewards as a single mono row); tapping any other row routes to the subject view. A bottom fade (`linear-gradient(180deg, transparent, steel-950)`, 60px) signals more content.

### D3 — Gunsmith, desktop 1440×900 (new module)

**Purpose:** assemble a weapon from parts and see the consequence of each swap immediately.

**Builds rail (214px):** `MY BUILDS` list — selected = `steel-650` + 2px `accent` left edge, showing name (Saira 17/700 UPPER) + `AK-74N · ₡142k` mono sub-line; others `steel-800` / `line-800`; last row is a dashed "＋ New build". Then `PRESETS` (Budget ₡38k / Quiet ₡96k / Meta ₡210k) as label + `warn` price rows. Bottom: a `warn`-top-bordered notice — `2 PARTS LOCKED` + why.

**Bench (1fr):** header — eyebrow `BENCH · 4 OF 6 SLOTS FILLED` (accent), title `AK-74N "Suburb Patrol"` (Saira 34/800 UPPER), and `COMPARE` / `RESET` outline buttons.

**Schematic panel** (330px tall, `steel-850`, `line-800`, 22px padding, 28px grid overlay, corner label `SCHEMATIC · TAP A SLOT`): the weapon is drawn as absolutely-positioned rectangles — receiver, barrel, muzzle, optic, magazine (skewX −8°), grip (skewX 14°), stock. Fitted attachment slots use `accent-edge` fill + 1px `accent` border; the slot being edited is 2px dashed `accent` on `rgba(255,74,36,.07)` with a centred mono label; unfilled slots are 1px dashed `line-200`. Mono 10px `text-500` callouts sit above/below their part. **Replace these rectangles with real part icons** — the geometry is the spec, not the art.

**Slot chips row:** one chip per slot — fitted = `#20282F` + 1px `accent` + `accent-soft` text + `✓`; editing = `rgba(255,74,36,.1)` + dashed `accent` + `— EDITING`; empty = `#151D24` + dashed `line-200` + `text-600`. Chips are the slot navigation; they mirror schematic selection.

**Delta row (2-up):** left, a 150px `RECOIL PATTERN` mini-plot — solid `accent` polyline for the current build over a dashed `info` polyline for stock, with crosshair axes in `#1C242C` and a mono legend. Right, `VS STOCK AK-74N` — four `label / from → to` pairs coloured by direction, plus one plain-language sentence ("Quieter and steadier than stock, slightly slower to raise…").

**Stats bar:** 6-column grid — vertical recoil, horizontal recoil, ergonomics, muzzle velocity, weight, loudness. Each is micro-label, mono 22/700 value + signed delta (`good` / `accent` / `warn` / `text-700` `—`), and a 4px bar tinted to match the delta.

**Parts catalog (396px, `steel-900`):** header — `Rail · 6 parts` (Saira 26/800 UPPER) + `SORT: RECOIL` (`info`), then `OWNED` / `AFFORDABLE` / `ALL` filter chips. Rows are 48px icon tile + name (14/600) + a mono stat line (`−4% recoil` `good`, `+0.2 kg` `accent`, price `text-600`) + a trailing control: `FITTED` (accent fill) on the equipped part, `FIT` (outline) on candidates, a padlock at `opacity:.5` on locked parts with the unlock reason instead of stats. Footer: `FITTING THIS PART` → "Unlocks *Grip* and *Side mount*" + the price in `warn`.

**Mobile (A4):** schematic shrinks to a 96px-tall panel with the same slot chips beneath it (no wrap, horizontal scroll); the parts list becomes the page body; a preset strip (`Budget / Quiet / Meta`) sits under it; live stats + `Save build` pin to the bottom as a 3-stat compact bar. Slot editing is a full-height sheet, not a modal.

Liked from the rejected 1b that is worth keeping here: a 6-axis **stat radar** with a dashed "stock rifle" polygon behind the current build, as an alternative to the 6-column bar row on wide screens.

### D4 — Damage, desktop 1440×900

**Purpose:** casual players get one answer; power users keep everything.

Mode switch lives in the top chrome, right-aligned: a 1px `line-600` box with `SIMPLE` (accent fill) / `ADVANCED` segments. Default is Simple. **Advanced is where today's dense view goes, unchanged in substance.**

**Inputs (320px):** `SETUP` — `WEAPON` and `AMMO` as `steel-750` / `line-400` select rows; `DISTANCE` as a card with a mono value (`45 m`), a range hint (`0 — 300`), and a 4px track with an `accent` fill plus a 3px `accent` thumb tick. Then `TARGET PRESET` — Geared PMC (selected, `C4 · no helm`), Scav (`C2`), Juggernaut (`C6 · helm`), and a dashed "Custom defender… / EDIT" row that opens the full defender builder. Footer note explains what Advanced adds.

**Verdict pane (1fr):** the hero block — gradient `110deg #1A2229 → #101720`, border `line-400`, **3px `good` top border** (colour keyed to the verdict: `good` favourable, `warn` marginal, `accent` unfavourable), padding `26px 28px`. Eyebrow `VERDICT · CENTER MASS · 45 M`; then a 104px Saira numeral `3` beside `shots to kill` (Saira 38/700 UPPER); on the right, past a 1px divider, `TIME TO KILL 0.41 s` and `ARMOUR BREAKS shot 2` as micro-label + mono 22/700 pairs.

Below: `SHOTS BY ZONE` — five 26px horizontal bars (head, chest, stomach, arms, legs) on `steel-750`, fill coloured `good` ≤2 / `warn` 3–5 / `accent` ≥6, with an 80px label column and a right-aligned mono 17/700 count. Then `DAMAGE OVER DISTANCE` — a `steel-850` plot with the 56×32 grid, a solid `accent` polyline for the selected ammo, a dashed `info` polyline for the baseline round, a dashed vertical marker at the chosen distance labelled `45 m`, and a mono legend bottom-right.

**Comparison rail (400px, `steel-900`):** `THIS AMMO VS ARMOUR CLASS` — five rows (C2…C6), each a mono class label, a 6px bar, and a mono 15/700 shot count; the current class row is raised to `steel-700` / `line-400`. Then `BETTER CHOICES YOU OWN` — ammo rows with name + mono price-per-round + shot count, the best option carrying a 2px `good` left edge and worse options at `opacity:.62`. Finally a `PLAIN ANSWER` card: `info` micro-label + one sentence of prose ("BP is fine up to Class 4. Above that, switch to BS or aim for the head.").

**Mobile (A3):** the three pickers stack as full-width rows, the verdict block keeps a 78px numeral, zone bars shrink to 22px, and the armour-class matrix becomes a 5-up row of narrow cards. Everything past the verdict is optional scroll; `Penetration, fragmentation, ballistics` is a single disclosure row.

## Interactions & Behavior

- **Nav.** One `destinations` array feeds both renderers. Active state = `accent` icon + label plus a 2px `accent` bar (bottom edge of the tab on desktop, top edge of the item on mobile). Counts come from the same selectors the pages use.
- **Task line.** Clicking a row selects it: desktop swaps the subject pane in place (no navigation, no modal); mobile routes to `/tasks/[id]`. Checking an objective optimistically updates the row, the card progress, the trader rail, and the `OVERALL` counter. Completing the last objective animates the node to the completed state and reveals any tasks it unlocked in the locked group.
- **Locked tasks** collapse into one summary row per blocking set; `SHOW` expands them in place at `opacity:.55`.
- **Gunsmith.** Tapping a schematic slot or a slot chip filters the parts catalog to that slot and sets the chip to `— EDITING`. `FIT` applies the part: the schematic block, all six stat values, both deltas, the recoil plot, and the build price update in one pass. Parts whose prerequisites are unmet render locked with the reason; fitting a part that unlocks other slots surfaces that in the catalog footer *before* the click. `COMPARE` shows two builds side by side (desktop) or as a swipe pair (mobile). `RESET` returns to stock.
- **Damage.** Every input change recomputes immediately — no submit button. Mode is persisted per user (localStorage), defaulting to Simple for first-time visitors. Switching to Advanced preserves the current setup.
- **Transitions.** 120–160ms ease-out on background/border/opacity; number changes cross-fade rather than count up; the accent bar slides between nav items. No layout-shifting animation.
- **Empty/loading.** Skeletons are `steel-800` blocks with the same geometry as the loaded row — no spinners inside panes. Empty scope results show one line of `text-600` prose plus a `Clear filters` outline button.
- **Focus.** Because radius is 0 and shadows are absent, focus is a 2px `accent` outline offset 2px. Never remove it.

## State Management

Mostly existing state; the new pieces:

- `themeTokens` — none at runtime; tokens are build-time Tailwind config + CSS variables.
- Nav: `activeDestination` derived from the route. No stored state.
- Tasks: `scope { traderId | 'all', mapId | null, show: { available, locked, completed, kappa } }`, `selectedTaskId`, `sortMode: 'sequence' | 'trader' | 'map'`, plus the existing per-objective completion store. `selectedTaskId` must survive scope changes when the task is still visible.
- Gunsmith: `build { weaponId, slots: Record<SlotId, PartId | null>, name }`, `editingSlotId`, `catalogFilter: 'owned' | 'affordable' | 'all'`, `catalogSort`, `compareBuildId | null`, and a derived `stats` + `deltaVsStock` computed from the fitted parts. Saved builds persist locally (and later per account); part availability derives from trader loyalty + task completion already in the store.
- Damage: `mode: 'simple' | 'advanced'` (persisted), `weaponId`, `ammoId`, `distance`, `targetPreset | customDefender`. Derived: `verdict { shots, ttk, armourBreaksAt }`, `zoneShots`, `classMatrix`, `betterOwnedAmmo`.

## Assets

- **Fonts:** Saira Condensed, IBM Plex Sans, IBM Plex Mono (Google Fonts).
- **Icons:** lucide-react, already a dependency. Reference file draws them inline as SVG paths — use the named lucide components.
- **Trader art:** existing `icon` / `merchantIcon` webp files referenced from `src/data/tasks.ts` (`/images/tasks/…`).
- **Part art:** existing item-database images; the schematic rectangles are placeholders.
- **Textures:** pure CSS gradients, listed under Design Tokens. No image assets.
- Two reference images were supplied by the project owner (cover art and a 1280×720 game still) and informed the direction only; they are not app assets.

## Files

- `Visual Rework.dc.html` — all mockups (Turn 02 desktop set + Turn 01 mobile set, options 1a approved / 1b rejected). Anchors: `#2a`, `#1a`, `#1b`.
- `support.js` — runtime for the reference file. Not part of the handoff; do not port.

Codebase touchpoints for step 1 (tokens + shell), from the linked repo:

- `tailwind.config.js` — palette, font families
- `src/app/globals.css` — CSS variables, `military-box` / `military-card` utilities, body texture/grid, link colors
- `src/components/layout/Header.tsx` — becomes the dual-render nav
- `src/components/layout/Layout.tsx` — hosts the bottom bar below 900px
- `src/app/tasks/components/` — `TasksPageContent`, `TaskCard`, `MerchantPanelExpanded`, `MerchantPanelCollapsed` are superseded by the scope/sequence/subject split
- `src/app/combat-sim/components/` — `CombatSimulatorContent`, `AttackerSetup`, `CombatSummary` gain the Simple/Advanced split; existing density moves to Advanced
- `src/data/tasks.ts` — `corps` map is the source of truth for trader names, merchants, and icons

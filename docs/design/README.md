# Cold Steel: developing UI

**Current guidance.** Reviewed against the repository on 2026-09-06. Start here when adding a
component, item presentation, page, or changing an existing layout.

## Before implementing

1. Read the affected route's `AGENTS.md` and [CONTEXT.md](../../CONTEXT.md) for its behaviour and
   names. For a new route, start with [App Router](../../src/app/AGENTS.md).
2. Find the matching component in the reuse table below and read its props and docblock. Extend
   the existing presentation before creating another rendering of the same domain concept.
3. For explanatory copy, read the [disclosure ladder](../../src/components/ui/AGENTS.md). Decide
   what stays visible and what attaches to a label before laying out the panel.
4. Build one component, check its states and phone layout, then continue. Completion checks are
   below; a desktop screenshot alone does not finish a UI change.

## Which source owns what

| Source | Read it for |
|---|---|
| This guide | Cross-route visual rules and the implementation workflow |
| [tailwind.config.js](../../tailwind.config.js) | Palette values, font roles, spacing and breakpoint tokens |
| [globals.css](../../src/app/globals.css) | shadcn semantic variables, shared classes, focus and base styles |
| [layout.tsx](../../src/app/layout.tsx) | Fonts actually loaded by `next/font` |
| [Shared components](../../src/components/AGENTS.md), route `AGENTS.md`, component docblocks | APIs, domain behaviour and deliberate local exceptions |
| [Disclosure ladder](../../src/components/ui/AGENTS.md) | Copy placement, reveal caps and accessible triggers |
| [ADRs](../adr/) | Reasons behind accepted decisions; 0005 covers disclosure, 0006 grades |
| [Brand assets](BRAND_ASSETS.md) | Existing logo and social-card workflow |
| [Archive](#historical-reference) | Original designs and the reasoning behind completed work |

The archive is evidence of earlier intent, not a backlog or an implementation specification.
Use current rules and code together: old classes in an untouched component are compatibility debt,
not a precedent for new work. An active issue may request a change; reconcile its acceptance
criteria with these rules and update the relevant guidance when a design decision changes.

## Visual language

Cold Steel is a dark, angular field instrument: gunmetal surfaces, hairline divisions, condensed
headings and restrained ember emphasis. Exact values live in the token files, not a second hex table.

| Role | Use |
|---|---|
| Surfaces | `steel-*`; separate panels by a background step and a `line-*` border |
| Text | `ink-*`; `font-display` for headings/actions, `font-sans` for prose, `font-mono tabular` for figures |
| Action and selection | `ember`; primary action, current selection and focus, not general decoration |
| Data and status | `info` for neutral data; `warn` for currency/partial/ready; `good` for favourable/completed; `bad` for adverse/destructive |
| Rarity | `RarityBadge` and its `rarity-*` palette; always print the rarity name |
| Grades and protection | Shared grade/class scales; always pair colour with a figure, label or counted segments |

Keep one primary action hierarchy. Shell navigation, the selected subject and its action may all
use ember to express the same current context; do not interpret the old handoff's “one accent” as
literally one orange element. Grade and chart colours have their own documented meaning. A reading
popover uses the quieter surface and semantic colours defined in its docblock.

`accent` is shadcn's **steel hover surface**, not the orange action token. `olive-*`, `tan-*` and
numeric `military-*` remain compatibility aliases for older views; new work uses Cold Steel names.
The `military-box`/`military-stencil` hooks also survive for old call sites, not as new examples.

Use square corners and 1px divisions rather than rounded cards, pills, shadows or hover lift.
`clip-shoulder` is the established hero-panel exception. Reuse `plot-grid` for plots and the shell's
texture; keep decoration out of the way of figures and controls.

The loaded faces are Saira Condensed, IBM Plex Sans and IBM Plex Mono. `eyebrow`, `eyebrow-tight`
and `micro-label` are short uppercase labels, not reading text. Use the disclosure guide's reading
face for prose. Casing belongs in CSS; names keep the glossary's casing in data.

## Layout and input

Use [Layout](../../src/components/layout/Layout.tsx) and its variants for shell, main content,
navigation clearance and footer. [Header](../../src/components/layout/Header.tsx) owns the destination
list. A new page should not invent a second navigation list.

`shell:` is 900px: top navigation above it, fixed bottom navigation below it. Sticky phone actions
must clear `bottom-bottomnav`; check overlays and the last row as well as the initial viewport.
Choose pane breakpoints from the route's content, not the prototype's blanket 1200px rule:

- Tasks use a vendor rail, chain and shared detail pane; phone selection is URL state.
- Hideout uses the floor plate plus a zone list with larger touch targets, and a phone sheet.
- Gunsmith composes the bench and parts picker; its three-column layout starts at `xl` (1280px).
- Combat sim combines the verdict, target and loadouts; its picker is a dialog.

Read those implementations when extending them. Scope/list/detail is a useful starting question,
not a requirement to force every page into three panes or route every mobile detail view separately.

New controls need at least 44×44px targets, visible keyboard focus and a touch/controller path.
Existing dense exceptions are documented locally: the disclosure guide explains the upward-growing
32px dashed trigger; hideout documents why small map pins have an equivalent zone list. Do not copy
a small visual glyph's dimensions as a new control's hit area. Required information must be reachable
without hover, and essential data must remain legible on a dim headset panel.

## Reuse by concept

| Adding or changing | Start with |
|---|---|
| A button, input, dialog, sheet or reveal | [ui/](../../src/components/ui/); adapt the call site, change a primitive only for a shared requirement |
| An item reference in another feature | [ItemChip](../../src/components/items/ItemChip.tsx), [ItemIcon](../../src/components/items/ItemIcon.tsx), [RarityBadge](../../src/components/items/RarityBadge.tsx) |
| Catalogue cards or rows | [ItemCard](../../src/app/items/components/ItemCard.tsx), [ItemRow](../../src/app/items/components/ItemRow.tsx), [cardStats](../../src/app/items/utils/cardStats.tsx) |
| A new item-category stats block | [Items guidance](../../src/app/items/AGENTS.md) and [StatLine](../../src/app/items/[id]/components/StatLine.tsx); narrow `item.category` in the shared detail frame |
| Prices, offers or gates | [trade components](../../src/components/trade/), [formatEZD](../../src/lib/trade.ts); display the gate's reason, not an invented ownership lock |
| A graded figure | [GradeMeter](../../src/components/quality/GradeMeter.tsx), [itemGrades](../../src/lib/quality/itemGrades.ts), [ADR 0006](../adr/0006-one-grade-scale-for-item-quality.md) |
| Body/head protection or class | [protection components](../../src/components/protection/) and their shared [model/scales](../../src/lib/protection/) |
| Weapon builds, part choices or recoil | [gunsmith components](../../src/components/gunsmith/), [GunsmithClient](../../src/app/gunsmith/components/GunsmithClient.tsx) and [build logic](../../src/lib/gunsmith/) |
| Long explanations | [Guide authoring](../../src/content/AGENTS.md); guide bodies are intentionally prose |

For a new game item or category, also read [public/data/AGENTS.md](../../public/data/AGENTS.md)
and the item schemas. Use `ItemService` on the items route and the established data service elsewhere;
do not turn example data from a mockup into a second database. Render loading, unresolved-item and
error states deliberately. Currency uses the existing EZD formatter, not the handoff's `₡` copy.

## Implementation checks

- Compose Tailwind 4 classes with `cn()`; reusable components merge `className` last. Put a shared
  style in the appropriate layer of `globals.css`, not repeated inline at every call site.
- Base CSS centres buttons. Give left-aligned row buttons `justify-start`. Choose mutually exclusive
  display classes rather than emitting both `flex` and `hidden` for the same state.
- Do not assume JS-config colours exist as CSS `--color-*` variables. Reuse a token utility or
  inspect the emitted CSS before referencing a variable in a canvas/SVG/CSS calculation.
- Keep server/client boundaries and the route's hydration behaviour intact. Persisted progress
  must show its pre-hydration state before reading the client's value.
- Check at 390px, across 900px, and at the route's wider pane breakpoint. Confirm long names,
  large figures, missing art, empty/error/loading states and selected/disabled states fit without
  hiding required information. Check tap targets, keyboard operation, Escape/focus return on
  dialogs, and bottom-navigation clearance. Report any device testing you could not perform.
- Run the checks relevant to the change from `package.json`: lint/type-check for components,
  affected tests for behaviour, `validate-data` for item data, and a build for route/static-generation
  changes. Update the owning guidance when the reusable behaviour changes.

## Historical reference

| Archived material | Why keep it / what supersedes it |
|---|---|
| [Original Cold Steel handoff](archive/cold-steel/README.md) and [canvas](<archive/cold-steel/Visual Rework.dc.html>) | Original accepted palette versus rejected Blacksite; this guide and shipped components own current behaviour |
| [Gunsmith canvas](archive/gunsmith/gunsmith-route.html) | Original bench/artboard reference; open this bundled export, since the raw `.dc.html` files reference an unbundled `support.js` |
| [Hideout rewrite](archive/HIDEOUT_REWRITE_REQUEST.md) | Completed rewrite; current rules live beside the route |
| [Combat rebuild](archive/COMBAT_SIM_REBUILD.md) | Historical layout/model decisions, some reversed; the spray formula remains open in the route guidance |
| [Combat readability](archive/COMBAT_SIM_READABILITY_PLAN.md) | Implemented stages and later shared-grade decisions; current code and ADR 0006 govern extensions |
| [Brand concept brief](archive/BRAND_IMAGE_GENERATION.md) | Unselected Extraction Frame proposal; use the shipped assets and renderer instead |
| [Old guide specification](archive/guide-specification.md) | Pre-redesign examples and an unshipped Markdown path; use `src/content/AGENTS.md` |
| [Old simulator specification](archive/combat-simulator-spec.md) | Superseded model/UI proposals; use the route's `AGENTS.md` and calculation comments |

Preserve historical rationale, label its status, and link back to its replacement. Keep live rules
in the owner listed above rather than copying a completed plan into every agent file. Data-access
briefs and backend operations remain in `docs/`; they are separate from visual design.

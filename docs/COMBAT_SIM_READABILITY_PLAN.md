# Combat simulator: reading the body, and one grade scale for the whole wiki — plan

**Status:** in progress, started 2026-09-06. The three decisions at the bottom are settled.
**Route:** `src/app/combat-sim/` — the model is not in question, only what it draws.
**Read first:** [the route's own doc](../src/app/combat-sim/AGENTS.md), then
[components/ui](../src/components/ui/AGENTS.md) for the disclosure ladder and
[`armorClassScale`](../src/lib/protection/armorClassScale.ts) for the "colour is never alone" rule
this plan generalises.

The 2026-09-04 rebuild fixed the arithmetic and the comparison. It did not fix the reading, and it
took one decision that has to be reversed. The shape of the page is right — verdict on top, figure
in the middle, panels either side, viewers reused rather than re-derived. Everything below is
inside that shape.

---

## What is wrong

### 1. The ramp saturates, and the top band is a 90-value sink

`SHOTS_RAMP` has four stops, the last of which is `max: Infinity` painted `#33414D`.
`simulateCombat` walks to a safety limit of 99 and `runScenario` turns that into `Infinity`, so
**every reading from the last boundary to 98, plus "never", is the same grey pixel**. Against
anything above about class 4 most of the body lands in that band, which is exactly when the reader
needs resolution most: twelve rounds into a thigh is a fight, thirty-nine is a decision to
disengage, and the picture calls them the same thing. Re-banding cannot fix this — only the printed
figure can.

### 2. The numeral was deliberately removed from the figure

`TargetView`'s docblock records the decision — "Numerals are deliberately off the figure. Colour is
the whole reading" — and it passes `badge: ''` for every capsule to enforce it. The reasoning was
sound for a four-way overlay and is wrong for a single reading: `BodyViewer` already draws a
per-capsule figure for armour class, and `armorClassScale`'s own docblock states the rule this
route then broke — *the figure is the identity channel and the colour only the fast one, so nothing
may be drawn as colour alone.* Combat-sim is the one surface using the shared scale that prints no
figure.

This is a documented decision being reversed, not an oversight. It gets an amendment to
`AGENTS.md`, not a silent edit.

### 3. Zone selection exists, is undiscoverable, and loses to the camera

`BodyViewer` takes `onSelect` and `TargetView` passes it, so clicking a capsule already works — but
nothing on screen says so. There is no `onHover` (the prop exists and is unused here), no hover
tint, the selected ring is a 1.5px ember outline, and the readout panel's empty state is the only
hint. Two mechanical faults underneath it:

- **Any pointer movement orbits the camera.** `onPointerMove` reassigns `drag.current` to the
  current position on every move, so the click test in `onPointerUp` compares the release against
  the *last move*, not the press. A 200px drag therefore both rotates the model and fires
  `onSelect`. The fix is to keep the press point separate from the last-move point.
- **And the hit test itself was broken, on every route.** *(Found 2026-09-06, after the affordances
  above had already been built.)* `pick` takes `ao` as `A - eye` where its ray-to-segment solve
  wants `eye - A`, which negates the ray parameter `t` — so the `t <= 0` guard, meant to discard
  capsules behind the camera, discarded every capsule in front of it instead. `pick` returned null
  for every point on the canvas. Clicking a capsule had never worked here or in the items route's
  `BodyCoveragePanel`; the claim above that "clicking a capsule already works" was read off the
  wiring without testing it, and was wrong. One inverted vector.
- **The camera is the loud control and changes nothing.** The `front | back | left | right` group
  sits directly beneath a visually identical `Front | Flank | Rear` group. The first is cosmetic;
  the second is the only input on the panel that moves a number. And of its three buttons two agree
  by construction — `facingCoverage` takes the absolute dot product, which `target-model.ts:165`
  says outright.

### 4. "Is this any good" is said three different ways, and not at all in the wiki

| Surface | How it grades | Rendering |
|---|---|---|
| Gunsmith | `bandFor` — quartile against same-class presets | 4-segment bar + tier label (`StatReadout`) |
| Combat sim | `shotsColor` — authored thresholds | a swatch, and a legend under the figure |
| Items detail | nothing | bare figures in `StatLine` |

The two that exist already share three of their four colours by coincidence — `BAND_COLORS` and
`SHOTS_RAMP` agree on good, warn and info in opposite order, and disagree on the worst rung, which is
ember on the bench and inert slate on the body. (An earlier draft of this plan said all four matched.
They do not, and the fourth is the one that needed a decision. It got one: the shared scale takes the
ember, and the simulator keeps the slate, because ember is `BodyViewer`'s selection colour and a body
filled with it cannot show what is selected.) Nothing is shared in code, and a reader who learns the
gunsmith's four-pip bar learns nothing that helps them on an ammunition page.

---

## A. One grade scale, shared

The piece that outlives this route. Extract what gunsmith already proved, give it a second and
third consumer, and write it down.

**`src/lib/quality/grade.ts`** — new, and the only place the four tiers exist:

- `GRADE_TIERS` / `GRADE_COLORS` / `PERCENTILE_LABELS`, seeded from the current `BAND_COLORS` values
  so nothing on screen changes hue.
- `gradeFromPercentile(p)` — the quartile rule `bandFor` applies today.
- `gradeFromStops(value, stops)` — the rule `shotsColor` applies today, with an optional per-rung
  colour override so the simulator can keep its slate worst rung.
- Both return one `Grade { tier, index, label, color }`.

**`src/components/quality/GradeMeter.tsx`** — new domain folder, the way `protection/` and
`gunsmith/` are domain folders. It is the 4-segment bar plus tier label lifted verbatim out of
`StatReadout`, so the gunsmith's appearance is unchanged and the code has one home. It carries no
figure of its own — the caller prints that, and the binding rule is that a caller must.

**Then three consumers:**

1. `src/lib/gunsmith/bands.ts` keeps the part that is genuinely gunsmith's — building the
   per-weapon-class distributions and choosing the peer set — and imports the tiers. `StatReadout`
   renders `GradeMeter`. No visual change; this stage is a refactor that must be invisible.
2. Combat sim: `SHOTS_RAMP` becomes a `gradeFromThresholds` scale. `shotsColor` stays as the
   route's thin wrapper so the twelve call sites do not churn.
3. Items detail (`src/app/items/[id]/components/`): `StatLine` gains an optional `grade`, and
   ammunition, armour, helmets and attachments start grading their figures against their own peer
   set — damage and penetration against the same calibre, armour class and durability against the
   same slot. This is the "reuse across the wiki" half of the request and is deliberately staged
   last, because it is the only part that needs new peer-set logic per item kind rather than moved
   code.

**Naming.** `Band` is already this word in gunsmith, but `ZoneOverlay.bands` in `BodyViewer` means
the head's horizontal colour slabs — an outright collision, which is what `CONTEXT.md` exists to
catch. Recommendation: keep the established word for the quality tier, rename the overlay field
`bands` → `slabs` (one component, two call sites), and add **Grade / Band** to `CONTEXT.md` under a
new Quality section with `rating`, `tier`, `score` and `quality` listed as words to avoid.

## B. Make the figure readable

1. **Print the shots on the capsule.** Stop passing `badge: ''`; pass `formatShots(shotsToKill)`.
   `BodyViewer` already collects labels and draws them after every capsule is down, precisely so a
   near limb cannot overdraw a far one. The head keeps its slabs and takes the *worst* reading as
   its numeral, with the split staying where it already is — the readings list beneath.
2. **Separate "eventually" from "never."** `∞` currently shares the dark tone with the whole top rung. It
   gets its own treatment — hollow fill, outline only — so a round that cannot do the job is a
   different picture rather than a darker one. This costs nothing in the ramp's four tiers.
3. **Legend follows.** The existing key stays (rule 7: a legend that decodes a colour ramp is never
   hidden) and gains the ∞ mark. It becomes a `GradeMeter` legend, so it is the same object the
   gunsmith and the item pages use.

## C. Selection over camera

1. **Fix the press/drag test in `BodyViewer`** — a `press` ref set on pointer-down and never
   reassigned, separate from the `last` ref the orbit deltas read. This is a bug in a shared
   component; the items route benefits too.
2. **Hover.** Pass `onHover`, tint the hovered capsule, and let the readout panel preview the
   hovered zone while keeping the selected one on pointer-leave. Hover is a mouse affordance only —
   the headset and the phone need the next two points, not this one.
3. **A zone strip under the figure.** Seven group buttons in body order (`ZONE_GROUPS`, the
   vocabulary the rail and Compare already use), each a 44px target carrying its own shots figure,
   each selecting that group's worst zone. This is the non-canvas path to selection: it works with
   a thumb, with a controller, and with a keyboard, and it is what makes "select a body part" a
   real feature rather than a canvas trick.
4. **Retire the camera preset row.** Bind the camera to `facing` instead — Front shows the front,
   Flank shows the side, Rear shows the back — so the one control that moves a number also moves
   the picture, and the redundant twin disappears. Drag-to-orbit stays for anyone who wants it, and
   now returns to the preset when facing changes (that reset already landed in the working tree).
5. **Say that Front and Rear agree.** They do, by construction, and a reader clicking between two
   buttons that produce identical numbers currently has no way to learn that it is the model rather
   than a bug. One line on the control, tier 1 — it changes how the reader acts.

## D. The documents

- `src/app/combat-sim/AGENTS.md`: rewrite the paragraph asserting numerals-off-the-figure, and add
  the camera/facing consolidation to the list of things the second pass got wrong.
- `docs/adr/0006-one-grade-scale-for-item-quality.md`: why four tiers, why the peer set is the
  ranking rather than an absolute, why colour never travels alone, and why gunsmith's version was
  the one promoted.
- `CONTEXT.md`: the Quality section and the `bands`/`slabs` split.
- `docs/COMBAT_SIM_REBUILD.md`: note that stage 5's "numerals are off the figure" was reversed, and
  why. The record of why it was ever done that way is worth keeping.

---

## Staging

| # | Work | Touches | Done |
|---|---|---|---|
| 1 | `BodyViewer` press/drag fix, hover tint and cursor | `src/components/protection/` | ✓ |
| 2 | Numerals on all thirteen capsules, hollow `∞`, legend | `TargetView`, `BodyViewer` | ✓ |
| 6 | `pick` sign fix; ramp re-banded to tap / burst / spray / mag dump | `BodyViewer`, `scenario.ts`, `LoadoutRail` | ✓ |
| 3 | `ZoneStrip`; camera bound to facing; preset row out | `TargetView` | ✓ |
| 4 | `lib/quality` + `GradeMeter`; gunsmith and combat-sim moved onto it | `lib/`, `components/quality/`, both routes | ✓ |
| 5 | Ammunition and armour pages graded; `CONTEXT.md`, ADR 0006, AGENTS amendments | `src/app/items/[id]/`, docs | ✓ |

Stages 1–3 answer the complaint. Stage 4 is a refactor that must be invisible on screen. Stage 5 is
where the unification is actually paid off, and it is the largest.

`npm test` after stage 1 and 4; `npm run lint` throughout. Nothing here touches
`damage-calculations.ts`, `target-model.ts` or `spray.ts`, so the pinned model tests should not
move — if they do, something in the plan was wrong.

---

## Decisions, settled 2026-09-06

1. **Thirteen numerals, and no fallback to seven.** A calf and a thigh do not take the same number
   of rounds — they carry different HP pools and different `BodyPartDamageScalar` values — so one
   figure over a merged "leg" would be an invented number wearing the authority of a measured one.
   Every capsule prints its own reading or none. If it reads as cluttered the answer is a size
   floor and better label placement, never a merge.
2. **Four grades.** The numeral carries the resolution; a fifth colour would only narrow the sink
   rather than close it, and it would cost the one meter the whole wiki shares.
3. **`Rear` stays.** It turns the model round, a reader expects it, and it needs no work beyond the
   tier-1 line saying it computes what `Front` computes.

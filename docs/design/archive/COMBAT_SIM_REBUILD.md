# Combat simulator rebuild — plan

**Status:** built 2026-09-04. Stages 0-8 are in; the spray formula is the one thing still open.
**Archive:** the original rebuild record. Use the [current design guide](../README.md) and route
guidance for implementation and the outstanding spray-model question. The historical criteria
below do not override subsequent changes.
**Superseded in part:** two of this plan's calls were reversed on 2026-09-06 — see
[COMBAT_SIM_READABILITY_PLAN.md](COMBAT_SIM_READABILITY_PLAN.md). Numerals are back on the body
figure (colour alone could not separate eight rounds from ninety-eight), and the camera preset row
is gone (it was a cosmetic twin of the facing control, which is the one that moves a number). The
reasoning for the original design is kept below; current behaviour lives in the route's guidance.
**Design:** https://claude.ai/code/artifact/3f1f4bf8-dbc4-45ca-ad98-9bb40db46c41
**Route:** `src/app/combat-sim/` — ~2,700 lines across 13 files
**Read first:** [the route's own doc](../../../src/app/combat-sim/AGENTS.md), then
[`src/lib/protection/`](../../../src/lib/protection) — the rebuild is mostly a matter of deleting the
route's private geometry and reading the shared one instead.

Three things changed underneath this route, and the UI never caught up.

1. **The body has real geometry now.** `src/lib/protection/` carries the game's own thirteen
   collision capsules, the bone → part → HP mapping and `Is Protected` itself. The simulator still
   works off `utils/body-zones.ts`, a hand-authored set of *abstract* zones with `displayPosition`
   percentages — invented before the extraction existed, and not the bones a bullet actually hits.
2. **A gun is a build, not an item.** The attacker still picks a `Weapon` off the shelf. Firing
   power and fire rate now come from an assembled receiver-plus-parts, which is what the gunsmith
   already computes.
3. **The head is not one zone.** `headCoverage` splits a head into what the helmet shell stops,
   what the shield stops and what neither reaches. A helmet's cone regions are the *holes* in its
   shell; a shield's regions *are* its shell; the two never stack. So a head has one, two or three
   distinct shots-to-kill values — never one, and never six.

And one thing was wrong from the start: the page stamped a shots-to-kill numeral on every zone and
put comparison in a hover popover. A casual reader had to click each gun in turn and remember the
numbers.

---

## What the design settles

The artboard is the specification for the UI; this section only records the decisions a reader of
the code would otherwise have to reverse-engineer.

- **Three views**, not one screen with modes: `Read` (one loadout against the target), `Compare`
  (every loadout side by side), `Numbers` (the tables). The old `ttk | stk | ctk` display toggle is
  gone — it only existed because the figure was stamped on the body, and a panel fits all three.
- **Colour is the shots-to-kill ramp**, using the app's own semantic tokens so the scale reads
  without a legend: `good` 1–2, `warn` 3–4, `info` 5–7, `line-500` 8+. Colour is never spent on
  loadout identity — that is what killed the ramp in the current four-overlaid design.
  *(2026-09-06: the ramp stands and is now one of three consumers of the shared grade scale, but
  "without a legend" did not survive contact — the last rung spans eight rounds to ninety-eight, so
  every capsule prints its figure. See ADR 0006.)*
- **The verdict bar is a three-tier ladder**, replacing a census of body parts:

  | Tier | What it is | Computed as |
  |---|---|---|
  | Best case | the head, almost always | fewest shots across every zone and head reading |
  | Aimed | the recommendation, in the big numeral | fewest shots across the **non-head** zones |
  | Spraying | what actually happens | the spray estimate, below |

- **The head viewer is reused, not redrawn.** `HeadViewer` + `HeadCoverageMap` mount as they are
  with a damage overlay, exactly the way the body tab mounts `BodyViewer`. Nothing about head
  geometry is re-derived in this route.
- **The loadout picker is its own view**, and links out to `/gunsmith` rather than growing a bench.

---

## Stages

Each stage compiles and the route works at the end of it.

### 0. The target model — done

New `utils/target-model.ts`. Turns the shipped body model plus a defender into the thing the engine
walks:

- one `TargetZone` per collision capsule, carrying the capsule index (`BodyViewer`'s overlay key),
  the resolved part, its HP, its damage scalar, whether it is vital, the measured covered fraction
  and the `ProtectionZone` that does the covering — all of it out of `bodyCoverage`, none of it
  authored here;
- the head's `HeadReading[]`, derived from `headCoverage` by collapsing the six head zones onto the
  one, two or three distinct armour classes that actually apply.

`simulateCombat` in `damage-calculations.ts` loses its `zoneId: keyof typeof ARMOR_ZONES` and
`bodyPart: BodyPart` arguments and takes the four numbers it was reaching through them for
(`scalar`, `destroyedScalar`, `partHp`, `vital`). Nothing else in that file moves — the shot model
is correct and its comments cite the decompiles. `calculateShotDamage` is untouched, so
`damage-calculations.test.ts` and the debug page's `combat-test-helper.ts` keep working unchanged.

`utils/body-zones.ts` and `utils/combat-calculations.ts` are deleted at the end of stage 2.

### 1. Loadouts — done

New `utils/loadout.ts` and `hooks/useLoadouts.ts`. A `Loadout` is a receiver, a fitted map, the
assembled result and a round — `assembleBuild` from `src/lib/gunsmith/build.ts` does the work, and
`getGunsmithData()` supplies presets and the part index. Only `sim.firingPower` and `sim.fireRate`
reach the damage model; `sim.MOA` and `sim.recoilParameters` reach the spray estimate and nothing
else.

URL params grow a preset/build pair per slot — `p0=weapon-ak74n-factory`, or `b0=<encoded>&n0=name`
reusing the gunsmith's own `encodeBuild` — with the old `a0w`/`a0a` still resolving, because four
guides link here.

### 2. The engine — done

New `utils/scenario.ts`, replacing `combat-calculations.ts`. For one loadout against one defender at
one range it returns a per-zone outcome (shots, time, cost, the per-shot ladder, the armour class
that applied) plus the three verdict tiers. Head readings run through the same path as capsules.

### 3. The spray estimate — done, formula still open

New `utils/spray.ts`. The design sketches it as `cone → p(zone)`, `E[dmg] = Σ p(zone)·dmg(zone)`,
`rounds ≈ pool ÷ E[dmg]`. It is implemented one step more exactly than that: rather than an
expectation over a hit distribution, the gun's **own recoil pattern** is walked shot by shot —
`simulateRecoil` gives the crosshair at each shot, `spreadRadiusPerMetre` gives the cone around it,
and each landing point is tested against the capsules in the target plane. Damage, durability and
the HP pools then resolve exactly as they do for an aimed shot.

Same shape, same inputs, no new extraction: it is the expectation resolved by simulation instead of
by arithmetic, and it still prints `p(zone)` as a by-product. Averaged over a fixed set of seeds so
the figure is stable, and labelled an estimate everywhere, because unlike everything else on the
page it models the *player* rather than the game.

**Open:** the formula was explicitly deferred by the brief's author. What ships here is a first cut
with its assumptions written down beside it — no compensation for recoil, the aim point held at the
centre of the upper chest, standing frontal target.

### 4. The shell and the Read view — done

`CombatSimClient.tsx` (view switch, range, share), `VerdictBar.tsx`, `BodyRead.tsx`,
`LoadoutRail.tsx` (the rows and their seven-slot pip strips), `ZoneReadout.tsx` (the fixed panel
that replaces the popover, carrying the shot ladder).

### 5. The Compare view — done

`CompareView.tsx` — the same body, the same ramp, once per loadout, over an exact grid with Face and
Shell as separate columns.

### 6. The Numbers view — done

`NumbersView.tsx` — per-zone table, loadout × range table, and the spray estimate written out.

### 7. The head view and the loadout picker — done

`HeadRead.tsx` mounts the shared head viewers with a damage overlay and prints the distinct
readings. `LoadoutPicker.tsx` is the separate view: presets and saved builds in one list, parts
read-only, deltas, and the link to the bench.

### 8. Cleanup — done

Delete `components/BodyModel/`, `AttackerSetup`, `AttackerSummaryCard`, `DefenderSetup`,
`CombatSummary`, `CombatSimulatorContent`, `hooks/useCombatSimulation.ts`, `utils/body-zones.ts`,
`utils/combat-calculations.ts`. Rewrite `src/app/combat-sim/AGENTS.md`. `npm run lint`, `npm test`,
`npm run build`.

The debug page, `combat-test-helper.ts` and `damage-calculations.ts` survive the rebuild untouched
except for the one signature change in stage 0.

---

## What the build actually did, where it differs from the plan

- **The link keeps four slots.** The design sketched `?p=` and `?b=` for a single loadout. The route
  compares up to four, so the parameters stayed slot-numbered: `a0w` (preset), `a0b` (encoded
  build), `a0n` (name), `a0a` (round). `a0w` and `a0a` are the *existing* names and a preset is a
  weapon, so every link the guides carry resolves with no mapping layer at all.
- **`Shot from` is real geometry.** The design carried a Front/Flank/Rear control and the plan
  proposed dropping the engagement angle entirely. Neither was right: `facingCoverage` in
  `target-model.ts` samples the capsule, keeps the half facing the shooter and runs `Is Protected`
  on those points. Front and rear agree because the wedge is two-sided; the flank is the question.
- **`BodyViewer` gained one optional prop.** `ZoneOverlay.bands` draws horizontal slabs down a
  capsule, because the head carries two or three armour classes on one bone and a flat tint would
  have to pick one of them. Additive, and the items route is untouched.
- **The spray estimate is simulated, not averaged.** Same inputs, same shape, one step more exact:
  the recoil pattern is walked shot by shot rather than collapsed into an expectation. `p(zone)`
  still falls out and is still printed. The formula remains open — `spray.test.ts` pins its
  properties rather than a number.
- **Limb damage numbers moved.** Dropping the hand-authored zone table for `BodyPartDamageScalar`
  changes a thigh from ×1.0 to ×0.7 and a calf from ×1.0 to ×0.5. The extraction is authoritative;
  the old table was inferred.

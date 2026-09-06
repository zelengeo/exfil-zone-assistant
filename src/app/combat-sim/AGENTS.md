# Combat Simulator

Given a build, a round, a range and what the defender is wearing: where to shoot them, how many
rounds it takes, and what happens if you just hold the trigger instead.

## The layers

| File | Answers |
|---|---|
| `utils/damage-calculations.ts` | what one shot does |
| `utils/target-model.ts` | what the target is made of, and what covers each part |
| `utils/scenario.ts` | what a magazine of them does, per zone, plus the verdict |
| `utils/spray.ts` | what happens when nobody aims |
| `utils/loadout.ts` | what the attacker brings |

`calculateShotDamage` is the bottom of the stack and the only place the game's own arithmetic is
reproduced. `simulateCombat` walks shots until the target dies; `runScenario` runs that across
every zone and produces everything the page draws.

## The shot model, and what it has been wrong about

Read the comments in `damage-calculations.ts` before changing any of it — they cite the decompiled
functions each rule came from. The parts that have cost time:

- **Firing power is `0.9 + 0.2 * fp`, applied once on a bare hit and twice on a covered one.**
  `GetDamagePostGearProtection` applies it before offering the hit to any gear, and
  `ProcessDamageReceived` applies it again to its own damage scale — so armour that covers a hit
  costs it `fp` a second time, and the plate's durability loss carries only the first. That
  asymmetry is why the old fitted single curve could never match both armoured and unarmoured
  observations at once: its divisor sat between `0.9 + 0.2·fp` and its square. Confirmed by the
  2026-09-05 capture (extraction repo, `docs/DAMAGE_MODEL.md` §7.1) — do not "simplify" it back to
  one multiplication.
- **A part's `firingPowerModifier` is worth `1/0.2` to the sim.** `GetAttachmentModifiers` divides
  it before the consumer multiplies by 0.2, so `src/lib/gunsmith/assembly.ts` divides too. Adding it
  at face value under-counts every attachment fivefold, and does it invisibly, because the display
  scale is a separate line that was always right.
- **Firing power never touches penetration.** `ProcessDamageReceived` does not apply it there.
- **The penetration scalar is read on `armourClass - penetration`, clamped at -2**, not at 0.
  Clamping at 0 truncated the whole region where good ammo beats good armour and under-read every
  over-penetrating shot.
- **Nine rounds publish `bluntDamageScale: 0` and the game does not have that zero.** The profile
  omits the float because it equals the class default, and the extraction writes a zero for the
  value it is missing. Substituted in one place, `utils/props.ts`, which every reader goes through —
  the picker used to print "0% if stopped" over a sim quietly using a different number. 0.2 is
  measured against a thirteen-shot ApexMC run; the 12GA constant is not.
- **Ballistic curves are keyed in centimetres**, and past point blank they supply the damage
  outright rather than scaling the round's own figure — so `damage` and `pellets` stop mattering
  beyond range 0. Every published round carries curves, so the no-curve fallback is unreachable in
  practice.

`utils/damage-calculations.test.ts` pins all four. Run `npm test` after touching this file.

## The target

There is no zone table any more. `target-model.ts` reads the shipped collision model out of
`src/lib/protection/`: thirteen capsules, the bone → part → HP mapping from `GetBodyPartDetail`, and
`Is Protected` run over each capsule's surface to measure what a vest actually reaches.

Two things that changed when `body-zones.ts` went, both of which move published numbers:

- **One damage multiplier per bone.** The old table carried a `damageModifier` and a
  `destroyedDamageModifier` and agreed with the extraction on neither — a thigh was rated 1.0 where
  `BodyPartDamageScalar` says 0.7. There is one scalar, keyed on the bone, and no destroyed-limb
  variant anywhere in the decompile.
- **The shot's direction is geometry.** `isZoneCoveredAtAngle` compared a wedge against an azimuth
  and ignored where the bone was. `facingCoverage` samples the capsule, keeps the half facing the
  shooter and runs the real test on those points. The wedge is two-sided, so `Front` and `Rear`
  agree and only `Flank` differs — that is the model, not a shortcut.

**The head is never one reading and never six.** A helmet has one class for its whole shell and its
cone regions are the *holes* in it; a face shield is the inverse, its regions *are* its shell; the
two never stack. So `headReadings` collapses the six named head zones onto however many distinct
armour classes actually apply — three with a visor, two without, one on a uniform helmet — and the
UI carries that split at every size: slabbed head capsule on the body figure, a half-split first pip
in the rail strip, Face and Shell as separate columns in Compare. The head capsule's single printed
figure is its **worst** reading — the honest one-number answer to "if I shoot them in the head" —
and the split itself is the readings list under the picture.

## The verdict, and why there are three tiers

`Verdict` is the whole page in three numbers, and the reason the old top row was replaced:

- **Best case** — fewest rounds anywhere, which is a head reading on essentially every setup.
- **Aimed** — fewest rounds *off the head*. The big numeral, because it is the shot a player can
  take repeatably.
- **Spraying** — the estimate below.

All three move with the setup. The old row listed body parts that barely differ between loadouts
and left the reader to work out which of them mattered.

## The spray estimate

`spray.ts` is the one figure on this page that models the **player** rather than the game, and it is
labelled an estimate everywhere it appears. It walks the gun's own recoil pattern
(`simulateRecoil`), samples the spread cone around each shot, tests where the round lands against
the capsules seen from the front, and resolves damage with the same `calculateShotDamage` — one
shared durability track per piece of gear, because a vest worn down by chest hits is the same vest
when a round strays onto a shoulder.

It is why spread and the two recoil axes reach anything at all: of the six figures the gunsmith
computes, only firing power and fire rate touch the damage model, and before this the bench was
disconnected from the outcome.

The formula is deliberately still open. `spray.test.ts` pins its *properties* — deterministic, the
distribution sums to one, scatter grows with range — rather than a golden number, because pinning
the number would be pinning the current guess.

## How the page is read, and what was cut

The route was rebuilt once for the numbers and once more for the reading of them. The second pass
undid four things that had each looked reasonable on their own:

- **Standing prose.** Every panel ended in a paragraph explaining how to read it. All of it true,
  all of it charging the same rent on the hundredth visit as on the first, and on a phone beside a
  headset it cost more rows than the figures it explained. `PanelNote` keeps the words and gives up
  the space: an `i` beside the panel heading. Nothing a reader needs *without* asking may live in a
  note — that belongs in the panel, as a figure or a label.
- **The picker as a view swap.** `LoadoutPicker` replaced the whole page, so it read as a route the
  reader had navigated to, with a `Close` word in the corner as the only way back. It is a dialog:
  scrim, Escape, a 44px close and a footer action. The way *in* is a labelled button on the selected
  rail row, not the word "change".
- **Ammunition as a margin note.** The round moves the answer more than anything else on the page —
  it sets both terms of the penetration test and the damage the shot arrives with, where the gun
  contributes two of six bench figures. It had a grey line of small caps. It now gets a column of
  the picker, a line of every rail row, and the verdict bar's header.
- **Armour as a list of names.** Three `Select` dropdowns of bare names asked the reader to know
  thirty-seven vests by name, and omitted the one fact that decides every number. `ArmorPicker`
  orders by class, heaviest first, with the picture and the durability pool on every row.

`ClassLadder` is the piece that ties the last two together. Penetration and armour class are the
same axis — `GetIsPenetrated` reads its curve on `armourClass − penetration` — so both are drawn on
one six-rung ladder in the shared class colours, and "is this round enough for that plate" becomes a
glance rather than arithmetic. `armorClassScale` records that the palette is categorical and does not
clear colourblind separation between non-adjacent rungs, so nothing is colour alone: the rungs are a
count and the figure prints beside them.

Durability is drawn on the same ladder as a second, hollow reading, because durability scales the
class itself rather than merely running out. `effectiveArmorClass` exists for that display and
returns **0 at zero durability** — broken armour is bypassed outright by `GetIsPenetrated`, and the
curve read at x = 1 returns about a third of a class, which would promise protection the shot path
never applies.

`components/ui/slider.tsx` is hand-rolled rather than shadcn, and is the one non-shadcn file in that
directory. `input[type=range]` insets its track by half a thumb at each end, which left visible
stretches of the range and durability tracks that the handle could not reach.

## The third pass: reading the body

Two of the second pass's calls were wrong, and were reversed on 2026-09-06. The plan and the
reasoning are in [docs/COMBAT_SIM_READABILITY_PLAN.md](../../../docs/COMBAT_SIM_READABILITY_PLAN.md);
[ADR 0006](../../../docs/adr/0006-one-grade-scale-for-item-quality.md) is the decision that came out
of it.

- **Numerals are back on the figure, all thirteen of them.** "Colour is the whole reading" was right
  for a four-way overlay and wrong the moment the picture showed one loadout. The ramp's worst rung
  covers everything from ten rounds to the ninety-nine-shot safety limit, so it could not tell a
  fight from a decision to disengage — and printing no figure broke the rule `armorClassScale`
  binds every other surface to. **Never a merged figure:** a calf and a thigh carry different HP
  pools and different scalars, so one "leg" number would be invented rather than measured. Clutter
  is handled in `BodyViewer` — a projected-radius floor and a greedy vertical de-collision pass —
  not by combining zones. `∞` is drawn hollow, because "never" is a different fact from "eventually".
- **The camera preset row is gone.** A cosmetic `front | back | left | right` group sat directly
  under a visually identical `Front | Flank | Rear` group, and only the second moves a number. The
  camera follows the facing now; dragging still orbits, and picking a facing returns to the preset.
  That Front and Rear agree is a `PanelNote` on the control rather than something a reader has to
  infer from two buttons producing identical figures.

`ZoneStrip` under the picture is the third piece: every zone as a 44px button carrying its own
figure. The canvas answers a mouse; a thumb, a controller and a keyboard cannot aim at a six-pixel
forearm capsule. `BodyViewer` now paints its own hover tint and cursor whenever `onSelect` is set,
and its click test measures from the press rather than the last pointer move, so a long drag no
longer both spins the model and selects whatever it finished over.

**`BodyViewer.pick` never worked, on any route.** Its ray-to-segment solve took `ao` as `A - eye`
where every line below it wants `eye - A`, which negates the ray parameter `t` — so the `t <= 0`
guard, there to discard capsules behind the camera, discarded every capsule in front of it instead.
`pick` returned null for every point on the canvas. Nothing was clickable and nothing said so, which
is why the ladder of increasingly visible affordances above was built before anyone noticed the hit
test was the problem. The items route's `BodyCoveragePanel` passes `onSelect` too and was equally
inert. One inverted vector; both formulas below it come out right once it is the correct way round.

## The ramp's rungs are actions, not verdicts

`SHOTS_RAMP` names its rungs **tap, burst, spray, mag dump** at 1, 2–3, 4–9 and 10+. The earlier
"drops them / workable / slow / don't" told the reader what to conclude; these tell them what they
will be doing with the trigger, which is the thing a player can feel in the headset. Every band
label and the rail's pip heights are derived from the stops — `shotsRangeLabel` and
`shotsGrade().index` — rather than re-thresholded beside them, because the duplicated `<= 2 / <= 4 /
<= 7` copies are exactly what survives a re-banding and then quietly disagrees with the colour.

## The shot ladder

`ZoneReadout`'s ladder prints **every** shot, not the first few with a count of the rest: nine is the
preview and a button opens the whole run. Two damage columns, because they answer different
questions — HP is progress toward the kill, Plate is progress toward the plate no longer helping,
and a round being stopped is still winning if the second column is large.

Everything else about a shot is one tap away on the row rather than four more columns: what was left
standing, the class the plate was rating when the round met it, and how close the penetration roll
was. Three things there are easy to misread and are labelled to prevent it:

- **`remainingHp` is the whole body's pool, not the bone's.** A limb kill drains all 440 HP, which
  is the entire reason a forearm costs nineteen rounds where the chest costs two. Invisible unless
  the popover says "of 440", so it does.
- **`effectiveArmorClass` is per shot, and it falls.** Durability scales the class itself rather
  than merely running out, so a class 6 plate at 12% durability rates 2.76, and 2.31 one round
  later. That is why the penetration figure moves down the ladder, and it is unreadable from the
  "class 6" on the panel header alone.
- **`isPenetrating` is not a roll.** `simulateCombat` passes `applyRandom: false`, so the ladder
  takes `penetrationChance > 0.5` — the likelier half of every roll. In game each shot is rolled, so
  a plate at 50% is drawn stopping the round when half the time it would not. The panel note says so.

`effectiveArmorClass` rides on `ShotResult` rather than being re-derived for the display. The
exported helper of the same name would give the same answer, but only if the caller reconstructs the
pre-shot durability, uses the *zone's* class rather than the item's headline, and reads the curve off
the right piece — three chances to drift from the model, for a number `calculateShotDamage` already
holds. It is `0` where no armour covered the hit, which is an absence and not a plate rating zero.

`DAMAGE_GUIDE_HREF` points at `/guides/damage-model`, **which does not exist yet**. The link is a
deliberate placeholder for [issue #9](https://github.com/zelengeo/exfil-zone-assistant/issues/9): the
full chain behind one armoured hit is far more than a popover can hold, and this panel already
refuses to print a shortened version of it — see the "where it is exact" block, which drops to prose
the moment armour is involved. If that issue is closed `wontfix`, remove the link rather than leave
it pointing at a 404.

## Naming the aimed zone

"Left upper arm" is an arbitrary pick. `DETAIL_SCALAR` rates both upper limbs at 0.7 and both lower
limbs at 0.5, so on a bare target four capsules return the same figure and the reader is told to aim
at one of them for no reason.

`aimedZoneLabel` folds only the zones that **actually return the same figure** into one name —
`LIMB_TIERS` offers "upper limbs" and "lower limbs", `ZONE_GROUP_PLURALS` offers the single-group
names, and a lone winner keeps its own label. The set is measured against the outcome every time,
never asserted, so a vest reaching a shoulder and not a thigh breaks the tie and the verdict goes
back to naming one zone. Same rule as the body figure's thirteen numerals: a shared name is honest
only where the readings behind it agree.

## Fire mode

`Loadout.fireMode` is resolved once at construction by `resolveFireMode`, and it has to be, because
the two places it can live are not both reachable later. 38 of the 63 lower receivers author it; for
the rest — the AK-74N's among them — the only copy is on the **preset weapon**, which a `Loadout`
keeps only as an id. 33 of the 149 presets carry none either, and those resolve to null rather than
to a guess.

`sprayCadence` turns it into the words under the spray verdict. The estimate holds the trigger at
the gun's own fire rate whatever the receiver is, so the figure is meaningful on a bolt-action —
but labelling one "full auto" was simply false, which is what it used to do for every gun in the
game.

## The grade meter

`SHOTS_RAMP` is one of three consumers of the app's shared four-rung grade scale
(`src/lib/quality/grade.ts`), alongside the gunsmith's bands and the item detail pages. The meter
under the aimed verdict and under the zone readout's shots figure is the same component the bench
draws under every weapon stat — that shared vocabulary is the whole point, and
[ADR 0006](../../../docs/adr/0006-one-grade-scale-for-item-quality.md) is why.

The one deviation: this route's worst rung keeps the inert slate rather than the scale's ember,
because ember is `BodyViewer`'s selection colour and a body filled with it cannot then show what is
selected. `scenario.ts` carries that reason at the ramp.

## Loadouts

A gun is a build, not an item. `loadout.ts` turns a shipped preset, a saved build or a shared link
into one shape via `src/lib/gunsmith`; the simulator never assembles or edits a build itself, and
`LoadoutPicker` links out to the bench rather than growing its own.

URL parameters keep the old names on purpose — `a0w` was a weapon id and a preset *is* a weapon, so
every link the guides already carry resolves unchanged. `a0b` and `a0n` are the two new ones and
reuse `encodeBuild`, so one link opens the same gun in either route.

## State

`useCombatSim` owns everything. The engine is pure and synchronous, so it runs in a `useMemo` — the
old hook debounced its arithmetic by 100 ms and then wrote the result into state, which was a second
render for a number already known during the first. The URL seed is applied during render rather
than in an effect, for the same reason.

## The debug page

`/combat-sim/debug` runs scenarios against expected values, using `utils/combat-test-helper.ts` and
`utils/test-types.ts`. `combat-test-helper` is imported for its side effects, by both the debug page
and `CombatSimClient` — it is live tooling, not a test harness, and removing it breaks that page.
Fixtures live in `public/data/combat-sim-test-data.json`.
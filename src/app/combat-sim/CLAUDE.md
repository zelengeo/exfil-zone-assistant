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

- **Firing power is `0.9 + 0.2 * fp`, applied once.** It replaced a fitted curve that scaled armoured
  shots twice, which is why no single factor could ever fit both armoured and unarmoured
  observations.
- **Firing power never touches penetration.** `ProcessDamageReceived` does not apply it there.
- **The penetration scalar is read on `armourClass - penetration`, clamped at -2**, not at 0.
  Clamping at 0 truncated the whole region where good ammo beats good armour and under-read every
  over-penetrating shot.
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
UI carries that split at every size: banded head capsule on the body figure, a half-split first pip
in the rail strip, Face and Shell as separate columns in Compare.

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

# Combat Simulator

Given a weapon, a round, a range and what the defender is wearing: how much damage lands, and how
many shots it takes.

## The three layers

| File | Answers |
|---|---|
| `utils/damage-calculations.ts` | what one shot does |
| `utils/combat-calculations.ts` | what a magazine of them does, per zone |
| `utils/body-zones.ts` | what the body is made of, and what covers each part |

`calculateShotDamage` is the bottom of the stack and the only place the game's own arithmetic is
reproduced. `simulateCombat` walks shots until the target dies; `calculateCombatResults` runs that
across every zone and produces the table the page draws.

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

## Body zones

`BODY_PARTS` carries each part's HP, and `BODY_HP` is derived by summing them rather than written
down, so a part's HP cannot drift from the total. `ARMOR_ZONES` maps armour coverage onto those
parts; `isZoneCoveredAtAngle` decides whether a zone is actually covered from the shot's azimuth,
which is what makes side and rear shots differ from frontal ones.

`getZoneArmorClass` resolves what protects a zone for a given defender — head gear protects through
cone regions rather than per-bone data, so it is not simply a lookup.

## State

`useCombatSimulation` runs the model; `useCombatSimParams` keeps the setup in the URL, so a scenario
is shareable. Neither owns game data — the setups take items from `ItemService`.

## The debug page

`/combat-sim/debug` runs scenarios against expected values, using `utils/combat-test-helper.ts` and
`utils/test-types.ts`. `combat-test-helper` is imported for its side effects, by both the debug page
and `CombatSimulatorContent` — it is live tooling, not a test harness, and removing it breaks that
page. Fixtures live in `public/data/combat-sim-test-data.json`.

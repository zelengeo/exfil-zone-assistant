# 6. One grade scale for item quality

Date: 2026-09-06

## Status

Accepted

## Context

Three surfaces answered "is this figure any good", and no two of them answered it the same way.

The **gunsmith** ranked each weapon stat against the shipped presets of the same weapon class,
divided the result into quartiles, and drew four segments lit up to the quartile with the rung's
name beneath. Nothing about it was invented: the peer set is the game's own class tag, and each
peer's figure is the one the game bakes for it.

The **combat simulator** ranked shots-to-kill against four authored thresholds and drew a single
colour swatch, decoded by a legend under the body figure. Three of its four colours happened to
match the gunsmith's; the fourth did not, and neither file knew the other existed.

The **item detail pages** did not answer it at all. They printed bare figures — 46 damage, 5.5
penetration, 195 durability — every one true, and none of them a reading, because the number only
means something to a reader who already holds the catalogue in their head. That is the reader the
wiki exists to serve *instead of*.

So a player who learned the four-pip bar on the bench learned nothing that helped them on an
ammunition page, and the simulator's colour ramp was a third vocabulary on top.

There was a second, sharper problem underneath. The simulator's ramp ran out of resolution: its
worst rung covers every reading from ten rounds to the ninety-nine-shot safety limit, plus "never".
Twelve rounds into a thigh is a fight and thirty-nine is a decision to disengage, and the picture
called them the same thing — while printing no figure at all, which broke the rule
`armorClassScale` already binds every other surface to. No re-banding closes that gap; only the
figure does.

## Decision

**One scale, four grades, one meter.**

`src/lib/quality/grade.ts` owns the four tiers, their palette and the two ways a value earns one:
`gradeFromPercentile` for a ranking against a peer set, `gradeFromStops` for an authored threshold
scale. `src/components/quality/GradeMeter.tsx` is the only rendering. The gunsmith, the combat
simulator and the item detail pages all consume both.

**Four rungs, because quartiles are what the peer sets support.** More would imply a precision that
sets of six to forty items do not have, and would cost the single rendering every surface shares.

**The peer set is the ranking.** A round is ranked against its own calibre and never against all
ammunition; armour is ranked within its own shelf. A 9x19 that outranked a .338 LM would be
answering a question nobody asks. Where a peer set has fewer than six members the figure is not
graded at all, and says how many peers there were — the same threshold, for the same reason, that
`bandFor` has always applied.

**Colour never travels alone.** The palette is categorical and does not clear colourblind
separation between non-adjacent rungs, so the count of lit segments is the identity channel and the
hue only the fast one. `GradeMeter` is never rendered without its figure beside it, and a figure
that cannot be ranked shows an unsegmented track rather than four unlit segments — "zero of four"
would read as the worst rung, which is the opposite of "not ranked".

**One palette exception, declared.** The combat simulator paints these tones onto body capsules, and
ember is `BodyViewer`'s selection colour: a body filled with the selection colour cannot then show
which capsule is selected. Its worst rung stays the inert slate, which is also the better semantics
— a zone that will not die is a dead end, not an alert. The tiers and the meter are shared; that one
hue is not, and `scenario.ts` carries the reason.

## Consequences

`lib/gunsmith/bands.ts` keeps only what is genuinely the gunsmith's — building the per-class
distributions and choosing the peer set — and a `Band` is now a `Grade` plus its evidence. The
gunsmith's appearance is unchanged; this was a move, not a redesign.

Ammunition pages grade damage, penetration and muzzle velocity against their calibre. Armour pages
grade class and durability against their shelf. Three calibres ship too few rounds to rank (.338 LM
and 6.8x51 carry four each, 12.7x55 three) and say so rather than pretending.

The combat simulator now prints a figure on every one of the thirteen capsules — reversing the
rebuild's "numerals are deliberately off the figure", which was right for a four-way overlay and
wrong for a single reading. **Thirteen figures and never a merged one:** a calf and a thigh carry
different HP pools and different `BodyPartDamageScalar` values, so a single "leg" number would be
invented rather than measured. A round that cannot finish the job is drawn hollow, because "never"
is a different fact from "eventually" and no ramp can say both.

The simulator's rungs were renamed in the same pass: **tap, burst, spray, mag dump**, at 1, 2–3,
4–9 and 10+. A rung called "workable" tells the reader what to conclude; one called "burst" tells
them what they will be doing with the trigger, which is the thing a player can feel. Every band
label and the rail's pip heights now derive from the stops rather than restating them, because a
duplicated threshold is what survives a re-banding and then disagrees with the colour beside it.

The word **band** now belongs to the grade. `ZoneOverlay.bands` — the head capsule's horizontal
colour slabs — became `slabs`, because two different things drawn as runs of coloured rectangles
must not share a name. `CONTEXT.md` records both.

The cost is a new coupling: three routes now break together if the tier vocabulary changes. That is
the point of the decision, and it is why the tiers live in `lib/` rather than in whichever component
needed them first.

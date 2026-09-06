# 5. Explanatory text is disclosed, not parked on the page

Date: 2026-09-06

## Status

Accepted. Amends rule 4 of the Cold Steel popover rules in `src/components/ui/popover.tsx`.

## Context

Panels across the tool routes closed with a footnote. `ZoneTable`, `NumbersView` (twice),
`LoadoutRail`, `HeadZoneTable` and `ArmorSpecificStats` each ended in a paragraph explaining how
their figures were derived, what each column meant, and what the model did not cover.

The text was good. Where it sat was not:

- It was permanent. A player needs "cover is measured by running the game's own Is Protected test"
  once. After that it is furniture, and this app is read one-handed on a phone beside a headset or
  in the headset's own browser, where furniture is expensive.
- It was set in `micro-label` — 9px uppercase mono with `tracking-micro`, a face built for a
  four-word column header. Four sentences in it is unreadable at VR viewing distance, which
  contradicts the root rule that type errs a step bigger than a desktop app would.
- It was detached from its subject. A footnote defining `Class`, `Wedge` and `Cover` sat below the
  table, so the reader had to carry three definitions back up to the header row.

The result was a screen that read as overwhelming to a new player and as noise to an experienced
one — the two audiences the app has.

Popover rule 4 said "structure, not prose … if it needs paragraphs it is a panel on the page." That
rule was written for the trade components, whose popovers are small ledgers, and taken literally it
required exactly the footnotes we wanted to remove.

## Decision

Explanatory text is sorted by what it does and placed on a five-tier ladder — rename, on the page,
`Tooltip`, `InfoPopover`, guide — with a size cap at each tier. The ladder, the tests for choosing a
tier, the trigger vocabulary and the copy shape live in
[`src/components/ui/AGENTS.md`](../../src/components/ui/AGENTS.md).

Two consequences worth recording here:

**Popover rule 4 now admits two genres.** A *ledger* is `PopoverHeading` + `PopoverRow`, unchanged. A
*note* is `PopoverHeading` + `PopoverProse` — at most three sentences in a reading face. Past that
cap it is a guide section and the popover links to it.

**`Tooltip` is not the answer for anything a player needs.** A tooltip opens on hover and focus.
There is no hover in a headset and none under a thumb. So a tooltip is reserved for a gloss nobody
loses anything by missing; everything else is an `InfoPopover`, which already opens on tap and on
Enter as well as on hover.

## Consequences

Fewer words on screen by default, and one more interaction to reach them. That is the trade, and it
is the right one here only because the hidden text is overwhelmingly re-read rather than first-read:
a returning player already knows what `Cover` means.

The first question the ladder asks is whether the text should exist at all, and it earns its keep
immediately. Of the four sentences in `ZoneTable`'s footnote, three became notes and the fourth was
deleted — "only the bodies this piece reaches are listed" was restating the `Unprotected:` line
directly beneath it.

The dashed-label trigger takes a 32px hit area rather than the 44px the VR rules ask for, growing
upward from under the label. A 44px box centred on an 11px header label reaches into the first data
row and swallows taps meant for that row. This is a deliberate, documented exception with one call
site pattern behind it, not a slackening of the touch rule.

Where a shared component is the thing being explained, the disclosure becomes a prop on it rather
than a paragraph at each call site — `BallisticCurveChart` takes `info`, and its three callers in
`ArmorSpecificStats` dropped their trailing paragraphs. That keeps the placement, the cap and the
trigger one decision made once.

Conversion is per panel and not yet done. `ZoneTable` and `BallisticCurveChart` are the references;
`NumbersView`, `LoadoutRail` and `HeadZoneTable` still carry their footnotes.

Guides under `src/content/guides/` and the legal pages are exempt. Prose is the product there.

# Design system: surfaces, reveals, and explanatory text

The 28 primitives here are generated shadcn components, re-skinned to Cold Steel. Do not hand-edit
one to fix a single call site; fix the call site, or change the primitive for everybody.

Three of them carry design rules that live in their own docblocks and are binding:

- `popover.tsx` — the reveal surface, and the six Cold Steel popover rules
- `info-popover.tsx` — the reveal that works on a mouse, a finger and a controller
- `tooltip.tsx` — one line of plain text, hover and focus only

This file is the layer above those: **when text is allowed to occupy the screen at all.**

## The problem this solves

The app explains itself in footnotes. A panel renders its figures, then closes with a paragraph
saying how they were derived, what each column means, and what the model does not cover.
`ZoneTable`, `NumbersView`, `LoadoutRail`, `HeadZoneTable` and `ArmorSpecificStats` each carry one.

They fail three ways at once:

1. **They are permanent.** The reader who needs the explanation needs it once. The reader who does
   not need it pays for it on every visit, on a 390px phone, mid-raid.
2. **They are set in a label face.** `micro-label` is 9px uppercase mono with `tracking-micro`. It
   was built for a four-word column header. A four-sentence paragraph in it is unreadable at VR
   viewing distance, which contradicts the root rule that type errs a step bigger than a desktop
   app would.
3. **They are detached from their subject.** A footnote defining the `Class`, `Wedge` and `Cover`
   columns sits four rows below the header that raises the question, so the reader has to hold
   three definitions in their head and map them back.

The answer is not "move the paragraph into a tooltip." It is to sort explanatory text by *what it
does* and give each kind a home.

## The disclosure ladder

Every piece of explanatory text sits at exactly one tier. Pick by the question it answers, never by
its length.

| Tier | Home | For | Cap |
|---|---|---|---|
| 0 | the label itself | text that exists because a name is bad — rename instead | — |
| 1 | on the page, always visible | what changes how the reader *acts* if they do not know it | one line |
| 2 | `Tooltip` | a redundant convenience gloss; nothing is lost if it never opens | 1 sentence, 90 chars |
| 3 | `InfoPopover` | a definition, a method note, a caveat, a small ledger | 3 sentences, 320 chars |
| 4 | a guide under `src/content/guides/` | anything needing paragraphs, an example, or a diagram | — |

**The test for tier 1 vs tier 3:** would a player who has used this panel ten times read it again?
If no, it is tier 3. Familiarity is the whole signal — a returning player skips it, so keeping it
on screen only taxes them.

**The test for tier 2 vs tier 3:** is a touch or controller user materially worse off if this never
opens? A `Tooltip` opens on hover and focus. In a headset there is no hover, and a thumb on a phone
does not hover either. So tier 2 is reserved for text nobody strictly needs. Anything a player
actually needs is tier 3, because `InfoPopover` opens on tap and on Enter as well.

**Tier 4 is a real answer, not a dumping ground.** When a note hits the cap, the guide gets the
paragraphs and the popover keeps its three sentences plus a link. That is the one case where a
reveal may contain a link.

## Rules

1. **Nothing explanatory is permanently on screen unless not knowing it would make the reader act
   wrongly.** "This is an estimate, not the game's own number" earns its line. "Cover is measured
   by running the Is Protected test over the surface" does not — it is provenance, and provenance
   is tier 3.

2. **A note attaches to its subject, not to the bottom of the panel.** A definition of a column
   goes on that column's header. A caveat about one figure goes on that figure. A statement about
   the whole panel goes on the panel's eyebrow — and only then.

3. **Split a multi-subject footnote before you move it.** A paragraph that defines three columns is
   three notes, not one popover. Moving it wholesale to a single trigger keeps the mapping problem
   and merely hides it.

4. **Explanatory prose is never set in `micro-label` or `eyebrow`.** Those are label faces: mono,
   uppercase, four words or fewer. Prose uses `PopoverProse` inside a reveal, and `text-sm
   text-ink-500` on the page. If you are reaching for `leading-relaxed` on a `micro-label`, you have
   the wrong face.

5. **The trigger carries the affordance** (popover rule 3). Use the vocabulary below; do not invent
   a fourth trigger.

6. **One reveal per element, never nested.** A popover does not contain a trigger for another
   popover.

7. **Never hide:** an error, an empty state's reason, the legend that decodes a colour ramp, a gate
   that says why an action is unavailable, or a figure's unit. These are tier 1 by definition — the
   reader cannot ask a question they do not yet know they have.

8. **A reveal is read, not pressed.** No ember inside one (popover rule 2), no buttons, no controls.
   The single exception is rule 4's guide link.

## Trigger vocabulary

Three triggers, and that is the whole set.

| Trigger | `InfoPopover` prop | Use on |
|---|---|---|
| dashed underline + `cursor-help` | `triggerStyle="dashed"` (default) | a term or figure inside running text or a table cell |
| info dot | `triggerStyle="icon"` with `<InfoDot />` | a column header, an eyebrow, a panel title |
| bare | `triggerStyle="bare"` | a control that is already an affordance on its own |

**Choose by the room the column has.** A dot costs about 1rem of column width. `ZoneTable`'s numeric
columns are 3rem wide and its zone column is already `minmax(0,1fr)` collapsed to nothing on a
phone; three dots there pushed every row to three wrapped lines. So a dense numeric header makes the
label itself the trigger and takes the dashed underline, which costs no width at all. The dot is for
a header with room — a panel title, a section eyebrow, a stat line.

Both carry their own hit target, and neither lets it set the height of the row it sits in:

- The **dot** gets 44×44, centred on the glyph.
- The **dashed** label gets 32px, and it grows *upward* from just under the label rather than
  centring on it. This is the one place the 44px rule bends, on purpose: a header label is ~11px
  tall, and a box big enough to tap, centred, reaches into the first data row and swallows taps
  meant for that row. What sits above a header is a legend or a caption and takes no clicks, so
  there is one safe direction to grow. Verified against `ZoneTable`: 36px of target, zero overlap.

The dot glyph is `ink-700` at rest and `ink-400` on hover or focus — a header of dots should read as
texture, not as a row of buttons. Note that the items route already puts decorative `lucide` icons
to the *left* of a stat label; the info dot goes to the right of a left-aligned label so the two do
not read as the same thing.

## Copy shape inside a note

An eyebrow naming the subject, then the prose. First sentence answers the question the reader
actually has; provenance and caveats follow. A note is read at a glance with the panel still on
screen behind it, so it never restates what the panel already shows.

```tsx
// Dense header: the label is the trigger, and takes the dashed underline.
<InfoPopover trigger={<span className="eyebrow">Cover</span>} label="What Cover means" side="bottom">
    <PopoverHeading>Cover</PopoverHeading>
    <PopoverProse>
        The share of that collision body the plate actually protects, measured by running the
        game&rsquo;s own <em>Is Protected</em> test over its surface.
    </PopoverProse>
</InfoPopover>

// Somewhere with room: the dot.
<InfoPopover triggerStyle="icon" trigger={<InfoDot />} label="What Cover means"> … </InfoPopover>
```

`PopoverProse` renders `<em>` unitalicised and a step brighter, which is how a note names a thing —
a column, a game term, an in-game test — without reaching for ember (popover rule 2).

The ledger genre is unchanged: `PopoverHeading` + `PopoverRow` + `PopoverNote`. See the trade
components, which already do this.

## Worked example

`components/protection/ZoneTable.tsx` is the reference conversion. It closed with a four-sentence
`micro-label` footnote — 9px uppercase mono, permanently on screen, defining all four of its
columns from four rows below the headers that raise the questions.

Splitting it by subject produced four candidate notes, and the ladder then disposed of them
differently, which is the part worth copying:

- **Class, Wedge, Cover** became three notes on their own column headers. Each is a definition plus
  its provenance — tier 3.
- **"Only the bodies this piece reaches are listed"** was *deleted*, not hidden. The `Unprotected:`
  line under the table already names every body part the piece leaves open, so the sentence was
  restating visible data. Tier 0: the first question the ladder asks is whether the text needs to
  exist at all, and a note you can delete beats a note you can hide.
- The `Unprotected:` line itself moved *out* of `micro-label` into a reading face and stayed on the
  page. It is data the reader came for, not an explanation of data.

### The second pattern: a prop, not a paragraph

`app/items/components/BallisticCurveChart.tsx` takes an `info?: React.ReactNode` prop and renders it
from a dot on the chart title. Its three call sites in `ArmorSpecificStats` each used to follow the
chart with a `<p className="mt-2 text-xs text-ink-500">`; they now pass that text as `info` and the
paragraph is gone.

**When a shared component is the thing being explained, the disclosure belongs to the component, not
to each call site.** A prop makes the placement, the cap and the trigger one decision made once,
instead of a paragraph every caller re-invents. Reach for this whenever you find the same explaining
shape repeated under a shared component.

The dot trails the title inline rather than sitting in a flex row beside it: chart titles wrap to
two lines at phone width, and a flex row has to truncate the title to keep the dot on the first —
truncating the title to make room for its own explanation is a bad trade.

### Still to convert

`NumbersView` (two footnotes — one is the spray-estimate caveat; check whether that one is tier 1
before you hide it), `LoadoutRail` and `HeadZoneTable`.

## Anti-patterns

| Don't | Do |
|---|---|
| a closing `<p className="micro-label">` under a table | a note per column header |
| a `Tooltip` on something a player needs | `InfoPopover` — tooltips do not open in a headset |
| one popover holding the whole old footnote | split by subject first |
| an info dot on every row | on the header; rows inherit the definition |
| prose in the popover that repeats the panel | the panel is still visible behind it |
| hiding a unit, a legend or an error | tier 1, always |

## Guides are not exempt

`src/content/guides/` is tier 4 and is *supposed* to be prose — long explanations are the product
there. Do not apply the ladder to a guide body. Legal pages (`/privacy`, `/cookies`, `/terms`) are
prose for the same reason.

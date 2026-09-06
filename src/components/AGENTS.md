# Components

Shared across routes. Anything only one route uses lives in `app/<route>/components/` and moves here
when a second route needs it.

## Where a component goes

| Directory | Holds |
|---|---|
| `ui/` | themed shadcn primitives and shared wrappers; see their docblocks for deliberate exceptions |
| `layout/` | `Header`, `Footer`, navigation — every page |
| `items/`, `tasks/`, `trade/`, `protection/`, `gunsmith/`, `quality/` | domain components |
| root | the few app-wide singletons: `CookieConsentBanner`, `ShareButton`, `SessionRefreshButton` |

Check `ui/` before building a primitive. Start from shadcn when adding one and apply the shared
theme; a hand-rolled dialog will not inherit its focus behaviour. Change a primitive for a shared
requirement, and adapt the call site for a local one.

`quality/` holds one component, `GradeMeter`, and it is binding wherever a figure is graded: four
rungs, one palette, and never rendered without the figure beside it. The tiers it draws live in
`src/lib/quality/grade.ts` and are shared by the gunsmith, the combat simulator and the item detail
pages — see [ADR 0006](../../docs/adr/0006-one-grade-scale-for-item-quality.md) before inventing a
second way to say "this is good".

[`ui/AGENTS.md`](ui/AGENTS.md) carries the layer above the primitives: the disclosure ladder that
decides whether a piece of explanatory text belongs on the page, in a `Tooltip`, in an
`InfoPopover`, or in a guide. Read it before adding prose to a component.

## Props

Explicit interface, named for the component. No inline shapes, no `any` — reach for `unknown` and
narrow if the type is genuinely open.

```tsx
interface ItemCardProps {
    item: Item;
    onSelect?: (item: Item) => void;
}
```

Types live in `src/types/` or come from a zod schema. There is no `ComponentName.types.ts`
convention in this repo.

## Styling

The [Cold Steel guide](../../docs/design/README.md) owns tokens, class composition, typography,
VR/touch rules and responsive checks. Its reuse table is the starting point for a new domain UI.

## Images

`next/image` everywhere, with explicit `width` and `height`. Item art is `.webp` under
`public/images/`. Icons come from `lucide-react`.

## Client boundaries

Server components by default. Add `'use client'` only where the component needs state, an effect, or
an event handler — and push it as far down the tree as it will go, so a page stays static.

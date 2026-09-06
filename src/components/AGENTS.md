# Components

Shared across routes. Anything only one route uses lives in `app/<route>/components/` and moves here
when a second route needs it.

## Where a component goes

| Directory | Holds |
|---|---|
| `ui/` | shadcn primitives — 27 of them, generated, not hand-edited |
| `layout/` | `Header`, `Footer`, navigation — every page |
| `items/`, `tasks/`, `trade/`, `protection/`, `gunsmith/` | domain components |
| root | the few app-wide singletons: `CookieConsentBanner`, `ShareButton`, `SessionRefreshButton` |

Check `ui/` before building a primitive. Adding a shadcn component is a generator run, not a
hand-written file, and a hand-rolled dialog will not inherit the theme or the focus behaviour.

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

Compose with `cn()` so later classes win:

```tsx
<div className={cn('military-box p-4', isActive && 'border-olive-400', className)}>
```

Take a `className` prop on anything reusable and merge it last. Shared classes belong in
`@layer components` in `app/globals.css`, not repeated across files. Casing is CSS: `micro-label`
and `eyebrow` uppercase, so data keeps its own casing — a vendor is `Boulder Forge` in data and
`BOULDER FORGE` on screen.

## VR and touch

- Interactive targets at least 44x44px, including rows in a list
- Contrast for a dim headset panel
- Visible keyboard focus
- Test at phone width as well as desktop; both are primary

## Images

`next/image` everywhere, with explicit `width` and `height`. Item art is `.webp` under
`public/images/`. Icons come from `lucide-react`.

## Client boundaries

Server components by default. Add `'use client'` only where the component needs state, an effect, or
an event handler — and push it as far down the tree as it will go, so a page stays static.


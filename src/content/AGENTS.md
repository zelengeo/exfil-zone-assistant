# Guides

Six guides, each a React component rather than markdown. The markdown path was started and is still
commented out in `app/guides/[slug]/page.tsx`; nothing ships through it.

## How a guide is wired

Two files, and both are required:

1. **The content** — `src/content/guides/<slug>.tsx`, a default-exported component.
2. **The registration** — an entry in `guidesConfig` in
   [`src/config/guides.ts`](../config/guides.ts), keyed by the same slug.

The route loads the component with `next/dynamic` off the slug, and `generateStaticParams` builds a
page for every slug in the config. A guide that exists as a file but not in the config has no route;
one in the config without a file breaks the build.

## The metadata entry

```typescript
{
    slug: 'when-is-the-wipe',
    title: 'When is the Next Wipe?',
    description: 'Everything we know about the wipe schedule.',
    tags: ['getting-started', 'gameplay'],
    difficulty: 'beginner',
    readTime: '3 min',
    author: 'pogapwnz',
    publishedAt: '2025-07-08',
    updatedAt: '2026-08-17',
    featured: false,
    contentType: 'component',
}
```

`description` is the og description and the card copy, so write it for someone who has not opened
the guide. `tags` must exist in `guideTags`; an unknown tag simply fails to filter. `updatedAt`
drives the freshness line — move it when the content changes, not when the file does.

## Writing one

- Compose from `components/ui/`; a guide is a page, not a place for bespoke primitives.
- Game facts belong in `public/data` and should be read, not retyped into prose that goes stale.
- Keep headings shallow. These are read on a phone beside a headset.
- Guides are static. No data fetching, no client state beyond a disclosure toggle.


# Guides

Six guides, each a React component. The retired App Roadmap redirects to the guide index and is not
part of the registry.

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
    readTimeMinutes: 3,
    author: 'pogapwnz',
    publishedAt: '2025-07-08',
    updatedAt: '2026-08-17',
    featured: false,
    relatedSlugs: ['survival-damage-mechanics'],
}
```

`description` is the OG description, card copy and search text. `tags` must exist in `guideTags`.
`relatedSlugs` is the deliberate recommendation order. `readTimeMinutes` and `updatedAt` are
required; move the date when content changes. `src/config/guides.test.ts` checks the registry,
relations, tags, component files, internal links and referenced item ids.

## Writing one

- Use the [Cold Steel guide](../../docs/design/README.md) for new UI and shared components.
  Guide bodies are intentionally long-form prose; the disclosure ladder applies to their controls,
  not to the article itself.
- Compose from `components/ui/`; a guide is a page, not a place for bespoke primitives.
- Game facts belong in `public/data` and should be read, not retyped into prose that goes stale.
- Keep headings shallow. These are read on a phone beside a headset.
- Guides are static. No data fetching, no client state beyond a disclosure toggle.


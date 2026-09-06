# Committed data

Three datasets that are still hand-committed TypeScript/JSON rather than `public/data` files,
because each is small enough that the bundle cost has never been the question (contrast
[ADR 0001](../../docs/adr/0001-task-data-as-a-committed-typescript-module.md)). Types for all of
this are hand-written in `src/types/`, not zod-inferred — it is content metadata, nothing published
to validate against.

| File | Owns | Editable by hand |
|---|---|---|
| `community.ts` | the Community & Contributors listing on the home page | yes — see below |
| `hideout-upgrades.ts` | the hideout upgrade table | **no** — generated from the PAK, header says how |
| `taskInconsistencies.json` | task-DAG overrides keyed by task id | rarely; `npm test` guards it |

`hideout-upgrades.ts` is a `GENERATED FILE`. Regenerate it with the pipeline in its header from the
extraction repo; only `relatedQuests` and `hideoutUpgradesTasks` are curated and survive
regeneration. Do not hand-edit anything else in it.

---

## `community.ts` — adding a partner, creator, contributor or supporter

This is the file a partner edits to add themselves in a pull request. It is plain data; no build
step, no database.

- **Rendered by** [`src/app/components/CommunitySection.tsx`](../app/components/CommunitySection.tsx)
  on the home page (`/`).
- **Types** in [`src/types/community.ts`](../types/community.ts) — `BaseContributor`,
  `StandardContributor`, `PartnerContributor`, and `ROLE_CONFIGS` (the four roles and their
  styling/order).

### The four roles

| Role | Where it goes in `community.ts` | Section on the page | Section order |
|---|---|---|---|
| `partner` | a new key in `partnerMap` | **Partners** (top, warm accent, own card) | 1 |
| `supporter` | the `supporters` array | Community Supporters | 4 |
| `creator` | a new key in `communityCreatorMap` | Content Creators | 2 |
| `contributor` | the `contributors` array | Contributors | 3 |

`partnerMap` is `{}` today and `contributors` is empty — both are wired up and ready, just add an
entry. Map keys (`orbb`, `radFoxVR`, …) are arbitrary camelCase ids; keep them unique.

### The one gotcha: `featured` gates visibility for everyone except partners

`ContributorCard` returns `null` unless the entry has `featured: true`. So a `creator`,
`contributor` or `supporter` added **without** `featured: true` is in the data but renders nowhere.

For a `partner`, `featured` is not a visibility switch — `PartnerCard` always renders. On a partner
`featured: true` only adds the "Featured" corner badge.

### Fields

Common to every role (`BaseContributor`):

| Field | Required | Notes |
|---|---|---|
| `name` | yes | display name |
| `role` | yes | one of the four literals above; must match which collection it goes in |
| `featured` | see gotcha | `true` to render a non-partner; badge-only on a partner |
| `description` | no | one or two sentences. `\n` renders as a line break. Keep it short — the page discloses detail, it does not park it ([components/ui](../components/ui/AGENTS.md)) |
| `link` | no | external URL; opens in a new tab. Omit and the card is not clickable |
| `logo` | no | see below |
| `platform` | no | `youtube \| twitch \| website \| github \| discord \| telegram`. Picks the icon; anything else or absent → globe |

`partner` only (`PartnerContributor`), all optional:

| Field | Notes |
|---|---|
| `priority` | sort order within Partners, lower first; default `999` |
| `highlighted` | heavier border treatment |
| `tags` | `readonly string[]` of short labels, e.g. `['Tutorial Creator']` |
| `stats` | `{ subscribers?, videos?, followers? }`, all strings |
| `customComponent` | a React component that replaces the whole card — rare, needs a real code review |

### Logos

- Drop the file in `public/images/community/` and reference it as an absolute path:
  `logo: '/images/community/<name>.webp'`.
- **WebP, square.** Rendered through `next/image` with `unoptimized`, at 48×48 (partner) or 40×40
  (contributor/supporter/creator) — supply at least ~96×96 so it stays sharp on a headset panel.
- No logo is fine: partners show initials-free header text, other cards fall back to the platform
  icon or the first letter of the name.

### Example — a creator adding themselves

```ts
// in communityCreatorMap
someHandle: {
    name: 'Some Handle',
    role: 'creator',
    featured: true,                 // <- without this the card does not render
    description: 'VR extraction-shooter guides and patch breakdowns.',
    link: 'https://www.youtube.com/@somehandle',
    logo: '/images/community/someHandle_logo.webp',
    platform: 'youtube',
},
```

### PR checklist

1. Entry added to the right collection, `role` matching it.
2. Non-partner entries have `featured: true`.
3. Logo committed under `public/images/community/`, WebP, square, path is absolute and correct.
4. `description` is a sentence or two, not a paragraph.
5. `npm run lint` and `npm run build` pass (TypeScript catches a wrong shape; there is no
   data-specific validator for this file).

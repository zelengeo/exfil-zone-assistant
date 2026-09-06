# Guides Route

A list at `/guides`, a page per guide at `/guides/[slug]`. Both are built from the registry, not
from the filesystem.

**Writing a guide is documented in [content/AGENTS.md](../../content/AGENTS.md).** This file is about
the route.

## Config drives everything

[`config/guides.ts`](../../config/guides.ts) is the single registry. `getAllGuideSlugs()` feeds
`generateStaticParams`, so a guide has a page because it is in the config — not because a file
exists under `content/guides/`. The component is then pulled in with `next/dynamic` off the slug.

The two failure modes are asymmetric and worth knowing apart: a file with no config entry is simply
unreachable, while a config entry with no file breaks the build.

## Related guides

`getRelatedGuides` scores every other guide by how many tags it shares with the current one, sorts
by that count, and takes the top three. No recency, no popularity, no curation — so the lever for a
better suggestion is the tag list, and a guide tagged only `getting-started` will pull in whatever
else carries that tag.

## Filtering

The list filters client-side over the whole config. That is right while there are six guides and
would stop being right at a few hundred; the config is already in the bundle either way.

`getAllTags()` derives the filter vocabulary from the guides themselves, so a tag appears in the UI
by being used. `guideTags` remains the place a tag gets a label and a description.

## Also here

The [old guide specification](../../../docs/design/archive/guide-specification.md) is archived:
its Markdown pipeline and pre-Cold Steel examples are superseded. Use
[content/AGENTS.md](../../content/AGENTS.md) for authoring and the
[design guide](../../../docs/design/README.md) for new UI.

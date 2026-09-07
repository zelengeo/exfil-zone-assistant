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

`relatedSlugs` in the registry is the ordered recommendation list. Keep combat references
deliberate; the integrity test rejects missing and duplicate relations.

## Filtering

The list filters client-side over the whole config. That is right while there are six guides and
would stop being right at a few hundred; the config is already in the bundle either way.

The filter vocabulary is the intersection of registered tags and `guideTags`; the integrity test
requires every defined tag to be used. Search covers registry titles, descriptions and tag labels.
Guide bodies stay out of the client search bundle.

## Also here

The [old guide specification](../../../docs/design/archive/guide-specification.md) is archived:
its Markdown pipeline and pre-Cold Steel examples are superseded. Use
[content/AGENTS.md](../../content/AGENTS.md) for authoring and the
[design guide](../../../docs/design/README.md) for new UI.

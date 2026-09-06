# Cold Steel brand assets

**Current implementation, checked 2026-09-06.** For UI components start with the
[design guide](README.md). The [original concept brief](archive/BRAND_IMAGE_GENERATION.md) proposed
an Extraction Frame identity; it is historical and does not describe the shipped logo.

## Extend the existing family

[scripts/render-og.mjs](../../scripts/render-og.mjs) is the executable source for card presets,
composition, typography and export. It reads [logo-ez.svg](../../public/brand/logo-ez.svg), composes
real route captures where a preset specifies them, and renders the final card. Keep titles and
logos deterministic; generated artwork is an input layer, not rendered UI or final lettering.

The other files in [public/brand/](../../public/brand/) include monochrome versions and concept
variants. Start from the asset referenced by the consumer, not the highest version number in a
filename. The header wordmark is live text in [Header](../../src/components/layout/Header.tsx).

## Add or update a social card

1. Inspect the matching preset in `render-og.mjs` and its inputs under
   [public/og/art/](../../public/og/art/). Reuse the existing composition; add a preset only when a
   route needs a distinct card. Use actual item/merchant art and current UI for recognisable game
   subjects. Match Cold Steel surfaces and typography from the design guide.
2. Render using the script's arguments:

   ```powershell
   npm run render:og -- public/og/art/default-base.png public/og-image.jpg base
   ```

   That command targets the default card. For another card, pass its art, output path and existing
   preset key explicitly. The script uses `sharp`, its bundled fonts under `scripts/assets/og-fonts/`,
   and an isolated temporary fontconfig file; inspect those dependencies if rendering fails.
3. Inspect the 1200×630 output at full size and approximately 600×315. Titles must stay legible,
   art must leave the text area clear, and logos/figures must remain recognisable. Compare with
   another shipped card so a new route remains part of the same family.
4. Check the actual consumers before replacing or renaming files:
   [root metadata](../../src/app/layout.tsx), per-route metadata, [guide config](../../src/config/guides.ts),
   and [site.webmanifest](../../public/site.webmanifest). Verify every changed asset path resolves.

For favicon work, verify the referenced sizes and monochrome/mask variants against those consumers
and inspect at 16, 32 and 48px. Preserve a vector source for future derivatives. The manifest already
uses Cold Steel colours; the old brief's claim that it still uses olive is obsolete.

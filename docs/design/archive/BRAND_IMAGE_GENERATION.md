# Cold Steel brand and social-image generation brief

**Status:** archived concept brief, superseded for implementation on 2026-09-06 by
[Brand assets](../BRAND_ASSETS.md). The shipped renderer uses `public/brand/logo-ez.svg`, not the
proposed Extraction Frame. OG cards and Cold Steel manifest colours already exist. The proposals,
asset-gap claims and approval steps below describe the original concept round, not current work.

This brief translates the accepted Cold Steel UI direction into a repeatable brand-image system. The design handoff is visual reference material; this document does not import its implementation instructions.

## 1. Brand position

ExfilZone Assistant should look like a field instrument used to plan an extraction, not official game key art and not a generic military clan logo.

The visual idea is **route intelligence under pressure**:

- precise, compact, operational
- gunmetal hardware and cold data surfaces
- one ember-orange signal showing the active route or exit
- useful before dramatic; tactical without military clichés

Core palette:

| Role | Value | Use |
|---|---:|---|
| Deep steel | `#0A0E12` | Background and app-icon field |
| Raised steel | `#141B22` | Secondary planes |
| Hairline | `#33414D` | Structure and outlines |
| Primary ink | `#ECF2F7` | Wordmark and high-priority copy |
| Muted ink | `#8DA0AE` | Supporting copy |
| Ember | `#FF4A24` | One exit, route, or active signal |

Do not reintroduce the old olive palette. Cyan belongs to the rejected Blacksite direction and is not a brand color.

## 2. Proposed identity direction: Extraction Frame

Use a standalone **extraction-route mark**, not `EZ` inside a square.

The mark should combine:

- two or three orthogonal steel strokes suggesting a map route or open frame
- a deliberate opening at the upper-right edge: the extraction point
- one short ember stroke moving through that opening
- negative space that may suggest `E` and `Z` at medium sizes, without requiring the letters to be read
- one clipped shoulder at most; otherwise hard 90-degree geometry

The silhouette must remain recognizable without color and at 16 px. It must not depend on thin interior detail, texture, glow, or a surrounding badge.

### Logo family

1. **Mark** — Extraction Frame symbol only. Used for favicon, app icon, avatar, and compact mobile chrome.
2. **Wordmark** — `EXFILZONE` set in Saira Condensed 800, with `EXFIL` in primary ink and `ZONE` in ember. This remains the preferred header treatment.
3. **Full lockup** — mark + wordmark + optional `ASSISTANT` descriptor in IBM Plex Mono. Use only where there is enough width.
4. **One-color mark** — solid light and solid dark versions for mask icons and constrained placements.

The descriptor is never part of the small mark. Do not rasterize the wordmark into normal UI chrome when live text is available.

### Logo concept-generation prompt

Use image generation for exploration only. Redraw the selected concept as clean SVG before shipping it.

```text
Use case: logo-brand
Asset type: concept sheet for a VR extraction-shooter companion app identity
Primary request: explore six original standalone symbols for the concept "Extraction Frame"; an angular route-intelligence mark with an open upper-right extraction point and one short exit stroke
Brand character: precise field instrument, compact, operational, cold gunmetal hardware with a single urgent signal
Style/medium: flat vector-friendly geometry, hard 90-degree construction, strong negative space, minimal number of shapes
Composition/framing: six separate marks on a plain deep-steel background, generous spacing, no enclosing square badge
Color palette: #0A0E12 background, #ECF2F7 primary strokes, #FF4A24 on exactly one exit stroke per mark
Constraints: every mark must work in one color and remain recognizable at 16 px; original symbols only; no text; no gradients; no shadows; no glow; no watermark
Avoid: literal EZ letters inside a box, circles, shields, skulls, helmets, crosshairs, guns, bullets, targets, wings, dog tags, hazard stripes, esports styling, official game branding, olive, khaki, cyan
```

Selection rule: reject any candidate that needs explanation after being viewed at favicon size. The medium-size `E`/`Z` suggestion is a bonus, not the test.

## 3. OG image system

All OG cards use one composed template. Generated imagery is a replaceable layer inside that template, not the template itself.

### Canvas and layout

- Master: `1200 × 630` px, sRGB.
- Keep critical copy and marks at least 64 px from every edge.
- Reserve the left 55–60% for deterministic typography.
- Put the page-specific subject in the right 40–45%; it may cross the center slightly but must not impair title contrast.
- Use a one-pixel hairline frame, a faint 28 px technical grid, and at most one clipped upper-right shoulder.
- Use no more than two dark surface values in a card.
- Ember should occupy roughly 5% of the composition. It identifies one active route, node, slot, or verdict—not general decoration.

### Deterministic overlay

Compose these after image generation in HTML/CSS, SVG, Figma, or another deterministic tool:

- top eyebrow, for example `FIELD SYSTEM / TASKS`
- page title, maximum two lines, Saira Condensed 800
- one short benefit line in IBM Plex Sans
- wordmark or Extraction Frame mark
- optional route-specific data label in IBM Plex Mono
- grid, hairlines, and ember signal

Never ask an image model to render the final logo or card copy. This avoids spelling drift and keeps every route card aligned.

### Generated art layer

The art layer should feel like an abstracted technical plate, real game-data visualization, or restrained industrial concept—not a cinematic operator portrait.

Shared prompt:

```text
Use case: stylized-concept
Asset type: background art layer for a 1200x630 social preview card
Primary request: [ROUTE-SPECIFIC SUBJECT]
Scene/backdrop: deep gunmetal technical environment with layered steel planes and restrained map-grid structure
Style/medium: realistic industrial concept art blended with precise tactical-data visualization; sharp, useful, restrained
Composition/framing: wide 1.91:1 composition; keep the left 60% dark and low-detail for a later typography overlay; place the subject in the right 40%; preserve generous edge safety
Lighting/mood: low-key cold neutral light with one controlled ember-orange signal
Color palette: #0A0E12, #141B22, #33414D, #8DA0AE, #ECF2F7, and a very small amount of #FF4A24
Materials/textures: matte gunmetal, worn polymer, etched technical markings without readable text
Constraints: no text, no letters, no numbers, no logo, no watermark; no rounded UI; no bright bloom; subject must survive a small mobile-feed preview
Avoid: olive, khaki, cyan, neon cyberpunk, generic soldier hero shot, skulls, crosshairs, firearms pointed at camera, official game branding, fake readable UI, clutter on the left
```

### Route subjects

| Card | Route-specific subject |
|---|---|
| Default / Base | An extraction map plate converging on one open exit node, with subtle equipment silhouettes and a single ember route segment |
| Tasks | A vertical dependency spine with branching mission nodes and one active ember node; use real trader art later as a composed overlay if desired |
| Gunsmith | A side-on rifle bench or exploded attachment rail assembled from real item art where possible, with one selected slot |
| Items | A disciplined inventory field of recognizable equipment silhouettes with one inspected item plane |
| Damage | An armour silhouette, restrained ballistic trace, and comparison plot focused on one verdict |
| Hideout | An isometric bunker plan or room-upgrade plate with one ready module signalled in amber, not ember |
| Guides | A field-manual spread with map, ammunition profile, and route annotations, all without readable generated text |

Vendor-specific task cards should reuse the real merchant images already shipped under `public/images/tasks/`; do not generate new faces or approximate the characters.

Guide-specific cards may reuse verified game imagery where rights and provenance are already settled, but should still receive the same deterministic Cold Steel overlay.

## 4. Generation workflow

1. Generate three to six logo concepts using the concept prompt.
2. Test them immediately at 16, 32, and 48 px in monochrome. Select one silhouette, then redraw it as SVG on a simple integer grid.
3. Build one OG template with placeholder art and validate it at full size and at roughly 600 × 315.
4. Generate only the route art layers using the shared prompt plus one route subject.
5. Composite the deterministic overlay and use the same measurements for every card.
6. Review the full family as a contact sheet before replacing existing assets.
7. Export final JPEG OG cards with enough quality to keep Saira letter edges clean; export icons from the SVG master, never from a generated bitmap.

Iterate one variable at a time: silhouette, subject placement, lighting, or detail density. Do not rewrite the whole prompt after each round.

## 5. Acceptance checklist

### Mark

- recognizable at 16 px and in one color
- no `EZ`-in-a-square construction
- no military or esports cliché
- no resemblance to the official game logo or another recognizable trademark
- no detail thinner than one pixel at intended size
- dark, light, and mask versions retain the same silhouette

### OG card

- title remains readable when previewed at 600 × 315
- left text zone is not polluted by generated detail
- exactly one visual idea is accented
- no generated text, logos, watermarks, malformed equipment, or invented character likenesses
- no olive or cyan cast
- route identity is visible without changing the shared template
- meaningful alt text names the page and its purpose rather than describing decoration

## 6. Export and repository plan

Keep concept rounds non-destructive with versioned filenames. After approval, maintain one vector master and derive the raster set from it.

Recommended masters:

- `public/brand/extraction-frame.svg`
- `public/brand/exfilzone-wordmark.svg` only when a raster/vector lockup is actually needed
- `public/brand/extraction-frame-mask.svg`
- `public/og/og-template.svg` or an equivalent deterministic render source

Required final derivatives should cover the sizes currently used by metadata and install surfaces: 16, 32, 48, 96, 144, 180, 192, and 512 px, plus 1200 × 630 OG cards and the existing 1200 × 1200 square social image.

Before implementation, reconcile current metadata names: `src/app/layout.tsx` references `favicon-google-192x192.png`, `favicon-google-512x512.png`, `safari-pinned-tab.svg`, and `mstile-144x144.png`, but those files are currently absent. The existing 192/512 Google assets are named `logo-google-*.png`. The web manifest also still carries the old olive `background_color` and `theme_color`.


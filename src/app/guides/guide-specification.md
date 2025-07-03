# Guide Creation Specification

This document outlines the standards and best practices for creating guides for ExfilZone Assistant.

## Guide Types

We support two types of guides:

### 1. Markdown Guides (.md)
Best for text-heavy content with simple formatting needs:
- Tutorials with step-by-step instructions
- Explanatory content
- Lists and tables
- Basic images

### 2. Component Guides (.tsx)
Best for interactive or complex content:
- Interactive calculators or tools
- Complex layouts with multiple sections
- Content requiring state management
- Rich media integration

## File Structure

```
/content/guides/
├── guide-slug.md          # Markdown guide
├── guide-slug.tsx         # Component guide
└── images/               # Guide-specific images
    └── guide-slug/
        ├── hero.jpg
        └── diagram.png
```

## Adding a New Guide

### Step 1: Add Guide Metadata
Add your guide to `/lib/guides/guides-config.ts`:

```typescript
{
  slug: 'your-guide-slug',              // URL-friendly unique identifier
  title: 'Your Guide Title',            // Display title
  description: 'Brief description',     // 1-2 sentence summary
  tags: ['gameplay', 'combat'],         // Array of tag IDs (see available tags)
  difficulty: 'intermediate',           // beginner | intermediate | advanced (optional)
  readTime: '10 min',                   // Estimated read time (optional)
  author: 'Your Name',                  // Author name (optional)
  publishedAt: '2024-01-30',           // YYYY-MM-DD format
  updatedAt: '2024-02-15',             // Last update date (optional)
  featured: false,                      // Show in featured section
  contentType: 'markdown'               // 'markdown' or 'component'
}
```

### Step 2: Create Guide Content

#### For Markdown Guides

Create `/content/guides/your-guide-slug.md`:

```markdown
# Your Guide Title

Introduction paragraph explaining what this guide covers.

## Main Section

Your content here...

### Subsection

More detailed content...

## Best Practices

- Use bullet points for lists
- Keep paragraphs short for VR readability
- Include practical examples

## Conclusion

Summary and next steps.
```

#### For Component Guides

Create `/content/guides/your-guide-slug.tsx`:

```tsx
import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

export default function YourGuideSlug() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <p className="text-lg text-tan-200 leading-relaxed">
          Introduction paragraph explaining what this guide covers.
        </p>
      </section>

      {/* Main Content */}
      <section className="military-box p-6 rounded-sm">
        <h2 className="text-2xl font-bold text-tan-100 mb-4">
          Main Section
        </h2>
        <div className="space-y-4 text-tan-200">
          <p>Your content here...</p>
        </div>
      </section>

      {/* Info Box Example */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-sm p-4">
        <div className="flex items-start gap-3">
          <Info className="text-blue-400 mt-1" size={20} />
          <p className="text-blue-200">
            Important information or tip
          </p>
        </div>
      </div>
    </div>
  );
}
```

## Available Tags

| Tag ID | Name | Description | Use When |
|--------|------|-------------|----------|
| `getting-started` | Getting Started | Essential guides for new players | Basic tutorials, first steps |
| `gameplay` | Gameplay | Core game mechanics and systems | Movement, inventory, general mechanics |
| `combat` | Combat | Fighting and weapon guides | Weapon usage, damage, tactics |
| `equipment` | Equipment | Gear and loadout guides | Armor, weapons, attachments |
| `vr-specific` | VR Specific | VR optimization and comfort | Headset setup, motion sickness |
| `strategy` | Strategy | Advanced tactics and tips | Meta strategies, advanced techniques |
| `economy` | Economy | Trading and resource management | Currency, trading, hideout upgrades |
| `maps` | Maps | Location and navigation guides | Map-specific guides, extractions |

## Content Guidelines

### Writing Style
- **Tone**: Informative but conversational
- **Voice**: Second person ("you") for instructions
- **Clarity**: Assume no prior knowledge unless specified
- **Length**: Aim for 5-15 minute read times

### VR Considerations
- Use short paragraphs (3-4 sentences max)
- Break up text with headers and visual elements
- Ensure high contrast for readability
- Avoid walls of text

### Formatting Standards

#### Headers
- H1 (`#`): Only for main title (auto-generated from metadata)
- H2 (`##`): Major sections
- H3 (`###`): Subsections
- H4 (`####`): Minor points (use sparingly)

#### Emphasis
- **Bold** for important terms or UI elements
- *Italic* for emphasis (use sparingly in VR)
- `Code` for in-game commands or values

#### Lists
- Use bullet points for unordered lists
- Use numbered lists for step-by-step instructions
- Keep list items concise

### Visual Elements

#### Images
- Store in `/content/guides/images/[guide-slug]/`
- Use descriptive filenames: `armor-comparison-chart.png`
- Optimize for web (WebP preferred, PNG for screenshots)
- Include alt text for accessibility

#### Component Blocks
For component guides, use these pre-styled blocks:

```tsx
{/* Success/Tip Box */}
<div className="bg-green-900/20 border border-green-700/50 rounded-sm p-4">
  <p className="text-green-200">
    <span className="font-semibold">Pro Tip:</span> Your tip here
  </p>
</div>

{/* Warning Box */}
<div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="text-yellow-400 mt-1" size={20} />
    <p className="text-yellow-200">
      Warning message here
    </p>
  </div>
</div>

{/* Info Box */}
<div className="bg-blue-900/20 border border-blue-700/50 rounded-sm p-4">
  <p className="text-blue-200">
    Additional information here
  </p>
</div>

{/* Data Table */}
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-military-600">
        <th className="text-left py-2 text-tan-300">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-military-700">
        <td className="py-2 text-tan-200">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Quality Checklist

Before submitting a guide, ensure:

- [ ] Guide metadata added to `guides-config.ts`
- [ ] Slug is URL-friendly (lowercase, hyphens, no spaces)
- [ ] Appropriate tags selected (2-4 tags recommended)
- [ ] Difficulty level accurately reflects content
- [ ] Read time is realistic (250 words ≈ 1 minute)
- [ ] Content is accurate and up-to-date
- [ ] Formatting follows standards
- [ ] Images are optimized and have alt text
- [ ] Guide works on mobile/tablet/desktop
- [ ] No walls of text (good visual hierarchy)
- [ ] Links to related guides where appropriate

## Examples

### Good Guide Structure
```
Introduction (what you'll learn)
├── Prerequisites (if any)
├── Main Concept
│   ├── Explanation
│   ├── Visual Example
│   └── Common Mistakes
├── Step-by-Step Process
│   ├── Step 1 (with screenshot)
│   ├── Step 2 (with tip box)
│   └── Step 3 (with warning)
├── Advanced Tips
└── Related Guides
```

### Difficulty Guidelines

**Beginner**
- No prior knowledge required
- Basic game mechanics
- Essential information
- Clear step-by-step instructions

**Intermediate**
- Assumes basic game knowledge
- More complex strategies
- Multiple game systems interaction
- Some optimization techniques

**Advanced**
- Deep mechanical understanding
- Min-maxing strategies
- Complex calculations
- Meta-game considerations

## Maintenance

Guides should be reviewed and updated:
- When game patches affect the content
- When new strategies emerge
- Based on user feedback
- At least every 3 months

Mark updated guides with the `updatedAt` field in the config.
# Content Management Guidelines

## Documentation Hierarchy

**Parent:** [Frontend Architecture](../CLAUDE.md) - Overall frontend patterns
**Root:** [Root CLAUDE.md](../../CLAUDE.md) - Project overview & styling rules
**Index:** [CLAUDE-INDEX.md](../../CLAUDE-INDEX.md) - Complete navigation

**Related Documentation:**
- [Components](../components/CLAUDE.md) - Components used in guides
- [App Router](../app/CLAUDE.md) - Guide page structure
- [Types](../types/CLAUDE.md) - Guide metadata types
- [Public Data](../../public/data/CLAUDE.md) - Game data referenced in guides

**See Also:**
- For styling conventions (cn utility), see [src/CLAUDE.md](../CLAUDE.md) - Styling Conventions
- For VR design principles, see [Root CLAUDE.md](../../CLAUDE.md) - UI/UX Principles
- For component usage in guides, see [Components CLAUDE.md](../components/CLAUDE.md)

---

## Content Structure
```
content/
├── guides/                 # Game guides and tutorials
│   ├── guides-config.ts   # Guide metadata and configuration
│   ├── [guide-slug].tsx   # Component-based guides
│   ├── [guide-slug].md    # Markdown guides
│   └── images/            # Guide-specific images
└── data/                  # Static game data (if needed)
```

## Guide Creation Process

### Step 1: Define Guide Metadata
Add entry to `guides-config.ts`:

```typescript
export const guides: Guide[] = [
  {
    slug: 'combat-basics',           // URL-friendly identifier
    title: 'Combat Basics Guide',    // Display title
    description: 'Learn the fundamentals of combat in ExfilZone',
    tags: ['combat', 'beginner'],    // Categorization
    difficulty: 'beginner',          // beginner | intermediate | advanced
    readTime: '8 min',              // Estimated reading time
    author: 'ExfilZone Team',       // Author attribution
    publishedAt: '2024-01-15',      // Publication date
    updatedAt: '2024-02-01',        // Last update
    featured: true,                  // Show in featured section
    contentType: 'component',        // 'component' or 'markdown'
  },
];
```

### Step 2: Create Guide Content

#### Component Guide Template
```typescript
// content/guides/combat-basics.tsx
import React from 'react';
import { AlertCircle, Target, Shield } from 'lucide-react';
import Image from 'next/image';

export default function CombatBasicsGuide() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Introduction */}
      <section>
        <p className="text-lg text-tan-200 leading-relaxed mb-6">
          Master the combat mechanics of ExfilZone with this 
          comprehensive guide covering everything from basic 
          shooting to advanced tactics.
        </p>
      </section>

      {/* Main Content */}
      <section className="space-y-6">
        <h2 className="vr-heading-2 text-tan-100">
          Understanding Damage Mechanics
        </h2>
        
        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-sm p-4">
          <p className="text-blue-200">
            <strong>Key Concept:</strong> Damage in ExfilZone 
            depends on weapon, ammunition, armor, and distance.
          </p>
        </div>
        
        {/* Visual Example */}
        <div className="military-box p-4">
          <Image
            src="/images/guides/damage-chart.png"
            alt="Damage calculation chart"
            width={800}
            height={400}
            className="rounded"
          />
        </div>
        
        {/* Tips Section */}
        <div className="bg-green-900/20 border border-green-700/50 rounded-sm p-4">
          <div className="flex items-start gap-3">
            <Target className="text-green-400 mt-1" size={20} />
            <div>
              <p className="text-green-200 font-semibold mb-1">
                Pro Tip
              </p>
              <p className="text-green-100">
                Always aim for unarmored areas when using 
                low-penetration ammunition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Elements */}
      <section className="space-y-4">
        <h2 className="vr-heading-2 text-tan-100">
          Damage Calculator
        </h2>
        <DamageCalculatorWidget />
      </section>

      {/* Related Guides */}
      <section className="border-t border-military-600 pt-6">
        <h3 className="vr-heading-3 text-tan-100 mb-4">
          Related Guides
        </h3>
        <RelatedGuides currentSlug="combat-basics" />
      </section>
    </div>
  );
}
```

#### Markdown Guide Template
```markdown
# Combat Basics Guide

Master the combat mechanics of ExfilZone with this comprehensive 
guide covering everything from basic shooting to advanced tactics.

## Understanding Damage Mechanics

Damage in ExfilZone is calculated based on several factors:

- **Weapon Base Damage**: Each weapon has inherent damage values
- **Ammunition Type**: Different ammo types modify damage
- **Armor Penetration**: Ability to bypass armor protection
- **Distance Falloff**: Damage reduces over distance

### Damage Calculation Formula

The basic formula for damage calculation:
`Final Damage = Base Damage × Ammo Multiplier × Distance Modifier × Armor Reduction`

## Armor System

ExfilZone uses a realistic armor system with different protection zones:

| Armor Class | Protection Level | Common Examples |
|-------------|-----------------|-----------------|
| Class 1     | Light           | Basic vests     |
| Class 2     | Medium          | Police armor    |
| Class 3     | Heavy           | Military gear   |
| Class 4     | Maximum         | EOD suits       |

## Combat Tips

> **Pro Tip**: Always check your ammunition type before engaging. 
> High-damage rounds mean nothing if they can't penetrate armor.

### For Beginners
1. Start with high fire-rate weapons for forgiveness
2. Always take cover between engagements
3. Learn the recoil patterns in the practice range

### Advanced Tactics
- Pre-fire common angles
- Use grenades to flush out campers
- Master the peek-and-shoot technique

## Conclusion

Combat in ExfilZone rewards preparation and knowledge. 
Understanding these mechanics will significantly improve 
your survival rate.
```

## Content Standards

### Writing Style
- **Tone**: Informative, military-tactical, professional
- **Voice**: Second person for instructions ("You should...")
- **Clarity**: Simple sentences, avoid jargon without explanation
- **VR Optimization**: Short paragraphs, clear headings

### Formatting Guidelines

#### Headers
```markdown
# Main Title (H1) - Only one per guide
## Major Sections (H2)
### Subsections (H3)
#### Minor Points (H4) - Use sparingly
```

#### Emphasis
```markdown
**Bold** for important terms, UI elements, key concepts
*Italic* for emphasis (use sparingly for VR readability)
`Code` for in-game commands, values, console commands
```

#### Lists
```markdown
- Unordered lists for general points
  - Nested items with 2-space indent
  
1. Numbered lists for sequential steps
2. Keep items concise
3. One concept per item
```

### Visual Elements

#### Images
```typescript
// Optimal image implementation
<Image
  src="/images/guides/combat/recoil-pattern.webp"
  alt="AK-47 recoil pattern visualization"
  width={800}
  height={400}
  className="rounded border border-military-600"
  priority={false} // true only for above-fold images
/>
```

#### Info Boxes
```typescript
// Success/Tip
<div className="bg-green-900/20 border border-green-700/50 rounded-sm p-4">
  <p className="text-green-200">
    <strong>Tip:</strong> Your helpful advice here
  </p>
</div>

// Warning
<div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-4">
  <AlertCircle className="text-yellow-400" />
  <p className="text-yellow-200">
    <strong>Warning:</strong> Important caution here
  </p>
</div>

// Information
<div className="bg-blue-900/20 border border-blue-700/50 rounded-sm p-4">
  <Info className="text-blue-400" />
  <p className="text-blue-200">
    <strong>Note:</strong> Additional information here
  </p>
</div>

// Danger/Error
<div className="bg-red-900/20 border border-red-700/50 rounded-sm p-4">
  <XCircle className="text-red-400" />
  <p className="text-red-200">
    <strong>Critical:</strong> Critical warning here
  </p>
</div>
```

### Interactive Components

**See Also:** [src/CLAUDE.md - Styling Conventions](../CLAUDE.md) for cn() utility usage in conditional styling

#### Embedding Calculators
```typescript
// Import and use existing calculators
import CombatSimulator from '@/components/combat-sim/CombatSimulator';

export default function GuideWithCalculator() {
  return (
    <div>
      <h2>Try It Yourself</h2>
      <CombatSimulator 
        simplified={true}  // Simplified version for guides
        presetWeapon="ak47" 
      />
    </div>
  );
}
```

#### Collapsible Sections
```typescript
'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function CollapsibleSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="military-box">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4"
      >
        <span className="font-semibold">{title}</span>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-military-600">
          {children}
        </div>
      )}
    </div>
  );
}
```

## Guide Categories & Tags

### Available Tags
```typescript
export const guideTags = {
  // Gameplay
  'combat': { label: 'Combat', color: 'red' },
  'movement': { label: 'Movement', color: 'blue' },
  'looting': { label: 'Looting', color: 'green' },
  'survival': { label: 'Survival', color: 'yellow' },
  
  // Equipment
  'weapons': { label: 'Weapons', color: 'orange' },
  'armor': { label: 'Armor', color: 'purple' },
  'medical': { label: 'Medical', color: 'pink' },
  
  // Progression
  'tasks': { label: 'Tasks', color: 'cyan' },
  'hideout': { label: 'Hideout', color: 'indigo' },
  'merchants': { label: 'Merchants', color: 'teal' },
  
  // Difficulty
  'beginner': { label: 'Beginner', color: 'green' },
  'intermediate': { label: 'Intermediate', color: 'yellow' },
  'advanced': { label: 'Advanced', color: 'red' },
  
  // Technical
  'vr-setup': { label: 'VR Setup', color: 'blue' },
  'performance': { label: 'Performance', color: 'gray' },
};
```

### Difficulty Guidelines

#### Beginner Guides
- No prior game knowledge required
- Step-by-step instructions
- Explain all terminology
- Include visual aids
- Cover basic mechanics

#### Intermediate Guides
- Assume basic game knowledge
- Focus on optimization
- Introduce advanced concepts
- Strategy and tactics
- Efficiency tips

#### Advanced Guides
- Expert-level content
- Meta strategies
- Min-maxing approaches
- Complex calculations
- Competitive tactics

## SEO Optimization

### Metadata Requirements
```typescript
// Every guide must have:
{
  title: 'Descriptive Title | ExfilZone Assistant',
  description: '155-character compelling description',
  keywords: ['relevant', 'search', 'terms'],
  ogImage: '/images/guides/og/guide-slug.jpg', // 1200x630px
}
```

### Content SEO
- Use H2 tags for main sections
- Include relevant keywords naturally
- Add alt text to all images
- Create descriptive URLs (slugs)
- Internal linking to related content

## Media Guidelines

### Image Specifications
- **Format**: WebP preferred, PNG for screenshots
- **Resolution**: 1920x1080 max, optimize for web
- **File Size**: Under 200KB when possible
- **Naming**: `guide-slug-description.webp`
- **Alt Text**: Descriptive, includes keywords

### Video Embedding
```typescript
// YouTube embed
<div className="aspect-video">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="Video title"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="w-full h-full rounded"
  />
</div>
```

## Quality Checklist

Before publishing a guide:

- [ ] Metadata added to `guides-config.ts`
- [ ] Slug is URL-friendly (lowercase, hyphens)
- [ ] Appropriate tags selected (2-4 tags)
- [ ] Difficulty level accurate
- [ ] Read time calculated (250 words ≈ 1 min)
- [ ] Content technically accurate
- [ ] VR-friendly formatting
- [ ] Images optimized and have alt text
- [ ] Mobile responsive
- [ ] Related guides linked
- [ ] No spelling/grammar errors
- [ ] Code examples tested

## Content Maintenance

### Update Schedule
- Review guides monthly for accuracy
- Update after game patches
- Refresh screenshots seasonally
- Check broken links weekly

### Version Tracking
```typescript
// Track major updates in metadata
{
  publishedAt: '2024-01-15',
  updatedAt: '2024-02-15',
  changelog: [
    { date: '2024-02-15', changes: 'Updated for patch 1.2' },
    { date: '2024-02-01', changes: 'Added video guide' },
  ]
}
```

## Common Components

### Related Guides Component
```typescript
import { getRelatedGuides } from '@/content/guides/guides-config';

export function RelatedGuides({ currentSlug, limit = 3 }) {
  const related = getRelatedGuides(currentSlug, limit);
  
  return (
    <div className="grid gap-4">
      {related.map(guide => (
        <Link 
          key={guide.slug}
          href={`/guides/${guide.slug}`}
          className="military-box p-4 hover:border-olive-400"
        >
          <h4 className="font-semibold text-tan-100">
            {guide.title}
          </h4>
          <p className="text-sm text-tan-300 mt-1">
            {guide.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
```

### Table of Contents Component
```typescript
export function TableOfContents({ sections }) {
  return (
    <nav className="military-box p-4 sticky top-4">
      <h3 className="font-semibold text-tan-100 mb-3">
        On This Page
      </h3>
      <ul className="space-y-2">
        {sections.map(section => (
          <li key={section.id}>
            <a 
              href={`#${section.id}`}
              className="text-tan-300 hover:text-olive-400"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## Do's and Don'ts

### DO's ✅
- Keep paragraphs short (3-4 sentences)
- Use visual aids liberally
- Include practical examples
- Link to related content
- Test all interactive elements
- Optimize for VR readability

### DON'ts ❌
- Don't create walls of text
- Don't use small fonts (<16px)
- Don't forget mobile users
- Don't use unexplained jargon
- Don't ignore accessibility
- Don't publish without review

## External Resources

### Content Writing
- **Markdown Guide**: [markdownguide.org](https://www.markdownguide.org) - Markdown syntax reference
- **Writing for VR**: Best practices for VR text readability

### Component Guides
- **Next.js Image**: [nextjs.org/docs/app/api-reference/components/image](https://nextjs.org/docs/app/api-reference/components/image) - Image optimization
- **MDX**: [mdxjs.com](https://mdxjs.com) - Markdown with JSX (if using MDX)

### SEO
- **Open Graph**: [ogp.me](https://ogp.me) - Social media meta tags
- **Schema.org**: [schema.org](https://schema.org) - Structured data markup
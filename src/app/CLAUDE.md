# Next.js App Router Guidelines

## Directory Structure
```
app/
├── (routes)/              # Route groups for organization
├── api/                   # API routes (if needed)
├── [dynamic]/            # Dynamic routes
├── layout.tsx            # Root layout
├── page.tsx              # Home page
├── globals.css           # Global styles (Tailwind)
├── not-found.tsx         # 404 page
└── error.tsx             # Error boundary
```

## Page Component Pattern
```typescript
// app/items/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Metadata generation for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  
  if (!item) return { title: 'Item Not Found' };
  
  return {
    title: `${item.name} | ExfilZone Assistant`,
    description: item.description,
    openGraph: {
      images: [item.imageUrl],
    },
  };
}

// Static params for build-time generation
export async function generateStaticParams() {
  const items = await getAllItems();
  return items.map((item) => ({
    id: item.id,
  }));
}

// Page component
export default async function ItemPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const item = await getItem(id);
  
  if (!item) {
    notFound();
  }
  
  return <ItemDetail item={item} />;
}
```

## Layout Patterns

### Root Layout
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-tan-100">
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

### Nested Layouts
```typescript
// app/items/layout.tsx
export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ItemsHeader />
      {children}
    </div>
  );
}
```

## Route Organization

### Route Groups
```
app/
├── (main)/               # Main app routes
│   ├── items/
│   ├── guides/
│   └── combat-sim/
├── (auth)/               # Auth routes (if needed)
│   ├── login/
│   └── register/
└── (admin)/              # Admin routes (if needed)
    └── dashboard/
```

### Dynamic Routes
```typescript
// Single dynamic segment
app/items/[id]/page.tsx         // /items/123

// Multiple segments
app/guides/[category]/[slug]/page.tsx  // /guides/combat/basic-tactics

// Catch-all segments
app/docs/[...slug]/page.tsx     // /docs/any/path/here

// Optional catch-all
app/search/[[...query]]/page.tsx // /search or /search/weapons/rifle
```

## Data Fetching Patterns

### Server Components (Default)
```typescript
// Fetch data directly in component
async function ItemsList() {
  const items = await ItemService.getAllItems();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Client Components
```typescript
'use client';

import { useState, useEffect } from 'react';

export function InteractiveFilter() {
  const [filter, setFilter] = useState('all');
  
  // Client-side interactivity
  return (
    <select 
      value={filter} 
      onChange={(e) => setFilter(e.target.value)}
      className="military-select"
    >
      <option value="all">All Items</option>
      <option value="weapons">Weapons</option>
    </select>
  );
}
```

### Mixed Approach
```typescript
// Server component wrapper
export default async function Page() {
  const items = await getItems();
  
  return (
    <div>
      {/* Client component for interactivity */}
      <FilterableItems items={items} />
    </div>
  );
}
```

## Loading & Error States

### Loading UI
```typescript
// app/items/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-military-700 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-military-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Error Handling
```typescript
'use client';

// app/items/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="military-box p-6 border-red-600 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">
          Something went wrong!
        </h2>
        <p className="text-tan-300 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="military-button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

## SEO & Metadata

### Static Metadata
```typescript
export const metadata: Metadata = {
  title: 'Items Database | ExfilZone Assistant',
  description: 'Browse all weapons, equipment, and items',
  keywords: ['exfilzone', 'items', 'weapons', 'equipment'],
};
```

### Dynamic Metadata
```typescript
export async function generateMetadata({ 
  params, 
  searchParams 
}): Promise<Metadata> {
  const data = await fetchData(params.id);
  
  return {
    title: data.title,
    openGraph: {
      title: data.title,
      description: data.description,
      url: `https://exfilzone-assistant.app/${params.id}`,
      images: [
        {
          url: data.image,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}
```

## Performance Optimizations

### Static Generation
```typescript
// Force static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour
```

### Dynamic Rendering
```typescript
// Force dynamic rendering
export const dynamic = 'force-dynamic';
```

### Partial Prerendering
```typescript
// Prerender static parts, stream dynamic
export const experimental_ppr = true;
```

## File Conventions

### Special Files
```
page.tsx        # Page component
layout.tsx      # Layout wrapper
loading.tsx     # Loading UI
error.tsx       # Error boundary
not-found.tsx   # 404 page
route.ts        # API route handler
template.tsx    # Re-rendered layout
```

### Naming Conventions
- Use kebab-case for folders
- Use PascalCase for components
- Dynamic segments use square brackets
- Route groups use parentheses

## Common Patterns

### Search with URL State
```typescript
// app/items/page.tsx
export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const items = await getFilteredItems(params);
  
  return (
    <>
      <SearchFilter defaultValues={params} />
      <ItemsList items={items} />
    </>
  );
}
```

### Infinite Scroll
```typescript
'use client';

export function InfiniteItemsList({ 
  initialItems 
}: { 
  initialItems: Item[] 
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  
  // Load more logic
  const loadMore = async () => {
    const newItems = await fetchItems(page + 1);
    setItems([...items, ...newItems]);
    setPage(page + 1);
  };
  
  return (
    <>
      <ItemGrid items={items} />
      <LoadMoreButton onClick={loadMore} />
    </>
  );
}
```

## API Routes (if needed)

### Route Handler
```typescript
// app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  
  const items = await getItems(category);
  
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Process POST request
  
  return NextResponse.json(
    { success: true },
    { status: 201 }
  );
}
```

## Do's and Don'ts

### DO's ✅
- Use Server Components by default
- Add 'use client' only when needed
- Implement proper loading/error states
- Generate metadata for SEO
- Use generateStaticParams for known routes
- Cache data appropriately

### DON'ts ❌
- Don't use 'use client' unnecessarily
- Don't fetch data in layouts
- Don't use window/document in Server Components
- Don't ignore TypeScript in params/searchParams
- Don't mix Server and Client component logic
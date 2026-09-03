# Services

How data is reached. Four modules, each the only door to one thing.

## `dataFiles.ts` — the door to `public/data`

```typescript
const weapons = await loadDataFile<Weapon[]>('weapons.json');
```

These files are static assets: the browser gets them from the CDN, compressed and cached across
navigations, and they stay out of the JavaScript entirely. `import`ing one instead makes the bundler
inline the same bytes into a JS chunk — which is how the database once shipped twice, 2.0 MB of
`JSON.parse()` spread over 16 client chunks, on top of the copies already in `/data/`.

The server has no origin to fetch a relative URL from during prerender, so it reads from disk
instead; `node:fs` sits behind a dynamic import in a branch the browser never takes. The module
header carries the full account.

## `ItemService.ts` — the item catalogue

Loads every category through `loadDataFile`, then holds the result in a module-level cache:

- `fetchItemsData()` — everything, populating the cache
- `getItemById(id)`, `getItemsByCategory(id)`, `getItemsByCategoryAndSubcategory(id, sub)`
- `searchItems(query)`
- `clearItemsCache()`, `getCacheStatus()` — for the admin health page

Call the query functions rather than filtering `fetchItemsData()` yourself; they share the cache.

## `GunsmithService.ts` — weapon build data

`getGunsmithData()` and `clearGunsmithCache()`, same cache-behind-a-function shape.

## `StorageService.ts` — the reader's own device

Owns every localStorage key, so nothing else names one. Two classes of key, and the difference is
the whole point:

- **Game progress** — tasks, hideout — cleared on a wipe
- **Player-authored content and preferences** — gunsmith builds, cookie consent — preserved

A game-version check runs once per session and drives the wipe; keys nothing writes any more are
removed outright, which is a separate idea from a wipe. Storage is a text file a user can edit, so
everything read back out is validated before use — see the type guards at the top of the file.

Components do not call this directly. Per-route hooks (`useTaskProgress`, `useSavedBuilds`,
`useDensity`) wrap it in `useSyncExternalStore` and expose a `hydrated` flag for SSR.

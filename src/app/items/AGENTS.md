# Items

The catalogue: a filtered list at `/items`, a detail page at `/items/[id]`.

For new item presentations, use the [Cold Steel reuse table](../../../docs/design/README.md#reuse-by-concept)
before adding a card, stats block, rarity treatment or grade. This file owns the route's data and behaviour.

## The URL is the state

Filters are not React state. `ItemsPageContent` reads `useSearchParams()` and derives them through
`parseFilters` in [`utils/filters.ts`](utils/filters.ts):

```typescript
const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
```

Changing a filter pushes a new URL; the render follows from it. That is what makes a filtered view
shareable and survivable across a reload, and it is why nothing here holds a duplicate copy of the
filter state. Add a filter by teaching `parseFilters` about it, not by adding a `useState`.

## Detail pages dispatch on the discriminant

`/items/[id]` renders one shared frame plus a per-category stats block, one component each:
`WeaponSpecificStats`, `AmmunitionSpecificStats`, `ArmorSpecificStats`, `AttachmentSpecificStats`,
`BackpackSpecificStats`, `GrenadeSpecificStats`, `HolsterSpecificStats`, `MedicineSpecificStats`,
`ProvisionsSpecificStats`, `TaskItemsSpecificStats`.

Choose by narrowing on `item.category` — never by casting. A cast past a wrong discriminant does not
throw; it renders a stat block full of `undefined`. `StatLine` is the shared row, so a new stats
component composes it rather than laying out its own.

## Hooks

| Hook | Owns |
|---|---|
| `useDensity` | list density, persisted per reader in localStorage |
| `useTradeIndex` | the barter/offer index, so rows can price without each fetching |
| `useWeaponBuild` | the build a weapon page is previewing |

`useDensity` is a preference, not progress, so it survives a wipe.

## Grouping and charts

`weaponFamilies.ts` groups receivers with their variants so the list shows a family once rather than
eight near-identical rows; `WeaponFamilyGroup` renders that. `BallisticCurveChart` draws damage and
penetration over distance from the ammo's own curves — the same curves the simulator reads, so a
disagreement between chart and simulator is a bug in one of them, not two models.

## Data

Through `ItemService`, which caches. Do not call `loadDataFile` here directly, and do not filter
`fetchItemsData()` by hand when a query function already exists — see
[services](../../services/AGENTS.md).

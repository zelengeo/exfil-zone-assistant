# Types

Hand-written types for the game data. Everything request-shaped is inferred from a zod schema in
`lib/schemas/` instead — see [Critical rule 4](../../AGENTS.md).

`tasks.ts` is the exception in both directions: the published task shape is **inferred** from
`lib/schemas/task.ts` and only re-exported here, because that schema also validates
`public/data/tasks.json` when `TaskService` loads it. The progress shapes below the re-exports are
hand-written, being this app's own idea with nothing published to validate against.

## The files

| File | Owns |
|---|---|
| `items.ts` | the catalogue: every item category, calibers, curves, armour and ammo properties |
| `tasks.ts` | `Task`, `TaskMap`, `TaskType` (re-exported from the schema), progress shapes |
| `trade.ts` | `BuyOffer`, `TradeStats`, `VendorKey`, `VENDOR_ORDER` |
| `gunsmith.ts` | saved builds, parts, slots |
| `guides.ts`, `community.ts` | content metadata |

## Items narrow on `category`

`Item` is the base — id, name, `category: string`, `subcategory: string` — and each concrete type
extends it while narrowing the discriminant to a literal:

```typescript
export interface Weapon extends Item { category: 'weapons'; /* ... */ }
export interface Ammunition extends Item { category: 'ammo'; /* ... */ }
```

Narrow on `category` (and on `subcategory` for attachments and gear, which split further). Do not
cast: a cast past a wrong discriminant is how a field reads `undefined` three components later.

## Const arrays, not enums

Fixed vocabularies are `as const` arrays with the union derived from them, so the values stay
iterable at runtime:

```typescript
export const CALIBERS = [...] as const;
export type Caliber = typeof CALIBERS[number];
```

Add a value to the array, and the union follows.

## Optional means the data is uneven

An optional field usually records that only some items carry it, not that it is unimportant.
`damageAtRange` is present only on rounds that were on the published wiki; `protectiveData` only on
gear with curated per-bone data, since head gear protects through `coneRegions` instead. Check
before assuming, and prefer the path that works without it.

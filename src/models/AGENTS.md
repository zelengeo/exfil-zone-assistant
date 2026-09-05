# Database Models

Four active Mongoose models. Everything else the app knows is static data, not database rows.

| Model | Holds | Owned by |
|---|---|---|
| `User` | profile, roles, ban state, contribution stats | the app |
| `Account` | OAuth provider links | the app's OAuth sign-in flow |
| `DataCorrection` | reader-submitted corrections and their review | the app |
| `Feedback` | bug reports and requests, and their triage | the app |

The app uses JWT sessions and no database adapter. `Session.ts` is a commented-out legacy
placeholder, not a registered model. OAuth identity code reads and writes `Account` directly.

## The re-registration guard

```typescript
export const User = models.User || model('User', UserSchema);
```

Every model ends this way. Without it, a hot reload in development and a warm lambda in production
both try to register the same model twice, and Mongoose throws `OverwriteModelError`. It is not
optional, and it is not a style choice.

## Indexes live with the schema

Each model declares its own indexes immediately after the schema, with a comment saying which query
they serve. `npm run db:sync` pushes them to Atlas — a new index is not live because it was
committed.

`User` carries compound indexes on `_id` with `isBanned` and `roles` because the auth path reads
exactly those fields on nearly every request; the three-field one is a covering index for the full
check. Sparse indexes on `reviewedBy` keep the unreviewed majority out of the index.

## Types come from zod, not from Mongoose

Do not infer a type from a schema definition. The authoritative shape is in `lib/schemas/`, and
`userDocumentSchema` and its siblings are what routes validate against and return. A Mongoose
document is an implementation detail on the way there.

## Reading

`.lean()` on every read that does not need a document's methods, and `.select()` the fields the
route actually returns. The auth helpers already do both — see [lib](../lib/AGENTS.md).

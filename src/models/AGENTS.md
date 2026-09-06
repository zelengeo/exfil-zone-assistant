# Database Models

Three active Mongoose models. Everything else the app knows is static data, not database rows.

| Model | Holds | Owned by |
|---|---|---|
| `User` | profile, roles, ban state, contribution stats | the app |
| `Account` | OAuth provider links — identity only, no tokens | the app's OAuth sign-in flow |
| `Feedback` | bug reports and requests, and their triage | the app |

`Account.userId`, `Feedback.userId` and `Feedback.reviewerNotes[].addedByUserId` all reference
`User`. What happens to each of them when an account is deleted is one recorded policy, in
[api](../app/api/AGENTS.md#account-deletion) — do not answer that question again per route.

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
they serve. A new index is not live because it was committed.

`npm run db:sync` **previews** by default: it prints the target — host and database, never
credentials — and the create/drop diff, and writes nothing. `npm run db:sync -- --apply` performs
the changes, then verifies the unique constraints identity depends on (`User.email`,
`User.username`, `Account.provider` + `providerAccountId`) and exits nonzero if any is absent or
non-unique. Preview is the default because `syncIndexes` **drops** anything not in the schema.

**Do not add an `_id`-prefixed compound index.** An equality match on `_id` resolves through IDHACK
against the default `_id_` index and returns at most one document, so such an index is never a
candidate. `User` carried three of them, justified as covering the auth path; explain on the real
auth query — `findById().select('isBanned roles username')` — reports IDHACK, 1 key examined and
**0 rejected plans**, meaning the planner never considered them. They were removed on 2026-09-06
(audit B11), along with a `Feedback` index on `reviewedBy`/`reviewedAt`, neither of which is a field
that schema declares.

An index whose comment explains a query nobody runs is the failure mode to watch for here: it costs
writes and storage silently, and the comment makes it look considered.

## Types come from zod, not from Mongoose

Do not infer a type from a schema definition. The authoritative shape is in `lib/schemas/`, and
`userDocumentSchema` and its siblings are what routes validate against and return. A Mongoose
document is an implementation detail on the way there.

## Reading

`.lean()` on every read that does not need a document's methods, and `.select()` the fields the
route actually returns. The auth helpers already do both — see [lib](../lib/AGENTS.md).

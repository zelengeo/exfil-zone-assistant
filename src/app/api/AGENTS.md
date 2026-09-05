# API Routes

Route handlers. Everything they need is in [lib](../../lib/AGENTS.md); this describes the shape they
all share.

## The endpoints

| Path | Gate |
|---|---|
| `auth/[...nextauth]` | — |
| `user`, `user/update`, `user/update-username`, `user/check-username` | `requireAuth` |
| `user/[username]` | public profile |
| `feedback` | `requireAuth` |
| `admin/feedback/[id]` | `requireAdmin` |
| `admin/users`, `admin/users/[id]`, `admin/users/[id]/roles` | `requireAdmin` |
| `admin/health` | `requireAdmin` |
| `rate-limit/status` | — |

The correction endpoints were removed on 2026-09-05 (audit B12). `feedback` still stores rows of
type `data_correction` from before the retirement and must keep rendering them, but
`submittableTypeEnum` keeps new ones out — a POST naming that type is a 400.

## The shape of a handler

```typescript
export async function PATCH(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const { user } = await requireAdmin();
            await connectDB();

            const data = UserApi.Patch.Request.parse(await request.json());
            const updated = await doTheWork(data);

            return NextResponse.json<IUserApi['Patch']['Response']>({ user: updated });
        } catch (error) {
            return handleError(error);
        }
    });
}
```

Five things in that order, every time: rate limit, gate, connect, parse, respond. The gates throw,
so there is no branching on their result; `handleError` is the only thing that formats an error, so
routes never build a status code by hand.

## Transactions

Authenticate and validate before allocating a database session, and always await `connectDB()`
before `mongoose.startSession()`. Keep session creation inside the handler's `try`, hold the session
as nullable until creation succeeds, and end every created session exactly once. End-session
failures are logged separately and must not replace the original API error or a successful
committed response.

Prefer `session.withTransaction(...)`, which commits, aborts and retries transient failures on its
own — `account-deletion.ts` and `oauth-sign-in.ts` both use it. A hand-rolled
`startTransaction`/`commitTransaction` pair additionally has to abort only when `inTransaction()`
is true, and log an abort failure without replacing the original error.

Every read and write that participates carries the session. A query that omits it runs outside the
transaction and is not rolled back, which is not visible in a test with mocked persistence — that
is what the replica-set suite is for.

## Account deletion

Both entry points — `user` DELETE for self-service and `admin/users/[id]` DELETE — go through
`deleteUserAccount` in [lib/auth/account-deletion.ts](../../lib/auth/account-deletion.ts). The
routes own their gates; the operation owns the connection, the session and the writes, so the two
paths cannot drift apart again. A route that needs to refuse a particular target passes a guard,
which runs inside the transaction against the freshly read user row.

The policy, decided 2026-09-05:

| Record | On deletion |
|---|---|
| `User`, `Account` | hard deleted — there is no soft-delete flag anywhere in the app |
| `Feedback` authored by the account | kept, `userId` unset |
| `Feedback.reviewerNotes[].addedByUserId` | kept, attribution unset for that account's notes only |
| `datacorrections` rows | unreachable — model removed; `npm run db:retire-corrections` erases them |

Anonymization removes references and adds nothing. The pre-fix self-service path pushed a note
naming the account it had just deleted, which re-identified the row it was anonymizing; the admin
path set `isAnonymous`, a field `Feedback` does not declare, so strict mode dropped it silently.
Neither is a mistake to repeat: write only to declared fields, and never name the deleted account.

`account-deletion.integration.test.ts` is the proof that the rollback is real. It runs only when
`MONGODB_URI` is the loopback replica set, which `npm run verify:local` supplies.

## Validation

Parse with the endpoint's own schema from `lib/schemas/`, never with an ad-hoc object. Type the
response with the matching inferred type so a schema change breaks the route at compile time rather
than in production.

Anything a reader typed goes through `sanitizeUserInput` before it reaches the database.

## Gates

`requireAuth` reads the session token; `requireAuthWithUserCheck`, `requireAdmin` and
`requireAdminOrModerator` read the user row. Roles and ban state on the token can be stale, so any
route acting on them — not merely sitting behind them — needs a form that hits the database.

## OAuth identity

Provider plus provider account id is the canonical sign-in identity. Existing links resolve their
user before considering email. A new Google or Discord link requires the provider-specific email
verification claim, then normalizes email for cross-provider linking and admin bootstrap. User and
Account creation share one transaction; duplicate-key races retry from the canonical stored link.

## Session refresh

The JWT `update` callback treats the update payload as untrusted and uses it only as a refresh
signal. It preserves the token's existing subject and replaces profile, role and ban claims from
the matching user row. A missing user throws so NextAuth clears the session cookie.

When deploying the 2026-09-05 B01 fix, rotate `NEXTAUTH_SECRET` once in every deployed environment
to revoke tokens issued while client input could replace the subject. A code deployment alone does
not invalidate those tokens.

## Rate limiting

`'auth'` is the strict tier, `'api'` the ordinary one. The backend is Vercel KV only in production
with both KV variables set, and in-memory otherwise — so a limit that holds in development proves
nothing, and the in-memory store is per-lambda.

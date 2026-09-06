# Backend Utilities

Everything the API routes and the game logic share. The directory splits in a way its name does not
advertise, and knowing which half you are in saves reading the wrong file:

- **Request plumbing** — `auth/`, `schemas/`, `rate-limit/`, `errors.ts`, `middleware.ts`,
  `mongodb.ts`, `logger.ts`, `user.ts`, `utils.ts`
- **Game logic** — `gunsmith/`, `protection/`, `gates.ts`, `trade.ts`, `vendors.ts`. Pure, data-fed,
  and the part with tests.

## Auth

Four gates in `auth/utils.ts`, each **throwing** rather than returning an error, so a route reads as
a straight line and the catch does the work:

| Gate | Costs | Use for |
|---|---|---|
| `requireAuth()` | session only | anything signed-in |
| `requireAuthWithUserCheck()` | a database read | when roles or ban state must be current |
| `requireAdmin()` | a database read | admin routes |
| `requireAdminOrModerator()` | a database read | moderation routes |

The session copy of roles and ban state can be stale — it is a token. Reach for the `WithUserCheck`
form whenever acting on that state rather than merely reading behind it.

## Errors

`errors.ts` carries the class hierarchy and the one translator. Throw a class; let `handleError`
turn it into a response.

| Class | Status |
|---|---|
| `ValidationError` | 400 |
| `AuthenticationError` | 401 |
| `AuthorizationError`, `BannedUserError`, `InsufficientPermissionsError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |
| `RateLimitError` | 429 |
| `AppError` | 500 |

`handleError(error)` also understands `ZodError`, and hides detail in production. Every route ends
in `catch (error) { return handleError(error); }` — nothing else formats an error response. It
accepts `unknown`, including a thrown `null` or string, because reading `.message` off one used to
crash the handler itself.

A duplicate-key violation becomes a 409 naming the field but never the colliding value.
`isDuplicateKeyError` matches structurally on `code === 11000` rather than on a class: the installed
driver throws `MongoServerError`, which is **not** a `MongooseError` and is not named `MongoError`,
so the old class-based guard sent every uniqueness conflict to 500. A pre-check like
`update-username`'s cannot close that race; the unique index decides and this is how the loser is
reported.

Read a JSON body with `parseJsonBody(request)` from `lib/request.ts`, never `request.json()`
directly — it turns a malformed body into a 400. It is a separate boundary on purpose: catching
`SyntaxError` inside `handleError` would reclassify a genuine bug in our own code as the caller's
mistake, so a `SyntaxError` from anywhere else still reports 500.

## Schemas are the source of truth for types

Never hand-write a type that a schema can infer. Each file in `schemas/` exports an `XApi` object of
per-endpoint schemas and an `IXApi` of types inferred from it:

```typescript
const data = UserApi.Patch.Request.parse(body);
return NextResponse.json<IUserApi['Patch']['Response']>({ user });
```

`core.ts` holds the shared pagination, success and error shapes; the rest are per entity
(`user`, `feedback`, `task`), with `guards.ts` for runtime narrowing.

## Rate limiting

`rate-limit/rate-limit-factory.ts` picks the backend: Vercel KV **only** when `NODE_ENV` is
production and both `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set, otherwise an in-memory
limiter. Development is always in-memory, so a limit that holds locally proves nothing about
production — and the in-memory store is per-instance, which on serverless is per-lambda.

Wrap a handler with `withRateLimit(request, handler, policy)`, where `policy` is a key of
`RATE_LIMIT_CONFIGS`. Inline config objects are not accepted: a counter is namespaced by its policy
name, and an anonymous object has none. Add a named policy instead.

**Counters are keyed `rl:<policy>:<caller>:<window>`, built in one place —** `resolveWindow` in
`rate-limit.ts`, which both backends call. Two policies sharing an interval used to share a counter,
so `feedbackGetAuthenticated` (60/hour) and `feedbackPostAuthenticated` (30/hour) collided for the
same user: memory sized the shared bucket from whichever policy arrived first, KV compared one count
against both caps. Sharing an allowance now requires deliberately passing the same policy name.

Both backends admit identically: increment, then compare the running count to the cap passed on
*this* call. Memory expires a counter at its own window end rather than after a fixed hour — the old
cutoff silently reset the daily and weekly policies. KV increments and sets expiry in one pipeline,
with a TTL of the time left in the window, so a counter can never be left without one.

A route that limits signed-in and anonymous callers differently passes the matching policy itself,
as `feedback` does. There is no automatic substitution in the middleware.

**Coverage is enforced by a test, not by discipline.** `rate-limit/coverage.test.ts` walks
`app/api/**/route.ts` and every `'use server'` `actions.ts`, and fails when a handler ships without
a policy or names one that does not exist. A server action is a POST endpoint with a generated URL,
not an internal call, so it needs a policy too — `enforceRateLimit(policy)` throws instead of
returning a response, which is what a server action can use. The NextAuth catch-all is the one
allowed exception: it reaches the limiter directly, because `middleware.ts` imports `authOptions`
from it and the other direction would close an import cycle. There, only sign-in *initiation* is
limited; `session`, `csrf` and `callback` are ordinary login traffic and throttling them breaks
logins rather than abuse.

**Who a caller is.** A signed-in caller is their user id — the only identity here that cannot be
forged. Everyone else is their client address, taken from `RATE_LIMIT_TRUSTED_IP_HEADER` if set,
otherwise `x-forwarded-for` then `x-real-ip`, normalized so a varying source port cannot buy extra
buckets. A forwarded header is a claim, not a fact: it is only as good as an ingress that overwrites
what the client sent. Confirm the header for the actual host before calling anonymous limits
abuse-resistant. Callers with no usable address share one `ip:unknown` bucket, deliberately — the
alternative is an unlimited unidentified caller.

## When the limiter cannot answer

Every policy declares `failClosed`. Anything that mutates or authenticates refuses with a **503**
when the backend is unavailable, so an outage cannot be used as a way around the limit; reads stay
open so an outage degrades the site instead of taking it down. A backend failure is never reported
as a 429 — that would tell a reader to slow down for a fault that is ours.

`getRateLimiterSelection()` reports which backend is live and whether production fell back to
memory. That fallback still serves — refusing every request is worse than a weak limit — but it is
**not** a healthy state: a cold start logs an error and `/admin/health` shows the limiter as
`misconfigured`. KV has never been provisioned for this project, so that is the current production
state by choice, and the health view is where it stays visible.

## Database

`connectDB()` shares one in-flight Mongoose connection promise across callers. Every caller receives
the same success or failure, and a failed attempt clears the promise so a later request can retry.
Mongoose's driver owns reconnect behavior; do not add polling waiters or application reconnect
timers. Call `connectDB()` at the top of any route that touches the database. Prefer `.lean()` for
reads, and `.select()` the fields you need.

## Utilities

`utils.ts` is small and worth knowing by heart: `cn()` for Tailwind class composition, and
`sanitizeUserInput` / `sanitizeFieldName` / `sanitizeSearchQuery` for anything a user typed.

## Gotchas

- **There is no `constants.ts`.** Roles are `rolesEnum` in `schemas/user.ts`; rate limits are
  arguments at the call site. Do not add a constants file to hold a single value.
- **`gates.ts` does no join any more, and must not grow one back.** The goods data names tasks by
  their in-game id while the tasks route routes on the wiki id, and this file used to reconcile the
  two against the whole task database — which put 431 KB of tasks in the items and gunsmith bundles
  to name a gate. An offer now carries its task's id, name and corp, resolved by the extraction at
  publish time. A spec asserts the module has no value imports at all. The failure this guards
  against is silent, because an unresolved gate still renders as a legible id: the join was dead for
  a whole season before anyone noticed. `npm run validate-data` is the alarm now, and it checks the
  published files rather than a join.
- **`vendors.ts` is the one description of the six shop fronts.** The answer used to live at three
  call sites in three vocabularies, one of them missing the gunsmith. See `CONTEXT.md` for the
  vocabulary itself. It writes the six rows out rather than reading them from `corps` in
  `@/data/tasks`, and that is load-bearing: `corps` is six rows inside a 431 KB module, so the
  import dragged all 227 tasks into the client bundle of every route that names a vendor. A spec in
  `vendors.test.ts` compares the copy against `corps` so it cannot drift, and another asserts the
  import stays gone.


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
in `catch (error) { return handleError(error); }` — nothing else formats an error response.

## Schemas are the source of truth for types

Never hand-write a type that a schema can infer. Each file in `schemas/` exports an `XApi` object of
per-endpoint schemas and an `IXApi` of types inferred from it:

```typescript
const data = UserApi.Patch.Request.parse(body);
return NextResponse.json<IUserApi['Patch']['Response']>({ user });
```

`core.ts` holds the shared pagination, success and error shapes; the rest are per entity
(`user`, `dataCorrection`, `feedback`, `task`), with `guards.ts` for runtime narrowing.

## Rate limiting

`rate-limit/rate-limit-factory.ts` picks the backend: Vercel KV **only** when `NODE_ENV` is
production and both `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set, otherwise an in-memory
limiter. Development is always in-memory, so a limit that holds locally proves nothing about
production — and the in-memory store is per-instance, which on serverless is per-lambda.

Wrap a handler with `withRateLimit(request, handler, 'api' | 'auth')`; `'auth'` is the stricter tier.

## Database

`connectDB()` is a singleton over the Mongoose connection, cached across lambda invocations. Call it
at the top of any route that touches the database. Prefer `.lean()` for reads, and `.select()` the
fields you need.

## Utilities

`utils.ts` is small and worth knowing by heart: `cn()` for Tailwind class composition, and
`sanitizeUserInput` / `sanitizeFieldName` / `sanitizeSearchQuery` for anything a user typed.

## Gotchas

- **There is no `constants.ts`.** Roles are `rolesEnum` in `schemas/user.ts`; rate limits are
  arguments at the call site. Do not add a constants file to hold a single value.
- **`gates.ts` joins on `gameId`, not `id`.** The goods data names tasks by their in-game id while
  the tasks route routes on the wiki id. The join has been dead before and fails silently, because
  an unresolved gate still renders as a legible id. `src/lib/gates.test.ts` is the alarm.
- **`vendors.ts` is the one description of the six shop fronts.** The answer used to live at three
  call sites in three vocabularies, one of them missing the gunsmith. See `CONTEXT.md` for the
  vocabulary itself.

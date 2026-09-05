# Admin

Five pages behind one gate. Moderation of reader submissions, plus a health view.

| Page | Does |
|---|---|
| `/admin` | dashboard |
| `/admin/feedback` | triage bug reports and requests |
| `/admin/users`, `/admin/users/[id]/edit` | list, edit, ban |
| `/admin/roles` | grant and revoke roles |
| `/admin/health` | database and rate-limiter status |

## The gate

`layout.tsx` awaits `requireAdmin()` before rendering anything, and translates the two failures
differently: `AuthenticationError` redirects to sign-in with a callback, `AuthorizationError`
redirects to `/unauthorized`, and anything else rethrows. Every admin API route repeats
`requireAdmin()` for itself — the layout guards the view, not the data.

## Roles

Five, from `rolesEnum` in `lib/schemas/user.ts`: `user`, `contributor`, `moderator`, `partner`,
`admin`. Roles are an array on the user, not a single field, so a user can hold several.

**There is no hierarchy.** A `ROLE_HIERARCHY` map and a `canAssignRole` check exist in
`api/admin/users/[id]/roles/route.ts` but are commented out, so any admin can assign any role
including admin. Treat that as the current behaviour rather than an oversight to code around.

## Corrections are gone

`/admin/corrections`, the correction APIs, the `DataCorrection` model and its schemas were removed
on 2026-09-05 (audit B12). The queue was unread, and its DELETE endpoint let any signed-in reader
delete another reader's submission (audit B03), so retirement closed that rather than gating it.

`data_correction` survives in the feedback `typeEnum` because historical rows still have to parse
and render. It is absent from `submittableTypeEnum`, so a new one cannot be created. Do not "tidy"
it out of `typeEnum` — that breaks reading every stored row of that type.

The `datacorrections` collection is not dropped by the code change. `npm run db:retire-corrections`
is the operator action that erases it — dry run by default, see the root `AGENTS.md`.

## Feedback

Statuses are `new`, `in_review`, `accepted`, `rejected`, `implemented`, `duplicate`; priorities are
`low`, `medium`, `high`, `critical`, defaulting to `medium`. Reviewer notes are an **array**, so
review is a running log rather than one overwritten field — append, never replace.

## Health

Two checks, run together: `checkDatabaseHealth` and `checkRateLimiterHealth`. The rate-limiter check
writes a real key through the live limiter, so in development it exercises the in-memory backend and
says nothing about KV. Database health reports ping latency and database stats when the configured
MongoDB role exposes them. It omits unavailable metrics; Mongoose connection-object counts are not
socket-pool usage and must not be presented as capacity.

## Writing an admin page

Server component, `requireAdmin()`, `connectDB()`, then a client child for the interactive table.
Lists paginate through the endpoint's own request schema rather than fetching everything and slicing
in the browser. Everything else is the ordinary route shape — see [api](../api/AGENTS.md).

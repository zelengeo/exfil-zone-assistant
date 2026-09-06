# Admin

Admin pages share one layout gate. Moderation of reader submissions, plus a health view.

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
redirects to `/unauthorized`, and anything else rethrows. APIs and server actions authorize each
call independently. Health GET and role GET accept moderators too, although this layout remains
admin-only. The complete method/gate inventory is in [api](../api/AGENTS.md#the-endpoints).

## Roles

Five, from `rolesEnum` in `lib/schemas/user.ts`: `user`, `contributor`, `moderator`, `partner`,
`admin`. Roles are an array on the user, not a single field, so a user can hold several.

**There is no hierarchy.** A `ROLE_HIERARCHY` map and a `canAssignRole` check exist in
`api/admin/users/[id]/roles/route.ts` but are commented out, so any admin can assign any role
including admin. Treat that as the current behaviour rather than an oversight to code around.

User profile and role edits go through `lib/auth/admin-user-mutations.ts`, including generic PATCH
and the edit server action. Deletion uses `account-deletion.ts`; feedback moderation remains in
its route. Actual role changes cannot target self or an existing admin. The edit form
sends unchanged roles with profile fields too; those roles are omitted from the write, so an admin
can still edit their own profile or another admin's profile. A stale role snapshot returns a
conflict instead of overwriting a concurrent promotion. Validators, mutation logging and error
messages are shared across entry points.

## Corrections are gone

`/admin/corrections`, the correction APIs, the `DataCorrection` model and its schemas were removed
on 2026-09-05 (audit B12). The queue was unread, and its DELETE endpoint let any signed-in reader
delete another reader's submission (audit B03), so retirement closed that rather than gating it.

`data_correction` survives in the feedback `typeEnum` because historical rows still have to parse
and render. It is absent from `submittableTypeEnum`, so a new one cannot be created. Do not "tidy"
it out of `typeEnum` — that breaks reading every stored row of that type.

The `datacorrections` collection is not dropped by the code change. `npm run db:retire-corrections`
is the operator action that erases it — dry run by default, see
[operations](../../../docs/BACKEND_OPERATIONS.md#historical-data-cleanup).

## Feedback

Statuses are `new`, `in_review`, `accepted`, `rejected`, `implemented`, `duplicate`; priorities are
`low`, `medium`, `high`, `critical`, defaulting to `medium`. Reviewer notes are an **array**, so
review is a running log rather than one overwritten field — append, never replace.

## Health

Two checks run together: database and rate limiter, followed by process memory/environment data.
Health requests use the fail-open `healthCheck` policy; the probe uses a separate caller on that
policy. Neither consumes admin mutation quotas. When production falls back to memory, health
reports `misconfigured` without probing. Otherwise it exercises the selected backend; development
memory results say nothing about KV.

Database authorization still needs MongoDB, so this endpoint cannot diagnose a complete database
outage independently. Ping measures connectivity, not transaction or index readiness. Stats are
omitted if collection listing fails; if only `db.stats()` fails, the current response contains
fallback zero size/index figures. Treat those as unavailable, not measured zero. Socket-pool
capacity is not reported. Recovery checks and HTTP/status interpretation live in
[operations](../../../docs/BACKEND_OPERATIONS.md#health-and-outage-recovery).

## Writing an admin page

Server component, `requireAdmin()`, `connectDB()`, then a client child for the interactive table.
Lists paginate through the endpoint's own request schema rather than fetching everything and slicing
in the browser. Everything else is the ordinary route shape — see [api](../api/AGENTS.md).

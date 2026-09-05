# Admin

Six pages behind one gate. Moderation of reader submissions, plus a health view.

| Page | Does |
|---|---|
| `/admin` | dashboard |
| `/admin/corrections` | review submitted data corrections |
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

## Corrections

Entity types are `item`, `task`, `npc`, `location`, `quest`; statuses are `pending`, `approved`,
`rejected`, `implemented`. Note that `approved` and `implemented` are separate: approving accepts
the report, implementing records that the published data actually changed. A correction can sit
approved for as long as the next data extraction takes.

Submissions may be anonymous — `userId` is optional — so nothing in the review path may assume a
user to credit.

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

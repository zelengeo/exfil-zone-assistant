# API Routes

Route handlers. Everything they need is in [lib](../../lib/AGENTS.md); this describes the shape they
all share.

## The endpoints

| Path | Gate |
|---|---|
| `auth/[...nextauth]` | — |
| `user`, `user/update`, `user/update-username`, `user/check-username` | `requireAuth` |
| `user/[username]` | public profile |
| `corrections`, `corrections/[id]` | `requireAuth` to submit |
| `feedback` | `requireAuth` |
| `admin/corrections`, `admin/corrections/[id]` | `requireAdmin` |
| `admin/feedback/[id]` | `requireAdmin` |
| `admin/users`, `admin/users/[id]`, `admin/users/[id]/roles` | `requireAdmin` |
| `admin/health` | `requireAdmin` |
| `rate-limit/status` | — |

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

## Validation

Parse with the endpoint's own schema from `lib/schemas/`, never with an ad-hoc object. Type the
response with the matching inferred type so a schema change breaks the route at compile time rather
than in production.

Anything a reader typed goes through `sanitizeUserInput` before it reaches the database.

## Gates

`requireAuth` reads the session token; `requireAuthWithUserCheck`, `requireAdmin` and
`requireAdminOrModerator` read the user row. Roles and ban state on the token can be stale, so any
route acting on them — not merely sitting behind them — needs a form that hits the database.

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

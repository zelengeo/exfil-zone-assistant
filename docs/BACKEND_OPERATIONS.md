# Backend operations

Checked against repository code and local verification on 2026-09-06. Production state is
unverified. Use this for deployment, index changes, data cleanup, session revocation and recovery.
The [audit](BACKEND_AUDIT_2026-09-05.md) retains the original findings; the
[implementation tracker](BACKEND_AUDIT_2026-09-05_ISSUES.md) records each disposition and test.

## Environment and ownership

The deployment operator owns production environment variables and provider/Atlas/KV access.
`.env.example` names the configuration. Development uses `.env.local`; the database scripts load
it without replacing an already-set process variable. Confirm the process target before running a
database command. The `:local` wrappers override only child-process `MONGODB_URI` with loopback
port 27018; they do not edit `.env.local`.

The three registered models are User, Account and Feedback. Account holds provider linkage only.
Sessions are JWTs; there is no active database adapter or Session model. Published game data and
player progress do not depend on MongoDB. See the [method/gate inventory](../src/app/api/AGENTS.md#the-endpoints)
before changing access policy, and [model guidance](../src/models/AGENTS.md) before index changes.

Never copy secrets or full connection strings into an audit record. Record environment, host,
database name, deployment revision, time, operator and command exit status. Migration output can
contain record IDs and feedback titles; keep it in restricted operational records. Application
logs can contain sign-in emails and deleted-account identifiers; database anonymization does not
erase logs or backups. Their retention/access rules require an operator decision.

## Local setup and verification

1. Start Docker, install the locked dependencies, and supply the development variables from
   `.env.example`. Run `npm run db:prepare:local`. Completion means Compose reports healthy,
   bootstrap verifies the three identity unique indexes, and the transaction probe commits.
2. Run `npm run verify:local`. It stops at the first failed gate; a successful database preparation
   does not mean lint, tests or build passed. When an existing failure stops it, record that failure
   and run the remaining gates separately with the same loopback URI.
3. For an explicitly local PowerShell shell, the following process override also enables the
   integration suites. It lasts only for this shell and its children:

   ```powershell
   $env:MONGODB_URI = 'mongodb://127.0.0.1:27018/exfil-zone-assistant?replicaSet=rs0&directConnection=true'
   npm run db:sync
   npm test
   npm run type-check
   npm run validate-data
   npm run build
   ```

Inspect each exit code. `db:sync` here is a read-only preview. Repeated preview must leave documents,
collections and indexes unchanged; `scripts/index-rollout.integration.test.ts` checks this against
fresh and populated disposable databases. B04/B05 reconnect and cold-handler tests live in
`src/lib/auth/backend-smoke.integration.test.ts`; the remaining suites cover rollback, identity,
ban/privacy rules, role-policy parity, errors and limiter behavior.

Compose publishes MongoDB only on `127.0.0.1:27018`. The database has no local authentication;
loopback binding is the boundary, so do not expose this Compose stack as production infrastructure.
`npm run db:ui` explicitly enables mongo-express on `127.0.0.1:8081`; its example Basic Auth
credentials are local conveniences. `npm run db:down` stops/removes this Compose project's
containers and network while retaining its named volume. Keep existing volumes when troubleshooting.

## Command effects

| Command | Target and effects | Success/failure boundary |
|---|---|---|
| `db:prepare:local` | Loopback Compose startup, missing indexes created, temporary transaction collection written/dropped | Stops on failed child command |
| `db:bootstrap` | Only `mongodb://localhost:27018` or `127.0.0.1:27018`; creates indexes, no deliberate drops | Rejects other targets; nonzero if any identity constraint is absent |
| `db:test` | Configured URI, ping only | Nonzero on connection/ping failure; does not verify indexes |
| `db:test:local` | Loopback; creates a UUID-named probe collection, commits insert/read/delete, then drops it | Nonzero on failed replica-set/transaction checks; cleanup drop errors are suppressed |
| `db:sync` | Configured URI; prints credential-free host/database and index create/drop diff | Read-only preview; exit zero does not prove required indexes already exist |
| `db:sync -- --apply` | Configured URI; creates and drops indexes across three models | Nonzero on any model failure or missing required unique constraint; partial changes may remain |
| `db:retire-corrections` | Configured URI; reports historical data and deletion leftovers | Dry run; nonzero on operational failure, not on reported leftovers |
| `db:retire-corrections -- --apply --confirm=<database>` | Drops `datacorrections`, pulls identifying deletion notes, reports remaining references | Exact connected database name required; separate steps are not one transaction |
| `db:strip-oauth-tokens` | Configured URI; counts documents per unused credential field | Dry run; values are never printed by the report |
| `db:strip-oauth-tokens -- --apply --confirm=<database>` | Unsets credential fields in `accounts`; preserves identity linkage | Exact database name required; nonzero on error; repeat preview verifies nothing remains |

Prefix each command above with `npm run`. `<database>` is a placeholder to replace, not shell
syntax to paste literally. The cleanup scripts print the connected database name but not its host;
confirm the host separately from the configured URI before applying. Database-name confirmation
alone cannot distinguish two environments with the same name.

## Deployment and session revocation

1. Record the intended revision and environment. Verify the database target, replica-set transaction
   support, reviewed indexes and recovery point before enabling traffic. Verify provider callback
   origins and `NEXTAUTH_URL` match the environment. Production credentials belong in the deployment
   secret store; verify presence and ownership without copying values into this document.
2. Apply the reviewed index rollout below. Deploy all identity, authorization and retention fixes
   together with a newly generated `NEXTAUTH_SECRET` in every affected environment. Replace all old
   instances; an old instance with the old secret can still accept a pre-fix JWT.
3. Using controlled test accounts, confirm an old session requires sign-in, ordinary users fail
   admin gates, and fresh Google/Discord sign-ins and session refresh succeed. Verify a newly banned
   account cannot mutate profile/username/feedback, while self-deletion remains available. Check
   public/private profile responses as owner and anonymous reader, and retired correction routes.
4. Record the revision, rollout time and results. B01 remains open operationally until revocation is
   verified. Do not restore the old secret during rollback: that re-enables the compromised-token
   population. Use a known-good revision containing the identity fixes and retain the rotated secret.

B02 also needs a historical provider-link review. Current rows cannot prove that a link created
under the old email-first policy was legitimate. Preserve a restricted recovery snapshot, inventory
links using provider identity and available historical evidence, and have the operator approve a
specific recoverable repair/reset plan. The token-stripping migration does not repair links.

## Index rollout and recovery

1. Confirm the non-secret host/database target and capture the existing index specifications,
   including keys and options. Verify backup/recovery readiness and inspect production query plans
   for proposed removals. Local MongoDB 7 explain evidence is not a production measurement.
2. Run `npm run db:sync`. Review every create/drop. A new non-local database also uses this workflow;
   `db:bootstrap` is deliberately restricted to loopback. Keep traffic disabled until identity
   indexes are verified. The app uses `autoIndex: false`, so deployment alone does not create them.
3. With the target and diff approved, run `npm run db:sync -- --apply`. Completion requires exit zero
   and unique `users.email_1`, `users.username_1`, and `accounts.provider_1_providerAccountId_1`.
   Re-run preview and retain the result. The implementation checks names and `unique`; inspect the
   actual key/options as part of operator verification.
4. If creation fails on duplicate data, pause the rollout and resolve the conflicting identities
   through an approved data-repair plan. Never discard arbitrary accounts to make the index build
   pass. If any model fails, inspect actual indexes: earlier models may already have changed.
5. Recover a removed index from the captured definition when needed, then rerun preview and
   constraint verification. A code rollback does not restore indexes. If missing constraints could
   permit duplicate identity writes, keep auth/account writes unavailable until repaired.

## Historical data cleanup

Apply after the fixed deployment stops creating the retired data. First establish an approved
recovery point and verify the target; then run each dry run and review its effects. Production
application is an operator action, separate from local implementation and this documentation pass.

`db:retire-corrections` has three steps: erase the retired collection, remove notes matching
`^User account deleted - `, and report orphaned authored-feedback references and users without OAuth
links. Step 3 never repairs or deletes those rows. Review them individually: lack of a link alone
does not establish the historical cause. Genuine reviewer notes remain. Record the retention or
repair decision and its authorized procedure before changing any reported rows.

`db:strip-oauth-tokens` unsets the enumerated fields in `scripts/strip-oauth-tokens.ts`. Provider,
provider account id, type and user id survive. It neither revokes credentials at the provider nor
signs users out. Existing tokens in backups are governed by backup retention.

Run apply with the exact `--confirm=<database>` value, then repeat the dry run. Completion means the
retired collection is absent, identifying deletion notes and stored token fields have zero matches,
and every reported leftover has an explicit disposition. Exit zero alone does not close that last
decision. The migrations are idempotent but have no undo; if interrupted, inspect actual state and
rerun only the intended remaining work. Restoring data requires the approved recovery snapshot and
a targeted plan that avoids reinstating invalid identity links or erased personal data unintentionally.

## Health and outage recovery

`GET /api/admin/health` accepts a current admin or moderator; the browser admin layout accepts only
admins. Health has its own fail-open request policy and probe caller. Inspect the JSON checks and
`X-Health-Status`: degraded is HTTP 200, unhealthy is 503. An ordinary quota denial is 429. Protected
mutations/sign-in return 503 with retry guidance when KV cannot answer; read policies stay open,
except admin reads that deliberately share the fail-closed `admin` policy.

KV checks abort after two seconds without automatically replaying INCR. Each health request can
make an outer limiter check and a probe, so two seconds is not the whole health-request budget.
Backend selection is cached per process; deploy/restart instances after changing KV variables.
Missing/partial KV configuration in production deliberately serves with per-instance memory limits,
logs an error and reports `misconfigured`. Shared abuse protection is not established in this mode.

For a KV incident, verify service reachability and credential configuration through the operator's
service tools, inspect application errors, and retry a controlled write after recovery. Do not
remove KV configuration merely to turn off an outage refusal. Verify a real quota denial remains
429 and health returns to the expected backend/status. B08's real Redis concurrency/failure test
is deferred with KV provisioning; fake pipeline tests do not prove server-side atomicity.

For a database incident, use deployment logs and `db:test` against the confirmed target. The health
endpoint's authorization itself requires MongoDB and may fail before assembling checks. Fix network,
credentials or service availability, then verify reconnect, transaction support and identity indexes.
Connection health is a ping, not proof of write readiness. Pool capacity is not reported. If only
`db.stats()` is denied, size/index fields can be fallback zeros; do not interpret them as measured
usage or missing indexes.

## Production evidence still required

All rows are **unverified** as of this local closeout. Replace a status only with a dated operator
record identifying the environment, evidence location and result; never include credentials.

| Check | Evidence needed to close |
|---|---|
| Deployed revision and session revocation | Fixed revision on all instances; secret rotation recorded; pre-fix token rejected and fresh login succeeds |
| OAuth links | Historical review and approved disposition, including privileged identities |
| Atlas access and network | Actual application/operator roles and network rules reviewed; transaction capability checked |
| Identity indexes and query plans | Actual keys/options/uniqueness, reviewed rollout output and production explain evidence for removals |
| Backups and restore | Backup schedule, retention, access controls, accepted recovery objectives and a dated restore rehearsal into an isolated target |
| Restore verification | Restored counts/indexes, provider linkage, representative reads and transactions checked; measured recovery time recorded; no production overwrite during rehearsal |
| Historical cleanup | Dry-run/apply results and follow-up previews for B06/B12/B16; leftover and log/backup retention decisions |
| KV/backend choice | Actual deployed selection and health; maintainer's B09 deferral recorded if memory remains; real concurrency/outage/recovery checks before relying on KV |
| Ingress trust and platform limits | Proxy overwrites the configured client-IP header; forged forwarding headers cannot select another quota identity; direct ingress bypass reviewed |

The B09 decision permits memory fallback and defers purchasing/provisioning KV. It does not certify
the current deployment. Public GitHub publication of the audit's exploit details remains separately
pending explicit disclosure approval; local B-key links provide traceability in the meantime.

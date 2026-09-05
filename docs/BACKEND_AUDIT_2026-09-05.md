# Backend audit — 2026-09-05

**Status:** Remediation in progress. B01 and B02 are implemented and locally verified; production deployment, pre-fix session revocation and historical OAuth-link review remain pending.
**Repository:** zelengeo/exfil-zone-assistant.
**Source snapshot verified when saving:** `9639e01a1cdb4fb32435309eaf68f561e6b4046a`.
**Scope:** Next.js API routes, exported admin server actions, auth callbacks/gates, Mongoose models, MongoDB lifecycle and scripts, rate limiting, related UI entry points and agent documentation.

## Summary

The highest-priority finding is authenticated identity replacement through client session updates, including escalation to an existing administrator. Independent correction-deletion authorization, MongoDB lifecycle/transaction and rate-limiter defects were also confirmed. Data suggestions remain active despite the product decision to retire them.

The database currently supports accounts, provider links, feedback and corrections. Published game data and player progress do not require MongoDB. This audit does not conclude that MongoDB must be replaced or that all account/feedback functionality should be removed.

## Method and limits

- Read application code, installed NextAuth/Mongoose implementations, root/scoped AGENTS files, operational scripts and environment examples.
- Ran the existing suite through `node.exe node_modules/vitest/vitest.mjs run --reporter=dot`: **7 files, 210 tests passed**. The suites cover game logic/published data, not backend contracts.
- Ran isolated in-memory reproductions against transpiled application source, the installed NextAuth core session handler and installed Mongoose/MongoDB errors. Persistence/provider responses were mocked; no live account impersonation, role update, index mutation or record deletion occurred.
- Those ad-hoc reproductions were executed from shell input and were not committed as regression tests. B01 and B02 now have durable regression suites; the remaining implementation issues still require their own tests.
- Confirmed reproductions: JWT identity substitution followed by the real admin gate; non-admin cross-user correction deletion; read/write quota collision in both backends; premature weekly quota cleanup; KV fail-open; stranded connection waiters; deletion writes outside the session; cold-connection startSession timeout; unverified-provider email linking; duplicate-key and malformed-JSON errors becoming 500.
- Source-traced findings are identified separately below. A mocked-provider result proves the application accepts that input, not that a live provider takeover was performed.
- **Unverified operational state:** Atlas users/permissions/network access, deployed indexes and explain plans, backup/restore configuration, production KV credentials/backend, ingress forwarding-header rewriting, platform rate limits, and whether this source snapshot is deployed.
- Docker exposure is conditional on host firewall/routing; only configuration was inspected.
- Only `.env.example` is tracked among environment files. Secret values were not needed for this audit.
- The audit pass made no application source changes. B01 and B02 remediation were subsequently implemented in this branch; no production deployment, secret rotation or historical OAuth-link mutation was performed.

## Prioritization

Contain identity and authorization flaws first. Retire correction entry points without delaying the immediate authorization fix. Repair connection and transaction handling, then rate limiting and operational verification. Keep documentation and meaningful regression tests with each change; perform a final cross-layer documentation pass.

Issue dependencies distinguish actual implementation ordering from related work. Historical cleanup, credential/session revocation and production index changes require explicit rollout steps; a code merge does not prove that those operations happened.

## Implementation index

Publication is pending explicit approval for public disclosure. Automatic approval review rejected creation of the tracking issue because this repository is public and the payload includes exploitable security findings. No GitHub issues were created.

The complete implementation drafts and dependency graph are saved in [BACKEND_AUDIT_2026-09-05_ISSUES.md](BACKEND_AUDIT_2026-09-05_ISSUES.md).

| Finding | Implementation draft |
|---|---|
| B01 | [[Critical] Prevent client session updates from changing JWT identity](BACKEND_AUDIT_2026-09-05_ISSUES.md#b01) — implemented locally; rollout pending |
| B02 | [[High] Verify OAuth email ownership and resolve linked accounts by provider identity](BACKEND_AUDIT_2026-09-05_ISSUES.md#b02) — implemented locally; rollout pending |
| B03 | [[High] Enforce authorization on correction deletion until retirement](BACKEND_AUDIT_2026-09-05_ISSUES.md#b03) |
| B04 | [[High] Repair MongoDB connection lifecycle and remove the unused client pool](BACKEND_AUDIT_2026-09-05_ISSUES.md#b04) |
| B05 | [[High] Connect before creating database sessions in write handlers](BACKEND_AUDIT_2026-09-05_ISSUES.md#b05) |
| B06 | [[High] Make account deletion atomic and consistent about retained references](BACKEND_AUDIT_2026-09-05_ISSUES.md#b06) |
| B07 | [[High] Restrict local MongoDB and mongo-express exposure](BACKEND_AUDIT_2026-09-05_ISSUES.md#b07) |
| B08 | [[Medium] Isolate rate-limit policies and preserve their full expiry windows](BACKEND_AUDIT_2026-09-05_ISSUES.md#b08) |
| B09 | [[Medium] Make rate-limit backend failures explicit and health reporting truthful](BACKEND_AUDIT_2026-09-05_ISSUES.md#b09) |
| B10 | [[Medium] Cover backend entry points with rate limits and fix quota inspection](BACKEND_AUDIT_2026-09-05_ISSUES.md#b10) |
| B11 | [[Medium] Make MongoDB index rollout previewable and verification fail reliably](BACKEND_AUDIT_2026-09-05_ISSUES.md#b11) |
| B12 | [[Medium] Retire data-correction submissions across UI, APIs and moderation](BACKEND_AUDIT_2026-09-05_ISSUES.md#b12) |
| B13 | [[Medium] Enforce current account status on mutations and session refresh](BACKEND_AUDIT_2026-09-05_ISSUES.md#b13) |
| B14 | [[Medium] Enforce profile privacy in server responses and shared reads](BACKEND_AUDIT_2026-09-05_ISSUES.md#b14) |
| B15 | [[Medium] Return correct API errors for duplicate keys and malformed JSON](BACKEND_AUDIT_2026-09-05_ISSUES.md#b15) |
| B16 | [[Medium] Stop retaining unused OAuth provider tokens](BACKEND_AUDIT_2026-09-05_ISSUES.md#b16) |
| B17 | [[Medium] Unify duplicated profile and admin mutation policies](BACKEND_AUDIT_2026-09-05_ISSUES.md#b17) |
| B18 | [[Medium] Correct backend agent guidance and add an operational runbook](BACKEND_AUDIT_2026-09-05_ISSUES.md#b18) |

## B01

**Critical — Prevent client session updates from changing JWT identity**

**Remediation status (2026-09-05):** Implemented locally and covered by durable tests. The JWT update callback now ignores the client payload, preserves the existing authenticated subject, and refreshes profile, role and ban claims only from that subject's database row. A missing subject throws through NextAuth's session handler, which clears the session cookie. Production deployment and `NEXTAUTH_SECRET` rotation remain pending, so this finding stays open operationally.

**Changed paths:**

- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth/session-update.test.ts`
- `src/app/api/AGENTS.md`
- `.env.example`

**Evidence and affected paths:** The update branch refreshes database fields and then executes Object.assign(token, session). NextAuth passes request body data into this callback and re-encodes the returned token. Client data can replace id, roles and isBanned. requireAdmin subsequently queries the overwritten id. Public profile responses expose target IDs.

- [src/app/api/auth/[...nextauth]/route.ts:275](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/auth/%5B...nextauth%5D/route.ts#L275)
- [src/lib/auth/utils.ts:44](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/auth/utils.ts#L44)
- [src/app/api/user/[username]/route.ts:24](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/%5Busername%5D/route.ts#L24)

**Impact:** Any authenticated account can impersonate another account, including an administrator, and reach that account's data and mutations.

**Expected behavior:** The authenticated subject is immutable for the lifetime of a session. Authorization attributes and refreshed profile data come only from trusted database reads.

**Verification:** Reproduced with the installed NextAuth core session handler, actual application callbacks and requireAdmin, with persistence mocked. The member's identity changed and the admin gate succeeded. No live account was accessed.

**Remediation verification:** The durable suite exercises the installed NextAuth session-update handler and the real `requireAdmin` gate. It covers injected identity/authorization claims, legitimate profile refresh, server-owned ban refresh, a deleted user, an unauthenticated update and malformed update data. The injected administrator id is never queried and the member session does not pass `requireAdmin`. Full result: **8 test files, 215 tests passed**; TypeScript and changed-file ESLint passed. The production build compiled and type-checked, then could not complete static generation because the configured development MongoDB SRV was unreachable from the verification environment and the existing B04 reconnect loop continued retrying.

**Remediation boundary:** Replace the arbitrary merge with explicit server-owned claims; handle a missing user by invalidating the session; add a documented deployment step to revoke previously issued sessions after the fix.

**Pending rollout:** Deploy the fix with a newly generated production `NEXTAUTH_SECRET` so every JWT issued before remediation is rejected. Verify users must sign in again and that ordinary users cannot reach the admin gate. A code deployment without this rotation does not close the historical-token exposure.

**Non-goals:** No OAuth linking redesign, role hierarchy change, UI redesign, or live secret rotation during implementation without deployment authorization.

**Primary references:** [Reference 1](https://next-auth.js.org/getting-started/client#updating-the-session)


## B02

**High — Verify OAuth email ownership and resolve linked accounts by provider identity**

**Remediation status (2026-09-05):** Implemented locally and covered by durable tests. Sign-in now resolves an existing Account by provider plus provider account id before considering email. Only a new Google or Discord link accepts a normalized email with that provider's explicit verification claim. User creation, link creation, login metadata and verified-email admin bootstrap share one transaction; duplicate-key races retry from stored canonical identity.

**Changed paths:**

- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth/oauth-profile.ts`
- `src/lib/auth/oauth-sign-in.ts`
- `src/lib/auth/oauth-sign-in.test.ts`
- `src/lib/auth/username.ts`
- `src/app/api/AGENTS.md`

**Evidence and affected paths:** signIn finds a User by lowercased email before consulting Account. A missing provider link is created for that user without inspecting profile.verified or profile.email_verified. ADMIN_EMAIL promotion uses the same unchecked email. User creation and account linking use separate writes.

- [src/app/api/auth/[...nextauth]/route.ts:123](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/auth/%5B...nextauth%5D/route.ts#L123)
- [src/models/Account.ts:34](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/models/Account.ts#L34)
- [src/lib/auth/username.ts:36](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/auth/username.ts#L36)

**Impact:** An unverified email claim can be treated as ownership of an existing privileged account. Email changes and concurrent first sign-ins can also misassociate or partially create records.

**Expected behavior:** Existing links authenticate by provider plus providerAccountId. A new link based on email is allowed only with an explicitly verified, normalized, nonempty email from a supported provider. Missing or false verification fails closed.

**Verification:** The actual signIn callback accepted an explicitly unverified Discord profile and linked it to an existing admin fixture. Provider response and database were mocked; no live-provider takeover was attempted.

**Remediation verification:** Provider fixtures cover Google `email_verified` and Discord `verified` as true, false and absent, plus missing and malformed email. Callback-level tests cover existing Google and Discord links after an email change or ownership conflict, cross-provider linking by one verified normalized email, verified and unverified configured-admin cases, an orphaned link, transaction rollback after link failure, duplicate-key winner recovery and concurrent cross-provider sign-ins. Full result: **9 test files, 233 tests passed**; TypeScript and changed-file ESLint passed. Persistence behavior uses an equivalent transactional test boundary; no live provider or database was mutated.

**Remediation boundary:** Define provider-specific verification, identity lookup and safe linking behavior; preserve legitimate existing links; make first-login/link creation idempotent under concurrent requests and handle uniqueness conflicts; apply the same verified-email requirement to admin bootstrap.

**Pending rollout:** Verify the deployed unique indexes on User email/username and Account provider identity before relying on conflict recovery. Links created under the old email-first policy cannot be proven legitimate from current records alone; review or reset them through a separately authorized, recoverable production procedure. Deploying this code does not repair an already-misassociated provider link.

**Non-goals:** No new providers, manual account-linking UI, provider-token retention changes, or broad auth-library migration.

**Primary references:** [Reference 1](https://next-auth.js.org/providers/google), [Reference 2](https://docs.discord.com/developers/resources/user)


## B03

**High — Enforce authorization on correction deletion until retirement**

**Evidence and affected paths:** DELETE /api/corrections/[id] is described as admin-only, but calls only requireAuth before DataCorrection.findByIdAndDelete(id). It has neither an ownership check nor an admin gate. The separate admin route uses requireAdminOrModerator.

- [src/app/api/corrections/[id]/route.ts:63](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/corrections/%5Bid%5D/route.ts#L63)
- [src/app/api/admin/corrections/[id]/route.ts:158](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/admin/corrections/%5Bid%5D/route.ts#L158)

**Impact:** A normal signed-in user who knows a correction ID can delete somebody else's submission.

**Expected behavior:** The legacy endpoint enforces its documented admin-only permission, or is disabled as part of completed retirement. Endpoint naming and rate-limit policy must never substitute for authorization.

**Verification:** Reproduced by invoking the actual DELETE handler with a normal-user session and a different owner's correction fixture. It returned 200 and executed deletion.

**Remediation boundary:** Apply requireAdmin to the legacy DELETE endpoint as an independently shippable containment fix. Preserve the explicit moderator policy of the separate admin endpoint unless retirement removes it.

**Non-goals:** Do not wait for the retirement project, change all moderation roles, or delete historical records.


## B04

**High — Repair MongoDB connection lifecycle and remove the unused client pool**

**Evidence and affected paths:** connectDB uses isConnecting plus a polling interval that only resolves on readyState 1; a failed initiating connection never rejects concurrent waiters. Every attempt adds connection listeners and production reconnect timers. The module also eagerly connects a separate native MongoClient, although the adapter is commented out and the default clientPromise has no active consumer. Health calculates pool availability from mongoose.connections.length.

- [src/lib/mongodb.ts:35](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/mongodb.ts#L35)
- [src/lib/mongodb.ts:70](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/mongodb.ts#L70)
- [src/app/api/auth/[...nextauth]/route.ts:74](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/auth/%5B...nextauth%5D/route.ts#L74)
- [src/app/api/admin/health/route.ts:84](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/admin/health/route.ts#L84)
- [package.json:24](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/package.json#L24)

**Impact:** Database outages strand requests and leak timers/listeners. Every process maintains an unused pool. Reported pool metrics do not measure sockets and can conceal saturation.

**Expected behavior:** Each process shares a connection attempt that either resolves or rejects for every caller, permits a subsequent retry, and does not spawn competing reconnect loops. Only required pools are opened; health reports truthful metrics.

**Verification:** A controlled failed connect left the actual connectDB concurrent caller pending with its polling callback alive. Unused-pool and inaccurate-metric findings are source-traced.

**Remediation boundary:** Use a shared promise with failure reset; register lifecycle listeners once; rely on a deliberate driver reconnect policy; remove unused adapter/client runtime paths and dependencies where no consumer remains; make database health metrics accurate or omit unavailable values.

**Non-goals:** No database/ODM migration, guessed pool-size optimization, Atlas configuration changes, or removal of mongodb if operational scripts still use it.


## B05

**High — Connect before creating database sessions in write handlers**

**Evidence and affected paths:** These handlers await mongoose.startSession before connectDB, and session creation sits outside their try/catch. On a fresh process Mongoose buffers startSession while the code that would initiate connection remains unreachable.

- [src/app/api/feedback/route.ts:23](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/feedback/route.ts#L23)
- [src/app/api/admin/users/[id]/route.ts:68](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/admin/users/%5Bid%5D/route.ts#L68)
- [src/app/api/admin/corrections/[id]/route.ts:71](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/admin/corrections/%5Bid%5D/route.ts#L71)

**Impact:** First feedback submissions, admin deletions and correction reviews can time out or escape the normal API error response on cold starts.

**Expected behavior:** Connection and required authorization complete before session creation. Session creation, transaction execution and cleanup have consistent error handling.

**Verification:** Installed Mongoose startSession on a disconnected instance rejected with its connection-buffering timeout. The route source calls it before initiating connectDB.

**Remediation boundary:** Correct ordering in every affected retained handler, safely handle partially initialized sessions and only abort active transactions. Remove obsolete correction coverage if B12 has already removed the route.

**Non-goals:** No connection-cache redesign, data-retention decision, or changes to the business outcome of these operations.


## B06

**High — Make account deletion atomic and consistent about retained references**

**Evidence and affected paths:** Self-deletion wraps operations in withTransaction but passes its session to none of the User, Account or Feedback queries. It calls feedback anonymization while adding the deleted username and ID to reviewerNotes. Both deletion paths leave correction/reviewer references outside their cleanup policy. Admin deletion sets isAnonymous, which Feedback does not define.

- [src/app/api/user/route.ts:91](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/route.ts#L91)
- [src/app/api/admin/users/[id]/route.ts:96](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/admin/users/%5Bid%5D/route.ts#L96)
- [src/models/Feedback.ts:24](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/models/Feedback.ts#L24)
- [src/models/DataCorrection.ts:17](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/models/DataCorrection.ts#L17)

**Impact:** A failed deletion can remove OAuth links but leave the account, and retained records can still identify a supposedly anonymized user. Self-service and admin deletion produce different results.

**Expected behavior:** All participating account-deletion writes are in one transaction. Both entry points use the same explicit policy for authored content, reviewer attribution and deleted identities.

**Verification:** Mocked persistence demonstrated an Account mutation without a session before a later Feedback failure returned 500. The session omission is confirmed by the source and Mongoose transaction semantics.

**Remediation boundary:** Share the deletion operation where practical; attach the transaction session to every write/read that participates; inventory User references and implement documented deletion/anonymization behavior. Do not add identifying notes as part of anonymization. Address existing records through a separately reviewable migration plan.

**Non-goals:** No bulk production purge, legal-policy invention, unrelated moderation rewrite, or irreversible historical-data migration bundled into route deployment.

**Primary references:** [Reference 1](https://mongoosejs.com/docs/8.x/docs/transactions.html)


## B07

**High when network-reachable — Restrict local MongoDB and mongo-express exposure**

**Evidence and affected paths:** Compose maps 27018:27017 and 8081:8081 without a host address, runs MongoDB without authorization and explicitly disables mongo-express basic authentication. init-mongo.js contains unrelated bootstrap definitions but is not mounted. The example URI correctly uses a direct connection to the local replica set.

- [compose.yaml:6](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/compose.yaml#L6)
- [compose.yaml:33](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/compose.yaml#L33)
- [init-mongo.js:1](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/init-mongo.js#L1)
- [.env.example:18](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/.env.example#L18)

**Impact:** Starting the development stack may expose an unauthenticated database and administration UI on host network interfaces, subject to host firewall and routing.

**Expected behavior:** The default development database is accessible only locally; the administration UI starts only when deliberately enabled. Documentation describes the actual replica-set bootstrap and authentication assumptions.

**Verification:** Source/configuration finding. Actual external reachability was not tested.

**Remediation boundary:** Bind published ports to 127.0.0.1, make mongo-express opt-in through a Compose profile, and remove or reconcile unused bootstrap code. Keep a working replica-set development environment and matching example URI.

**Non-goals:** No Atlas networking/credentials changes, production deployment design, deleting Docker volumes, or migrating existing local data.

**Primary references:** [Reference 1](https://docs.docker.com/engine/network/port-publishing/)


## B08

**Medium — Isolate rate-limit policies and preserve their full expiry windows**

**Evidence and affected paths:** Both backends key counters by caller and time window without a policy identifier. Same-window read/write limits collide. Memory initializes a shared bucket from the first policy, whereas KV compares one shared count to each cap. Memory cleanup deletes all buckets after one hour, including daily/weekly limits. KV INCR and EXPIRE are separate operations.

- [src/lib/rate-limit/rate-limit-memory.ts:17](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/rate-limit/rate-limit-memory.ts#L17)
- [src/lib/rate-limit/rate-limit-memory.ts:57](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/rate-limit/rate-limit-memory.ts#L57)
- [src/lib/rate-limit/rate-limit-kv.ts:5](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/rate-limit/rate-limit-kv.ts#L5)
- [src/lib/middleware.ts:28](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/middleware.ts#L28)
- [src/app/api/user/update-username/route.ts:14](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/update-username/route.ts#L14)

**Impact:** Reads can either inflate or exhaust a write allowance depending on backend. Weekly/daily restrictions can reset after an hour. Interrupted expiry setup can leave stale KV keys.

**Expected behavior:** Counters have explicit stable policy namespaces, identical admission semantics across backends, and expiry no earlier than the configured window. Counter creation/increment and expiry are reliable under concurrency and failure.

**Verification:** Reproduced 59 writes after one 60/hour read in memory; 30 reads exhausted a 30/hour write allowance in KV; hourly memory cleanup reset a weekly quota.

**Remediation boundary:** Define a policy ID in the limiter interface; namespace by policy and caller; align backend behavior; store actual expiry for memory cleanup; make KV increment/expiry atomic or equivalently recoverable. Preserve existing nominal caps and fixed-window semantics in this issue.

**Non-goals:** No arbitrary limit changes, rolling seven-day username cooldown, production outage-policy change, or UI redesign. A rolling cooldown is a separate product decision.


## B09

**Medium — Make rate-limit backend failures explicit and health reporting truthful**

**Evidence and affected paths:** Production silently falls back to process-local memory when either KV variable is absent. KV exceptions return success:true. checkRateLimiterHealth tests the returned object's truthiness, so this fail-open result is reported as operational.

- [src/lib/rate-limit/rate-limit-factory.ts:7](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/rate-limit/rate-limit-factory.ts#L7)
- [src/lib/rate-limit/rate-limit-kv.ts:28](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/rate-limit/rate-limit-kv.ts#L28)
- [src/app/api/admin/health/route.ts:133](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/admin/health/route.ts#L133)
- [.env.example:29](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/.env.example#L29)

**Impact:** Multi-instance deployments can lose effective abuse protection or allow every request during an outage while the health view remains green.

**Expected behavior:** Production backend selection and outage behavior are explicit. The caller can distinguish an admitted request, a rejected quota and a failed backend. Health probes independently report real backend availability.

**Verification:** Actual KV limiter code returned success:true on a mocked KV exception. The health route source treats that result object as operational.

**Remediation boundary:** Require distributed limiter configuration in production; keep memory an explicit development/test backend. For protected API writes/auth, return a controlled 503 with retry guidance when the backend is unavailable. Make health probe real KV connectivity and distinguish misconfiguration/degraded/error. Document the policy.

**Non-goals:** No infrastructure purchase, KV credential rotation, quota redesign, or fallback that claims distributed guarantees while using local memory.


## B10

**Medium — Cover backend entry points with rate limits and fix quota inspection**

**Evidence and affected paths:** NextAuth handlers and DELETE /api/user do not call withRateLimit. Exported admin server actions have no limiter and claim to be internal-only. GET /api/rate-limit/status is unthrottled and calls check seven times on separate :check keys, mutating unrelated counters rather than reading actual allowances. The anonymous-policy fallback substitutes Anonymous although the configured suffix is Unauthenticated. IP extraction ignores its request argument and trusts forwarding headers without a documented proxy contract.

- [src/app/api/auth/[...nextauth]/route.ts:335](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/auth/%5B...nextauth%5D/route.ts#L335)
- [src/app/api/user/route.ts:81](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/route.ts#L81)
- [src/app/api/rate-limit/status/route.ts:8](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/rate-limit/status/route.ts#L8)
- [src/app/admin/users/[id]/edit/actions.ts:23](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/admin/users/%5Bid%5D/edit/actions.ts#L23)
- [src/lib/rate-limit/rate-limit.ts:60](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/rate-limit/rate-limit.ts#L60)
- [src/lib/middleware.ts:23](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/middleware.ts#L23)

**Impact:** Public entry points can bypass the intended protection or amplify backend calls. Displayed remaining quotas are fictional, and anonymous identity handling is not tied to verified deployment behavior.

**Expected behavior:** Every retained externally callable backend entry point has an intentional policy. Quota inspection is read-only and reports the actual applicable policy. Anonymous identity comes from a documented trusted ingress contract.

**Verification:** Source-traced coverage and status-counter behavior. Production ingress header rewriting and any Vercel-side limits were not inspected.

**Remediation boundary:** Inventory routes, server actions and retained dynamic DB-backed pages; assign shared policy IDs from B08. Protect expensive/auth mutations without breaking OAuth callbacks or ordinary session polling. Replace or remove the unused status endpoint after checking consumers. Correct anonymous fallback and test request identity extraction.

**Non-goals:** No global limit on static game-data pages, new CAPTCHA provider, guessed proxy/header security claim, or rate-limit cap changes unrelated to coverage.

**Primary references:** [Reference 1](https://nextjs.org/docs/app/guides/data-security)


## B11

**Medium — Make MongoDB index rollout previewable and verification fail reliably**

**Evidence and affected paths:** The index script runs global syncIndexes before repeating createIndexes/syncIndexes per model. There is no diff preview or explicit target selection. Per-model failures and missing unique indexes can still reach the completion message. db:test catches connection errors or missing URI without failing its exit status and hardcodes a database name. User declares three overlapping _id-first indexes; the alleged covering index omits selected username. Feedback indexes reviewedBy/reviewedAt, fields absent from its schema. Runtime autoIndex is disabled.

- [scripts/sync-mongodb-indexes.ts:17](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/scripts/sync-mongodb-indexes.ts#L17)
- [scripts/test-mongodb-connection.ts:7](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/scripts/test-mongodb-connection.ts#L7)
- [src/models/User.ts:84](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/models/User.ts#L84)
- [src/models/Feedback.ts:45](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/models/Feedback.ts#L45)
- [src/models/Account.ts:34](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/models/Account.ts#L34)
- [src/lib/mongodb.ts:63](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/mongodb.ts#L63)

**Impact:** An operator can unexpectedly drop indexes or target the wrong database, while automation reports success after failed verification. Unnecessary indexes add write/storage overhead; missing unique constraints threaten account integrity.

**Expected behavior:** Index changes are explicit, reviewed, target-specific and verifiable. Read-only preview is the default, destructive changes require an explicit apply mode, and every required verification failure exits nonzero.

**Verification:** Source-traced script control flow and index definitions. Production indexes and execution plans were not inspected.

**Remediation boundary:** Add diffIndexes preview, validated target/configuration, a single application pass, and post-apply checks for User email/username and Account provider identity unique constraints. Fix db:test target resolution and exit codes. Review candidate indexes against actual query shapes and explain plans before pruning; retire stale bootstrap definitions.

**Non-goals:** No live Atlas index mutation in this implementation, guessed index pruning, database schema rewrite, or destructive production action hidden behind a test command.

**Primary references:** [Reference 1](https://mongoosejs.com/docs/8.x/docs/api/model.html#Model.diffIndexes()), [Reference 2](https://mongoosejs.com/docs/8.x/docs/api/model.html#Model.syncIndexes())


## B12

**Medium — Retire data-correction submissions across UI, APIs and moderation**

**Evidence and affected paths:** Item detail pages still render ItemCorrectionFormAuth. Dedicated submit/read/delete/review APIs, admin pages, DataCorrection schemas/model and contribution statistics remain. The general feedback API still accepts data_correction even though its UI only offers bug, feature and general feedback.

- [src/app/items/[id]/page.tsx:192](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/items/%5Bid%5D/page.tsx#L192)
- [src/components/corrections/ItemCorrectionForm.tsx:132](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/components/corrections/ItemCorrectionForm.tsx#L132)
- [src/app/api/corrections/route.ts:81](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/corrections/route.ts#L81)
- [src/app/api/feedback/route.ts:31](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/feedback/route.ts#L31)
- [src/lib/schemas/feedback.ts:6](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/schemas/feedback.ts#L6)
- [src/models/DataCorrection.ts:5](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/models/DataCorrection.ts#L5)
- [src/app/dashboard/page.tsx:226](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/dashboard/page.tsx#L226)
- [src/app/admin/AGENTS.md:5](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/admin/AGENTS.md#L5)

**Impact:** Players can submit unwanted data, maintainers retain an obsolete moderation workload, and a retired capability continues exposing vulnerable server routes and stale domain concepts.

**Expected behavior:** Data suggestions cannot be submitted through any UI or API. Ordinary bug reports, feature requests and general feedback continue working. Historical records are preserved until an explicit retention/migration decision.

**Verification:** Source-traced active rendering at item page line 192 and active routes/model. Product retirement is explicitly requested by the user.

**Remediation boundary:** Remove item correction UI, correction routes and admin pages/navigation, active correction schemas/model imports and obsolete stats/reward presentation. Reject data_correction on new feedback requests while preserving the ability to read historical feedback of that type if retained. Update existing scoped documentation and registration defaults as required.

**Non-goals:** No removal of ordinary feedback, all user accounts, unrelated partner/moderator functionality, published game-data editing, or production collection/data deletion.


## B13

**Medium — Enforce current account status on mutations and session refresh**

**Evidence and affected paths:** requireAuth checks isBanned only from the JWT. Profile and username mutations and correction submission use this token-only gate. JWT state is refreshed only on sign-in/update, and a missing database row during refresh does not itself invalidate the old token. The session maxAge is 30 days.

- [src/lib/auth/utils.ts:13](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/auth/utils.ts#L13)
- [src/app/api/user/route.ts:40](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/route.ts#L40)
- [src/app/api/user/update/route.ts:19](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/update/route.ts#L19)
- [src/app/api/user/update-username/route.ts:23](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/update-username/route.ts#L23)
- [src/app/api/corrections/route.ts:84](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/corrections/route.ts#L84)
- [src/app/api/auth/[...nextauth]/route.ts:255](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/auth/%5B...nextauth%5D/route.ts#L255)

**Impact:** A user banned after signing in can keep using token-only write endpoints; deleted accounts may retain apparently valid session state. Administrative state changes do not consistently take effect.

**Expected behavior:** Authorization-sensitive operations use current account existence and ban state. Missing accounts invalidate sessions. Any intentional exception, such as self-service deletion for a banned user, is explicit and narrowly scoped.

**Verification:** Source-traced stale-token gates; the audit separately demonstrated that client update could also overwrite ban state before B01.

**Remediation boundary:** Audit retained write gates, share a fresh-user check and apply it consistently. Define the self-deletion exception explicitly rather than inheriting behavior accidentally. Preserve cheap token-only reads only where they do not authorize a protected action.

**Non-goals:** No role hierarchy change, periodic DB query on every static page, new session-storage architecture, or implicit decision that banned users lose account deletion rights.


## B14

**Medium — Enforce profile privacy in server responses and shared reads**

**Evidence and affected paths:** The public API returns the full selected user when publicProfile is true without applying showContributions, so contribution stats remain visible when disabled. The page hides a contributions section at render time. getUserByUsername separately comments out active/banned filters that the API applies, and private API profiles still return location/headset.

- [src/app/api/user/[username]/route.ts:24](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/%5Busername%5D/route.ts#L24)
- [src/lib/user.ts:6](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/user.ts#L6)
- [src/app/user/[username]/page.tsx:65](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/user/%5Busername%5D/page.tsx#L65)
- [src/lib/schemas/user.ts:183](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/schemas/user.ts#L183)

**Impact:** Privacy settings differ across UI and API, and data hidden visually can remain available from a server response. Parallel query paths drift on account visibility.

**Expected behavior:** One explicit projection/visibility policy controls public profile data. showContributions=false suppresses contribution data server-side. Private profile exposure and banned/inactive visibility are consistent across readers.

**Verification:** Source-traced missing server enforcement. No live user's profile was fetched.

**Remediation boundary:** Centralize the public profile projection and apply it to API and page reads. Use a positive field allowlist. Keep a minimal private-profile identity stub; omit personal location/headset and contribution data for other viewers. Preserve a separate authorized own-profile view.

**Non-goals:** No new privacy UI, changing role semantics, hiding IDs as an authorization fix, or retroactive historical data purge.


## B15

**Medium — Return correct API errors for duplicate keys and malformed JSON**

**Evidence and affected paths:** handleError recognizes duplicate keys only inside an instanceof MongooseError branch with name MongoError. The installed driver's duplicate-key error is MongoServerError, so code 11000 falls through to 500. request.json SyntaxError likewise becomes 500.

- [src/lib/errors.ts:140](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/errors.ts#L140)
- [src/app/api/user/update-username/route.ts:35](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/update-username/route.ts#L35)
- [src/app/api/user/route.ts:41](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/route.ts#L41)
- [src/app/api/feedback/route.ts:27](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/feedback/route.ts#L27)

**Impact:** Expected conflicts and invalid requests are reported as server failures, confusing clients/operators. Uniqueness prechecks cannot prevent races and therefore do not replace correct driver-error handling.

**Expected behavior:** Database uniqueness conflicts map to a safe 409 response; malformed request JSON maps to 400; unexpected failures remain 500 without leaking database internals.

**Verification:** Actual installed MongoServerError(11000) and JSON SyntaxError both produced HTTP 500 through the existing translator.

**Remediation boundary:** Recognize supported MongoDB error shapes safely using unknown/type guards, preserve Mongoose validation/cast mapping, and handle JSON parse failures at a deliberate request-body boundary.

**Non-goals:** No swallowing arbitrary programming SyntaxErrors as client mistakes, schema validation rewrite, hiding internal failures as success, or removing unique indexes.


## B16

**Medium — Stop retaining unused OAuth provider tokens**

**Evidence and affected paths:** Both account creation paths persist access_token, refresh_token and id_token plus other token metadata. Repository searches found no active consumer of these credentials; the app uses OAuth for sign-in and its adapter is disabled.

- [src/app/api/auth/[...nextauth]/route.ts:174](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/auth/%5B...nextauth%5D/route.ts#L174)
- [src/app/api/auth/[...nextauth]/route.ts:206](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/auth/%5B...nextauth%5D/route.ts#L206)
- [src/models/Account.ts:22](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/models/Account.ts#L22)

**Impact:** The database holds provider credentials that increase the consequence of database access or a backup leak without serving current application behavior.

**Expected behavior:** Account records retain only fields required for sign-in/link identity. Unused provider credentials are not persisted for new logins.

**Verification:** Source-traced credential writes and repository-wide consumer search. No stored credentials were read.

**Remediation boundary:** Verify token consumers once more, stop writing unused credentials, remove unused schema fields and obsolete declarations where safe. Prepare a target-aware dry-run migration for existing token fields; preserve provider/user linkage and needed metadata.

**Non-goals:** No provider account revocation, production database mutation, credentials printed in logs/previews, or deletion of OAuth account links.


## B17

**Medium — Unify duplicated profile and admin mutation policies**

**Evidence and affected paths:** Two profile PATCH routes implement the same mutation with different response shapes. Role-specific admin mutation forbids self-modification and modifying other admins, but generic admin PATCH accepts roles through adminUserUpdateSchema and lacks those guards. The server action prevents only self-role changes. These entry points implement incompatible policies for the same data.

- [src/app/api/user/route.ts:37](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/route.ts#L37)
- [src/app/api/user/update/route.ts:14](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/user/update/route.ts#L14)
- [src/app/api/admin/users/[id]/route.ts:143](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/admin/users/%5Bid%5D/route.ts#L143)
- [src/app/api/admin/users/[id]/roles/route.ts:53](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/admin/users/%5Bid%5D/roles/route.ts#L53)
- [src/app/admin/users/[id]/edit/actions.ts:139](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/admin/users/%5Bid%5D/edit/actions.ts#L139)
- [src/lib/schemas/user.ts:130](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/schemas/user.ts#L130)

**Impact:** An admin can bypass role-management restrictions through another endpoint, and fixes to validation, bans, logging or response behavior can reach only one copy. This is policy bypass by an already privileged user, not independent ordinary-user escalation.

**Expected behavior:** A single mutation policy applies regardless of API route or server action. The current dedicated role endpoint's self/admin protections are not bypassable through generic edits.

**Verification:** Source comparison of the three admin write paths and their shared request schema. No live role mutation was performed.

**Remediation boundary:** Extract shared profile/admin operations with explicit authorization and validation. Restrict role changes to the dedicated policy or apply its guards everywhere. Keep legacy profile endpoints compatible wrappers until consumer migration is verified; align logging and validator options.

**Non-goals:** No invented role hierarchy, changing who can grant admin, new role UI, breaking existing profile clients without migration, or treating server actions as private APIs.


## B18

**Medium — Correct backend agent guidance and add an operational runbook**

**Evidence and affected paths:** Model docs claim five active models and adapter-owned Account/Session collections, but Session.ts is commented out and no adapter runs. API docs describe feedback and check-username as authenticated despite anonymous access, and misstate moderator gates. Guidance claims a covering index that omits a selected field. No backend runbook was found for index deployment, recovery, retention, session revocation or limiter outage behavior.

- [src/models/AGENTS.md:3](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/models/AGENTS.md#L3)
- [src/app/api/AGENTS.md:9](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/api/AGENTS.md#L9)
- [src/lib/AGENTS.md:58](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/lib/AGENTS.md#L58)
- [src/app/admin/AGENTS.md:18](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/src/app/admin/AGENTS.md#L18)
- [AGENTS.md:128](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/AGENTS.md#L128)
- [.env.example:1](https://github.com/zelengeo/exfil-zone-assistant/blob/9639e01a1cdb4fb32435309eaf68f561e6b4046a/.env.example#L1)

**Impact:** Agents and maintainers can reproduce retired functionality, apply incorrect authorization assumptions or run destructive operational scripts without knowing the target and recovery procedure.

**Expected behavior:** Scoped guidance states the implemented contracts and their reasons, and points to tested commands. Operational unknowns remain explicit rather than being documented as verified production facts.

**Verification:** Read root and scoped backend AGENTS files, operational scripts, environment example and docs tree. Production service configuration was not audited.

**Remediation boundary:** Update existing root/lib/models/api/admin AGENTS files after the behavior changes; add one focused backend operations document if needed and link it. Cover env ownership, local replica set, startup/index rollout, backups/restore verification, session revocation, deletion/token retention, proxy trust, rate-limit outage policy and incident verification. Each implementation issue should update its own affected guidance; this issue performs the final cross-layer reconciliation.

**Non-goals:** No large documentation mirror of code/package.json, fabricated Atlas backup or permission guarantees, unrelated frontend docs rebuild, actual production changes or secret values in documentation.

## Mapping to the original conversation audit

| Original finding | Saved finding / implementation scope |
|---|---|
| 1 — JWT identity replacement | B01 |
| 2 — unchecked OAuth email linking | B02 |
| 3 — correction deletion authorization | B03 |
| 4 — connection waiters/reconnect lifecycle | B04 |
| 5 — sessions created before connection | B05 |
| 6 — deletion transaction and retained references | B06 |
| 7 — local database/admin UI exposure | B07 |
| 8 — rate-limit collisions and cleanup | B08 |
| 9 — backend fallback, fail-open, status/coverage | B09 and B10 |
| 10 — unused pool and false pool metrics | B04 |
| 11 — index maintenance and script verification | B11 |
| 12 — active retired suggestion functionality | B12 |
| Additional — stale ban enforcement | B13 |
| Additional — profile privacy | B14 |
| Additional — database/JSON error mapping | B15 |
| Additional — unused provider credentials | B16 |
| Additional — duplicated mutation policies | B17 |
| Agent documentation inaccuracies / missing operations guidance | B18 |

The auth, deletion and rate-limit findings are code-level defects, not hypothetical production configuration claims. Index usefulness needs query/explain evidence before pruning. This report intentionally leaves unverified infrastructure facts open.

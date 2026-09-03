# Docs & Testing Rebuild Plan

**Started:** 2026-09-03
**Origin:** audit of the repo against the `mattpocock-skills` plugin (`writing-for-agents`,
`domain-modeling`, `codebase-design`, `tdd`, `code-review`).

## Why

The agent-facing documentation had grown to ~12,700 lines across 18 `CLAUDE.md` files. Most of it
restated things the agent can look up (`package.json`, the file tree, npm scripts), and the restated
copies had gone stale — the root doc named `tailwind.config.ts` and `next.config.js` (the repo has
`tailwind.config.js` and `next.config.ts`), told the reader to copy a `.env.example` that does not
exist, and listed `npm test` in the pre-deploy checklist for a repo with no test runner installed.

The standard to write against already exists in-repo: `src/app/tasks/CLAUDE.md` (179 lines). It
caches only what cannot be looked up — why the tasks route has no available/locked/completed tabs,
how the 128 gate ids join through `gameId` — and points at `npm run verify-chains` rather than
restating it.

## Decisions

| Decision | Choice |
|---|---|
| Depth of the documentation cut | Full cut: ~12,700 lines to ~3,000 |
| `CLAUDE-INDEX.md` | Delete. Root carries a short pointer list instead |
| Test runner | Add Vitest, port `verify-chains`, spec the pure calculation modules |
| `src/data/tasks.ts` seam | Deferred — do it when the data is next touched, not standalone |

## Stages

### Stage 1 — Root `CLAUDE.md`

The only always-loaded file, so every stale line costs on every turn.

- Delete the restated environment: dependency list, directory tree, npm scripts, external link farm
- Delete the triplicated rules (`Quick Reference` table, `Action Keywords`, `Code Modification Best
  Practices` all restate the six critical rules)
- Keep what cannot be looked up: the critical rules, VR-first constraints, the military aesthetic,
  the real SSR/typing gotchas, the non-obvious split of where game data lives
- **Target:** 525 to ~120 lines
- **Done when:** every remaining line states something not derivable from `package.json`, the file
  tree, or the model's own defaults

### Stage 2 — `CONTEXT.md` (interactive)

Root glossary, strictly a glossary: no implementation detail, no spec, no scratch pad.

Terms to resolve, with the usage evidence that makes each one a question:

- **Corp / vendor / merchant / owner** — `vendor` has 149 uses in `src/`, `merchant` 26, `corp` 16,
  while the *type* is `Corp` and the *field* is `merchant`. Probable split: Corp is the organisation
  (ARK), Merchant is the named person fronting it (Tommy), Vendor is the UI term conflating both.
  Needs a human call.
- **`id` vs `gameId`** — the wiki-id/in-game-id distinction currently lives only in a comment at
  `src/lib/gates.ts:36`
- **Gate** (`task` vs `dlc`), **chain**, **offer** / **trade**, **zone**

- **Done when:** every term with more than one spelling in `src/` has one canonical entry

### Stage 3 — Vitest

- Add Vitest
- Port `scripts/verify-chains.ts` into it — it is already a test suite wearing a script costume
- ~~Absorb `src/app/combat-sim/utils/{combat-test-helper,test-types}.ts`~~ — dropped. These are not
  a test harness: both are imported by `CombatSimulatorContent.tsx` and the live `/combat-sim/debug`
  page. Absorbing them would break that page.
- First specs on the pure calculation modules: `src/lib/protection/headModel.ts`,
  `src/app/combat-sim/utils/damage-calculations.ts`, `src/lib/gates.ts`
- **Done when:** `npm test` runs green and the pre-deploy checklist stops being a lie

Sequenced before Stage 4 so the documentation pass describes a runner that exists, and writes the
testing sections once rather than twice.

### Stage 4 — The 15 nested `CLAUDE.md` files

Cut to the `src/app/tasks/CLAUDE.md` standard.

- Strip the generic example code that dominates the bulk: `src/lib/CLAUDE.md` is 597 of 888 lines
  inside code fences, `src/models/CLAUDE.md` 493 of 709, `public/data/CLAUDE.md` 524 of 909
- Delete the three `## Future Improvements to Consider` sections outright
- Collapse the boilerplate repeated across files: `Documentation Hierarchy` appears in 10 files,
  `DO's` in 8, `DON'Ts` in 6, `Directory Structure` in 6
- Replace the Jest examples (in four files, for a Jest that was never installed) with real Vitest
  ones from Stage 3
- Heaviest first: `combat-sim` 1260, `guides` 1176, `items` 987, `hideout-upgrades` 953,
  `admin` 950, `lib` 888, `api` 774
- **Done when:** all 15 are under ~250 lines and no section is duplicated across two files

### Stage 5 — Delete `CLAUDE-INDEX.md`

712 lines duplicating the file tree, self-reporting counts that are already wrong ("Total
Documentation Files: 11", actual 18). Root `CLAUDE.md` carries the pointer list instead.

### Stage 6 — ADRs in `docs/adr/`

Three clear the bar of hard-to-reverse, surprising without context, and the result of a real
trade-off:

1. Why `src/data/tasks.ts` is a hand-maintained 13,956-line TypeScript module while every other
   dataset is JSON under `public/data/`
2. Why zod schemas outrank hand-written types (critical rule 4, currently stated without rationale)
3. Whichever vocabulary call comes out of Stage 2

### Stage 7 — Cleanup

- `.claude/config.yaml` is not a format Claude Code reads; its three rules are inert. Port to
  `.claude/settings.json` or delete
- Add the `.env.example` the setup instructions have always referenced
- Decide on the 17 tracked files under `claude/audit_1/` and
  `VR extraction shooter webapp redesign/` (the latter is already eslint-ignored, so half-vendored)

### Stage 8 — `src/data/tasks.ts` seam (deferred)

12 files import `tasksData` directly, including `src/app/sitemap.ts` and
`src/app/hideout-upgrades/components/HideoutOverview.tsx`, so every caller learns the raw shape.
The deepening move is making `src/app/tasks/utils/{chain,progress,vendors}.ts` the only door.
Opportunistic: do it when the data is next touched, since the churn otherwise outweighs the gain.

## Status

- [x] Stage 0 — audit, plan, decisions
- [x] Stage 1 — root `CLAUDE.md` (525 to 110 lines)
- [x] Stage 2 — `CONTEXT.md` (106 lines, 21 terms)
- [~] Stage 3 — Vitest (runner, port, gates + vendors specs; headModel and damage-calculations specs outstanding)
- [ ] Stage 4 — nested docs
- [ ] Stage 5 — delete index
- [ ] Stage 6 — ADRs
- [ ] Stage 7 — cleanup
- [ ] Stage 8 — deferred

---
status: superseded
---

# Task data is a committed TypeScript module, not JSON

> **Superseded by [ADR 0004](0004-task-data-is-json-in-public-data.md)** on 2026-09-04. This record
> was never accepted: writing it turned up the bundle cost below, measuring it settled the question
> the other way, and the tasks moved to `public/data/tasks.json`. Kept because it is the account of
> why they were ever a TypeScript module, which is the part a reader of the new arrangement will
> want.

Every other dataset in this repo is JSON under `public/data`, read at runtime through
`loadDataFile` so it stays a CDN-cached static asset and out of the JavaScript. The 227 tasks are
the exception: the extraction publishes `src/data/tasks.ts`, a generated TypeScript module that is
committed and imported directly.

## Considered options

**JSON via `loadDataFile`, like everything else.** Keeps the data out of the bundle. Costs an
`await` at every reader, which means a loading state in components that currently have none, and
async plumbing in `generateStaticParams` for the 227 static pages.

**A committed TypeScript module.** Gives synchronous access and compile-time typing against `Task`
and `TasksDatabase`, so a shape change in the extraction breaks the build rather than a page. This
is what was chosen.

## Consequences

The module is ~421 KB of source, and four `'use client'` components import `tasksData` directly —
`ChainColumn`, `TaskDetailPane`, `TasksPageContent` and `TaskPageContent` — so the task database
reaches the browser bundle. That is the same pattern `services/dataFiles.ts` exists to prevent for
`public/data`, where importing rather than loading once shipped the item database twice.

The bundle cost was **not accepted** - decided 2026-09-04. What followed is in ADR 0004: the fix
turned out to be a change of format after all, because the synchronous access this record trades
431 KB for was not reaching the prerendered HTML either.

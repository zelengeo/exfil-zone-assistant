---
status: proposed
---

# Task data is a committed TypeScript module, not JSON

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

Whether that cost is accepted or simply unnoticed is the open question on this record, and is why
its status is `proposed` rather than `accepted`. Measuring the built chunk requires a production
build. If the cost is deliberate, say so here and the matter is settled; if it is not, the smallest
fix is a server boundary at the route rather than a change of format.

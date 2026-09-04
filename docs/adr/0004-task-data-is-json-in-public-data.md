# Task data is JSON in `public/data`, like every other dataset

Supersedes [ADR 0001](0001-task-data-as-a-committed-typescript-module.md), which recorded the
opposite and was never accepted.

The 227 tasks are published as `public/data/tasks.json` and read through
`src/services/TaskService.ts`. They were `src/data/tasks.ts` — a generated, committed TypeScript
module imported directly by twelve files — until 2026-09-04.

## What the TypeScript module was buying

Synchronous access, and compile-time typing against `Task` and `TasksDatabase` so that a shape
change in the extraction broke the build rather than a page. Both are real, and the second is the
one that made the trade look sound.

## What it cost, once measured

431 KB of JavaScript in the bundle of every route that named a task. That was never only the tasks
route: `lib/vendors.ts` imported `corps` for a merchant's name, and `lib/gates.ts` imported the task
database to put a name on a gate, so `/items` and `/gunsmith` each carried the whole thing to render
a chip with three fields on it. Two 228 KB chunks, for an audience reading this on a phone beside a
headset or in the headset's own browser.

The measurement that settled it was the second one. `/tasks/ark_36.html` is 111 KB of prerendered
HTML carrying 1,686 characters of visible text, all of it chrome and a spinner — the pane suspends
on the item catalogue, so the task itself never reaches the prerender. **The synchronous access was
not buying rendered HTML.** It was buying the ability to index the database without awaiting, which
suspending once at the top of the route buys just as well.

The typing did not survive scrutiny either. Critical rule 4 says zod schemas are the source of
truth for types, and `tasksDatabaseSchema` in `lib/schemas/task.ts` already existed for the task
API. Validating the file against it gives the same guarantee the compile step did, at the point the
data is actually read, and stops a data drop and an endpoint from disagreeing about what a task is.

## What was decided

Publish `tasks.json` alongside every other dataset. `TaskService` loads it once through
`loadDataFile`, validates it against the existing schema, and then answers synchronously;
`useFetchTasks` suspends a client tree until that has happened.

Three things came out of the same change and are recorded here because they look arbitrary
otherwise:

- **The synchronous readers throw rather than return an empty database.** An empty task list renders
  as a complete, working page showing nothing, which reads as data loss. A thrown error reaches the
  boundary and says what went wrong.
- **`corps` is gone, not moved into `tasks.json`.** The vendor record is `lib/vendors.ts`
  ([ADR 0003](0003-a-vendor-has-an-org-and-a-merchant.md)), and duplicating six rows into the data
  file would have re-created the thing that ADR retired.
- **Five of the six helpers that lived at the foot of `tasks.ts` were deleted rather than moved.**
  Only `getTasksRequiring` had a caller.

## What it costs in turn

A publisher can now write a task the app cannot read without breaking the build first. That failure
moved from compile time to `npm run validate-data` and to a zod parse at load, which is a weaker
guarantee held in a different place — so the check has to actually run. It is in the extraction's
publish checklist and in this repo's pre-deploy one, and the extraction's own guard against emitting
an unknown `type` or `map` value now names the schema rather than the TypeScript union.

The prerendered task pages are still spinners. Fixing that is a separate change: the detail pane
computes its chain position, its "unlocks" rows and its related tasks from the database at render
time, and it would have to take them as props for a server component to fill in. Worth doing — 227
shareable, indexable pages currently carry only a title — but it is a refactor of the pane, not of
where the data lives.

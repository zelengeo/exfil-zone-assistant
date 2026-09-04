import { loadDataFile } from '@/services/dataFiles';
import { tasksDatabaseSchema } from '@/lib/schemas/task';
import type { Task, TasksDatabase } from '@/types/tasks';

/**
 * How the 227 tasks are reached.
 *
 * They used to be `src/data/tasks.ts`, a committed TypeScript module imported directly by twelve
 * files. That bought synchronous access at the price of 431 KB of JavaScript in the bundle of every
 * route that touched it — and bought less than it looked like, because the task pages suspend on the
 * item catalogue anyway and prerendered nothing but a spinner. `public/data/tasks.json` is a static
 * asset instead: compressed, CDN-cached, and parsed as data rather than executed as code.
 * See [ADR 0001](../../docs/adr/0001-task-data-as-a-committed-typescript-module.md).
 *
 * Two ways in, and they are not interchangeable:
 *
 * - `fetchTasks()` is the load. Await it in a server component, or let `useFetchTasks` suspend on
 *   it in a client one.
 * - `loadedTasks()` and the readers below are synchronous and **throw** until that load has
 *   finished. That is deliberate: the chain layout indexes the database in a dozen places, and
 *   threading a promise through all of them would have bought nothing over suspending once at the
 *   top. An empty database would render an empty task list, which reads as data loss rather than as
 *   a bug, so the failure is loud.
 *
 * Same shape as `ItemService`, for the same reasons and with the same lifetime: the cache is
 * module-level, so it is per-tab in the browser and per-process on the server.
 */

let cache: TasksDatabase | null = null;
let inFlight: Promise<TasksDatabase> | null = null;
let failure: Error | null = null;

/**
 * Load the task database, once.
 *
 * A failed load is remembered and re-thrown rather than retried on every render — a route that
 * retries a 404 on each paint is worse than one that says it could not load.
 */
export function fetchTasks(): Promise<TasksDatabase> {
    if (cache) return Promise.resolve(cache);
    if (failure) return Promise.reject(failure);

    if (!inFlight) {
        inFlight = loadDataFile<unknown>('tasks.json')
            .then((raw) => {
                // Storage the app does not control, so it is validated rather than trusted. The
                // schema is the one the task API already uses and the one `Task` is inferred from,
                // so this needs no cast: parsing is what produces the type.
                cache = tasksDatabaseSchema.parse(raw);
                inFlight = null;
                return cache;
            })
            .catch((error: unknown) => {
                failure = error instanceof Error ? error : new Error(String(error));
                inFlight = null;
                throw failure;
            });
    }
    return inFlight;
}

/** The loaded database. Throws if the load has not finished — see the header. */
export function loadedTasks(): TasksDatabase {
    if (!cache) {
        throw new Error(
            'The task database has not been loaded. Await fetchTasks() in a server component, '
            + 'or call useFetchTasks() in a client one before reading tasks.',
        );
    }
    return cache;
}

/** Whether a synchronous read would succeed. */
export function tasksLoaded(): boolean {
    return cache !== null;
}

export function taskById(id: string): Task | undefined {
    return loadedTasks()[id];
}

export function allTasks(): Task[] {
    return Object.values(loadedTasks());
}

/** The tasks that name this one as a prerequisite — the "unlocks" side of the chain. */
export function tasksRequiring(taskId: string): Task[] {
    return allTasks().filter((task) => task.requiredTasks.includes(taskId));
}

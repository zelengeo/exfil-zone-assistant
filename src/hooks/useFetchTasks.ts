import { fetchTasks, loadedTasks, taskById, tasksLoaded } from '@/services/TaskService';
import type { Task, TasksDatabase } from '@/types/tasks';

/**
 * Suspend until the task database is in memory, then read it synchronously.
 *
 * The same shape as `useFetchItems`, and for the same reason: everything below this call — the
 * chain layout, the progress rules, the detail pane — indexes the database dozens of times per
 * render, and suspending once at the top is what lets all of that stay synchronous.
 *
 * Call it above any code that reads tasks, and put a `<Suspense>` boundary above the component.
 * Both task routes already have one.
 */
export function useFetchTasks(): {
    tasks: TasksDatabase;
    getTaskById: (id: string) => Task | undefined;
} {
    if (tasksLoaded()) {
        return { tasks: loadedTasks(), getTaskById: taskById };
    }

    // React reads a thrown promise as "not ready"; a thrown error it shows to the boundary.
    throw fetchTasks();
}

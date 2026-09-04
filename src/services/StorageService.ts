import {UserProgress, TaskStatus, isUserProgress, TaskProgress, isTaskProgress} from '@/types/tasks';
import {SavedBuild} from '@/types/gunsmith';
import {GAME_VERSION, compareVersions} from "@/config/gameVersion";

/** Storage is a text file a user can edit, so anything read back out of it is checked. */
function isSavedBuild(value: unknown): value is SavedBuild {
    if (typeof value !== 'object' || value === null) return false;
    const build = value as Partial<SavedBuild>;
    return typeof build.id === 'string'
        && typeof build.name === 'string'
        && typeof build.receiverId === 'string'
        && Array.isArray(build.parts)
        && build.parts.every((part) => typeof part?.slotId === 'string' && typeof part?.gameId === 'string');
}

export class StorageService {
    private static VERSION_KEY = 'exfilzone_app_version';
    private static hasCheckedVersion = false;

    // All storage keys - centralized management
    private static STORAGE_KEYS = {
        // Game progress - cleared on wipe
        taskProgress: 'exfilzone-tasks',
        tasks: 'exfilzone-tasks-progress',
        hideout: 'exfilzone-hideout-progress',

        // UI preferences and player-authored content - preserved on wipe
        gunsmithBuilds: 'exfilzone-gunsmith-builds',
        cookieConsent: 'cookie-consent',
        cookieConsentDate: 'cookie-consent-date',
    } as const;

    /**
     * Keys nothing writes any more, removed on the next version check.
     *
     * Not the same idea as a wipe: these go whether or not a wipe is due, because the data behind
     * them can no longer be read by anything.
     */
    private static LEGACY_KEYS = [
        // Pre-rebuild task statuses. Superseded by `taskProgress`, and several wipes stale.
        'exfilzone-tasks-progress',
    ];

    // Keys to preserve during wipe
    private static PRESERVE_ON_WIPE = [
        // A gun build is a design the player wrote, not progress the wipe resets.
        'gunsmithBuilds',
        'cookieConsent',
        'cookieConsentDate',
    ];

    /* ----------------------------------------------------------------------
     * Task progress
     *
     * `taskProgress` is the rebuilt tasks route's store: a record per touched task rather than a
     * status string. It lives under its own key because the two shapes cannot share one — the old
     * route is still mounted while the rebuild lands, and a shared key would have each route's
     * validator reject and then overwrite the other's data on every visit.
     *
     * The old key is not migrated. It has been carrying statuses from several wipes ago, so
     * `LEGACY_KEYS` removes it outright on the next version check.
     * ------------------------------------------------------------------- */

    static getTaskProgress(): TaskProgress {
        this.checkAndHandleWipe();
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.taskProgress);
            if (!data) return {tasks: {}};
            const parsed: unknown = JSON.parse(data);
            return isTaskProgress(parsed) ? parsed : {tasks: {}};
        } catch {
            return {tasks: {}};
        }
    }

    static setTaskProgress(progress: TaskProgress): void {
        this.checkAndHandleWipe();
        localStorage.setItem(this.STORAGE_KEYS.taskProgress, JSON.stringify(progress));
    }

    // Tasks methods
    static getTasks(): UserProgress {
        this.checkAndHandleWipe();
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.tasks);
            if (!data) return {tasks: {}};
            const parsed = JSON.parse(data);
            return isUserProgress(parsed) ? parsed: {tasks: {}};
        } catch {
            return {tasks: {}};
        }
    }

    static setTasks(progress: UserProgress): void {
        this.checkAndHandleWipe();
        localStorage.setItem(this.STORAGE_KEYS.tasks, JSON.stringify(progress));
    }

    static updateTaskStatus(taskId: string, status: TaskStatus): void {
        const progress = this.getTasks();
        progress.tasks[taskId] = status;
        this.setTasks(progress);
    }

    // Hideout methods
    static getHideout(): string[] {
        this.checkAndHandleWipe();
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.hideout);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    static setHideout(data: string[]): void {
        this.checkAndHandleWipe();
        localStorage.setItem(this.STORAGE_KEYS.hideout, JSON.stringify(data));
    }

    // Gunsmith builds. Player-authored and preserved across a wipe.
    static getBuilds(): SavedBuild[] {
        this.checkAndHandleWipe();
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.gunsmithBuilds);
            if (!data) return [];
            const parsed: unknown = JSON.parse(data);
            return Array.isArray(parsed) ? parsed.filter(isSavedBuild) : [];
        } catch {
            return [];
        }
    }

    static setBuilds(builds: SavedBuild[]): void {
        this.checkAndHandleWipe();
        localStorage.setItem(this.STORAGE_KEYS.gunsmithBuilds, JSON.stringify(builds));
    }

    // Cookie consent (preserved on wipe)
    static getCookieConsent(): Record<string, boolean> {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.cookieConsent);
            return data ? JSON.parse(data) : {}
        } catch {
            return {};
        }
    }

    static setCookieConsent(preferencesString: string): void {
        localStorage.setItem(this.STORAGE_KEYS.cookieConsent, preferencesString);
    }

    static getCookieConsentDate(): Date | null {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.cookieConsentDate);
            return data ? new Date(data) : null
        } catch {
            return null;
        }
    }

    static setCookieConsentDate(dateString: string): void {
        localStorage.setItem(this.STORAGE_KEYS.cookieConsentDate, dateString);
    }

    static clearAllData(): void {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        localStorage.removeItem(this.VERSION_KEY);
        this.hasCheckedVersion = false;
    }

    // Check version once per app session
    private static checkAndHandleWipe(): void {
        if (typeof window === 'undefined') return;
        if (this.hasCheckedVersion) return;

        this.LEGACY_KEYS.forEach(key => localStorage.removeItem(key));

        const storedVersion = localStorage.getItem(this.VERSION_KEY);
        const needsWipe = !storedVersion || compareVersions(storedVersion, GAME_VERSION.lastWipe) < 0;

        if (needsWipe) {
            // Clear only game progress data
            Object.entries(this.STORAGE_KEYS).forEach(([key, storageKey]) => {
                if (!this.PRESERVE_ON_WIPE.includes(key)) {
                    localStorage.removeItem(storageKey);
                }
            });

            console.log('Game wipe detected - progress reset');
        }

        if (storedVersion !== GAME_VERSION.current) {
            localStorage.setItem(this.VERSION_KEY, GAME_VERSION.current);
        }
        this.hasCheckedVersion = true;
    }
}
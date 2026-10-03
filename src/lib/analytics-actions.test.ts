import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {Task} from '@/types/tasks';
import type {SavedBuildsState} from '@/app/gunsmith/hooks/useSavedBuilds';
import {taskSchema} from '@/lib/schemas/task';
import {loadDataFile} from '@/services/dataFiles';

const {track, storage} = vi.hoisted(() => ({
    track: vi.fn(),
    storage: {
        getBuilds: vi.fn(() => []), setBuilds: vi.fn(),
        getTaskProgress: vi.fn(() => ({tasks: {}})), setTaskProgress: vi.fn(),
        getHideout: vi.fn((): string[] => []), setHideout: vi.fn(),
    },
}));
vi.mock('@vercel/analytics', () => ({track}));
vi.mock('@/hooks/useCookiePreferences', () => ({isAnalyticsEnabled: () => true}));
vi.mock('@/services/StorageService', () => ({StorageService: storage}));

const tasks = Object.values(await loadDataFile<Record<string, Task>>('tasks.json')).map(task => taskSchema.parse(task));
const openTask = tasks.find(task => task.requiredTasks.length === 0 && task.objectives.length > 1)!;
const lockedTask = tasks.find(task => task.requiredTasks.length > 0)!;
const draft: Parameters<SavedBuildsState['save']>[0] = {name: 'Private name', receiverId: 'receiver', parts: []};

// Capture actual action callbacks through React. No effects run during SSR, so only an explicit
// action below can emit; the stores and pure progress rules are not mocked.
function actions<T>(useHook: () => T): T {
    let result!: T;
    function Harness() {result = useHook(); return null;}
    renderToString(createElement(Harness));
    return result;
}

beforeEach(() => {
    vi.resetModules();
    track.mockReset();
    Object.values(storage).forEach(mock => mock.mockClear());
    storage.setBuilds.mockReset();
    storage.setTaskProgress.mockReset();
    storage.setHideout.mockReset();
    storage.getHideout.mockReturnValue([]);
    storage.getTaskProgress.mockReturnValue({tasks: {}});
});

describe('successful explicit build saves', () => {
    it('counts create, update and save-copy once each; renders and removal emit nothing', async () => {
        const {useSavedBuilds} = await import('@/app/gunsmith/hooks/useSavedBuilds');
        const first = actions(useSavedBuilds);
        const second = actions(useSavedBuilds);
        expect(track).not.toHaveBeenCalled();
        const saved = first.save(draft);
        second.save({...draft, id: saved.id});
        first.save(draft);
        first.remove(saved.id);
        expect(track.mock.calls).toEqual([
            ['build_saved', {operation: 'create'}],
            ['build_saved', {operation: 'update'}],
            ['build_saved', {operation: 'create'}],
        ]);
    });

    it('does not count a failed write or leave a phantom build when retried', async () => {
        const {useSavedBuilds} = await import('@/app/gunsmith/hooks/useSavedBuilds');
        const builds = actions(useSavedBuilds);
        storage.setBuilds.mockImplementationOnce(() => {throw new Error('quota');});
        expect(() => builds.save({...draft, id: 'retry'})).toThrow('quota');
        expect(track).not.toHaveBeenCalled();
        builds.save({...draft, id: 'retry'});
        expect(track).toHaveBeenCalledExactlyOnceWith('build_saved', {operation: 'create'});
        expect(storage.setBuilds.mock.lastCall?.[0]).toHaveLength(1);
    });
});

describe('task completion transitions', () => {
    it('deduplicates direct completion across consumers, and never counts reset or undo', async () => {
        const {useTaskProgress} = await import('@/app/tasks/hooks/useTaskProgress');
        const first = actions(useTaskProgress);
        const second = actions(useTaskProgress);
        expect(track).not.toHaveBeenCalled();
        first.setDone(openTask, true);
        second.setDone(openTask, true);
        expect(track).toHaveBeenCalledTimes(1);
        first.setDone(openTask, false);
        first.reset();
        expect(track).toHaveBeenCalledTimes(1);
        second.setDone(openTask, true);
        expect(track).toHaveBeenCalledTimes(2);
    });

    it('counts the final objective once, with the same deduplication as direct completion', async () => {
        const {useTaskProgress} = await import('@/app/tasks/hooks/useTaskProgress');
        const progress = actions(useTaskProgress);
        openTask.objectives.slice(0, -1).forEach((_, index) => progress.toggleObjective(openTask, index));
        expect(track).not.toHaveBeenCalled();
        progress.toggleObjective(openTask, openTask.objectives.length - 1);
        actions(useTaskProgress).setDone(openTask, true);
        expect(track).toHaveBeenCalledTimes(1);
        progress.toggleObjective(openTask, 0);
        expect(track).toHaveBeenCalledTimes(1);
    });

    it('ignores locked tasks, invalid objectives and failed storage writes', async () => {
        const {useTaskProgress} = await import('@/app/tasks/hooks/useTaskProgress');
        const progress = actions(useTaskProgress);
        progress.setDone(lockedTask, true);
        progress.toggleObjective(lockedTask, 0);
        progress.toggleObjective(openTask, -1);
        progress.toggleObjective(openTask, openTask.objectives.length);
        storage.setTaskProgress.mockImplementation(() => {throw new Error('quota');});
        progress.setDone(openTask, true);
        progress.setDone(openTask, true);
        expect(track).not.toHaveBeenCalled();
    });

    it('does not replay persisted completions', async () => {
        storage.getTaskProgress.mockReturnValue({tasks: {[openTask.id]: {done: true, objectives: []}}});
        const {useTaskProgress} = await import('@/app/tasks/hooks/useTaskProgress');
        actions(useTaskProgress).setDone(openTask, true);
        expect(track).not.toHaveBeenCalled();
    });

    it.each(['standard', 'daily', 'research'] as const)('uses published game ids for kind: %s', async kind => {
        const {useTaskProgress} = await import('@/app/tasks/hooks/useTaskProgress');
        const progress = actions(useTaskProgress);
        const task = tasks.find(task => kind === 'standard'
            ? task.type.includes('gunsmith')
            : task.gameId.startsWith(`task.${kind}.`))!;
        for (const id of task.requiredTasks) {
            progress.setDone({...openTask, id, requiredTasks: []}, true);
        }
        track.mockClear();
        progress.setDone(task, true);
        expect(track).toHaveBeenCalledExactlyOnceWith('task_completed', {kind});
    });
});

describe('hideout built transitions', () => {
    it('counts each new built state once across consumers, with the canonical room', async () => {
        const {useHideoutProgress} = await import('@/app/hideout-upgrades/hooks/useHideoutProgress');
        const {UPGRADES} = await import('@/app/hideout-upgrades/utils/hideout');
        const id = 'GeneratorLv1';
        const first = actions(useHideoutProgress);
        const second = actions(useHideoutProgress);
        expect(track).not.toHaveBeenCalled();
        first.setBuilt(id, true);
        second.setBuilt(id, true);
        expect(track).toHaveBeenCalledExactlyOnceWith('hideout_upgrade_built', {room: UPGRADES[id].categoryId});
        first.setBuilt(id, false);
        first.reset();
        expect(track).toHaveBeenCalledTimes(1);
        second.setBuilt(id, true);
        expect(track).toHaveBeenCalledTimes(2);
    });

    it('does not replay persisted built upgrades or count failed writes', async () => {
        storage.getHideout.mockReturnValue(['GeneratorLv1']);
        const {useHideoutProgress} = await import('@/app/hideout-upgrades/hooks/useHideoutProgress');
        const progress = actions(useHideoutProgress);
        progress.setBuilt('GeneratorLv1', true);
        storage.setHideout.mockImplementation(() => {throw new Error('quota');});
        progress.setBuilt('GeneratorLv2', true);
        expect(track).not.toHaveBeenCalled();
    });
});

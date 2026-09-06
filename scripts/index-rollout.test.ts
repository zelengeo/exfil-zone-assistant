import { describe, expect, it, vi } from 'vitest';

import {
    applyIndexes,
    describeTarget,
    previewIndexes,
    REQUIRED_CONSTRAINTS,
    verifyConstraints,
    type RollableModel,
} from './index-rollout';

interface FakeOptions {
    toCreate?: unknown[];
    toDrop?: string[];
    dropped?: string[];
    syncError?: Error;
    indexes?: { name?: string; unique?: boolean }[];
}

function fakeModel(modelName: string, options: FakeOptions = {}) {
    const diffIndexes = vi.fn(async () => ({
        toCreate: options.toCreate ?? [],
        toDrop: options.toDrop ?? [],
    }));
    const syncIndexes = vi.fn(async () => {
        if (options.syncError) throw options.syncError;
        return options.dropped ?? [];
    });
    const indexes = vi.fn(async () => options.indexes ?? []);

    const model: RollableModel = {
        modelName,
        diffIndexes,
        syncIndexes,
        collection: { indexes },
    };

    return { model, diffIndexes, syncIndexes, indexes };
}

const uniqueIdentityIndexes = [
    { name: '_id_' },
    { name: 'email_1', unique: true },
    { name: 'username_1', unique: true },
];

function collect() {
    const lines: string[] = [];
    return { log: (line: string) => lines.push(line), lines };
}

describe('describeTarget', () => {
    it('shows host and database but never credentials', () => {
        const described = describeTarget('mongodb+srv://admin:hunter2@cluster0.example.net/exfilzone?retryWrites=true');

        expect(described).toBe('mongodb+srv://cluster0.example.net/exfilzone');
        expect(described).not.toContain('hunter2');
        expect(described).not.toContain('admin');
    });

    it('names a missing database rather than printing an empty path', () => {
        expect(describeTarget('mongodb://127.0.0.1:27018')).toBe('mongodb://127.0.0.1:27018/(default)');
    });

    it('does not throw on an unparseable URI', () => {
        expect(describeTarget('not a uri')).toBe('(unparseable MONGODB_URI)');
    });
});

describe('previewIndexes', () => {
    it('writes nothing — it only diffs', async () => {
        const user = fakeModel('User', { toDrop: ['_id_1_isBanned_1'] });
        const account = fakeModel('Account');
        const { log } = collect();

        await previewIndexes([user.model, account.model], log);

        // The whole point of a preview: syncIndexes is the call that drops things.
        expect(user.syncIndexes).not.toHaveBeenCalled();
        expect(account.syncIndexes).not.toHaveBeenCalled();
        expect(user.diffIndexes).toHaveBeenCalledOnce();
    });

    it('reports pending changes, marking drops loudly', async () => {
        const user = fakeModel('User', {
            toCreate: [{ key: { email: 1 } }],
            toDrop: ['stale_1'],
        });
        const { log, lines } = collect();

        await expect(previewIndexes([user.model], log)).resolves.toBe(true);

        expect(lines.some(line => line.includes('+ create'))).toBe(true);
        expect(lines.some(line => line.includes('- DROP   stale_1'))).toBe(true);
    });

    it('reports no pending changes when everything matches', async () => {
        const { log, lines } = collect();

        await expect(previewIndexes([fakeModel('User').model], log)).resolves.toBe(false);
        expect(lines).toContain('  User: up to date');
    });
});

describe('applyIndexes', () => {
    it('applies each model exactly once', async () => {
        const user = fakeModel('User', { dropped: ['stale_1'] });
        const account = fakeModel('Account');
        const { log } = collect();

        await applyIndexes([user.model, account.model], log, log);

        // The previous script called createIndexes and then syncIndexes, building everything twice.
        expect(user.syncIndexes).toHaveBeenCalledOnce();
        expect(account.syncIndexes).toHaveBeenCalledOnce();
    });

    it('throws when a model fails, rather than reporting completion', async () => {
        const failing = fakeModel('User', { syncError: new Error('index build failed') });
        const healthy = fakeModel('Account');
        const { log } = collect();

        await expect(applyIndexes([failing.model, healthy.model], log, log))
            .rejects.toThrow('Index application failed for: User');

        // Every model is still attempted, so one failure does not hide the state of the rest.
        expect(healthy.syncIndexes).toHaveBeenCalledOnce();
    });

    it('names every failing model', async () => {
        const first = fakeModel('User', { syncError: new Error('boom') });
        const second = fakeModel('Feedback', { syncError: new Error('boom') });
        const { log } = collect();

        await expect(applyIndexes([first.model, second.model], log, log))
            .rejects.toThrow('Index application failed for: User, Feedback');
    });
});

describe('verifyConstraints', () => {
    const constraints = REQUIRED_CONSTRAINTS.filter(c => c.model === 'User');

    it('passes when every required index exists and is unique', async () => {
        const user = fakeModel('User', { indexes: uniqueIdentityIndexes });
        const { log } = collect();

        await expect(verifyConstraints([user.model], log, log, constraints)).resolves.toBeUndefined();
    });

    it('fails when a required index is absent', async () => {
        const user = fakeModel('User', { indexes: [{ name: 'email_1', unique: true }] });
        const { log } = collect();

        await expect(verifyConstraints([user.model], log, log, constraints))
            .rejects.toThrow('Required unique constraints absent: User.username_1');
    });

    it('fails when a required index exists but is not unique', async () => {
        // The exact case the old script could not catch: present, so it looked fine, but
        // non-unique, so it enforced nothing.
        const user = fakeModel('User', {
            indexes: [{ name: 'email_1', unique: true }, { name: 'username_1' }],
        });
        const { log } = collect();

        await expect(verifyConstraints([user.model], log, log, constraints))
            .rejects.toThrow('User.username_1');
    });

    it('fails when a required model is not registered at all', async () => {
        const { log } = collect();

        await expect(verifyConstraints([], log, log, constraints))
            .rejects.toThrow('Required unique constraints absent');
    });

    it('covers identity uniqueness for both User and Account', () => {
        expect(REQUIRED_CONSTRAINTS.map(c => `${c.model}.${c.index}`)).toEqual([
            'User.email_1',
            'User.username_1',
            'Account.provider_1_providerAccountId_1',
        ]);
    });
});

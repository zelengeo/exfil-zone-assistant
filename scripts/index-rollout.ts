/**
 * The index rollout, separated from the command that runs it so preview and apply can be tested
 * against fakes without a database. `scripts/sync-mongodb-indexes.ts` is the CLI over this.
 */

/** The slice of a Mongoose model this rollout uses. */
export interface RollableModel {
    modelName: string;
    diffIndexes(): Promise<{ toCreate: unknown[]; toDrop: string[] }>;
    syncIndexes(): Promise<string[]>;
    collection: {
        indexes(): Promise<{ name?: string; unique?: boolean }[]>;
    };
}

export interface RequiredConstraint {
    model: string;
    index: string;
    description: string;
}

/**
 * Constraints the application's correctness depends on: identity uniqueness. A rollout that leaves
 * any of these absent has failed, whatever else it managed to build.
 */
export const REQUIRED_CONSTRAINTS: RequiredConstraint[] = [
    { model: 'User', index: 'email_1', description: 'one account per email' },
    { model: 'User', index: 'username_1', description: 'one account per username' },
    {
        model: 'Account',
        index: 'provider_1_providerAccountId_1',
        description: 'one link per provider identity',
    },
];

export type Log = (line: string) => void;

/** Host and database only — a connection string carries credentials. */
export function describeTarget(uri: string): string {
    try {
        const parsed = new URL(uri);
        const database = parsed.pathname.replace(/^\//, '') || '(default)';
        return `${parsed.protocol}//${parsed.host}/${database}`;
    } catch {
        return '(unparseable MONGODB_URI)';
    }
}

/**
 * What `--apply` would change, per model. `diffIndexes` is read-only; that is the whole reason a
 * preview can be trusted not to mutate. Returns whether anything is pending.
 */
export async function previewIndexes(models: RollableModel[], log: Log): Promise<boolean> {
    let changes = false;

    for (const model of models) {
        const { toCreate, toDrop } = await model.diffIndexes();

        if (toCreate.length === 0 && toDrop.length === 0) {
            log(`  ${model.modelName}: up to date`);
            continue;
        }

        changes = true;
        log(`  ${model.modelName}:`);
        for (const index of toCreate) {
            log(`    + create ${JSON.stringify(index)}`);
        }
        for (const name of toDrop) {
            log(`    - DROP   ${name}`);
        }
    }

    return changes;
}

/** One pass per model. Not createIndexes followed by syncIndexes, which built everything twice. */
export async function applyIndexes(models: RollableModel[], log: Log, logError: Log): Promise<void> {
    const failures: string[] = [];

    for (const model of models) {
        try {
            const dropped = await model.syncIndexes();
            log(`  ${model.modelName}: applied${dropped.length ? `, dropped ${dropped.join(', ')}` : ''}`);
        } catch (error) {
            // Recorded and rethrown at the end: one broken model must not be reported as success,
            // and stopping at the first hides the rest of the damage from the operator.
            const message = error instanceof Error ? error.message : String(error);
            logError(`  ${model.modelName}: FAILED — ${message}`);
            failures.push(model.modelName);
        }
    }

    if (failures.length > 0) {
        throw new Error(`Index application failed for: ${failures.join(', ')}`);
    }
}

export async function verifyConstraints(
    models: RollableModel[],
    log: Log,
    logError: Log,
    constraints: RequiredConstraint[] = REQUIRED_CONSTRAINTS,
): Promise<void> {
    const missing: string[] = [];

    for (const constraint of constraints) {
        const model = models.find(candidate => candidate.modelName === constraint.model);

        if (!model) {
            logError(`  ❌ ${constraint.model} is not registered`);
            missing.push(`${constraint.model}.${constraint.index}`);
            continue;
        }

        // indexes(), not getIndexes(): the compact form omits options such as `unique`.
        const indexes = await model.collection.indexes();
        const found = indexes.find(index => index.name === constraint.index);

        if (found?.unique) {
            log(`  ✅ ${constraint.model}.${constraint.index} — ${constraint.description}`);
        } else {
            logError(`  ❌ ${constraint.model}.${constraint.index} is missing or not unique`);
            missing.push(`${constraint.model}.${constraint.index}`);
        }
    }

    if (missing.length > 0) {
        throw new Error(`Required unique constraints absent: ${missing.join(', ')}`);
    }
}

import type { Account as OAuthAccount, Profile, User as NextAuthUser } from 'next-auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
    process.env.NEXTAUTH_URL ??= 'http://localhost:3000';

    return {
        accountCreate: vi.fn(),
        accountFindOne: vi.fn(),
        connectDB: vi.fn(),
        createUserDocument: vi.fn(),
        endSession: vi.fn(),
        ensureUniqueUsername: vi.fn(),
        generateUsername: vi.fn(),
        startSession: vi.fn(),
        userFindById: vi.fn(),
        userFindOne: vi.fn(),
        userSave: vi.fn(),
    };
});

vi.mock('@/lib/mongodb', () => ({
    connectDB: mocks.connectDB,
    mongoose: {
        startSession: mocks.startSession,
    },
}));

vi.mock('@/models/User', () => ({
    User: Object.assign(
        function UserModel(data: unknown) {
            return mocks.createUserDocument(data);
        },
        {
            findById: mocks.userFindById,
            findOne: mocks.userFindOne,
        },
    ),
}));

vi.mock('@/models/Account', () => ({
    Account: {
        create: mocks.accountCreate,
        findOne: mocks.accountFindOne,
    },
}));

vi.mock('@/lib/auth/username', () => ({
    ensureUniqueUsername: mocks.ensureUniqueUsername,
    generateUsername: mocks.generateUsername,
}));

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const existingUser = {
    _id: { toString: () => '68bd5cf7c48ae02f50b1c200' },
    roles: ['user', 'admin'],
    rank: 'elite',
    save: mocks.userSave,
};

const discordAccount: OAuthAccount = {
    provider: 'discord',
    providerAccountId: 'discord-operator-1',
    type: 'oauth',
};

const googleAccount: OAuthAccount = {
    provider: 'google',
    providerAccountId: 'google-operator-1',
    type: 'oauth',
};

const nextAuthUser: NextAuthUser = {
    id: 'discord-operator-1',
    email: 'admin@example.com',
    name: 'Operator',
    image: null,
    displayName: 'Operator',
    username: 'operator',
    avatarUrl: undefined,
    rank: 'recruit',
    roles: ['user'],
    isBanned: false,
};

function queryReturning<T>(value: T) {
    return {
        session: vi.fn().mockResolvedValue(value),
    };
}

interface TransactionalUser {
    _id: { toString(): string };
    lastLoginAt?: Date;
    rank: 'recruit' | 'elite';
    roles: Array<'user' | 'admin'>;
    save: ReturnType<typeof vi.fn>;
}

interface TestSession {
    endSession(): Promise<void>;
    stageUser(user: TransactionalUser): void;
    withTransaction<T>(work: () => Promise<T>): Promise<T>;
}

function createTransactionalSession(committedUsers: Map<string, TransactionalUser>): TestSession {
    const stagedUsers = new Map<string, TransactionalUser>();

    return {
        async endSession() {},
        stageUser(user) {
            stagedUsers.set(user._id.toString(), user);
        },
        async withTransaction<T>(work: () => Promise<T>) {
            const result = await work();
            for (const [id, user] of stagedUsers) committedUsers.set(id, user);
            return result;
        },
    };
}

function createTransactionalUser(id: string): TransactionalUser {
    const user: TransactionalUser = {
        _id: { toString: () => id },
        rank: 'recruit',
        roles: ['user'],
        save: vi.fn(),
    };
    user.save.mockImplementation(async (options?: { session?: TestSession }) => {
        options?.session?.stageUser(user);
        return user;
    });
    return user;
}

async function signIn(
    profile: Profile,
    account: OAuthAccount = discordAccount,
    userOverrides: Partial<NextAuthUser> = {},
): Promise<{ result: string | boolean; user: NextAuthUser }> {
    if (!authOptions.callbacks?.signIn) throw new Error('signIn callback is not configured');

    const user = { ...nextAuthUser, ...userOverrides };
    const result = await authOptions.callbacks.signIn({
        account,
        profile,
        user,
    });

    return { result, user };
}

describe('OAuth sign-in', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.connectDB.mockResolvedValue(undefined);
        mocks.ensureUniqueUsername.mockResolvedValue('operator');
        mocks.generateUsername.mockReturnValue('operator');
        mocks.startSession.mockResolvedValue({
            endSession: mocks.endSession,
            withTransaction: async <T>(work: () => Promise<T>) => work(),
        });
        mocks.userFindById.mockReturnValue(queryReturning(existingUser));
        mocks.userFindOne.mockReturnValue(queryReturning(existingUser));
        mocks.accountFindOne.mockReturnValue(queryReturning(null));
        mocks.accountCreate.mockResolvedValue(undefined);
        mocks.userSave.mockResolvedValue(existingUser);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it.each([
        ['Discord false', discordAccount, { email: 'admin@example.com', verified: false }],
        ['Discord absent verification', discordAccount, { email: 'admin@example.com' }],
        ['Discord missing email', discordAccount, { verified: true }],
        ['Discord malformed email', discordAccount, { email: 'not-an-email', verified: true }],
        ['Google false', googleAccount, { email: 'admin@example.com', email_verified: false }],
        ['Google absent verification', googleAccount, { email: 'admin@example.com' }],
        ['Google missing email', googleAccount, { email_verified: true }],
        ['Google malformed email', googleAccount, { email: 'not-an-email', email_verified: true }],
    ])('rejects a new link with a %s claim', async (_case, account, profile) => {
        const providerProfile: Profile & Record<string, unknown> = profile;

        await expect(signIn(providerProfile, account)).resolves.toMatchObject({ result: false });
        expect(mocks.accountCreate).not.toHaveBeenCalled();
    });

    it.each([
        ['Discord', discordAccount, { email: ' Existing@Example.COM ', verified: true }],
        ['Google', googleAccount, { email: ' Existing@Example.COM ', email_verified: true }],
    ])('links a verified %s identity to the existing normalized email owner', async (_case, account, profile) => {
        const providerProfile: Profile & Record<string, unknown> = profile;
        const { result, user } = await signIn(providerProfile, account);

        expect(result).toBe(true);
        expect(user.id).toBe(existingUser._id.toString());
    });

    it.each([
        ['Discord', discordAccount, { email: 'changed@example.com', verified: true }],
        ['Google', googleAccount, { email: 'changed@example.com', email_verified: true }],
    ])('keeps an existing %s identity on its linked user when the provider email belongs to another user', async (
        _case,
        account,
        profile,
    ) => {
        const linkedUser = {
            ...existingUser,
            _id: { toString: () => '68bd5cf7c48ae02f50b1c300' },
            roles: ['user'],
            rank: 'recruit',
        };
        const conflictingEmailOwner = {
            ...existingUser,
            _id: { toString: () => '68bd5cf7c48ae02f50b1c301' },
        };
        mocks.accountFindOne.mockReturnValue(queryReturning({ userId: linkedUser._id }));
        mocks.userFindById.mockReturnValue(queryReturning(linkedUser));
        mocks.userFindOne.mockReturnValue(queryReturning(conflictingEmailOwner));

        const providerProfile: Profile & Record<string, unknown> = profile;
        const { result, user } = await signIn(providerProfile, account, {
            email: 'changed@example.com',
        });

        expect(result).toBe(true);
        expect(user.id).toBe(linkedUser._id.toString());
        expect(mocks.userFindOne).not.toHaveBeenCalled();
        expect(mocks.accountCreate).not.toHaveBeenCalled();
    });

    it('does not bootstrap an admin from an unverified email on an existing link', async () => {
        vi.stubEnv('ADMIN_EMAIL_1', 'admin@example.com');
        const linkedUser = {
            ...existingUser,
            roles: ['user'],
            rank: 'recruit',
        };
        mocks.accountFindOne.mockReturnValue(queryReturning({ userId: linkedUser._id }));
        mocks.userFindById.mockReturnValue(queryReturning(linkedUser));

        const profile: Profile & { verified: boolean } = {
            email: 'admin@example.com',
            verified: false,
        };
        const { result } = await signIn(profile);

        expect(result).toBe(true);
        expect(linkedUser.roles).toEqual(['user']);
        expect(linkedUser.rank).toBe('recruit');
    });

    it('bootstraps an admin only from a verified configured email', async () => {
        vi.stubEnv('ADMIN_EMAIL_1', 'ADMIN@example.com');
        const member = {
            ...existingUser,
            roles: ['user'],
            rank: 'recruit',
        };
        mocks.userFindOne.mockReturnValue(queryReturning(member));

        const profile: Profile & { email_verified: boolean } = {
            email: ' admin@EXAMPLE.com ',
            email_verified: true,
        };
        const { result } = await signIn(profile, googleAccount);

        expect(result).toBe(true);
        expect(member.roles).toEqual(['user', 'admin']);
        expect(member.rank).toBe('elite');
    });

    it('rejects an existing provider link whose user no longer exists', async () => {
        mocks.accountFindOne.mockReturnValue(queryReturning({ userId: existingUser._id }));
        mocks.userFindById.mockReturnValue(queryReturning(null));

        const { result } = await signIn({});

        expect(result).toBe(false);
    });

    it('migrates a legacy North America location before saving an existing linked user', async () => {
        const legacyUser = {
            ...existingUser,
            location: 'na',
            rank: 'recruit' as const,
            roles: ['user'] as Array<'user' | 'admin'>,
            save: vi.fn(),
        };
        legacyUser.save.mockImplementation(async () => {
            if (legacyUser.location === 'na') {
                throw new Error('User validation failed: location is not a valid enum value');
            }

            return legacyUser;
        });
        mocks.accountFindOne.mockReturnValue(queryReturning({ userId: legacyUser._id }));
        mocks.userFindById.mockReturnValue(queryReturning(legacyUser));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const { result } = await signIn({});

        consoleError.mockRestore();
        expect(result).toBe(true);
        expect(legacyUser.location).toBe('us_west');
    });

    it('rolls back a new user when its provider link write fails', async () => {
        const committedUsers = new Map<string, TransactionalUser>();
        const candidate = createTransactionalUser('68bd5cf7c48ae02f50b1c400');
        mocks.startSession.mockImplementation(async () => createTransactionalSession(committedUsers));
        mocks.userFindOne.mockReturnValue(queryReturning(null));
        mocks.createUserDocument.mockReturnValue(candidate);
        mocks.accountCreate.mockRejectedValue(new Error('provider link write failed'));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const profile: Profile & { verified: boolean } = {
            email: 'new@example.com',
            verified: true,
        };
        const { result } = await signIn(profile);

        consoleError.mockRestore();
        expect(result).toBe(false);
        expect(committedUsers.size).toBe(0);
    });

    it('adopts the canonical provider link after a concurrent unique-key winner', async () => {
        const committedUsers = new Map<string, TransactionalUser>();
        const losingCandidate = createTransactionalUser('68bd5cf7c48ae02f50b1c500');
        const canonicalUser = createTransactionalUser('68bd5cf7c48ae02f50b1c600');
        let canonicalAccountExists = false;

        mocks.startSession.mockImplementation(async () => createTransactionalSession(committedUsers));
        mocks.accountFindOne.mockImplementation(() => queryReturning(
            canonicalAccountExists ? { userId: canonicalUser._id } : null,
        ));
        mocks.userFindOne.mockImplementation(() => queryReturning(
            committedUsers.get(canonicalUser._id.toString()) ?? null,
        ));
        mocks.userFindById.mockImplementation(() => queryReturning(canonicalUser));
        mocks.createUserDocument.mockReturnValue(losingCandidate);
        mocks.accountCreate.mockImplementation(async () => {
            committedUsers.set(canonicalUser._id.toString(), canonicalUser);
            canonicalAccountExists = true;
            throw { code: 11000 };
        });

        const profile: Profile & { verified: boolean } = {
            email: 'new@example.com',
            verified: true,
        };
        const { result, user } = await signIn(profile);

        expect(result).toBe(true);
        expect(user.id).toBe(canonicalUser._id.toString());
        expect([...committedUsers]).toEqual([[canonicalUser._id.toString(), canonicalUser]]);
    });

    it('converges concurrent cross-provider sign-ins on one verified email owner', async () => {
        const committedAccounts = new Set<string>();
        let committedUser: TransactionalUser | null = null;
        let transactionQueue = Promise.resolve();

        mocks.startSession.mockImplementation(async () => ({
            async endSession() {},
            async withTransaction<T>(work: () => Promise<T>) {
                const previous = transactionQueue;
                let release: () => void = () => {};
                transactionQueue = new Promise<void>(resolve => {
                    release = resolve;
                });
                await previous;

                try {
                    return await work();
                } finally {
                    release();
                }
            },
        }));
        mocks.accountFindOne.mockImplementation((identity: { provider: string; providerAccountId: string }) => ({
            session: vi.fn().mockImplementation(async () => (
                committedAccounts.has(`${identity.provider}:${identity.providerAccountId}`) && committedUser
                    ? { userId: committedUser._id }
                    : null
            )),
        }));
        mocks.userFindOne.mockImplementation(() => ({
            session: vi.fn().mockImplementation(async () => committedUser),
        }));
        mocks.userFindById.mockImplementation(() => queryReturning(committedUser));
        mocks.createUserDocument.mockImplementation(() => {
            const candidate = createTransactionalUser('68bd5cf7c48ae02f50b1c700');
            candidate.save.mockImplementation(async () => {
                committedUser = candidate;
                return candidate;
            });
            return candidate;
        });
        mocks.accountCreate.mockImplementation(async (records: Array<{
            provider: string;
            providerAccountId: string;
        }>) => {
            const [record] = records;
            committedAccounts.add(`${record.provider}:${record.providerAccountId}`);
        });

        const discordProfile: Profile & { verified: boolean } = {
            email: 'shared@example.com',
            verified: true,
        };
        const googleProfile: Profile & { email_verified: boolean } = {
            email: 'shared@example.com',
            email_verified: true,
        };
        const [discordResult, googleResult] = await Promise.all([
            signIn(discordProfile, discordAccount),
            signIn(googleProfile, googleAccount),
        ]);

        expect(discordResult.result).toBe(true);
        expect(googleResult.result).toBe(true);
        expect(discordResult.user.id).toBe('68bd5cf7c48ae02f50b1c700');
        expect(googleResult.user.id).toBe('68bd5cf7c48ae02f50b1c700');
        expect(mocks.createUserDocument).toHaveBeenCalledTimes(1);
        expect(committedAccounts).toEqual(new Set([
            'discord:discord-operator-1',
            'google:google-operator-1',
        ]));
    });

    describe('persisted account record', () => {
        const TOKEN_FIELDS = [
            'access_token', 'refresh_token', 'id_token', 'expires_at',
            'token_type', 'scope', 'session_state', 'oauth_token', 'oauth_token_secret',
        ];

        // A provider hands NextAuth every one of these; none of them may reach the database.
        const accountWithTokens: OAuthAccount = {
            ...discordAccount,
            access_token: 'provider-access-token',
            refresh_token: 'provider-refresh-token',
            id_token: 'provider-id-token',
            expires_at: 1_800_000_000,
            token_type: 'bearer',
            scope: 'identify email',
            session_state: 'provider-session-state',
        };

        function createdRecord(): Record<string, unknown> {
            expect(mocks.accountCreate).toHaveBeenCalledOnce();
            const [records] = mocks.accountCreate.mock.calls[0] as [Record<string, unknown>[]];
            return records[0];
        }

        function expectIdentityOnly(record: Record<string, unknown>) {
            expect(Object.keys(record).sort())
                .toEqual(['provider', 'providerAccountId', 'type', 'userId']);

            const serialized = JSON.stringify(record);
            for (const field of TOKEN_FIELDS) {
                expect(record, field).not.toHaveProperty(field);
            }
            expect(serialized).not.toContain('provider-access-token');
            expect(serialized).not.toContain('provider-refresh-token');
            expect(serialized).not.toContain('provider-id-token');
            expect(serialized).not.toContain('provider-session-state');
        }

        it('stores identity only when linking a provider to an existing user', async () => {
            mocks.accountFindOne.mockReturnValue(queryReturning(null));
            mocks.userFindOne.mockReturnValue(queryReturning(existingUser));

            const { result } = await signIn({ email: 'admin@example.com', verified: true } as Profile, accountWithTokens);

            expect(result).toBe(true);
            expectIdentityOnly(createdRecord());
        });

        it('stores identity only for a brand new user', async () => {
            mocks.accountFindOne.mockReturnValue(queryReturning(null));
            mocks.userFindOne.mockReturnValue(queryReturning(null));
            mocks.generateUsername.mockReturnValue('operator');
            mocks.ensureUniqueUsername.mockResolvedValue('operator');
            mocks.createUserDocument.mockReturnValue({
                _id: { toString: () => '68bd5cf7c48ae02f50b1c900' },
                roles: ['user'],
                rank: 'recruit',
                save: mocks.userSave,
            });

            const { result } = await signIn({ email: 'new@example.com', verified: true } as Profile, accountWithTokens);

            expect(result).toBe(true);
            expectIdentityOnly(createdRecord());
        });
    });
});

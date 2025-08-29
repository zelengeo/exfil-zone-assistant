db = db.getSiblingDB('exfil-zone-assistant');

db.createUser({
    user: 'exfilzone-user',
    pwd: 'exfilzone-password',
    roles: [
        {
            role: 'readWrite',
            db: 'exfil-zone-assistant',
        },
    ],
});

// Create collections
db.createCollection('users');
db.createCollection('accounts');
db.createCollection('sessions');
db.createCollection('feedback');
db.createCollection('verification_tokens');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true, sparse: true });
db.sessions.createIndex({ sessionToken: 1 }, { unique: true });
db.sessions.createIndex({ userId: 1 });
db.accounts.createIndex({ userId: 1 });
db.accounts.createIndex({ providerId: 1, providerAccountId: 1 }, { unique: true });
db.feedback.createIndex({ userId: 1, createdAt: -1 });
db.feedback.createIndex({ status: 1, priority: 1 });
db.verification_tokens.createIndex({ identifier: 1, token: 1 }, { unique: true });

print('Database initialized with collections and indexes');
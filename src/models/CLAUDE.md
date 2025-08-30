# MongoDB Models Guidelines

## Directory Structure
```
models/
├── User.ts           # User accounts and profiles
├── Account.ts        # OAuth provider accounts (NextAuth)
├── Session.ts        # User sessions (commented out - using JWT)
├── Feedback.ts       # User feedback and bug reports
├── DataCorrection.ts # Community data corrections
└── VerificationToken.ts # Email verification tokens
```

## Core Models

### User Model (`User.ts`)
The central model for user accounts with extensive features.

```typescript
const UserSchema = new Schema({
    // Authentication
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, sparse: true },
    displayName: String,
    avatarUrl: String,

    // Profile
    bio: { type: String, maxLength: 500 },
    location: {
        type: String,
        enum: ['us_west', 'eu', 'us_east', 'apj'],
        default: 'us_west'
    },
    vrHeadset: {
        type: String,
        enum: ['quest2', 'quest3', 'questpro', 'pico4', 'index', 'vive', 'psvr2', 'other'],
        default: null
    },

    // Contribution Stats
    stats: {
        feedbackSubmitted: { type: Number, default: 0 },
        bugsReported: { type: Number, default: 0 },
        featuresProposed: { type: Number, default: 0 },
        dataCorrections: { type: Number, default: 0 },
        correctionsAccepted: { type: Number, default: 0 },
        contributionPoints: { type: Number, default: 0 },
    },

    // Gamification
    level: { type: Number, default: 1 },
    rank: {
        type: String,
        enum: ['recruit', 'soldier', 'specialist', 'veteran', 'elite'],
        default: 'recruit'
    },
    badges: [{
        id: String,
        name: String,
        description: String,
        earnedAt: { type: Date, default: Date.now },
    }],

    // Permissions
    roles: [{
        type: String,
        enum: ['user', 'contributor', 'moderator', 'partner', 'admin'],
    }],

    // Preferences
    preferences: {
        emailNotifications: { type: Boolean, default: true },
        publicProfile: { type: Boolean, default: true },
        showContributions: { type: Boolean, default: true },
    },

    // Metadata
    emailVerified: Date,
    createdAt: { type: Date, default: Date.now },
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: String,
});
```

**Key Indexes:**
```typescript
// Performance-critical indexes
UserSchema.index({ _id: 1, isBanned: 1 });                    // Auth checks
UserSchema.index({ _id: 1, roles: 1 });                       // Role checks
UserSchema.index({ _id: 1, isBanned: 1, roles: 1 });         // Complete auth
UserSchema.index({ 'stats.contributionPoints': -1 });         // Leaderboards
UserSchema.index({ createdAt: -1 });                          // New users
UserSchema.index({ lastLoginAt: -1 });                        // Active users
```

### Account Model (`Account.ts`)
OAuth provider accounts linked to users (NextAuth requirement).

```typescript
const AccountSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: String,
    provider: String,           // 'discord' | 'google'
    providerAccountId: String,
    
    // OAuth tokens
    refresh_token: String,
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
    session_state: String,
});

// Required by NextAuth
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
AccountSchema.index({ userId: 1 });
```

### Feedback Model (`Feedback.ts`)
User feedback, bug reports, and feature requests.

```typescript
const FeedbackSchema = new Schema({
    type: {
        type: String,
        enum: ['bug', 'feature', 'content', 'other'],
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'inProgress', 'resolved', 'rejected', 'archived'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    title: { type: String, required: true, maxLength: 200 },
    description: { type: String, required: true, maxLength: 5000 },
    
    // Review trail
    reviewerNotes: [{
        note: { type: String, required: true, maxLength: 5000 },
        timestamp: { type: Date, default: Date.now },
        addedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
    }],

    category: {
        type: String,
        enum: ['ui', 'performance', 'data', 'gameplay', 'other']
    },

    userId: { type: Schema.Types.ObjectId, ref: 'User' },

    // Context
    screenshots: [String],
    pageUrl: String,
    userAgent: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Optimized indexes for common queries
FeedbackSchema.index({ status: 1, priority: -1, createdAt: -1 });
FeedbackSchema.index({ type: 1, status: 1 });
FeedbackSchema.index({ userId: 1, type: 1, createdAt: -1 });
```

### DataCorrection Model (`DataCorrection.ts`)
Community-submitted corrections for game data.

```typescript
const DataCorrectionSchema = new Schema({
    entityType: {
        type: String,
        enum: ['item', 'task', 'npc', 'location', 'quest'],
        required: true,
        index: true
    },
    entityId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'implemented'],
        default: 'pending',
        index: true
    },

    // Store proposed changes as flexible JSON
    proposedData: {
        type: Schema.Types.Mixed,
        required: true
    },

    reason: {
        type: String,
        maxLength: 1000
    },

    // Review metadata
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: {
        type: String,
        maxLength: 500
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Compound indexes for efficient queries
DataCorrectionSchema.index({ entityType: 1, entityId: 1, status: 1, createdAt: -1 });
DataCorrectionSchema.index({ userId: 1, status: 1, createdAt: -1 });
```

## Schema Design Patterns

### Timestamps Pattern
```typescript
// Automatic timestamp management
const TimestampedSchema = new Schema({
    // ... fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
TimestampedSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});
```

### Reference Pattern
```typescript
// Reference to another collection
userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',        // Collection name
    required: true
}

// Populate when querying
const feedback = await Feedback
    .findById(id)
    .populate('userId', 'username displayName avatarUrl');
```

### Enum Pattern
```typescript
// Import from shared schema
import { statusEnum } from "@/lib/schemas/feedback";

// Use in model
status: {
    type: String,
    enum: statusEnum,    // ['new', 'inProgress', 'resolved', ...]
    default: 'new'
}
```

### Mixed/Flexible Data Pattern
```typescript
// For storing variable structure data
proposedData: {
    type: Schema.Types.Mixed,  // Can store any JSON structure
    required: true
}

// Validate structure at API level with Zod
```

## Index Strategies

### Single Field Index
```typescript
// For simple lookups
Schema.index({ email: 1 });        // Ascending
Schema.index({ createdAt: -1 });   // Descending
```

### Compound Index
```typescript
// For multi-field queries
Schema.index({ status: 1, priority: -1, createdAt: -1 });

// Order matters! This index supports:
// - find({ status })
// - find({ status, priority })
// - find({ status, priority, createdAt })
// But NOT:
// - find({ priority }) alone
// - find({ createdAt }) alone
```

### Unique Index
```typescript
// Enforce uniqueness
Schema.index({ email: 1 }, { unique: true });
Schema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
```

### Sparse Index
```typescript
// Index only documents with the field
Schema.index({ reviewedBy: 1 }, { sparse: true });
// Saves space when field is often null/undefined
```

### Partial Index
```typescript
// Index subset of documents
Schema.index(
    { status: 1, createdAt: -1 },
    { partialFilterExpression: { status: 'pending' } }
);
// Only indexes documents where status = 'pending'
```

### Text Index
```typescript
// For text search (only one per collection)
Schema.index({
    username: 'text',
    displayName: 'text',
}, {
    weights: {
        username: 10,      // Higher weight = more important
        displayName: 5,
    }
});
```

## Model Registration Pattern
```typescript
// Prevent re-compilation in development
export const User = models.User || model('User', UserSchema);

// This pattern checks if model exists before creating
// Necessary for Next.js hot reload
```

## Population Strategies

### Basic Population
```typescript
// Populate single field
const user = await User.findById(id)
    .populate('account');

// Populate with field selection
const feedback = await Feedback.findById(id)
    .populate('userId', 'username displayName avatarUrl');
```

### Nested Population
```typescript
// Populate nested references
const correction = await DataCorrection.findById(id)
    .populate({
        path: 'userId',
        select: 'username displayName',
        populate: {
            path: 'badges',
            match: { featured: true }
        }
    });
```

### Lean Queries
```typescript
// Return plain objects (faster, no methods)
const users = await User
    .find({ isActive: true })
    .select('username displayName')
    .lean<UserType>();  // Type assertion for TypeScript
```

## Transaction Patterns
```typescript
// Use transactions for multi-document updates
const session = await mongoose.startSession();

try {
    await session.withTransaction(async () => {
        // Update user stats
        await User.updateOne(
            { _id: userId },
            { $inc: { 'stats.dataCorrections': 1 } },
            { session }
        );

        // Create correction
        await DataCorrection.create(
            [{ ...correctionData }],
            { session }
        );
    });
} finally {
    await session.endSession();
}
```

## Aggregation Pipeline Examples
```typescript
// Complex queries with aggregation
const leaderboard = await User.aggregate([
    // Filter active users
    { $match: { isActive: true, isBanned: false } },
    
    // Calculate total contributions
    {
        $addFields: {
            totalContributions: {
                $sum: [
                    '$stats.feedbackSubmitted',
                    '$stats.bugsReported',
                    '$stats.dataCorrections'
                ]
            }
        }
    },
    
    // Sort by contributions
    { $sort: { totalContributions: -1 } },
    
    // Limit results
    { $limit: 10 },
    
    // Project only needed fields
    {
        $project: {
            username: 1,
            displayName: 1,
            avatarUrl: 1,
            totalContributions: 1,
            rank: 1
        }
    }
]);
```

## Performance Best Practices

### DO's ✅
- Use indexes for frequently queried fields
- Use `lean()` for read-only operations
- Select only needed fields with `select()`
- Use compound indexes for multi-field queries
- Batch operations with `bulkWrite()`
- Use transactions for data consistency
- Set appropriate TTL for temporary data

### DON'ts ❌
- Don't create too many indexes (write performance)
- Don't use `populate()` in loops
- Don't fetch entire documents if you need few fields
- Don't forget to handle connection errors
- Don't use synchronous operations
- Don't store large binary data in documents
- Don't nest documents too deeply (16MB limit)

## Validation Patterns

### Schema-Level Validation
```typescript
// Built-in validators
email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid email format'
    }
}

// Custom validators
age: {
    type: Number,
    min: [13, 'Must be at least 13 years old'],
    max: [120, 'Invalid age']
}
```

### Pre-Save Hooks
```typescript
// Data transformation before save
UserSchema.pre('save', async function(next) {
    // Hash password if modified
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    // Update timestamp
    this.updatedAt = new Date();
    
    next();
});
```

### Post-Save Hooks
```typescript
// Actions after successful save
FeedbackSchema.post('save', async function(doc) {
    // Send notification
    await notifyAdmins(doc);
    
    // Update user stats
    await User.updateOne(
        { _id: doc.userId },
        { $inc: { 'stats.feedbackSubmitted': 1 } }
    );
});
```

## Migration Strategies

### Adding New Fields
```typescript
// Set default for existing documents
newField: {
    type: String,
    default: 'defaultValue'  // Applied to new documents
}

// Bulk update existing documents
await Model.updateMany(
    { newField: { $exists: false } },
    { $set: { newField: 'defaultValue' } }
);
```

### Renaming Fields
```typescript
// Use $rename operator
await Model.updateMany(
    {},
    { $rename: { 'oldFieldName': 'newFieldName' } }
);
```

### Schema Versioning
```typescript
const Schema = new Schema({
    // ... fields
    schemaVersion: {
        type: Number,
        default: 1
    }
});

// Check version before operations
if (doc.schemaVersion < 2) {
    await migrateToV2(doc);
}
```

## Future Improvements to Consider

### 🔐 Security Enhancements
- [ ] Add field-level encryption for sensitive data
- [ ] Implement audit logging for all changes
- [ ] Add rate limiting at database level
- [ ] Implement data masking for GDPR compliance
- [ ] Add automatic PII detection and protection
- [ ] Implement role-based field visibility

### 📊 Performance Optimizations
- [ ] Implement Redis caching layer
- [ ] Add database connection pooling configuration
- [ ] Optimize indexes based on query patterns
- [ ] Implement read replicas for scaling
- [ ] Add query performance monitoring
- [ ] Implement automatic index suggestions

### 🎯 Data Integrity
- [ ] Add cross-collection validation rules
- [ ] Implement soft deletes pattern
- [ ] Add data archiving strategy
- [ ] Implement change data capture (CDC)
- [ ] Add data versioning for all models
- [ ] Implement automatic backup verification

### 🔄 Schema Evolution
- [ ] Create migration framework
- [ ] Add backward compatibility layer
- [ ] Implement schema registry
- [ ] Add automatic migration testing
- [ ] Create rollback procedures
- [ ] Implement zero-downtime migrations

### 📈 Monitoring & Analytics
- [ ] Add query performance tracking
- [ ] Implement slow query logging
- [ ] Add collection size monitoring
- [ ] Implement usage pattern analytics
- [ ] Add automatic alert thresholds
- [ ] Create performance dashboards

### 🧪 Testing Infrastructure
- [ ] Add model unit tests
- [ ] Implement integration tests with test database
- [ ] Add schema validation tests
- [ ] Create data seeding utilities
- [ ] Implement mock data generators
- [ ] Add performance benchmarks

## Common Query Patterns

### Pagination Pattern
```typescript
const page = 1;
const limit = 20;
const skip = (page - 1) * limit;

const results = await Model
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

const total = await Model.countDocuments(query);
```

### Search Pattern
```typescript
// Text search
const results = await User.find({
    $text: { $search: searchTerm }
}, {
    score: { $meta: 'textScore' }
})
.sort({ score: { $meta: 'textScore' } });

// Regex search (less efficient)
const results = await User.find({
    username: { $regex: searchTerm, $options: 'i' }
});
```

### Bulk Operations Pattern
```typescript
// Efficient bulk updates
const bulkOps = users.map(user => ({
    updateOne: {
        filter: { _id: user.id },
        update: { $set: { lastSeen: new Date() } }
    }
}));

await User.bulkWrite(bulkOps);
```
# Backend Library Guidelines

## Documentation Hierarchy

**Parent:** [Frontend Architecture](../CLAUDE.md) - Overall architecture
**Root:** [Root CLAUDE.md](../../CLAUDE.md) - Project overview
**Index:** [CLAUDE-INDEX.md](../../CLAUDE-INDEX.md) - Complete navigation

**Related Documentation:**
- [API Routes](../app/api/CLAUDE.md) - Using auth & middleware
- [Models](../models/CLAUDE.md) - Database models
- [Types](../types/CLAUDE.md) - Type definitions from schemas

**See Also:**
- For API route implementation, see [API CLAUDE.md](../app/api/CLAUDE.md)
- For authentication usage, see [API CLAUDE.md](../app/api/CLAUDE.md) - Authentication Patterns
- For database connection, see [Models CLAUDE.md](../models/CLAUDE.md)
- For Zod schema → type inference, see [Types CLAUDE.md](../types/CLAUDE.md)

---

## Directory Structure
```
lib/
├── auth/              # Authentication utilities
│   ├── utils.ts       # Auth helpers (requireAuth, requireAdmin, etc.)
│   ├── errors.ts      # Auth-specific error classes
│   └── username.ts    # Username validation utilities
├── schemas/           # Zod validation schemas
│   ├── user.ts        # User-related schemas and types
│   ├── dataCorrection.ts  # Data correction schemas
│   └── ...            # Other entity schemas
├── mongodb.ts         # MongoDB connection management
├── errors.ts          # Custom error classes and handling
├── logger.ts          # Logging utilities
├── middleware.ts      # API middleware (rate limiting, etc.)
├── utils.ts           # General utilities (cn, sanitization, etc.)
└── constants.ts       # App-wide constants
```

## Authentication Utilities

### Auth Helpers (`/auth/utils.ts`)
```typescript
// Basic authentication check
export async function requireAuth() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        throw new AuthenticationError();
    }
    
    if (session.user.isBanned) {
        throw new BannedUserError();
    }
    
    return session;
}

// Auth with database user verification
export async function requireAuthWithUserCheck() {
    const session = await requireAuth();
    
    await connectDB();
    const user = await User.findById(session.user.id)
        .select('isBanned roles username')
        .lean<UserAuth>();
    
    if (!user) {
        throw new NotFoundError('User not found');
    }
    
    if (user.isBanned) {
        throw new BannedUserError();
    }
    
    return { session, user };
}

// Role-based access control
export async function requireAdmin() {
    const { session, user } = await requireAuthWithUserCheck();
    
    if (!user?.roles?.includes('admin')) {
        throw new InsufficientPermissionsError('Admin');
    }
    
    return { session, user };
}
```

**Usage in API Routes:**
```typescript
// GET /api/user
export async function GET(request: NextRequest) {
    const session = await requireAuth(); // Simple auth
    // ... handle request
}

// PATCH /api/admin/users/[id]
export async function PATCH(request: NextRequest) {
    const { session, user } = await requireAdmin(); // Admin only
    // ... handle request
}
```

## Database Management

### MongoDB Connection (`mongodb.ts`)
```typescript
// Singleton connection pattern
let cached = global.mongoose;

export async function connectDB() {
    if (cached?.conn) {
        return cached.conn;
    }
    
    // Connection logic with retry
    const opts = {
        bufferCommands: false,
    };
    
    cached.conn = await mongoose.connect(MONGODB_URI, opts);
    return cached.conn;
}
```

**Best Practices:**
- Always call `connectDB()` at the start of API routes
- Use connection pooling in production
- Handle connection errors gracefully
- Monitor connection health

## Schemas Directory Structure

```
schemas/
├── core.ts                # Core/shared schemas
│   ├── paginationSchema      # Pagination response format
│   ├── successSchema         # Success response format
│   ├── errorResponseSchema   # Error response format
│   └── createSearchParams    # URL search params helper
├── user.ts                # User-related schemas (~500 lines)
│   ├── userBaseSchema        # Base user fields
│   ├── userUpdateSchema      # Profile update validation
│   ├── userUsernameUpdateSchema  # Username change
│   ├── userSettingsResponseSchema  # Response format
│   ├── userDocumentSchema    # Full user document
│   ├── userListRequestSchema  # Admin list query
│   ├── userListResponseSchema # Admin list response
│   ├── UserApi              # API endpoint schemas
│   └── IUserApi             # Inferred types
├── dataCorrection.ts      # Data correction schemas (~350 lines)
│   ├── dataCorrectionBaseSchema  # Base correction
│   ├── entityTypeEnum       # Valid entity types
│   ├── statusEnum          # Correction statuses
│   ├── dataCorrectionResponseSchema
│   ├── DataCorrectionApi   # API endpoint schemas
│   └── IDataCorrectionApi  # Inferred types
├── feedback.ts            # Feedback schemas (~250 lines)
│   ├── feedbackBaseSchema  # Base feedback fields
│   ├── feedbackTypeEnum    # Feedback types
│   ├── FeedbackApi         # API endpoint schemas
│   └── IFeedbackApi        # Inferred types
├── task.ts                # Task schemas (~100 lines)
│   ├── taskBaseSchema      # Task structure
│   ├── taskObjectiveSchema # Task objectives
│   └── taskRewardSchema    # Task rewards
└── guards.ts              # Type guards (~15 lines)
    ├── isValidUser         # User type guard
    └── isValidFeedback     # Feedback type guard
```

**Schema File Organization:**

Each schema file follows this pattern:
1. **Base schemas** - Core Zod schemas for entity
2. **Validation schemas** - Input validation (create, update)
3. **Response schemas** - API response formats
4. **API schemas** - Structured by endpoint (Get, Post, Patch, Delete)
5. **Interface types** - TypeScript types inferred from schemas

**Usage Pattern:**
```typescript
// 1. Import schema and type
import { UserApi, IUserApi } from '@/lib/schemas/user';

type ApiType = IUserApi;

// 2. Validate request input
const body = await request.json();
const validatedData = UserApi.Patch.Request.parse(body);

// 3. Type-safe response
return NextResponse.json<ApiType['Patch']['Response']>({
    user: updatedUser
});
```

**File Purposes:**

- **core.ts**: Shared schemas used across all entities
  - Pagination, success/error formats
  - Helper functions

- **user.ts**: User authentication & profiles
  - Profile updates, username changes
  - Admin user management
  - Role assignments

- **dataCorrection.ts**: User-submitted data corrections
  - Item/task data corrections
  - Review workflows
  - Admin approval system

- **feedback.ts**: User feedback submissions
  - Bug reports, feature requests
  - Rating systems
  - Admin review

- **task.ts**: Game task/quest definitions
  - Task structure validation
  - Objectives, prerequisites
  - Rewards schema

- **guards.ts**: Runtime type guards
  - Type narrowing functions
  - Safe type checking

## Validation Schemas

### Schema Pattern (`/schemas/*.ts`)
```typescript
// Define Zod schemas and derive types (actual pattern from implementation)
export const UserApi = {
    Get: {
        Response: z.object({
            user: userSettingsResponseSchema,
        }),
    },
    Patch: {
        Request: userUpdateSchema,
        Response: z.object({
            user: userSettingsResponseSchema,
        }),
    },
    CheckUsername: {
        Get: {
            Request: userUsernameUpdateSchema,
            Response: successSchema.pick({message: true}).extend({
                available: z.boolean(),
            }),
        }
    },
    // Admin endpoints
    Admin: {
        List: {
            Request: userListRequestSchema,
            Response: userListResponseSchema,
        },
        ById: {
            Get: {
                Response: z.object({
                    user: userDocumentSchema,
                }),
            },
        },
    },
};

// Types derived from schemas
export type IUserApi = {
    Get: { Response: z.infer<typeof UserApi.Get.Response> };
    Patch: {
        Request: z.infer<typeof UserApi.Patch.Request>;
        Response: z.infer<typeof UserApi.Patch.Response>;
    };
    CheckUsername: {
        Get: {
            Request: z.infer<typeof UserApi.CheckUsername.Get.Request>;
            Response: z.infer<typeof UserApi.CheckUsername.Get.Response>;
        }
    };
    Admin: {
        List: {
            Request: z.infer<typeof UserApi.Admin.List.Request>;
            Response: z.infer<typeof UserApi.Admin.List.Response>;
        };
        ById: {
            Get: { Response: z.infer<typeof UserApi.Admin.ById.Get.Response> };
        };
    };
};
```

**Usage:**
```typescript
// Validate request data
const validatedData = UserApi.Patch.Request.parse(body);

// Type API responses
return NextResponse.json<IUserApi['Patch']['Response']>({
    user: updatedUser,
    message: 'Profile updated',
});
```

## Error Handling

### Custom Error Classes (`errors.ts`)
```typescript
// Base error class
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code: string
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

// Specific error types
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'UNAUTHENTICATED');
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

// Error handler
export function handleError(error: unknown): NextResponse {
    logger.error('API Error:', error);
    
    if (error instanceof AppError) {
        return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.statusCode }
        );
    }
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: 'Validation failed', details: error.errors },
            { status: 400 }
        );
    }
    
    // Default error
    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
}
```

### Standard API Error Response Format

All API routes should use consistent error response formats:

**Error Response Types:**

```typescript
// Success Response
interface ApiSuccessResponse<T = unknown> {
    data?: T;
    success: true;
    message?: string;
}

// Error Response
interface ApiErrorResponse {
    error: string;              // Error type/message
    message?: string;           // Human-readable description
    code?: string;              // Error code (e.g., 'VALIDATION_ERROR')
    details?: unknown;          // Additional error context (dev only)
    statusCode?: number;        // HTTP status code
}
```

**HTTP Status Codes:**

| Code | Error Class | Usage |
|------|-------------|-------|
| 400 | ValidationError | Invalid input, Zod validation failures |
| 401 | AuthenticationError | Not logged in, invalid token |
| 403 | InsufficientPermissionsError | Logged in but insufficient permissions |
| 403 | BannedUserError | User account banned |
| 404 | NotFoundError | Resource not found |
| 409 | ConflictError | Resource conflict (e.g., duplicate username) |
| 429 | RateLimitError | Too many requests |
| 500 | AppError | Internal server error |

**Error Response Examples:**

```typescript
// 400 - Validation Error (Zod)
{
    "error": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
        {
            "path": ["email"],
            "message": "Invalid email format"
        },
        {
            "path": ["age"],
            "message": "Must be at least 18"
        }
    ]
}

// 401 - Authentication Required
{
    "error": "Authentication required",
    "code": "UNAUTHENTICATED",
    "message": "You must be logged in to access this resource"
}

// 403 - Insufficient Permissions
{
    "error": "Insufficient permissions",
    "code": "FORBIDDEN",
    "message": "Admin access required"
}

// 403 - Banned User
{
    "error": "Account suspended",
    "code": "BANNED",
    "message": "Your account has been banned"
}

// 404 - Not Found
{
    "error": "User not found",
    "code": "NOT_FOUND"
}

// 409 - Conflict
{
    "error": "Username already taken",
    "code": "CONFLICT",
    "details": {
        "field": "username",
        "value": "john_doe"
    }
}

// 429 - Rate Limited
{
    "error": "Too many requests",
    "message": "Rate limit exceeded. Please try again in 42 seconds.",
    "retryAfter": 42
}

// 500 - Internal Server Error (production)
{
    "error": "Internal server error",
    "code": "INTERNAL_ERROR"
}

// 500 - Internal Server Error (development)
{
    "error": "Internal server error",
    "code": "INTERNAL_ERROR",
    "details": {
        "message": "Database connection failed",
        "stack": "Error: Connection timeout..."
    }
}
```

**Success Response Examples:**

```typescript
// Simple success
{
    "success": true,
    "message": "Profile updated successfully"
}

// Success with data
{
    "success": true,
    "data": {
        "id": "123",
        "username": "john_doe"
    }
}

// Success with pagination
{
    "data": [...items],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "pages": 5
    }
}
```

**Implementation Pattern:**

```typescript
import { NextResponse } from 'next/server';
import { handleError } from '@/lib/errors';
import { ValidationError, NotFoundError } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        // Validate input
        const body = await request.json();
        const validatedData = schema.parse(body);

        // Process request
        const result = await processData(validatedData);

        if (!result) {
            throw new NotFoundError('Resource');
        }

        // Success response
        return NextResponse.json({
            success: true,
            data: result
        }, { status: 200 });

    } catch (error) {
        // Consistent error handling
        return handleError(error);
    }
}
```

**Best Practices:**
- ✅ Use `handleError()` for all error responses
- ✅ Throw specific error classes (AuthenticationError, NotFoundError, etc.)
- ✅ Include `code` field for client-side error handling
- ✅ Provide helpful error messages for users
- ✅ Hide sensitive error details in production
- ✅ Log full error context server-side
- ❌ Don't expose stack traces in production
- ❌ Don't include sensitive data in error responses
- ❌ Don't use different response formats per route

## Middleware

### Rate Limiting (`middleware.ts`)
```typescript
export async function withRateLimit(
    request: NextRequest,
    handler: () => Promise<NextResponse>,
    type: 'api' | 'auth' = 'api'
) {
    // Rate limit logic using Vercel KV or in-memory store
    const identifier = getClientIdentifier(request);
    const limit = type === 'auth' ? 5 : 60; // requests per minute
    
    const isAllowed = await checkRateLimit(identifier, limit);
    
    if (!isAllowed) {
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
        );
    }
    
    return handler();
}
```

**Usage:**
```typescript
export async function POST(request: NextRequest) {
    return withRateLimit(request, async () => {
        // Handle request
    }, 'auth'); // Stricter limit for auth endpoints
}
```

## Utility Functions

### General Utilities (`utils.ts`)
```typescript
// Class name utility for Tailwind
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Input sanitization
export function sanitizeUserInput(input: string): string {
    return input
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[^\w\s-_.@]/g, '') // Allow only safe characters
        .slice(0, 500); // Limit length
}

// Format helpers
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}
```

## Logging

### Logger Configuration (`logger.ts`)
```typescript
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
} as const;

class Logger {
    private level: number;
    
    constructor() {
        this.level = process.env.NODE_ENV === 'production' 
            ? LOG_LEVELS.error 
            : LOG_LEVELS.debug;
    }
    
    error(message: string, error?: unknown) {
        console.error(`[ERROR] ${message}`, error);
        // In production, send to monitoring service
    }
    
    warn(message: string, data?: unknown) {
        if (this.level >= LOG_LEVELS.warn) {
            console.warn(`[WARN] ${message}`, data);
        }
    }
    
    info(message: string, data?: unknown) {
        if (this.level >= LOG_LEVELS.info) {
            console.log(`[INFO] ${message}`, data);
        }
    }
    
    debug(message: string, data?: unknown) {
        if (this.level >= LOG_LEVELS.debug) {
            console.log(`[DEBUG] ${message}`, data);
        }
    }
}

export const logger = new Logger();
```

## Constants

### App Constants (`constants.ts`)
```typescript
// API Rate Limits
export const RATE_LIMITS = {
    api: 60,        // requests per minute
    auth: 5,        // auth attempts per minute
    upload: 10,     // uploads per hour
} as const;

// User Roles
export const USER_ROLES = {
    user: 'user',
    contributor: 'contributor',
    moderator: 'moderator',
    partner: 'partner',
    admin: 'admin',
} as const;

// Validation Rules
export const VALIDATION = {
    username: {
        min: 3,
        max: 20,
        pattern: /^[a-zA-Z0-9_-]+$/,
    },
    displayName: {
        min: 1,
        max: 50,
    },
    bio: {
        max: 500,
    },
} as const;
```

## Best Practices

### DO's ✅
- Always validate input with Zod schemas
- Use custom error classes for consistent error handling
- Implement rate limiting on all public endpoints
- Log errors with context for debugging
- Sanitize user input before database operations
- Use TypeScript types derived from Zod schemas
- Handle MongoDB connection errors gracefully
- Use lean() for read-only queries

### DON'ts ❌
- Don't expose internal error details in production
- Don't skip authentication checks
- Don't trust client-provided user IDs
- Don't use `any` type (see Root CLAUDE.md Critical Rule #3 - use Zod schemas for unknown data)
- Don't forget to close database connections in scripts
- Don't log sensitive data (passwords, tokens)
- Don't bypass rate limiting in production

## External Resources

### Validation & Type Safety
- **Zod**: [zod.dev](https://zod.dev) - Schema validation and type inference
- **TypeScript**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs) - Type system reference

### Authentication
- **NextAuth.js**: [next-auth.js.org](https://next-auth.js.org) - Authentication patterns
- **OAuth 2.0**: [oauth.net/2](https://oauth.net/2/) - OAuth protocol specification

### Database
- **MongoDB**: [docs.mongodb.com](https://docs.mongodb.com) - Database operations
- **Mongoose**: [mongoosejs.com/docs/guide.html](https://mongoosejs.com/docs/guide.html) - Schema and model guide

### Rate Limiting
- **Vercel KV**: [vercel.com/docs/storage/vercel-kv](https://vercel.com/docs/storage/vercel-kv) - Redis-based rate limiting
- **Upstash Redis**: [docs.upstash.com/redis](https://docs.upstash.com/redis) - Serverless Redis documentation

## Future Improvements to Consider

### 🔐 Security Enhancements
- [ ] Implement request signing for sensitive operations
- [ ] Add CSRF protection for state-changing operations
- [ ] Implement API key authentication for external services
- [ ] Add request/response encryption for sensitive data
- [ ] Implement IP-based rate limiting with Redis
- [ ] Add audit logging for admin actions
- [ ] Implement session invalidation on security events

### 📊 Performance Optimizations
- [ ] Implement Redis caching for frequently accessed data
- [ ] Add database query optimization helpers
- [ ] Implement connection pooling configuration
- [ ] Add response compression middleware
- [ ] Implement batch processing utilities
- [ ] Add database transaction helpers
- [ ] Create query builder utilities for complex queries

### 🛠️ Developer Experience
- [ ] Add request/response interceptors for debugging
- [ ] Implement API versioning utilities
- [ ] Create standardized pagination helpers
- [ ] Add automated API documentation generation
- [ ] Implement mock data generators for testing
- [ ] Add performance monitoring utilities
- [ ] Create database migration utilities

### 📝 Data Management
- [ ] Implement soft delete utilities
- [ ] Add data export/import utilities
- [ ] Create backup/restore helpers
- [ ] Implement data anonymization utilities
- [ ] Add bulk operation helpers
- [ ] Create data validation middleware
- [ ] Implement change tracking utilities

### 🔄 Integration Improvements
- [ ] Add webhook utilities for external services
- [ ] Implement retry logic with exponential backoff
- [ ] Create queue processing utilities
- [ ] Add event emitter for decoupled operations
- [ ] Implement circuit breaker pattern
- [ ] Add health check endpoints
- [ ] Create service discovery utilities

### 📈 Monitoring & Analytics
- [ ] Implement custom metrics collection
- [ ] Add performance profiling utilities
- [ ] Create error tracking integration (Sentry)
- [ ] Implement usage analytics helpers
- [ ] Add A/B testing utilities
- [ ] Create dashboard data aggregation helpers
- [ ] Implement real-time monitoring alerts

### 🧪 Testing Utilities
- [ ] Create test database seeding utilities
- [ ] Add API testing helpers
- [ ] Implement mock authentication for tests
- [ ] Create fixture generators
- [ ] Add integration test utilities
- [ ] Implement load testing helpers
- [ ] Create test coverage reporting

### 📦 Code Organization
- [ ] Split large schema files into domain modules
- [ ] Create barrel exports for cleaner imports
- [ ] Implement dependency injection patterns
- [ ] Add service layer abstractions
- [ ] Create repository pattern for data access
- [ ] Implement command/query separation
- [ ] Add domain event utilities

## Common Patterns

### API Route Structure
```typescript
export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            // 1. Authentication
            const session = await requireAuth();
            
            // 2. Connect to database
            await connectDB();
            
            // 3. Parse and validate input
            const params = Schema.parse(Object.fromEntries(
                request.nextUrl.searchParams
            ));
            
            // 4. Perform operation
            const result = await performOperation(params);
            
            // 5. Return typed response
            return NextResponse.json<ApiType['Response']>(result);
            
        } catch (error) {
            // 6. Handle errors consistently
            return handleError(error);
        }
    });
}
```

### Database Query Pattern
```typescript
// Use lean() for read operations
const user = await User.findById(id)
    .select('name email roles')  // Select only needed fields
    .lean<UserType>();           // Convert to plain object

// Use transactions for multi-document updates
const session = await mongoose.startSession();
await session.withTransaction(async () => {
    await User.updateOne({ _id: userId }, update);
    await Log.create({ action: 'user_updated', userId });
});
```

### Validation Pattern
```typescript
// Define schema once, use everywhere
const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18).max(120),
});

// Parse with error handling
try {
    const data = schema.parse(input);
    // Use validated data
} catch (error) {
    if (error instanceof z.ZodError) {
        // Handle validation errors
    }
}
```
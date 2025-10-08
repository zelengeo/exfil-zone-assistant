# API Routes Documentation

## Documentation Hierarchy

**Parent:** [App Router](../CLAUDE.md) - Next.js App Router conventions
**Root:** [Root CLAUDE.md](../../../CLAUDE.md) - Project overview
**Index:** [CLAUDE-INDEX.md](../../../CLAUDE-INDEX.md) - Complete navigation

**Related Documentation:**
- [Backend Utilities](../../lib/CLAUDE.md) - Auth helpers, middleware, schemas
- [Database Models](../../models/CLAUDE.md) - Mongoose models
- [Types](../../types/CLAUDE.md) - TypeScript definitions
- [Services](../../services/CLAUDE.md) - Data access layer

**See Also:**
- For authentication patterns, see [Lib CLAUDE.md](../../lib/CLAUDE.md) - `requireAuth`, `requireAdmin`
- For validation schemas, see [Lib CLAUDE.md](../../lib/CLAUDE.md) - Zod schemas section
- For error handling, see [Lib CLAUDE.md](../../lib/CLAUDE.md) - Error classes & formats
- For database operations, see [Models CLAUDE.md](../../models/CLAUDE.md)

---

## Overview

This directory contains all API route handlers for the ExfilZone Assistant application. Routes follow Next.js 15 App Router conventions and implement authentication, validation, rate limiting, and error handling.

---

## Directory Structure

```
api/
├── auth/
│   └── [...nextauth]/route.ts    # NextAuth authentication
├── admin/
│   ├── corrections/
│   │   ├── route.ts              # Admin corrections list
│   │   └── [id]/route.ts         # Admin correction actions
│   ├── feedback/
│   │   └── [id]/route.ts         # Admin feedback management
│   ├── health/route.ts           # Health check endpoint
│   └── users/
│       ├── route.ts              # Admin users list
│       └── [id]/
│           ├── route.ts          # Admin user actions
│           └── roles/route.ts    # Admin role management
├── corrections/
│   ├── route.ts                  # User corrections CRUD
│   └── [id]/route.ts             # Single correction operations
├── feedback/route.ts             # User feedback submission
├── rate-limit/
│   └── status/route.ts           # Rate limit status check
└── user/
    ├── route.ts                  # User profile CRUD
    ├── check-username/route.ts   # Username availability check
    ├── update/route.ts           # User profile update
    ├── update-username/route.ts  # Username change
    └── [username]/route.ts       # Public profile lookup
```

---

## Route Handler Pattern

### Standard Route Structure

```typescript
// src/app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Model } from '@/models/Model';
import { SchemaApi, ISchemaApi } from '@/lib/schemas/schema';
import { withRateLimit } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth/utils';

type ApiType = ISchemaApi;

// GET /api/feature
export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            await connectDB();

            // Parse and validate query params
            const { searchParams } = new URL(request.url);
            const params = SchemaApi.Get.Request.parse(
                Object.fromEntries(searchParams.entries())
            );

            // Fetch data
            const data = await Model.find({ userId: session.user.id })
                .sort({ createdAt: -1 })
                .lean<ApiType['Get']['Response']['data']>();

            return NextResponse.json<ApiType['Get']['Response']>({ data });
        } catch (error) {
            logger.error('Failed to fetch data', error);
            return handleError(error);
        }
    }, 'apiGetAuthenticated');
}

// POST /api/feature
export async function POST(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const session = await requireAuth();
            const body = await request.json();

            // Validate input
            const validatedData = SchemaApi.Post.Request.parse(body);

            await connectDB();

            // Create document
            const document = await Model.create({
                ...validatedData,
                userId: session.user.id,
            });

            logger.info('Document created', { id: document._id });

            return NextResponse.json<ApiType['Post']['Response']>({
                success: true,
                id: document._id.toString(),
            });
        } catch (error) {
            logger.error('Failed to create document', error);
            return handleError(error);
        }
    }, 'apiPostAuthenticated');
}
```

---

## Authentication Patterns

### 1. Public Routes (No Auth)
```typescript
// No authentication required
export async function GET(request: NextRequest) {
    try {
        const data = await fetchPublicData();
        return NextResponse.json(data);
    } catch (error) {
        return handleError(error);
    }
}
```

### 2. Authenticated Routes
```typescript
import { requireAuth } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            // Throws AuthenticationError if not authenticated
            const session = await requireAuth();

            // session.user.id is guaranteed to exist
            const data = await getData(session.user.id);

            return NextResponse.json(data);
        } catch (error) {
            return handleError(error);
        }
    }, 'apiGetAuthenticated');
}
```

### 3. Admin-Only Routes
```typescript
import { requireAdmin } from '@/lib/auth/utils';

export async function DELETE(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            // Throws error if not admin
            const { session, user } = await requireAdmin();

            await performAdminAction();

            return NextResponse.json({ success: true });
        } catch (error) {
            return handleError(error);
        }
    }, 'adminAction');
}
```

### 4. Admin or Moderator Routes
```typescript
import { requireAdminOrModerator } from '@/lib/auth/utils';

export async function PATCH(request: NextRequest) {
    return withRateLimit(request, async () => {
        try {
            const { session, user } = await requireAdminOrModerator();

            await moderateContent();

            return NextResponse.json({ success: true });
        } catch (error) {
            return handleError(error);
        }
    }, 'moderateAction');
}
```

---

## Request Validation with Zod

### Query Parameters
```typescript
import { FeatureApi } from '@/lib/schemas/feature';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query params into object
        const rawParams = Object.fromEntries(searchParams.entries());

        // Validate with Zod schema
        const params = FeatureApi.Get.Request.parse(rawParams);

        // params is now fully typed and validated
        const results = await fetchData(params);

        return NextResponse.json(results);
    } catch (error) {
        // handleError automatically handles ZodError
        return handleError(error);
    }
}
```

### Request Body
```typescript
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod schema
        const validatedData = FeatureApi.Post.Request.parse(body);

        // validatedData is fully typed
        const result = await createDocument(validatedData);

        return NextResponse.json(result);
    } catch (error) {
        return handleError(error);
    }
}
```

### Input Sanitization
```typescript
import { sanitizeUserInput } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = FeatureApi.Post.Request.parse(body);

        // Sanitize text inputs to prevent XSS
        if (validatedData.textField) {
            validatedData.textField = sanitizeUserInput(validatedData.textField);
        }

        // Deep sanitize complex objects
        validatedData.dataObject = sanitizeProposedData(validatedData.dataObject);

        await saveData(validatedData);

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleError(error);
    }
}
```

---

## Rate Limiting

### Configuration

Rate limiting is applied via `withRateLimit` middleware with predefined configs:

```typescript
// Public endpoints (anonymous users)
'apiGetAnonymous'          // 20 requests / 60s
'apiPostAnonymous'         // 5 requests / 60s

// Authenticated endpoints
'apiGetAuthenticated'      // 60 requests / 60s
'apiPostAuthenticated'     // 30 requests / 60s

// User-specific endpoints
'userUpdate'               // 10 requests / 60s
'feedbackPostAuthenticated' // 5 requests / 300s (5 min)

// Admin endpoints
'adminAction'              // 100 requests / 60s

// Auth endpoints
'auth_signin'              // Special handling in auth flow
```

### Usage
```typescript
export async function POST(request: NextRequest) {
    return withRateLimit(request, async () => {
        // Handler code here
        // Rate limit checked before execution
    }, 'apiPostAuthenticated'); // Config key
}
```

### Rate Limit Headers
All responses include:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 2025-10-08T12:34:56.789Z
```

On rate limit exceeded (429):
```
Retry-After: 42
```

---

## Error Handling

### Standard Error Response Format

```typescript
// Success response
{
    "data": {...},
    "success": true
}

// Error response
{
    "error": "Error type",
    "message": "Human-readable error message",
    "details": {...} // Optional, only in development
}
```

### Error Classes

```typescript
import {
    AuthenticationError,      // 401 - Not authenticated
    InsufficientPermissionsError, // 403 - Authenticated but no permission
    NotFoundError,            // 404 - Resource not found
    ValidationError,          // 400 - Invalid input (Zod)
    ConflictError,            // 409 - Resource conflict
    BannedUserError,          // 403 - User is banned
} from '@/lib/errors';

// Throwing errors
if (!resource) {
    throw new NotFoundError('Resource type');
}

// handleError automatically converts to proper response
return handleError(error);
```

### Error Handling Pattern
```typescript
try {
    // Route handler logic
} catch (error) {
    logger.error('Operation failed', error, {
        userId: session?.user?.id,
        path: request.url,
    });
    return handleError(error);
}
```

---

## Response Typing

### Type-Safe Responses

```typescript
import { FeedbackApi, IFeedbackApi } from '@/lib/schemas/feedback';

type ApiType = IFeedbackApi;

export async function GET(request: NextRequest) {
    // ...

    // Type-safe response
    return NextResponse.json<ApiType['Get']['Response']>({
        feedback: results,
        pagination: {
            page: 1,
            limit: 20,
            total: 100,
            pages: 5,
        },
    });
}
```

### Pagination Pattern
```typescript
type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};

// Example usage
const total = await Model.countDocuments(query);
const results = await Model.find(query)
    .skip((page - 1) * limit)
    .limit(limit);

return NextResponse.json<PaginatedResponse<ItemType>>({
    data: results,
    pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
    },
});
```

---

## Database Operations

### Connection Pattern
```typescript
import { connectDB } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        await connectDB(); // Idempotent connection

        const data = await Model.find();

        return NextResponse.json(data);
    } catch (error) {
        return handleError(error);
    }
}
```

### Query Patterns
```typescript
// Find with lean for read-only
const data = await Model.find(query)
    .select('field1 field2 -_id') // Select specific fields
    .populate('relatedModel', 'name') // Populate references
    .sort({ createdAt: -1 }) // Sort descending
    .skip(offset)
    .limit(limit)
    .lean<TypedResult>(); // Return plain JS objects

// Find and update
const updated = await Model.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
        new: true,           // Return updated document
        runValidators: true  // Validate update
    }
).lean<TypedResult>();

// Create with validation
const document = await Model.create(validatedData);

// Delete
await Model.findByIdAndDelete(id);
```

### Transactions
```typescript
import mongoose from 'mongoose';

export async function DELETE(request: NextRequest) {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            // Delete user
            await User.findByIdAndDelete(userId);

            // Delete related data
            await RelatedModel.deleteMany({ userId });

            // Anonymize other data
            await OtherModel.updateMany(
                { userId },
                { $unset: { userId: 1 } }
            );
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
}
```

---

## Dynamic Routes

### Single Dynamic Segment
```typescript
// src/app/api/corrections/[id]/route.ts
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Next.js 15: params is Promise

        const document = await Model.findById(id);

        if (!document) {
            throw new NotFoundError('Correction');
        }

        return NextResponse.json(document);
    } catch (error) {
        return handleError(error);
    }
}
```

### Multiple Dynamic Segments
```typescript
// src/app/api/admin/users/[id]/roles/route.ts
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Update user roles

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleError(error);
    }
}
```

---

## NextAuth Integration

### Auth Configuration
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from './config';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Auth Options Pattern
```typescript
export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    callbacks: {
        async signIn({ user, account }) {
            // Create/update user in database
            // Link OAuth accounts
            return true;
        },

        async jwt({ token, user, trigger }) {
            // Add custom fields to JWT
            // Refresh on trigger === "update"
            return token;
        },

        async session({ session, token }) {
            // Add token data to session
            return session;
        },
    },

    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
};
```

---

## API Routes List

### Authentication
| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | Public | NextAuth OAuth handlers |

### User Routes
| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/user` | GET | User | Get current user profile |
| `/api/user` | PATCH | User | Update user profile |
| `/api/user` | DELETE | User | Delete user account |
| `/api/user/check-username` | GET | Public | Check username availability |
| `/api/user/update` | PATCH | User | Update profile (legacy) |
| `/api/user/update-username` | PATCH | User | Change username |
| `/api/user/[username]` | GET | Public | Get public user profile |

### Corrections Routes
| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/corrections` | GET | User | List user's corrections |
| `/api/corrections` | POST | User | Submit new correction |
| `/api/corrections/[id]` | GET | User | Get single correction |
| `/api/corrections/[id]` | DELETE | User | Delete correction |

### Feedback Routes
| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/feedback` | POST | User | Submit feedback |

### Admin Routes
| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/admin/corrections` | GET | Admin | List all corrections |
| `/api/admin/corrections/[id]` | PATCH | Admin | Review/approve correction |
| `/api/admin/corrections/[id]` | DELETE | Admin | Delete correction |
| `/api/admin/feedback/[id]` | PATCH | Admin | Review feedback |
| `/api/admin/health` | GET | Admin | System health check |
| `/api/admin/users` | GET | Admin | List all users |
| `/api/admin/users/[id]` | GET | Admin | Get user details |
| `/api/admin/users/[id]` | PATCH | Admin | Update user |
| `/api/admin/users/[id]` | DELETE | Admin | Delete user |
| `/api/admin/users/[id]/roles` | PATCH | Admin | Update user roles |

### Utility Routes
| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/rate-limit/status` | GET | Public | Check rate limit status |

---

## Best Practices

### DO's ✅
- Always use `withRateLimit` wrapper
- Validate all inputs with Zod schemas
- Use `requireAuth`, `requireAdmin` for auth checks
- Sanitize user inputs before database operations
- Use typed responses with Zod-inferred types
- Log important operations with context
- Use `handleError` for consistent error responses
- Use `.lean<Type>()` for read-only queries
- Close database connections in finally blocks for transactions
- Return appropriate HTTP status codes

### DON'Ts ❌
- Don't skip authentication checks on protected routes
- Don't trust client-provided user IDs (always use `session.user.id`)
- Don't expose internal error details in production
- Don't use `any` type (use Zod-inferred types)
- Don't skip rate limiting
- Don't forget to sanitize user inputs
- Don't log sensitive data (passwords, tokens, PII)
- Don't use blocking operations without timeout
- Don't bypass Zod validation
- Don't return different error formats

### Security Checklist
- [ ] Authentication required?
- [ ] Authorization checked?
- [ ] Inputs validated with Zod?
- [ ] User inputs sanitized?
- [ ] Rate limiting applied?
- [ ] Sensitive data excluded from logs?
- [ ] Error messages safe for production?
- [ ] Database queries use session.user.id?
- [ ] Transactions used for multi-step operations?

---

## Testing API Routes

### Manual Testing with curl
```bash
# GET request
curl http://localhost:3000/api/user \
  -H "Cookie: next-auth.session-token=..."

# POST request
curl -X POST http://localhost:3000/api/corrections \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"entityType":"weapon","entityId":"ak47","proposedData":{}}'

# Check rate limit
curl http://localhost:3000/api/rate-limit/status \
  -v
```

### Example Test Pattern
```typescript
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/corrections', () => {
    it('creates correction with valid data', async () => {
        const request = new NextRequest('http://localhost/api/corrections', {
            method: 'POST',
            body: JSON.stringify(validData),
        });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
    });
});
```

---

**Last Updated:** 2025-10-08
**Next Review:** When adding new API routes or changing authentication patterns

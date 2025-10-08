# Admin Panel Guidelines

## Documentation Hierarchy

**Parent:** [App Router](../CLAUDE.md) - Next.js page patterns
**Root:** [Root CLAUDE.md](../../../CLAUDE.md) - Project overview
**Index:** [CLAUDE-INDEX.md](../../../CLAUDE-INDEX.md) - Complete navigation

**Related Documentation:**
- [API Routes](../api/CLAUDE.md) - Backend API endpoints for admin operations
- [Models](../../models/CLAUDE.md) - User, Feedback, and DataCorrection models
- [Lib](../../lib/CLAUDE.md) - Authentication and authorization utilities
- [Components](../../components/CLAUDE.md) - UI components used in admin pages

**See Also:**
- For authentication patterns, see [Lib CLAUDE.md](../../lib/CLAUDE.md) - Authentication Middleware
- For role-based access, see [API CLAUDE.md](../api/CLAUDE.md) - Authorization Patterns
- For data models, see [Models CLAUDE.md](../../models/CLAUDE.md)

---

## Overview

The admin panel provides comprehensive tools for managing users, content, feedback, and system health. All admin routes are protected by role-based authentication requiring the `admin` role.

**Location:** `src/app/admin/`

**Key Features:**
- Dashboard with system statistics
- User management and role assignment
- Feedback review and moderation
- Data correction management
- System health monitoring

---

## Directory Structure

```
admin/
├── layout.tsx                          # Protected admin layout with sidebar
├── page.tsx                            # Dashboard with stats overview
├── components/
│   ├── AdminSidebar.tsx               # Navigation sidebar
│   └── HealthCheckDashboard.tsx       # System health monitoring
├── users/
│   ├── page.tsx                       # User list and management
│   ├── [id]/
│   │   └── edit/
│   │       ├── page.tsx               # Edit user page
│   │       ├── actions.ts             # Server actions for user updates
│   │       └── components/
│   │           └── EditUserForm.tsx   # User edit form
│   └── components/
│       ├── UsersTable.tsx             # User list table
│       └── UserStats.tsx              # User statistics cards
├── roles/
│   ├── page.tsx                       # Role management page
│   └── components/
│       ├── UserRolesTable.tsx         # Role assignment table
│       └── RoleStats.tsx              # Role distribution stats
├── feedback/
│   ├── page.tsx                       # Feedback management
│   └── components/
│       ├── FeedbackTable.tsx          # Feedback list table
│       ├── FeedbackFilters.tsx        # Filter controls
│       └── FeedbackDetailModal.tsx    # Detail view modal
├── corrections/
│   └── page.tsx                       # Data correction reviews
└── health/
    └── page.tsx                       # System health dashboard
```

---

## Authentication & Authorization

### Admin Layout Protection

All admin routes are protected at the layout level:

```typescript
// admin/layout.tsx
import { requireAdmin } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';

export default async function AdminLayout({ children }: AdminLayoutProps) {
    try {
        await requireAdmin();
    } catch (error) {
        if (error instanceof AuthenticationError) {
            redirect('/auth/signin?callbackUrl=/admin');
        } else if (error instanceof AuthorizationError) {
            redirect('/unauthorized');
        } else {
            throw error;
        }
    }

    return (
        <Layout>
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-6">
                    <AdminSidebar />
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </Layout>
    );
}
```

### Authorization Flow

1. **Layout-Level Check**: `requireAdmin()` runs before rendering any admin page
2. **Authentication Error**: Not logged in → redirect to sign-in with callback
3. **Authorization Error**: Logged in but not admin → redirect to unauthorized page
4. **Success**: Admin user → render admin content

### Required Role

**Admin role**: `user.roles` must include `"admin"`

---

## Dashboard Page (`/admin`)

### Purpose
Central hub showing system statistics and quick access to admin functions.

### Features

**Statistics Cards:**
- Total Users: Count of all registered users
- Active Users: Users active in last 30 days
- Feedback Items: Total feedback with pending count
- Corrections: Total corrections with pending count

**Quick Actions:**
- Manage Users → `/admin/users`
- Manage Roles → `/admin/roles`
- Review Feedback → `/admin/feedback` (shows pending count badge)

**System Health:**
- Database status
- API status
- Authentication status
- Storage usage

### Data Fetching Pattern

```typescript
async function getAdminStats() {
    await connectDB();

    const [
        totalUsers,
        activeUsers,
        totalFeedback,
        pendingFeedback,
        totalCorrections,
        pendingCorrections
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({
            lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        Feedback.countDocuments(),
        Feedback.countDocuments({ status: 'new' }),
        User.countDocuments({ roles: 'admin' }),
        User.countDocuments({ roles: 'moderator' })
    ]);

    return {
        totalUsers,
        activeUsers,
        totalFeedback,
        pendingFeedback,
        totalCorrections,
        pendingCorrections
    };
}
```

**Pattern Benefits:**
- ✅ Parallel queries with `Promise.all()`
- ✅ Efficient document counts (no data fetch)
- ✅ Server component (no client JS needed)

---

## User Management (`/admin/users`)

### User List Page

**Location:** `/admin/users/page.tsx`

**Features:**
- User statistics overview (4 stat cards)
- Searchable and filterable user table
- Role badges for quick identification
- Edit user action buttons
- Ban/unban user functionality

**Components:**

```typescript
// Page structure
<div className="space-y-6">
    <Suspense fallback={<UserStatsLoading />}>
        <UserStats />
    </Suspense>

    <Card>
        <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
                Search, filter, and manage user accounts, roles, and permissions.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Suspense fallback={<UsersTableLoading />}>
                <UsersTable />
            </Suspense>
        </CardContent>
    </Card>
</div>
```

**UserStats Component:**
- Fetches user statistics from database
- Displays total, active, banned counts
- Shows role distribution

**UsersTable Component:**
- Server component fetching user list
- Client-side search and filtering
- Pagination support
- Actions: Edit, Ban/Unban, View Details

### Edit User Page

**Location:** `/admin/users/[id]/edit/page.tsx`

**Dynamic Route Pattern:**
```typescript
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
        notFound();
    }

    return <EditUserForm user={user} />;
}
```

**Editable Fields:**
- Username
- Display Name
- Email
- Roles (multi-select)
- Ban status
- Avatar URL

**Server Actions:**

```typescript
// admin/users/[id]/edit/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/utils';

export async function updateUser(userId: string, data: UpdateUserData) {
    await requireAdmin();

    // Validate input
    const validated = UserUpdateSchema.parse(data);

    // Update user in database
    const user = await User.findByIdAndUpdate(
        userId,
        validated,
        { new: true, runValidators: true }
    );

    if (!user) {
        throw new Error('User not found');
    }

    // Revalidate pages
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}/edit`);

    return { success: true, user };
}
```

**Form Validation:**
- Zod schema validation on server
- Client-side validation with React Hook Form
- Prevent admin from removing own admin role
- Validate username uniqueness

---

## Role Management (`/admin/roles`)

### Purpose
Centralized role assignment and management for access control.

### Role Hierarchy

```typescript
export const USER_ROLES = {
    user: 'user',              // Default role - basic access
    contributor: 'contributor', // Can submit corrections
    moderator: 'moderator',     // Can review corrections
    partner: 'partner',         // Verified partners/creators
    admin: 'admin',            // Full system access
} as const;
```

### Features

**RoleStats Component:**
- Shows count for each role
- Visual distribution of roles
- Identifies users with multiple roles

**UserRolesTable Component:**
- Lists all users with role information
- Inline role editing (add/remove badges)
- Bulk role operations
- Search by username or role

### Role Assignment Pattern

```typescript
// Optimistic UI update with server action
async function assignRole(userId: string, role: string) {
    'use server';

    await requireAdmin();

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Add role if not already present
    if (!user.roles.includes(role)) {
        user.roles.push(role);
        await user.save();
    }

    revalidatePath('/admin/roles');
    return { success: true };
}

async function removeRole(userId: string, role: string) {
    'use server';

    await requireAdmin();

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Prevent removing last admin if user is last admin
    if (role === 'admin') {
        const adminCount = await User.countDocuments({ roles: 'admin' });
        if (adminCount <= 1) {
            throw new Error('Cannot remove the last admin');
        }
    }

    user.roles = user.roles.filter(r => r !== role);
    await user.save();

    revalidatePath('/admin/roles');
    return { success: true };
}
```

**Safety Rules:**
- ✅ Cannot remove last admin role
- ✅ Admins cannot remove own admin role
- ✅ Role changes require revalidation
- ✅ All operations require admin authentication

---

## Feedback Management (`/admin/feedback`)

### Purpose
Review and respond to user-submitted feedback and bug reports.

### Feedback Status Flow

```
new → under_review → resolved | dismissed | wont_fix
```

### Components

**FeedbackTable:**
- Lists all feedback submissions
- Filter by status, type, priority
- Sort by date, user, status
- Quick status update actions
- Expandable detail view

**FeedbackFilters:**
- Status filter (new, under review, resolved, etc.)
- Type filter (bug, feature, improvement, other)
- Date range picker
- User search

**FeedbackDetailModal:**
- Full feedback content display
- User information
- Screenshots/attachments (if any)
- Status history
- Admin notes field
- Action buttons (resolve, dismiss, etc.)

### Feedback Schema

```typescript
interface Feedback {
    _id: ObjectId;
    userId: ObjectId;                    // Reference to User
    type: 'bug' | 'feature' | 'improvement' | 'other';
    status: 'new' | 'under_review' | 'resolved' | 'dismissed' | 'wont_fix';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;
    url?: string;                        // Page where feedback was submitted
    metadata?: Record<string, unknown>;  // Browser info, etc.
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

### Server Actions

```typescript
'use server';

export async function updateFeedbackStatus(
    feedbackId: string,
    status: FeedbackStatus,
    adminNotes?: string
) {
    await requireAdmin();

    const feedback = await Feedback.findByIdAndUpdate(
        feedbackId,
        {
            status,
            adminNotes,
            updatedAt: new Date()
        },
        { new: true }
    );

    revalidatePath('/admin/feedback');
    return { success: true, feedback };
}
```

---

## Data Corrections (`/admin/corrections`)

### Purpose
Review user-submitted corrections to game data (items, tasks, etc.).

### Correction Types
- **Item Data**: Weapon stats, prices, names
- **Task Data**: Objectives, rewards, prerequisites
- **Map Data**: Spawn locations, extractions

### Correction Workflow

1. **User submits correction** via correction form
2. **Admin reviews submission** in corrections panel
3. **Admin approves/rejects** with optional notes
4. **On approval**: Data updated, user credited
5. **On rejection**: User notified with reason

### Correction Schema

```typescript
interface DataCorrection {
    _id: ObjectId;
    userId: ObjectId;
    type: 'item' | 'task' | 'map' | 'other';
    targetId: string;                   // ID of item/task being corrected
    field: string;                      // Field being corrected
    currentValue: unknown;              // Current value in database
    suggestedValue: unknown;            // User's suggested value
    reason?: string;                    // User's explanation
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: ObjectId;              // Admin who reviewed
    reviewNotes?: string;               // Admin's notes
    createdAt: Date;
    reviewedAt?: Date;
}
```

### Review Interface

**Display:**
- Side-by-side comparison (current vs suggested)
- User's reasoning
- Submitter information and history
- Similar corrections (if any)

**Actions:**
- Approve: Apply change and credit user
- Reject: Mark as rejected with reason
- Request More Info: Ask user for clarification

---

## System Health (`/admin/health`)

### Health Checks

**Database:**
- Connection status
- Response time
- Active connections
- Collection stats

**API Endpoints:**
- Response time monitoring
- Error rate
- Rate limit status

**Authentication:**
- OAuth provider status
- Session store status
- Active sessions count

**Storage:**
- Image storage usage
- Database size
- Backup status

### HealthCheckDashboard Component

```typescript
export async function HealthCheckDashboard() {
    const checks = await runHealthChecks();

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {checks.map(check => (
                <Card key={check.name}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <StatusIcon status={check.status} />
                            {check.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>Status: {check.status}</div>
                            <div>Response Time: {check.responseTime}ms</div>
                            {check.message && (
                                <div className="text-sm text-tan-400">
                                    {check.message}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
```

---

## Common Patterns

### Server Component with Suspense

```typescript
// admin/users/page.tsx
export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <Suspense fallback={<UserStatsLoading />}>
                <UserStats />
            </Suspense>

            <Suspense fallback={<UsersTableLoading />}>
                <UsersTable />
            </Suspense>
        </div>
    );
}

// Loading skeleton
function UserStatsLoading() {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-24" />
                </Card>
            ))}
        </div>
    );
}
```

**Benefits:**
- ✅ Parallel data fetching
- ✅ Progressive page rendering
- ✅ Better perceived performance
- ✅ Individual error boundaries

### Server Actions with Revalidation

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/utils';

export async function adminAction(data: ActionData) {
    // 1. Verify admin access
    await requireAdmin();

    // 2. Validate input
    const validated = ActionSchema.parse(data);

    // 3. Perform database operation
    const result = await performDatabaseOperation(validated);

    // 4. Revalidate affected pages
    revalidatePath('/admin/users');
    revalidatePath('/admin/dashboard');

    // 5. Return success/error
    return { success: true, data: result };
}
```

### Error Handling

```typescript
// Admin pages should handle auth errors gracefully
export default async function AdminPage() {
    try {
        const data = await fetchAdminData();
        return <AdminContent data={data} />;
    } catch (error) {
        if (error instanceof AuthenticationError) {
            redirect('/auth/signin?callbackUrl=/admin');
        }
        if (error instanceof AuthorizationError) {
            return <Unauthorized />;
        }
        throw error; // Let error boundary handle other errors
    }
}
```

---

## Styling Conventions

### Military Theme Consistency

```typescript
// Use consistent military-themed classes
<Card className="military-box border-military-700">
    <CardHeader>
        <CardTitle className="text-tan-100">Title</CardTitle>
        <CardDescription className="text-tan-400">
            Description
        </CardDescription>
    </CardHeader>
    <CardContent>
        {/* Content */}
    </CardContent>
</Card>
```

### Status Badges

```typescript
// Consistent badge colors
const statusColors = {
    success: 'bg-green-900/30 text-green-400 border-green-800',
    warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    error: 'bg-red-900/30 text-red-400 border-red-800',
    info: 'bg-blue-900/30 text-blue-400 border-blue-800',
};

<Badge className={statusColors.success}>
    Operational
</Badge>
```

### Icon Usage

```typescript
import { Users, Shield, MessageSquare, Activity } from 'lucide-react';

// Icons should be olive-colored for consistency
<Users className="h-4 w-4 text-olive-500" />
```

---

## Performance Optimizations

### Database Query Optimization

```typescript
// ✅ DO: Use lean() for read-only data
const users = await User.find()
    .select('username email roles lastLoginAt')
    .lean()
    .limit(50);

// ✅ DO: Use parallel queries
const [users, stats] = await Promise.all([
    User.find().lean(),
    User.aggregate([{ $group: { _id: '$roles', count: { $sum: 1 } } }])
]);

// ❌ DON'T: Fetch all documents without pagination
const allUsers = await User.find(); // Could be thousands of documents
```

### Pagination Pattern

```typescript
interface PaginationParams {
    page: number;
    limit: number;
}

async function getPaginatedUsers({ page = 1, limit = 50 }: PaginationParams) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find()
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments()
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}
```

---

## Security Considerations

### Input Validation

```typescript
// Always validate admin inputs with Zod
import { z } from 'zod';

const UserUpdateSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
    email: z.string().email(),
    roles: z.array(z.enum(['user', 'contributor', 'moderator', 'partner', 'admin'])),
    isBanned: z.boolean()
});
```

### SQL/NoSQL Injection Prevention

```typescript
// ✅ DO: Use Mongoose models and validated inputs
const user = await User.findById(validatedId);

// ❌ DON'T: Use raw queries with unvalidated input
const user = await db.collection('users').findOne({ _id: req.body.id });
```

### Rate Limiting

Admin endpoints should have separate rate limits (higher than public endpoints but still protected).

### Audit Logging

```typescript
// Log admin actions for accountability
async function logAdminAction(action: AdminAction) {
    await AuditLog.create({
        adminId: action.adminId,
        action: action.type,
        targetId: action.targetId,
        changes: action.changes,
        timestamp: new Date()
    });
}
```

---

## Testing Strategies

### Server Action Testing

```typescript
// __tests__/admin/actions/updateUser.test.ts
import { updateUser } from '@/app/admin/users/[id]/edit/actions';

describe('updateUser', () => {
    it('requires admin authentication', async () => {
        // Mock non-admin user
        await expect(updateUser('user-id', data))
            .rejects.toThrow(AuthorizationError);
    });

    it('validates input data', async () => {
        await expect(updateUser('user-id', { username: 'ab' }))
            .rejects.toThrow(); // Too short
    });

    it('updates user successfully', async () => {
        const result = await updateUser('user-id', validData);
        expect(result.success).toBe(true);
    });
});
```

### Component Testing

```typescript
// __tests__/admin/components/UsersTable.test.tsx
import { render, screen } from '@testing-library/react';
import { UsersTable } from '@/app/admin/users/components/UsersTable';

describe('UsersTable', () => {
    it('displays user list', async () => {
        render(<UsersTable />);

        await waitFor(() => {
            expect(screen.getByText('testuser')).toBeInTheDocument();
        });
    });

    it('shows role badges', () => {
        render(<UsersTable />);
        expect(screen.getByText('admin')).toBeInTheDocument();
    });
});
```

---

## Best Practices

### DO's ✅

- Always use `requireAdmin()` at the start of server actions
- Implement proper loading states with Suspense
- Revalidate paths after mutations
- Use parallel queries with `Promise.all()`
- Validate all admin inputs with Zod schemas
- Provide clear error messages
- Log admin actions for audit trail
- Use optimistic UI updates where appropriate
- Implement pagination for large datasets
- Show confirmation dialogs for destructive actions

### DON'Ts ❌

- Don't trust client-provided user IDs without validation
- Don't perform admin actions without authentication checks
- Don't expose sensitive user data in client components
- Don't fetch unlimited data without pagination
- Don't allow admins to remove their own admin role
- Don't skip error handling in server actions
- Don't use client components for data fetching unless necessary
- Don't forget to revalidate after mutations
- Don't hardcode role names (use constants)
- Don't bypass audit logging

---

## Future Enhancements

### Planned Features
- [ ] Activity logs dashboard
- [ ] Bulk user operations (import/export)
- [ ] Advanced analytics and reporting
- [ ] Email notification system for admins
- [ ] Scheduled tasks management
- [ ] Database backup management
- [ ] API usage statistics
- [ ] Content moderation queue
- [ ] Automated ban detection
- [ ] Two-factor authentication for admins

### Technical Improvements
- [ ] Real-time updates with WebSockets
- [ ] Export data to CSV/JSON
- [ ] Advanced search with Elasticsearch
- [ ] Caching layer for frequently accessed data
- [ ] Background job processing
- [ ] Automated testing suite expansion

---

## External Resources

### Next.js Server Actions
- **Documentation**: [nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- **Revalidation**: [nextjs.org/docs/app/api-reference/functions/revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)

### Authentication
- **NextAuth.js**: [next-auth.js.org](https://next-auth.js.org) - Session management
- **Role-Based Access**: Custom implementation using NextAuth callbacks

### Database
- **Mongoose Queries**: [mongoosejs.com/docs/queries.html](https://mongoosejs.com/docs/queries.html)
- **MongoDB Aggregation**: [docs.mongodb.com/manual/aggregation](https://docs.mongodb.com/manual/aggregation)

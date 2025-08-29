// src/app/admin/users/page.tsx
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UsersTable } from './components/UsersTable';
import { UserStats } from './components/UserStats';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-tan-100 flex items-center gap-2">
                    <Users className="h-6 w-6 text-olive-500" />
                    User Management
                </h1>
                <p className="text-tan-400 mt-1">
                    View and manage all registered users
                </p>
            </div>

            <Suspense fallback={<UserStatsLoading />}>
                <UserStats />
            </Suspense>

            <Card className="military-box border-military-700">
                <CardHeader>
                    <CardTitle className="text-tan-100">All Users</CardTitle>
                    <CardDescription className="text-tan-400">
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
    );
}

function UserStatsLoading() {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="military-box border-military-700">
                    <CardHeader className="space-y-0 pb-2">
                        <Skeleton className="h-4 w-24 bg-military-700" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-20 bg-military-700" />
                        <Skeleton className="h-3 w-32 bg-military-700 mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function UsersTableLoading() {
    return (
        <div className="space-y-3">
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 bg-military-700" />
                <Skeleton className="h-10 w-40 bg-military-700" />
                <Skeleton className="h-10 w-40 bg-military-700" />
            </div>
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-military-700" />
            ))}
        </div>
    );
}
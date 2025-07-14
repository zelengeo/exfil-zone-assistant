// src/app/admin/roles/page.tsx
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRolesTable } from './components/UserRolesTable';
import { RoleStats } from './components/RoleStats';
import { Shield } from 'lucide-react';

export default function AdminRolesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-tan-100 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-olive-500" />
                    Role Management
                </h1>
                <p className="text-tan-400 mt-1">
                    Manage user roles and permissions across the platform
                </p>
            </div>

            <Suspense fallback={<RoleStatsLoading />}>
                <RoleStats />
            </Suspense>

            <Card className="military-box border-military-700">
                <CardHeader>
                    <CardTitle className="text-tan-100">User Roles</CardTitle>
                    <CardDescription className="text-tan-400">
                        Assign and remove roles from users. Higher roles have more permissions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<UserRolesTableLoading />}>
                        <UserRolesTable />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}

function RoleStatsLoading() {
    return (
        <div className="grid gap-4 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
                <Card key={i} className="military-box border-military-700">
                    <CardHeader className="space-y-0 pb-2">
                        <Skeleton className="h-4 w-24 bg-military-700" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16 bg-military-700" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function UserRolesTableLoading() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-military-700" />
            ))}
        </div>
    );
}
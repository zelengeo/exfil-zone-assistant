// src/app/admin/users/[id]/edit/page.tsx
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import {EditUserForm} from './components/EditUserForm';
import {getUserForEdit} from "./actions";

interface AdminUserEditPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function AdminUserEditPage({ params }: AdminUserEditPageProps) {
    const { id } = await params;
    const result = await getUserForEdit(id);

    if (!result.success) {

        return (
            <div className="space-y-6">
                {/* Admin navigation stays visible */}
                <Link href="/admin/users">← Back to Users</Link>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {result.code === 'NOT_FOUND' && 'User Not Found'}
                            {result.code === 'UNAUTHORIZED' && 'Access Denied'}
                            {result.code === 'INVALID_INPUT' && 'Invalid User ID'}
                            {!result.code && 'Error'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {result.code === 'NOT_FOUND' && (
                            <p>The user you&#39;re looking for doesn&#39;t exist.
                                They may have been deleted.</p>
                        )}
                        {result.code === 'INVALID_INPUT' && (
                            <p>The user ID format is invalid.
                                Please check the URL.</p>
                        )}
                        {result.code === 'UNAUTHORIZED' && (
                            <p>You don&#39;t have permission to edit users.</p>
                        )}
                        {!result.code && (
                            <p>{result.error}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const user = result.data;

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 text-sm text-tan-400 hover:text-tan-300 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4"/>
                    Back to Users
                </Link>

                <h1 className="text-2xl font-bold text-tan-100 flex items-center gap-2">
                    <Edit className="h-6 w-6 text-olive-500"/>
                    Edit User
                </h1>
                <p className="text-tan-400 mt-1">
                    Update user profile information and settings
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* User info card */}
                <div className="lg:col-span-1">
                    <Card className="military-box border-military-700">
                        <CardHeader>
                            <CardTitle className="text-tan-100">User Information</CardTitle>
                            <CardDescription className="text-tan-400">
                                Current user details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-tan-400">Username</p>
                                <p className="text-tan-100 font-medium">{user.username}</p>
                            </div>
                            <div>
                                <p className="text-sm text-tan-400">Email</p>
                                <p className="text-tan-100 font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-tan-400">Display Name</p>
                                <p className="text-tan-100 font-medium">{user.displayName || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-tan-400">Rank</p>
                                <p className="text-tan-100 font-medium capitalize">{user.rank}</p>
                            </div>
                            <div>
                                <p className="text-sm text-tan-400">Status</p>
                                <p className={`font-medium ${user.isBanned ? 'text-red-400' : 'text-green-400'}`}>
                                    {user.isBanned ? 'Banned' : 'Active'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-tan-400">Member Since</p>
                                <p className="text-tan-100 font-medium">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit form */}
                <div className="lg:col-span-2">
                    <Card className="military-box border-military-700">
                        <CardHeader>
                            <CardTitle className="text-tan-100">Edit Profile</CardTitle>
                            <CardDescription className="text-tan-400">
                                Update user profile information. Changes will be saved immediately.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<EditUserFormLoading/>}>
                                <EditUserForm user={user}/>
                            </Suspense>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function EditUserFormLoading() {
    return (
        <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-military-700"/>
                    <Skeleton className="h-10 w-full bg-military-700"/>
                </div>
            ))}
            <Skeleton className="h-10 w-32 bg-military-700"/>
        </div>
    );
}
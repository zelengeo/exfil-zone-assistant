'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Search,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Shield,
    Eye,
    Edit,
    Trash,
    Award
} from 'lucide-react';
import { toast } from 'sonner';
import {IUserApi, rolesEnum, UserApi} from "@/lib/schemas/user";
import {createSearchParams} from "@/lib/schemas/core";

const ITEMS_PER_PAGE = 10;

type UserApiBase = IUserApi['Admin']['List'];
type UserListItem = UserApiBase['Response']['users'][0];
type RoleFilterType = UserApiBase['Request']['role'] | 'all';

export function UsersTable() {
    const router = useRouter();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilterType>('all');
    const [sortBy, setSortBy] = useState<UserApiBase['Request']['sortBy']>('createdAt');
    const [sortOrder, setSortOrder] = useState<UserApiBase['Request']['order']>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Delete confirmation state
    const [deleteUser, setDeleteUser] = useState<UserListItem  | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = createSearchParams(
                UserApi.Admin.List.Request,
                {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    sortBy,
                    order: sortOrder,
                    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                    ...(roleFilter !== 'all' && { role: roleFilter }),
                }
                );

            const response = await fetch(`/api/admin/users?${params}`);
            const data: UserApiBase['Response'] = await response.json();

            if (response.ok) {
                setUsers(data.users);
                setTotalPages(data.pagination.pages);
                setTotalUsers(data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Error',{
                description: 'Failed to load users',
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, roleFilter, sortBy, sortOrder]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // const handleSort = (field: string) => {
    //     if (sortBy === field) {
    //         setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    //     } else {
    //         setSortBy(field);
    //         setSortOrder('desc');
    //     }
    //     setCurrentPage(1);
    // };

    const handleDeleteUser = async () => {
        if (!deleteUser) return;

        try {
            const response = await fetch(`/api/admin/users/${deleteUser._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Success',{
                    description: 'User deleted successfully',
                });
                fetchUsers();
            } else {
                throw new Error('Failed to delete user');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            toast.error('Error',{
                description: 'Failed to delete user',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteUser(null);
        }
    };

    const getRoleColor = (role: string) => {
        const colors = {
            admin: 'bg-red-900/30 text-red-400 border-red-800',
            moderator: 'bg-blue-900/30 text-blue-400 border-blue-800',
            partner: 'bg-purple-900/30 text-purple-400 border-purple-800',
            contributor: 'bg-green-900/30 text-green-400 border-green-800',
            user: 'bg-military-700 text-tan-400 border-military-600',
        };
        return colors[role as keyof typeof colors] || colors.user;
    };

    const getRankColor = (rank: string) => {
        const colors = {
            recruit: 'text-gray-400',
            soldier: 'text-blue-400',
            specialist: 'text-green-400',
            veteran: 'text-purple-400',
            elite: 'text-orange-400',
        };
        return colors[rank as keyof typeof colors] || 'text-gray-400';
    };

    return (
        <div className="space-y-4">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tan-500" />
                    <Input
                        placeholder="Search by username or email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10 bg-military-800 border-military-700 text-tan-100 placeholder:text-tan-500"
                    />
                </div>
                <Select value={roleFilter} onValueChange={(value) => {
                    setRoleFilter(value as RoleFilterType);
                    setCurrentPage(1);
                }}>
                    <SelectTrigger className="w-[180px] bg-military-800 border-military-700">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent className="bg-military-800 border-military-700">
                        <SelectItem value="all">All Roles</SelectItem>
                        {rolesEnum.map((role) => (
                            <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}s
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-');
                    setSortBy(field as UserApiBase['Request']['sortBy']);
                    setSortOrder(order as UserApiBase['Request']['order']);
                    setCurrentPage(1);
                }}>
                    <SelectTrigger className="w-[200px] bg-military-800 border-military-700">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent className="bg-military-800 border-military-700">
                        <SelectItem value="createdAt-desc">Newest First</SelectItem>
                        <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                        <SelectItem value="username-asc">Username A-Z</SelectItem>
                        <SelectItem value="username-desc">Username Z-A</SelectItem>
                        <SelectItem value="stats.contributionPoints-desc">Most Contributions</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-tan-400">
                Showing {users.length} of {totalUsers} users
            </div>

            {/* Table */}
            <div className="rounded-md border border-military-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-military-700 hover:bg-military-800/50">
                            <TableHead className="text-tan-300">User</TableHead>
                            <TableHead className="text-tan-300">Roles & Rank</TableHead>
                            <TableHead className="text-tan-300">Stats</TableHead>
                            <TableHead className="text-tan-300">Activity</TableHead>
                            <TableHead className="text-tan-300 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-tan-400">
                                    Loading users...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-tan-400">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user._id.toString()} className="border-military-700 hover:bg-military-800/30">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-medium text-tan-100">{user.username}</div>
                                                <div className="text-sm text-tan-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="outline"
                                                        className={getRoleColor(role)}
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Award className={`h-3 w-3 ${getRankColor(user.rank)}`} />
                                                <span className={`text-sm ${getRankColor(user.rank)}`}>
                          {user.rank}
                        </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="text-tan-300">
                                                {user.stats?.contributionPoints || 0} points
                                            </div>
                                            <div className="text-tan-500">
                                                Contributions
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="text-tan-300">
                                                Joined {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-military-700"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="bg-military-800 border-military-700"
                                            >
                                                <DropdownMenuLabel className="text-tan-300">
                                                    Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-military-700" />
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/user/${user.username}`)}
                                                    className="text-tan-300 hover:bg-military-700 cursor-pointer"
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/admin/users/${user._id}/edit`)}
                                                    className="text-tan-300 hover:bg-military-700 cursor-pointer"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/admin/users/${user._id}/roles`)}
                                                    className="text-tan-300 hover:bg-military-700 cursor-pointer"
                                                >
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Manage Roles
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-military-700" />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setDeleteUser(user);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    className="text-red-400 hover:bg-red-900/20 cursor-pointer"
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-tan-400">
                    Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="bg-military-800 border-military-700 hover:bg-military-700"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-military-800 border-military-700 hover:bg-military-700"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-military-900 border-military-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-tan-100">
                            Delete User Account
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-tan-400">
                            Are you sure you want to delete <strong>{deleteUser?.username}</strong>&#39;s account?
                            This action cannot be undone and will permanently remove all their data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-military-800 border-military-700 text-tan-300 hover:bg-military-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-900/30 text-red-400 border-red-800 hover:bg-red-900/50"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
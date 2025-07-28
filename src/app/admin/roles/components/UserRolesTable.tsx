'use client';

import { useState, useEffect, useCallback } from 'react';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from "sonner";
import {IUserApi, rolesEnum, UserApi} from '@/lib/schemas/user';
import {createSearchParams} from "@/lib/schemas/core";

const ITEMS_PER_PAGE = 20;

type UserListItem = IUserApi['Admin']['List']['Response']['users'][0];
type RoleUpdateRequest = IUserApi['Admin']['ById']['Roles']['Patch']['Request'];

export function UserRolesTable() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
    const [actionType, setActionType] = useState<RoleUpdateRequest['action']>('add');
    const [selectedRole, setSelectedRole] = useState<RoleUpdateRequest['role'] | ''>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = createSearchParams(
                UserApi.Admin.List.Request,
                {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                    ...(roleFilter !== 'all' && { role: roleFilter as IUserApi['Admin']['List']['Request']['role'] }),
                }
            );

            const response = await fetch(`/api/admin/users?${params}`);
            const data: IUserApi['Admin']['List']['Response'] = await response.json();

            if (response.ok) {
                setUsers(data.users);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Error', {
                description: 'Failed to load users',
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, roleFilter]);


    const confirmRoleAction = async () => {
        if (!selectedUser || !selectedRole) return;

        try {
            const requestBody: RoleUpdateRequest = {
                action: actionType,
                role: selectedRole as RoleUpdateRequest['role'],
            };

            const response = await fetch(`/api/admin/users/${selectedUser._id}/roles`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const data: IUserApi['Admin']['ById']['Roles']['Patch']['Response'] = await response.json();

            if (response.ok) {
                toast.success(`Role ${actionType}ed successfully for ${data.user.username}`, { description: `Resulted roles are: ${data.user.roles.join(', ')}` });
                fetchUsers();
            } else {
                throw new Error('Failed to update role');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update role');
        } finally {
            setIsDialogOpen(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleAction = (user: UserListItem, action: RoleUpdateRequest['action'], role: RoleUpdateRequest['role']) => {
        setSelectedUser(user);
        setActionType(action);
        setSelectedRole(role);
        setIsDialogOpen(true);
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

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tan-500" />
                    <Input
                        placeholder="Search by username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-military-800 border-military-700 text-tan-100 placeholder:text-tan-500"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
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
            </div>

            <div className="rounded-md border border-military-700">
                <Table>
                    <TableHeader>
                        <TableRow className="border-military-700 hover:bg-military-800/50">
                            <TableHead className="text-tan-300">User</TableHead>
                            <TableHead className="text-tan-300">Current Roles</TableHead>
                            <TableHead className="text-tan-300">Rank</TableHead>
                            <TableHead className="text-tan-300">Member Since</TableHead>
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
                                        <div>
                                            <div className="font-medium text-tan-100">{user.username}</div>
                                            <div className="text-sm text-tan-500">{user.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-military-800 text-tan-300 border-military-600">
                                            {user.rank}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-tan-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Select
                                            onValueChange={(value) => {
                                                const [action, role] = value.split(':');
                                                handleRoleAction(user, action as RoleUpdateRequest['action'], role as RoleUpdateRequest['role']);
                                            }}
                                        >
                                            <SelectTrigger className="w-[140px] bg-military-800 border-military-700">
                                                <SelectValue placeholder="Manage roles" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-military-800 border-military-700">
                                                <SelectItem value="placeholder" disabled>
                                                    Select action
                                                </SelectItem>
                                                {rolesEnum.filter(role => !user.roles.includes(role)).map((role) => (
                                                    <SelectItem key={`add:${role}`} value={`add:${role}`}>
                                                        Add {role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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

            {/* Confirmation Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="bg-military-900 border-military-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-tan-100">
                            Confirm Role {actionType === 'add' ? 'Assignment' : 'Removal'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-tan-400">
                            Are you sure you want to {actionType} the <strong>{selectedRole}</strong> role{' '}
                            {actionType === 'add' ? 'to' : 'from'} <strong>{selectedUser?.username}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-military-800 border-military-700 text-tan-300 hover:bg-military-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRoleAction}
                            className={actionType === 'add'
                                ? 'bg-green-900/30 text-green-400 border-green-800 hover:bg-green-900/50'
                                : 'bg-red-900/30 text-red-400 border-red-800 hover:bg-red-900/50'
                            }
                        >
                            {actionType === 'add' ? 'Add Role' : 'Remove Role'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
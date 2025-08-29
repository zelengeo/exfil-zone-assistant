// src/app/admin/users/[id]/edit/components/EditUserForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updateUser } from '../actions';
import {
    AdminUserUpdateInput,
    adminUserUpdateSchema,
    IUserApi,
    rankEnum,
    rolesEnum,
} from '@/lib/schemas/user';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditUserFormProps {
    user: IUserApi['Admin']['ById']['Get']['Response']['user'];
}

export function EditUserForm({ user }: EditUserFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(adminUserUpdateSchema),
        defaultValues: user,
    });

    const onSubmit = async (data: AdminUserUpdateInput) => {
        setLoading(true);
        setError(null);

        try {
            const result = await updateUser(user._id.toString(), data);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success('Success', {
                description: result.message,
            });

            // Refresh the page data
            router.refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update user';
            setError(message);
            toast.error('Error', {
                description: message,
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedRoles = form.watch('roles') || [];

    const toggleRole = (role: typeof rolesEnum[number]) => {
        const currentRoles = form.getValues('roles') || [];
        if (currentRoles.includes(role)) {
            form.setValue('roles', currentRoles.filter(r => r !== role));
        } else {
            form.setValue('roles', [...currentRoles, role]);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <Alert className="border-red-800 bg-red-900/20">
                        <AlertDescription className="text-red-400">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-tan-100">Basic Information</h3>

                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-tan-300">Username</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="bg-military-800 border-military-600 text-tan-100 focus:border-olive-500"
                                        placeholder="Enter username"
                                    />
                                </FormControl>
                                <FormDescription className="text-tan-500">
                                    Changing username will affect user&#39;s profile URL
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-tan-300">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        className="bg-military-800 border-military-600 text-tan-100 focus:border-olive-500"
                                        placeholder="Enter email"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-tan-300">Display Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="bg-military-800 border-military-600 text-tan-100 focus:border-olive-500"
                                        placeholder="Enter display name"
                                    />
                                </FormControl>
                                <FormDescription className="text-tan-500">
                                    This name will be shown on the user&#39;s profile
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-tan-300">Bio</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        className="bg-military-800 border-military-600 text-tan-100 focus:border-olive-500 min-h-[100px]"
                                        placeholder="Enter user bio"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Rank and Roles */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-tan-100">Rank and Roles</h3>

                    <FormField
                        control={form.control}
                        name="rank"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-tan-300">Rank</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-military-800 border-military-600 text-tan-100">
                                            <SelectValue placeholder="Select a rank" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-military-800 border-military-600">
                                        {rankEnum.map((rank) => (
                                            <SelectItem
                                                key={rank}
                                                value={rank}
                                                className="text-tan-300 hover:bg-military-700"
                                            >
                                                {rank.charAt(0).toUpperCase() + rank.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="roles"
                        render={() => (
                            <FormItem>
                                <FormLabel className="text-tan-300">Roles</FormLabel>
                                <FormDescription className="text-tan-500">
                                    Select which roles this user should have
                                </FormDescription>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {rolesEnum.map((role) => (
                                        <Badge
                                            key={role}
                                            variant={selectedRoles.includes(role) ? 'default' : 'outline'}
                                            className={`cursor-pointer transition-colors ${
                                                selectedRoles.includes(role)
                                                    ? 'bg-olive-600 hover:bg-olive-700 text-tan-100 border-olive-500'
                                                    : 'border-military-600 text-tan-400 hover:bg-military-700'
                                            }`}
                                            onClick={() => toggleRole(role)}
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Ban Status */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-tan-100">Account Status</h3>

                    <FormField
                        control={form.control}
                        name="isBanned"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-military-600 p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-tan-300">Ban User</FormLabel>
                                    <FormDescription className="text-tan-500">
                                        Banned users cannot access the platform
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-red-600"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {form.watch('isBanned') && (
                        <FormField
                            control={form.control}
                            name="banReason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-tan-300">Ban Reason</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            className="bg-military-800 border-military-600 text-tan-100 focus:border-olive-500"
                                            placeholder="Provide a reason for the ban"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-tan-500">
                                        This will be visible to the banned user
                                    </FormDescription>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/users')}
                        className="border-military-600 text-tan-300 hover:bg-military-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-olive-600 hover:bg-olive-700 text-tan-100"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
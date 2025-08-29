// src/components/dashboard/SettingsSection.tsx
'use client';

import {useState} from 'react';
import {signOut, useSession} from 'next-auth/react';
import {IUserApi, UserApi, UserSettings, userUsernameUpdateSchema} from "@/lib/schemas/user";
import {Switch} from "@/components/ui/switch"
import {
    Save,
    Loader2,
    AlertCircle,
    Check,
    Eye,
    User,
    Trash2,
    Globe,
    Headphones, Settings
} from 'lucide-react';
import {SessionRefreshButton} from '@/components/SessionRefreshButton';
import {Button} from '@/components/ui/button';
import {toast} from "sonner";
import {z} from "zod";
import {useSessionRefresh} from "@/hooks/useSessionRefresh";
import {ApiResponse, ErrorResponse} from "@/lib/schemas/core";
import {sanitizeUserInput} from "@/lib/utils";

type UserUpdateType = IUserApi['Patch']['Request'];
type UserUpdateUsernameType = IUserApi['UpdateUsername']['Patch']['Request'];

interface SettingsSectionProps {
    initialSettings: UserUpdateType & UserUpdateUsernameType;
}

const vrHeadsetOptions: { value: UserSettings["vrHeadset"], label: string }[] = [
    {value: undefined, label: 'Not specified'},
    {value: 'quest2', label: 'Meta Quest 2'},
    {value: 'quest3', label: 'Meta Quest 3'},
    {value: 'pico4', label: 'Pico 4'},
    {value: 'index', label: 'Valve Index'},
    {value: 'vive', label: 'HTC Vive'},
    {value: 'bigscreen', label: 'Bigscreen Beyond'},
    {value: 'other', label: 'Other'}
];


export default function SettingsSection({initialSettings}: SettingsSectionProps) {
    const {data: session} = useSession();
    const {refreshSession} = useSessionRefresh();

    const [settings, setSettings] = useState<UserUpdateType>(initialSettings);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showUsernameChange, setShowUsernameChange] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [isChangingUsername, setIsChangingUsername] = useState(false);

    const checkUsernameAvailability = async (username: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`);
            const data: ApiResponse<IUserApi['CheckUsername']['Get']['Response']> = await response.json();

            if (!response.ok) {
                const errorData = data as ErrorResponse;
                setUsernameError(errorData.error.message || 'Failed to check username');
                return false;
            }


            const successData = data as IUserApi['CheckUsername']['Get']['Response'];
            if (!successData.available) {
                setUsernameError(successData.message);
                return false;
            }

            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            setUsernameError('Failed to check username availability');
            return false;
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setSaveStatus('saving');
        setErrors({});

        try {
            const validatedSettings = UserApi.Patch.Request.parse(settings);
            const response = await fetch('/api/user/update', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(validatedSettings),
            });

            const data: ApiResponse<IUserApi['Patch']['Response']> = await response.json();

            if (!response.ok) {
                const errorData = data as ErrorResponse;
                setErrors({general: errorData.error.message});
                setSaveStatus('error');
                return;
            }

            setSaveStatus('saved');

            // Refresh the page to show updated data
            await refreshSession()

            setTimeout(() => setSaveStatus('idle'), 5000);
            toast.success('Settings saved successfully');
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors({general: z.prettifyError(error)});
            } else {
                setErrors({general: 'Failed to save settings'});
            }
            setSaveStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== session?.user?.username) {
            setErrors({delete: 'Please type your username correctly'});
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/user', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            toast.success('Account deleted successfully');
            // Small delay to show the message
            setTimeout(() => {
                signOut({
                    callbackUrl: '/goodbye',
                    redirect: true
                });
            }, 1000);
        } catch (error) {
            console.error('Failed to delete account:', error);
            setErrors({delete: 'Failed to delete account. Please try again.'});
        } finally {
            setLoading(false);
        }
    };

    const handleUsernameChange = async () => {
        setUsernameError('');

        try {
            const validatedUsername = userUsernameUpdateSchema.shape.username.parse(sanitizeUserInput(newUsername));
            setIsChangingUsername(true);
            if (validatedUsername !== initialSettings.username) {
                const isUsernameAvailable = await checkUsernameAvailability(validatedUsername);
                if (!isUsernameAvailable) {
                    return;
                }
            }
            const response = await fetch('/api/user/update-username', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: validatedUsername}),
            });

            const data = await response.json();

            if (!response.ok) {
                setUsernameError(data.error || 'Failed to update username');
                return;
            }

            // Success - refresh session
            toast.success('Username updated successfully');
            await refreshSession();
            setShowUsernameChange(false);
            setNewUsername('');
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.warn('Input validation error:', error);
                setUsernameError(z.prettifyError(error));
            } else {
                console.warn('Username update error:', error);
                setUsernameError('Failed to update username');
            }
        } finally {
            setIsChangingUsername(false);
        }
    };

    return (
        <div className="bg-military-850 border border-military-700 rounded-sm p-6 mt-6">
            <h3 className="text-xl font-bold text-tan-100 mb-6">Account Settings</h3>

            {/* Profile Settings */}
            <div className="mb-8">
                <h4 className="text-lg font-medium text-tan-200 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5"/>
                    Profile Information
                </h4>

                <div className="space-y-4">
                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium text-tan-300 mb-1">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={settings.displayName}
                            onChange={(e) => setSettings({...settings, displayName: e.target.value})}
                            className="w-full px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-tan-100
                       focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
                            placeholder="Enter Display Name"
                        />
                        {errors.displayName && (
                            <p className="mt-1 text-sm text-red-400">{errors.displayName}</p>
                        )}
                        <p className="mt-1 text-xs text-tan-500">
                            3-20 characters, letters, numbers, underscores, and hyphens only
                        </p>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-tan-300 mb-1">
                            Bio
                        </label>
                        <textarea
                            value={settings.bio || ''}
                            onChange={(e) => setSettings({...settings, bio: e.target.value})}
                            maxLength={500}
                            rows={3}
                            className="w-full px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-tan-100
                       focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500 resize-none"
                            placeholder="Tell us about yourself..."
                        />
                        <p className="mt-1 text-xs text-tan-500">
                            {settings.bio?.length || 0}/500 characters
                        </p>
                    </div>

                    {/* Location and VR Headset */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-tan-300 mb-1">
                                <Globe className="inline h-4 w-4 mr-1"/>
                                Region
                            </label>
                            <select
                                value={settings.location || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    location: e.target.value as UserSettings["location"]
                                })}
                                className="w-full px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-tan-100
                         focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
                            >
                                <option value="">Not specified</option>
                                <option value="eu">EU - Europe</option>
                                <option value="us_west">US West</option>
                                <option value="us_east">US East</option>
                                <option value="apj">APJ - Asia Pacific</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-tan-300 mb-1">
                                <Headphones className="inline h-4 w-4 mr-1"/>
                                VR Headset
                            </label>
                            <select
                                value={settings.vrHeadset || undefined}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    vrHeadset: e.target.value as UserSettings["vrHeadset"]
                                })}
                                className="w-full px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-tan-100
                         focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
                            >
                                {vrHeadsetOptions.map(option => (
                                    <option key={option.value || "undefined"} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="mb-8">
                <h4 className="text-lg font-medium text-tan-200 mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5"/>
                    Privacy Settings
                </h4>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-military-800 rounded-sm">
                        <div>
                            <p className="font-medium text-tan-200">Public Profile</p>
                            <p className="text-sm text-tan-500">Allow others to view your profile and stats</p>
                        </div>
                        <Switch checked={settings.preferences?.publicProfile}
                                onCheckedChange={(checked) => setSettings({
                                    ...settings,
                                    preferences: {
                                        emailNotifications: !!settings.preferences?.emailNotifications,
                                        showContributions: !!settings.preferences?.showContributions,
                                        publicProfile: checked
                                    }
                                })}/>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-military-800 rounded-sm">
                        <div>
                            <p className="font-medium text-tan-200">Show Contributions</p>
                            <p className="text-sm text-tan-500">Display accepted contributions on your public
                                profile</p>
                        </div>
                        <Switch checked={!!settings.preferences?.showContributions}
                                onCheckedChange={(checked) => setSettings({
                                    ...settings,
                                    preferences: {
                                        emailNotifications: !!settings.preferences?.emailNotifications,
                                        showContributions: checked,
                                        publicProfile: !!settings.preferences?.publicProfile
                                    }

                                })}
                                disabled={!settings.preferences?.publicProfile}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-military-800 rounded-sm">
                        <div>
                            <p className="font-medium text-tan-200">Email Notifications</p>
                            <p className="text-sm text-tan-500">Receive updates about your contributions</p>
                        </div>
                        <Switch checked={!!settings.preferences?.emailNotifications}
                                onCheckedChange={(checked) => setSettings({
                                    ...settings,
                                    preferences: {
                                        emailNotifications: checked,
                                        showContributions: !!settings.preferences?.showContributions,
                                        publicProfile: !!settings.preferences?.publicProfile
                                    }

                                })}
                                disabled
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pb-6 border-b border-military-700">
                <button
                    onClick={handleSave}
                    disabled={loading || saveStatus === 'saving'}
                    className="px-6 py-2 bg-olive-600 hover:bg-olive-500 disabled:bg-military-700
                   text-white rounded-sm transition-colors flex items-center gap-2"
                >
                    {saveStatus === 'saving' ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4"/>
                            Save Changes
                        </>
                    )}
                </button>

                {saveStatus === 'saved' && (
                    <span className="text-green-400 flex items-center gap-1">
            <Check className="h-4 w-4"/>
            Settings saved successfully
          </span>
                )}

                {saveStatus === 'error' && (
                    <span className="text-red-400 flex items-center gap-1">
            <AlertCircle className="h-4 w-4"/>
                        {errors.general || 'Failed to save settings'}
          </span>
                )}
            </div>

            {/* Account Management */}
            <div className="pt-6">
                <h4 className="text-lg font-medium text-orange-400 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5"/>
                    Account Management
                </h4>

                <div className="space-y-3">
                    {/* Session Refresh */}
                    <div className="flex items-center justify-between p-4 bg-military-800 rounded-sm">
                        <div>
                            <p className="font-medium text-tan-200">Session Refresh</p>
                            <p className="text-sm text-tan-500">Sync your account with latest server data</p>
                        </div>
                        <SessionRefreshButton variant="outline" size="sm"/>
                    </div>

                    {/* Username Change */}
                    <div className="p-4 bg-military-800 rounded-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="font-medium text-tan-200">Change Username</p>
                                <p className="text-sm text-tan-500">
                                    Current: <span
                                    className="font-mono text-olive-400">@{session?.user?.username}</span>
                                </p>
                            </div>
                            {!showUsernameChange && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowUsernameChange(true)}
                                >
                                    Change
                                </Button>
                            )}
                        </div>

                        {showUsernameChange && (
                            <div className="mt-4 p-4 bg-military-900 rounded-sm border border-orange-800/50">
                                <p className="text-sm text-orange-400 mb-3">
                                    ⚠️ Username changes are limited. Choose carefully as this affects your profile URL
                                    and mentions.
                                </p>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                                    className="w-full px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-tan-100
                                 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mb-3"
                                    placeholder="new-username"
                                />
                                {usernameError && (
                                    <p className="text-sm text-red-400 mb-3">{usernameError}</p>
                                )}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleUsernameChange}
                                        disabled={isChangingUsername}
                                        variant="default"
                                        size="sm"
                                    >
                                        {isChangingUsername ? 'Updating...' : 'Update Username'}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowUsernameChange(false);
                                            setNewUsername('');
                                            setUsernameError('');
                                        }}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6">
                <h4 className="text-lg font-medium text-red-400 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5"/>
                    Danger Zone
                </h4>

                {!showDeleteConfirm ? (
                    <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="destructive"
                        className="bg-red-900/20 hover:bg-red-900/30 text-red-400 border-red-800"
                    >
                        <Trash2 className="h-4 w-4 mr-2"/>
                        Delete Account
                    </Button>
                ) : (
                    <div className="p-4 bg-red-900/20 border border-red-800 rounded-sm">
                        <p className="text-red-400 mb-3">
                            This action cannot be undone. Please type <strong>{session?.user?.username}</strong> to
                            confirm.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full px-3 py-2 bg-military-800 border border-red-800 rounded-sm text-tan-100
                         focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 mb-3"
                            placeholder="Type your username"
                        />
                        {errors.delete && (
                            <p className="text-sm text-red-400 mb-3">{errors.delete}</p>
                        )}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                variant="destructive"
                            >
                                {loading ? 'Deleting...' : 'Delete My Account'}
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmText('');
                                    setErrors({});
                                }}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
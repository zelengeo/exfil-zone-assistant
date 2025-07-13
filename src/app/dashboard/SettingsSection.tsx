// src/components/dashboard/SettingsSection.tsx
'use client';

import {useState} from 'react';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';
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
    Headphones
} from 'lucide-react';

interface UserSettings {
    username: string;
    bio?: string;
    location: string;
    vrHeadset?: string | null;
    preferences: {
        emailNotifications: boolean;
        publicProfile: boolean;
        showContributions: boolean;
    };
}

interface SettingsSectionProps {
    initialSettings: UserSettings;
}

export default function SettingsSection({initialSettings}: SettingsSectionProps) {
    const {data: session, update} = useSession();
    const router = useRouter();

    const [settings, setSettings] = useState(initialSettings);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const vrHeadsetOptions = [
        {value: '', label: 'Not specified'},
        {value: 'quest2', label: 'Meta Quest 2'},
        {value: 'quest3', label: 'Meta Quest 3'},
        {value: 'pico4', label: 'Pico 4'},
        {value: 'index', label: 'Valve Index'},
        {value: 'vive', label: 'HTC Vive'},
        {value: 'bigscreen', label: 'Bigscreen Beyond'},
        {value: 'other', label: 'Other'}
    ];

    const handleSave = async () => {
        setLoading(true);
        setSaveStatus('saving');
        setErrors({});

        try {
            const response = await fetch('/api/user/update', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(settings),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle field-specific errors
                if (data.field) {
                    setErrors({[data.field]: data.error});
                } else {
                    setErrors({general: data.error || 'Failed to save settings'});
                }
                throw new Error(data.error || 'Failed to save settings');
            }

            setSaveStatus('saved');

            // Update session if username changed
            if (settings.username !== initialSettings.username) {
                await update({username: settings.username});
            }

            // Refresh the page to show updated data
            router.refresh();

            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
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
            const response = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            // Sign out and redirect
            window.location.href = '/api/auth/signout';
        } catch (error) {
            console.error('Failed to delete account:', error);
            setErrors({delete: 'Failed to delete account. Please try again.'});
        } finally {
            setLoading(false);
        }
    };

    const ToggleSwitch = ({
                              checked,
                              onChange,
                              disabled = false
                          }: {
        checked: boolean;
        onChange: (checked: boolean) => void;
        disabled?: boolean;
    }) => (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            disabled={disabled}
            className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-olive-600' : 'bg-military-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
      <span
          className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
        </button>
    );

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
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-tan-300 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={settings.username}
                            onChange={(e) => setSettings({...settings, username: e.target.value})}
                            className="w-full px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-tan-100
                       focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
                            placeholder="Enter username"
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-400">{errors.username}</p>
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
                                onChange={(e) => setSettings({...settings, location: e.target.value})}
                                className="w-full px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-tan-100
                         focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
                            >
                                <option value="">Not specified</option>
                                <option value="na">NA - North America</option>
                                <option value="eu">EU - Europe</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-tan-300 mb-1">
                                <Headphones className="inline h-4 w-4 mr-1"/>
                                VR Headset
                            </label>
                            <select
                                value={settings.vrHeadset || ''}
                                onChange={(e) => setSettings({...settings, vrHeadset: e.target.value})}
                                className="w-full px-3 py-2 bg-military-800 border border-military-600 rounded-sm text-tan-100
                         focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
                            >
                                {vrHeadsetOptions.map(option => (
                                    <option key={option.value} value={option.value}>
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
                        <Switch checked={settings.preferences.publicProfile} onCheckedChange={(checked) => setSettings({
                            ...settings,
                            preferences: {...settings.preferences, publicProfile: checked}
                        })}/>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-military-800 rounded-sm">
                        <div>
                            <p className="font-medium text-tan-200">Show Contributions</p>
                            <p className="text-sm text-tan-500">Display accepted contributions on your public
                                profile</p>
                        </div>
                        <Switch checked={settings.preferences.showContributions}
                                onCheckedChange={(checked) => setSettings({
                                    ...settings,
                                    preferences: {...settings.preferences, showContributions: checked}

                                })}
                                disabled={!settings.preferences.publicProfile}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-military-800 rounded-sm">
                        <div>
                            <p className="font-medium text-tan-200">Email Notifications</p>
                            <p className="text-sm text-tan-500">Receive updates about your contributions</p>
                        </div>
                        <Switch checked={settings.preferences.emailNotifications}
                                onCheckedChange={(checked) => setSettings({
                                    ...settings,
                                    preferences: {...settings.preferences, emailNotifications: checked}

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

            {/* Danger Zone */}
            <div className="pt-6">
                <h4 className="text-lg font-medium text-red-400 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5"/>
                    Danger Zone
                </h4>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400
                     border border-red-800 rounded-sm transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4"/>
                        Delete Account
                    </button>
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
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:bg-military-700
                         text-white rounded-sm transition-colors"
                            >
                                {loading ? 'Deleting...' : 'Delete My Account'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmText('');
                                    setErrors({});
                                }}
                                className="px-4 py-2 bg-military-700 hover:bg-military-600 text-tan-200 rounded-sm transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
import { redirect } from 'next/navigation';

export default function SettingsPage() {
    // Redirect to account settings by default
    redirect('/settings/account');
}
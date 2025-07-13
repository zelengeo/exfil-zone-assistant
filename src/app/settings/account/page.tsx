'use client'

import { useSession } from 'next-auth/react';
import {redirect} from 'next/navigation';
import {UsernameUpdateForm} from "@/components/settings/UsernameUpdateForm";
import UserDeleteForm from "@/components/settings/UserDeleteForm";

export default function AccountSettingsPage() {
    const { data: session } = useSession();

    if (!session) {
        redirect('/auth/signin');
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <UsernameUpdateForm />
            <UserDeleteForm />
        </div>
    );
}
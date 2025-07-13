'use client'

import {useSession} from 'next-auth/react';
import {redirect} from 'next/navigation';
import {UsernameUpdateForm} from "@/components/settings/UsernameUpdateForm";
import UserDeleteForm from "@/components/settings/UserDeleteForm";
import Layout from "@/components/layout/Layout";
import {Separator} from "@/components/ui/separator";
import React from "react";

export default function AccountSettingsPage() {
    const {data: session} = useSession();

    if (!session) {
        redirect('/auth/signin');
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto p-6">
                <UsernameUpdateForm/>
                <Separator className="bg-military-700" />
                <UserDeleteForm/>
            </div>
        </Layout>
    );
}
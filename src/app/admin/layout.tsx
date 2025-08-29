import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { AdminSidebar } from './components/AdminSidebar';
import {requireAdmin} from "@/lib/auth/utils";
import {AuthenticationError, AuthorizationError} from "@/lib/errors";

interface AdminLayoutProps {
    children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    try {
        await requireAdmin()
    } catch (error){
        if (error instanceof AuthenticationError) {
            redirect('/auth/signin?callbackUrl=/admin');
        } else if (error instanceof AuthorizationError) {
            redirect('/unauthorized');
        } else {
            throw error;
        }
    }


    return (
        <Layout>
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-6">
                    <AdminSidebar />
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </Layout>
    );
}
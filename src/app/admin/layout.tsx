import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import Layout from '@/components/layout/Layout';
import { AdminSidebar } from './components/AdminSidebar';

interface AdminLayoutProps {
    children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const session = await getServerSession(authOptions);
    //FIXME remove log
    console.log(`GetServerSession at ADMIN LAYOUT`, session);

    if (!session?.user?.id) {
        redirect('/auth/signin?callbackUrl=/admin');
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user?.roles?.includes('admin')) {
        redirect('/');
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
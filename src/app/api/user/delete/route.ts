import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Feedback } from '@/models/Feedback';
import { Account } from '@/models/Account';
import {requireAuth} from "@/app/admin/components/utils";


export async function DELETE() {
    try {
        const session = await requireAuth()
        await connectDB();


        // Delete user's feedback (or anonymize it)
        await Feedback.updateMany(
            { userId: session.user.id },
            {
                $set: {
                    userId: null,
                }
            }
        );

        // Delete user sessions
        // await Session.deleteMany({ userId: session.user.id });

        // Delete user accounts (OAuth connections)
        await Account.deleteMany({ userId: session.user.id });

        // Delete user account
        await User.findByIdAndDelete(session.user.id);

        // Log deletion for compliance
        console.log(`User ${session.user.id} account deleted at ${new Date().toISOString()}`);

        return new Response('Account deleted successfully', { status: 200 });

    } catch (error) {
        console.error('Account deletion error:', error);
        return new Response('Failed to delete account', { status: 500 });
    }
}
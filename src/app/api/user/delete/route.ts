import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Feedback } from '@/models/Feedback';

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        await connectDB();

        // Delete user's feedback (or anonymize it)
        await Feedback.updateMany(
            { userId: session.user.id },
            {
                $set: {
                    userId: null,
                    isAnonymous: true,
                    'submittedBy.email': 'deleted',
                    'submittedBy.discordUsername': 'deleted'
                }
            }
        );

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
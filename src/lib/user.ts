import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function getUserByUsername(username: string) {
    try {
        await connectDB();

        const user = await User.findOne({
            username: username.toLowerCase(),
            isActive: true,
            isBanned: false,
        }).select('-email'); // Don't expose email on public profiles

        if (!user) return null;

        // Convert to plain object
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}
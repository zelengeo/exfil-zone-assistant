import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import {IUserApi} from "@/lib/schemas/user";

type UserType = IUserApi['ByUsername']['Get']['Response']['user'];
export async function getUserByUsername(username: string): Promise<UserType | null> {
    try {
        await connectDB();

        const user = await User.findOne({
            username: username.toLowerCase(),
            isActive: true,
            isBanned: false,
        }).select('-email -lastLoginAt -isActive -isBanned -banReason -preferences.emailNotifications').lean<UserType>();

        if (!user) return null;

        // Convert to plain object
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}
import { User } from '@/models/User';
import { User as NextAuthUser } from 'next-auth';

export function generateUsername(
    user: NextAuthUser,
): string {
    // Try different strategies to generate username
    let baseUsername = '';

    // Strategy 1: Use Discord username if available
    // if (account?.provider === 'discord' && profile?.username) {
    //     baseUsername = profile.username;
    // }
    // Strategy 2: Use email prefix
    if (user.email) {
        baseUsername = user.email.split('@')[0];
    }
    // Strategy 3: Use name
    else if (user.name) {
        baseUsername = user.name.toLowerCase().replace(/\s+/g, '-');
    }
    // Strategy 4: Generate random
    else {
        baseUsername = `operator-${Math.random().toString(36).substring(2, 8)}`;
    }

    // Clean username: lowercase, alphanumeric and hyphens only
    return baseUsername
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 20); // Max 20 chars
}

export async function ensureUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername;
    let counter = 0;

    while (true) {
        const exists = await User.findOne({ username });
        if (!exists) {
            return username;
        }

        counter++;
        username = `${baseUsername}-${counter}`;

        // Safety check to prevent infinite loop
        if (counter > 100) {
            // Fallback to random suffix
            username = `${baseUsername}-${Math.random().toString(36).substring(2, 6)}`;
            return username;
        }
    }
}